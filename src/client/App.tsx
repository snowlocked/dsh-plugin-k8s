/**
 * dsh-plugin-k8s 控制台根组件。
 *
 * 布局（IDE 式）：
 *   ┌──────────────────────────────────────────────┐
 *   │ topbar：标题 + kubectl 状态 + 关闭/回到对话       │
 *   ├──────────┬───────────────────────────────────┤
 *   │ 左侧 kubeconfig 管理 │ 右侧会话 Tab 工作区       │
 *   │ · 列表（点击即开会话）│ TabBar（横向/可关闭）     │
 *   │ · ➕ 添加/导入        │ Tab = 一个集群会话：      │
 *   │ · 每行：测试/复制/删除│  ⌨️ 命令控制台 / 💬 AI 对话 │
 *   └──────────┴───────────────────────────────────┘
 *
 * 行为约定：
 *   - 点击任意 kubeconfig → **总是新建一个会话 Tab**（同一 kubeconfig 可重复开多个，
 *     各自命令/AI 状态独立），绝不定位已有 Tab。
 *   - 会话 Tab 内含「⌨️ 命令 / 💬 AI 对话」两个子页（状态各自独立、保持挂载）。
 *   - Tab 可关闭；已打开 Tab 保持挂载（隐藏而非卸载），收起面板再打开状态不丢。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { k8sApi, errText } from './client.ts'
import type { PublicKubeConfig, StateInfo } from './client.ts'
import { KubeSidebar } from './KubeSidebar.tsx'
import { SessionWorkspace } from './SessionWorkspace.tsx'

export interface AppProps {
  onClose?: () => void
  standalone?: boolean
}

interface SessionTab {
  key: string
  kube: PublicKubeConfig
}

let sessionCounter = 0

function nextSessionKey(): string {
  sessionCounter += 1
  return `session_${Date.now().toString(36)}_${sessionCounter}`
}

export default function App(props: AppProps = {}): JSX.Element {
  const [kubeconfigs, setKubeconfigs] = useState<PublicKubeConfig[]>([])
  const [stateInfo, setStateInfo] = useState<StateInfo | null>(null)
  const [busyList, setBusyList] = useState(false)
  const [fatal, setFatal] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error' | 'info'; text: string } | null>(null)
  const firstRun = useRef(true)

  const [tabs, setTabs] = useState<SessionTab[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const flash = useCallback((kind: 'ok' | 'error' | 'info', text: string): void => {
    setNotice({ kind, text })
    window.setTimeout(() => setNotice((current) => (current?.text === text ? null : current)), kind === 'error' ? 6000 : 2600)
  }, [])

  const refresh = useCallback(async (): Promise<void> => {
    setBusyList(true)
    try {
      const [state, { kubeconfigs: list }] = await Promise.all([
        k8sApi.state(true),
        k8sApi.kubeconfigs(),
      ])
      setStateInfo(state)
      setKubeconfigs(list)
      setFatal(null)
    } catch (reason) {
      const text = await errText(reason)
      setFatal(`无法连接插件服务：${text}。请确认已在 DSH 中安装并启用 dsh-plugin-k8s（重启 dsh web 后生效）。`)
      flash('error', `加载失败：${text}`)
    } finally {
      setBusyList(false)
    }
  }, [flash])

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      void refresh()
    }
  }, [refresh])

  // kubeconfig 被删除后：自动关掉它名下所有会话 Tab
  useEffect(() => {
    const valid = new Set(kubeconfigs.map((entry) => entry.id))
    setTabs((previous) => {
      const next = previous.filter((tab) => valid.has(tab.kube.id))
      return next.length === previous.length ? previous : next
    })
  }, [kubeconfigs])

  // active 始终指向存在的 Tab
  useEffect(() => {
    if (activeKey !== null && !tabs.some((tab) => tab.key === activeKey)) {
      setActiveKey(tabs.length > 0 ? tabs[tabs.length - 1]!.key : null)
    }
  }, [tabs, activeKey])

  /** 点击 kubeconfig：总是新建一个会话 Tab（不做去重定位）。 */
  const openSession = useCallback((kube: PublicKubeConfig): void => {
    const next: SessionTab = { key: nextSessionKey(), kube }
    setTabs((previous) => [...previous, next])
    setActiveKey(next.key)
  }, [])

  const closeTab = useCallback((key: string): void => {
    const index = tabs.findIndex((tab) => tab.key === key)
    setTabs((previous) => previous.filter((tab) => tab.key !== key))
    if (activeKey !== key) return
    const right = index >= 0 ? tabs[index + 1] : undefined
    const left = index >= 0 ? tabs[index - 1] : undefined
    setActiveKey((right ?? left)?.key ?? null)
  }, [tabs, activeKey])

  /** Tab 标签：同名 kubeconfig 开多个时追加 #序号。 */
  const tabLabel = (tab: SessionTab, index: number): { title: string; sub: string } => {
    const ordinal = tabs.slice(0, index + 1).filter((item) => item.kube.id === tab.kube.id).length
    const sameCount = tabs.filter((item) => item.kube.id === tab.kube.id).length
    const name = tab.kube.name
    const title = sameCount > 1 ? `${name} #${ordinal}` : name
    const current = tab.kube.currentContext ? ` · ${tab.kube.currentContext}` : ''
    return { title, sub: `${tab.kube.name}${current} — 会话 ${ordinal}` }
  }

  const renderTab = (tab: SessionTab): ReactNode => {
    return <SessionWorkspace key={tab.key} kube={tab.kube} />
  }

  return (
    <div className="kc-app">
      <div className="kc-topbar">
        <div className="kc-title">
          <span className="kc-logo">K8s</span> K8s 控制台
          <span className="kc-badge">dsh-plugin-k8s</span>
          {stateInfo?.kubectl.version ? <span className="kc-badge kc-badge-ok">kubectl {stateInfo.kubectl.version}</span> : null}
          {stateInfo && !stateInfo.kubectl.present
            ? <span className="kc-badge kc-badge-bad" title={stateInfo.kubectl.missingReason}>kubectl 未找到</span>
            : null}
        </div>
        <div className="kc-grow" />
        {notice ? (
          <span className={`kc-notice kc-notice-${notice.kind}`} title={notice.text}>{notice.text}</span>
        ) : null}
        {busyList ? <span className="kc-muted">…</span> : null}
        {props.onClose ? (
          <button onClick={props.onClose} title="关闭面板，回到对话">
            {props.standalone ? '✕ 关闭' : '✕ 回到对话'}
          </button>
        ) : null}
      </div>

      {fatal ? (
        <div className="kc-fatal">
          <div className="kc-fatal-box">
            <div className="kc-fatal-title">⚠️ K8s 控制台暂时不可用</div>
            <div className="kc-fatal-text">{fatal}</div>
            <button onClick={() => { setFatal(null); void refresh() }}>重试</button>
          </div>
        </div>
      ) : (
        <div className="kc-app-body">
          <KubeSidebar
            kubeconfigs={kubeconfigs}
            busyList={busyList}
            refresh={refresh}
            onOpenSession={openSession}
            onFlash={flash}
            stateInfo={stateInfo}
          />

          <div className="kc-main">
            <div className="kc-tabbar" role="tablist" aria-label="已打开的集群会话">
              {tabs.length === 0 ? (
                <span className="kc-muted" style={{ padding: '0 10px', whiteSpace: 'nowrap' }}>
                  点击左侧 kubeconfig 新建会话（同一集群可开多个独立会话）。
                </span>
              ) : null}
              {tabs.map((tab, index) => {
                const { title, sub } = tabLabel(tab, index)
                return (
                  <div
                    key={tab.key}
                    role="tab"
                    aria-selected={tab.key === activeKey}
                    className={`kc-tab${tab.key === activeKey ? ' kc-tab-active' : ''}`}
                    title={`${sub} —— 点击切换，✕ 关闭`}
                    onClick={() => setActiveKey(tab.key)}
                  >
                    <span className="kc-tab-icon">⎈</span>
                    <span className="kc-tab-label">{title}</span>
                    <span
                      className="kc-tab-close"
                      title="关闭"
                      onClick={(event) => {
                        event.stopPropagation()
                        closeTab(tab.key)
                      }}
                    >✕</span>
                  </div>
                )
              })}
            </div>

            <div className="kc-tabpanes">
              {tabs.length === 0 ? (
                <div className="kc-empty" style={{ flex: 1 }}>
                  <div style={{ fontSize: 30, opacity: 0.5 }}>⎈</div>
                  <div>还没有打开任何集群会话。</div>
                  <div style={{ marginTop: 6, fontSize: 12 }} className="kc-muted">
                    左侧点击 kubeconfig 即可新建会话 Tab（重复点击同一集群会再开一个独立会话）；
                    <br />每个会话内含「⌨️ 命令控制台」与「💬 AI 对话」两个子页，各自独立保持状态。
                  </div>
                </div>
              ) : (
                tabs.map((tab) => (
                  <div
                    key={tab.key}
                    role="tabpanel"
                    className="kc-pane"
                    data-active={tab.key === activeKey ? 'true' : undefined}
                    style={tab.key === activeKey ? undefined : { display: 'none' }}
                  >
                    {renderTab(tab)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
