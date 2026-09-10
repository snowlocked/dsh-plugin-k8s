/**
 * AI 对话能力：全部复用 DSH 自身配置的模型（ctx.llm），不在插件里重复填 Key。
 * - listAiModels：枚举 provider/model，供界面“按需选模型”；
 * - streamChat：多轮对话（历史以转录文本形式折进单条 user 消息 —— 与数据库插件
 *   已验证的调用形状完全一致），逐字回调 text delta，供 SSE 转发。
 */

import type { AiProviderEntry } from './types.ts'
import { K8sConsoleError } from './errors.ts'

export interface LlmLike {
  listProviders?: () => unknown[] | Promise<unknown[]>
  listModels?: (provider: string) => unknown[] | Promise<unknown[]>
  stream?: (options: Record<string, unknown>) => AsyncIterable<{ type: string; text?: string; reason?: string; error?: unknown }>
}

export interface AiSettings {
  provider?: string
  model?: string
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

interface StreamChunk {
  type: string
  text?: string
  reason?: string
  error?: unknown
}

const MAX_TRANSCRIPT_TURNS = 24
const MAX_TURN_CHARS = 6000

/* ---------------------------------------------------------------- 枚举模型 */

export interface AiModelsResult {
  ok: boolean
  providers: AiProviderEntry[]
  message?: string
}

export async function listAiModels(llm: LlmLike | null | undefined): Promise<AiModelsResult> {
  const providers: AiProviderEntry[] = []
  if (llm && typeof llm.listProviders === 'function') {
    try {
      const rawProviders = (await llm.listProviders()) ?? []
      for (const entry of rawProviders) {
        const record = entry as Record<string, unknown>
        const provider = String(record.id ?? record.name ?? record.provider ?? '')
        if (!provider) continue
        const models: Array<{ id: string; label?: string }> = []
        if (typeof llm.listModels === 'function') {
          try {
            for (const model of ((await llm.listModels(provider)) ?? []) as Array<Record<string, unknown>>) {
              const id = String(model.id ?? model.name ?? '')
              if (id) models.push({ id, ...(typeof model.label === 'string' ? { label: model.label } : {}) })
            }
          } catch {
            /* 单个 provider 暂不可枚举也允许 */
          }
        }
        providers.push({
          provider,
          ...(typeof record.label === 'string' ? { label: record.label } : {}),
          models,
        })
      }
    } catch {
      /* 枚举失败时返回空列表，界面提示去 DSH 设置模型 */
    }
  }
  return {
    ok: providers.length > 0,
    providers,
    ...(providers.length === 0 ? { message: '当前 DSH 没有可用的模型 provider，请先在 DSH 的 AI/模型设置中完成配置（本插件直接复用 DSH 模型）' } : {}),
  }
}

/* ---------------------------------------------------------------- 选模型路由 */

/**
 * 解析本次对话用哪个 provider/model：
 * 显式偏好（界面选择）优先；否则按 deepseek → 含 chat 字样 → 第一个 的启发式。
 * 返回 null 表示当前 DSH 没有可用模型。
 */
async function pickModel(
  llm: LlmLike,
  preferred: AiSettings,
): Promise<{ provider: string; model?: string } | null> {
  let providers: unknown[] = []
  try {
    providers = llm.listProviders ? await llm.listProviders() : []
  } catch {
    return null
  }
  const providerNames = (providers ?? []).map((entry) => {
    const value = entry as Record<string, unknown>
    return String(value.id ?? value.name ?? value.provider ?? '')
  }).filter(Boolean)

  const wantedProvider = preferred.provider?.trim()
  const provider = wantedProvider && providerNames.includes(wantedProvider)
    ? wantedProvider
    : providerNames.includes('deepseek')
      ? 'deepseek'
      : providerNames[0]
  if (!provider) return null

  let model: string | undefined
  if (llm.listModels) {
    try {
      const models = (await llm.listModels(provider)) as Array<Record<string, unknown>>
      const ids = models.map((entry) => String(entry.id ?? entry.name ?? '')).filter(Boolean)
      const wantedModel = preferred.model?.trim()
      model = wantedModel && ids.includes(wantedModel)
        ? wantedModel
        : ids.find((id) => id === 'deepseek-chat')
          ?? ids.find((id) => id.toLowerCase().includes('chat') && !id.toLowerCase().includes('reason'))
          ?? ids[0]
    } catch {
      model = preferred.model?.trim() || undefined
    }
  } else {
    model = preferred.model?.trim() || undefined
  }
  return { provider, ...(model ? { model } : {}) }
}

/* ---------------------------------------------------------------- 对话（SSE 上游） */

export interface StreamChatOptions {
  llm: LlmLike | null | undefined
  preferred?: AiSettings
  system: string
  turns: ChatTurn[]
  signal?: AbortSignal
  maxTokens?: number
  temperature?: number
  onDelta: (text: string) => void
}

export interface StreamChatResult {
  provider?: string
  model?: string
  finishReason?: string | null
}

/**
 * 多轮对话：把最近的对话历史转录成文本塞进单条 user 消息（保持与数据库插件
 * 相同的 llm.stream 调用形状，避免引入多消息/多角色协议风险），逐字回调 delta。
 */
export async function streamChat(options: StreamChatOptions): Promise<StreamChatResult> {
  const { llm } = options
  if (!llm || typeof llm.stream !== 'function') {
    throw new K8sConsoleError(
      '无法调用 AI：当前 DSH 没有可用的模型服务。请在 DSH 的 AI/模型设置中完成配置后重试。',
      'AI_NO_ROUTE',
      502,
    )
  }
  const route = await pickModel(llm, {
    provider: options.preferred?.provider?.trim() || undefined,
    model: options.preferred?.model?.trim() || undefined,
  })
  if (!route?.provider || !route.model) {
    throw new K8sConsoleError('没有找到可用的模型路由，请检查 DSH 模型配置或改选其它模型', 'AI_NO_ROUTE', 502)
  }

  const recent = options.turns.slice(-MAX_TRANSCRIPT_TURNS).map((turn) => ({
    ...turn,
    content: turn.content.length > MAX_TURN_CHARS ? `${turn.content.slice(0, MAX_TURN_CHARS)}…（过长已截断）` : turn.content,
  }))
  const last = recent[recent.length - 1]
  const transcriptBody = recent.slice(0, -1)
    .map((turn) => `${turn.role === 'user' ? '用户' : '助手'}：\n${turn.content}`)
    .join('\n\n---\n\n')
  const userText = [
    transcriptBody ? `以下是此前对话的记录：\n\n${transcriptBody}\n\n---\n\n请继续完成下面的最新请求。` : '请回答下面的请求。',
    '',
    `${last?.role === 'user' ? '用户' : '助手'}：${last?.content ?? ''}`,
  ].join('\n')

  const started = Date.now()
  let output = ''
  let finishReason: string | null = null
  let stoppedByAbort = false
  const onAbort = (): void => {
    stoppedByAbort = true
  }
  options.signal?.addEventListener('abort', onAbort, { once: true })

  try {
    const stream = llm.stream({
      provider: route.provider,
      model: route.model,
      messages: [{ role: 'user', content: [{ type: 'text', text: userText }] }],
      system: options.system,
      maxTokens: options.maxTokens ?? 1800,
      temperature: options.temperature ?? 0.3,
      ...(options.signal ? { signal: options.signal } : {}),
    })
    for await (const chunk of stream as AsyncIterable<StreamChunk>) {
      if (stoppedByAbort) break
      if (chunk.type === 'text-delta' && typeof chunk.text === 'string') {
        output += chunk.text
        options.onDelta(chunk.text)
      }
      if (chunk.type === 'finish') finishReason = chunk.reason ?? null
    }
  } catch (reason) {
    if (stoppedByAbort || options.signal?.aborted) {
      // 用户主动中断：不是错误
      return { provider: route.provider, model: route.model, finishReason: 'aborted' }
    }
    throw new K8sConsoleError(`调用 DSH 模型失败：${reason instanceof Error ? reason.message : String(reason)}`, 'AI_LLM', 502)
  } finally {
    options.signal?.removeEventListener('abort', onAbort)
  }

  if (stoppedByAbort || options.signal?.aborted) {
    return { provider: route.provider, model: route.model, finishReason: 'aborted' }
  }
  if (Date.now() - started > 180_000) {
    throw new K8sConsoleError('AI 生成超时（>180s）', 'AI_TIMEOUT', 504)
  }
  if (!output.trim() || finishReason === 'error' || finishReason === 'aborted') {
    throw new K8sConsoleError('AI 未生成内容（生成被中断或失败）', 'AI_EMPTY', 502)
  }
  return { provider: route.provider, model: route.model, finishReason }
}

/** K8s 助手系统提示：组装时带上当前集群的上下文摘要。 */
export function buildK8sSystemPrompt(contextSummary?: string): string {
  return [
    '你是嵌入在 DeepSeek Harness「K8s 控制台」插件里的 Kubernetes 运维助手。',
    '你的工作：根据用户的中文/自然语言需求生成可执行的 kubectl 命令，或解释命令、报错与输出结果。',
    '输出约定：',
    '1. 当回答包含可执行命令时，把命令放在单个 ```bash 围栏代码块中（每行一条，命令以 kubectl 开头）。',
    '2. 只读优先：优先 kubectl get/describe/logs/explain/top 等只读命令；需要 delete/apply/scale/exec/port-forward 等有副作用的操作时，先说明影响再给命令。',
    '3. 拿不准资源/命名空间时，先给 kubectl get 类探查命令，不要凭空捏造资源名。',
    '4. 命令执行环境支持进程内管道过滤（非 shell）：| grep [-i -v -n -c -w -E -F] [-e] <pattern>、| head -n N、| tail -n N、| sort [-r] [-u]、| wc -l。资源多、输出大时主动建议加管道筛选（如 get pods -A | grep <关键词>），但不要使用重定向、&&、|| 或其它程序。',
    '5. 不确定的语法标注在代码块外说明，不要编造 kubectl 不存在的 flag。',
    '6. 解释尽量简洁；回答使用中文。',
    contextSummary ? `当前目标集群（来自所选 kubeconfig）：\n${contextSummary}\n\n注意：命令执行时 kubectl 已自动使用该 kubeconfig，除非确有需要否则不必重复 --kubeconfig。` : '',
    '如果用户的问题与 Kubernetes/kubectl 无关，礼貌说明你只擅长 Kubernetes 运维并引导回正题。',
  ].filter(Boolean).join('\n')
}
