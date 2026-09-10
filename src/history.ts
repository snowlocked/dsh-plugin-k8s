/**
 * 会话历史持久化：把「AI 对话」逐条落盘（每个会话一个 JSON 文件），
 * 刷新页面 / 重启 DSH 后仍可查询、搜索、载入继续追问。
 *
 * 存储形态：<dataDir>/history/hist_<id>.json（原子写：tmp + rename）。
 * 磁盘是唯一真相：每次操作扫描目录重建内存视图（会话数有上限，代价可控）。
 */

import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { K8sConsoleError } from './errors.ts'

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
  /** ISO 时间 */
  at: string
  provider?: string
  model?: string
  /** AI 出错的消息（记录原文，便于事后排查） */
  error?: boolean
}

export interface ChatSession {
  id: string
  kubeId: string
  kubeName: string
  context?: string
  startedAt: string
  updatedAt: string
  messages: HistoryMessage[]
}

export interface ChatSessionSummary {
  id: string
  kubeId: string
  kubeName: string
  context?: string
  startedAt: string
  updatedAt: string
  messageCount: number
  /** 第一条用户消息预览（截断） */
  preview: string
  /** 关键词命中片段（list 带 keyword 时返回） */
  snippet?: string
}

export interface HistoryAppendInput {
  /** 缺省 / 未知 → 新建会话（返回值携带真正的 sessionId，客户端应采用） */
  sessionId?: string
  kubeId: string
  kubeName: string
  context?: string
  message: HistoryMessage
}

export interface HistoryListOptions {
  /** 大小写不敏感子串搜索（匹配消息内容或集群名） */
  keyword?: string
  /** 只看某个 kubeconfig 的会话 */
  kubeId?: string
  /** 返回条数上限（默认 50） */
  limit?: number
}

export interface HistoryStore {
  readonly dir: string
  append(input: HistoryAppendInput): ChatSession
  list(options?: HistoryListOptions): ChatSessionSummary[]
  get(sessionId: string): ChatSession
  remove(sessionId: string): boolean
  /** 清空全部历史（HTTP 层应要求显式 confirm）。返回删除的会话数。 */
  clear(): number
}

const MAX_SESSIONS = 300
const MAX_MESSAGES_PER_SESSION = 500
const MAX_MESSAGE_CHARS = 100_000
const MAX_PREVIEW = 160
const SNIPPET_RADIUS = 80
const MAX_KUBE_NAME = 120
const SESSION_FILE_RE = /^hist_([A-Za-z0-9]{6,64})\.json$/u

function nowIso(): string {
  return new Date().toISOString()
}

function newSessionId(): string {
  return `h${randomBytes(8).toString('hex')}`
}

function isSessionId(value: string): boolean {
  return /^h[A-Za-z0-9]{6,64}$/u.test(value)
}

function normalizeMessage(raw: HistoryMessage): HistoryMessage {
  const role = raw.role === 'assistant' ? 'assistant' : 'user'
  const content = typeof raw.content === 'string' ? raw.content.slice(0, MAX_MESSAGE_CHARS) : ''
  const at = typeof raw.at === 'string' && raw.at.length > 0 ? raw.at : nowIso()
  return {
    role,
    content,
    at,
    ...(typeof raw.provider === 'string' && raw.provider ? { provider: raw.provider.slice(0, 120) } : {}),
    ...(typeof raw.model === 'string' && raw.model ? { model: raw.model.slice(0, 120) } : {}),
    ...(raw.error === true ? { error: true } : {}),
  }
}

function previewOf(session: ChatSession): string {
  const firstUser = session.messages.find((message) => message.role === 'user')
  const text = (firstUser?.content ?? session.messages[0]?.content ?? '').replace(/\s+/gu, ' ').trim()
  return text.length > MAX_PREVIEW ? `${text.slice(0, MAX_PREVIEW)}…` : text
}

function buildSnippet(session: ChatSession, keyword: string): string | undefined {
  const needle = keyword.toLowerCase()
  for (const message of session.messages) {
    const index = message.content.toLowerCase().indexOf(needle)
    if (index < 0) continue
    const start = Math.max(0, index - SNIPPET_RADIUS)
    const end = Math.min(message.content.length, index + needle.length + SNIPPET_RADIUS)
    const body = message.content.slice(start, end).replace(/\s+/gu, ' ').trim()
    return `${start > 0 ? '…' : ''}${body}${end < message.content.length ? '…' : ''}`
  }
  return undefined
}

export function createHistoryStore(historyDir: string, log?: (message: string) => void): HistoryStore {
  const ensureDir = (): void => {
    if (!existsSync(historyDir)) mkdirSync(historyDir, { recursive: true })
  }

  const fileOf = (sessionId: string): string => join(historyDir, `hist_${sessionId.slice(1)}.json`)

  const scanSessions = (): ChatSession[] => {
    ensureDir()
    const sessions: ChatSession[] = []
    let corrupt = 0
    for (const name of readdirSync(historyDir)) {
      const match = SESSION_FILE_RE.exec(name)
      if (!match) continue
      const file = join(historyDir, name)
      try {
        const parsed = JSON.parse(readFileSync(file, 'utf8')) as ChatSession
        if (parsed && typeof parsed === 'object' && typeof parsed.id === 'string' && Array.isArray(parsed.messages)) {
          sessions.push(parsed)
        } else {
          corrupt += 1
        }
      } catch {
        corrupt += 1
      }
    }
    if (corrupt > 0) log?.(`[dsh-k8s-console] 历史目录存在 ${corrupt} 个损坏/不合法的会话文件，已跳过`)
    sessions.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
    return sessions
  }

  const persistSession = (session: ChatSession): void => {
    ensureDir()
    const file = fileOf(session.id)
    const tmp = `${file}.tmp-${process.pid}`
    writeFileSync(tmp, JSON.stringify(session, null, 2), 'utf8')
    renameSync(tmp, file)
  }

  return {
    dir: historyDir,
    append(input) {
      const message = normalizeMessage(input.message)
      if (!message.content.trim() && message.role === 'user') {
        throw new K8sConsoleError('历史消息内容不能为空', 'BAD_INPUT', 400)
      }
      const sessions = scanSessions()
      const wantedId = typeof input.sessionId === 'string' && isSessionId(input.sessionId) ? input.sessionId : ''
      const existing = wantedId ? sessions.find((session) => session.id === wantedId) : undefined
      const now = nowIso()
      const kubeName = (input.kubeName || '未知集群').slice(0, MAX_KUBE_NAME)
      const kubeId = typeof input.kubeId === 'string' ? input.kubeId.slice(0, 120) : ''

      let session: ChatSession
      if (existing) {
        session = {
          ...existing,
          kubeId: kubeId || existing.kubeId,
          kubeName: kubeName || existing.kubeName,
          updatedAt: now,
          messages: [...existing.messages, message].slice(-MAX_MESSAGES_PER_SESSION),
        }
      } else {
        session = {
          id: newSessionId(),
          kubeId,
          kubeName,
          ...(typeof input.context === 'string' && input.context.trim() !== '' ? { context: input.context.trim().slice(0, 120) } : {}),
          startedAt: now,
          updatedAt: now,
          messages: [message],
        }
      }
      persistSession(session)

      // 会话数上限：按 updatedAt 淘汰最旧（当前会话刚写过，不会被淘汰）
      const all = scanSessions()
      if (all.length > MAX_SESSIONS) {
        const victims = all.slice(MAX_SESSIONS).filter((item) => item.id !== session.id)
        for (const victim of victims) {
          try {
            unlinkSync(fileOf(victim.id))
          } catch {
            /* 已不存在时忽略 */
          }
        }
        if (victims.length > 0) log?.(`[dsh-k8s-console] 历史会话超过 ${MAX_SESSIONS} 条，已淘汰最旧 ${victims.length} 条`)
      }
      return session
    },
    list(options = {}) {
      const keyword = options.keyword?.trim().toLowerCase() ?? ''
      const sessions = scanSessions()
      const summaries: ChatSessionSummary[] = []
      for (const session of sessions) {
        if (options.kubeId && session.kubeId !== options.kubeId) continue
        if (keyword) {
          const inContent = session.messages.some((message) => message.content.toLowerCase().includes(keyword))
          const inName = session.kubeName.toLowerCase().includes(keyword)
          if (!inContent && !inName) continue
        }
        summaries.push({
          id: session.id,
          kubeId: session.kubeId,
          kubeName: session.kubeName,
          ...(session.context ? { context: session.context } : {}),
          startedAt: session.startedAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length,
          preview: previewOf(session),
          ...(keyword ? { snippet: buildSnippet(session, keyword) ?? undefined } : {}),
        })
      }
      const limit = Math.min(Math.max(Math.trunc(options.limit ?? 50) || 50, 1), 200)
      return summaries.slice(0, limit)
    },
    get(sessionId) {
      if (!isSessionId(sessionId)) throw new K8sConsoleError(`非法的会话 id：${sessionId}`, 'BAD_ID', 400)
      const file = fileOf(sessionId)
      if (!existsSync(file)) throw new K8sConsoleError(`会话不存在：${sessionId}`, 'NOT_FOUND', 404)
      try {
        const parsed = JSON.parse(readFileSync(file, 'utf8')) as ChatSession
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.messages)) {
          throw new Error('bad payload')
        }
        return parsed
      } catch {
        throw new K8sConsoleError(`会话文件损坏：${sessionId}`, 'HISTORY_CORRUPT', 500)
      }
    },
    remove(sessionId) {
      if (!isSessionId(sessionId)) return false
      const file = fileOf(sessionId)
      if (!existsSync(file)) return false
      try {
        unlinkSync(file)
        return true
      } catch {
        return false
      }
    },
    clear() {
      ensureDir()
      let removed = 0
      for (const name of readdirSync(historyDir)) {
        if (!SESSION_FILE_RE.test(name)) continue
        try {
          unlinkSync(join(historyDir, name))
          removed += 1
        } catch {
          /* ignore */
        }
      }
      return removed
    },
  }
}
