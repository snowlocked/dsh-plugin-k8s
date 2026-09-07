/**
 * 💬 AI 对话：针对当前集群的多轮对话。
 * - 模型可选：枚举 DSH 自身配置的 provider/model（复用 DSH 模型，无需重复填 Key）；
 *   下拉默认“自动（由 DSH 选择）”，按需改选。
 * - 可生成 kubectl 命令（代码块 → 复制 / 一键发送到命令控制台执行），可解释命令或
 *   粘贴的报错/输出（把输出贴进来提问即可）。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { k8sApi, errText, flattenAiModels } from './client.ts'
import type { AiModelsPayload, PublicKubeConfig, StreamEvent } from './client.ts'

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
            updateLastAssistant({ content: event.text })
          } else if (event.type === 'done') {
            updateLastAssistant({
              state: 'done',
              meta: {
                ...(typeof event.provider === 'string' ? { provider: event.provider } : {}),
                ...(typeof event.model === 'string' ? { model: event.model } : {}),
              },
            })
          } else if (event.type === 'aborted') {
            updateLastAssistant({ state: 'done' })
          } else if (event.type === 'error') {
            updateLastAssistant({ state: 'error', content: `⚠️ ${String(event.message ?? 'AI 出错')}` })
          }
        },
        signal,
      )
    } catch (reason) {
      if (signal.aborted) {
        updateLastAssistant({ state: 'done' })
      } else {
        const text2 = await errText(reason)
        updateLastAssistant({ state: 'error', content: `⚠️ ${text2}` })
      }
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }, [input, busy, messages, selectedModel, kube.id, appendMessage, updateLastAssistant])

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
  }, [busy, stop])

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
        <button className="kc-btn-sm" onClick={clearChat} disabled={messages.length === 0 && !busy} title="清空本会话对话">清空对话</button>
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
