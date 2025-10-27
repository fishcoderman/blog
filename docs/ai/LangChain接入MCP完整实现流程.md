# 使用 LangChain 实现自定义 MCP 教程

## 简介

MCP (Model Context Protocol) 是一种标准化的协议，用于在 AI 应用中连接工具和服务。本文将介绍如何使用 LangChain 框架实现自定义 MCP 服务和客户端，让你的 AI 应用能够调用外部工具。

## 什么是 MCP？

MCP 允许 AI 模型通过标准化的接口调用外部工具和服务。它的优势包括：

- **标准化**：统一的工具调用接口
- **可扩展**：轻松添加新工具
- **解耦合**：服务端和客户端独立开发
- **灵活性**：支持 stdio 和 HTTP 两种通信方式

## 项目架构

我们的示例项目包含三个核心文件：

```
FastMCP/
├── .env                    # 环境变量配置
├── stdio-service.py        # MCP 服务端
└── stdio-client.py         # MCP 客户端（LangChain集成）
```

## 第一步：配置环境变量

首先创建 `.env` 文件，配置 AI 模型的访问信息：

```python
API_KEY=your-api-key
BASE_URL=https://ark.cn-beijing.volces.com/api/v3
MODEL=kimi-k2-250711
```

这些配置将用于客户端调用 AI 大模型。

## 第二步：实现 MCP 服务端

使用 `FastMCP` 框架快速创建 MCP 服务，提供自定义工具。

### 核心代码解析

```python
from mcp.server.fastmcp import FastMCP
import requests
import os

# 创建 MCP 服务器实例
mcp = FastMCP("天气助手服务")

# 使用装饰器定义工具，通过高德的天气服务来获取天气情况
@mcp.tool()
def get_weather(city_code: str = "350100") -> dict:
    """
    获取指定城市的天气信息
    
    参数:
        city_code: 城市编码（如：110000=北京，310000=上海）
    
    返回:
        dict: 天气信息字典
    """
    key = "******"
    url = f"https://restapi.amap.com/v3/weather/weatherInfo?city={city_code}&key={key}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") == "1":
            return {"success": True, "data": data}
        else:
            return {"success": False, "error": data.get('info')}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}

@mcp.tool()
def write_file(content: str) -> str:
    """将内容写入本地文件"""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, "result.txt")
        
        with open(file_path, "a", encoding="utf-8") as file:
            file.write(content + "\n")
        
        return f"✅ 已成功写入到 {file_path}"
    except Exception as e:
        return f"❌ 写入失败: {str(e)}"

# 运行服务器
if __name__ == "__main__":
    mcp.run()
```

### 关键点：

1. **@mcp.tool() 装饰器**：将普通 Python 函数转换为 MCP 工具
2. **完整的文档字符串**：AI 模型会根据文档决定何时调用工具
3. **类型注解**：帮助 MCP 自动生成参数验证
4. **错误处理**：返回明确的成功/失败信息

## 第三步：实现 LangChain 客户端

客户端负责连接 MCP 服务并将工具集成到 LangChain Agent。

### 核心代码解析

#### 1. 加载配置和初始化模型

```python
import asyncio
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.agents import create_tool_calling_agent, AgentExecutor

# 加载环境变量
load_dotenv(override=True)
API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
MODEL = os.getenv("MODEL")

# 初始化 AI 模型
model = init_chat_model(
    model=MODEL, 
    model_provider="openai",
    api_key=API_KEY,
    base_url=BASE_URL
)
```

#### 2. 连接到 MCP 服务器

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# 配置服务器参数（stdio 模式）
service_path = os.path.join(current_dir, "stdio-service.py")
server_params = StdioServerParameters(
    command="python",
    args=[service_path],
    env=None
)

# 建立连接
async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        
        # 获取可用工具
        tools_list = await session.list_tools()
        print(f"📋 可用工具: {[tool.name for tool in tools_list.tools]}")
```

#### 3. 定义工具参数模式

使用 Pydantic 定义工具的输入参数：

```python
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    """get_weather 工具的输入参数"""
    city_code: str = Field(
        default="350100",
        description="城市编码，如：110000(北京)、310000(上海)"
    )

class WriteFileInput(BaseModel):
    """write_file 工具的输入参数"""
    content: str = Field(description="需要写入文件的内容")
```

#### 4. 封装 MCP 工具为 LangChain 工具

```python
from langchain_core.tools import StructuredTool

# MCP 工具调用函数
async def call_mcp_tool(session: ClientSession, tool_name: str, arguments: dict):
    result = await session.call_tool(tool_name, arguments)
    return result.content[0].text if result.content else str(result)

# 创建工具包装器
def create_get_weather_wrapper(session):
    async def get_weather(city_code: str = "350100"):
        """获取指定城市的天气信息"""
        return await call_mcp_tool(session, "get_weather", {"city_code": city_code})
    return get_weather

# 转换为 LangChain 工具
get_weather_tool = StructuredTool.from_function(
    coroutine=create_get_weather_wrapper(session),
    name="get_weather",
    description="获取指定城市的天气信息。支持的城市编码：110000(北京)、310000(上海)...",
    args_schema=WeatherInput
)
```

#### 5. 创建 LangChain Agent

```python
from langchain_core.prompts import ChatPromptTemplate

# 构建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是天气助手，请根据用户的问题，给出相应的天气信息"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# 创建 Agent
agent = create_tool_calling_agent(model, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 执行查询
user_input = "请问今天北京和杭州的天气怎么样，哪个城市更热？并将结果写入本地文件中"
response = await agent_executor.ainvoke({"input": user_input})

print(f"✅ 最终回答:\n{response['output']}")
```

## 运行流程

### 1. 启动方式

由于使用 stdio 模式，客户端会自动启动服务端，只需运行：

```bash
python stdio-client.py
```

### 2. 执行流程

```
用户提问
   ↓
LangChain Agent 分析问题
   ↓
调用 MCP 工具（get_weather）获取北京天气
   ↓
调用 MCP 工具（get_weather）获取杭州天气
   ↓
比较温度，得出结论
   ↓
调用 MCP 工具（write_file）保存结果
   ↓
返回最终答案给用户
```

### 3. 输出示例

```
📋 可用工具: ['get_weather', 'write_file']

🤔 用户问题: 请问今天北京和杭州的天气怎么样，哪个城市更热？并将结果写入本地的文件中

> 调用工具: get_weather
> 参数: {'city_code': '110000'}
> 结果: {...北京天气数据...}

> 调用工具: get_weather
> 参数: {'city_code': '330100'}
> 结果: {...杭州天气数据...}

> 调用工具: write_file
> 参数: {'content': '今日天气对比...'}
> 结果: ✅ 已成功写入到 result.txt

✅ 最终回答:
今天北京温度为15℃，杭州温度为22℃，杭州更热。相关信息已保存到本地文件。
```

## 关键技术点总结

### 1. MCP 服务端（stdio-service.py）

- 使用 `FastMCP` 框架快速创建服务
- 通过 `@mcp.tool()` 装饰器暴露工具
- 支持标准输入输出（stdio）通信

### 2. LangChain 客户端（stdio-client.py）

- 使用 `ClientSession` 连接 MCP 服务
- 用 `StructuredTool` 将 MCP 工具转换为 LangChain 工具
- 通过 `create_tool_calling_agent` 创建智能 Agent
- 使用 `AgentExecutor` 执行任务链

### 3. 异步编程

整个系统基于 Python 的 `asyncio`，确保高效的 I/O 操作。

## 扩展性

这个架构非常易于扩展：

### 添加新工具

在服务端添加新工具：

```python
@mcp.tool()
def new_tool(param: str) -> str:
    """新工具的描述"""
    # 实现逻辑
    return result
```

在客户端添加对应的包装器：

```python
def create_new_tool_wrapper(session):
    async def new_tool(param: str):
        return await call_mcp_tool(session, "new_tool", {"param": param})
    return new_tool

new_tool = StructuredTool.from_function(
    coroutine=create_new_tool_wrapper(session),
    name="new_tool",
    description="新工具的描述",
    args_schema=NewToolInput
)
```

## 最佳实践

1. **明确的工具描述**：让 AI 模型清楚知道何时使用工具
2. **完善的错误处理**：返回清晰的错误信息
3. **参数验证**：使用 Pydantic 模型验证输入
4. **日志记录**：设置 `verbose=True` 查看 Agent 执行过程
5. **安全性**：不要在代码中硬编码敏感信息，使用环境变量

## 总结

通过 LangChain 和 MCP，我们可以：

1. ✅ 快速创建标准化的工具服务
2. ✅ 无缝集成到 LangChain Agent 中
3. ✅ 让 AI 模型智能调用外部工具
4. ✅ 轻松扩展新功能

这种架构使得 AI 应用开发更加模块化和可维护，是构建复杂 AI 系统的理想选择。

## 参考资源

- [FastMCP 文档](https://github.com/jlowin/fastmcp)
- [LangChain 文档](https://python.langchain.com/)
- [MCP 协议规范](https://modelcontextprotocol.io/)