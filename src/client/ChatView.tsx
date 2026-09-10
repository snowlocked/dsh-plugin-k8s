/**
 * 💬 AI 对话：针对当前集群的多轮对话。
 * - 模型可选：枚举 DSH 自身配置的 provider/model（复用 DSH 模型，无需重复填 Key）；
 *   下拉默认“自动（由 DSH 选择）”，按需改选。
 * - 可生成 kubectl 命令（代码块 → 复制 / 一键发送到命令控制台执行），可解释命令或
 *   粘贴的报错/输出（把输出贴进来提问即可）。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { k8sApi, errText, flattenAiModels, formatTime } from './client.ts'
import type { AiModelsPayload, ChatSession, ChatSessionSummary, PublicKubeConfig, StreamEvent } from './client.ts'

export interface ChatViewProps {
  kube: PublicKubeConfig
  onRunCommand: (command: string) => void
}

interface Msg {
  key: number
  role: 'user' | 'assistant'
  content: string
  state?: 'streaming' | 'done' | 'error'
  meta?: { provider?: string; model?: string }
}

let msgCounter = 0
const nextMsgKey = (): number => {
  msgCounter += 1
  return msgCounter
}

/** 取“可执行的那条 kubectl 命令”：优先找 ``` 围栏里的 kubectl 行，再找散行。 */
export function extractKubectlCommand(content: string): string | null {
  const fence = /```(?:bash|sh|shell|kubectl|console)?\s*\n([\s\S]*?)```/g
  let match: RegExpExecArray | null
  while ((match = fence.exec(content)) !== null) {
    const block = match[1] ?? ''
    const line = firstCommandLine(block)
    if (line) return line
  }
  return firstCommandLine(content)
}

function firstCommandLine(block: string): string | null {
  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/^\s*[$>]\s*/, '').trim()
    if (!line || line.startsWith('#')) continue
    if (/^kubectl\b/u.test(line)) return line
  }
  return null
}

interface Segment {
  kind: 'text' | 'code'
  text: string
  lang?: string
}

/** 把回复拆成 text / 代码块段（代码块给 复制 / 运行 按钮）。 */
export function splitSegments(content: string): Segment[] {
  const segments: Segment[] = []
  const fence = /```([\w+-]*)\s*\n([\s\S]*?)```/g
  let cursor = 0
  let match: RegExpExecArray | null
  while ((match = fence.exec(content)) !== null) {
    if (match.index > cursor) segments.push({ kind: 'text', text: content.slice(cursor, match.index) })
    segments.push({ kind: 'code', lang: match[1] || undefined, text: match[2] ?? '' })
    cursor = fence.lastIndex
  }
  if (cursor < content.length) segments.push({ kind: 'text', text: content.slice(cursor) })
  return segments
}

export function ChatView({ kube, onRunCommand }: ChatViewProps): JSX.Element {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [models, setModels] = useState<AiModelsPayload | null>(null)
  const [modelsBusy, setModelsBusy] = useState(false)
  const [modelKey, setModelKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  /** 服务端持久化的对话会话 id（首条消息后创建；载入历史时指向历史会话） */
  const sessionRef = useRef<string | null>(null)
  // 历史抽屉
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyBusy, setHistoryBusy] = useState(false)
  const [historyAllClusters, setHistoryAllClusters] = useState(false)
  const [historyKeyword, setHistoryKeyword] = useState('')
  const [historySessions, setHistorySessions] = useState<ChatSessionSummary[]>([])
  const [historyDetail, setHistoryDetail] = useState<ChatSession | null>(null)

  const loadModels = useCallback(async (): Promise<void> => {
    setModelsBusy(true)
    try {
      setModels(await k8sApi.aiModels())
    } catch (reason) {
      setModels(null)
      setError(`模型枚举失败：${await errText(reason)}`)
    } finally {
      setModelsBusy(false)
    }
  }, [])

  useEffect(() => {
    void loadModels()
  }, [loadModels])

  const modelOptions = useMemo(() => (models ? flattenAiModels(models) : []), [models])
  const selectedModel = useMemo(
    () => modelOptions.find((option) => option.key === modelKey),
    [modelOptions, modelKey],
  )

  // 自动滚到底部（含流式过程）
  useEffect(() => {
    const host = scrollRef.current
    if (!host) return
    host.scrollTop = host.scrollHeight
  }, [messages])

  const appendMessage = useCallback((msg: Omit<Msg, 'key'>): void => {
    setMessages((previous) => [...previous, { ...msg, key: nextMsgKey() }])
  }, [])

  const updateLastAssistant = useCallback((patch: Partial<Msg>): void => {
    setMessages((previous) => {
      if (previous.length === 0) return previous
      const last = previous[previous.length - 1]!
      if (last.role !== 'assistant') return previous
      const next: Msg = { ...last, ...patch }
      if (patch.content && typeof patch.content === 'string') {
        next.content = last.content + patch.content
      }
      const copy = [...previous]
      copy[copy.length - 1] = next
      return copy
    })
  }, [])

  const stop = useCallback((): void => {
    abortRef.current?.abort()
  }, [])

  /** 把一条消息落库到服务端历史（失败不影响对话本身）。返回是否成功。 */
  const saveMessage = useCallback(async (message: {
    role: 'user' | 'assistant'
    content: string
    provider?: string
    model?: string
    error?: boolean
  }): Promise<void> => {
    try {
      const result = await k8sApi.historyAppend({
        ...(sessionRef.current ? { sessionId: sessionRef.current } : {}),
        kubeId: kube.id,
        kubeName: kube.name,
        context: kube.currentContext,
        message: { role: message.role, content: message.content, at: new Date().toISOString(), ...(message.provider ? { provider: message.provider } : {}), ...(message.model ? { model: message.model } : {}), ...(message.error === true ? { error: true } : {}) },
      })
      sessionRef.current = result.sessionId
    } catch {
      /* 历史保存失败静默：不打断对话 */
    }
  }, [kube.id, kube.name, kube.currentContext])

  const send = useCallback(async (): Promise<void> => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setError(null)

    // 当前完整历史（不含正在流的 assistant 草稿）
    const history = messages
      .filter((msg) => msg.role === 'user' || msg.state === 'done')
      .map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))
    history.push({ role: 'user', content: text })
    appendMessage({ role: 'user', content: text })
    appendMessage({ role: 'assistant', content: '', state: 'streaming' })
    setBusy(true)
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    void saveMessage({ role: 'user', content: text })

    // 流式期间本地累积 assistant 输出（state 更新是异步的，历史保存用本地副本）
    let acc = ''
    let doneProvider: string | undefined
    let doneModel: string | undefined
    let streamError: string | null = null

    try {
      await k8sApi.chat(
        {
          id: kube.id,
          provider: selectedModel?.provider,
          model: selectedModel?.model,
          history: history.slice(-40),
        },
        (event: StreamEvent) => {
          if (event.type === 'delta' && typeof event.text === 'string') {
            acc += event.text
            updateLastAssistant({ content: event.text })
          } else if (event.type === 'done') {
            if (typeof event.provider === 'string') doneProvider = event.provider
            if (typeof event.model === 'string') doneModel = event.model
            updateLastAssistant({
              state: 'done',
              meta: {
                ...(doneProvider ? { provider: doneProvider } : {}),
                ...(doneModel ? { model: doneModel } : {}),
              },
            })
          } else if (event.type === 'aborted') {
            updateLastAssistant({ state: 'done' })
          } else if (event.type === 'error') {
            streamError = String(event.message ?? 'AI 出错')
            updateLastAssistant({ state: 'error', content: `⚠️ ${streamError}` })
          }
        },
        signal,
      )
    } catch (reason) {
      if (signal.aborted) {
        updateLastAssistant({ state: 'done' })
      } else {
        streamError = await errText(reason)
        updateLastAssistant({ state: 'error', content: `⚠️ ${streamError}` })
      }
    } finally {
      setBusy(false)
      abortRef.current = null
      // 落库本条 assistant 回复（有内容或报错才存；中止时保留已生成的部分）
      if (acc.trim() !== '' || streamError) {
        void saveMessage({
          role: 'assistant',
          content: streamError ? `⚠️ ${streamError}` : acc,
          ...(doneProvider ? { provider: doneProvider } : {}),
          ...(doneModel ? { model: doneModel } : {}),
          ...(streamError ? { error: true } : {}),
        })
      }
    }
  }, [input, busy, messages, selectedModel, kube.id, appendMessage, updateLastAssistant, saveMessage])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void send()
    }
  }, [send])

  const clearChat = useCallback((): void => {
    if (busy) stop()
    setMessages([])
    setError(null)
    sessionRef.current = null // 后续消息写入新的历史会话
  }, [busy, stop])

  /* ---------------- 历史抽屉 ---------------- */

  const refreshHistory = useCallback(async (keyword?: string): Promise<void> => {
    setHistoryBusy(true)
    try {
      const result = await k8sApi.historyList({
        ...(keyword && keyword.trim() !== '' ? { keyword: keyword.trim() } : {}),
        ...(!historyAllClusters ? { kubeId: kube.id } : {}),
        limit: 100,
      })
      setHistorySessions(result.sessions ?? [])
      setHistoryDetail(null)
    } catch (reason) {
      setError(`历史加载失败：${await errText(reason)}`)
    } finally {
      setHistoryBusy(false)
    }
  }, [historyAllClusters, kube.id])

  const toggleHistory = useCallback((): void => {
    const next = !historyOpen
    setHistoryOpen(next)
    if (next) void refreshHistory(historyKeyword)
  }, [historyOpen, refreshHistory, historyKeyword])

  const searchHistory = useCallback(async (): Promise<void> => {
    await refreshHistory(historyKeyword)
  }, [refreshHistory, historyKeyword])

  const openHistoryDetail = useCallback(async (sessionId: string): Promise<void> => {
    if (historyDetail?.id === sessionId) {
      setHistoryDetail(null)
      return
    }
    setHistoryBusy(true)
    try {
      const result = await k8sApi.historyGet(sessionId)
      setHistoryDetail(result.session)
    } catch (reason) {
      setError(`历史会话读取失败：${await errText(reason)}`)
    } finally {
      setHistoryBusy(false)
    }
  }, [historyDetail])

  /** 载入历史会话到当前对话区，并继续往该会话追加新消息。 */
  const loadHistorySession = useCallback((session: ChatSession): void => {
    if (busy) return // 正在生成时不载入，避免半截回复写进历史会话
    setMessages(session.messages.map((message) => ({
      key: nextMsgKey(),
      role: message.role,
      content: message.content,
      state: message.error ? ('error' as const) : ('done' as const),
      ...(message.provider || message.model
        ? { meta: { ...(message.provider ? { provider: message.provider } : {}), ...(message.model ? { model: message.model } : {}) } }
        : {}),
    })))
    sessionRef.current = session.id
    setHistoryOpen(false)
    setError(null)
    inputRef.current?.focus()
  }, [busy])

  const deleteHistorySession = useCallback(async (sessionId: string): Promise<void> => {
    if (!window.confirm('确定删除这条历史会话？删除后不可恢复。')) return
    try {
      await k8sApi.historyDelete(sessionId)
      if (sessionRef.current === sessionId) sessionRef.current = null
      if (historyDetail?.id === sessionId) setHistoryDetail(null)
      await refreshHistory(historyKeyword)
    } catch (reason) {
      setError(`历史会话删除失败：${await errText(reason)}`)
    }
  }, [historyDetail, refreshHistory, historyKeyword])

  const lastAssistant = [...messages].reverse().find((msg) => msg.role === 'assistant' && msg.state === 'done')
  const lastCommand = lastAssistant ? extractKubectlCommand(lastAssistant.content) : null

  const copyText = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* 剪贴板不可用时忽略 */
    }
  }, [])

  const renderContent = (msg: Msg): JSX.Element => {
    if (msg.role === 'user') return <div className="kc-chat-user-text">{msg.content}</div>
    if (msg.state === 'error') return <div className="kc-chat-error-text">{msg.content}</div>
    const segments = splitSegments(msg.content)
    return (
      <div className="kc-chat-ai-text">
        {segments.length === 0 ? (
          msg.state === 'streaming' ? <span className="kc-chat-cursor">▍</span> : <span className="kc-muted">（空回复）</span>
        ) : (
          segments.map((segment, index) => {
            if (segment.kind === 'text') {
              return <span key={index} className="kc-chat-text-span">{segment.text}</span>
            }
            const command = segment.lang === undefined || /^(bash|sh|shell|kubectl|console)$/u.test(segment.lang)
              ? firstCommandLine(segment.text)
              : null
            return (
              <div key={index} className="kc-codebox">
                <div className="kc-codebox-head">
                  <span className="kc-codebox-lang">{segment.lang || 'code'}</span>
                  <span className="kc-grow" />
                  <button className="kc-btn-sm" onClick={() => void copyText(segment.text)}>复制</button>
                  {command ? (
                    <button className="kc-btn-sm" onClick={() => onRunCommand(command)} title={`发送到命令控制台执行：${command}`}>▶ 运行</button>
                  ) : null}
                </div>
                <pre className="kc-codebox-body">{segment.text}</pre>
              </div>
            )
          })
        )}
        {msg.state === 'streaming' && segments.length > 0 ? <span className="kc-chat-cursor">▍</span> : null}
      </div>
    )
  }

  return (
    <div className="kc-chat">
      <div className="kc-chat-toolbar">
        <label title="复用 DSH 已配置的模型；空 = 让 DSH 自动选择">
          AI 模型
          <select value={modelKey} onChange={(event) => setModelKey(event.target.value)} disabled={busy || modelsBusy}>
            <option value="">自动（由 DSH 选择）</option>
            {modelOptions.map((option) => (
              <option key={option.key} value={option.key}>{option.label ?? option.key}</option>
            ))}
          </select>
        </label>
        <button className="kc-btn-sm" onClick={() => void loadModels()} disabled={modelsBusy} title="重新枚举 DSH 模型">↻ 模型</button>
        <button className={`kc-btn-sm${historyOpen ? ' kc-btn-sm-active' : ''}`} onClick={toggleHistory} title="查看 / 搜索已保存的历史对话（逐条落盘，刷新与重启后仍可查询）">🕘 历史</button>
        <button className="kc-btn-sm" onClick={clearChat} disabled={messages.length === 0 && !busy} title="清空本会话对话（开启新一轮，历史仍保留）">清空对话</button>
        <span className="kc-grow" />
        <span className="kc-chat-cluster" title="AI 系统提示中会携带该集群信息">
          ⎈ {kube.name} · {kube.currentContext ?? ''}
          {kube.server ? ` · ${kube.server.replace(/^https?:\/\//u, '')}` : ''}
        </span>
      </div>

      {models && !models.ok ? (
        <div className="kc-chat-warn">
          ⚠️ {models.message ?? '没有可用模型'}（配置好后点“↻ 模型”刷新）
        </div>
      ) : null}
      {error ? <div className="kc-chat-warn">⚠️ {error}</div> : null}

      {historyOpen ? (
        <div className="kc-history">
          <div className="kc-history-head">
            <b>🕘 对话历史</b>
            <label className="kc-history-all" title="取消勾选则只看当前集群的历史">
              <input
                type="checkbox"
                checked={historyAllClusters}
                onChange={(event) => {
                  const checked = event.target.checked
                  setHistoryAllClusters(checked)
                  window.setTimeout(() => {
                    void (async () => {
                      setHistoryBusy(true)
                      try {
                        const result = await k8sApi.historyList({
                          ...(historyKeyword.trim() !== '' ? { keyword: historyKeyword.trim() } : {}),
                          ...(!checked ? { kubeId: kube.id } : {}),
                          limit: 100,
                        })
                        setHistorySessions(result.sessions ?? [])
                        setHistoryDetail(null)
                      } catch {
                        /* 静默：列表失败不阻塞对话 */
                      } finally {
                        setHistoryBusy(false)
                      }
                    })()
                  }, 0)
                }}
              />
              全部集群
            </label>
            <span className="kc-grow" />
            <span className="kc-muted">{historySessions.length} 条会话</span>
            <button className="kc-btn-sm" onClick={toggleHistory} title="关闭历史面板">✕</button>
          </div>
          <div className="kc-history-search">
            <input
              value={historyKeyword}
              onChange={(event) => setHistoryKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  void searchHistory()
                }
              }}
              placeholder="搜索历史消息关键词（回车搜索）…"
              spellCheck={false}
            />
            <button className="kc-btn-sm" onClick={() => void searchHistory()} disabled={historyBusy}>搜索</button>
            <button
              className="kc-btn-sm"
              onClick={() => {
                setHistoryKeyword('')
                void refreshHistory('')
              }}
              disabled={historyBusy}
              title="清空关键词并刷新"
            >
              重置
            </button>
          </div>
          <div className="kc-history-list">
            {historyBusy && historySessions.length === 0 ? <div className="kc-muted">加载中…</div> : null}
            {!historyBusy && historySessions.length === 0 ? (
              <div className="kc-muted">暂无历史会话。发出的对话会自动逐条保存（服务端落盘），刷新 / 重启后仍可在此搜索查询。</div>
            ) : null}
            {historySessions.map((session) => (
              <div key={session.id} className={`kc-history-item${historyDetail?.id === session.id ? ' kc-history-item-open' : ''}`}>
                <div className="kc-history-item-main" onClick={() => void openHistoryDetail(session.id)} title="点击展开完整记录">
                  <div className="kc-history-item-title">{session.preview || '（无文字内容）'}</div>
                  <div className="kc-history-item-meta">
                    ⎈ {session.kubeName} · {session.messageCount} 条 · {formatTime(session.updatedAt)}
                  </div>
                  {session.snippet ? <div className="kc-history-item-snippet">命中：{session.snippet}</div> : null}
                </div>
                <div className="kc-history-item-actions">
                  <button
                    className="kc-btn-sm"
                    title="载入到对话区并继续追问（新消息会继续保存到该会话）"
                    disabled={busy}
                    onClick={() => {
                      void (async () => {
                        try {
                          const detail = historyDetail?.id === session.id
                            ? historyDetail
                            : (await k8sApi.historyGet(session.id)).session
                          loadHistorySession(detail)
                        } catch (reason) {
                          setError(`历史会话读取失败：${await errText(reason)}`)
                        }
                      })()
                    }}
                  >
                    载入
                  </button>
                  <button className="kc-btn-sm kc-history-delete" onClick={() => void deleteHistorySession(session.id)} title="删除该历史会话">删除</button>
                </div>
                {historyDetail?.id === session.id ? (
                  <div className="kc-history-detail">
                    {historyDetail.messages.map((message, index) => (
                      <div key={index} className={`kc-history-msg kc-history-msg-${message.role}${message.error ? ' kc-history-msg-error' : ''}`}>
                        <span className="kc-history-msg-role">{message.role === 'user' ? '🧑' : '🤖'}</span>
                        <div className="kc-history-msg-body">
                          {splitSegments(message.content).map((segment, sIndex) =>
                            segment.kind === 'code'
                              ? <pre key={sIndex} className="kc-history-msg-code">{segment.text}</pre>
                              : <span key={sIndex}>{segment.text}</span>,
                          )}
                          {message.provider || message.model ? (
                            <div className="kc-history-msg-meta">{message.provider ?? ''}{message.model ? `/${message.model}` : ''} · {formatTime(message.at)}</div>
                          ) : (
                            <div className="kc-history-msg-meta">{formatTime(message.at)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="kc-chat-scroll" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="kc-chat-empty">
            <div className="kc-muted" style={{ maxWidth: 460 }}>
              针对当前集群（{kube.name}）提问，例如：
              <br />· “查看 default 命名空间下所有 deployment 及其状态”
              <br />· “找出 ImagePullBackOff 的 pod，并解释怎么排查”
              <br />· “生成把 myapp 缩到 2 副本的命令”
              <br />· “粘贴一条 kubectl 报错，帮我解释原因”
              <br /><br />AI 生成的可执行命令会在代码块下方提供 <b>▶ 运行</b>，点击后切到命令控制台直接执行。
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.key} className={`kc-chat-row kc-chat-${msg.role}`}>
              <div className="kc-chat-avatar">{msg.role === 'user' ? '🧑' : '🤖'}</div>
              <div className="kc-chat-bubble">
                {renderContent(msg)}
                {msg.state === 'done' && msg.meta && (msg.meta.provider || msg.meta.model) ? (
                  <div className="kc-chat-meta">{msg.meta.provider}/{msg.meta.model}</div>
                ) : null}
              </div>
            </div>
          ))
        )}
        {lastCommand && !busy ? (
          <div className="kc-chat-quickrun">
            💡 可用命令：<code>{lastCommand}</code>
            <button className="kc-btn-sm" onClick={() => onRunCommand(lastCommand)}>▶ 发送到控制台执行</button>
          </div>
        ) : null}
      </div>

      <div className="kc-chat-input-row">
        <textarea
          ref={inputRef}
          className="kc-code-input kc-chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="问 AI：生成 kubectl 命令 / 解释输出 / 排查报错…（Enter 发送，Shift+Enter 换行）"
          spellCheck={false}
          rows={2}
        />
        {busy ? (
          <button className="kc-btn-primary kc-btn-stop" onClick={stop}>■ 停止</button>
        ) : (
          <button className="kc-btn-primary" onClick={() => void send()} disabled={input.trim() === ''}>发送</button>
        )}
      </div>
    </div>
  )
}
