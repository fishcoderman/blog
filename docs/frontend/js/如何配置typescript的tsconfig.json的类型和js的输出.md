在 TypeScript 中，`tsconfig.json` 是用来配置 TypeScript 编译器的文件。通过设置 `tsconfig.json`，我们可以指定如何输出类型定义文件 (`.d.ts`) 以及编译后的 JavaScript 文件 (`.js`)。

### 1. 基本目录结构

假设以下是项目的目录结构：
```
src/
  utils/
    math.ts
    string.ts
  components/
    button.ts
    card.ts
tsconfig.json
```

我们希望：
- 编译后的 JavaScript 文件输出到 `dist/` 目录中，并保留原有的目录结构。
- 类型定义文件 (`.d.ts`) 也输出到 `dist/`，用于其他项目的类型支持。

---

### 2. 配置 `tsconfig.json`

#### 示例配置
```json
{
  "compilerOptions": {
    "outDir": "./dist", // 指定输出目录
    "declaration": true, // 生成 .d.ts 类型定义文件
    "declarationDir": "./dist", // 类型定义文件的输出目录
    "emitDeclarationOnly": false, // 是否只生成 .d.ts 文件，默认 false（生成 .js 和 .d.ts）
    "module": "ESNext", // 指定模块系统（如 ESNext, CommonJS）
    "target": "ES2017", // 指定编译后 JavaScript 的目标版本
    "strict": true, // 启用严格模式
    "esModuleInterop": true, // 允许 ES 模块和 CommonJS 模块互操作
    "skipLibCheck": true, // 跳过库文件的类型检查
    "sourceMap": true, // 生成 Source Map 文件
    "rootDir": "./src", // 指定输入文件的根目录（源文件目录）
    "moduleResolution": "node", // 模块解析策略
    "resolveJsonModule": true // 支持导入 JSON 文件
  },
  "include": ["src/**/*.ts"], // 指定哪些文件需要被编译
  "exclude": ["node_modules", "dist"] // 排除不需要编译的文件
}
```

---

### 3. 配置项详解

#### 输出 JavaScript 文件 (`outDir`)
- `outDir` 用于指定编译后 JavaScript 文件的输出目录。例如：
  - 输入文件：`src/utils/math.ts`
  - 输出文件：`dist/utils/math.js`

#### 输出类型文件 (`declaration` 和 `declarationDir`)
- `declaration: true`：开启类型定义文件的生成，生成 `.d.ts` 文件。
  - 输入文件：`src/utils/math.ts`
  - 输出文件：`dist/utils/math.d.ts`
- `declarationDir`：指定 `.d.ts` 文件的输出目录，默认为 `outDir`。

#### 仅生成类型文件 (`emitDeclarationOnly`)
- 如果你只需要 `.d.ts` 文件，而不需要 `.js` 文件，可以设置：
  ```json
  "emitDeclarationOnly": true
  ```
  - 输出结果：只生成 `.d.ts` 文件，不会生成 `.js` 文件。

#### `rootDir` 和目录结构
- `rootDir` 指定 TypeScript 源文件的根目录，编译后会保留源文件的目录结构。例如：
  - `rootDir: "./src"`
  - 输入文件：`src/components/button.ts`
  - 输出文件：`dist/components/button.js`

#### Source Map (`sourceMap`)
- 开启 `sourceMap` 后，TypeScript 会为每个文件生成一个 `.map` 文件，用于调试。例如：
  - 输入文件：`src/utils/math.ts`
  - 输出文件：
    - `dist/utils/math.js`
    - `dist/utils/math.js.map`

---

### 4. 输出结果示例

#### 编译前：
```
src/
  utils/
    math.ts
    string.ts
  components/
    button.ts
    card.ts
```

#### 编译后（`dist/`）：
```
dist/
  utils/
    math.js
    math.d.ts
    string.js
    string.d.ts
  components/
    button.js
    button.d.ts
    card.js
    card.d.ts
```

---

### 5. 只输出类型定义文件

如果你的项目是一个库（Library），可能只需要输出 `.d.ts` 文件，而不需要输出 `.js` 文件。可以通过设置 `emitDeclarationOnly: true` 实现。

#### 配置示例
```json
{
  "compilerOptions": {
    "outDir": "./dist", // 输出目录
    "declaration": true, // 生成类型定义文件
    "emitDeclarationOnly": true, // 仅生成类型定义文件，不生成 .js 文件
    "rootDir": "./src" // 指定源文件目录
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### 编译后输出结果：
```
dist/
  utils/
    math.d.ts
    string.d.ts
  components/
    button.d.ts
    card.d.ts
```

---

### 6. 常见问题及解决

#### 问题 1：编译后目录结构不正确
- 确保 `rootDir` 设置为源文件的根目录（如 `src`）。
- 如果未设置 `rootDir`，TypeScript 可能会将所有文件的相对路径错误地计算为基于项目根目录。

#### 问题 2：不生成 `.d.ts` 文件
- 确保 `declaration` 设置为 `true`。
- 如果使用了 `emitDeclarationOnly`，同时也需要 `.js` 文件，需将其设置为 `false`。

#### 问题 3：生成的 `.d.ts` 文件包含外部依赖
- 如果你不希望 `.d.ts` 文件包含外部依赖，可以设置 `skipLibCheck: true`，以避免检查库的类型定义。

---

### 7. 实际场景配置示例

#### 场景 1：前端应用项目（需要输出 JS 文件和 Source Map）
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "target": "ES6",
    "module": "ESNext",
    "sourceMap": true,
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### 场景 2：TypeScript 库项目（只需要 `.d.ts` 文件，不需要 `.js` 文件）
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "emitDeclarationOnly": true,
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 总结

通过 `tsconfig.json` 的配置，可以灵活控制 TypeScript 的编译输出，包括：
- 输出 `.js` 文件的目录结构。
- 生成 `.d.ts` 文件的位置。
- 是否只生成类型定义文件而不生成 JavaScript 文件。

根据项目需求调整 `outDir`、`declaration`、`emitDeclarationOnly`、`rootDir` 等配置，可以满足大多数项目的需求。