/**
 * dsh-plugin-k8s 插件入口（服务端）。
 *
 * DSH 基于 Cordis：插件导出 { name, inject, apply }。apply 里向 DSH 的
 * webServer 注册 /api/dsh-plugin-k8s/* 路由（kubeconfig 管理 + kubectl 执行 SSE +
 * AI 对话 SSE）。客户端模块（浏览器 UI）是独立 bundle，见 src/client/index.tsx。
 */

import { resolve } from 'node:path'
import { createKubeStore, defaultDataDir, isValidKubeId } from './store.ts'
import type { KubeStore } from './store.ts'
import { buildApiRoutes } from './http.ts'
import type { HttpRequest, HttpResponse, HttpRoute } from './http.ts'

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

  const locator = { configured: config.kubectlBin?.trim() || undefined }
  const runtime = {
    runTimeoutMs: clamp(config.runTimeoutMs, 120_000, 1_000, 15 * 60 * 1000),
    outputBytes: clamp(config.outputBytes, 4 * 1024 * 1024, 256 * 1024, 32 * 1024 * 1024),
  }

  ctx.inject(['webServer'], (sctx) => {
    sctx.effect(() => {
      const routes: HttpRoute[] = buildApiRoutes({
        store,
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

  log('info', `插件已加载：数据目录=${dataDir}，命令超时=${runtime.runTimeoutMs}ms，输出上限=${Math.round(runtime.outputBytes / 1024)}KB`)
}

/** 供外部校验 id。 */
export function isKubeIdValid(id: string): boolean {
  return isValidKubeId(id)
}

export type { HttpRequest, HttpResponse }
