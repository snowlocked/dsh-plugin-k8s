/**
 * dsh-plugin-k8s 客户端插件入口（浏览器端）。
 *
 * 通过 window.__ModuleLoader__ 注册为 web 平台客户端模块（banner/footer 见
 * build.mjs）。apply 负责把插件挂进 DSH 渲染树：
 *
 *   1) `sidebar.footer.action`  list slot    —— 左侧栏底部「K8s」入口按钮
 *   2) `conversation.view`      list/session —— 把控制台作为 Conversation 的一个 View
 *
 * React/ReactDOM 留作 external（与数据库插件同一约定）：hooks 走 DSH 主机那份
 * React，避免第二份 React 导致 dispatcher 为 null。
 */
import { K8sSidebarEntry } from './sidebar-entry.tsx'
import { K8sConsoleOverlay } from './overlay.tsx'
import { ensureThemeStyle } from './theme.ts'
import { controller } from './controller.ts'
import { zh, en, NS } from './locales.ts'

export const inject: string[] = ['slots', 'locale']

interface ClientCtx {
  slots?: {
    inject(key: string, cb: () => unknown): () => void
    register(opts: Record<string, unknown>, component: unknown): () => void
  }
  locale?: {
    bind(ns: string): (key: string) => string
    register(ns: string, dicts: { zh: Record<string, string>; en: Record<string, string> }): () => void
  }
  effect?(cb: () => unknown, label?: string): void
}

export function apply(ctx?: ClientCtx): void {
  const slots = ctx?.slots
  const locale = ctx?.locale
  if (!slots || !locale) return

  const t = locale.bind(NS) as (key: keyof typeof zh) => string
  const disposeLocale = locale.register(NS, { zh, en })
  const disposeStyle = ensureThemeStyle()

  // 1) 侧边栏底部入口按钮（排在数据库工作台之后）
  //    ⚠️ 必须把组件函数本身传给 slots.register，不能包 lambda 再调它一次
  //    （详见数据库插件 index.tsx 的注释：包 lambda 会丢 fiber，hooks 读到
  //    null dispatcher 抛 "Cannot read properties of null"）。
  const disposeSidebar = slots.inject('sidebar.footer.action', () => {
    return slots.register(
      {
        name: 'sidebar.footer.action',
        id: 'k8s-console',
        order: -9,
        locale: NS,
        label: () => t('sidebar.label'),
      },
      K8sSidebarEntry as unknown as (props: Record<string, unknown>) => unknown,
    )
  })

  // 2) 控制台主面板 —— 直接注册到 Conversation 的 View 槽位。
  //    Conversation 会把它作为一个会话级 View（与 Chat/Trajectory 并列）渲染，
  //    不再经过 shell.overlay，因此内容位于 conversation slot 的渲染树内；
  //    order: 65 排在数据库工作台（60）之后。面板状态（已打开的会话 Tab、
  //    命令历史、AI 对话）由 overlay.tsx 的持久挂载保活，跨 View 切换不丢失。
  const disposeConversation = slots.inject('conversation.view', () => {
    return slots.register(
      {
        name: 'conversation.view',
        id: 'k8s',
        order: 65,
        locale: NS,
        label: () => t('sidebar.label'),
      },
      K8sConsoleOverlay as unknown as (props: Record<string, unknown>) => unknown,
    )
  })

  if (ctx?.effect) {
    ctx.effect(() => () => {
      disposeLocale()
      disposeSidebar()
      disposeConversation()
      disposeStyle()
    }, 'dsh-plugin-k8s: plugin teardown')
  }
}
