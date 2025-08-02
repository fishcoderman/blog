@rollup/plugin-babel 是一个用于在 Rollup 构建过程中集成 Babel 的插件，常用于转换现代 JavaScript（如 ES6+）为兼容的代码，适配不同的浏览器或环境。

以下是 @rollup/plugin-babel 的功能、安装方式及使用方法：

### 功能

**1. ES6+ 转换**
使用 Babel 将现代 JavaScript 转换为兼容的代码（如 ES5）。

**2. 支持 TypeScript**
结合 Babel 插件链，支持 TypeScript 的转换（配合 @babel/preset-typescript）。

**3. Polyfill 支持**
通过配置 Babel，支持引入必要的 polyfills，如 @babel/runtime。

**4. 模块 Tree Shaking**
保留 Rollup 的 Tree Shaking 特性，避免引入不必要的代码。

### 安装

**1. 安装 Rollup 插件**

```js
npm install --save-dev @rollup/plugin-babel
```

**2. 安装 Babel 依赖**

```js
npm install --save-dev @babel/core @babel/preset-env
```

### 使用

**1. 基本配置**

```js
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/main.js', // 入口文件
  output: {
    file: 'dist/bundle.js',
    format: 'cjs', // 输出为 CommonJS 格式
  },
  plugins: [
    babel({ 
      babelHelpers: 'bundled', // 使用 Babel 内置 helpers
      presets: ['@babel/preset-env'], // 使用预设
    }),
  ],
};
```

**2. .babelrc 或 babel.config.json 配置**

可以将 Babel 配置独立出来，方便管理：

```js
{
  "presets": [
    ["@babel/preset-env", { "modules": false }]
  ]
}
```

然后在 rollup.config.js 中引用：

```js
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
    babel({ 
      babelHelpers: 'bundled',
      configFile: './babel.config.json', // 指定配置文件
    }),
  ],
};
```

**3. 使用 @babel/runtime（推荐）**
默认情况下，Babel 会将一些辅助函数（如 _extends）直接插入到代码中，导致重复代码。通过使用 @babel/runtime，可以减小打包体积。

安装依赖

```js
npm install --save @babel/runtime
npm install --save-dev @babel/plugin-transform-runtime
```

配置 Babel

```js
{
  "presets": ["@babel/preset-env"],
  "plugins": [
    ["@babel/plugin-transform-runtime", { "useESModules": true }]
  ]
}
```

修改 Rollup 配置

``` js
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
  plugins: [
    babel({
      babelHelpers: 'runtime', // 使用 @babel/runtime
      exclude: 'node_modules/**', // 不转换 node_modules 中的代码
    }),
  ],
};
```
### 注意事项

1. Tree Shaking 与 @babel/preset-env 的配置

- 确保 Babel 配置中关闭模块转换（modules: false）以保留 Tree Shaking 特性。

2. babelHelpers 的选择

- bundled: 默认，将 Babel helpers 嵌入到输出文件中。
- runtime: 减少重复代码，需要安装 @babel/runtime。
- inline: 将每个辅助函数直接内联到使用它的地方（代码体积较大，不推荐）。

3. 避免处理 Node.js 模块 使用 exclude: 'node_modules/**' 排除对第三方库的处理，除非这些库需要被转换。

4. 插件顺序 确保 @rollup/plugin-babel 位于插件列表的最后，除非有特殊需求。

