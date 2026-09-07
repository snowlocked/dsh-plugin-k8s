/**
 * 浏览器端轻量持久化：只记“面板上次是否打开”，刷新后自动恢复。
 * 会话/命令/AI 历史等大状态不做跨刷新持久化（面板收起再打开靠保持挂载）。
 */

const KEY = 'dsh-k8s-console.persist.v1'

export interface PersistedState {
  panelOpen?: boolean
}

export function readPersist(): PersistedState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistedState
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writePersist(patch: PersistedState): void {
  try {
    const next = { ...readPersist(), ...patch }
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* localStorage 不可用时静默 */
  }
}
