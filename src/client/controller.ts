/**
 * 面板开关控制器（纯 JS）：驱动侧边栏入口高亮与中栏浮层可见性。
 * 打开状态写入 localStorage：刷新页面后恢复上次是否打开工作台。
 */
import { useSyncExternalStore } from 'react'
import { readPersist, writePersist } from './persist.ts'

export interface PanelSnapshot {
  readonly panelOpen: boolean
}

let panelOpen = readPersist().panelOpen === true
const listeners = new Set<() => void>()
const emit = (): void => {
  for (const listener of listeners) listener()
}

const SNAPSHOT_OPEN: PanelSnapshot = Object.freeze({ panelOpen: true })
const SNAPSHOT_CLOSED: PanelSnapshot = Object.freeze({ panelOpen: false })
let currentSnapshot: PanelSnapshot = panelOpen ? SNAPSHOT_OPEN : SNAPSHOT_CLOSED

const remember = (): void => {
  try {
    writePersist({ panelOpen })
  } catch {
    /* 忽略 */
  }
}

export const controller = {
  open() {
    if (panelOpen) return
    panelOpen = true
    currentSnapshot = SNAPSHOT_OPEN
    remember()
    emit()
  },
  close() {
    if (!panelOpen) return
    panelOpen = false
    currentSnapshot = SNAPSHOT_CLOSED
    remember()
    emit()
  },
  toggle() {
    panelOpen = !panelOpen
    currentSnapshot = panelOpen ? SNAPSHOT_OPEN : SNAPSHOT_CLOSED
    remember()
    emit()
  },
  getSnapshot: () => currentSnapshot,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

/** React 订阅 hook：返回当前不可变快照（组件渲染期只调一次）。 */
export function usePanelSnapshot(): PanelSnapshot {
  return useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
}
