在 TypeScript 的 `tsconfig.json` 中，`target`、`lib` 和 `module` 是三个核心编译选项，它们分别控制不同的编译行为。以下是它们的详细区别和作用：

---

### 1. **`target`（目标版本）**
#### **作用**  
指定 TypeScript 编译后的 JavaScript 代码的 **ECMAScript 版本**。  
决定了生成的代码语法兼容性（如 `let`、`const`、箭头函数、`Promise` 等）。

#### **常用值**  
• `ES3`（最旧，兼容 IE6）  
• `ES5`（默认，兼容大部分旧浏览器）  
• `ES6`/`ES2015`（支持现代语法）  
• `ES2016` ~ `ES2022`（逐年更新的标准）  
• `ESNext`（最新实验性特性）

#### **示例**  
```json
{
  "compilerOptions": {
    "target": "ES6"  // 生成 ES6 代码
  }
}
```
#### **影响**  
• 如果设为 `ES5`，TypeScript 会将 `async/await` 编译为 `Promise` 的链式调用（需要 `lib: ["ES2015.Promise"]`）。  
• 如果设为 `ES2017`，`async/await` 会直接保留为原生语法。

---

### 2. **`lib`（内置库类型）**
#### **作用**  
指定 TypeScript 在编译时 **可用的 JavaScript 内置 API 的类型定义**（如 `Array.map`、`Promise`、`document`）。  
不直接影响生成的代码，但影响类型检查和代码提示。

#### **常用值**  
• **JavaScript 标准库**：`ES5`、`ES6`、`ES2015`、`ES2020` 等。  
• **环境 API**：`DOM`（浏览器 API）、`WebWorker`、`ScriptHost`。  
• **特殊库**：`ES2015.Promise`（仅 Promise 类型）、`ES2021.String`（字符串新方法）。

#### **示例**  
```json
{
  "compilerOptions": {
    "lib": ["ES6", "DOM"]  // 允许使用 ES6 语法和浏览器 API
  }
}
```
#### **默认行为**  
• 如果未指定 `lib`，TypeScript 会根据 `target` 自动选择（如 `target: ES5` 默认包含 `DOM`、`ES5`、`ScriptHost`）。  
• 如果显式指定 `lib`，必须手动包含所有需要的库（如 `DOM` 或 `ES6`）。

#### **常见场景**  
• 浏览器项目：`lib: ["ES6", "DOM"]`。  
• Node.js 项目：`lib: ["ES6"]`（或加上 `ES2020` 等新特性）。  
• 禁用默认库：`lib: []`（需自行提供所有类型）。

---

### 3. **`module`（模块系统）**
#### **作用**  
指定编译后的代码使用哪种 **模块化规范**（如 `import/export` 如何转换为 `require/module.exports`）。

#### **常用值**  
• `CommonJS`（Node.js 默认，使用 `require`）  
• `ES6`/`ES2015`（现代浏览器支持的 `import/export`）  
• `UMD`（兼容 CommonJS 和 AMD）  
• `AMD`（RequireJS）  
• `System`（SystemJS 模块加载器）

#### **示例**  
```json
{
  "compilerOptions": {
    "module": "CommonJS"  // 生成 Node.js 适用的模块
  }
}
```
#### **影响**  
• 如果设为 `ES6`，生成的代码会保留 `import/export` 语法（需浏览器或打包工具支持）。  
• 如果设为 `CommonJS`，`import` 会被编译为 `require`，适合 Node.js 环境。

#### **与 `target` 的关系**  
• `target: ES5` + `module: ES6`：语法降级但模块语法保留（需打包工具处理）。  
• `target: ES6` + `module: CommonJS`：语法保留但模块转换为 `require`。

---

### **三者的协作关系**
| 选项         | 控制范围                  | 典型场景示例                          |
|--------------|--------------------------|---------------------------------------|
| `target`     | 生成代码的语法版本        | `ES5`（兼容旧浏览器）                 |
| `lib`        | 可用的 API 类型定义       | `["ES6", "DOM"]`（浏览器项目）        |
| `module`     | 模块化规范                | `CommonJS`（Node.js 项目）            |

---

### **配置示例**
#### **浏览器项目（现代语法 + DOM API）**
```json
{
  "compilerOptions": {
    "target": "ES6",
    "lib": ["ES6", "DOM"],
    "module": "ES6"
  }
}
```

#### **Node.js 项目（CommonJS 模块）**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "CommonJS"
  }
}
```

---

### **常见问题**
1. **为什么代码编译后无法运行？**  
   • 检查 `target` 是否过高（如 `ES2022` 在旧浏览器中不支持）。  
   • 检查 `lib` 是否遗漏必要库（如浏览器项目忘记加 `DOM`）。  

2. **如何支持 `Promise`？**  
   • `target: ES5` 时需显式添加 `lib: ["ES2015.Promise"]` 或 `"ES2015"`。

3. **模块报错 `Cannot use import outside a module`？**  
   • 确保 `module` 和运行环境匹配（如 Node.js 用 `CommonJS`，浏览器用 `ES6` 并配合打包工具）。

---

通过合理配置这三个选项，可以精确控制 TypeScript 的编译行为，适应不同运行环境和开发需求。