# Multi-Agent

Multi-agent（多智能体）是让**多个 AI Agent 协同工作**完成复杂任务的系统。

## 什么是 Multi-Agent？

### 单 Agent vs Multi-Agent

**单 Agent（当前项目）：**
```
用户提问 → 一个 Agent → 调用工具 → 返回结果
```

**Multi-Agent：**
```
用户提问 → 协调 Agent
              ↓
         分配任务
         ╱    │    ╲
    Agent1  Agent2  Agent3
     研究员  分析师  编写者
         ╲    │    ╱
         汇总结果
              ↓
          返回结果
```

### 核心概念

多个 Agent，每个有**不同的角色和专长**：
- 🔍 **研究员 Agent** - 搜索和收集信息
- 📊 **分析师 Agent** - 分析数据
- ✍️ **写作 Agent** - 生成文档
- 🎯 **协调 Agent** - 分配和管理任务

## 为什么需要 Multi-Agent？

### 优势

1. **专业分工** - 每个 Agent 专注自己擅长的领域
2. **并行处理** - 多个 Agent 同时工作，提高效率
3. **复杂任务** - 将大任务分解为小任务
4. **可维护性** - 每个 Agent 独立开发和测试

### 适用场景

- 📝 复杂的研究报告生成
- 🔍 多源信息收集和分析
- 🤖 客服系统（路由、处理、升级）
- 🎓 教学系统（讲解、练习、评估）
- 💼 工作流自动化

## LangGraph 中的 Multi-Agent 实现

### 方式 1: 层级结构（Supervisor Pattern）

有一个**主管 Agent**协调多个**工作 Agent**。

```python
from typing import Annotated, TypedDict, Literal
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# 1. 定义共享状态
class MultiAgentState(TypedDict):
    messages: Annotated[list, add_messages]
    next_agent: str

# 2. 创建专业 Agents
llm = ChatOpenAI(model="gpt-4o-mini")

# 研究员 Agent
def researcher_agent(state):
    """搜索和收集信息"""
    system = SystemMessage(content="""你是一个专业的研究员。
    你的任务是搜索和收集相关信息。
    提供准确、详细的研究结果。""")
    
    messages = [system] + state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}

# 分析师 Agent
def analyst_agent(state):
    """分析数据和信息"""
    system = SystemMessage(content="""你是一个数据分析师。
    你的任务是分析研究员提供的信息。
    提供深入的分析和洞察。""")
    
    messages = [system] + state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}

# 写作 Agent
def writer_agent(state):
    """生成最终文档"""
    system = SystemMessage(content="""你是一个专业写作者。
    基于研究和分析结果，撰写清晰、专业的报告。
    确保内容结构清晰、易于理解。""")
    
    messages = [system] + state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}

# 3. 协调 Agent（决定下一步）
def supervisor_agent(state) -> Literal["researcher", "analyst", "writer", "end"]:
    """主管决定下一步调用哪个 Agent"""
    system = SystemMessage(content="""你是项目主管。
    决定下一步需要哪个团队成员：
    - researcher: 需要收集更多信息
    - analyst: 需要分析数据
    - writer: 需要撰写报告
    - end: 任务完成
    
    只返回一个选项。""")
    
    messages = [system] + state["messages"]
    response = llm.invoke(messages)
    
    # 解析 LLM 的决策
    content = response.content.lower()
    if "researcher" in content:
        return "researcher"
    elif "analyst" in content:
        return "analyst"
    elif "writer" in content:
        return "writer"
    else:
        return "end"

# 4. 构建 Multi-Agent 图
workflow = StateGraph(MultiAgentState)

# 添加所有 Agent 节点
workflow.add_node("researcher", researcher_agent)
workflow.add_node("analyst", analyst_agent)
workflow.add_node("writer", writer_agent)
workflow.add_node("supervisor", supervisor_agent)

# 设置入口
workflow.set_entry_point("supervisor")

# 主管的条件边（路由到不同 Agent）
workflow.add_conditional_edges(
    "supervisor",
    supervisor_agent,
    {
        "researcher": "researcher",
        "analyst": "analyst",
        "writer": "writer",
        "end": END,
    }
)

# 每个 Agent 完成后回到主管
workflow.add_edge("researcher", "supervisor")
workflow.add_edge("analyst", "supervisor")
workflow.add_edge("writer", "supervisor")

# 编译
multi_agent_graph = workflow.compile()
```

**工作流程图：**
```
       用户输入
          ↓
    ┌──────────┐
    │Supervisor│ ← 主管决策
    └────┬─────┘
         │
    决定下一步？
    ╱    │    ╲
研究员  分析师  写作者
  │      │      │
  └──────┴──────┘
         ↓
    ┌──────────┐
    │Supervisor│ ← 再次决策
    └────┬─────┘
         │
      继续或结束？
```

### 方式 2: 对等协作（Peer-to-Peer）

多个 Agent **平等协作**，直接交流。

```python
from langgraph.graph import StateGraph, END

class CollaborativeState(TypedDict):
    messages: Annotated[list, add_messages]
    task_type: str

# Agent 之间可以直接通信
workflow = StateGraph(CollaborativeState)

workflow.add_node("coder", coder_agent)
workflow.add_node("reviewer", reviewer_agent)
workflow.add_node("tester", tester_agent)

workflow.set_entry_point("coder")

# 编码 → 审查 → 测试 → 可能回到编码
workflow.add_edge("coder", "reviewer")
workflow.add_conditional_edges(
    "reviewer",
    lambda state: "tester" if approved else "coder",
    {"tester": "tester", "coder": "coder"}
)
workflow.add_conditional_edges(
    "tester",
    lambda state: "end" if tests_pass else "coder",
    {"end": END, "coder": "coder"}
)

graph = workflow.compile()
```

**工作流程图：**
```
┌──────┐   ┌─────────┐   ┌────────┐
│Coder │ → │Reviewer │ → │ Tester │
└───↑──┘   └────↓────┘   └────↓───┘
    │          │              │
    └──────────┴──────────────┘
       (循环直到通过所有测试)
```

## 完整示例：研究报告生成系统

让我创建一个实用的多 Agent 示例文件：

```python
"""
Multi-Agent 研究报告生成系统
演示如何使用多个专业 Agent 协同工作
"""
from typing import Annotated, TypedDict, Literal
from langgraph.graph import StateGraph, END, add_messages
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# ========== 状态定义 ==========
class ResearchState(TypedDict):
    """研究任务的状态"""
    messages: Annotated[list, add_messages]
    topic: str
    research_data: str
    analysis: str
    report: str

# ========== Agent 定义 ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def researcher(state: ResearchState) -> dict:
    """研究员：收集信息"""
    print("\n🔍 研究员开始工作...")
    
    system = SystemMessage(content=f"""你是一个专业研究员。
    研究主题：{state['topic']}
    
    任务：搜索和收集关于该主题的关键信息、数据和事实。
    格式：列出 5-7 个关键点，每个点包含具体数据或事实。""")
    
    response = llm.invoke([system, state["messages"][-1]])
    
    return {
        "messages": [AIMessage(content=f"[研究员] {response.content}")],
        "research_data": response.content
    }

def analyst(state: ResearchState) -> dict:
    """分析师：分析数据"""
    print("\n📊 分析师开始工作...")
    
    system = SystemMessage(content=f"""你是一个数据分析师。
    研究数据：{state['research_data']}
    
    任务：分析这些信息，找出：
    1. 主要趋势和模式
    2. 关键洞察
    3. 潜在影响
    
    提供专业的分析结论。""")
    
    response = llm.invoke([system])
    
    return {
        "messages": [AIMessage(content=f"[分析师] {response.content}")],
        "analysis": response.content
    }

def writer(state: ResearchState) -> dict:
    """写作者：生成报告"""
    print("\n✍️ 写作者开始工作...")
    
    system = SystemMessage(content=f"""你是一个专业写作者。
    
    研究数据：{state['research_data']}
    分析结果：{state['analysis']}
    
    任务：基于以上信息，撰写一份结构清晰的研究报告。
    
    格式：
    # {state['topic']} 研究报告
    
    ## 执行摘要
    [简要概述]
    
    ## 研究发现
    [详细研究数据]
    
    ## 深度分析
    [分析结论]
    
    ## 总结与建议
    [关键要点和建议]""")
    
    response = llm.invoke([system])
    
    return {
        "messages": [AIMessage(content=f"[写作者] 报告已完成")],
        "report": response.content
    }

def supervisor(state: ResearchState) -> Literal["researcher", "analyst", "writer", "end"]:
    """主管：决定工作流程"""
    # 简化版：按固定顺序执行
    messages = state["messages"]
    
    # 检查已完成的步骤
    if not state.get("research_data"):
        return "researcher"
    elif not state.get("analysis"):
        return "analyst"
    elif not state.get("report"):
        return "writer"
    else:
        return "end"

# ========== 构建图 ==========
workflow = StateGraph(ResearchState)

# 添加 Agent 节点
workflow.add_node("researcher", researcher)
workflow.add_node("analyst", analyst)
workflow.add_node("writer", writer)

# 设置入口点
workflow.set_entry_point("researcher")

# 设置流程：研究员 → 分析师 → 写作者
workflow.add_edge("researcher", "analyst")
workflow.add_edge("analyst", "writer")
workflow.add_edge("writer", END)

# 编译
research_team = workflow.compile()

# ========== 使用示例 ==========
def generate_research_report(topic: str):
    """生成研究报告"""
    print(f"\n{'='*60}")
    print(f"🚀 启动 Multi-Agent 研究团队")
    print(f"📋 研究主题: {topic}")
    print(f"{'='*60}")
    
    # 运行
    result = research_team.invoke({
        "messages": [HumanMessage(content=f"研究主题: {topic}")],
        "topic": topic,
        "research_data": "",
        "analysis": "",
        "report": ""
    })
    
    print(f"\n{'='*60}")
    print("✅ 研究完成！")
    print(f"{'='*60}")
    print("\n📄 最终报告：")
    print(result["report"])
    
    return result["report"]

# 测试
if __name__ == "__main__":
    generate_research_report("人工智能在医疗领域的应用")
```

## 与当前单 Agent 项目对比

### 当前项目（单 Agent）

```python
# src/agent/graph.py - 一个 Agent 完成所有任务
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))
```

**特点：**
- ✅ 简单直接
- ✅ 适合通用任务
- ❌ 没有专业分工

### Multi-Agent 升级

可以将当前项目扩展为：

```python
# 专业化的多 Agent 系统
workflow.add_node("math_agent", math_specialist)      # 数学专家
workflow.add_node("time_agent", time_specialist)      # 时间专家
workflow.add_node("search_agent", search_specialist)  # 搜索专家
workflow.add_node("router", route_to_specialist)      # 路由器
```

## 实际应用示例

### 客服系统

```
        客户问题
           ↓
    ┌────────────┐
    │  路由Agent  │ 分类问题
    └──────┬─────┘
           │
    ╱──────┼──────╲
技术支持  账单查询  产品咨询
Agent    Agent    Agent
```

### 代码审查系统

```
提交代码
   ↓
┌────────┐   ┌──────────┐   ┌────────┐
│静态分析│ → │安全检查  │ → │性能测试│
└────────┘   └──────────┘   └────────┘
                ↓
           汇总报告Agent
```

## 总结

1. **Multi-Agent** = 多个专业 Agent 协同工作
2. **实现方式**：
   - Supervisor 模式（层级）
   - Peer-to-Peer 模式（对等）
3. **使用 LangGraph** 实现（不是纯 LangChain）
4. **适合**：复杂任务、专业分工、并行处理

**建议：** 从单 Agent 开始（如当前项目），在需要时再升级到 Multi-Agent。