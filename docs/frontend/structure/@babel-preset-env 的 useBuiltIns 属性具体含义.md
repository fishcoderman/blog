`@babel/preset-env` 是 Babel 中一个非常强大的预设，它可以根据目标环境（如浏览器版本或 Node.js 版本）来自动转换代码，使其兼容性更好。而 `useBuiltIns` 属性是 `@babel/preset-env` 中一个重要的配置项，它与 Polyfill（填充）的使用有关。

### `useBuiltIns` 属性的含义
`useBuiltIns` 控制着 Babel 如何注入 Polyfill（例如 `core-js`）到你的代码中，以支持目标环境中缺失的特性。它有三个可选值：

1. **`false`**（默认值）：
   - Babel 不会自动添加任何 Polyfill。
   - 如果需要 Polyfill，你需要手动引入，比如在代码中显式地 `import 'core-js'`。

2. **`entry`**：
   - Babel 会根据目标环境，在入口文件中自动引入必要的 Polyfill。
   - 需要在项目的入口文件（如 `index.js`）中手动引入 `core-js` 和其他相关库。例如：
     ```javascript
     import "core-js/stable";
     import "regenerator-runtime/runtime";
     ```
   - Babel 会根据目标环境（通过 `targets` 配置指定）去移除不必要的 Polyfill，保留所需的部分。

3. **`usage`**：
   - Babel 会根据源代码中实际用到的特性，按需引入所需的 Polyfill，而不需要手动引入。
   - 这种方式通常是最智能的，因为它避免了不必要的代码引入，从而减小打包体积。

### 使用方式
#### 安装 Polyfill
如果你使用 `useBuiltIns`，需要安装 Polyfill，比如 `core-js` 和 `regenerator-runtime`：
```bash
npm install core-js regenerator-runtime
```

#### 配置 `.babelrc`
示例配置如下：
```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage", // 或 "entry"
        "corejs": 3,           // 指定 core-js 版本
        "targets": "> 0.25%, not dead" // 指定目标环境
      }
    ]
  ]
}
```

#### `useBuiltIns: "entry"` 示例
代码中需要手动引入：
```javascript
// index.js
import "core-js/stable";
import "regenerator-runtime/runtime";
```

#### `useBuiltIns: "usage"` 示例
代码中不需要手动引入，Babel 会自动按需添加。例如：
```javascript
// 你的代码中使用了新的 ES 特性
const promise = new Promise((resolve) => resolve('Hello'));
[1, 2, 3].includes(2);
```
Babel 会根据目标环境自动注入对应的 Polyfill。

### 注意事项
1. **`corejs` 版本**：
   - 如果使用 `useBuiltIns`，需要指定 `corejs` 版本（推荐使用 `core-js@3`）。
   - 配置时通过 `"corejs": 3` 来指定版本。

2. **按需引入的好处**：
   - 使用 `usage` 会减小打包体积，因为只引入必要的 Polyfill。

3. **目标环境**：
   - 一定要通过 `targets` 配置明确指定目标环境，否则可能会引入不必要的代码。


`entry` 和 `usage` 是 `@babel/preset-env` 中 `useBuiltIns` 的两个选项，它们的主要区别在于 **Polyfill 的引入方式** 和 **引入的范围**。


### `entry` 会自动引入所有目标环境需要的 Polyfill

当 `useBuiltIns` 设置为 `"entry"` 时，Babel 会根据你指定的目标环境（通过 `targets` 配置），在显式引入 `core-js` 的基础上，自动替换为目标环境所需的全部 Polyfill。

#### 工作机制
- 你需要手动在代码的入口文件中引入 `core-js` 和 `regenerator-runtime`：
  ```javascript
  import "core-js/stable";
  import "regenerator-runtime/runtime";
  ```
- Babel 会根据 `targets` 配置，移除不需要的 Polyfill，仅保留目标环境中需要的那些。

#### 特点
- **不依赖你的代码使用了哪些特性**，完全基于目标环境决定引入哪些 Polyfill。
- **引入的 Polyfill 是全局性的**：即使代码中没有使用某些特性，目标环境需要的 Polyfill 也会被引入。

#### 适用场景
- 适用于需要 **确保所有目标环境支持完整的现代特性** 的场景。
- 通常会引入较多的 Polyfill，因此打包体积可能会较大。


### `usage` 按代码实际使用的特性自动引入 Polyfill

当 `useBuiltIns` 设置为 `"usage"` 时，Babel 会自动分析你的代码，**根据代码中实际使用到的特性**，按需引入对应的 Polyfill。

#### 工作机制
- 你 **不需要在代码中显式引入 `core-js`**。
- Babel 会在编译阶段扫描代码，发现使用了哪些现代特性，比如 `Promise`、`Array.prototype.includes` 等，然后结合目标环境，注入所需的 Polyfill。

#### 特点
- **按需引入 Polyfill**：只引入代码中确实用到的特性，避免引入冗余的 Polyfill。
- **更小的打包体积**：因为只引入所需的部分，因此整体代码更精简。
- 不需要显式引入 `core-js`，Babel 自动完成。

#### 适用场景
- 适用于希望 **优化打包体积、只引入必要的特性** 的场景。
- 多用于现代前端项目，减少不必要的依赖。

---

### 核心区别对比

| 特性                   | `entry`                          | `usage`                           |
|------------------------|-----------------------------------|------------------------------------|
| **需要引入 `core-js`** | 是，手动引入                     | 否，Babel 自动按需添加             |
| **引入方式**           | 基于目标环境，注入所有必要的特性 | 根据代码实际使用的特性按需注入      |
| **代码分析**           | 不分析代码，仅根据目标环境配置    | 分析代码实际使用的特性             |
| **打包体积**           | 可能较大（包含未使用的 Polyfill） | 较小（仅包含实际使用的 Polyfill）  |
| **适用场景**           | 确保目标环境完整支持所有特性      | 优化打包体积，按需支持特性          |

---

### 示例对比

#### 配置
假设 `.babelrc` 配置如下：
```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry", // 或 "usage"
        "corejs": 3,
        "targets": "> 0.25%, not dead"
      }
    ]
  ]
}
```

#### 代码
```javascript
// 代码中使用了 Promise 和 includes
const promise = new Promise((resolve) => resolve('Hello'));
[1, 2, 3].includes(2);
```

---

#### 使用 `useBuiltIns: "entry"`

你需要手动在入口文件中引入 `core-js`：
```javascript
import "core-js/stable";
import "regenerator-runtime/runtime";
```

Babel 会根据目标环境，替换为类似这样的代码：
```javascript
import "core-js/modules/es.promise";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.symbol"; 
// 还有其他目标环境需要的特性，即使代码中没有用到。
```
- **特点**：即使你没有用到 `Object.assign` 或 `Symbol`，但如果目标环境需要这些特性，Babel 仍会引入对应的 Polyfill。

---

#### 使用 `useBuiltIns: "usage"`

不需要手动引入 `core-js`，Babel 会自动按需添加：
```javascript
// Babel 自动添加所需的 Polyfill
import "core-js/modules/es.promise";
import "core-js/modules/es.array.includes";
```
- **特点**：只引入代码中用到的 Polyfill（如 `Promise` 和 `Array.prototype.includes`），未用到的不会引入。

---

### 总结

- `useBuiltIns: "usage"` 是最推荐的方式，它智能按需注入。
- 确保安装和配置 `core-js` 和 `regenerator-runtime`。
- 结合目标环境配置，可以更高效地支持现代浏览器和旧环境。
- **`entry`**：基于目标环境引入所有必要的 Polyfill，适合需要完整兼容性的场景，但可能导致打包体积较大。
- **`usage`**：按代码实际使用的特性引入 Polyfill，适合关注性能和打包体积的场景。
- 如果打包体积敏感且希望优化性能，推荐使用 **`usage`**。