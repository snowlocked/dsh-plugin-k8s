/**
 * dsh-plugin-k8s 插件入口（服务端）。
 *
 * DSH 基于 Cordis：插件导出 { name, inject, apply }。apply 里向 DSH 的
 * webServer 注册 /api/dsh-plugin-k8s/* 路由（kubeconfig 管理 + kubectl 执行 SSE +
 * AI 对话 SSE）。客户端模块（浏览器 UI）是独立 bundle，见 src/client/index.tsx。
 */

import { resolve, join } from 'node:path'
import { createKubeStore, defaultDataDir, isValidKubeId } from './store.ts'
import type { KubeStore } from './store.ts'
import { createHistoryStore } from './history.ts'
import type { HistoryStore } from './history.ts'
import { buildApiRoutes } from './http.ts'
import type { HttpRequest, HttpResponse, HttpRoute } from './http.ts'
import { kubeconfigCatalogLines, registerK8sTools } from './tools.ts'

export { assertReadOnlyCommand } from './tools.ts'
export { parsePipeline, applyOutputFilters, describeFilters, FILTERS_HELP_TEXT } from './pipeline.ts'
export { createHistoryStore } from './history.ts'
export type { HistoryStore, ChatSession, ChatSessionSummary, HistoryMessage } from './history.ts'

export const name = 'dsh-plugin-k8s'
/** 服务端需要等待注入的服务（webServer 最先，其余按需取） */
export const inject: string[] = ['webServer']

export interface PluginConfig {
  /** 数据目录（默认 <DSH_HOME>/dsh-k8s） */
  dataDir?: string
  /** kubectl 可执行文件路径/命令（默认取 KUBECTL_BIN 或 PATH 中的 kubectl） */
  kubectlBin?: string
  /** 单条命令默认超时 ms（1s~15min，默认 120s） */
  runTimeoutMs?: number
  /** 命令输出总字节上限（256KB~32MB，默认 4MB） */
  outputBytes?: number
}

/** cordis ctx 的最小结构（服务端仅用到这些成员）。 */
interface CtxLike {
  inject(names: string[], callback: (sctx: SubCtxLike) => void): void
  get<T = unknown>(name: string): T | undefined
  logger?: {
    info(message: string, ...args: unknown[]): void
    warn(message: string, ...args: unknown[]): void
    error(message: string, ...args: unknown[]): void
  }
}

interface SubCtxLike {
  effect(callback: () => void | (() => void), label?: string): void
  webServer?: { register(route: HttpRoute): () => void }
  tools?: { register(tool: unknown): () => void }
  systemPrompt?: { section(options: unknown): () => void }
}

function clamp(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(parsed)))
}

export function apply(ctx: CtxLike, config: PluginConfig = {}): void {
  const log = (level: 'info' | 'warn' | 'error', message: string): void => {
    try {
      ctx.logger?.[level](`[dsh-plugin-k8s] ${message}`)
    } catch {
      /* logger 不可用时静默 */
    }
  }

  const dataDir = resolve(config.dataDir && config.dataDir.length > 0 ? config.dataDir : defaultDataDir())
  const store: KubeStore = createKubeStore(dataDir, (message) => log('info', message))
  const history: HistoryStore = createHistoryStore(join(dataDir, 'history'), (message) => log('info', message))

  const locator = { configured: config.kubectlBin?.trim() || undefined }
  const runtime = {
    runTimeoutMs: clamp(config.runTimeoutMs, 120_000, 1_000, 15 * 60 * 1000),
    outputBytes: clamp(config.outputBytes, 4 * 1024 * 1024, 256 * 1024, 32 * 1024 * 1024),
  }

  ctx.inject(['webServer'], (sctx) => {
    sctx.effect(() => {
      const routes: HttpRoute[] = buildApiRoutes({
        store,
        history,
        locator,
        runtime,
        log,
        getLlm: () => ctx.get('llm') ?? undefined,
      })
      const webServer = sctx.webServer as { register(route: HttpRoute): () => void } | undefined
      if (!webServer) {
        log('error', 'webServer 服务不可用，插件 HTTP API 未注册')
        return
      }
      const disposers = routes.map((route) => webServer.register(route))
      return () => {
        for (const dispose of disposers) dispose()
      }
    }, 'dsh-plugin-k8s: http api')
  })

  // 对话 AI 可直接调用的 K8s 只读工具（k8s_kubeconfigs / k8s_query）
  ctx.inject(['tools'], (sctx) => {
    sctx.effect(() => {
      let dispose: (() => void) | undefined
      registerK8sTools(sctx as unknown as { tools: { register(tool: unknown): () => void } }, {
        store,
        locator,
        log,
      }).then((result) => {
        dispose = result
        log('info', 'K8s 对话工具注册完成（k8s_kubeconfigs / k8s_query）')
      }).catch((reason) => {
        log('warn', `K8s 对话工具注册失败：${reason instanceof Error ? reason.message : String(reason)}`)
      })
      return () => dispose?.()
    }, 'dsh-plugin-k8s: k8s tools')
  })

  // 系统提示：告诉对话中的 AI 如何使用这些工具（含当前已保存 kubeconfig 的目录快照）
  ctx.inject(['systemPrompt'], (sctx) => {
    sctx.effect(() => {
      const section = (sctx.systemPrompt as { section(options: unknown): () => void }).section({
        name: 'dsh-plugin-k8s:tools',
        order: 510,
        text: [
          '## Kubernetes 工具（dsh-plugin-k8s）',
          '',
          '你可以在对话里直接查“K8s 控制台”插件已保存的集群配置（只读）：',
          '- kubeconfig 参数：kubeconfig 的 **id 或名称**都行（见下方目录）。拿不准先调 k8s_kubeconfigs。',
          '- 先 k8s_kubeconfigs 确认目标集群，再 k8s_query 执行只读命令；',
          '  namespace/context 用 k8s_query 的参数传，不要写进 command。',
          '- k8s_query 只支持只读动词：get / describe / logs / top / explain / version / api-resources /',
          '  api-versions / auth can-i / cluster-info；写类动词（apply/delete/edit/scale/exec…）会被拒绝，',
          '  如需写操作，提醒用户打开左侧“K8s”工作台在命令控制台手动执行。',
          '- k8s_query 的 command 支持管道做进程内过滤（非 shell）：| grep [-i -v -n -c -w -E -F] [-e] <pattern>、',
          '  | head -n N、| tail -n N、| sort [-r] [-u]、| wc -l；资源多、输出大时优先用管道筛选关键行。',
          '示例：“查一下 dev 集群的 pod”→ k8s_kubeconfigs 找 dev → k8s_query(kubeconfig=…, command="get pods -A")；',
          '“看 xx 命名空间的 deployment 状态”→ k8s_query(…, namespace=xx, command="get deployments")；',
          '“dji 命名空间里带 core 的资源”→ k8s_query(…, namespace=dji, command="get pods,deployments | grep core")。',
          '输出较大时会被截断并提示；全部查询只读，不会改动集群。',
          '',
          '当前已保存的 kubeconfig（插件启动时快照，如有出入以 k8s_kubeconfigs 返回为准）：',
          ...kubeconfigCatalogLines(store),
        ].join('\n'),
      })
      return section
    }, 'dsh-plugin-k8s: prompt section')
  })

  log('info', `插件已加载：数据目录=${dataDir}，命令超时=${runtime.runTimeoutMs}ms，输出上限=${Math.round(runtime.outputBytes / 1024)}KB`)
}

/** 供外部校验 id。 */
export function isKubeIdValid(id: string): boolean {
  return isValidKubeId(id)
}

export type { HttpRequest, HttpResponse }
