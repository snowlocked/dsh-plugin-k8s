/** kubeconfig 解析出的元信息（做展示与校验用，不落库、不外发敏感字段）。 */

export interface KubeContextInfo {
  name: string
  cluster?: string
  user?: string
  namespace?: string
}

export interface KubeClusterInfo {
  name: string
  server?: string
}

export interface KubeMeta {
  contexts: KubeContextInfo[]
  clusters: KubeClusterInfo[]
  currentContext?: string
}

/** 一条 kubeconfig 的完整记录（仅含元数据；文件内容单独存 kubeconfigs/<id>.yaml）。 */
export interface KubeConfigRecord {
  /** 稳定 id（短随机串） */
  id: string
  /** 显示名 */
  name: string
  /** 磁盘文件名（kubeconfigs/<fileName>） */
  fileName: string
  createdAt?: string
  updatedAt?: string
  lastCheckedAt?: string
  lastCheckError?: string
}

/** 返回给前端的视图（列表/详情都带轻量解析元信息，不含 token/证书原文）。 */
export interface PublicKubeConfig extends KubeConfigRecord {
  /** 上下文名列表（用于会话 Tab 内“切换 context”） */
  contextNames: string[]
  /** 当前上下文 */
  currentContext?: string
  /** 当前上下文对应集群的 server（脱不了敏的 host 部分；仅展示用途） */
  server?: string
  /** 文件字节数 */
  size: number
  /** 元信息解析方式：kubectl = 官方解析；fallback = 内置轻量解析 */
  parse: 'kubectl' | 'fallback'
}

/** kubectl 探测结果（state / 日志用）。 */
export interface KubectlProbe {
  present: boolean
  path?: string
  version?: string
  missingReason?: string
}

/** AI 模型枚举返回项。 */
export interface AiProviderEntry {
  provider: string
  label?: string
  models: Array<{ id: string; label?: string }>
}
