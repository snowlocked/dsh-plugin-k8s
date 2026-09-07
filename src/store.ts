import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync, chmodSync } from 'node:fs'
import { join, basename } from 'node:path'
import type { KubeConfigRecord, KubeMeta, PublicKubeConfig } from './types.ts'
import { K8sConsoleError } from './errors.ts'
import { parseKubeconfigMeta, describePublic } from './meta.ts'

export interface KubeStore {
  list(): PublicKubeConfig[]
  get(id: string): KubeConfigRecord | undefined
  /** 取记录 + 文件内容（供执行/检查用）。不存在抛 404。 */
  requireContent(id: string): { record: KubeConfigRecord; content: string }
  save(input: KubeSaveInput): PublicKubeConfig
  remove(id: string): boolean
  noteCheckResult(id: string, ok: boolean, errorMessage?: string): void
  readonly dataDir: string
  /** kubeconfig 文件目录 */
  readonly kubeDir: string
}

export interface KubeSaveInput {
  id?: string
  name: string
  /** 粘贴的 kubeconfig 内容（与 filePath 二选一） */
  content?: string
  /** 从本机已有路径导入（与 content 二选一） */
  filePath?: string
}

export const DEFAULT_DATA_DIR = 'dsh-k8s'
const MAX_NAME = 120
const MAX_BYTES = 1024 * 1024 // kubeconfig 通常 < 100KB，1MB 封顶
const ID_RE = /^[A-Za-z0-9_-]{6,64}$/u
const FILE_NAME_RE = /^[A-Za-z0-9._-]+\.(yaml|yml|config)$/u
// 对文件内容的最轻量安全检查：必须在顶部区域出现 kubeconfig 关键字段才接受，
// 避免把任意大文件当 kubeconfig 存进来。
const KUBECONFIG_MARKER_RE = /(^|\n)\s*(apiVersion\s*:\s*["']?v1|kind\s*:\s*["']?Config|current-context\s*:)/u

export function isValidKubeId(id: string): boolean {
  return ID_RE.test(id)
}

function newId(): string {
  return `k8s_${randomBytes(5).toString('hex')}`
}

function safeFileName(id: string): string {
  return `${id}.yaml`
}

/** 读取文件内容（含大小校验），统一把换行规范成 \n。 */
function normalizeContent(raw: string): string {
  return raw.replace(/\r\n?/gu, '\n').trimEnd() + '\n'
}

function validateShape(name: string, content: string): { name: string; content: string } {
  const trimmed = name?.trim()
  if (!trimmed) throw new K8sConsoleError('kubeconfig 名称不能为空', 'INVALID_NAME')
  if (trimmed.length > MAX_NAME) throw new K8sConsoleError(`名称过长（最多 ${MAX_NAME} 字符）`, 'INVALID_NAME')
  const normalized = normalizeContent(content)
  const bytes = Buffer.byteLength(normalized, 'utf8')
  if (bytes <= 0) throw new K8sConsoleError('kubeconfig 内容为空', 'EMPTY_CONTENT')
  if (bytes > MAX_BYTES) throw new K8sConsoleError('kubeconfig 内容过大（上限 1MB）', 'CONTENT_TOO_LARGE')
  // 必须是 kubeconfig 样式的 YAML 才收
  if (!KUBECONFIG_MARKER_RE.test(normalized)) {
    throw new K8sConsoleError(
      '内容看起来不是 kubeconfig（未找到 apiVersion/kind: Config/current-context 等字段）。请粘贴完整的 kubeconfig YAML 内容。',
      'NOT_KUBECONFIG',
    )
  }
  return { name: trimmed, content: normalized }
}

export function createKubeStore(dataDir: string, log?: (message: string) => void): KubeStore {
  const kubeDir = join(dataDir, 'kubeconfigs')
  const indexFile = join(dataDir, 'kubeconfigs.json')

  const ensureDir = (): void => {
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
    if (!existsSync(kubeDir)) mkdirSync(kubeDir, { recursive: true })
  }

  interface IndexPayload {
    version?: number
    items?: KubeConfigRecord[]
  }

  const loadIndex = (): KubeConfigRecord[] => {
    ensureDir()
    if (!existsSync(indexFile)) return []
    try {
      const raw = JSON.parse(readFileSync(indexFile, 'utf8')) as IndexPayload
      return Array.isArray(raw.items) ? raw.items : []
    } catch (error) {
      log?.(`[dsh-k8s-console] 索引读取失败：${error instanceof Error ? error.message : String(error)}`)
      return []
    }
  }

  const persistIndex = (items: KubeConfigRecord[]): void => {
    ensureDir()
    const tmp = `${indexFile}.tmp-${process.pid}`
    writeFileSync(tmp, JSON.stringify({ version: 1, items }, null, 2), 'utf8')
    try {
      chmodSync(tmp, 0o600)
    } catch {
      /* Windows 下 chmod 可能无意义 */
    }
    renameSync(tmp, indexFile)
  }

  // 磁盘是唯一真相：每次读索引 + 与文件系统对账（防止手动删除文件后幽灵条目）。
  const reconciled = (): KubeConfigRecord[] => {
    ensureDir()
    const items = loadIndex()
    const seen = new Set<string>()
    for (const name of readdirSync(kubeDir)) {
      const match = /^([A-Za-z0-9_-]{6,64})\.(yaml|yml|config)$/u.exec(name)
      if (!match) continue
      seen.add(match[1]!)
    }
    const dropped = items.filter((item) => seen.has(item.id))
    if (dropped.length !== items.length) persistIndex(dropped)
    return dropped
  }

  const contentOf = (id: string): string | undefined => {
    const record = reconciled().find((item) => item.id === id)
    if (!record) return undefined
    const file = join(kubeDir, record.fileName)
    if (!existsSync(file)) return undefined
    try {
      return readFileSync(file, 'utf8')
    } catch {
      return undefined
    }
  }

  const describe = (record: KubeConfigRecord, content: string): PublicKubeConfig => {
    const meta = parseKubeconfigMeta(content)
    return describePublic(record, content, meta)
  }

  return {
    dataDir,
    kubeDir,
    list() {
      ensureDir()
      const items = reconciled()
      return items
        .map((record) => {
          const content = contentOf(record.id)
          if (content === undefined) return null
          return describe(record, content)
        })
        .filter((entry): entry is PublicKubeConfig => entry !== null)
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    },
    get(id) {
      return reconciled().find((item) => item.id === id)
    },
    requireContent(id) {
      const record = reconciled().find((item) => item.id === id)
      if (!record) throw new K8sConsoleError(`kubeconfig 不存在：${id}`, 'NOT_FOUND', 404)
      const content = contentOf(id)
      if (content === undefined) {
        throw new K8sConsoleError(`kubeconfig 文件丢失：${record.fileName}`, 'FILE_MISSING', 404)
      }
      return { record, content }
    },
    save(input) {
      // 从本机路径导入：服务端读取文件内容后与本插件的管理目录解耦（存副本）。
      let content: string
      let importedName: string | undefined
      if (typeof input.filePath === 'string' && input.filePath.trim() !== '') {
        const filePath = input.filePath.trim()
        let raw: string
        try {
          raw = readFileSync(filePath, 'utf8')
        } catch (reason) {
          const message = reason instanceof Error ? reason.message : String(reason)
          throw new K8sConsoleError(`无法读取文件：${message}`, 'FILE_READ_FAILED', 400)
        }
        const stat = statSync(filePath, { throwIfNoEntry: false })
        if (stat !== undefined && !stat.isFile()) {
          throw new K8sConsoleError('导入路径不是文件', 'FILE_READ_FAILED', 400)
        }
        content = raw
        importedName = basename(filePath).replace(/\.(yaml|yml|config)$/iu, '')
      } else if (typeof input.content === 'string') {
        content = input.content
      } else {
        throw new K8sConsoleError('需要提供 kubeconfig 内容（粘贴 content 或填写本机 filePath）', 'BAD_INPUT')
      }

      const displayName = input.name?.trim() || importedName?.trim() || ''
      const { name, content: normalized } = validateShape(displayName, content)

      ensureDir()
      const items = loadIndex()
      const current = input.id && isValidKubeId(input.id) ? items.find((item) => item.id === input.id) : undefined
      const duplicate = items.find(
        (item) => item.id !== (current?.id ?? input.id) && item.name.trim().toLowerCase() === name.toLowerCase(),
      )
      if (duplicate) {
        throw new K8sConsoleError(
          `已存在同名 kubeconfig「${duplicate.name}」。如需覆盖请使用该条目的编辑功能。`,
          'DUPLICATE_NAME',
        )
      }

      const now = new Date().toISOString()
      const id = current?.id ?? newId()
      const record: KubeConfigRecord = {
        id,
        name,
        fileName: current?.fileName ?? safeFileName(id),
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
        ...(current?.lastCheckedAt ? { lastCheckedAt: current.lastCheckedAt } : {}),
        ...(current?.lastCheckError ? { lastCheckError: current.lastCheckError } : {}),
      }
      if (!FILE_NAME_RE.test(record.fileName)) record.fileName = safeFileName(id)

      // 先落内容（带权限），再落索引 —— 中间状态最多是孤儿文件，不会出现幽灵条目。
      const target = join(kubeDir, record.fileName)
      const tmp = `${target}.tmp-${process.pid}`
      writeFileSync(tmp, normalized, 'utf8')
      try {
        chmodSync(tmp, 0o600)
      } catch {
        /* Windows 忽略 */
      }
      renameSync(tmp, target)

      const existingIndex = items.findIndex((item) => item.id === id)
      if (existingIndex >= 0) items[existingIndex] = record
      else items.push(record)
      persistIndex(items)
      log?.(`[dsh-k8s-console] 已保存 kubeconfig「${record.name}」(${record.id})`)
      return describe(record, normalized)
    },
    remove(id) {
      if (!isValidKubeId(id)) return false
      ensureDir()
      const items = loadIndex()
      const index = items.findIndex((item) => item.id === id)
      if (index < 0) return false
      const [record] = items.splice(index, 1)
      try {
        const file = join(kubeDir, record.fileName)
        if (existsSync(file)) renameSync(file, `${file}.trash-${process.pid}`)
      } catch {
        /* 删除失败不阻塞索引更新 */
      }
      persistIndex(items)
      log?.(`[dsh-k8s-console] 已删除 kubeconfig ${id}`)
      return true
    },
    noteCheckResult(id, ok, errorMessage) {
      const items = loadIndex()
      const record = items.find((item) => item.id === id)
      if (!record) return
      record.lastCheckedAt = new Date().toISOString()
      if (ok) delete record.lastCheckError
      else record.lastCheckError = errorMessage
      persistIndex(items)
    },
  }
}

export { FILE_NAME_RE, MAX_BYTES }

/** 数据目录默认值：<DSH_HOME>/dsh-k8s（未设置 DSH_HOME 时取 ~/.dsh/dsh-k8s）。 */
export function defaultDataDir(): string {
  const home = process.env.DSH_HOME && process.env.DSH_HOME.length > 0 ? process.env.DSH_HOME : null
  if (home) return join(home, DEFAULT_DATA_DIR)
  const osHome = process.env.HOME || process.env.USERPROFILE || '.'
  return join(osHome, '.dsh', DEFAULT_DATA_DIR)
}
