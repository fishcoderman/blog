# Webpack watch 模式和 HMR 的区别

::: tip
在Webpack开发过程中，watch模式和HMR（热模块替换）都是用来提升开发效率的重要功能。理解它们的区别和适用场景，能帮助我们选择最合适的开发方式。
:::

## 核心区别对比

| 对比维度 | Watch 模式 | HMR（热模块替换） |
|---------|-----------|-----------------|
| **作用** | 监听文件变更，自动重新编译 | 监听文件变更，仅替换变更的模块（无需刷新页面） |
| **是否刷新页面** | ✅ 会刷新整个页面 | ❌ 不会刷新页面，只更新修改的模块 |
| **适用场景** | 适用于任何项目（即使没有 Webpack Dev Server） | 适用于前端开发（如 React、Vue），Webpack Dev Server 支持 |
| **编译效率** | ⏳ 较慢，因为每次都会重新打包整个 bundle.js | 🚀 更快，只重新编译变更的部分 |
| **缓存** | ❌ 每次都重新编译所有代码 | ✅ 保留 JavaScript 运行状态（React 组件状态、Vuex 数据不会丢失） |
| **配置复杂度** | 🟢 简单，只需 watch: true | 🔴 较复杂，需要 Webpack Dev Server + HMR 插件 |
| **适合的文件类型** | ✅ 任何文件（JS、CSS、HTML 等） | ⚠️ 仅支持可热替换的模块（JS、CSS，但不支持 HTML） |

## Watch 模式详解

### 工作原理

Watch 模式会监听文件变化，当文件更新时：

1. **检测变更的文件**
2. **重新解析整个依赖图**
3. **重新编译整个 bundle.js**
4. **触发 webpack-dev-server 刷新浏览器页面**
5. **重新加载，重新执行所有 JavaScript 代码**

### 配置示例

#### 基础配置

```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  watch: true // 启用监听模式
};
```

#### 优化配置（防止重复编译）

```javascript
module.exports = {
  watch: true,
  watchOptions: {
    ignored: /node_modules/, // 忽略 node_modules，提高性能
    aggregateTimeout: 300, // 300ms 内多次变更，合并处理
    poll: 1000 // 轮询模式，每 1000ms 轮询一次（适用于 Windows）
  }
};
```

### Watch 模式的局限

- **每次都会刷新整个页面，用户体验较差**
- **不能保持 React 组件状态**（刷新后 UI 会重置）
- **编译速度较慢**（因为整个 bundle.js 都会重新打包）

### 适用场景

- ✅ Node.js 后端项目（不需要前端 HMR）
- ✅ 构建 library（库）或 CLI 工具
- ✅ 纯 JavaScript/TypeScript 项目
- ✅ 开发环境不需要 Webpack Dev Server

## HMR（热模块替换）详解

### 工作原理

HMR 不会刷新整个页面，而是只替换变更的模块：

1. **Webpack 监听文件变更**
2. **增量编译受影响的模块**
3. **WebSocket 通知浏览器**
4. **浏览器替换旧模块代码**
5. **立即生效，页面不会刷新**
6. **状态不丢失**（React 组件状态、Vuex/Redux 数据不会重置）

### 配置示例

#### 安装依赖

```bash
npm install webpack-dev-server --save-dev
```

#### Webpack 配置

```javascript
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist',
    publicPath: '/' // 必须设置 publicPath，否则 HMR 可能无法工作
  },
  devServer: {
    hot: true, // 启用 HMR
    static: './dist',
    port: 3000
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin() // HMR 插件
  ]
};
```

#### React 中使用 HMR

```javascript
// 在 React 项目中使用 react-hot-loader 或 React Fast Refresh
if (module.hot) {
  module.hot.accept('./App', () => {
    // 当 App 组件更新时，不刷新页面，只重新渲染组件
    const NextApp = require('./App').default;
    ReactDOM.render(<NextApp />, document.getElementById('root'));
  });
}
```

### HMR 的局限

- **不能热替换 HTML**（HTML 变更时，仍然需要刷新页面）
- **某些 JavaScript 逻辑不支持 HMR**（如 localStorage 依赖）
- **生产环境不推荐使用**（通常只用于开发）

### 适用场景

- ✅ 前端 React/Vue 开发
- ✅ 需要 CSS 热更新
- ✅ 希望保持组件状态（如 Redux store 不重置）
- ✅ 需要更快的开发体验

## 实际开发中的选择

### 使用 Watch 模式

```javascript
// package.json
{
  "scripts": {
    "dev": "webpack --watch",
    "build": "webpack --mode=production"
  }
}
```

适合：
- 简单的项目
- 不需要保持状态
- 后端项目

### 使用 HMR

```javascript
// package.json
{
  "scripts": {
    "dev": "webpack serve --mode=development",
    "build": "webpack --mode=production"
  }
}
```

适合：
- React/Vue 等前端框架
- 需要快速开发反馈
- 复杂的用户交互

## 性能对比

### 编译速度测试

```javascript
// 大型项目中的表现（仅供参考）
// Watch 模式：每次变更 2-5 秒
// HMR 模式：每次变更 0.1-0.5 秒
```

### 开发体验对比

| 场景 | Watch 模式 | HMR 模式 |
|------|-----------|----------|
| **修改 CSS** | 页面刷新，滚动位置丢失 | 样式即时更新，页面状态保持 |
| **修改 React 组件** | 页面刷新，组件状态重置 | 组件热更新，状态保持 |
| **修改工具函数** | 页面刷新，重新执行所有代码 | 只更新相关模块 |
| **修改 HTML** | 页面刷新 | 页面刷新（HMR 不支持 HTML） |

## 总结

### 核心建议

1. **Watch 适用于任何 Webpack 项目**，但会刷新整个页面
2. **HMR 更适合前端开发**，支持 React/Vue 热更新，速度更快
3. **如果只是 watch**，代码会重新执行；**HMR 只替换变更的部分**，不会丢失状态
4. **生产环境通常不会使用 HMR**，只在开发时启用

### 一句话总结

🚀 **选择原则**：
- 👉 如果你只是想监听文件变更，使用 **watch**
- 👉 如果你是前端开发（React/Vue），使用 **HMR**，体验更流畅！ 🎉

