/**
 * K8s 控制台侧边栏入口行 —— `sidebar.footer.action` 列表 slot 的一个 entry。
 * 点击时调用 controller.toggle()（打开/关闭面板）。
 */
import { useCallback, useSyncExternalStore } from 'react'
import { controller } from './controller.ts'
import type { K8sTranslate } from './locales.ts'

const ICON = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="8" cy="2.6" r="1.05" fill="currentColor" stroke="none" />
    <circle cx="8" cy="13.4" r="1.05" fill="currentColor" stroke="none" />
    <circle cx="2.6" cy="8" r="1.05" fill="currentColor" stroke="none" />
    <circle cx="13.4" cy="8" r="1.05" fill="currentColor" stroke="none" />
    <path d="M8 4v2.6M8 9.4V12M4.6 6.6l2.2 1.4M9.2 8l2.2 1.4M4.6 9.4l2.2-1.4M9.2 8l2.2-1.4" />
  </svg>
)

export interface K8sSidebarEntryProps {
  wide?: boolean
  t?: K8sTranslate
}

/** 直接注册到 slot 的组件函数（不能在外面包 lambda 再调用它，见数据库插件注释）。 */
export function K8sSidebarEntry(props: K8sSidebarEntryProps = {}): JSX.Element {
  const { wide = true, t = ((key: string) => key) as unknown as K8sTranslate } = props
  const tt = t
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
  const handleClick = useCallback(() => {
    controller.toggle()
  }, [])
  return (
    <button
      type="button"
      data-d-sh-plugin="k8s-console"
      data-active={snapshot.panelOpen || undefined}
      aria-label={tt('sidebar.aria')}
      title={tt('sidebar.title')}
      onClick={handleClick}
      className="kc-sidebar-entry"
    >
      <span className="kc-sidebar-entry-icon" aria-hidden="true">{ICON}</span>
      {wide ? <span className="kc-sidebar-entry-label">{tt('sidebar.label')}</span> : null}
    </button>
  )
}
