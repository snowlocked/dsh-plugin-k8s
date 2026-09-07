/**
 * dsh-k8s-console 的 `k8s` 命名空间字典（key 中英等量）。
 */

export const NS = 'k8s'

export const zh = {
  'sidebar.label': 'K8s',
  'sidebar.aria': 'K8s 控制台',
  'sidebar.title': '打开 K8s 控制台',
  'overlay.close': '回到对话',
} as const

export const en = {
  'sidebar.label': 'K8s',
  'sidebar.aria': 'K8s console',
  'sidebar.title': 'Open K8s console',
  'overlay.close': 'Back to conversation',
} as const

export type K8sDictionary = typeof zh | typeof en
export type K8sTranslate = (key: keyof typeof zh) => string
