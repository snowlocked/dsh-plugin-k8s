/**
 * `k8s.console` slot 注册组件 —— 控制台面板容器。
 *
 * 渲染 <App/>（左侧 kubeconfig 管理 + 右侧会话 Tab 工作区）。
 *
 * ⚠️ 保留 `<div id="dsh-k8s-console">` wrapper：styles.css 全部规则以此为根。
 *
 * 几何策略与数据库插件一致：shell.overlay 父节点覆盖整个 frame；用 ResizeObserver
 * 跟踪左侧栏/右侧详情栏宽度，让面板始终正好盖在中间对话栏上。
 */
import { useEffect, useState } from 'react'
import App from './App.tsx'

export interface K8sConsoleOwnerProps {
  onClose: () => void
  standalone: boolean
  hidden?: boolean
}

const SIDEBAR_FALLBACK_PX = 280

export function K8sConsoleOverlay(props: K8sConsoleOwnerProps): JSX.Element | null {
  const [track, setTrack] = useState<{ left: number; right: number }>({ left: SIDEBAR_FALLBACK_PX, right: 0 })

  useEffect(() => {
    if (typeof document === 'undefined') return
    const sidebar = document.querySelector<HTMLElement>('[class*="sidebarCol"]')
    const details = document.querySelector<HTMLElement>('[class*="detailsCol"]')
    if (sidebar === null && details === null) return
    const update = (): void => {
      setTrack({
        left: sidebar !== null ? sidebar.getBoundingClientRect().width : SIDEBAR_FALLBACK_PX,
        right: details !== null ? details.getBoundingClientRect().width : 0,
      })
    }
    update()
    const ro = new ResizeObserver(update)
    if (sidebar !== null) ro.observe(sidebar)
    if (details !== null) ro.observe(details)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      id="dsh-k8s-console"
      data-hidden={props.hidden ? 'true' : undefined}
      style={{
        position: 'absolute',
        left: Math.max(0, Math.round(track.left)),
        top: 0,
        right: Math.max(0, Math.round(track.right)),
        bottom: 0,
        background: 'var(--kc-bg)',
        display: props.hidden ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <App onClose={props.onClose} standalone={props.standalone} />
    </div>
  )
}
