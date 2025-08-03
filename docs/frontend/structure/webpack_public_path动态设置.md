下面是一个具体的案例，展示如何在 Webpack 中使用 `__webpack_public_path__` 动态设置公共路径。

### 案例示例

#### 1. 创建项目结构

首先，创建一个简单的项目结构：

```
my-webpack-app/
├── dist/
├── src/
│   ├── index.js
│   └── module.js
├── package.json
└── webpack.config.js
```

#### 2. 安装依赖

在项目目录下运行以下命令安装 Webpack 和相关依赖：

```bash
npm init -y
npm install --save-dev webpack webpack-cli webpack-dev-server
```

#### 3. 配置 Webpack

在 `webpack.config.js` 中配置 Webpack：

```javascript
const path = require('path');

module.exports = {
  mode: 'development', // 或 'production'
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/', // 默认的 publicPath
  },
  devServer: {
    static: './dist',
    hot: true, // 启用热模块替换
  },
};
```

#### 4. 编写代码

在 `src/index.js` 中，动态设置 `__webpack_public_path__`：

```javascript
// src/index.js

// 动态设置 publicPath
if (process.env.NODE_ENV === 'production') {
  __webpack_public_path__ = 'https://cdn.example.com/assets/'; // 生产环境的 CDN
} else {
  __webpack_public_path__ = '/assets/'; // 开发环境的本地路径
}

// 导入模块
import('./module').then(module => {
  module.doSomething();
});
```

在 `src/module.js` 中，创建一个简单的模块：

```javascript
// src/module.js

export function doSomething() {
  console.log('Module loaded successfully!');
}
```

#### 5. 添加 HTML 文件

在 `dist` 目录下创建一个 `index.html` 文件，以加载生成的 JavaScript：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webpack Dynamic Public Path</title>
</head>
<body>
    <script src="bundle.js"></script>
</body>
</html>
```

#### 6. 运行项目

你可以通过设置环境变量来运行项目：

- **开发环境**：
  ```bash
  NODE_ENV=development npx webpack serve
  ```

- **生产环境**：
  ```bash
  NODE_ENV=production npx webpack --mode production
  ```

在开发模式下，`publicPath` 将被设置为 `/assets/`，而在生产模式下，将被设置为 `https://cdn.example.com/assets/`。

运行时修改 `__webpack_public_path__` 主要影响的是动态加载的模块和相关的资源路径。具体来说，它会影响以下几个方面：

### 1. 动态加载的模块

当使用 `import()` 动态加载模块时，`__webpack_public_path__` 的值会决定这些模块的加载路径。例如：

```javascript
import('./module').then(module => {
  module.doSomething();
});
```

如果你在运行时修改了 `__webpack_public_path__`，这条语句会使用新的公共路径来查找和加载 `module.js` 文件。

### 2. 资源引用

任何依赖于公共路径的静态资源（如图片、字体、样式表等）也会受到影响。假设你在代码中引用了某些资源，例如：

```javascript
const img = new Image();
img.src = `${__webpack_public_path__}images/logo.png`;
document.body.appendChild(img);
```

在这种情况下，`img.src` 会根据运行时修改的 `__webpack_public_path__` 来构建完整的 URL。

### 3. CSS 和其他静态资源

对于 CSS 文件中引用的背景图片或其他静态资源，`publicPath` 也会影响这些资源的加载路径。如果 CSS 文件是通过 Webpack 处理的，那么在运行时修改 `__webpack_public_path__` 也可能影响到这些资源。

### 总结

- **影响范围**：`__webpack_public_path__` 修改后主要影响动态加载的模块及其依赖的资源路径，确保加载时使用最新的路径。
- **静态资源**：对于已经在构建时确定的静态资源（如直接在 HTML 中引用的文件），`publicPath` 的运行时修改不会影响它们。

因此，使用 `__webpack_public_path__` 动态修改路径时，确保它在模块加载之前设置，以便影响到所有相关资源的加载路径。

