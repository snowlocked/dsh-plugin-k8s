/**
 * `conversation.view` slot 注册组件 —— K8s 控制台面板。
 *
 * 渲染 <App/>（左侧 kubeconfig 管理 + 右侧会话 Tab 工作区）。
 *
 * 持久挂载策略（为什么不用普通渲染）：
 *   Conversation 切换 View 时会 **卸载** 非激活 View（renderSlot(..., { only: active.id })），
 *   如果把 App 直接渲染在本组件里，每次切到 Chat 再切回来，所有已打开的会话 Tab、
 *   命令历史、AI 对话都会丢失。因此 App 只通过 createRoot 挂载 **一次**
 *   到模块级持久容器（#dsh-k8s-console），本组件在激活时把容器 appendChild
 *   到停靠位、失活/卸载时移回 body 并 display:none —— App 及其全部状态跨
 *   View 切换、跨会话切换、跨“关闭再打开”始终保留
 *   （= 持久化记忆打开过的内容，与数据库工作台同款方案）。
 *
 * 中栏接管（参考番茄工作台 / 数据库插件）：
 *   激活时把持久容器 **以绝对定位覆盖** 到 Conversation 根节点（[data-phase]，
 *   position:relative）上 —— inset:0 + 不透明背景，天然盖住会话头部、View 导航
 *   与悬浮输入框，控制台自带顶栏取而代之。**不隐藏、不修改任何宿主元素**：
 *   覆盖层没出现的最坏结果是 chat 照常显示，绝不会白屏；失活时容器移回 body，
 *   宿主恢复如初。
 *
 * ⚠️ 持久容器必须携带 `id="dsh-k8s-console"`：styles.css 里所有选择器都以
 * 它为根限定（`#dsh-k8s-console .kc-topbar {…}`），容器走到哪里主题样式
 * 就跟到哪里。
 */
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { controller } from './controller.ts'

/* ------------------------------------------- 持久 App root（跨 View 卸载保活） */

let host: HTMLDivElement | null = null
let reactRoot: ReturnType<typeof createRoot> | null = null

/**
 * 确保（全局唯一的）持久 App 容器已创建。容器自带 `id="dsh-k8s-console"`
 * （styles.css 的作用域根）：绝对定位覆盖层，停靠时铺满 Conversation 根节点。
 */
function ensureHost(): HTMLDivElement {
  if (host !== null) return host
  host = document.createElement('div')
  host.id = 'dsh-k8s-console'
  host.style.cssText = [
    'position:absolute', 'inset:0', 'z-index:30', 'display:none',
    'flex-direction:column', 'overflow:hidden', 'background:var(--kc-bg)',
  ].join(';')
  document.body.appendChild(host)
  reactRoot = createRoot(host)
  reactRoot.render(<App onClose={() => controller.close()} standalone={false} />)
  return host
}

/* ------------------------------------------------- conversation.view 组件 */

/** `conversation.view` 注册组件收到的 owner props（由 Conversation 透传，均按需使用）。 */
export interface K8sConsoleOwnerProps {
  /** 关闭面板回调（注册组件自行决定如何响应）。 */
  onClose?: () => void
  /** 是否处于独立预览模式（无 DSH shell 时为 true）。 */
  standalone?: boolean
  /** Conversation View 的一次性焦点请求。 */
  viewRequest?: unknown
  /** Conversation View 的打开/聚焦回调。 */
  openView?: (view: string, focus: string) => void
  /** Conversation View 的请求确认回调。 */
  completeViewRequest?: () => void
}

export function K8sConsoleOverlay(_props: K8sConsoleOwnerProps): JSX.Element {
  // 锚点：只用来向上找 Conversation 根节点（[data-phase]），本身不占空间。
  const anchorRef = useRef<HTMLDivElement | null>(null)

  // 激活时把持久容器覆盖到 Conversation 根节点上；失活/卸载时移回 body 并隐藏。
  // 全程不修改任何宿主元素 —— 最坏情况是覆盖层缺席，chat 保持可见。
  useEffect(() => {
    const anchor = anchorRef.current
    if (anchor === null) return undefined
    const persistentHost = ensureHost()
    // [data-phase] 是 ConversationRoot 根节点（position:relative），覆盖它即
    // 连头部一起接管；找不到时退化停靠到父容器，仍不影响宿主。
    const dock = anchor.closest<HTMLElement>('[data-phase]') ?? anchor.parentElement
    // 宿主 header 高度不是 CSS 常量（由 padding+标题行+页签条撑出，≈75.7px），
    // 这里实测后写入 --kc-shell-header-h，让控制台「顶栏+TabBar」总高与它对齐
    // （与数据库工作台同款方案）。
    let headerObserver: ResizeObserver | undefined
    const applyHeaderHeight = (height: number): void => {
      if (Number.isFinite(height) && height >= 32) {
        persistentHost.style.setProperty('--kc-shell-header-h', `${height}px`)
      }
    }
    if (dock !== null && dock !== undefined) {
      const headerEl = dock.querySelector<HTMLElement>('header')
      if (headerEl !== null) {
        headerObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const box = entry.borderBoxSize as ReadonlyArray<ResizeObserverSize> | undefined
            const blockHeight = Array.isArray(box) ? box[0]?.blockSize : undefined
            applyHeaderHeight(blockHeight ?? headerEl.getBoundingClientRect().height)
          }
        })
        headerObserver.observe(headerEl)
        applyHeaderHeight(headerEl.getBoundingClientRect().height)
      }
    }
    if (dock !== null && dock !== undefined) {
      controller.setDocked(true)
      persistentHost.style.display = 'flex'
      if (persistentHost.parentElement !== dock) dock.appendChild(persistentHost)
    }
    return () => {
      headerObserver?.disconnect()
      controller.setDocked(false)
      if (persistentHost.parentElement !== document.body) {
        document.body.appendChild(persistentHost)
      }
      persistentHost.style.display = 'none'
    }
  }, [])

  return <div ref={anchorRef} style={{ height: 0, overflow: 'hidden' }} />
}
