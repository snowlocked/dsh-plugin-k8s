/**
 * 会话工作区：一个会话 Tab 的内容。
 * 内含两个子页（⌨️ 命令控制台 / 💬 AI 对话），首次打开后保持挂载（display:none
 * 切换），各自状态独立保留；AI 面板生成的命令可直接“发送到控制台执行”。
 */
import { useCallback, useRef, useState } from 'react'
import type { PublicKubeConfig } from './client.ts'
import { ConsoleView } from './ConsoleView.tsx'
import type { ConsoleHandle } from './ConsoleView.tsx'
import { ChatView } from './ChatView.tsx'

export type SessionSub = 'console' | 'chat'

export interface SessionWorkspaceProps {
  kube: PublicKubeConfig
}

export function SessionWorkspace({ kube }: SessionWorkspaceProps): JSX.Element {
  const [sub, setSub] = useState<SessionSub>('console')
  const [seen, setSeen] = useState<{ console: boolean; chat: boolean }>({ console: true, chat: false })
  const consoleRef = useRef<ConsoleHandle>(null)

  const choose = useCallback((next: SessionSub): void => {
    setSub(next)
    setSeen((previous) => (previous[next] ? previous : { ...previous, [next]: true }))
  }, [])

  /** AI 面板“运行命令”→ 切到控制台并直接执行。 */
  const handleAiRun = useCallback((command: string): void => {
    choose('console')
    // 等一帧让控制台从 display:none 恢复布局后再执行
    window.setTimeout(() => {
      consoleRef.current?.runText(command)
    }, 0)
  }, [choose])

  const seg = (value: SessionSub, label: string, hint: string): JSX.Element => (
    <button
      type="button"
      role="tab"
      aria-selected={sub === value}
      title={hint}
      className={sub === value ? 'kc-seg-active' : ''}
      onClick={() => choose(value)}
    >
      {label}
    </button>
  )

  return (
    <div className="kc-workspace">
      <div className="kc-ws-meta">
        <span className="kc-ws-meta-name" title={`kubeconfig 文件：${kube.fileName}`}>⎈ {kube.name}</span>
        <span className="kc-ws-meta-chip" title="当前上下文">{kube.currentContext ?? kube.contextNames.join(', ') ?? '（无）'}</span>
        {kube.server ? <span className="kc-ws-meta-chip kc-ws-meta-server" title="API server">{kube.server}</span> : null}
        <span className="kc-grow" />
        <div className="kc-seg" role="tablist" aria-label="会话子页">
          {seg('console', '⌨️ 命令控制台', '直接执行 kubectl 命令（使用本会话选择的 context / namespace）')}
          {seg('chat', '💬 AI 对话', '多轮对话：生成 kubectl 命令 / 解释输出结果；模型跟随 DSH 配置')}
        </div>
      </div>

      <div className="kc-ws-body">
        {seen.console ? (
          <div className="kc-ws-pane" data-active={sub === 'console' ? 'true' : undefined} style={sub === 'console' ? undefined : { display: 'none' }}>
            <ConsoleView ref={consoleRef} kube={kube} />
          </div>
        ) : null}
        {seen.chat ? (
          <div className="kc-ws-pane" data-active={sub === 'chat' ? 'true' : undefined} style={sub === 'chat' ? undefined : { display: 'none' }}>
            <ChatView kube={kube} onRunCommand={handleAiRun} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
