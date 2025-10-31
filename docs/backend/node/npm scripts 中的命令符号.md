
# npm scripts 中的命令符号

介绍在 npm scripts 中常用的命令符号及其作用：

### **1. `&&` - 串行执行（AND 操作符）**

**作用**: 按顺序执行命令，前一个成功才执行下一个

```json
{
  "scripts": {
    "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    "deploy": "npm run build && npm publish"
  }
}
```

**特点**:
- ✅ 前一个命令成功（退出码 0）才执行下一个
- ❌ 任何一个命令失败，后续命令不执行
- 📊 类似逻辑 AND 运算

**示例**:
```bash
# 先测试，测试通过才构建
npm test && npm run build

# 三个命令依次执行
npm run lint && npm run test && npm run build
```

---

### **2. `||` - 备用执行（OR 操作符）**

**作用**: 前一个命令失败时才执行下一个

```json
{
  "scripts": {
    "start": "node server.js || node fallback.js",
    "test": "jest || echo '测试失败但继续'"
  }
}
```

**特点**:
- ✅ 前一个命令成功，后续命令不执行
- ❌ 前一个命令失败，执行下一个
- 📊 类似逻辑 OR 运算

**示例**:
```bash
# 优先使用 yarn，没有则用 npm
yarn install || npm install

# 尝试启动，失败则给出提示
npm start || echo "启动失败！请检查配置"
```

---

### **3. `;` - 无条件串行执行**

**作用**: 按顺序执行所有命令，无论成功或失败

```json
{
  "scripts": {
    "clean-build": "rm -rf build; mkdir build; tsc",
    "report": "npm test; npm run coverage; echo '完成'"
  }
}
```

**特点**:
- ✅ 前面命令失败，后续仍继续执行
- 📊 无条件执行所有命令
- ⚠️ 最后一个命令的退出码决定整体结果

**对比 `&&`**:
```bash
# 使用 && - 删除失败则不创建
"clean": "rm -rf build && mkdir build"

# 使用 ; - 删除失败也会创建
"clean": "rm -rf build; mkdir build"
```

---

### **4. `&` - 并行执行（后台运行）**

**作用**: 多个命令同时执行，不等待前一个完成

```json
{
  "scripts": {
    "dev": "npm run watch:css & npm run watch:js & npm run server",
    "start-all": "npm run api & npm run frontend"
  }
}
```

**特点**:
- 🔄 命令在后台并行运行
- ⚡ 不阻塞，立即执行下一个
- ⚠️ 注意：在 Windows 上可能不工作

**跨平台方案**:
```json
{
  "scripts": {
    "dev": "concurrently \"npm:watch:*\"",
    "watch:css": "...",
    "watch:js": "..."
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

---

### **5. `|` - 管道（Pipe）**

**作用**: 将前一个命令的输出作为下一个命令的输入

```json
{
  "scripts": {
    "list-js": "ls -la | grep '\\.js$'",
    "count-lines": "cat src/*.js | wc -l",
    "search": "npm list | grep react"
  }
}
```

**特点**:
- 📤 传递标准输出（stdout）
- 🔗 可以链式连接多个命令
- 💡 常用于过滤、统计、搜索

**实用示例**:
```bash
# 查找并统计 TODO 注释
"count-todos": "grep -r 'TODO' src/ | wc -l"

# 列出最大的文件
"largest-files": "du -ah | sort -rh | head -n 10"

# 查看依赖树中的特定包
"find-dep": "npm list | grep lodash"
```

---

### **6. `>` 和 `>>` - 重定向输出**

**作用**: 将命令输出保存到文件

```json
{
  "scripts": {
    "log-test": "npm test > test-results.txt",
    "append-log": "npm run build >> build.log",
    "error-log": "npm test 2> errors.txt"
  }
}
```

**符号对比**:
- `>` : 覆盖写入（清空原文件）
- `>>` : 追加写入（保留原内容）
- `2>` : 重定向错误输出（stderr）
- `&>` : 重定向所有输出（stdout + stderr）

**示例**:
```json
{
  "scripts": {
    "test:report": "npm test > report.txt 2>&1",
    "build:log": "npm run build >> build-history.log",
    "save-deps": "npm list > dependencies.txt"
  }
}
```

---

### **7. `$()` 或 `` ` ` `` - 命令替换**

**作用**: 将命令的输出作为另一个命令的参数

```json
{
  "scripts": {
    "version": "echo v$(node -e \"console.log(require('./package.json').version)\")",
    "tag": "git tag v`node -p \"require('./package.json').version\"`"
  }
}
```

**示例**:
```bash
# 使用 package.json 中的版本号创建标签
"git-tag": "git tag v$(cat package.json | grep version | awk '{print $2}')"

# 删除旧的构建文件
"clean": "rm -rf $(find . -name '*.old')"
```

---

### **8. `()` - 子 Shell**

**作用**: 在子 Shell 中执行命令组

```json
{
  "scripts": {
    "build-in-dir": "(cd backend && npm run build) && (cd frontend && npm run build)"
  }
}
```

**特点**:
- 🔒 不影响当前 Shell 的环境
- 📂 常用于切换目录后执行命令

---

### **9. `{}` - 命令分组**

**作用**: 在当前 Shell 中执行命令组

```json
{
  "scripts": {
    "multi": "{ npm run clean && npm run build; } || echo '失败'"
  }
}
```

---

## 📊 综合示例

让我创建一个展示多种符号的完整示例：

```json
{
  "scripts": {
    "// 1. 串行执行 - 必须都成功": "",
    "deploy": "npm run lint && npm run test && npm run build && npm publish",
    
    "// 2. 备用方案 - 失败时的后备": "",
    "start": "node server.js || node backup-server.js || echo '所有服务器都失败'",
    
    "// 3. 无条件执行 - 生成报告": "",
    "report": "npm run test; npm run coverage; npm run lint; echo '报告生成完成'",
    
    "// 4. 并行执行 - 开发环境": "",
    "dev": "npm run watch:css & npm run watch:js & npm run server",
    
    "// 5. 管道过滤 - 查找依赖": "",
    "find-react": "npm list | grep react",
    "count-todos": "grep -r 'TODO' src/ | wc -l",
    
    "// 6. 输出重定向 - 日志记录": "",
    "test:log": "npm test > test-results.txt 2>&1",
    "build:append": "npm run build >> build-history.log",
    
    "// 7. 复杂组合": "",
    "pre-commit": "npm run lint && npm run test || (echo '检查失败' && exit 1)",
    "ci": "npm ci && npm run build && npm test && npm run deploy || exit 1",
    
    "// 8. 跨平台兼容方案": "",
    "clean": "rimraf build dist",
    "parallel": "concurrently \"npm:watch:*\"",
    "sequential": "npm-run-all lint test build"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "npm-run-all": "^4.1.5",
    "rimraf": "^5.0.0"
  }
}
```

---

## ⚠️ 跨平台注意事项

### **问题**: Windows 和 Unix/Mac 的 Shell 不同

**Unix/Mac 使用**: bash/zsh  
**Windows 使用**: cmd.exe 或 PowerShell

### **解决方案**:

#### **1. 使用跨平台工具**
```json
{
  "scripts": {
    "clean": "rimraf build",           // 代替 rm -rf
    "copy": "cpy src dist",            // 代替 cp
    "mkdir": "mkdirp build",           // 代替 mkdir -p
    "parallel": "concurrently \"npm:watch:*\""  // 代替 &
  }
}
```

#### **2. 使用 npm-run-all**
```json
{
  "scripts": {
    "build": "npm-run-all clean transpile minify",
    "watch": "npm-run-all --parallel watch:*",
    "watch:css": "...",
    "watch:js": "..."
  }
}
```

#### **3. 使用 cross-env 设置环境变量**
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack"
  }
}
```

---

## 📝 实用技巧速查表

| 符号 | 作用 | 继续执行条件 | 典型用途 |
|------|------|--------------|----------|
| `&&` | 串行且 | 前面成功 | 构建流程 |
| `\|\|` | 串行或 | 前面失败 | 后备方案 |
| `;` | 串行无条件 | 总是 | 多任务执行 |
| `&` | 并行 | 立即 | 开发服务器 |
| `\|` | 管道 | 总是 | 过滤搜索 |
| `>` | 覆盖重定向 | 总是 | 生成报告 |
| `>>` | 追加重定向 | 总是 | 日志记录 |

---