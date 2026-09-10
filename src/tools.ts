/**
 * 对话工具：让普通会话中的主 AI 直接“查 k8s 配置 / 跑只读 kubectl”。
 *
 * 与 database 插件的 db_* 工具同构：
 * - k8s_kubeconfigs：列出 K8s 控制台插件已保存的 kubeconfig（id、名称、contexts、current-context、server）
 * - k8s_query：在某个 kubeconfig（可带 context/namespace）上执行**只读** kubectl，返回文本
 *
 * 只读强制：命令动词必须在 READONLY_KUBECTL_VERBS 白名单内，写类命令一律拒绝，
 * 需要写操作时请用户去 K8s 控制台手动执行。依赖 @deepseek-ai/dsh-tools（宿主提供），
 * 不可用时优雅降级（工具不注册，其余功能不受影响）。
 */
import { join } from 'node:path'
import { K8sConsoleError, asError } from './errors.ts'
import { execKubectl, kubectlCommand } from './kubectl.ts'
import type { KubectlLocator } from './kubectl.ts'
import { applyOutputFilters, describeFilters, parsePipeline } from './pipeline.ts'
import { parseKubeconfigMeta } from './meta.ts'
import type { KubeConfigRecord } from './types.ts'
import type { KubeStore } from './store.ts'

export interface K8sToolsDeps {
  store: KubeStore
  locator: KubectlLocator
  log(level: 'info' | 'warn' | 'error', message: string): void
}

/** 允许在对话工具里执行的只读 kubectl 动词（不含写操作；config 之类易写文件的也排除）。 */
export const READONLY_KUBECTL_VERBS: ReadonlySet<string> = new Set([
  'api-resources',
  'api-versions',
  'auth', // 仅放行 can-i（见 assertReadOnlyCommand）
  'cluster-info',
  'describe',
  'explain',
  'get',
  'logs',
  'top',
  'version',
])

/** 只读动词给人看的文案（工具 description 与系统提示共用）。 */
export const READONLY_VERBS_TEXT = 'get / describe / logs / top / explain / version / api-resources / api-versions / auth can-i / cluster-info'

/** 校验 argv[0]（已去掉 kubectl 前缀）是否只读；否则抛 K8sConsoleError。 */
export function assertReadOnlyCommand(argv: readonly string[]): void {
  const verb = (argv[0] ?? '').toLowerCase()
  if (!verb || !READONLY_KUBECTL_VERBS.has(verb)) {
    throw new K8sConsoleError(
      `k8s_query 只允许只读命令（${READONLY_VERBS_TEXT}），收到「${verb || '(空)'}」。`
      + '写操作（apply/delete/edit/scale/exec/port-forward…）请在 K8s 控制台手动执行。',
      'WRITE_BLOCKED',
      400,
    )
  }
  if (verb === 'auth' && (argv[1] ?? '').toLowerCase() !== 'can-i') {
    throw new K8sConsoleError('k8s_query 的 auth 只放行只读子命令 can-i（如 auth can-i get pods）', 'WRITE_BLOCKED', 400)
  }
}

/** 一条 kubeconfig 的目录行（不包含凭据）。 */
export function kubeconfigCatalogLine(record: KubeConfigRecord, contextNames: string[], currentContext?: string, server?: string): string {
  const bits: string[] = []
  if (contextNames.length > 0) bits.push(`contexts: ${contextNames.join(' / ')}`)
  if (currentContext) bits.push(`current: ${currentContext}`)
  if (server) bits.push(`server: ${server.replace(/^https?:\/\//u, '')}`)
  return `- ${record.id}: ${record.name}${bits.length > 0 ? `（${bits.join('；')}）` : ''}`
}

/** 全部已保存 kubeconfig 的目录行（供系统提示与“找不到”错误使用；不可读的条目标注跳过）。 */
export function kubeconfigCatalogLines(store: KubeStore): string[] {
  const lines: string[] = []
  for (const record of store.list()) {
    try {
      const { content } = store.requireContent(record.id)
      const meta = parseKubeconfigMeta(content)
      const currentName = meta.currentContext ?? meta.contexts[0]?.name
      const currentContext = meta.contexts.find((context) => context.name === currentName)
      const server = meta.clusters.find((cluster) => cluster.name === currentContext?.cluster)?.server
      lines.push(kubeconfigCatalogLine(record, meta.contexts.map((context) => context.name), currentContext?.name, server))
    } catch {
      lines.push(`- ${record.id}: ${record.name}（文件缺失或不可读，请先在 K8s 控制台里重新保存）`)
    }
  }
  return lines
}

function kubeconfigCatalogText(store: KubeStore): string {
  const lines = kubeconfigCatalogLines(store)
  return lines.length > 0 ? lines.join('\n') : '（当前还没有保存任何 kubeconfig，请让用户先在 K8s 控制台添加）'
}

/**
 * 把 kubeconfig 参数解析成记录：支持精确 id 或名称（名称唯一）。
 * 找不到/为空时给出明确错误与当前目录，避免 AI 瞎猜。
 */
export function resolveKubeRecord(store: KubeStore, hint: unknown): KubeConfigRecord {
  const text = typeof hint === 'string' ? hint.trim() : ''
  if (!text) {
    throw new K8sConsoleError(
      `缺少 kubeconfig 参数（填 id 或名称）。当前已保存：\n${kubeconfigCatalogText(store)}`,
      'BAD_INPUT',
      400,
    )
  }
  for (const record of store.list()) {
    if (record.id === text || record.name === text) return record
  }
  throw new K8sConsoleError(
    `找不到 kubeconfig「${text}」。当前已保存（kubeconfig 可填 id 或名称）：\n${kubeconfigCatalogText(store)}`,
    'NOT_FOUND',
    404,
  )
}

interface ToolsSctx {
  tools: { register(tool: unknown): () => void }
}

/** 注册对话 AI 可直接调用的 K8s 只读工具（require tools 服务）。 */
export async function registerK8sTools(sctx: ToolsSctx, deps: K8sToolsDeps): Promise<() => void> {
  let defineTool: ((options: Record<string, unknown>) => unknown) | null = null
  try {
    const module = await import('@deepseek-ai/dsh-tools') as { defineTool?: (options: Record<string, unknown>) => unknown }
    defineTool = module.defineTool ?? null
  } catch {
    deps.log('warn', 'dsh-tools 不可用，跳过 K8s 对话工具注册（AI 工具功能不可用，其余功能不受影响）')
  }
  if (!defineTool) return () => undefined

  const disposers: Array<() => void> = []

  const finalizeContent = (_exec: unknown, result: { content?: unknown }): unknown[] | undefined => {
    if (typeof result.content === 'string' && result.content.length > 0) {
      return [{ type: 'text', text: result.content }]
    }
    return undefined
  }

  // kubeconfig 目录
  disposers.push(sctx.tools.register(defineTool({
    name: 'k8s_kubeconfigs',
    description:
      '列出 K8s 控制台插件（dsh-plugin-k8s）中已保存的 kubeconfig：id、名称、可用 contexts、current-context、API server 地址。'
      + '用户提到“查一下 xx 集群/环境/命名空间”时，先看本工具把说法映射到 kubeconfig（可填 id 或名称），'
      + '再调 k8s_query。不含任何凭据信息。',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          kubeconfigs: { type: 'string', description: 'kubeconfig 清单文本' },
        },
      },
      render(_args: unknown, value: { kubeconfigs?: string }) {
        return value.kubeconfigs ?? '（空）'
      },
    },
    async execute() {
      return { kubeconfigs: kubeconfigCatalogText(deps.store) }
    },
    finalizeContent,
  })))

  // 只读 kubectl 执行
  disposers.push(sctx.tools.register(defineTool({
    name: 'k8s_query',
    description:
      '在某个已保存的 kubeconfig（可加 context / namespace 参数）上执行**只读** kubectl 命令并返回输出文本。'
      + `command 可省略 kubectl 前缀，仅支持只读动词：${READONLY_VERBS_TEXT}；`
      + '支持在 command 里用管道做进程内过滤（非 shell）：| grep [-i -v -n -c -w -E -F] [-e] <pattern>、| head -n N、| tail -n N、| sort [-r] [-u]、| wc -l，'
      + '例如 "get pods -n dji | grep core"、"get pods -A | grep CrashLoopBackOff | head -n 20"；'
      + '需要筛选输出时优先使用管道过滤，不要让用户手动肉眼查找。'
      + '写类动词（apply/delete/edit/scale/exec/port-forward/create/rollout…）会被拒绝，需写操作时请用户到 K8s 控制台手动执行。'
      + '用法示例：k8s_query(kubeconfig=<id 或名称>, command="get pods -A")；'
      + '看某命名空间：k8s_query(kubeconfig=…, namespace=default, command="get deployments")；'
      + '用户提到“某集群的状态/pod/日志/资源清单”且不确定 kubeconfig 时，先调 k8s_kubeconfigs。'
      + 'namespace/context 请用参数传入，不要写进 command（避免与参数冲突）。返回输出默认截断并提示，只读不产生任何修改。',
    parameters: {
      kubeconfig: { type: 'string', description: 'kubeconfig 的 id 或名称（用 k8s_kubeconfigs 查看）' },
      command: { type: 'string', description: '只读 kubectl 命令，可省略 kubectl 前缀，例如 "get pods -A"、"-n kube-system get configmaps"；支持管道进程内过滤（| grep / head / tail / sort / wc -l），如 "get pods -n dji | grep core"；不支持重定向、&&、|| 或任意 shell 命令' },
      context: { type: 'string', description: '可选：该 kubeconfig 下要用的 context 名称（默认用文件里的 current-context）' },
      namespace: { type: 'string', description: '可选：目标命名空间（等价于命令自带 -n <namespace>；留空则用 context 默认/全部资源所在范围）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean', description: '命令是否成功（退出码 0）' },
          text: { type: 'string', description: '成功时的输出文本' },
          exitCode: { type: 'number', description: 'kubectl 退出码' },
          truncated: { type: 'boolean', description: '输出是否被截断' },
          note: { type: 'string', description: '补充说明（解析命中/超时/截断等）' },
          error: { type: 'string', description: '失败原因（拒绝/超时/找不到配置等）' },
        },
      },
      render(_args: unknown, value: { ok?: boolean; text?: string; note?: string; error?: string }) {
        return value.ok ? (value.text ?? '') : `执行失败：${value.error ?? value.note ?? '未知原因'}`
      },
    },
    async execute(args: { kubeconfig?: string; command?: string; context?: string; namespace?: string }) {
      const record = resolveKubeRecord(deps.store, args.kubeconfig)
      deps.store.requireContent(record.id) // 确认文件仍存在（不存在时抛错由工具层呈现）
      const kubeFile = join(deps.store.kubeDir, record.fileName)
      const noteBits: string[] = []

      const rawCommand = typeof args.command === 'string' ? args.command.trim() : ''
      if (!rawCommand) {
        return { ok: false, error: `command 不能为空。用法示例：k8s_query(kubeconfig="${record.name}", command="get pods -A")` }
      }
      // 管道解析：第一段 kubectl，后续段进程内过滤器（grep/head/tail/sort/wc）
      let pipeline
      try {
        pipeline = parsePipeline(rawCommand)
      } catch (reason) {
        return { ok: false, error: asError(reason).message }
      }
      const tokens = pipeline.kubectl
      if (tokens.length === 0) {
        return { ok: false, error: 'command 无法解析出有效参数' }
      }
      try {
        assertReadOnlyCommand(tokens)
      } catch (reason) {
        return { ok: false, error: asError(reason).message }
      }

      // context/namespace 前置（与 K8s 控制台 /run 一致：显式 flags 在命令里后出现者生效）
      const argv: string[] = []
      const context = typeof args.context === 'string' ? args.context.trim() : ''
      const namespace = typeof args.namespace === 'string' ? args.namespace.trim() : ''
      if (context) argv.push('--context', context)
      if (namespace) argv.push('-n', namespace)
      argv.push(...tokens)

      let stdout = ''
      let stderr = ''
      let result
      try {
        result = await execKubectl(
          {
            bin: kubectlCommand(deps.locator),
            kubeFile,
            argv,
            cwd: deps.store.kubeDir,
            timeoutMs: 20_000,
            maxBytes: 512 * 1024,
          },
          (channel, text) => {
            if (channel === 'stdout') stdout = (stdout + text).slice(0, 600_000)
            else stderr = (stderr + text).slice(0, 64_000)
          },
        )
      } catch (reason) {
        return { ok: false, error: asError(reason).message }
      }

      if (result.reason === 'timeout') return { ok: false, error: `命令超过 20s 未完成，已中止（可能网络不通或命令不合适）` }
      if (result.reason === 'bytes') noteBits.push('输出超过上限已被截断')
      if (result.reason === 'aborted') return { ok: false, error: '命令已被中止' }

      if (result.code !== 0) {
        const detail = (stderr || stdout).trim().slice(0, 6000) || `退出码 ${result.code ?? '?'}`
        return {
          ok: false,
          error: `kubectl 退出码 ${result.code}：${detail}`,
          exitCode: result.code,
          ...(noteBits.length > 0 ? { note: noteBits.join('；') } : {}),
        }
      }

      let body = stdout || stderr
      if (pipeline.filters.length > 0) {
        const original = body
        body = applyOutputFilters(stdout, pipeline.filters)
        if (body.trim() === '' && !stdout.trim() && stderr.trim() !== '') body = stderr
        noteBits.push(`已应用管道过滤（插件进程内执行，非 shell）：${describeFilters(pipeline.filters)}`)
        if (body.trim() === '' && original.trim() !== '') noteBits.push('过滤后无匹配输出')
      }
      const text = body.slice(0, 120_000)
      if (body.length > 120_000) noteBits.push('输出过长，仅展示前 120000 字符')
      if (stderr && stderr.length > 0 && !stdout) noteBits.push('仅有 stderr 输出')
      return {
        ok: true,
        text,
        exitCode: result.code,
        truncated: result.truncated || body.length > 120_000,
        ...(noteBits.length > 0 ? { note: noteBits.join('；') } : {}),
      }
    },
    finalizeContent,
  })))

  return () => {
    for (const dispose of disposers) dispose()
  }
}
