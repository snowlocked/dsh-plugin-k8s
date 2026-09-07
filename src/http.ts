/**
 * dsh-k8s-console HTTP API（前缀 /api/dsh-plugin-k8s，全部 POST + JSON body；
 * DSH 真实 webServer 只注册 POST，见 dsh-plugin-database 同款约定）。
 *
 * 常规接口返回 JSON；`/run` 与 `/ai/chat` 返回 SSE（text/event-stream）——
 * 浏览器端用 fetch 流式读取，逐段渲染 kubectl 输出 / AI 逐字回复。
 */

import type { KubeStore } from './store.ts'
import { join } from 'node:path'
import { isValidKubeId } from './store.ts'
import { K8sConsoleError } from './errors.ts'
import {
  execKubectl,
  fallbackViewMeta,
  kubectlCommand,
  kubectlViewMeta,
  normalizeKubectlArgs,
  probeKubectl,
  runKubectlAsync,
  splitCommand,
  invalidateKubectlProbe,
} from './kubectl.ts'
import type { KubectlLocator } from './kubectl.ts'
import { listAiModels, streamChat, buildK8sSystemPrompt } from './ai.ts'
import type { LlmLike } from './ai.ts'
import { parseKubeconfigMeta, normalizeMeta } from './meta.ts'

/** webServer.register handler 收到的 request（Node IncomingMessage 子集）。 */
export interface HttpRequest {
  method?: string
  url?: string
  on?(event: 'close', listener: () => void): unknown
  off?(event: string, listener: () => void): unknown
  [Symbol.asyncIterator](): AsyncIterator<Buffer>
}

/** webServer.register handler 收到的 response（Node ServerResponse 子集）。 */
export interface HttpResponse {
  statusCode: number
  setHeader(name: string, value: string): void
  writeHead?(status: number, headers?: Record<string, string>): unknown
  write?(chunk: string): unknown
  flushHeaders?(): void
  end(body?: string): void
  readonly writableEnded?: boolean
  on?(event: string, listener: () => void): unknown
}

export interface HttpRoute {
  kind: 'exact' | 'prefix'
  path: string
  method?: string
  handler: (request: HttpRequest, response: HttpResponse) => void | Promise<void>
}

export interface ApiRuntimeConfig {
  /** 会话级默认 kubectl 执行超时（ms） */
  runTimeoutMs: number
  /** stdout+stderr 总字节上限 */
  outputBytes: number
}

export interface ApiDeps {
  store: KubeStore
  locator: KubectlLocator
  runtime: ApiRuntimeConfig
  log(level: 'info' | 'warn' | 'error', message: string): void
  getLlm(): unknown
}

const PREFIX = '/api/dsh-plugin-k8s'
const MAX_BODY_BYTES = 6 * 1024 * 1024

/* ---------------------------------------------------------------- 基础工具 */

function sendJson(response: HttpResponse, status: number, body: unknown): void {
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('cache-control', 'no-store')
  response.end(JSON.stringify(body))
}

async function readJsonBody(request: HttpRequest): Promise<Record<string, unknown> | undefined> {
  const chunks: Buffer[] = []
  let size = 0
  try {
    for await (const chunk of request) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size > MAX_BODY_BYTES) return undefined
      chunks.push(buffer)
    }
  } catch {
    return undefined
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>
  } catch {
    /* fallthrough */
  }
  return undefined
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

function requireId(body: Record<string, unknown>): string {
  const id = pickString(body, ['id']) ?? ''
  if (!isValidKubeId(id)) throw new K8sConsoleError('缺少或非法的 kubeconfig id', 'BAD_ID', 400)
  return id
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(parsed)))
}

/* ---------------------------------------------------------------- SSE 输出 */

const SSE_HEADERS: Record<string, string> = {
  'content-type': 'text/event-stream; charset=utf-8',
  'cache-control': 'no-store',
  'x-accel-buffering': 'no',
}

/** 惰性启动 SSE（首次写事件时才发头）。 */
function sseWriter(response: HttpResponse) {
  let started = false
  const ensure = (): void => {
    if (started) return
    started = true
    if (typeof response.writeHead === 'function') {
      response.writeHead(200, SSE_HEADERS)
    } else {
      response.statusCode = 200
      for (const [name, value] of Object.entries(SSE_HEADERS)) response.setHeader(name, value)
    }
    if (typeof response.flushHeaders === 'function') response.flushHeaders()
  }
  return {
    started: (): boolean => started,
    push(payload: unknown): void {
      ensure()
      if (typeof response.write === 'function') {
        response.write(`data: ${JSON.stringify(payload)}\n\n`)
      } else {
        // 极老/受限实现兜底：只能整包 end
        response.setHeader('content-type', 'application/json; charset=utf-8')
        response.end(JSON.stringify(payload))
      }
    },
    end(): void {
      ensure()
      response.end()
    },
  }
}

/** 中止控制器：请求连接断开时置为 aborted（SSE 流里用于杀 kubectl / 中断 AI）。 */
function requestAbort(request: HttpRequest): { signal: AbortSignal; dispose(): void } {
  const controller = new AbortController()
  const onClose = (): void => {
    try {
      controller.abort()
    } catch {
      /* 已中止 */
    }
  }
  if (typeof request.on === 'function') request.on('close', onClose)
  return {
    signal: controller.signal,
    dispose: () => {
      if (typeof request.on === 'function') request.off?.('close', onClose)
    },
  }
}

/** 返回 SSE 错误事件并收尾。 */
function finishSseError(writer: ReturnType<typeof sseWriter>, message: string, code = 'ERR_K8S'): void {
  writer.push({ type: 'error', message, code })
  writer.end()
}

/* ---------------------------------------------------------------- 路由 */

export function buildApiRoutes(deps: ApiDeps): HttpRoute[] {
  const routes: HttpRoute[] = []

  const add = (method: string, path: string, handler: HttpRoute['handler']): void => {
    routes.push({
      kind: 'exact',
      path,
      method,
      handler: async (request, response) => {
        if (request.method && request.method.toUpperCase() !== method) {
          sendJson(response, 405, { error: 'Method not allowed' })
          return
        }
        try {
          await handler(request, response)
        } catch (reason) {
          const error = reason instanceof K8sConsoleError
            ? reason
            : new K8sConsoleError(reason instanceof Error ? reason.message : String(reason), 'ERR_INTERNAL', 500)
          if (error.status >= 500) deps.log('error', `[api] ${method} ${path} 失败：${error.message}`)
          sendJson(response, error.status, { error: error.message, code: error.code })
        }
      },
    })
  }

  const binOf = (): string => {
    const probe = probeKubectl(deps.locator)
    if (!probe.present) {
      throw new K8sConsoleError(probe.missingReason ?? 'kubectl 不可用', 'KUBECTL_MISSING', 502)
    }
    return kubectlCommand(deps.locator)
  }

  /* ---------------- 状态 ---------------- */

  add('POST', `${PREFIX}/state`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    if (body.refresh === true) invalidateKubectlProbe()
    const probe = probeKubectl(deps.locator)
    const entries = deps.store.list()
    sendJson(response, 200, {
      ok: true,
      name: 'dsh-plugin-k8s',
      version: '0.2.0',
      dataDir: deps.store.dataDir,
      kubeconfigCount: entries.length,
      kubectl: probe,
      kubectlCommand: kubectlCommand(deps.locator),
    })
  })

  /* ---------------- kubeconfig 管理 ---------------- */

  add('POST', `${PREFIX}/kubeconfigs/list`, async (_request, response) => {
    sendJson(response, 200, { kubeconfigs: deps.store.list() })
  })

  add('POST', `${PREFIX}/kubeconfigs/save`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const name = pickString(body, ['name']) ?? ''
    const content = pickString(body, ['content'])
    const filePath = pickString(body, ['filePath'])
    const saved = deps.store.save({
      id: pickString(body, ['id']),
      name,
      content,
      filePath,
    })

    // 权威校验：本机有 kubectl 时用 config view 检查是否为有效 kubeconfig（不触网）。
    const probe = probeKubectl(deps.locator)
    const { record, content: raw } = deps.store.requireContent(saved.id)
    const kubeFile = join(deps.store.kubeDir, record.fileName)
    let metaSource: ReturnType<typeof kubectlViewMeta> | ReturnType<typeof fallbackViewMeta>
    if (probe.present) {
      try {
        metaSource = kubectlViewMeta(kubectlCommand(deps.locator), kubeFile)
      } catch (reason) {
        deps.store.remove(saved.id)
        throw reason
      }
    } else {
      metaSource = fallbackViewMeta('', raw)
    }
    if (!normalizeMeta(metaSource.meta)) {
      deps.store.remove(saved.id)
      throw new K8sConsoleError('kubeconfig 里没有任何 context（contexts 列表为空），看起来不是可用的 kubeconfig', 'NO_CONTEXT', 400)
    }
    deps.log('info', `kubeconfig 保存并通过解析（${metaSource.method}）：${saved.name}`)
    const latest = deps.store.list().find((item) => item.id === saved.id) ?? saved
    sendJson(response, 200, { ok: true, kubeconfig: latest, parse: metaSource.method })
  })

  add('POST', `${PREFIX}/kubeconfig/remove`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const removed = deps.store.remove(requireId(body))
    sendJson(response, 200, { ok: removed })
  })

  add('POST', `${PREFIX}/kubeconfig/raw`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const { content } = deps.store.requireContent(requireId(body))
    sendJson(response, 200, { ok: true, content })
  })

  /** 连通性检查：kubectl get --raw=/version（触网，带 8s request-timeout）。 */
  add('POST', `${PREFIX}/kubeconfigs/check`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = requireId(body)
    const { record } = deps.store.requireContent(id)
    const bin = binOf()
    const kubeFile = join(deps.store.kubeDir, record.fileName)
    const abort = requestAbort(request)
    try {
      const captured = await runKubectlAsync(
        bin,
        kubeFile,
        ['--request-timeout', '8s', 'get', '--raw=/version'],
        deps.store.kubeDir,
        15_000,
        abort.signal,
      )
      if (captured.ok) {
        const versionMatch = /"gitVersion"\s*:\s*"([^"]+)"/u.exec(captured.stdout)
        const serverVersion = versionMatch?.[1]
        deps.store.noteCheckResult(id, true)
        sendJson(response, 200, {
          ok: true,
          latencyMs: captured.durationMs,
          serverVersion,
          message: serverVersion ? `集群可达（server ${serverVersion}）` : '集群可达',
        })
      } else {
        const detail = (captured.stderr || captured.stdout).trim()
        deps.store.noteCheckResult(id, false, detail.slice(0, 500))
        sendJson(response, 200, {
          ok: false,
          latencyMs: captured.durationMs,
          message: detail.slice(0, 500) || `kubectl 退出码 ${captured.code ?? '?'}`,
        })
      }
    } finally {
      abort.dispose()
    }
  })

  /* ---------------- kubectl 命令执行（SSE 流） ---------------- */

  add('POST', `${PREFIX}/run`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = requireId(body)
    const { record } = deps.store.requireContent(id)
    const writer = sseWriter(response)
    const abort = requestAbort(request)
    const kubeDir = deps.store.kubeDir
    const kubeFile = join(kubeDir, record.fileName)

    const command = pickString(body, ['command']) ?? ''
    const contextChoice = pickString(body, ['context']) ?? ''
    const namespace = pickString(body, ['namespace']) ?? ''
    const timeoutMs = clampNumber(body.timeoutMs, deps.runtime.runTimeoutMs, 1_000, 15 * 60 * 1000)

    let tokens: string[]
    try {
      tokens = normalizeKubectlArgs(splitCommand(command))
    } catch {
      tokens = []
    }
    if (tokens.length === 0) {
      finishSseError(writer, '请输入要执行的命令（例如：get pods -A）', 'EMPTY_COMMAND')
      abort.dispose()
      return
    }
    const totalChars = tokens.reduce((sum, token) => sum + token.length, 0)
    if (tokens.length > 200 || totalChars > 32 * 1024 || tokens.some((token) => token.length > 4096)) {
      finishSseError(writer, '命令过长或参数过多', 'COMMAND_TOO_LONG')
      abort.dispose()
      return
    }
    // 会话级 context/namespace 前置（显式 --context/-n 会覆盖前置参数，kubectl 后者生效）
    const argv: string[] = []
    if (contextChoice.trim() !== '') argv.push('--context', contextChoice.trim())
    if (namespace.trim() !== '') argv.push('-n', namespace.trim())
    argv.push(...tokens)

    writer.push({
      type: 'start',
      command: `kubectl ${argv.join(' ')}`,
      argv,
      kubeconfig: record.name,
      timeoutMs,
    })

    let exitSent = false
    try {
      const bin = binOf()
      const result = await execKubectl(
        {
          bin,
          kubeFile,
          argv,
          cwd: kubeDir,
          timeoutMs,
          maxBytes: deps.runtime.outputBytes,
          signal: abort.signal,
        },
        (channel, text) => writer.push({ type: 'out', channel, text }),
      )
      exitSent = true
      writer.push({
        type: 'exit',
        code: result.code,
        signal: result.signal,
        reason: result.reason,
        truncated: result.truncated,
        durationMs: result.durationMs,
      })
      writer.end()
    } catch (reason) {
      const error = reason instanceof K8sConsoleError
        ? reason
        : new K8sConsoleError(reason instanceof Error ? reason.message : String(reason), 'ERR_INTERNAL', 500)
      writer.push({ type: 'error', message: error.message, code: error.code })
      writer.end()
    } finally {
      if (!exitSent) writer.end()
      abort.dispose()
    }
  })

  /* ---------------- AI 模型 / 对话 ---------------- */

  add('POST', `${PREFIX}/ai/models`, async (_request, response) => {
    const llm = deps.getLlm() as LlmLike | undefined
    const result = await listAiModels(llm)
    sendJson(response, 200, result)
  })

  add('POST', `${PREFIX}/ai/chat`, async (request, response) => {
    const body = toRecord(await readJsonBody(request))
    const id = pickString(body, ['id']) ?? ''
    const writer = sseWriter(response)
    const abort = requestAbort(request)

    // 集群上下文摘要（供 system prompt 使用；缺 id 也允许 —— 与具体集群无关的问答）
    let contextSummary: string | undefined
    if (id && isValidKubeId(id)) {
      const entry = deps.store.get(id)
      if (entry) {
        const { content: raw } = deps.store.requireContent(id)
        const meta = parseKubeconfigMeta(raw)
        const normalized = normalizeMeta(meta)
        const current = normalized?.currentContext
        const currentCtx = normalized?.contexts.find((item) => item.name === current)
        const server = currentCtx?.cluster
          ? normalized?.clusters.find((item) => item.name === currentCtx.cluster)?.server
          : undefined
        contextSummary = [
          `kubeconfig 名称：${entry.name}`,
          server ? `API server：${server}` : '',
          current ? `当前 context：${current}` : `可用 context：${normalized?.contexts.map((item) => item.name).join('、') ?? ''}`,
        ].filter(Boolean).join('\n')
      }
    }

    const historyRaw = Array.isArray(body.history) ? body.history : []
    const turns = historyRaw
      .map((item): { role: 'user' | 'assistant'; content: string } | null => {
        const entry = toRecord(item)
        const role = pickString(entry, ['role'])
        const content = pickString(entry, ['content']) ?? ''
        if ((role === 'user' || role === 'assistant') && content.trim() !== '') {
          return { role, content: content.slice(0, 24_000) }
        }
        return null
      })
      .filter((entry): entry is { role: 'user' | 'assistant'; content: string } => entry !== null)
      .slice(-40)
    if (turns.length === 0 || turns[turns.length - 1]!.role !== 'user') {
      finishSseError(writer, '缺少要提问的内容', 'AI_INPUT')
      abort.dispose()
      return
    }

    const llm = deps.getLlm() as LlmLike | null
    try {
      const result = await streamChat({
        llm,
        preferred: {
          provider: pickString(body, ['provider']) ?? undefined,
          model: pickString(body, ['model']) ?? undefined,
        },
        system: buildK8sSystemPrompt(contextSummary),
        turns,
        signal: abort.signal,
        onDelta: (text) => writer.push({ type: 'delta', text }),
      })
      if (result.finishReason === 'aborted') {
        // 用户主动中断：不追加 done
        writer.push({ type: 'aborted' })
      } else {
        writer.push({ type: 'done', provider: result.provider, model: result.model })
      }
      writer.end()
    } catch (reason) {
      const error = reason instanceof K8sConsoleError
        ? reason
        : new K8sConsoleError(reason instanceof Error ? reason.message : String(reason), 'AI_INTERNAL', 500)
      if (error.status >= 500) deps.log('error', `[ai/chat] 失败：${error.message}`)
      writer.push({ type: 'error', message: error.message, code: error.code })
      writer.end()
    } finally {
      abort.dispose()
    }
  })

  return routes
}
