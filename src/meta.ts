/**
 * kubeconfig 元信息解析（纯函数，进程内，不依赖 kubectl）。
 *
 * kubeconfig 是结构固定的 YAML（kubectl config view 产出物），这里只做足够展示与
 * 校验的轻量扫描：contexts（name/cluster/user/namespace）、clusters（name/server）、
 * current-context。token/证书等敏感内容一律不解析、不返回。
 *
 * 解析策略说明：完整 YAML 解析需要引入 yaml 依赖，本插件目标零运行时第三方依赖；
 * 而 kubeconfig 由 kubectl/集群管理员生成，格式高度规整（顶层键顶格，列表项
 * `- name:` 顶格，条目内 mapping 缩进更深）。按这个结构做缩进感知扫描即可稳定工作；
 * 若本机有 kubectl，保存/检查时还会用 `kubectl config view` 做权威校验兜底。
 */

import type { KubeClusterInfo, KubeConfigRecord, KubeContextInfo, KubeMeta, PublicKubeConfig } from './types.ts'

interface SectionEntry {
  indent: number
  /** 当前正在积累的 mapping 容器键（context:/cluster:/user:） */
  bucket: string | null
  bucketIndent: number
  name: string
  cluster?: string
  user?: string
  namespace?: string
  server?: string
}

export function parseKubeconfigMeta(content: string): KubeMeta {
  const contexts: KubeContextInfo[] = []
  const clusters: KubeClusterInfo[] = []
  let currentContext: string | undefined

  let section: 'contexts' | 'clusters' | null = null
  let sectionIndent = -1
  let entry: SectionEntry | null = null

  const closeEntry = (): void => {
    if (!entry || !section) return
    if (section === 'contexts') {
      contexts.push({
        name: entry.name,
        ...(entry.cluster ? { cluster: entry.cluster } : {}),
        ...(entry.user ? { user: entry.user } : {}),
        ...(entry.namespace ? { namespace: entry.namespace } : {}),
      })
    } else if (section === 'clusters') {
      clusters.push({ name: entry.name, ...(entry.server ? { server: entry.server } : {}) })
    }
    entry = null
  }

  const lines = content.split('\n')
  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/gu, '  ')
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue
    const indent = line.length - line.trimStart().length
    const text = line.trim()

    // current-context: xxx —— 顶层标量（可能在文件任何位置出现，取最后一个非空值）
    const currentMatch = /^current-context\s*:\s*("([^"]*)"|'([^']*)'|([^\s#]+))/.exec(text)
    if (currentMatch) {
      const value = currentMatch[2] ?? currentMatch[3] ?? currentMatch[4] ?? ''
      if (value) currentContext = value
      continue
    }

    // 顶层节：clusters:/users:/contexts:（顶格或缩进较浅）
    const sectionMatch = /^([a-zA-Z][\w.-]*)\s*:\s*$/.exec(text)
    if (sectionMatch && indent <= (section === null ? 0 : sectionIndent)) {
      const key = sectionMatch[1]
      if (key === 'contexts' || key === 'clusters') {
        closeEntry()
        section = key
        sectionIndent = indent
        entry = null
        continue
      }
      if (key === 'users' || key === 'preferences') {
        closeEntry()
        section = null
        entry = null
        continue
      }
    }

    if (!section) continue

    // 列表项开始：- name: "x"
    const dashName = /^-\s*name\s*:\s*("([^"]*)"|'([^']*)'|([^\s#]+))/.exec(text)
    if (dashName) {
      closeEntry()
      entry = {
        indent,
        bucket: null,
        bucketIndent: -1,
        name: dashName[2] ?? dashName[3] ?? dashName[4] ?? '',
      }
      continue
    }

    if (!entry) continue
    // 新列表项（- 开头但不是 name:）或顶格 key → 本条结束
    if (text.startsWith('-') || indent <= entry.indent) {
      closeEntry()
      section = null
      entry = null
      continue
    }

    // 条目内的 mapping 容器：context:/cluster:/user:
    const bucketMatch = /^([a-zA-Z][\w.-]*)\s*:\s*$/.exec(text)
    if (bucketMatch && indent > entry.indent) {
      entry.bucket = bucketMatch[1]
      entry.bucketIndent = indent
      continue
    }
    if (!entry.bucket) continue
    if (indent <= entry.bucketIndent) {
      // 更浅缩进的 key：容器结束（回退为无容器状态，避免误归属）
      entry.bucket = null
      entry.bucketIndent = -1
      continue
    }

    // 容器内 scalar：取需要的字段
    const valueMatch = /^([a-zA-Z][\w.-]*)\s*:\s*("([^"]*)"|'([^']*)'|([^\s#]+)?)/.exec(text)
    if (!valueMatch) continue
    const key = valueMatch[1]
    const value = valueMatch[3] ?? valueMatch[4] ?? valueMatch[5] ?? ''
    if (entry.bucket === 'cluster' && key === 'server' && value) entry.server = value
    else if (entry.bucket === 'context' && key === 'cluster' && value) entry.cluster = value
    else if (entry.bucket === 'context' && key === 'user' && value) entry.user = value
    else if (entry.bucket === 'context' && key === 'namespace' && value) entry.namespace = value
  }
  closeEntry()

  return {
    contexts,
    clusters,
    ...(currentContext ? { currentContext } : {}),
  }
}

/**
 * 展示归一化：单 context 且缺 current-context 时把该 context 当作默认；
 * 没有任何 context → 视为无效 kubeconfig（返回 null，由调用方决定拒绝/提示）。
 */
export function normalizeMeta(meta: KubeMeta): KubeMeta | null {
  if (meta.contexts.length === 0) return null
  if (!meta.currentContext && meta.contexts.length === 1) {
    return { ...meta, currentContext: meta.contexts[0]!.name }
  }
  return meta
}

/** 组装返回前端的视图（不包含 token/证书原文）。 */
export function describePublic(record: KubeConfigRecord, content: string, rawMeta: KubeMeta): PublicKubeConfig {
  const meta = normalizeMeta(rawMeta) ?? { contexts: [], clusters: rawMeta.clusters }
  const current = meta.currentContext
  const currentCtx = meta.contexts.find((item) => item.name === current)
  const server = currentCtx?.cluster
    ? meta.clusters.find((item) => item.name === currentCtx.cluster)?.server
    : undefined
  return {
    ...record,
    contextNames: meta.contexts.map((item) => item.name),
    ...(meta.currentContext ? { currentContext: meta.currentContext } : {}),
    ...(server || meta.clusters[0]?.server ? { server: server ?? meta.clusters[0]!.server } : {}),
    size: Buffer.byteLength(content, 'utf8'),
    parse: 'fallback',
  }
}
