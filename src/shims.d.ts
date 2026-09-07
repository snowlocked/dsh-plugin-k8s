/** @deepseek-ai/dsh-tools 的轻量类型声明（运行时由宿主提供，插件不打包/不安装它）。 */
declare module '@deepseek-ai/dsh-tools' {
  export function defineTool(options: Record<string, unknown>): unknown
}
