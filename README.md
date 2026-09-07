# dsh-plugin-k8s

DSH（DeepSeek Harness）**K8s 控制台**插件：把 kubectl 与 AI 搬进 Web 界面，交互模型对齐同生态的「数据库工作台」插件。

- **kubeconfig 管理**：添加（粘贴内容 / 导入本机文件路径，如 `~/.kube/configs/dev.yaml`）、列表展示（context / current-context / API server）、连通性测试（`kubectl get --raw=/version`）、复制全文、删除。文件落盘为 `<DSH_HOME>/dsh-k8s/kubeconfigs/<id>.yaml`（权限 `chmod 600`），删除/重命名后再导入即可更新。
- **点击即开会话 Tab，重复点击**同一 kubeconfig **总是新建一个 Tab**（每个会话独立，互不干扰，绝不定位旧 Tab）。
- **每个会话内含 2 个子页**：
  - ⌨️ **命令控制台**：在所选 context / namespace 下直接执行 kubectl（可省略 `kubectl` 前缀），SSE 流式回显 stdout/stderr，可中止、可超时；Enter 执行 / Shift+Enter 换行 / ↑↓ 翻历史；非交互式（`exec -it` 这类需要 TTY 的不支持，会得到明确报错）。
  - 💬 **AI 对话**：多轮对话，针对当前集群生成 kubectl 命令、解释命令与报错、分析输出；回复里的可执行命令一键「▶ 运行」切回命令控制台直接执行。AI 模型**复用 DSH 自身配置**（provider/model 由 DSH 提供），界面“按需选模型”，不在插件里重复填 Key。
- 面板收起再打开、切换子页 / 会话 Tab 均保持状态（组件保持挂载）。

## 目录结构

```
src/
  index.ts            插件入口（cordis apply + webServer 注入）
  store.ts            kubeconfig 索引 + 文件持久化（副本式存储，删改原文件不影响）
  meta.ts             kubeconfig 轻量解析（展示用；token/证书不解析不外发）
  kubectl.ts          kubectl 定位 / 命令行切分 / 进程执行(SSE 上游) / config view 权威解析
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
| `/run` | 执行 kubectl（SSE：start → out{stdout/stderr} → exit / error） |
| `/ai/models` | 枚举 DSH 已配置模型 |
| `/ai/chat` | 多轮对话（SSE：delta → done / error / aborted） |

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
- 本插件未注册任何“对话内 AI 工具”（不占用系统提示词），AI 能力全部收在插件面板内部。
- kubectl 执行是非交互、带超时与输出上限的受控子进程，绝不在主进程内拼 shell 字符串（避免注入与命令解析歧义）。

## 安全说明

- kubeconfig 含集群访问凭据：插件把内容副本存到 `<DSH_HOME>/dsh-k8s/`（文件 600 权限），不要在公开场合粘贴/分享。
- 「复制全文」会把凭据放进剪贴板，操作时会提示注意保管。
- 插件只在你点击「测试」或执行命令时才用该 kubeconfig 发起请求；列表/元信息解析全部本地完成、不触网。
