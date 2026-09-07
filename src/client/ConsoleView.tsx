/**
 * ⌨️ 命令控制台：在选定的 kubeconfig + context/namespace 下执行 kubectl 命令。
 * 执行走 SSE 流式输出（实时回显 stdout/stderr），可中止；Enter 运行、Shift+Enter 换行，
 * ↑/↓ 翻阅历史。非交互式执行（不支持需要 TTY 的命令，如 kubectl exec -it）。
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { k8sApi, errText } from './client.ts'
import type { PublicKubeConfig, StreamEvent } from './client.ts'

export interface ConsoleHandle {
  runText(text: string): void
}

export interface ConsoleViewProps {
  kube: PublicKubeConfig
}

type OutEntry =
  | { kind: 'cmd'; text: string }
  | { kind: 'out'; channel: 'stdout' | 'stderr'; text: string }
  | { kind: 'sys'; text: string; tone?: 'ok' | 'err' | 'muted' }
  | { kind: 'err'; text: string }

interface ExitInfo {
  code: number | null
  signal: string | null
  durationMs: number
  truncated: boolean
  reason?: string
}

const MAX_ENTRIES = 800
const EXAMPLES = [
  'get pods -A',
  'get nodes -o wide',
  'get all -n default',
  'logs deploy/xxx -n <ns> --tail=100',
  'describe pod <name> -n <ns>',
  'get events -n <ns> --sort-by=.lastTimestamp',
]

function toneText(reason?: string): string {
  switch (reason) {
    case 'timeout': return '已超时被终止'
    case 'bytes': return '输出超过上限已被截断'
    case 'aborted': return '已手动中止'
    default: return ''
  }
}

export const ConsoleView = forwardRef<ConsoleHandle, ConsoleViewProps>(function ConsoleView({ kube }, ref) {
  const [input, setInput] = useState('')
  const [contextChoice, setContextChoice] = useState('')
  const [namespace, setNamespace] = useState('')
  const [running, setRunning] = useState(false)
  const [entries, setEntries] = useState<OutEntry[]>([])
  const [exitInfo, setExitInfo] = useState<ExitInfo | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [busyNote, setBusyNote] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const execRef = useRef<(text: string) => void>(() => {})

  const push = useCallback((entry: OutEntry): void => {
    setEntries((previous) => {
      const next = [...previous, entry]
      return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next
    })
  }, [])

  // 自动滚到底部（运行中跟随输出）
  useEffect(() => {
    const host = outputRef.current
    if (!host) return
    host.scrollTop = host.scrollHeight
  }, [entries, running, exitInfo])

  const stop = useCallback((): void => {
    abortRef.current?.abort()
  }, [])

  const runText = useCallback(async (raw: string): Promise<void> => {
    const text = raw.trim()
    if (!text || running) return
    const clean = text.split('\n').filter((line) => line.trim() !== '' && !line.trim().startsWith('#')).join('\n').trim()
    if (!clean) return
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    setRunning(true)
    setExitInfo(null)
    setHistoryIndex(-1)
    push({ kind: 'cmd', text: clean })
    setHistory((previous) => [...previous.slice(-99), clean])

    const handleEvent = (event: StreamEvent): void => {
      if (event.type === 'start') {
        push({ kind: 'sys', text: `▶ ${String(event.command ?? `kubectl ${clean}`)}` })
        setBusyNote(`正在执行 ${String(event.command ?? '')} …（可随时中止）`)
      } else if (event.type === 'out') {
        const channel = event.channel === 'stderr' ? 'stderr' : 'stdout'
        const textChunk = typeof event.text === 'string' ? event.text : ''
        if (textChunk) push({ kind: 'out', channel, text: textChunk })
      } else if (event.type === 'exit') {
        const code = typeof event.code === 'number' ? event.code : null
        const signalValue = typeof event.signal === 'string' ? event.signal : null
        const durationMs = typeof event.durationMs === 'number' ? event.durationMs : 0
        const truncated = event.truncated === true
        const reason = typeof event.reason === 'string' ? event.reason : undefined
        setExitInfo({ code, signal: signalValue, durationMs, truncated, reason })
        const extra = toneText(reason)
        if (truncated && !extra) push({ kind: 'sys', text: '输出超过上限已截断', tone: 'err' })
        if (extra) push({ kind: 'sys', text: extra, tone: reason === 'aborted' ? 'muted' : 'err' })
        setBusyNote(null)
      } else if (event.type === 'error') {
        push({ kind: 'err', text: String(event.message ?? '未知错误') })
        setBusyNote(null)
      }
    }

    try {
      await k8sApi.run(
        {
          id: kube.id,
          command: clean,
          context: contextChoice,
          namespace,
        },
        handleEvent,
        signal,
      )
      if (signal.aborted) {
        push({ kind: 'sys', text: '已中止', tone: 'muted' })
        setExitInfo((current) => current ?? { code: null, signal: null, durationMs: 0, truncated: false, reason: 'aborted' })
      }
    } catch (reason) {
      if (signal.aborted) {
        push({ kind: 'sys', text: '已中止', tone: 'muted' })
      } else {
        push({ kind: 'err', text: await errText(reason) })
      }
      setBusyNote(null)
    } finally {
      setRunning(false)
      abortRef.current = null
    }
  }, [kube.id, running, contextChoice, namespace, push])

  execRef.current = runText
  useImperativeHandle(ref, () => ({
    runText(text: string) {
      setInput(text)
      inputRef.current?.focus()
      // 交给最新的 runText（闭包不依赖 render 时的旧值）
      window.setTimeout(() => {
        const current = execRef.current
        if (current) void current(text)
      }, 0)
    },
  }), [])

  const submit = useCallback((): void => {
    void runText(input)
  }, [runText, input])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
      return
    }
    if (event.key === 'ArrowUp' && history.length > 0) {
      const index = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(index)
      setInput(history[index] ?? '')
      event.preventDefault()
    } else if (event.key === 'ArrowDown' && historyIndex >= 0) {
      if (historyIndex >= history.length - 1) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        const index = historyIndex + 1
        setHistoryIndex(index)
        setInput(history[index] ?? '')
      }
      event.preventDefault()
    }
  }, [history, historyIndex, submit])

  const clearOutput = useCallback((): void => {
    setEntries([])
    setExitInfo(null)
  }, [])

  const copyOutput = useCallback(async (): Promise<void> => {
    const text = entries
      .filter((entry) => entry.kind === 'cmd' || entry.kind === 'out')
      .map((entry) => (entry.kind === 'cmd' ? `$ ${entry.text}` : entry.text))
      .join('')
    try {
      await navigator.clipboard.writeText(text)
      setBusyNote('已复制输出')
      window.setTimeout(() => setBusyNote(null), 1500)
    } catch (reason) {
      setBusyNote(`复制失败：${reason instanceof Error ? reason.message : String(reason)}`)
    }
  }, [entries])

  const exitText = (info: ExitInfo): string => {
    const parts: string[] = []
    if (info.reason === 'aborted') parts.push('已中止')
    else if (info.code === 0) parts.push('成功')
    else if (info.code !== null) parts.push(`退出码 ${info.code}`)
    if (info.signal) parts.push(`signal ${info.signal}`)
    parts.push(`${(info.durationMs / 1000).toFixed(2)}s`)
    return parts.join(' · ')
  }

  return (
    <div className="kc-console">
      <div className="kc-console-toolbar">
        <div className="kc-console-env">
          <label title="在该 kubeconfig 的哪些 context 上执行（空 = 使用文件当前上下文）">
            context
            <select value={contextChoice} onChange={(event) => setContextChoice(event.target.value)} disabled={running}>
              <option value="">{kube.currentContext ? `${kube.currentContext}（默认）` : '（默认）'}</option>
              {kube.contextNames.filter((name) => name !== kube.currentContext).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <label title="给命令附加 -n <namespace>（命令里自带 -n 时以命令里的为准）">
            namespace
            <input
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
              placeholder="default"
              disabled={running}
              spellCheck={false}
            />
          </label>
        </div>
        <div className="kc-grow" />
        <button className="kc-btn-sm" onClick={clearOutput} title="清空输出">清空</button>
        <button className="kc-btn-sm" onClick={() => void copyOutput()} title="复制全部命令与输出">复制输出</button>
        <button className="kc-btn-sm" onClick={() => { setInput(EXAMPLES.join('\n')); inputRef.current?.focus() }} title="填入常用示例">示例</button>
      </div>

      <div className="kc-console-input-row">
        <textarea
          ref={inputRef}
          className="kc-code-input kc-command-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'kubectl 命令（可省略前缀 kubectl）\n例如：get pods -A\n\nEnter 执行 · Shift+Enter 换行 · ↑/↓ 历史 · 非交互（logs -f 等长命令请用中止按钮）'}
          spellCheck={false}
          rows={3}
        />
        {running ? (
          <button className="kc-btn-primary kc-btn-stop" onClick={stop} title="中止当前命令">■ 中止</button>
        ) : (
          <button className="kc-btn-primary" onClick={submit} disabled={input.trim() === ''} title="执行（Ctrl+Enter 亦可）">▶ 执行</button>
        )}
      </div>

      {busyNote ? <div className="kc-console-status">{busyNote}</div> : null}

      <div className="kc-output" ref={outputRef}>
        {entries.length === 0 ? (
          <div className="kc-output-empty">
            <div className="kc-muted">
              输入命令开始（{kube.name}
              {contextChoice ? ` · --context ${contextChoice}` : ''}
              {namespace ? ` · -n ${namespace}` : ''}）。
              <br />只读建议：get / describe / logs / top / explain。破坏性命令请自行确认影响。
            </div>
          </div>
        ) : (
          entries.map((entry, index) => {
            if (entry.kind === 'cmd') {
              return <div key={index} className="kc-out-line kc-out-cmd"><span className="kc-out-prompt">$</span> {entry.text}</div>
            }
            if (entry.kind === 'out') {
              return (
                <pre
                  key={index}
                  className={`kc-out-line kc-out-${entry.channel}${entry.text.endsWith('\n') ? '' : ''}`}
                >{entry.text}</pre>
              )
            }
            if (entry.kind === 'err') {
              return <div key={index} className="kc-out-line kc-out-err">✕ {entry.text}</div>
            }
            return <div key={index} className={`kc-out-line kc-out-sys${entry.tone === 'err' ? ' kc-out-err' : ''}${entry.tone === 'muted' ? ' kc-out-muted' : ''}`}>{entry.text}</div>
          })
        )}
      </div>

      {exitInfo ? (
        <div className={`kc-exitbar${exitInfo.reason === 'aborted' ? ' kc-exitbar-muted' : exitInfo.code === 0 ? '' : ' kc-exitbar-err'}`}>
          {exitInfo.reason === 'aborted' ? '⏹ ' : exitInfo.code === 0 ? '✓ ' : '✕ '}{exitText(exitInfo)}
          {exitInfo.truncated ? ' · ⚠️ 输出被截断' : ''}
          {running ? ' · 运行中' : ''}
        </div>
      ) : null}
    </div>
  )
})
