在 Node.js 的 **ES Modules (ESM)** 中，除了 `import.meta` 之外，还有一些专属于 ESM 的语法和特性。以下是常见的 ESM 特有语法和功能：


## **1. `import.meta` 相关**
`import.meta` 是一个 ESM 特有的元属性，提供模块的元信息，常用属性包括：
- **`import.meta.url`**  
  返回当前模块的完整文件 URL（`file://` 协议）。  
  ```javascript
  console.log(import.meta.url); // 输出: file:///path/to/module.mjs
  ```
- **`import.meta.resolve()`**（实验性）  
  解析模块路径（类似 `require.resolve`），返回 Promise。  
  ```javascript
  const resolvedPath = await import.meta.resolve('lodash');
  console.log(resolvedPath); // 输出: /path/to/node_modules/lodash/index.js
  ```
---

## **2. 顶层 `await`**
ESM 允许在模块的顶层直接使用 `await`（无需包裹在 `async` 函数中）：
```javascript
// 直接等待异步操作
const data = await fetch('https://api.example.com/data');
console.log(data);
```
- **CommonJS 不支持**，必须用 `async` 函数包裹。

---

## **3. 命名导出（Named Exports）**
ESM 支持精确导出多个变量（CommonJS 需手动挂载到 `exports`）：
```javascript
// 导出
export const foo = 'bar';
export const baz = () => console.log('hello');

// 导入
import { foo, baz } from './module.mjs';
```

---

## **4. 默认导出（Default Export）**
ESM 支持 `export default`（CommonJS 需用 `module.exports =`）：
```javascript
// 导出
export default { foo: 'bar' };

// 导入
import myModule from './module.mjs';
console.log(myModule.foo); // 'bar'
```

---

## **5. 动态导入（Dynamic `import()`）**
ESM 支持动态加载模块（返回 Promise）：
```javascript
const module = await import('./module.mjs');
```
- **CommonJS 的 `require()` 是同步的**，无法直接替代。

---

## **6. 导入时重命名（`as` 语法）**
ESM 允许在导入时重命名变量：
```javascript
import { foo as myFoo } from './module.mjs';
console.log(myFoo); // 'bar'
```

---

## **7. 聚合导出（Re-export）**
ESM 支持直接重新导出其他模块的内容：
```javascript
// 从另一个模块导出所有命名导出
export * from './other-module.mjs';

// 导出部分内容
export { foo, bar } from './another-module.mjs';
```

---

## **8. 导入 JSON 模块**
ESM 中导入 JSON 必须使用完整路径和扩展名，并声明 `assert { type: 'json' }`（Node.js ≥ 17.5）：
```javascript
import data from './data.json' assert { type: 'json' };
console.log(data.key);
```
- **CommonJS** 直接 `require('./data.json')`。

---

## **9. 严格模式（Strict Mode）**
ESM 默认启用严格模式，以下行为会报错：
- 未声明的变量（`x = 10`）。
- `with` 语句。
- `arguments.callee`。
- 重复的函数参数（`function (a, a) {}`）。

---

## **10. 无 `__dirname` 和 `__filename`**
ESM 中不能直接使用 `__dirname` 和 `__filename`，需通过 `import.meta.url` 转换：
  ```js
    import path from 'path';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    
    // 获取当前文件的 __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // 使用 path.resolve 拼接路径
    const configPath = path.resolve(__dirname, 'config.json');
    console.log(configPath); // 输出: /项目路径/config.json
    
    // 动态解析模块路径（实验性）
    const lodashPath = await import.meta.resolve('lodash');
    console.log(lodashPath); // 输出: /node_modules/lodash/index.js
  ```

---

## **11. 无 `require`、`exports`、`module`**
ESM 中以下 CommonJS 变量不存在：
- `require()` → 改用 `import` 或 `import()`。
- `exports` → 改用 `export`。
- `module` → 改用 `export default`。

---

## **12. 模块作用域差异**
- **CommonJS**：`this` 指向 `module.exports`。
- **ESM**：顶层 `this` 是 `undefined`。

---

## **总结：ESM 特有语法**
| 特性                     | ESM 语法示例                          | CommonJS 等效写法           |
|--------------------------|---------------------------------------|-----------------------------|
| 元信息                   | `import.meta.url`                     | `__filename`（需手动处理）  |
| 动态导入                 | `await import('./module.mjs')`        | `require('./module.js')`     |
| 顶层 `await`             | `const data = await fetch(...)`       | 需包裹在 `async` 函数中      |
| 命名导出                 | `export const foo = 'bar'`            | `exports.foo = 'bar'`        |
| 默认导出                 | `export default obj`                  | `module.exports = obj`       |
| JSON 导入                | `import data from './data.json' assert { type: 'json' }` | `require('./data.json')` |
| 严格模式                 | 默认启用                              | 需手动 `'use strict'`        |

---

## **何时使用 ESM 语法？**
- 现代 Node.js 项目（≥ Node.js 12）。
- 需要静态分析（如 Tree Shaking）。
- 与浏览器代码共享模块。
- 需要 `import.meta` 或顶层 `await` 等特性。

如果需要兼容旧版 Node.js，可以通过 `package.json` 的 `"type": "module"` 或 `.mjs` 扩展名显式启用 ESM。