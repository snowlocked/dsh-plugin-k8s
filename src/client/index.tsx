/**
 * dsh-plugin-k8s 客户端插件入口（浏览器端）。
 *
 * 通过 window.__ModuleLoader__ 注册为 web 平台客户端模块（banner/footer 见
 * build.mjs）。apply 负责把插件挂进 DSH 渲染树：
 *
 *   1) `sidebar.footer.action` list slot —— 左侧栏底部「K8s」入口按钮
 *   2) `k8s.console`                single root —— 控制台主面板（自定义 slot）
 *   3) `shell.overlay`              list root —— 把 `k8s.console` 嵌进 layout 浮层
 *
 * React/ReactDOM 留作 external（与数据库插件同一约定）：hooks 走 DSH 主机那份
 * React，避免第二份 React 导致 dispatcher 为 null。
 */
import { useEffect, useRef } from 'react'
import { K8sSidebarEntry } from './sidebar-entry.tsx'
import { K8sConsoleOverlay } from './overlay.tsx'
import { ensureThemeStyle } from './theme.ts'
import { controller, usePanelSnapshot } from './controller.ts'
import { zh, en, NS } from './locales.ts'

export const inject: string[] = ['slots', 'locale']

interface ShellOverlayHostProps {
  renderSlot: (key: 'k8s.console', owner: { onClose: () => void; standalone: boolean; hidden: boolean }) => unknown
  standalone?: boolean
}

/** shell.overlay 列表槽 entry：打开过一次后保持挂载，仅切换 visible（状态保留）。 */
function K8sShellOverlayHost({ renderSlot, standalone = false }: ShellOverlayHostProps): unknown {
  const snapshot = usePanelSnapshot()
  const everOpened = useRef(false)
  useEffect(() => {
    if (snapshot.panelOpen) everOpened.current = true
  }, [snapshot.panelOpen])
  if (!snapshot.panelOpen && !standalone && !everOpened.current) return null
  const visible = snapshot.panelOpen || standalone
  return renderSlot('k8s.console', {
    onClose: () => controller.close(),
    standalone,
    hidden: !visible,
  })
}

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

  // 2) 控制台主面板（自定义 single root slot）
  const disposeConsole = slots.inject('k8s.console', () => {
    return slots.register(
      {
        name: 'k8s.console',
        id: 'dsh',
        order: 0,
        locale: NS,
        label: () => t('sidebar.aria'),
      },
      K8sConsoleOverlay as unknown as (props: Record<string, unknown>) => unknown,
    )
  })

  // 3) shell.overlay 宿主：声明 children 后 host 才收到 renderSlot prop
  const disposeOverlay = slots.inject('shell.overlay', () => {
    return slots.register(
      {
        name: 'shell.overlay',
        id: 'k8s.console',
        order: 70,
        locale: NS,
        label: () => t('sidebar.aria'),
        children: {
          'k8s.console': { kind: 'single', scope: 'root' },
        },
      },
      K8sShellOverlayHost as unknown as (props: Record<string, unknown>) => unknown,
    )
  })

  if (ctx?.effect) {
    ctx.effect(() => () => {
      disposeLocale()
      disposeSidebar()
      disposeConsole()
      disposeOverlay()
      disposeStyle()
    }, 'dsh-plugin-k8s: plugin teardown')
  }
}
