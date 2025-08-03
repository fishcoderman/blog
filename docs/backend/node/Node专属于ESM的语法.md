# Node.js 中 ESM 独有的核心语法

在 Node.js 中，ES Modules (ESM) 引入了许多与 CommonJS 不同的现代语法和功能。掌握这些特性对于编写现代化、可维护的 Node.js 应用至关重要。

本文将详细介绍 ESM 独有的核心语法，并与 CommonJS 进行对比。

## 1. `import.meta`：模块元信息

`import.meta` 是一个包含模块元信息的对象，这是 ESM 的一个标志性特性。

- **`import.meta.url`**: 返回当前模块的完整 `file://` URL。

  ```javascript
  console.log(import.meta.url); 
  // 输出: file:///path/to/your-module.mjs
  ```

- **`import.meta.resolve()`** (实验性): 用于解析模块路径，功能类似于 `require.resolve`，但返回一个 Promise。

  ```javascript
  const resolvedPath = await import.meta.resolve('lodash');
  console.log(resolvedPath); 
  // 输出: file:///path/to/node_modules/lodash/index.js
  ```

## 2. 顶层 `await`

在 ESM 中，可以直接在模块的顶层使用 `await`，无需将其包裹在 `async` 函数内。这对于初始化依赖异步操作的资源非常有用。

```javascript
// 直接在顶层等待异步操作完成
const response = await fetch('https://api.example.com/data');
const data = await response.json();
console.log(data);
```

- **CommonJS 对比**: 在 CommonJS 中，`await` 必须在 `async` 函数内部使用。

## 3. 命名导出 (Named Exports)

ESM 提供了更明确的 `export` 语法来导出多个变量。

- **导出**:

  ```javascript
  export const name = 'MyModule';
  export function hello() {
    return 'Hello, World!';
  }
  ```

- **导入**:

  ```javascript
  import { name, hello } from './my-module.mjs';
  ```

- **CommonJS 对比**: 需要将所有要导出的成员挂载到 `exports` 对象上。

## 4. 默认导出 (Default Export)

ESM 使用 `export default` 语法来指定模块的默认导出。

- **导出**:

  ```javascript
  // 导出一个对象
  export default {
    version: '1.0.0'
  };
  ```

- **导入**:

  ```javascript
  import myModule from './my-module.mjs';
  console.log(myModule.version); // '1.0.0'
  ```

- **CommonJS 对比**: 使用 `module.exports` 进行默认导出。

## 5. 动态导入 (Dynamic `import()`)

ESM 支持使用 `import()` 函数动态加载模块，它返回一个 Promise。

```javascript
async function loadModule() {
  const myModule = await import('./my-module.mjs');
  myModule.hello();
}
```

- **CommonJS 对比**: `require()` 是同步执行的，在需要异步加载模块时存在局限。

## 6. 导入时重命名 (`as` 关键字)

导入时，可以使用 `as` 关键字为导入的变量重命名，以避免命名冲突。

```javascript
import { hello as sayHello } from './my-module.mjs';
sayHello();
```

## 7. 聚合导出 (Re-export)

ESM 允许从其他模块直接重新导出，简化了模块的组织。

```javascript
// 重新导出另一个模块的所有命名导出
export * from './other-module.mjs';

// 重新导出指定内容
export { foo, bar } from './another-module.mjs';
```

## 8. JSON 模块导入

在 ESM 中导入 JSON 文件时，需要使用导入断言（Import Assertions）来明确指定模块类型（Node.js v17.5+）。

```javascript
import config from './config.json' assert { type: 'json' };
console.log(config.setting);
```

- **CommonJS 对比**: `require('./config.json')` 会自动解析 JSON 文件。

## 9. 默认启用严格模式 (Strict Mode)

所有 ESM 模块默认在严格模式下执行，这有助于捕获常见的编码错误，例如：

- 禁止使用未声明的变量。
- 禁止使用 `with` 语句。
- 禁止使用 `arguments.callee`。
- 禁止函数有重复的参数名。

## 10. 不再有 `__dirname` 和 `__filename`

在 ESM 中，`__dirname` 和 `__filename` 这两个 CommonJS 特有的变量不再可用。需要通过 `import.meta.url` 来获取当前文件的路径。

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用 path.resolve 拼接路径
const configPath = path.resolve(__dirname, 'config.json');
console.log(configPath); // 输出: /path/to/your/project/config.json
```

## 11. 不再有 `require`、`exports` 和 `module`

ESM 使用 `import` 和 `export` 关键字，因此 CommonJS 中的 `require`、`exports` 和 `module` 全局变量在 ESM 中不可用。

## 12. 模块作用域差异

- **CommonJS**: 顶层 `this` 指向 `module.exports`。
- **ESM**: 顶层 `this` 的值是 `undefined`。

## 总结：ESM 与 CommonJS 核心语法对比

| 特性 | ESM | CommonJS |
| :--- | :--- | :--- |
| **元信息** | `import.meta.url` | `__filename` 和 `__dirname` |
| **动态导入** | `await import('./module.mjs')` (异步) | `require('./module.js')` (同步) |
| **顶层 `await`** | ✅ 支持 | ❌ 不支持 (需 `async` 函数) |
| **命名导出** | `export const foo = 'bar'` | `exports.foo = 'bar'` |
| **默认导出** | `export default obj` | `module.exports = obj` |
| **JSON 导入** | `import data from './data.json' assert { type: 'json' }` | `require('./data.json')` |
| **严格模式** | 默认启用 | 需手动添加 `'use strict'` |

## 何时使用 ESM？

- **现代 Node.js 项目**: 特别是 Node.js 14+。
- **需要静态分析**: ESM 的静态结构更利于 Tree Shaking 等优化。
- **前后端代码共享**: 当的代码需要在浏览器和 Node.js 环境中复用时。
- **使用现代特性**: 当需要 `import.meta` 或顶层 `await` 等新功能时。

要在的项目中启用 ESM，可以在 `package.json` 中设置 `"type": "module"`，或将文件扩展名改为 `.mjs`。
