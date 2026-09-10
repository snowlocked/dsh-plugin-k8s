# dsh-k8s-console

DSH（DeepSeek Harness）**K8s 控制台**插件：kubeconfig 管理 + 集群会话工作区。

- ➕ 添加 kubeconfig（粘贴内容 / 导入本机文件路径），列表展示 context / API server
- 点击列表项即**新建会话 Tab**（重复点击同一集群会再开一个独立会话，不定位旧 Tab）
- 每个会话 2 个子页：
  - ⌨️ **命令控制台**：所选 context/namespace 下执行 kubectl，SSE 流式输出，可中止/超时；
    支持 `| grep / head / tail / sort / wc -l` 管道过滤（进程内实现，非 shell）；命令历史持久化
  - 💬 **AI 对话**：多轮对话生成命令 / 解释输出，回复内命令可一键发到控制台执行；
    AI 模型复用 DSH 自身配置（界面按需选模型，无需重复填 Key）
- 🕘 **对话历史持久化**：AI 对话逐条落盘（`<DSH_HOME>/dsh-k8s/history/`），刷新/重启后可
  关键词搜索、展开查看、载入继续追问、单条删除
- 对话内只读工具 `k8s_kubeconfigs` / `k8s_query`（支持管道过滤），主对话 AI 可直接查集群

构建与安装见仓库根 README；本目录为可发布/可链接安装形态：

```bash
# 开发/自用（先 build 生成 lib/）
dsh plugin --profile web add "link:D:\path\to\dsh-plugin-k8s\plugins\dsh-plugin-k8s"
# 或发布后
dsh plugin --profile web add @snowlocked/dsh-k8s-console
```

安装后重启 `dsh web`，左侧栏底部出现「K8s」入口。
