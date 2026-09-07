/**
 * kubectl 定位 / 命令行切分 / 进程执行 / kubeconfig 权威解析（config view）。
 * 全部走 child_process（spawn/spawnSync），不依赖 shell。
 */

import { spawn, spawnSync } from 'node:child_process'
import type { KubeClusterInfo, KubeContextInfo, KubeMeta, KubectlProbe } from './types.ts'
import { K8sConsoleError, asError } from './errors.ts'
import { parseKubeconfigMeta } from './meta.ts'

/* ---------------------------------------------------------------- 定位 kubectl */

export interface KubectlLocator {
  /** 配置显式指定的路径/命令 */
  configured?: string
}

export function kubectlCommand(locator: KubectlLocator): string {
  if (locator.configured && locator.configured.trim() !== '') return locator.configured.trim()
  const fromEnv = process.env.KUBECTL_BIN?.trim()
  if (fromEnv) return fromEnv
  return 'kubectl'
}

let probeCache: { key: string; probe: KubectlProbe } | null = null

/** 探测 kubectl 是否可用（带缓存；探测失败只影响状态展示，不阻塞其它功能）。 */
export function probeKubectl(locator: KubectlLocator = {}): KubectlProbe {
  const key = kubectlCommand(locator)
  if (probeCache?.key === key) return probeCache.probe
  const probe: KubectlProbe = { present: false }
  try {
    const result = spawnSync(key, ['version', '--client', '-o', 'json'], {
      encoding: 'utf8',
      timeout: 10_000,
      windowsHide: true,
    })
    if (result.error) {
      const error = result.error
      const code = (error as NodeJS.ErrnoException).code
      probe.missingReason = code === 'ENOENT'
        ? `未找到可执行的「${key}」。请安装 kubectl 并加入 PATH，或安装后在插件配置中设置 kubectlBin 路径。`
        : `启动 kubectl 失败：${error.message}`
    } else if (result.status === 0) {
      probe.present = true
      probe.path = key
      try {
        const payload = JSON.parse(result.stdout || '{}') as { clientVersion?: { gitVersion?: string } }
        probe.version = payload.clientVersion?.gitVersion
      } catch {
        probe.version = (result.stdout ?? '').split('\n')[0]?.trim() || undefined
      }
    } else {
      probe.missingReason = `kubectl version --client 退出码 ${result.status}：${(result.stderr ?? result.stdout ?? '').slice(0, 200)}`
    }
  } catch (reason) {
    probe.missingReason = `探测 kubectl 异常：${reason instanceof Error ? reason.message : String(reason)}`
  }
  probeCache = { key, probe }
  return probe
}

export function invalidateKubectlProbe(): void {
  probeCache = null
}

/* ---------------------------------------------------------------- 命令行切分 */

/**
 * 把控制台输入的命令行文本切分成 argv（POSIX 风格：支持单/双引号、引号内空格、
 * 引号外的 \ 转义）。返回空数组表示没有内容。
 */
export function splitCommand(text: string): string[] {
  const tokens: string[] = []
  let token = ''
  let quote: "'" | '"' | null = null
  let started = false
  let i = 0
  const input = text ?? ''
  while (i < input.length) {
    const char = input[i]!
    if (quote !== null) {
      if (char === quote) {
        quote = null
        started = true
      } else if (char === '\\' && quote === '"') {
        const next = input[i + 1]
        if (next === '"' || next === '\\' || next === '$' || next === '`') {
          token += next
          i += 1
        } else {
          token += char
        }
      } else {
        token += char
      }
      i += 1
      continue
    }
    if (char === "'" || char === '"') {
      quote = char
      started = true
      i += 1
      continue
    }
    if (char === '\\') {
      const next = input[i + 1]
      if (next !== undefined) {
        token += next
        started = true
        i += 2
        continue
      }
      token += char
      started = true
      i += 1
      continue
    }
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      if (token.length > 0 || started) {
        tokens.push(token)
        token = ''
        started = false
      }
      i += 1
      continue
    }
    token += char
    started = true
    i += 1
  }
  if (token.length > 0 || started) tokens.push(token)
  return tokens
}

/** 去掉命令里的冗余：空 token、前导 kubectl。 */
export function normalizeKubectlArgs(tokens: string[]): string[] {
  const trimmed = tokens.map((item) => item.trim()).filter((item) => item.length > 0)
  if (trimmed.length > 0 && trimmed[0]!.toLowerCase() === 'kubectl') trimmed.shift()
  return trimmed
}

/* ---------------------------------------------------------------- 执行 */

export interface ExecOptions {
  bin: string
  kubeFile: string
  argv: string[]
  cwd: string
  /** 追加的环境变量（KUBECONFIG 由本模块统一注入并覆盖） */
  env?: Record<string, string>
  /** 超时毫秒，0 = 不设超时 */
  timeoutMs?: number
  /** stdout+stderr 合计字节上限，超出即杀进程 */
  maxBytes?: number
  signal?: AbortSignal
}

export interface ExecResult {
  code: number | null
  signal: NodeJS.Signals | null
  durationMs: number
  truncated: boolean
  reason?: 'timeout' | 'bytes' | 'aborted'
}

/**
 * 启动一次 kubectl 执行并把输出以 (channel, text) 回调推给调用方。
 * - 进程退出/被杀后 resolve ExecResult；
 * - spawn 失败抛 K8sConsoleError；
 * - signal 触发 abort → 杀进程（reason: aborted）；
 * - 超时 / 超出输出字节上限 → 杀进程并记 truncated/reason。
 */
export async function execKubectl(
  options: ExecOptions,
  onData: (channel: 'stdout' | 'stderr', text: string) => void,
): Promise<ExecResult> {
  const { bin, kubeFile, argv, cwd } = options
  const started = Date.now()
  const env: NodeJS.ProcessEnv = { ...process.env, ...(options.env ?? {}), KUBECONFIG: kubeFile }

  const child = spawn(bin, argv, {
    cwd,
    env,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  })

  const maxBytes = options.maxBytes ?? 4 * 1024 * 1024
  const timeoutMs = options.timeoutMs ?? 0
  let bytes = 0
  let truncated = false
  let killReason: ExecResult['reason']

  const killChild = (): void => {
    if (child.exitCode !== null || child.signalCode !== null) return
    try {
      child.kill('SIGTERM')
    } catch {
      /* 进程已退出时忽略 */
    }
  }

  const timer = timeoutMs > 0
    ? setTimeout(() => {
        killReason = 'timeout'
        killChild()
      }, timeoutMs)
    : null

  const pipe = (channel: 'stdout' | 'stderr', chunk: Buffer): void => {
    bytes += chunk.length
    if (bytes > maxBytes) {
      if (!truncated) {
        truncated = true
        killReason = 'bytes'
        killChild()
      }
      return
    }
    onData(channel, chunk.toString('utf8'))
  }

  const abortHandler = (): void => {
    killReason = 'aborted'
    killChild()
  }
  if (options.signal) {
    if (options.signal.aborted) abortHandler()
    else options.signal.addEventListener('abort', abortHandler, { once: true })
  }

  return await new Promise<ExecResult>((resolve, reject) => {
    child.stdout?.on('data', (chunk: Buffer) => pipe('stdout', chunk))
    child.stderr?.on('data', (chunk: Buffer) => pipe('stderr', chunk))
    child.on('error', (error) => {
      if (timer) clearTimeout(timer)
      options.signal?.removeEventListener('abort', abortHandler)
      const code = (error as NodeJS.ErrnoException).code
      reject(new K8sConsoleError(
        code === 'ENOENT'
          ? `无法启动 kubectl「${bin}」：命令不存在。请安装 kubectl（或设置环境变量 KUBECTL_BIN / 插件配置 kubectlBin）`
          : `无法启动 kubectl：${error.message}`,
        code === 'ENOENT' ? 'KUBECTL_MISSING' : 'SPAWN_FAILED',
        502,
      ))
    })
    child.on('close', (code, signal) => {
      if (timer) clearTimeout(timer)
      options.signal?.removeEventListener('abort', abortHandler)
      const durationMs = Date.now() - started
      resolve({
        code,
        signal: signal ?? null,
        durationMs,
        truncated,
        ...(killReason ? { reason: killReason } : {}),
      })
    })
  })
}

/* ---------------------------------------------------------------- 快捷命令（同步捕获 / 异步捕获） */

export interface Captured {
  ok: boolean
  code: number | null
  stdout: string
  stderr: string
  durationMs: number
}

/** 同步执行并捕获输出（仅用于本地、无网络的小命令，如 config view / version）。 */
export function runKubectlSync(bin: string, kubeFile: string | null, argv: string[], timeoutMs = 15_000): Captured {
  const started = Date.now()
  const env: NodeJS.ProcessEnv = { ...process.env }
  if (kubeFile) env.KUBECONFIG = kubeFile
  try {
    const result = spawnSync(bin, argv, { encoding: 'utf8', timeout: timeoutMs, env, windowsHide: true })
    return {
      ok: result.status === 0,
      code: result.status,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      durationMs: Date.now() - started,
    }
  } catch (reason) {
    return {
      ok: false,
      code: null,
      stdout: '',
      stderr: asError(reason).message,
      durationMs: Date.now() - started,
    }
  }
}

/** 异步执行并捕获输出（网络型短命令，如 get --raw=/version；带超时）。 */
export function runKubectlAsync(
  bin: string,
  kubeFile: string,
  argv: string[],
  cwd: string,
  timeoutMs = 15_000,
  signal?: AbortSignal,
): Promise<Captured> {
  const env: NodeJS.ProcessEnv = { ...process.env, KUBECONFIG: kubeFile }
  return new Promise((resolve) => {
    const started = Date.now()
    const child = spawn(bin, argv, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], shell: false })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      try { child.kill('SIGTERM') } catch { /* ignore */ }
    }, timeoutMs)
    const finish = (): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ ok: child.exitCode === 0, code: child.exitCode, stdout, stderr, durationMs: Date.now() - started })
    }
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout = (stdout + chunk.toString('utf8')).slice(0, 512 * 1024)
    })
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr = (stderr + chunk.toString('utf8')).slice(0, 128 * 1024)
    })
    child.on('error', () => finish())
    child.on('close', finish)
    if (signal) {
      if (signal.aborted) { try { child.kill('SIGTERM') } catch { /* ignore */ } }
      else signal.addEventListener('abort', () => { try { child.kill('SIGTERM') } catch { /* ignore */ } }, { once: true })
    }
  })
}

/* ---------------------------------------------------------------- kubeconfig 权威解析 */

/**
 * 用 kubectl config view 解析 kubeconfig（纯本地，不触网）。失败时抛错；
 * 由调用方决定是否回退到内置解析。返回带 method 标记的 meta。
 */
export function kubectlViewMeta(bin: string, kubeFile: string): { meta: KubeMeta; method: 'kubectl' } {
  const captured = runKubectlSync(bin, kubeFile, ['config', 'view', '--kubeconfig', kubeFile, '-o', 'json'])
  if (!captured.ok) {
    const detail = (captured.stderr || captured.stdout).trim() || `退出码 ${captured.code ?? '?'}`
    throw new K8sConsoleError(`kubectl config view 解析失败：${detail.slice(0, 300)}`, 'BAD_KUBECONFIG', 400)
  }
  let payload: {
    clusters?: Array<{ name?: string; cluster?: { server?: string } }>
    contexts?: Array<{ name?: string; context?: { cluster?: string; user?: string; namespace?: string } }>
    'current-context'?: string
  }
  try {
    payload = JSON.parse(captured.stdout) as typeof payload
  } catch {
    throw new K8sConsoleError('kubectl config view 输出不是合法 JSON', 'BAD_KUBECONFIG', 400)
  }
  const clusters: KubeClusterInfo[] = (payload.clusters ?? [])
    .filter((item) => typeof item.name === 'string')
    .map((item) => ({ name: item.name!, ...(item.cluster?.server ? { server: item.cluster.server } : {}) }))
  const contexts: KubeContextInfo[] = (payload.contexts ?? [])
    .filter((item) => typeof item.name === 'string')
    .map((item) => ({
      name: item.name!,
      ...(item.context?.cluster ? { cluster: item.context.cluster } : {}),
      ...(item.context?.user ? { user: item.context.user } : {}),
      ...(item.context?.namespace ? { namespace: item.context.namespace } : {}),
    }))
  return {
    meta: {
      contexts,
      clusters,
      ...(typeof payload['current-context'] === 'string' ? { currentContext: payload['current-context'] } : {}),
    },
    method: 'kubectl',
  }
}

/** 内置解析兜底（返回与 kubectlViewMeta 同形状）。 */
export function fallbackViewMeta(kubeFile: string, content: string): { meta: KubeMeta; method: 'fallback' } {
  return { meta: parseKubeconfigMeta(content), method: 'fallback' }
}
