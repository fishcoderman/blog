# LangChain工作流案例

```python
import os
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough
```

## 配置 Kimi K2 模型

```python
def create_kimi_llm():
    """创建并配置 Kimi K2 LLM"""
    return ChatOpenAI(
        model="kimi-k2-250711",
        openai_api_base="https://ark.cn-beijing.volces.com/api/v3",
        openai_api_key="******",
        temperature=0.7,
        streaming=True
    )
```

### 创建聊天提示模板

```python
def create_chat_prompt():
    """创建聊天提示模板"""
    return ChatPromptTemplate.from_messages([
        ("system", "你是一个专业的AI助手，擅长回答各种问题。请用简洁明了的方式回答用户的问题。"),
        ("human", "{question}")
    ])
```
### 简单问答链

```python
def simple_qa_chain():
    """创建简单的问答链"""
    print("=== LangChain + Kimi K2 简单问答 ===")
    
    # 初始化组件
    llm = create_kimi_llm()
    prompt = create_chat_prompt()
    output_parser = StrOutputParser()
    
    # 创建链
    chain = prompt | llm | output_parser
    
    # 测试问题
    questions = [
        "今天是几月几号？",
        "请介绍一下LangChain框架的主要特点",
    ]
    
    for question in questions:
        print(f"\n用户问题: {question}")
        print("AI回答: ", end="")
        
        # 流式输出
        for chunk in chain.stream({"question": question}):
            print(chunk, end="", flush=True)
        print("\n" + "-"*50)
```
## 多轮对话链

```python
def conversation_chain():
    """创建多轮对话链"""
    print("\n=== LangChain + Kimi K2 多轮对话 ===")
    
    llm = create_kimi_llm()
    
    # 创建多轮对话提示模板
    conversation_prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个友好的AI助手。请根据对话历史和当前问题，给出简单的回答。"),
        ("human", "对话历史: {history}\n\n当前问题: {question}")
    ])
    
    chain = conversation_prompt | llm | StrOutputParser()
    
    # 模拟多轮对话
    conversation_history = []
    
    conversations = [
        "你好，我想学习Python编程",
        "我应该从哪里开始学习？",
        "有什么好的学习资源推荐吗？"
    ]
    
    for question in conversations:
        print(f"\n用户: {question}")
        print("AI: ", end="")
        
        # 准备历史对话
        history_text = "\n".join([f"用户: {h['user']}\nAI: {h['ai']}" for h in conversation_history])
        
        # 获取回答
        response = ""
        for chunk in chain.stream({
            "history": history_text,
            "question": question
        }):
            print(chunk, end="", flush=True)
            response += chunk
        
        # 保存对话历史
        conversation_history.append({
            "user": question,
            "ai": response
        })
        
        print("\n" + "-"*50)
```
### RAG（检索增强生成）示例

```python
def rag_example():
    """简单的RAG示例"""
    print("\n=== LangChain + Kimi K2 RAG示例 ===")
    
    # 模拟知识库
    knowledge_base = {
        "Python": "Python是一种高级编程语言，具有简洁的语法和强大的功能。",
        "LangChain": "LangChain是一个用于构建LLM应用程序的框架，提供了链式调用、提示管理等功能。",
        "Kimi": "Kimi是月之暗面公司开发的大语言模型，具有强大的中文理解和生成能力。"
    }
    
    def retrieve_context(question):
        """简单的检索函数"""
        relevant_info = []
        for key, value in knowledge_base.items():
            if key.lower() in question.lower():
                relevant_info.append(f"{key}: {value}")
        return "\n".join(relevant_info) if relevant_info else "暂无相关信息"
    
    llm = create_kimi_llm()
    
    # RAG提示模板
    rag_prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个AI助手。请根据提供的上下文信息来回答用户的问题。如果上下文中没有相关信息，请诚实地说明。"),
        ("human", "上下文信息:\n{context}\n\n用户问题: {question}")
    ])
    
    # 创建RAG链
    rag_chain = (
        {"context": lambda x: retrieve_context(x["question"]), "question": RunnablePassthrough()}
        | rag_prompt
        | llm
        | StrOutputParser()
    )
    
    # 测试RAG
    rag_questions = [
        "什么是Python？",
        "LangChain有什么特点？",
        "Kimi模型怎么样？"
    ]
    
    for question in rag_questions:
        print(f"\n用户问题: {question}")
        context = retrieve_context(question)
        print(f"检索到的上下文: {context}")
        print("AI回答: ", end="")
        
        for chunk in rag_chain.stream({"question": question}):
            print(chunk, end="", flush=True)
        print("\n" + "-"*50)
```
### 工具使用示例

```python
def tool_usage_example():
    """工具使用示例"""
    print("\n=== LangChain + Kimi K2 工具使用示例 ===")
    
    from langchain.tools import tool
    import random
    from datetime import datetime
    
    @tool
    def get_current_time() -> str:
        """获取当前时间"""
        return datetime.now().strftime("%Y年%m月%d日 %H:%M:%S")
    
    @tool
    def get_random_number(min_val: int = 1, max_val: int = 100) -> int:
        """生成指定范围内的随机数"""
        return random.randint(min_val, max_val)
    
    @tool
    def calculate(expression: str) -> str:
        """计算数学表达式"""
        try:
            result = eval(expression)
            return f"{expression} = {result}"
        except:
            return "计算错误，请检查表达式"
    
    # 创建工具列表
    tools = [get_current_time, get_random_number, calculate]
    
    # 工具使用示例（简化版，实际使用需要agent）
    print("可用工具:")
    for tool in tools:
        print(f"- {tool.name}: {tool.description}")
    
    # 手动演示工具使用
    print(f"\n当前时间: {get_current_time.invoke({})}")
    print(f"随机数(1-10): {get_random_number.invoke({'min_val': 1, 'max_val': 10})}")
    print(f"计算结果: {calculate.invoke({'expression': '2 + 3 * 4'})}")
```

## 最后选择执行

```python
def main():
    """主函数"""
    print("🚀 LangChain + Kimi K2 综合示例")
    print("="*60)
    
    try:
        def get_random_number(min_val: int = 1, max_val: int = 100) -> int:
            """生成指定范围内的随机数"""
            return (min_val + max_val)
        total = get_random_number(min_val=1, max_val=10)
        print(f"生成的随机数总和: {total}")
        # 1. 简单问答
        simple_qa_chain()
        
        # 2. 多轮对话
        conversation_chain()
        
        # 3. RAG示例
        rag_example()
        
        # 4. 工具使用示例
        tool_usage_example()
        
    except Exception as e:
        print(f"❌ 执行出错: {e}")
        print("请检查API密钥和网络连接是否正常。")

if __name__ == "__main__":
    main()
```