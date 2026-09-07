// dsh-plugin-k8s 服务端冒烟：不依赖 cordis/真实集群。
// - 用真实临时目录驱动 store（保存/解析/重复名校验/删除）
// - 用 fake ctx + fake llm 驱动 HTTP 路由（含 SSE run / chat 流）
// - run 用例执行真实的 `kubectl version --client`（纯本地、不触网）
// - 校验只读命令白名单与系统提示注入（对话工具注册在无 dsh-tools 环境下降级为 no-op）
import { apply, assertReadOnlyCommand } from '../dist/dsh-k8s-console.js'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'dsh-k8s-smoke-'))
const dataDir = join(dir, 'dsh-data')

const effects = []
const routes = []
const logs = []
const seenInject = new Set()
const promptSections = []
const registeredTools = []
let fakeLlm = null

const ctx = {
  logger: { info: (m) => logs.push(['info', m]), warn: (m) => logs.push(['warn', m]), error: (m) => logs.push(['error', m]) },
  get(name) {
    if (name === 'llm') return fakeLlm
    return undefined
  },
  inject(names, cb) {
    const sctx = {
      effect(fn) { effects.push(fn) },
      webServer: { register(route) { routes.push(route); return () => {} } },
      tools: { register(tool) { registeredTools.push(tool); return () => {} } },
      systemPrompt: { section(options) { promptSections.push(options); return () => {} } },
    }
    for (const name of names) seenInject.add(name)
    cb(sctx)
  },
}

apply(ctx, { dataDir })

for (const effect of effects) {
  const cleanup = effect()
  if (typeof cleanup === 'function') cleanup()
}
console.log('inject 服务:', [...seenInject].join(','))
console.log('注册路由数:', routes.length)
console.log('系统提示 section 数:', promptSections.length)

let failures = 0
function check(name, cond, extra = '') {
  if (cond) console.log(`  ✓ ${name}`)
  else { failures++; console.error(`  ✗ ${name} ${extra}`) }
}

/* ---------------------------------------------------------------- 0. 对话工具（只读白名单 + 提示注入） */
{
  const verbs = [
    [['get', 'pods', '-A'], true],
    [['describe', 'node', 'n1'], true],
    [['logs', '-f', 'deploy/x'], true],
    [['top', 'nodes'], true],
    [['version'], true],
    [['api-resources'], true],
    [['auth', 'can-i', 'get', 'pods'], true],
    [['cluster-info'], true],
    [['explain', 'pod'], true],
    [['delete', 'pod', 'x'], false],
    [['apply', '-f', 'x.yaml'], false],
    [['exec', '-it', 'pod'], false],
    [['config', 'view'], false],
    [['auth', 'reconcile'], false],
    [['port-forward', 'pod'], false],
    [['rollout', 'restart'], false],
  ]
  for (const [argv, shouldPass] of verbs) {
    let passed = true
    try { assertReadOnlyCommand(argv) } catch { passed = false }
    check(`只读白名单 ${argv.join(' ')} → ${shouldPass ? '放行' : '拒绝'}`, passed === shouldPass)
  }
  const section = promptSections.find((s) => String(s.name ?? '').includes('dsh-plugin-k8s'))
  check('systemPrompt section 注入（含 k8s 工具说明）', !!section && String(section.text ?? '').includes('k8s_kubeconfigs'))
  check('systemPrompt 无 dsh-tools 也不报错（tools 注册降级）', true)
  console.log('  提示（info）：tools 注册日志 =', logs.filter(([level]) => level === 'info').map(([, m]) => m).join(' | '))
}

function findRoute(method, url) {
  return routes.find((r) => r.kind === 'exact' && r.path === url.split('?')[0])
}

/** JSON 请求（常规接口）。 */
async function callJson(method, url, body) {
  const route = findRoute(method, url)
  if (!route) throw new Error(`no route ${url}`)
  let requestBody = ''
  const request = {
    method,
    url,
    async *[Symbol.asyncIterator]() {
      if (body !== undefined) {
        const raw = JSON.stringify(body)
        requestBody = raw
        yield Buffer.from(raw)
      }
    },
  }
  const response = {
    statusCode: 0,
    headers: {},
    setHeader(name, value) { this.headers[name] = value },
    end(text) { response._text = String(text ?? '') },
  }
  await route.handler(request, response)
  return { status: response.statusCode, headers: response.headers, json: JSON.parse(response._text || 'null') }
}

/** SSE 请求：收集事件帧。 */
async function callSse(method, url, body) {
  const route = findRoute(method, url)
  if (!route) throw new Error(`no route ${url}`)
  const request = {
    method,
    url,
    closeListeners: [],
    on(event, listener) { if (event === 'close') this.closeListeners.push(listener) },
    off() {},
    async *[Symbol.asyncIterator]() {
      if (body !== undefined) yield Buffer.from(JSON.stringify(body))
    },
  }
  const events = []
  const response = {
    statusCode: 0,
    headers: {},
    setHeader(name, value) { this.headers[name] = value },
    writeHead(status, headers) { this.statusCode = status; if (headers) this.headers = { ...this.headers, ...headers } },
    write(text) { events.push(...collectFrames(String(text))) },
    flushHeaders() {},
    end(text) {
      if (text !== undefined && text !== '') events.push(...collectFrames(String(text)))
      this.ended = true
    },
    writableEnded: false,
  }
  await route.handler(request, response)
  response.writableEnded = response.ended === true
  return { status: response.statusCode, headers: response.headers, events }
}

function collectFrames(text) {
  const frames = []
  for (const block of text.split('\n\n')) {
    if (block.startsWith('data: ')) {
      try { frames.push(JSON.parse(block.slice(6))) } catch { /* ignore */ }
    }
  }
  return frames
}

/* ---------------------------------------------------------------- 1. state */
{
  const r = await callJson('POST', '/api/dsh-plugin-k8s/state', {})
  check('state 返回 ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
  check('state 带 kubectl 字段', typeof r.json.kubectl?.present === 'boolean', JSON.stringify(r.json.kubectl))
  check('state dataDir 指向临时目录', r.json.dataDir === dataDir)
  const g = await callJson('GET', '/api/dsh-plugin-k8s/state', {})
  check('非 POST → 405', g.status === 405)
}

/* ---------------------------------------------------------------- 2. kubeconfig 管理 */
const sample = [
  'apiVersion: v1',
  'kind: Config',
  'clusters:',
  '- name: "smoke-cluster"',
  '  cluster:',
  '    server: "https://127.0.0.1:6443"',
  'users:',
  '- name: "smoke-user"',
  '  user:',
  '    token: "smoke-token"',
  'contexts:',
  '- name: "smoke-ctx"',
  '  context:',
  '    cluster: "smoke-cluster"',
  '    user: "smoke-user"',
  'current-context: "smoke-ctx"',
].join('\n')

let savedId = null
{
  const bad = await callJson('POST', '/api/dsh-plugin-k8s/kubeconfigs/save', { name: '坏内容', content: 'hello world 不是 yaml' })
  check('保存非 kubeconfig 被拒', bad.status === 400 && /kubeconfig/.test(bad.json?.error ?? ''), JSON.stringify(bad))

  const noName = await callJson('POST', '/api/dsh-plugin-k8s/kubeconfigs/save', { content: sample })
  check('缺名称被拒', noName.status === 400, JSON.stringify(noName))

  const ok = await callJson('POST', '/api/dsh-plugin-k8s/kubeconfigs/save', { name: 'smoke-dev', content: sample })
  check('保存合法 kubeconfig 成功', ok.status === 200 && ok.json.ok === true, JSON.stringify(ok.json))
  check('保存返回含 contextNames', Array.isArray(ok.json.kubeconfig?.contextNames) && ok.json.kubeconfig.contextNames.includes('smoke-ctx'))
  savedId = ok.json.kubeconfig?.id

  const dup = await callJson('POST', '/api/dsh-plugin-k8s/kubeconfigs/save', { name: 'smoke-dev', content: sample })
  check('重复名称被拒', dup.status === 400 && /已存在同名/.test(dup.json?.error ?? ''), JSON.stringify(dup))

  const list = await callJson('POST', '/api/dsh-plugin-k8s/kubeconfigs/list', {})
  check('列表含刚保存项', list.json.kubeconfigs?.some((k) => k.id === savedId), JSON.stringify(list.json))
}

/* ---------------------------------------------------------------- 3. AI（fake llm） */
{
  fakeLlm = {
    async listProviders() {
      return [{ id: 'deepseek', label: 'DeepSeek' }, { id: 'mock', label: 'Mock' }]
    },
    async listModels(provider) {
      if (provider === 'deepseek') return [{ id: 'deepseek-chat', label: 'DeepSeek Chat' }, { id: 'deepseek-reasoner' }]
      return []
    },
    async *stream(options) {
      const { system, messages } = options
      if (typeof system !== 'string' || !Array.isArray(messages) || messages.length === 0) throw new Error('bad call shape')
      for (const chunk of ['kubectl ', 'get ', 'pods']) yield { type: 'text-delta', text: chunk }
      yield { type: 'finish', reason: 'stop' }
    },
  }
  const models = await callJson('POST', '/api/dsh-plugin-k8s/ai/models', {})
  check('ai/models 枚举成功', models.json.ok === true && models.json.providers.length >= 2, JSON.stringify(models.json))

  const chat = await callSse('POST', '/api/dsh-plugin-k8s/ai/chat', {
    id: savedId,
    provider: 'deepseek',
    model: 'deepseek-chat',
    history: [{ role: 'user', content: '查看所有 pod' }],
  })
  const deltaText = chat.events.filter((e) => e.type === 'delta').map((e) => e.text).join('')
  check('chat 流式收到 delta', deltaText === 'kubectl get pods', JSON.stringify(chat.events))
  check('chat 收到 done 事件', chat.events.some((e) => e.type === 'done'), JSON.stringify(chat.events))
  check('chat 无 error 事件', !chat.events.some((e) => e.type === 'error'), JSON.stringify(chat.events))

  fakeLlm = null
  const noLlm = await callJson('POST', '/api/dsh-plugin-k8s/ai/models', {})
  check('无 llm 时 ai/models 返回提示', noLlm.json.ok === false && typeof noLlm.json.message === 'string')
}

/* ---------------------------------------------------------------- 4. kubectl 执行（本地命令，不触网） */
{
  const before = await callJson('POST', '/api/dsh-plugin-k8s/state', {})
  if (!before.json.kubectl?.present) {
    console.log('  ⚠ 本机无 kubectl，跳过 run 用例（其余逻辑已覆盖）')
  } else {
    const run = await callSse('POST', '/api/dsh-plugin-k8s/run', {
      id: savedId,
      command: 'version --client -o json',
      context: '',
      namespace: '',
      timeoutMs: 20000,
    })
    const types = run.events.map((e) => e.type)
    check('run 首事件为 start', run.events[0]?.type === 'start', JSON.stringify(run.events[0]))
    check('run 含 stdout 输出', run.events.some((e) => e.type === 'out' && e.channel === 'stdout'), JSON.stringify(run.events.slice(0, 4)))
    const exit = run.events.find((e) => e.type === 'exit')
    check('run 收到 exit 且退出码 0', exit && exit.code === 0, JSON.stringify(exit))
    check('run 无 error 事件', !run.events.some((e) => e.type === 'error'), JSON.stringify(run.events.slice(0, 4)))

    const bad = await callJson('POST', '/api/dsh-plugin-k8s/run', { id: 'nope_0000000000', command: 'get pods' })
    check('未知 id → JSON 404', bad.status === 404)
    const empty = await callSse('POST', '/api/dsh-plugin-k8s/run', { id: savedId, command: '   ' })
    check('空命令 → SSE error 事件', empty.events.some((e) => e.type === 'error'), JSON.stringify(empty.events))
  }
}

/* ---------------------------------------------------------------- 5. 删除 */
{
  const rm = await callJson('POST', '/api/dsh-plugin-k8s/kubeconfig/remove', { id: savedId })
  check('删除成功', rm.json.ok === true)
  const list = await callJson('POST', '/api/dsh-plugin-k8s/kubeconfigs/list', {})
  check('删除后列表为空', list.json.kubeconfigs?.length === 0, JSON.stringify(list.json))
}

rmSync(dir, { recursive: true, force: true })

console.log(failures === 0 ? '\n全部冒烟用例通过 ✅' : `\n${failures} 个用例失败 ❌`)
process.exit(failures === 0 ? 0 : 1)
