# LangGraph入门

下面是一份适合初学者的 LangGraph（基于 LangChain 生态系统）入门学习指南和案例流程。

## 1. 核心概念简介

![Image](https://cdn.prod.website-files.com/62528d398a42420e66390ef9/6641f59787a57b0789768033_image2.png)

![Image](https://miro.medium.com/v2/resize%3Afit%3A900/1%2A9pZX_e4cF2JOLP6AnvhnpQ.png)

![Image](https://files.realpython.com/media/Screenshot_2025-03-01_at_11.41.54_AM.7f75d6337550.png)

![Image](https://blog.langchain.com/content/images/2024/01/simple_multi_agent_diagram--1-.png)

![Image](https://blog.langchain.com/content/images/2024/01/supervisor-diagram.png)

梳理关键概念概念：

* **Graph（图）**：LangGraph 使用图结构（节点 Node + 边 Edge）来表示整个智能体／代理（agent）或复杂工作流的流程。 ([Medium][1])
* **Node（节点）**：图中的每个节点代表一个“计算单元”——比如一次 LLM 调用、一个工具函数、或者做状态更新等。 ([cnblogs.com][2])
* **Edge（边）**：连接节点的路径，表示从一个节点的输出到下一个节点的输入，可能带有条件、分支、循环。 ([qiankunli.github.io][3])
* **State（状态）**：图执行过程中会持续维护一个状态 (state) 对象，节点会读取状态、更新状态。这个机制让的流程可以有“记忆”、可以中途干预、也可以回溯。 ([cnblogs.com][2])
* **循环 / 分支 /人机交互**：与传统只能做单一路径（DAG, 有向无环图）模型不同，LangGraph 支持分支、循环、人工干预（human-in-loop）等，更适合构建“智能体式”的应用。 ([ywctech.net][4])
* **与 LangChain 的关系**：LangGraph 是在 LangChain 生态里专注于 *agent orchestration*、更复杂工作流控制的工具。可以用 LangChain 的模型、工具、提示体系，再结合 LangGraph 来做更高级的流程。 ([LangChain Academy][5])

## 2. 准备环境

* 安装 LangGraph 及其依赖。例如：

  ```bash
  pip install -U langgraph langsmith langchain[anthropic]
  ```

* 准备一个大语言模型 (LLM) 的 API key（如 Anthropic、OpenAI 等），因为需要模型去做调用。
* 推荐具备 Python 编程基础（函数、类、状态管理等），因为会定义节点、状态类型等。

## 3. 入门示例：构建一个简单聊天机器人

下面通过一个 **基础案例** 来演示如何使用 LangGraph 构建一个能“聊天 + 工具调用 + 记忆状态”的智能体。可以在此基础上逐步扩展。

### 3.1 定义目标

做一个聊天机器人，它可以：

* 接收用户消息
* 判断是否需要调用一个工具（比如天气查询）
* 调用工具后返回结果
* 保持对话状态
* 能够在对话中“结束”流程

### 3.2 安装与导入必要模块

```python
pip install -U langgraph langchain  # 等依赖
```

然后在代码中：

```python
from langgraph.prebuilt import create_react_agent, ToolExecutor
from langchain.chat_models import init_chat_model
from typing import TypedDict, Sequence, Annotated
from langchain_core.messages import BaseMessage, HumanMessage
```

### 3.3 定义状态（State）

定义一个简单的状态，用来保存消息列表（用户＋助手）：

```python
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
```

这样，`state["messages"]` 会随着对话推进不断累积。

### 3.4 定义工具（Tool）

假设定义一个“获取天气”的工具：

```python
def get_weather(city: str) -> str:
    return f"It's always sunny in {city}!"  # 示例
```

然后将其放入工具列表：

```python
tools = [get_weather]
tool_executor = ToolExecutor(tools)
```

### 3.5 创建 LLM 模型

```python
model = init_chat_model(
    "anthropic:claude-3-7-sonnet-latest",
    temperature=0
)
```

然后创建 agent：

```python
agent = create_react_agent(
    model=model,
    tools=tools,
    prompt="You are a helpful assistant."
)
```

### 3.6 定义图结构（Graph）

在更基础的版本中，不需要手动构建 graph，直接使用 `create_react_agent` 即可。但若想更深一步控制流程，可以按照“代理决定 → 调用工具 →回代理”这种方式定义节点和边。以下是简略伪代码：

```python
# 节点1：模型决策节点
def call_model(state: AgentState) -> dict:
    response = model.invoke(state["messages"])
    return {"messages": [response]}

# 节点2：工具调用节点
def call_tool(state: AgentState) -> dict:
    last = state["messages"][-1]
    action = ToolInvocation(
        tool = last.additional_kwargs["function_call"]["name"],
        tool_input = json.loads(last.additional_kwargs["function_call"]["arguments"]),
    )
    result = tool_executor.invoke(action)
    return {"messages": [FunctionMessage(content=result)]}

# 边：如果模型决定继续则进入工具调用，否则结束
def should_continue(state: AgentState) -> str:
    last = state["messages"][-1]
    if "function_call" not in last.additional_kwargs:
        return "end"
    else:
        return "continue"
```

### 3.7 执行流程

然后就可以像普通聊天机器人那样调用：

```python
inputs = {"messages": [HumanMessage(content="what is the weather in Tokyo?")]}
result = agent.invoke(inputs)
print(result)
```

流程中如果用户问天气，模型可能决定调用 `get_weather` 工具，工具返回结果，再通过模型回复用户。状态 `messages` 会持续积累。 

## 4. 示例心得及扩展建议

* **记忆管理**：可以扩展 `state` 中保存更多内容（如对话主题、用户历史、工具调用日志）来实现“长期记忆”。 
* **分支／循环**：根据状态或模型输出决定流程走向，比如：如果用户提问超出范围，则转人工审核、人机交互等。
* **图可视化**：由于是图结构，可以直观调试流程、查看节点执行路径、回溯历史。
* **人机交互 (HITL)**：在流程中插入“人工审核”节点，当模型不确定时由人工介入。 
* **部署与监控**：结合 LangSmith 进行流程跟踪、错误恢复、状态持久化。 

## 5. 总结

* LangGraph 是一个非常适合“智能体＋复杂流程控制”的框架，比简单的链 (chain)／DAG 更灵活。
* 入门建议：先做一个简单聊天 + 工具调用的代理；然后再基于状态、分支、循环、人工介入等做扩展。
* 官方 &社区资源很多，建议结合中文教程 + 官方代码实践。比如 “LangGraph 入门与实战” 专栏。