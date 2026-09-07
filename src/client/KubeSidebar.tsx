/**
 * 左侧栏：kubeconfig 管理（列表 + 添加/导入 + 每行 测试/复制/删除）+ kubectl 状态。
 * 点击列表行 = 新建一个会话 Tab（由 App.openSession 处理，永远新建）。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { k8sApi, errText, formatBytes, formatTime } from './client.ts'
import type { PublicKubeConfig, StateInfo } from './client.ts'

export interface KubeSidebarProps {
  kubeconfigs: PublicKubeConfig[]
  busyList: boolean
  refresh: () => Promise<void>
  onOpenSession: (kube: PublicKubeConfig) => void
  onFlash: (kind: 'ok' | 'error' | 'info', text: string) => void
  stateInfo: StateInfo | null
}

interface AddDraft {
  open: boolean
  name: string
  mode: 'paste' | 'path'
  content: string
  filePath: string
  busy: boolean
  error: string | null
}

const EMPTY_DRAFT: AddDraft = { open: false, name: '', mode: 'paste', content: '', filePath: '', busy: false, error: null }

export function KubeSidebar(props: KubeSidebarProps): JSX.Element {
  const { kubeconfigs, busyList, refresh, onOpenSession, onFlash } = props
  const [draft, setDraft] = useState<AddDraft>(EMPTY_DRAFT)
  const [rowBusy, setRowBusy] = useState<string | null>(null)
  const probe = props.stateInfo?.kubectl
  const contentAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (draft.open && draft.mode === 'paste') contentAreaRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.open, draft.mode])

  const patch = useCallback((patch: Partial<AddDraft>): void => {
    setDraft((previous) => ({ ...previous, ...patch }))
  }, [])

  const closeAdd = useCallback((): void => {
    setDraft(EMPTY_DRAFT)
  }, [])

  const submitAdd = useCallback(async (): Promise<void> => {
    if (draft.busy) return
    const name = draft.name.trim()
    if (!name) {
      patch({ error: '请填写 kubeconfig 名称（显示用）' })
      return
    }
    if (draft.mode === 'paste' && draft.content.trim() === '') {
      patch({ error: '请粘贴 kubeconfig 内容，或改用“本机文件导入”' })
      return
    }
    if (draft.mode === 'path' && draft.filePath.trim() === '') {
      patch({ error: '请填写本机 kubeconfig 文件路径（如 D:\\path\\dev.yaml）' })
      return
    }
    patch({ busy: true, error: null })
    try {
      await k8sApi.save({
        name,
        content: draft.mode === 'paste' ? draft.content : undefined,
        filePath: draft.mode === 'path' ? draft.filePath : undefined,
      })
      closeAdd()
      onFlash('ok', `已保存 kubeconfig「${name}」`)
      void refresh()
    } catch (reason) {
      patch({ error: await errText(reason) })
    } finally {
      patch({ busy: false })
    }
  }, [draft, patch, closeAdd, onFlash, refresh])

  const removeKube = useCallback(async (kube: PublicKubeConfig): Promise<void> => {
    const confirmed = window.confirm(`删除 kubeconfig「${kube.name}」？\n\n该操作会移除本地保存的文件副本（含访问凭据），并关闭它的所有会话 Tab。`)
    if (!confirmed) return
    setRowBusy(`rm:${kube.id}`)
    try {
      const { ok } = await k8sApi.remove(kube.id)
      if (ok) {
        onFlash('info', `已删除「${kube.name}」`)
        void refresh()
      } else {
        onFlash('error', '删除失败：服务端未确认')
      }
    } catch (reason) {
      onFlash('error', `删除失败：${await errText(reason)}`)
    } finally {
      setRowBusy(null)
    }
  }, [onFlash, refresh])

  const checkKube = useCallback(async (kube: PublicKubeConfig): Promise<void> => {
    setRowBusy(`check:${kube.id}`)
    try {
      const result = await k8sApi.check(kube.id)
      onFlash(result.ok ? 'ok' : 'error', `「${kube.name}」${result.ok ? '✅ 集群可达' : '❌ 不可达'}：${result.message}`)
    } catch (reason) {
      onFlash('error', `「${kube.name}」检查失败：${await errText(reason)}`)
    } finally {
      setRowBusy(null)
      void refresh()
    }
  }, [onFlash, refresh])

  const copyRaw = useCallback(async (kube: PublicKubeConfig): Promise<void> => {
    setRowBusy(`copy:${kube.id}`)
    try {
      const { content } = await k8sApi.raw(kube.id)
      await navigator.clipboard.writeText(content)
      onFlash('ok', `已复制「${kube.name}」完整 kubeconfig 到剪贴板（含凭据，注意保管）`)
    } catch (reason) {
      onFlash('error', `复制失败：${await errText(reason)}`)
    } finally {
      setRowBusy(null)
    }
  }, [onFlash])

  return (
    <div className="kc-nav">
      <div className="kc-nav-head">
        <span className="kc-nav-title">kubeconfig</span>
        <span className="kc-nav-count">{kubeconfigs.length}</span>
        <span className="kc-grow" />
        <button
          className="kc-btn-sm"
          onClick={() => { patch({ ...EMPTY_DRAFT, open: true }); }}
          title="添加 kubeconfig（粘贴内容或导入本机文件）"
        >➕ 添加</button>
        <button className="kc-btn-sm" onClick={() => void refresh()} disabled={busyList} title="刷新列表">↻</button>
      </div>

      {probe && !probe.present ? (
        <div className="kc-warnbox" title={probe.missingReason}>
          <div className="kc-warnbox-title">⚠️ kubectl 不可用</div>
          <div className="kc-warnbox-text">{probe.missingReason}</div>
        </div>
      ) : null}

      <div className="kc-nav-list">
        {kubeconfigs.length === 0 ? (
          <div className="kc-nav-empty">
            {busyList ? '加载中…' : '还没有 kubeconfig。\n点右上角 ➕ 添加（粘贴内容或导入本机文件）。'}
          </div>
        ) : null}
        {kubeconfigs.map((kube) => {
          const busy = rowBusy === `rm:${kube.id}` || rowBusy === `check:${kube.id}` || rowBusy === `copy:${kube.id}`
          return (
            <div key={kube.id} className="kc-conn" title={`点击新建会话（同一集群可开多个）`}>
              <button
                type="button"
                className="kc-conn-main"
                onClick={() => onOpenSession(kube)}
                disabled={busyList}
              >
                <span className="kc-conn-name">{kube.name}</span>
                <span className="kc-conn-sub">
                  {kube.currentContext ?? kube.contextNames[0] ?? '（无 context）'}
                  {kube.contextNames.length > 1 ? `（共 ${kube.contextNames.length} 个 context）` : ''}
                </span>
                <span className="kc-conn-server" title="API server">{kube.server ?? ''}</span>
                {kube.lastCheckError
                  ? <span className="kc-conn-state kc-conn-state-bad" title={`上次检查失败：${kube.lastCheckError}`}>✕</span>
                  : kube.lastCheckedAt
                    ? <span className="kc-conn-state kc-conn-state-ok" title={`上次检查 ${formatTime(kube.lastCheckedAt)}`}>✓</span>
                    : null}
              </button>
              <span className="kc-conn-actions">
                <button
                  className="kc-icon-btn"
                  title="测试连通（kubectl get --raw=/version）"
                  disabled={busy}
                  onClick={() => void checkKube(kube)}
                >{busy && rowBusy === `check:${kube.id}` ? '…' : '测'}</button>
                <button
                  className="kc-icon-btn"
                  title="复制完整 kubeconfig（含凭据）"
                  disabled={busy}
                  onClick={() => void copyRaw(kube)}
                >{busy && rowBusy === `copy:${kube.id}` ? '…' : '⧉'}</button>
                <button
                  className="kc-icon-btn kc-icon-btn-danger"
                  title={`删除（${formatBytes(kube.size)}，更新于 ${formatTime(kube.updatedAt)}）`}
                  disabled={busy}
                  onClick={() => void removeKube(kube)}
                >✕</button>
              </span>
            </div>
          )
        })}
      </div>

      <div className="kc-nav-foot">
        <div className="kc-muted" style={{ fontSize: 11, lineHeight: 1.6 }}>
          数据目录：{props.stateInfo?.dataDir ?? '…'}
          {probe?.present && probe.version ? <div>kubectl {probe.version}</div> : null}
        </div>
      </div>

      {draft.open ? (
        <div className="kc-modal-mask" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAdd() }}>
          <div className="kc-modal">
            <div className="kc-modal-title">➕ 添加 kubeconfig</div>
            <div className="kc-field">
              <label>名称（显示用）</label>
              <input
                value={draft.name}
                onChange={(event) => patch({ name: event.target.value, error: null })}
                placeholder="例如：development / dev"
                autoFocus
              />
            </div>
            <div className="kc-seg" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={draft.mode === 'paste'}
                className={draft.mode === 'paste' ? 'kc-seg-active' : ''}
                onClick={() => patch({ mode: 'paste' })}
              >📋 粘贴内容</button>
              <button
                type="button"
                role="tab"
                aria-selected={draft.mode === 'path'}
                className={draft.mode === 'path' ? 'kc-seg-active' : ''}
                onClick={() => patch({ mode: 'path' })}
              >📁 导入本机文件</button>
            </div>

            {draft.mode === 'paste' ? (
              <div className="kc-field">
                <label>kubeconfig 内容（YAML）</label>
                <textarea
                  ref={contentAreaRef}
                  className="kc-code-input"
                  rows={10}
                  value={draft.content}
                  onChange={(event) => patch({ content: event.target.value, error: null })}
                  placeholder={'apiVersion: v1\nkind: Config\nclusters:\n- name: "dev"\n  cluster:\n    server: "https://…"\n…'}
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="kc-field">
                <label>本机文件路径</label>
                <input
                  value={draft.filePath}
                  onChange={(event) => patch({ filePath: event.target.value, error: null })}
                  placeholder={'D:\\Users\\wuzan\\.kube\\configs\\dev.yaml'}
                  spellCheck={false}
                />
                <div className="kc-muted" style={{ fontSize: 11, marginTop: 4 }}>
                  读取该路径的内容并保存副本到插件数据目录（支持 .yaml/.yml/.config）。修改原文件不会同步 —— 想用新版请删除后重新导入。
                </div>
              </div>
            )}

            {draft.error ? <div className="kc-form-error">{draft.error}</div> : null}
            <div className="kc-modal-actions">
              <button onClick={closeAdd} disabled={draft.busy}>取消</button>
              <button className="kc-btn-primary" onClick={() => void submitAdd()} disabled={draft.busy}>
                {draft.busy ? '保存并解析…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
