# Babel配置最佳实践

本文介绍Babel的配置选项以及在不同应用场景下的最佳配置。

## 1.背景：为什么需要 Babel

现代 JavaScript（ES2015+、Stage 提案、TypeScript、JSX 等）给开发效率与代码可维护性带来巨大提升，但运行环境（各版本浏览器、Node LTS、不同行业内置浏览器、Hybrid WebView 等）支持程度并不一致。为兼顾：

1. 语法转译（Syntax Transform）
2. 新内建对象 & 原型方法（Polyfill / Built‑ins / Globals）
3. 体积优化与按需加载
4. 可重复构建（CI 一致性）
5. 源码调试（Source Map）

Babel 作为“编译阶段的语言层适配器”，借助 preset / plugin / polyfill 策略，把“编写期”能力映射为“运行期”安全集合。

核心理念：只转译需要的；库与应用分离策略；最小成本引入 polyfill；与 Bundler（Webpack / Rollup / Vite / Rspack / esbuild）协同；与 Browserslist 统一定义目标环境；与 Core‑JS / regenerator-runtime 区分 helper 与 polyfill 责任。

## 2. @babel/preset-env 详解

`@babel/preset-env` 是按目标环境（targets）“按需注入语法转换 + （可选）polyfill 策略”的智能预设。

常用安装：

```bash
pnpm add -D @babel/core @babel/preset-env core-js regenerator-runtime
```

（是否需要 `core-js` 取决于 useBuiltIns 策略；库模式下往往不直接引入）

### 1. 关键选项（options）

| 选项 | 类型 | 默认 | 作用 | 典型取值/说明 |
|------|------|------|------|---------------|
| targets | 字符串 / 对象 | 取决于 browserslist | 决定需要转换/填充到的运行环境 | `{ browsers: 'last 2 versions, > 1%, not dead', node: '14' }` 或在 package.json browserslist 统一配置 |
| bugfixes | boolean | false | 启用已知浏览器实现缺陷的补丁（更小的 polyfill 替代方案） | 推荐应用 true，库视情况 |
| modules | 'auto'/'amd'/'commonjs'/'systemjs'/'umd'/false | 'auto' | 是否把 ES Modules 转为另一种模块格式 | 库多输出双格式，ESM 构建设 `false`，CJS 构建保留默认/指定 'commonjs' |
| useBuiltIns | false/'entry'/'usage' | false | 决定如何注入 polyfill | 库：false；应用：'usage' 或 'entry' |
| corejs | 2 / 3 / object | undefined | 指定 core-js 版本与提案支持范围 | 常用：`{ version: 3, proposals: false }` 或 `3.37` |
| spec | boolean | false | 更接近规范但可能更慢/更冗长 | 仅在语义严苛场景 |
| loose | boolean | false | 更“宽松”更小更快但有语义差异 | 默认 false，局部评估 |
| shippedProposals | boolean | false | 启用已进入标准但默认未开 | 谨慎使用 |
| forceAllTransforms | boolean | false | 忽略 targets 强制全转换 | 极端老旧环境兜底 |
| include | Array<string\|RegExp> | [] | 强制额外启用的插件/内建 | 精细补丁策略 |
| exclude | Array<string\|RegExp> | [] | 排除特定转换或内建 | 体积/性能微调 |
| debug | boolean | false | 输出决策日志 | 诊断期临时开启 |
| browserslistEnv | string | undefined | 选择 browserslist 环境 | 多环境切换 |
| assumptions | object | {} | 启用假设减少运行时代码 | 与 loose 配合，需评估 |

### 2. useBuiltIns 策略细节

1. `false`: 不自动注入 polyfill。适用于“组件/函数库”——把 polyfill 责任留给最终应用，避免污染全局或重复注入。
2. `'entry'`: 需在入口文件顶部手动写：

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

Babel 根据 targets 裁剪这些引用。
- 优点：清晰、全量一次性；
- 缺点：可能引入未实际用到的部分（仍可能冗余）。

3. `'usage'`: 自动基于源码实际使用的 ES 新特性注入对应 import。
- 优点：最小化；
- 缺点：动态访问无法静态分析；日志复杂。

### 3. core-js 版本选择

当前建议使用 core-js@3（维护积极，覆盖更全）。

```bash
pnpm add -D core-js@^3
```

如使用提案：

```js
corejs: { version: 3, proposals: true }
```

注意：提案 API 可能未来变化，库中不建议启用 `proposals`。

### 4. targets 推荐风格

统一在 `package.json` 设置：

```json
"browserslist": {
  "production": [">0.5%", "last 2 versions", "not dead", "not op_mini all"],
  "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"],
  "legacy": ["> 1%", "IE 11"]
}
```

构建时用 `BROWSERSLIST_ENV` 切换。例如：`cross-env BROWSERSLIST_ENV=legacy webpack`。

**targets 和 browserslist 的优先级**

在 Babel 中，`targets` 和 `browserslist` 都用于定义目标运行环境，但它们的优先级如下：

1. 如果 `@babel/preset-env` 的配置中显式指定了 `targets`，则优先使用 `targets`。
2. 如果未指定 `targets`，则会回退到 `browserslist` 配置。
3. `browserslist` 的环境可以通过 `BROWSERSLIST_ENV` 环境变量切换，例如 `production`、`development` 等。

建议：

- 在 `package.json` 中统一维护 `browserslist` 配置，便于复用和管理。

- 仅在特定场景下（如 Node.js 环境）需要覆盖时，才在 `targets` 中显式指定。

## 3. @babel/plugin-transform-runtime 详解

解决问题：

1. 避免重复注入 helper（`_extends` 等）。
2. 避免污染全局（通过模块化 runtime 引用）。
3. 统一 generator/async 的 regenerator 依赖来源。

安装：

```bash
pnpm add -D @babel/plugin-transform-runtime @babel/runtime
```

如需 core-js 模块化 polyfill：

```bash
pnpm add -D @babel/runtime-corejs3
```

注意：与 `preset-env` 的 `useBuiltIns:'usage'|'entry'` 不要同时引入同一路径 polyfill；二选一。

### 1. 常用选项

| 选项 | 类型 | 默认 | 说明 | 建议 |
|------|------|------|------|------|
| corejs | false / 2 / 3 / object | false | 通过 runtime 引入 core-js（模块化，不污染全局） | 库 false；应用若需“局部”策略用 3（禁用 useBuiltIns） |
| helpers | boolean | true | 抽离 helper 为共享模块 | 保持 true |
| regenerator | boolean | true | async/generator 使用 runtime | 一般 true |
| useESModules | boolean | false | 使用 ESM 形式导入 runtime | ESM 构建设 true，利于 tree-shaking |
| absoluteRuntime | boolean / string | false | 解析为绝对路径防多版本冲突 | Monorepo 建议指定 `require.resolve('@babel/runtime/package.json')` |
| version | string | 自动 | 锁定 runtime 版本 | 复杂 monorepo 可显式 |
| assumptions | object | {} | 同 preset-env | 统一管理 |

### 2. 与 preset-env 组合规则

| 场景 | preset-env useBuiltIns | transform-runtime corejs | 结果 |
|------|------------------------|---------------------------|------|
| 纯库（不负责 polyfill） | false | false | 语法转换 + helper 抽离 |
| 应用：自动按需 polyfill | 'usage' | false | 全局按需 polyfill + helper 抽离 |
| 应用：模块化不污染全局 | false | 3 | 模块内 polyfill（不改写全局） |
| 应用：入口全量 | 'entry' | false | 入口一次性注入 + 剪裁 |

不要同时：`useBuiltIns:'usage'` 与 `transform-runtime { corejs:3 }`。

## 4. 配置示例与最佳实践

### 1. 文件组织建议

- `babel.config.js`：适合多包/Monorepo。
- 简单项目可用 `.babelrc.js`。
- Browserslist 放在 `package.json`，与 Babel 解耦。

### 2. 组件/函数库 (Library) 场景

目标：最小职责 => 仅语法降级 + helper 抽离；不注入 polyfill；多格式输出；保留 ESM 供 Tree-Shaking。

依赖安装：

```bash
pnpm add -D @babel/core @babel/preset-env @babel/plugin-transform-runtime @babel/runtime typescript @babel/preset-typescript
```

（如有 React 再加 `@babel/preset-react`）

`babel.config.js`：

```js
module.exports = function (api) {
  api.cache(true);
  const isESM = process.env.BUILD_FORMAT === 'esm';
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { browsers: ['>0.5%', 'last 2 versions', 'not dead'] },
          useBuiltIns: false,
          corejs: false,
          modules: isESM ? false : 'auto',
          bugfixes: true,
          loose: false,
          exclude: [],
          debug: false,
        },
      ],
      '@babel/preset-typescript',
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: isESM,
        },
      ],
    ],
  };
};
```

构建脚本示例：

```json
"scripts": {
  "build:esm": "cross-env BUILD_FORMAT=esm babel src --out-dir dist/esm --extensions .ts,.js --source-maps",
  "build:cjs": "cross-env BUILD_FORMAT=cjs babel src --out-dir dist/cjs --extensions .ts,.js --source-maps",
  "build": "pnpm run build:esm && pnpm run build:cjs"
}
```

`package.json` 输出字段：

```json
"main": "dist/cjs/index.js",
"module": "dist/esm/index.js",
"types": "dist/esm/index.d.ts",
"exports": {
  ".": {
    "import": "./dist/esm/index.js",
    "require": "./dist/cjs/index.js"
  }
}
```

注意：不打包 `core-js`；文档注明“由使用方注入 polyfill”。

### 3. 应用程序 (Application) 场景

典型：`preset-env + useBuiltIns:'usage'` + `transform-runtime`（仅 helper）。

依赖：

```bash
pnpm add -D @babel/core @babel/preset-env core-js regenerator-runtime @babel/plugin-transform-runtime @babel/runtime
```

配置：

```js
module.exports = api => {
  api.cache(true);
  const isDev = process.env.NODE_ENV !== 'production';
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: { version: 3, proposals: false },
          bugfixes: true,
          modules: false,
          targets: undefined,
          loose: false,
          debug: false,
        },
      ],
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: true,
        },
      ],
      // React 项目可追加：isDev && require.resolve('react-refresh/babel')
    ].filter(Boolean),
    sourceMaps: isDev ? 'inline' : true,
  };
};
```

“模块化不污染全局”替代方案：

```js
// preset-env 关闭 polyfill 注入
['@babel/preset-env', { useBuiltIns: false, corejs: false, modules: false }]
// runtime 负责模块化 polyfill
['@babel/plugin-transform-runtime', { corejs: 3, helpers: true, regenerator: true, useESModules: true }]
```

### 4. SSR / Node 应用

```js
['@babel/preset-env', {
  targets: { node: '18' },
  useBuiltIns: false,
  modules: 'commonjs',
  bugfixes: true,
}]
```

Node 环境大多内建特性，无需引 polyfill；可使用 swc / esbuild 替代以提速。

### 5. Monorepo 混合策略

- 根：公共 `babel.config.js`（不含 polyfill）。
- 应用包：局部 `.babelrc` 追加 `useBuiltIns`。
- 库包：保持 `useBuiltIns:false` + runtime helpers。

### 6. Source Map & 性能

- 开发：`inline` 提升调试体验。
- 生产：独立 map，上传到监控平台（Sentry 等）；不在 CDN 公开放置或设置访问控制。

### 7. 常见误区

| 误区 | 后果 | 正确做法 |
|------|------|----------|
| 库里启用 `useBuiltIns:'usage'` | 多份/全局污染 | 库 `useBuiltIns:false` |
| 同时 `useBuiltIns:'usage'` 与 runtime corejs | 重复/冲突 | 二选一 polyfill 路径 |
| 混乱 browserslist | 不一致行为 | 集中维护 & 环境变量切换 |
| 过度开启 loose | 语义 bug | 默认关闭，局部评估 |
| 未锁定版本 | 构建不可重复 | 使用 lockfile / 指定版本 |
| 滥用 proposals | API 变动风险 | 库禁用；应用审慎 |

## 5、依赖归类建议

| 类型 | 依赖 | 说明 |
|------|------|------|
| devDependencies | @babel/core | Babel 核心 |
| devDependencies | @babel/preset-env | 语法与 polyfill 策略 |
| devDependencies | @babel/preset-typescript | TS 转换（不做类型检查） |
| devDependencies | @babel/preset-react | React JSX/优化 |
| devDependencies | @babel/plugin-transform-runtime | 抽离 helper/runtime |
| dependencies | @babel/runtime | 运行时 helper（生产需） |
| dependencies (可选) | @babel/runtime-corejs3 | runtime polyfill 路径时需要 |
| devDependencies (应用) | core-js | useBuiltIns 方案需要 |
| devDependencies | regenerator-runtime | entry 模式下可能手动引入 |


## 6、快速策略决策表

| 目标 | 选择 |
|------|------|
| 纯函数/组件库 | preset-env(useBuiltIns:false) + transform-runtime(helpers) |
| UI 库多格式 | 双构建：ESM `modules:false` + CJS |
| Web 应用（典型 SPA） | preset-env(useBuiltIns:'usage') + runtime(helpers) |
| Web 应用（不污染全局） | preset-env(useBuiltIns:false) + runtime(corejs:3) |
| Node 服务 | preset-env(targets.node) + minimal plugins |
| 极老环境 | forceAllTransforms + 精确 polyfill 策略 |

## 7、总结

1. 明确产物：库 vs 应用；是否负责 polyfill；是否多格式输出；目标环境可控程度。
2. `@babel/preset-env` 解决“转什么 & 何时注入”；`@babel/plugin-transform-runtime` 解决“如何抽离 & 是否模块化 polyfill”。
3. 库不打包 polyfill；应用按需或入口一次性；避免双路径冲突。
4. 谨慎 proposals / loose；统一 browserslist；利用调试日志评估优化。
5. 追求：配置最小化 + 职责清晰 + 构建可重复 + Tree-Shake 友好。

做到以上，即是 Babel 的工程化最佳实践核心。