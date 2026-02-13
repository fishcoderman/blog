# Mini Cursor 打造一个极简的 AI 编程助手

"如果 AI 只能聊天，那它充其量就是个话痨室友；但如果给它配上趁手的工具，它就能变成你的超级实习生！"

## 1. 前言：从"能说会道"到"能说会做"

### 1.1 AIGC 的觉醒之路

还记得第一次用 ChatGPT 的震撼吗？你问它"怎么写一个 React 组件"，它洋洋洒洒给你写了 100 行代码，看起来专业又靠谱。然后你兴冲冲地复制粘贴到项目里，结果... 报错了 😅

这就是纯 AIGC（AI Generated Content）的现状：它很聪明，但只是个"键盘侠"，只能告诉你"应该怎么做"，而不能真正帮你"动手做"。

### 1.2 Agent：给 AI 装上"手脚"

于是聪明的工程师们想：既然 AI 这么懂，为什么不让它自己动手呢？这就催生了 Agent 的概念——一个能够自主决策、调用工具、完成任务的智能代理。

想象一下，如果给 AI 配备以下能力：

- 👀 能看：读取文件内容
- ✍️ 能写：创建和修改文件
- 🏃 能跑：执行终端命令
- 🗂️ 能查：浏览目录结构
  
那它不就变成了一个 24 小时待命、永不抱怨的全栈工程师吗？（虽然可能偶尔会犯点小错误，但谁不会呢 😄）

### 1.3 Tool：Agent 的"瑞士军刀"

Tools（工具）就是赋予 Agent 超能力的关键。通过定义一组结构化的工具接口，AI 可以：

- 📖 调用 `read_file` 工具来查看代码
- 📝 调用 `write_file` 工具来生成文件
- 🔧 调用 `execute_command` 工具来运行 npm、git 等命令

这不就是 Cursor 或 Copilot 正在做的事情吗？没错！今天我们就来手撸一个 Mini Cursor，看看这背后的魔法到底是怎么实现的。

## 2. Mini Cursor 的实现思路：四个工具撑起一片天

### 2.1 核心架构

我们的 Mini Cursor 基于 LangChain 框架，架构非常简洁：

```text
用户需求 → LLM（大语言模型） → 工具调用 → 执行结果 → LLM 思考 → 下一步行动
          ↑______________________________________________|
                       （循环直到任务完成）
```

### 2.2 四大金刚工具

为了让 AI 能够像真正的程序员一样工作，我们设计了 4 个核心工具：

| 工具名称 | 功能描述 | 实际应用 |
|---------|---------|----------|
| read_file | 读取文件内容 | 查看现有代码、配置文件 |
| write_file | 写入/创建文件 | 生成组件、修改配置 |
| execute_command | 执行终端命令 | 安装依赖、启动服务 |
| list_directory | 列出目录结构 | 了解项目结构 |

### 2.3 工作流程示例

假设你告诉 AI："创建一个 React TodoList 应用"，它会这样工作：

**1️⃣ AI 思考："需要先创建项目"**

→ 调用 `execute_command("pnpm create vite react-todo-app --template react-ts")`

**2️⃣ AI 思考："看看生成了什么文件"**

→ 调用 `list_directory("react-todo-app")`

**3️⃣ AI 思考："需要修改 App.tsx 实现 TodoList"**

→ 调用 `read_file("react-todo-app/src/App.tsx")`

→ 调用 `write_file("react-todo-app/src/App.tsx", "...完整代码...")`

**4️⃣ AI 思考："该安装依赖了"**

→ 调用 `execute_command("pnpm install", workingDirectory: "react-todo-app")`

**5️⃣ AI 思考："启动开发服务器"**

→ 调用 `execute_command("pnpm run dev", workingDirectory: "react-todo-app")`

**✅ 完成！向用户汇报："React TodoList 应用已创建并启动！"**

## 3. 实现细节

### 3.1 创建大模型：让 AI "能用"

```javascript
const model = new ChatOpenAI({
  modelName: 'qwen-plus',
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});
```

### 3.2 工具定义：让 AI "看得懂"

使用 LangChain 的 `tool` API + Zod schema 定义工具：

```javascript
const readFileTool = tool(
  async ({ filePath }) => {
    const content = await fs.readFile(filePath, 'utf-8');
    return `文件内容:\n${content}`;
  },
  {
    name: 'read_file',
    description: '读取指定路径的文件内容',  // AI 会根据这个描述决定何时使用
    schema: z.object({
      filePath: z.string().describe('文件路径'),  // 参数类型约束
    }),
  },
);
```

**关键点：**

- ✅ `description` 要写得清楚，让 AI 知道何时该用这个工具
- ✅ `schema` 用 Zod 定义参数类型，防止 AI "乱填"
- ✅ 返回值要结构化，方便 AI 理解执行结果

> `writeFileTool`、`executeCommandTool`、`listDirectoryTool` 和 `readFileTool` 同理

### 3.3 工具绑定：给 AI "装备武器"

```javascript
const tools = [readFileTool, writeFileTool, executeCommandTool, listDirectoryTool];
const modelWithTools = model.bindTools(tools);  // 🔧 绑定工具
```

这一步相当于告诉 AI："你可以用这些工具，需要的时候随时调用！"

### 3.4 Agent 主循环：让 AI "自主工作"

```javascript
async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [
    new SystemMessage("你是一个项目管理助手，使用工具完成任务..."),
    new HumanMessage(query),
  ];

  for (let i = 0; i < maxIterations; i++) {
    // AI 思考使用哪个工具
    const response = await modelWithTools.invoke(messages);  
    messages.push(response);

    // 如果 AI 不再调用工具，说明任务完成
    if (!response.tool_calls || response.tool_calls.length === 0) {
      return response.content;  // 🎉 大功告成！
    }

    // 执行 AI 选择的工具
    for (const toolCall of response.tool_calls) {
      const foundTool = tools.find(t => t.name === toolCall.name);
      const toolResult = await foundTool.invoke(toolCall.args);
      
      // 把执行结果反馈给 AI
      messages.push(new ToolMessage({
        content: toolResult,
        tool_call_id: toolCall.id,
      }));
    }
  }
}
```

**工作原理：**

1. AI 接收任务 → 分析需要做什么
2. 决定调用哪些工具 → 执行工具
3. 看到工具执行结果 → 继续思考下一步
4. 重复 2-3 直到任务完成
5. 返回最终结果

### 3.5 项目源码

> **注意**：`OPENAI_API_KEY` 和 `OPENAI_BASE_URL` 是需要自己申请大模型的密钥和模型请求地址。

```javascript
// index.js
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { executeCommandTool, listDirectoryTool, readFileTool, writeFileTool } from './tools.js';
import chalk from 'chalk';

const model = new ChatOpenAI({
  modelName: 'qwen-plus',
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const tools = [readFileTool, writeFileTool, executeCommandTool, listDirectoryTool];

// 绑定工具到模型
const modelWithTools = model.bindTools(tools);

// Agent 执行函数
async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [
    new SystemMessage(`你是一个项目管理助手，使用工具完成任务。

当前工作目录: ${process.cwd()}

工具：
1. read_file: 读取文件
2. write_file: 写入文件
3. execute_command: 执行命令（支持 workingDirectory 参数）
4. list_directory: 列出目录

重要规则 - execute_command：
- workingDirectory 参数会自动切换到指定目录
- 当使用 workingDirectory 时，绝对不要在 command 中使用 cd
- 错误示例: { command: "cd react-todo-app && pnpm install", workingDirectory: "react-todo-app" }
这是错误的！因为 workingDirectory 已经在 react-todo-app 目录了，再 cd react-todo-app 会找不到目录
- 正确示例: { command: "pnpm install", workingDirectory: "react-todo-app" }
这样就对了！workingDirectory 已经切换到 react-todo-app，直接执行命令即可

回复要简洁，只说做了什么`),
    new HumanMessage(query),
  ];

  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen(`⏳ 正在等待 AI 思考...`));
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    // 检查是否有工具调用
    if (!response.tool_calls || response.tool_calls.length === 0) {
      console.log(`\n✨ AI 最终回复:\n${response.content}\n`);
      return response.content;
    }

    // 执行工具调用
    for (const toolCall of response.tool_calls) {
      const foundTool = tools.find(t => t.name === toolCall.name);
      if (foundTool) {
        const toolResult = await foundTool.invoke(toolCall.args);
        messages.push(
          new ToolMessage({
            content: toolResult,
            tool_call_id: toolCall.id,
          }),
        );
      }
    }
  }

  return messages[messages.length - 1].content;
}

const caseExample = `创建一个功能丰富的 React TodoList 应用：

1. 创建项目：echo -e "n\nn" | pnpm create vite react-todo-app --template react-ts
2. 修改 src/App.tsx，实现完整功能的 TodoList：
 - 添加、删除、编辑、标记完成
 - 分类筛选（全部/进行中/已完成）
 - 统计信息显示
 - localStorage 数据持久化
3. 添加复杂样式：
 - 渐变背景（蓝到紫）
 - 卡片阴影、圆角
 - 悬停效果
4. 添加动画：
 - 添加/删除时的过渡动画
 - 使用 CSS transitions
5. 列出目录确认

注意：使用 pnpm，功能要完整，样式要美观，要有动画效果

之后在 react-todo-app 项目中：
1. 使用 pnpm install 安装依赖
2. 使用 pnpm run dev 启动服务器
`;

try {
  await runAgentWithTools(caseExample);
} catch (error) {
  console.error(`\n❌ 错误: ${error.message}\n`);
}
```

```javascript
// tool.js
import { tool } from '@langchain/core/tools';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { z } from 'zod';

// 1. 读取文件工具
const readFileTool = tool(
  async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(`  [工具调用] read_file("${filePath}") - 成功读取 ${content.length} 字节`);
      return `文件内容:\n${content}`;
    } catch (error) {
      console.log(`  [工具调用] read_file("${filePath}") - 错误: ${error.message}`);
      return `读取文件失败: ${error.message}`;
    }
  },
  {
    name: 'read_file',
    description: '读取指定路径的文件内容',
    schema: z.object({
      filePath: z.string().describe('文件路径'),
    }),
  },
);

// 2. 写入文件工具
const writeFileTool = tool(
  async ({ filePath, content }) => {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`  [工具调用] write_file("${filePath}") - 成功写入 ${content.length} 字节`);
      return `文件写入成功: ${filePath}`;
    } catch (error) {
      console.log(`  [工具调用] write_file("${filePath}") - 错误: ${error.message}`);
      return `写入文件失败: ${error.message}`;
    }
  },
  {
    name: 'write_file',
    description: '向指定路径写入文件内容，自动创建目录',
    schema: z.object({
      filePath: z.string().describe('文件路径'),
      content: z.string().describe('要写入的文件内容'),
    }),
  },
);

// 3. 执行命令工具（带实时输出）
const executeCommandTool = tool(
  async ({ command, workingDirectory }) => {
    const cwd = workingDirectory || process.cwd();
    console.log(`  [工具调用] execute_command("${command}")${workingDirectory ? ` - 工作目录: ${workingDirectory}` : ''}`);

    return new Promise((resolve, reject) => {
      // 解析命令和参数
      const [cmd, ...args] = command.split(' ');

      const child = spawn(cmd, args, {
        cwd,
        stdio: 'inherit', // 实时输出到控制台
        shell: true,
      });

      let errorMsg = '';

      child.on('error', (error) => {
        errorMsg = error.message;
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`  [工具调用] execute_command("${command}") - 执行成功`);
          const cwdInfo = workingDirectory
            ? `\n\n重要提示：命令在目录 "${workingDirectory}" 中执行成功。如果需要在这个项目目录中继续执行命令，请使用 workingDirectory: "${workingDirectory}" 参数，不要使用 cd 命令。`
            : '';
          resolve(`命令执行成功: ${command}${cwdInfo}`);
        } else {
          console.log(`  [工具调用] execute_command("${command}") - 执行失败，退出码: ${code}`);
          resolve(`命令执行失败，退出码: ${code}${errorMsg ? '\n错误: ' + errorMsg : ''}`);
        }
      });
    });
  },
  {
    name: 'execute_command',
    description: '执行系统命令，支持指定工作目录，实时显示输出',
    schema: z.object({
      command: z.string().describe('要执行的命令'),
      workingDirectory: z.string().optional().describe('工作目录（推荐指定）'),
    }),
  },
);

// 4. 列出目录内容工具
const listDirectoryTool = tool(
  async ({ directoryPath }) => {
    try {
      const files = await fs.readdir(directoryPath);
      console.log(`[工具调用] list_directory("${directoryPath}") - 找到 ${files.length} 个项目`);
      return `目录内容:\n${files.map((f) => `- ${f}`).join('\n')}`;
    } catch (error) {
      console.log(`[工具调用] list_directory("${directoryPath}") - 错误: ${error.message}`);
      return `列出目录失败: ${error.message}`;
    }
  },
  {
    name: 'list_directory',
    description: '列出指定目录下的所有文件和文件夹',
    schema: z.object({
      directoryPath: z.string().describe('目录路径'),
    }),
  },
);

export { readFileTool, writeFileTool, executeCommandTool, listDirectoryTool };
```

## 4. 实战演示：一键生成 TodoList

```javascript
const task = `
创建一个功能丰富的 React TodoList 应用：
1. 创建项目：pnpm create vite react-todo-app --template react-ts
2. 修改 src/App.tsx，实现完整功能的 TodoList
3. 添加复杂样式（渐变背景、卡片阴影）
4. 添加动画效果
5. 安装依赖并启动服务器
`;

await runAgentWithTools(task);
```

### AI 的执行思路

```text
⏳ 正在等待 AI 思考...
  [工具调用] execute_command("pnpm create vite react-todo-app --template react-ts")
✅ 项目创建成功

⏳ 正在等待 AI 思考...
  [工具调用] list_directory("react-todo-app/src")
📁 目录内容: App.tsx, main.tsx, ...

⏳ 正在等待 AI 思考...
  [工具调用] write_file("react-todo-app/src/App.tsx", "...完整代码...")
✅ 文件写入成功: react-todo-app/src/App.tsx

⏳ 正在等待 AI 思考...
  [工具调用] execute_command("pnpm install", workingDirectory: "react-todo-app")
📦 安装依赖中...

⏳ 正在等待 AI 思考...
  [工具调用] execute_command("pnpm run dev", workingDirectory: "react-todo-app")
🚀 服务器启动: http://localhost:5173

✨ AI 最终回复:
React TodoList 应用已创建并启动！访问 http://localhost:5173 即可查看。
```

### 控制台执行过程

![控制台执行过程]()

### 实际效果展示

![实际效果展示]()

## 5. 拓展：从 Mini 到 Pro

### 5.1 当前实现的局限性

虽然我们的 Mini Cursor 已经能干不少活了，但距离真正的 Cursor 还有差距：

| 能力 | Mini Cursor | 真·Cursor |
|------|------------|----------|
| 文件操作 | ✅ 单文件读写 | ✅ 多文件批量编辑 |
| 代码理解 | ❌ 只能读全文 | ✅ AST 解析 + 语义理解 |
| 错误处理 | ❌ 简单重试 | ✅ 智能诊断 + 自动修复 |
| 版本控制 | ❌ 无 Git 支持 | ✅ 自动 commit + diff |
| UI 交互 | ❌ 命令行输出 | ✅ VSCode 编辑器集成 |

### 5.2 进阶优化方向

#### 🔥 1. 增强工具能力

```javascript
// 添加更多工具
const searchCodeTool = tool(/* 使用 ripgrep 搜索代码 */);
const gitTool = tool(/* 执行 git 命令 */);
const debugTool = tool(/* 分析错误日志 */);
```

#### 🔥 2. 智能代码编辑

```javascript
// 不是替换整个文件，而是精准修改
const editCodeTool = tool(async ({ filePath, lineStart, lineEnd, newCode }) => {
  // 使用 AST 解析，只修改特定函数
});
```

#### 🔥 3. 多轮对话优化

```javascript
// 保存历史上下文，避免重复读取文件
const chatHistory = new BufferMemory();
```

#### 🔥 4. 错误自愈机制

```javascript
// 当命令执行失败时，AI 自动分析原因并重试
if (exitCode !== 0) {
  messages.push(new SystemMessage("上次命令失败了，请分析错误并重试"));
}
```

### 5.3 工程化建议

如果想把 Mini Cursor 用于生产环境，还需要考虑：

1. **安全性**：沙箱执行命令（比如用 Docker 容器隔离）
2. **成本控制**：限制 AI 调用次数，避免烧钱 💸
3. **日志记录**：记录每次工具调用，方便调试
4. **用户确认**：敏感操作（如删除文件）需要人工确认

## 6. 结语：AI 编程的未来

从 **AIGC 生成代码** → **Agent 执行代码** → **Cursor 式的实时协作**，我们正在见证 AI 从"助手"变成"队友"的进化。

Mini Cursor 只是一个玩具级别的实现，但它展示了一个核心理念：

> **AI 不应该只会"说"，更应该会"做"。**

当我们给 AI 装上趁手的工具（Tools），它就能从"纸上谈兵"变成"真刀真枪"。或许在不久的将来，我们真的可以对着电脑说：

> *"帮我实现这个原型上的功能，顺便优化一下样式，下班前给我搞定！"*

然后... 它真的做到了 🤖✨