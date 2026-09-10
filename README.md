# dsh-plugin-k8s

DSH（DeepSeek Harness）**K8s 控制台**插件：把 kubectl 与 AI 搬进 Web 界面，交互模型对齐同生态的「数据库工作台」插件。

- **kubeconfig 管理**：添加（粘贴内容 / 导入本机文件路径，如 `~/.kube/config/dev.yaml`）、列表展示（context / current-context / API server）、连通性测试（`kubectl get --raw=/version`）、复制全文、删除。文件落盘为 `<DSH_HOME>/dsh-k8s/kubeconfigs/<id>.yaml`（权限 `chmod 600`），删除/重命名后再导入即可更新。
- **点击即开会话 Tab，重复点击**同一 kubeconfig **总是新建一个 Tab**（每个会话独立，互不干扰，绝不定位旧 Tab）。
- **每个会话内含 2 个子页**：
  - ⌨️ **命令控制台**：在所选 context / namespace 下直接执行 kubectl（可省略 `kubectl` 前缀），SSE 流式回显 stdout/stderr，可中止、可超时；Enter 执行 / Shift+Enter 换行 / ↑↓ 翻历史（命令历史已持久化到 localStorage，刷新不丢）；非交互式（`exec -it` 这类需要 TTY 的不支持，会得到明确报错）。
  - 💬 **AI 对话**：多轮对话，针对当前集群生成 kubectl 命令、解释命令与报错、分析输出；回复里的可执行命令一键「▶ 运行」切回命令控制台直接执行。AI 模型**复用 DSH 自身配置**（provider/model 由 DSH 提供），界面“按需选模型”，不在插件里重复填 Key。
- **进程内管道过滤**：命令控制台与对话工具 `k8s_query` 都支持 `| grep [-i -v -n -c -w -E -F] [-e] <pattern>`、`| head -n N`、`| tail -n N`、`| sort [-r] [-u]`、`| wc -l`（如 `get pods -n dji | grep core`）。管道由插件在服务端进程内解析与过滤，**不经过 shell**（杜绝注入）；重定向、`&&`、`||`、其它程序一律拒绝并明确提示。
- **对话历史持久化（0.4.0+）**：AI 对话逐条自动落盘到 `<DSH_HOME>/dsh-k8s/history/`（每个会话一个 JSON 文件），刷新 / 重启 DSH 后仍可查询：AI 面板工具栏「🕘 历史」支持关键词搜索（返回命中片段）、展开完整记录、一键「载入」继续追问（新消息继续存回该会话）、单条删除。
- 面板以会话级 View 挂在 Conversation 上（`conversation.view` slot，与 Chat 并列）；打开过的会话 Tab、命令历史、AI 对话通过持久挂载保活，**切换 Chat/K8s View、收起再打开均不丢失状态**。
- **中栏接管**（对齐数据库工作台 0.4.6 方案）：面板打开时把持久容器以 absolute 覆盖层铺满 Conversation 根节点（连头部一起接管，自带顶栏取而代之），不隐藏、不修改任何宿主元素；覆盖层缺席的最坏结果是 chat 照常显示。侧边栏「K8s」入口变为往返开关：停靠中 → 收回（切回 Chat），未停靠 → 打开。

## 目录结构

```
src/
  index.ts            插件入口（cordis apply + webServer 注入）
  store.ts            kubeconfig 索引 + 文件持久化（副本式存储，删改原文件不影响）
  meta.ts             kubeconfig 轻量解析（展示用；token/证书不解析不外发）
  kubectl.ts          kubectl 定位 / 命令行切分 / 进程执行(SSE 上游) / config view 权威解析
  pipeline.ts         管道解析 + 进程内过滤（grep/head/tail/sort/wc，非 shell）
  history.ts          AI 对话历史持久化（每会话一个 JSON，落盘 <DSH_HOME>/dsh-k8s/history/）
  ai.ts               模型枚举 + 多轮对话（复用 DSH ctx.llm，逐字回调）
  http.ts             HTTP API（前缀 /api/dsh-plugin-k8s/*；/run 与 /ai/chat 为 SSE）
  client/             React 单页界面（零第三方 UI 依赖，样式自注入）
scripts/smoke.mjs     端到端冒烟（fake ctx + fake llm + 真实临时目录；run 用真实 kubectl 本地命令）
plugins/dsh-plugin-k8s/  可拷贝/链接安装的插件包（lib/index.js + lib/client.js + cordis.patch.yml）
```

## 构建与测试

```bash
npm install
npm run build        # 产出 dist/ 与 plugins/dsh-plugin-k8s/lib/
npm run typecheck    # tsc --noEmit
npm run smoke        # 服务端冒烟（不触网；run 用 kubectl version --client）
npm run watch        # 开发热重建
```

## HTTP API（全部 POST，DSH webServer 只支持 POST）

| 路径 | 说明 |
| --- | --- |
| `/state` | 插件状态 + kubectl 探测（`{refresh:true}` 重新探测） |
| `/kubeconfigs/list` | kubeconfig 列表（含轻量解析元信息，不含凭据） |
| `/kubeconfigs/save` | 保存 `{name, content}` 或 `{name, filePath}`；经 kubectl config view 权威校验 |
| `/kubeconfigs/check` | 连通测试（8s request-timeout） |
| `/kubeconfig/remove` `/kubeconfig/raw` | 删除 / 取原文 |
| `/run` | 执行 kubectl（SSE：start → out{stdout/stderr} → exit / error）；支持 `| grep / head / tail / sort / wc -l` 管道过滤（有过滤时 stdout 在结束后统一回显，并带 `note` 事件说明） |
| `/ai/models` | 枚举 DSH 已配置模型 |
| `/ai/chat` | 多轮对话（SSE：delta → done / error / aborted） |
| `/history/append` | 追加一条消息到（必要时新建的）会话，返回 `{sessionId, messageCount}` |
| `/history/list` | 历史会话列表（支持 `{keyword}` 关键词搜索返回命中片段、`{kubeId}` 过滤、`{limit}`） |
| `/history/get` | 取某会话完整消息记录 |
| `/history/delete` | 删除某历史会话 |
| `/history/clear` | 清空全部历史（需 `{confirm:true}`） |

## 对话内 AI 工具（普通会话直接查集群）

服务端额外向 DSH 的 tools / systemPrompt 注册两个只读工具，主对话里的 AI 无需打开面板即可使用：

| 工具 | 作用 |
| --- | --- |
| `k8s_kubeconfigs` | 列出已保存 kubeconfig（id、名称、contexts、current-context、server，不含凭据） |
| `k8s_query` | 在指定 kubeconfig（可选 context/namespace）上执行**只读** kubectl，返回文本 |

- 只读强制：命令动词白名单 `get / describe / logs / top / explain / version / api-resources / api-versions / auth can-i / cluster-info`；写类动词（apply/delete/exec/scale/port-forward…）一律拒绝并提示去面板手动执行。
- 管道过滤：`command` 里可以用 `| grep [-i -v -n -c -w -E -F] [-e] <pattern>、| head -n N、| tail -n N、| sort [-r] [-u]、| wc -l` 在服务端进程内筛选输出（如 `"get pods -n dji | grep core"`），AI 会话里的系统提示会主动引导使用；重定向、`&&`、`||`、其它程序不支持。
- 用法示例（对话中说“查一下 dev 集群的 pod”即可）：先 `k8s_kubeconfigs` 定位 id/名称 → `k8s_query(kubeconfig=…, command="get pods -A")`。
- 输出上限 512KB、命令 20s 超时、返回自动截断提示；依赖 `@deepseek-ai/dsh-tools`（宿主提供），不可用时自动降级不影响其余功能。

## 安装到 DSH

与数据库插件同一套方式（link 开发 / npm registry 两种）：

```bash
npm install -g @deepseek-ai/dsh        # 如未安装 dsh CLI
cd dsh-plugin-k8s
npm install && npm run build

# 方式 A：本地源码 + link（改动后 build + 重启 dsh web 即生效）
dsh plugin --profile web add "link:D:\Users\wuzan\project\dsh-plugin-k8s\plugins\dsh-plugin-k8s"

# 方式 B：发布到 npm 后（需先 npm publish）
dsh plugin --profile web add @snowlocked/dsh-k8s-console
```

安装后**重启 `dsh web`**（Ctrl+F5 刷新页面）。左侧边栏底部出现「K8s」入口 → 打开控制台 → ➕ 添加 kubeconfig（粘贴内容或导入本机文件路径）→ 点列表项开会话 Tab。

> 插件默认只依赖 Node 内置模块，**无第三方运行时依赖**；kubectl 需本机已安装（可用 `kubectl version --client` 验证）。若 kubectl 不在 PATH，可设环境变量 `KUBECTL_BIN`，或在 profile 插件配置中设置 `kubectlBin`。

## 与数据库插件的差异点（按需）

- 数据库插件点同一张表 = **定位**旧 Tab；本插件点同一 kubeconfig = **新建** Tab（用户明确要求）。
- 本插件同时注册了「面板内 AI 对话」（经 HTTP `/ai/chat`，复用 DSH 模型）与「对话内只读工具」（`k8s_kubeconfigs` / `k8s_query`，见上节）。工具只读、不占面板状态；需要写操作时引导用户去面板手动执行。
- kubectl 执行是非交互、带超时与输出上限的受控子进程，绝不在主进程内拼 shell 字符串（避免注入与命令解析歧义）。

## 安全说明

- kubeconfig 含集群访问凭据：插件把内容副本存到 `<DSH_HOME>/dsh-k8s/`（文件 600 权限），不要在公开场合粘贴/分享。
- 「复制全文」会把凭据放进剪贴板，操作时会提示注意保管。
- 插件只在你点击「测试」或执行命令时才用该 kubeconfig 发起请求；列表/元信息解析全部本地完成、不触网。
- 管道过滤是**进程内实现**：k8s_query 与命令控制台绝不把命令拼进 shell（`spawn(bin, argv, {shell:false})`），管道仅放行 grep/head/tail/sort/wc 五个内置过滤器，参数严格校验，未知语法直接拒绝。
- 对话历史落盘在 `<DSH_HOME>/dsh-k8s/history/`（纯 JSON 文本，含你与 AI 的对话内容），仅存在本机；单会话 500 条、总数 300 会话封顶，超限自动淘汰最旧。介意留痕时可在「🕘 历史」里删除单条会话。
