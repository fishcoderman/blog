# Node开发MCP服务

## 什么是 MCP（Model Context Protocol）

Model Context Protocol (MCP) 是一个开放协议，用于在大语言模型（LLM）和外部工具、数据源之间建立标准化的通信接口。通过 MCP，我们可以让 AI 助手（如 GitHub Copilot）访问实时数据、执行特定操作或与各种服务集成。

## 项目初始化

首先创建一个新的 Node.js 项目：

```bash
mkdir my-mcp-server
cd my-mcp-server
npm init -y
```

安装必要的依赖：

```bash
# MCP SDK
npm install @modelcontextprotocol/sdk

# 开发依赖
npm install -D typescript @types/node ts-node nodemon
```

## 项目结构

创建以下文件结构：

```text
my-mcp-server/
├── src/
│   ├── index.ts
│   └── server.ts
├── bin/
│   └── run.js
├── package.json
├── tsconfig.json
└── README.md
```

## 配置 TypeScript

创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 实现 MCP 服务器

创建 `src/server.ts`：

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  city: string;
}

class WeatherMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'weather-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 注册工具列表
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_weather',
            description: '获取指定城市的天气信息',
            inputSchema: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  description: '城市名称',
                },
                units: {
                  type: 'string',
                  enum: ['celsius', 'fahrenheit'],
                  description: '温度单位',
                  default: 'celsius',
                },
              },
              required: ['city'],
            },
          },
          {
            name: 'calculate',
            description: '执行基本的数学计算',
            inputSchema: {
              type: 'object',
              properties: {
                expression: {
                  type: 'string',
                  description: '数学表达式，如 "2 + 3 * 4"',
                },
              },
              required: ['expression'],
            },
          },
        ] as Tool[],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_weather':
          return this.handleGetWeather(args as { city: string; units?: string });
        
        case 'calculate':
          return this.handleCalculate(args as { expression: string });
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async handleGetWeather(args: { city: string; units?: string }) {
    // 模拟天气 API 调用
    const weatherData: WeatherData = {
      city: args.city,
      temperature: args.units === 'fahrenheit' ? 75 : 24,
      humidity: 65,
      description: '晴朗',
    };

    return {
      content: [
        {
          type: 'text',
          text: `城市: ${weatherData.city}
温度: ${weatherData.temperature}°${args.units === 'fahrenheit' ? 'F' : 'C'}
湿度: ${weatherData.humidity}%
天气: ${weatherData.description}`,
        },
      ],
    };
  }

  private async handleCalculate(args: { expression: string }) {
    try {
      // 简单的表达式计算（生产环境建议使用更安全的解析器）
      const result = Function(`"use strict"; return (${args.expression})`)();
      
      return {
        content: [
          {
            type: 'text',
            text: `计算结果: ${args.expression} = ${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`计算错误: ${error.message}`);
    }
  }

  async start() {
    // 通过 stdio 启动服务器
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Weather MCP Server 已启动');
  }
}

export default WeatherMCPServer;
```

创建 `src/index.ts`：

```typescript
#!/usr/bin/env node

import WeatherMCPServer from './server.js';

async function main() {
  const server = new WeatherMCPServer();
  await server.start();
}

// 处理优雅关闭
process.on('SIGINT', () => {
  console.error('正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('正在关闭服务器...');
  process.exit(0);
});

main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
```

## 创建可执行文件

创建 `bin/run.js`：

```javascript
#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

// 运行编译后的 TypeScript 代码
const scriptPath = path.join(__dirname, '../dist/index.js');

const child = spawn('node', [scriptPath], {
  stdio: ['inherit', 'inherit', 'inherit'],
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
```

## 配置 package.json

更新 `package.json`：

```json
{
  "name": "weather-mcp-server",
  "version": "1.0.0",
  "description": "一个提供天气信息和计算功能的 MCP 服务器",
  "main": "dist/index.js",
  "bin": {
    "weather-mcp-server": "./bin/run.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "prepare": "npm run build"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "ai",
    "weather",
    "calculator"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.0.0"
  },
  "files": [
    "dist/**/*",
    "bin/**/*",
    "README.md"
  ],
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 本地测试

构建项目：

```bash
npm run build
```

本地测试：

```bash
# 直接运行
npm start

# 或者使用 npx 测试
npx .
```

## 发布到 npm

1. **注册 npm 账号**（如果还没有）：

   ```bash
   npm adduser
   ```

2. **登录 npm**：

   ```bash
   npm login
   ```

3. **检查包名是否可用**：

   ```bash
   npm view weather-mcp-server
   ```

4. **发布包**：

   ```bash
   npm publish
   ```

## 在 GitHub Copilot 中使用

用户安装后，可以在 GitHub Copilot 的 `mcp.json` 配置文件中这样引用：

```json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["weather-mcp-server"]
    }
  }
}
```

或者如果全局安装：

```json
{
  "mcpServers": {
    "weather": {
      "command": "weather-mcp-server"
    }
  }
}
```

## 高级功能

### 添加环境变量支持

```typescript
// 在 server.ts 中添加
private async handleGetWeather(args: { city: string; units?: string }) {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (apiKey) {
    // 调用真实的天气 API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${args.city}&appid=${apiKey}`
    );
    const data = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: `真实天气数据: ${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }
  
  // 返回模拟数据...
}
```

### 添加资源支持

```typescript
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Resource,
} from '@modelcontextprotocol/sdk/types.js';

// 在 setupToolHandlers 中添加
this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'weather://current',
        name: '当前天气数据',
        description: '提供当前天气信息的资源',
        mimeType: 'application/json',
      },
    ] as Resource[],
  };
});

this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === 'weather://current') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            timestamp: new Date().toISOString(),
            data: '当前天气资源数据',
          }),
        },
      ],
    };
  }
  
  throw new Error(`未知资源: ${uri}`);
});
```

## 最佳实践

1. **错误处理**：
   - 总是提供清晰的错误信息
   - 使用适当的错误代码
   - 记录错误日志

2. **安全性**：
   - 验证输入参数
   - 避免执行任意代码
   - 使用环境变量存储敏感信息

3. **性能**：
   - 实现适当的缓存机制
   - 设置合理的超时时间
   - 限制并发请求数量

4. **文档**：
   - 提供详细的 README
   - 包含使用示例
   - 说明配置选项

## 维护和更新

定期更新包：

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 发布更新
npm publish
```

## 总结

本文主要介绍：

1. 如何创建一个基本的 MCP 服务器
2. 如何实现工具和资源处理
3. 如何将服务打包并发布到 npm
4. 如何在 GitHub Copilot 中配置和使用

MCP 为 AI 助手提供了强大的扩展能力，通过开发自定义的 MCP 服务，您可以让 AI 助手访问任何数据源或执行特定的业务逻辑。
