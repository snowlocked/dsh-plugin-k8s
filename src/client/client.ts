/**
 * 浏览器端 API 封装（对齐服务端 src/http.ts 返回结构）。
 * 常规接口：POST + JSON（DSH webServer 只注册 POST）。
 * 流式接口（/run、/ai/chat）：POST + JSON → 读取 text/event-stream，逐事件回调。
 */

export interface PublicKubeConfig {
  id: string
  name: string
  fileName: string
  createdAt?: string
  updatedAt?: string
  lastCheckedAt?: string
  lastCheckError?: string
  contextNames: string[]
  currentContext?: string
  server?: string
  size: number
  parse: 'kubectl' | 'fallback'
}

export interface KubectlProbe {
  present: boolean
  path?: string
  version?: string
  missingReason?: string
}

export interface StateInfo {
  ok: boolean
  name: string
  version: string
  dataDir: string
  kubeconfigCount: number
  kubectl: KubectlProbe
  kubectlCommand: string
}

export interface AiProviderEntry {
  provider: string
  label?: string
  models: Array<{ id: string; label?: string }>
}

export interface AiModelsPayload {
  ok: boolean
  providers: AiProviderEntry[]
  message?: string
}

export interface CheckResult {
  ok: boolean
  latencyMs?: number
  serverVersion?: string
  message: string
}

export interface KubeSaveInput {
  id?: string
  name: string
  content?: string
  filePath?: string
}

/** 历史消息（服务端 src/history.ts 同构）。 */
export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
  at: string
  provider?: string
  model?: string
  error?: boolean
}

export interface ChatSessionSummary {
  id: string
  kubeId: string
  kubeName: string
  context?: string
  startedAt: string
  updatedAt: string
  messageCount: number
  preview: string
  snippet?: string
}

export interface ChatSession extends Omit<ChatSessionSummary, 'messageCount' | 'preview' | 'snippet'> {
  messages: HistoryMessage[]
}

export interface HistoryAppendInput {
  sessionId?: string
  kubeId: string
  kubeName: string
  context?: string
  message: HistoryMessage
}

/** SSE 流式事件（/run 与 /ai/chat 通用，type 区分）。 */
export type StreamEvent = Record<string, unknown> & { type: string }

export const PREFIX = '/api/dsh-plugin-k8s'

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function errText(reason: unknown): Promise<string> {
  if (reason instanceof ApiError) return reason.message
  if (reason instanceof Error) return reason.message
  return typeof reason === 'string' ? reason : JSON.stringify(reason)
}

function jsonBody(data: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data ?? {}),
  }
}

async function post<T>(path: string, data?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${PREFIX}${path}`, jsonBody(data))
  } catch (reason) {
    throw new ApiError(`网络请求失败：${reason instanceof Error ? reason.message : String(reason)}`, 0)
  }
  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  if (!response.ok) {
    const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    throw new ApiError(String(record.error ?? `HTTP ${response.status}`), response.status, String(record.code ?? ''))
  }
  return payload as T
}

/**
 * POST JSON body 后流式读取 SSE 响应。每个 `data: {...}` 帧都会交给 onEvent。
 * 服务端正常收尾 / 网络错误 / abort 都会让本 promise 结束（错误抛 ApiError；
 * AbortError 原样抛出，由调用方区分“用户中止”）。
 */
export async function streamPost(
  path: string,
  data: unknown,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${PREFIX}${path}`, { ...jsonBody(data), ...(signal ? { signal } : {}) })
  } catch (reason) {
    if (signal?.aborted) throw reason
    throw new ApiError(`网络请求失败：${reason instanceof Error ? reason.message : String(reason)}`, 0)
  }
  if (!response.ok || !response.body) {
    let message = `HTTP ${response.status}`
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload?.error) message = payload.error
    } catch {
      /* 无 JSON 体 */
    }
    throw new ApiError(message, response.status)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  for (;;) {
    let chunk: ReadableStreamReadResult<Uint8Array>
    try {
      chunk = await reader.read()
    } catch (reason) {
      if (signal?.aborted) throw reason
      throw new ApiError(`读取流失败：${reason instanceof Error ? reason.message : String(reason)}`, 0)
    }
    if (chunk.done) break
    buffer += decoder.decode(chunk.value, { stream: true })
    let boundary: number
    while ((boundary = buffer.indexOf('\n\n')) >= 0) {
      const frame = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      if (frame.startsWith('data: ')) {
        const raw = frame.slice('data: '.length).trim()
        if (!raw) continue
        try {
          onEvent(JSON.parse(raw) as StreamEvent)
        } catch {
          /* 忽略无法解析的帧 */
        }
      }
    }
  }
  if (buffer.startsWith('data: ')) {
    const raw = buffer.slice('data: '.length).trim()
    if (raw) {
      try {
        onEvent(JSON.parse(raw) as StreamEvent)
      } catch {
        /* 忽略 */
      }
    }
  }
}

export const k8sApi = {
  state: (refresh?: boolean) => post<StateInfo>('/state', refresh ? { refresh: true } : {}),
  kubeconfigs: () => post<{ kubeconfigs: PublicKubeConfig[] }>('/kubeconfigs/list'),
  save: (input: KubeSaveInput) => post<{ ok: boolean; kubeconfig: PublicKubeConfig; parse?: string }>('/kubeconfigs/save', input),
  remove: (id: string) => post<{ ok: boolean }>('/kubeconfig/remove', { id }),
  raw: (id: string) => post<{ ok: boolean; content: string }>('/kubeconfig/raw', { id }),
  check: (id: string) => post<CheckResult>('/kubeconfigs/check', { id }),
  aiModels: () => post<AiModelsPayload>('/ai/models'),
  run: (options: { id: string; command: string; context?: string; namespace?: string; timeoutMs?: number }, onEvent: (e: StreamEvent) => void, signal?: AbortSignal) =>
    streamPost('/run', options, onEvent, signal),
  chat: (options: { id?: string; provider?: string; model?: string; history: Array<{ role: 'user' | 'assistant'; content: string }> }, onEvent: (e: StreamEvent) => void, signal?: AbortSignal) =>
    streamPost('/ai/chat', options, onEvent, signal),
  historyAppend: (input: HistoryAppendInput) =>
    post<{ ok: boolean; sessionId: string; updatedAt: string; messageCount: number }>('/history/append', input),
  historyList: (options?: { keyword?: string; kubeId?: string; limit?: number }) =>
    post<{ ok: boolean; sessions: ChatSessionSummary[] }>('/history/list', options ?? {}),
  historyGet: (sessionId: string) =>
    post<{ ok: boolean; session: ChatSession }>('/history/get', { sessionId }),
  historyDelete: (sessionId: string) =>
    post<{ ok: boolean; deleted: boolean }>('/history/delete', { sessionId }),
  historyClear: () =>
    post<{ ok: boolean; removed: number }>('/history/clear', { confirm: true }),
}

/** 把服务端嵌套的 providers/models 拍平成选择项；无模型的 provider 得到“默认模型”项。 */
export interface AiModelOption {
  /** 合并键；provider+model 都匹配时同一项 */
  key: string
  provider: string
  model?: string
  label?: string
}

export function flattenAiModels(payload: AiModelsPayload): AiModelOption[] {
  const options: AiModelOption[] = []
  for (const provider of payload.providers) {
    if (provider.models.length === 0) {
      options.push({
        key: `p:${provider.provider}`,
        provider: provider.provider,
        label: provider.label ?? provider.provider,
      })
    } else {
      for (const model of provider.models) {
        options.push({
          key: `m:${provider.provider}/${model.id}`,
          provider: provider.provider,
          model: model.id,
          label: model.label ?? `${provider.provider} · ${model.id}`,
        })
      }
    }
  }
  return options
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function formatTime(iso?: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-CN', { hour12: false })
}
