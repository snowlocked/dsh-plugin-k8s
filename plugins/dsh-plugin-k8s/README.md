# dsh-k8s-console

DSH（DeepSeek Harness）**K8s 控制台**插件：kubeconfig 管理 + 集群会话工作区。

- ➕ 添加 kubeconfig（粘贴内容 / 导入本机文件路径），列表展示 context / API server
- 点击列表项即**新建会话 Tab**（重复点击同一集群会再开一个独立会话，不定位旧 Tab）
- 每个会话 2 个子页：
  - ⌨️ **命令控制台**：所选 context/namespace 下执行 kubectl，SSE 流式输出，可中止/超时
  - 💬 **AI 对话**：多轮对话生成命令 / 解释输出，回复内命令可一键发到控制台执行；
    AI 模型复用 DSH 自身配置（界面按需选模型，无需重复填 Key）

构建与安装见仓库根 README；本目录为可发布/可链接安装形态：

```bash
# 开发/自用（先 build 生成 lib/）
dsh plugin --profile web add "link:D:\path\to\dsh-plugin-k8s\plugins\dsh-plugin-k8s"
# 或发布后
dsh plugin --profile web add @snowlocked/dsh-k8s-console
```

安装后重启 `dsh web`，左侧栏底部出现「K8s」入口。
