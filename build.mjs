// DSH 插件构建：服务端 + 客户端单文件产物（跨平台，无需 shell 脚本）
// 参考 dsh-plugin-database/build.mjs —— 同一套 esbuild + ModuleLoader 封装约定。
import { build, context } from 'esbuild'
import { mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
mkdirSync(join(root, 'dist'), { recursive: true })

// 服务端：bundle 成单个 ESM（仅 node 内置模块与运行期 cordis ctx，无第三方依赖）
const serverOptions = {
  entryPoints: [join(root, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  external: [],
  outfile: join(root, 'dist/dsh-k8s-console.js'),
  logLevel: 'info',
  minify: true,
  sourcemap: false,
}

// 客户端：bundle 成 iife，套进 window.__ModuleLoader__.load({ id, factory }) 闭包。
// React/ReactDOM 必须 external（复用 DSH 主机那份 React），否则第二份 React 实例
// 会让 hooks 读到 null dispatcher（见 dsh-plugin-database build.mjs 注释）。
const clientOptions = {
  entryPoints: [join(root, 'src/client/index.tsx')],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'chrome100',
  loader: { '.css': 'text' },
  external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
  globalName: '__dsh_k8s_module__',
  banner: {
    js: [
      'window.__ModuleLoader__.load({',
      '  id: "@snowlocked/dsh-k8s-console",',
      '  factory: (require) => {',
      '    "use strict";',
      '    var __dsh_k8s_internal = { exports: {} };',
      '    var __dsh_k8s_exports = __dsh_k8s_internal.exports;',
      '    Object.defineProperty(__dsh_k8s_exports, Symbol.toStringTag, { value: "Module" });',
    ].join('\n'),
  },
  footer: {
    js: [
      '    return __dsh_k8s_module__;',
      '  },',
      '});',
    ].join('\n'),
  },
  outfile: join(root, 'dist/dsh-k8s-console.client.js'),
  logLevel: 'info',
  minify: true,
  sourcemap: false,
}

const watch = process.argv.includes('--watch')

if (watch) {
  const server = await context(serverOptions)
  const client = await context(clientOptions)
  await Promise.all([server.watch(), client.watch()])
  console.log('watching… 产物在 dist/ 下')
} else {
  await build(serverOptions)
  await build(clientOptions)
  // 同步到 plugins/dsh-plugin-k8s（可拷贝/链接安装的插件包：lib/index.js + lib/client.js）
  const pluginDir = join(root, 'plugins/dsh-plugin-k8s/lib')
  mkdirSync(pluginDir, { recursive: true })
  const pairs = [
    ['dsh-k8s-console.js', 'index.js'],
    ['dsh-k8s-console.client.js', 'client.js'],
  ]
  for (const [sourceName, targetName] of pairs) {
    const source = join(root, 'dist', sourceName)
    const target = join(pluginDir, targetName)
    if (existsSync(source)) copyFileSync(source, target)
  }
  console.log('build ok → dist/ 与 plugins/dsh-plugin-k8s/lib/')
}
