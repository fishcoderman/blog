# Multi-Agent

LangGraph 的 Multi-Agent 案例，一个简单的多智能体协作系统，包含研究员、分析师、撰写员和监督员。

```python
import os
from typing import Annotated, TypedDict, Literal
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, SystemMessage

# 加载环境变量
load_dotenv(override=True)

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
MODEL = os.getenv("MODEL")

# 初始化模型
model = init_chat_model(
    model=MODEL, 
    model_provider="openai",  # 使用 OpenAI 兼容的接口
    api_key=API_KEY,
    base_url=BASE_URL
)

# 定义状态
class AgentState(TypedDict):
    """多智能体共享状态"""
    messages: Annotated[list, add_messages]  # 消息历史
    task: str  # 任务描述
    research_result: str  # 研究结果
    analysis_result: str  # 分析结果
    final_report: str  # 最终报告
    next_agent: str  # 下一个要执行的 agent


# ========== Agent 节点定义 ==========

def researcher_node(state: AgentState) -> AgentState:
    """研究员节点 - 负责收集信息和基础研究"""
    print("\n[研究员] 开始研究任务...")
    
    task = state["task"]
    
    # 构建研究提示
    messages = [
        SystemMessage(content="""是一名专业的研究员。
的任务是：
1. 理解用户的问题
2. 收集相关的背景知识和信息
3. 提供详细的研究结果

请用简洁专业的语言回答。"""),
        HumanMessage(content=f"请研究以下主题：{task}")
    ]
    
    # 调用模型
    response = model.invoke(messages)
    research_result = response.content
    
    print(f"[研究员] 研究完成！结果长度: {len(research_result)} 字符")
    
    return {
        **state,
        "research_result": research_result,
        "messages": [HumanMessage(content=f"研究员完成研究：{research_result[:100]}...")],
        "next_agent": "analyst"
    }


def analyst_node(state: AgentState) -> AgentState:
    """分析师节点 - 负责分析研究结果"""
    print("\n[分析师] 开始分析研究结果...")
    
    research_result = state["research_result"]
    
    # 构建分析提示
    messages = [
        SystemMessage(content="""是一名专业的数据分析师。
的任务是：
1. 分析研究员提供的信息
2. 提取关键要点
3. 发现潜在的模式和洞察
4. 提供结构化的分析结果

请提供深入的分析。"""),
        HumanMessage(content=f"请分析以下研究结果：\n\n{research_result}")
    ]
    
    # 调用模型
    response = model.invoke(messages)
    analysis_result = response.content
    
    print(f"[分析师] 分析完成！结果长度: {len(analysis_result)} 字符")
    
    return {
        **state,
        "analysis_result": analysis_result,
        "messages": state["messages"] + [HumanMessage(content=f"分析师完成分析：{analysis_result[:100]}...")],
        "next_agent": "writer"
    }


def writer_node(state: AgentState) -> AgentState:
    """撰写员节点 - 负责撰写最终报告"""
    print("\n[撰写员] 开始撰写最终报告...")
    
    task = state["task"]
    research_result = state["research_result"]
    analysis_result = state["analysis_result"]
    
    # 构建撰写提示
    messages = [
        SystemMessage(content="""是一名专业的技术撰写员。
的任务是：
1. 整合研究员的研究结果和分析师的分析
2. 撰写一份清晰、专业的报告
3. 使用适当的格式和结构
4. 确保报告易于理解

请撰写一份完整的报告。"""),
        HumanMessage(content=f"""请基于以下信息撰写报告：

原始任务：{task}

研究结果：
{research_result}

分析结果：
{analysis_result}

请撰写一份结构清晰的最终报告。""")
    ]
    
    # 调用模型
    response = model.invoke(messages)
    final_report = response.content
    
    print(f"[撰写员] 报告撰写完成！长度: {len(final_report)} 字符")
    
    return {
        **state,
        "final_report": final_report,
        "messages": state["messages"] + [HumanMessage(content=f"撰写员完成报告：{final_report[:100]}...")],
        "next_agent": "end"
    }


def supervisor_node(state: AgentState) -> AgentState:
    """监督员节点 - 负责协调整个流程"""
    print("\n[监督员] 正在协调任务分配...")
    
    task = state["task"]
    
    print(f"[监督员] 收到任务: {task}")
    print(f"[监督员] 开始分配任务给研究员...")
    
    return {
        **state,
        "next_agent": "researcher"
    }


# ========== 路由函数 ==========

def route_agent(state: AgentState) -> Literal["researcher", "analyst", "writer", "end"]:
    """根据当前状态路由到下一个 agent"""
    next_agent = state.get("next_agent", "researcher")
    
    if next_agent == "end":
        return "end"
    elif next_agent == "researcher":
        return "researcher"
    elif next_agent == "analyst":
        return "analyst"
    elif next_agent == "writer":
        return "writer"
    else:
        return "end"


# ========== 构建图 ==========

def build_multi_agent_graph():
    """构建多智能体协作图"""
    
    # 创建状态图
    graph_builder = StateGraph(AgentState)
    
    # 添加节点
    graph_builder.add_node("supervisor", supervisor_node)
    graph_builder.add_node("researcher", researcher_node)
    graph_builder.add_node("analyst", analyst_node)
    graph_builder.add_node("writer", writer_node)
    
    # 添加边
    # 开始 -> 监督员
    graph_builder.add_edge(START, "supervisor")
    
    # 监督员 -> 根据路由决定下一个节点
    graph_builder.add_conditional_edges(
        "supervisor",
        route_agent,
        {
            "researcher": "researcher",
            "analyst": "analyst",
            "writer": "writer",
            "end": END
        }
    )
    
    # 研究员 -> 根据路由决定下一个节点
    graph_builder.add_conditional_edges(
        "researcher",
        route_agent,
        {
            "researcher": "researcher",
            "analyst": "analyst",
            "writer": "writer",
            "end": END
        }
    )
    
    # 分析师 -> 根据路由决定下一个节点
    graph_builder.add_conditional_edges(
        "analyst",
        route_agent,
        {
            "researcher": "researcher",
            "analyst": "analyst",
            "writer": "writer",
            "end": END
        }
    )
    
    # 撰写员 -> 结束
    graph_builder.add_conditional_edges(
        "writer",
        route_agent,
        {
            "researcher": "researcher",
            "analyst": "analyst",
            "writer": "writer",
            "end": END
        }
    )
    
    # 编译图
    graph = graph_builder.compile()
    
    return graph


# 创建图实例
multi_agent_graph = build_multi_agent_graph()


# ========== 主函数 ==========

def run_multi_agent_task(task: str) -> dict:
    """
    运行多智能体任务
    
    Args:
        task: 任务描述
        
    Returns:
        包含所有结果的字典
    """
    print(f"\n{'='*80}")
    print(f"开始执行多智能体任务")
    print(f"{'='*80}")
    print(f"任务: {task}\n")
    
    # 运行图
    result = multi_agent_graph.invoke({
        "task": task,
        "messages": [],
        "research_result": "",
        "analysis_result": "",
        "final_report": "",
        "next_agent": "researcher"
    })
    
    print(f"\n{'='*80}")
    print(f"任务执行完成！")
    print(f"{'='*80}\n")
    
    # 显示最终报告
    print("\n" + "="*80)
    print("最终报告")
    print("="*80)
    print(result["final_report"])
    print("="*80 + "\n")
    
    return result


# ========== 测试代码 ==========

if __name__ == "__main__":
    # 示例任务 1: 技术分析
    print("\n" + "🚀"*40)
    print("示例 1: LangGraph 框架分析")
    print("🚀"*40 + "\n")
    
    result1 = run_multi_agent_task(
        "分析 LangGraph 框架的核心特性和应用场景"
    )
    
    # 等待一下
    print("\n" + "⏳" * 40)
    print("等待 3 秒...")
    print("⏳" * 40 + "\n")
    import time
    time.sleep(3)
    
    # 示例任务 2: 技术对比
    print("\n" + "🚀"*40)
    print("示例 2: AI Agent 开发框架对比")
    print("🚀"*40 + "\n")
    
    result2 = run_multi_agent_task(
        "对比分析目前主流的 AI Agent 开发框架的优缺点"
    )
    
    print("\n✅ 所有任务执行完成！")

```