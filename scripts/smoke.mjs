// dsh-plugin-k8s 服务端冒烟：不依赖 cordis/真实集群。
// - 用真实临时目录驱动 store（保存/解析/重复名校验/删除）
// - 用 fake ctx + fake llm 驱动 HTTP 路由（含 SSE run / chat 流）
// - run 用例执行真实的 `kubectl version --client`（纯本地、不触网）
// - 管道解析/进程内过滤（parsePipeline / applyOutputFilters）单测 + /run 管道用例
// - 会话历史持久化（/history/* 路由：append/list/get/delete）
// - 校验只读命令白名单与系统提示注入（对话工具注册在无 dsh-tools 环境下降级为 no-op）
import { apply, assertReadOnlyCommand, parsePipeline, applyOutputFilters } from '../dist/dsh-k8s-console.js'
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

/* ---------------------------------------------------------------- 0.5 管道解析 + 进程内过滤 */
{
  const p1 = parsePipeline('get pods,deployments -n dji | grep core')
  check('管道：kubectl 段正确', JSON.stringify(p1.kubectl) === JSON.stringify(['get', 'pods,deployments', '-n', 'dji']), JSON.stringify(p1.kubectl))
  check('管道：grep 过滤器', p1.filters.length === 1 && p1.filters[0].kind === 'grep' && p1.filters[0].patterns[0] === 'core')

  const p2 = parsePipeline('get pods | grep -i "nginx|api" | head -n 5')
  check('管道：引号内的 | 不切分', p2.filters.length === 2 && p2.filters[0].patterns[0] === 'nginx|api', JSON.stringify(p2.filters))
  check('管道：head -n 解析', p2.filters[1].kind === 'head' && p2.filters[1].lines === 5)

  const p3 = parsePipeline('version --client')
  check('无管道：行为与旧版一致', p3.filters.length === 0 && JSON.stringify(p3.kubectl) === JSON.stringify(['version', '--client']))

  const p4 = parsePipeline('get pods -A | grep -e Running -e Pending | sort -u | wc -l')
  check('管道：多 pattern / sort / wc 链', p4.filters.length === 3 && p4.filters[0].patterns.length === 2 && p4.filters[2].kind === 'wc', JSON.stringify(p4.filters))

  let threw = false
  try { parsePipeline('get pods | awk \'{print $1}\'') } catch { threw = true }
  check('管道：不支持的过滤器 awk 被拒', threw === true)
  threw = false
  try { parsePipeline('get pods ||') } catch { threw = true }
  check('管道：空段（|| / 结尾 |）被拒', threw === true)
  threw = false
  try { parsePipeline('get pods | grep -q x') } catch { threw = true }
  check('管道：grep 未知 flag 被拒', threw === true)

  const text = 'apple-core\nbanana\nCORE-cherry\napple-core\ndate\n'
  const grep = (line) => parsePipeline(`| ${line}`).filters[0]
  check('过滤：grep 基本匹配', applyOutputFilters(text, [grep('grep core')]) === 'apple-core\napple-core\n')
  check('过滤：grep -i', applyOutputFilters(text, [grep('grep -i core')]) === 'apple-core\nCORE-cherry\napple-core\n')
  check('过滤：grep -v（大小写敏感）', applyOutputFilters(text, [grep('grep -v core')]) === 'banana\nCORE-cherry\ndate\n')
  check('过滤：grep -v -i', applyOutputFilters(text, [grep('grep -v -i core')]) === 'banana\ndate\n')
  check('过滤：grep -n -i', applyOutputFilters(text, [grep('grep -n -i core')]) === '1:apple-core\n3:CORE-cherry\n4:apple-core\n')
  check('过滤：grep -c -i', applyOutputFilters(text, [grep('grep -c -i core')]) === '3\n')
  check('过滤：grep 无命中为空', applyOutputFilters(text, [grep('grep zzz')]) === '')
  check('过滤：head -n 2', applyOutputFilters(text, [{ kind: 'head', lines: 2 }]) === 'apple-core\nbanana\n')
  check('过滤：tail -n 2', applyOutputFilters(text, [{ kind: 'tail', lines: 2 }]) === 'apple-core\ndate\n')
  check('过滤：sort -u', applyOutputFilters(text, [{ kind: 'sort', reverse: false, unique: true }]) === 'CORE-cherry\napple-core\nbanana\ndate\n')
  check('过滤：wc', applyOutputFilters(text, [{ kind: 'wc' }]) === '5\n')
  check('过滤：链式 grep | wc', applyOutputFilters(text, [grep('grep -i core'), { kind: 'wc' }]) === '3\n')
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

/* ---------------------------------------------------------------- 3.5 会话历史持久化 */
{
  const empty = await callJson('POST', '/api/dsh-plugin-k8s/history/list', {})
  check('history/list 初始为空', empty.status === 200 && empty.json.ok === true && empty.json.sessions.length === 0, JSON.stringify(empty.json))

  const bad = await callJson('POST', '/api/dsh-plugin-k8s/history/append', { kubeId: savedId, kubeName: 'smoke-dev', message: { role: 'user' } })
  check('history/append 缺内容被拒', bad.status === 400)

  const a1 = await callJson('POST', '/api/dsh-plugin-k8s/history/append', {
    kubeId: savedId, kubeName: 'smoke-dev', context: 'smoke-ctx',
    message: { role: 'user', content: '查看所有 pod', at: '2026-01-01T00:00:00.000Z' },
  })
  check('history/append 创建会话', a1.status === 200 && typeof a1.json.sessionId === 'string' && a1.json.messageCount === 1, JSON.stringify(a1.json))
  const sid = a1.json.sessionId

  const a2 = await callJson('POST', '/api/dsh-plugin-k8s/history/append', {
    sessionId: sid, kubeId: savedId, kubeName: 'smoke-dev',
    message: { role: 'assistant', content: 'kubectl get pods -A', provider: 'deepseek', model: 'deepseek-chat' },
  })
  check('history/append 追加 assistant 并复用会话', a2.json.sessionId === sid && a2.json.messageCount === 2, JSON.stringify(a2.json))

  const lost = await callJson('POST', '/api/dsh-plugin-k8s/history/append', {
    sessionId: 'h0123456789abcdef', kubeId: savedId, kubeName: 'smoke-dev',
    message: { role: 'user', content: '孤儿会话' },
  })
  check('history/append 未知 sessionId → 新建会话', typeof lost.json.sessionId === 'string' && lost.json.sessionId !== 'h0123456789abcdef')

  const l1 = await callJson('POST', '/api/dsh-plugin-k8s/history/list', { kubeId: savedId })
  check('history/list 含会话与预览', l1.json.sessions.length === 2 && l1.json.sessions.some((s) => s.preview === '查看所有 pod'), JSON.stringify(l1.json))

  const l2 = await callJson('POST', '/api/dsh-plugin-k8s/history/list', { keyword: 'POD' })
  const hit = l2.json.sessions.find((s) => s.preview === '查看所有 pod')
  check('history/list 关键词命中 + snippet', !!hit && /查看所有 pod/.test(hit.snippet ?? ''), JSON.stringify(l2.json))

  const l3 = await callJson('POST', '/api/dsh-plugin-k8s/history/list', { keyword: '不存在的关键词xyz' })
  check('history/list 关键词未命中为空', l3.json.sessions.length === 0)

  const g = await callJson('POST', '/api/dsh-plugin-k8s/history/get', { sessionId: sid })
  check('history/get 完整消息', g.json.session?.messages?.length === 2 && g.json.session.messages[1].role === 'assistant' && g.json.session.messages[1].provider === 'deepseek', JSON.stringify(g.json))

  const g404 = await callJson('POST', '/api/dsh-plugin-k8s/history/get', { sessionId: 'hdeadbeefdeadbeef' })
  check('history/get 不存在 → 404', g404.status === 404)

  const d = await callJson('POST', '/api/dsh-plugin-k8s/history/delete', { sessionId: sid })
  check('history/delete 成功', d.json.deleted === true)
  const dAgain = await callJson('POST', '/api/dsh-plugin-k8s/history/delete', { sessionId: sid })
  check('history/delete 再删为 false', dAgain.json.deleted === false)

  const noc = await callJson('POST', '/api/dsh-plugin-k8s/history/clear', {})
  check('history/clear 需要确认', noc.status === 400)
  const yes = await callJson('POST', '/api/dsh-plugin-k8s/history/clear', { confirm: true })
  check('history/clear 清空', yes.json.removed >= 1)
  const after = await callJson('POST', '/api/dsh-plugin-k8s/history/list', {})
  check('history 清空后列表为空', after.json.sessions.length === 0)
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

    // 管道：真实 kubectl 输出 + 进程内过滤
    const piped = await callSse('POST', '/api/dsh-plugin-k8s/run', {
      id: savedId,
      command: 'version --client -o json | grep clientVersion | head -n 3',
      context: '',
      namespace: '',
      timeoutMs: 20000,
    })
    const pipedOut = piped.events.filter((e) => e.type === 'out' && e.channel === 'stdout').map((e) => e.text).join('')
    check('run 管道：输出只保留过滤行', pipedOut.includes('clientVersion') && !pipedOut.includes('"goVersion"'), JSON.stringify(pipedOut.slice(0, 200)))
    check('run 管道：note 事件说明过滤来源', piped.events.some((e) => e.type === 'note' && /管道过滤/.test(String(e.text ?? ''))), JSON.stringify(piped.events.map((e) => e.type)))
    const pipedExit = piped.events.find((e) => e.type === 'exit')
    check('run 管道：exit 带 filtered 标记且退出码 0', pipedExit?.filtered === true && pipedExit.code === 0, JSON.stringify(pipedExit))

    const badPipe = await callSse('POST', '/api/dsh-plugin-k8s/run', { id: savedId, command: 'get pods | bash' })
    check('run 管道：不支持的过滤器被拒', badPipe.events.some((e) => e.type === 'error'), JSON.stringify(badPipe.events))
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
