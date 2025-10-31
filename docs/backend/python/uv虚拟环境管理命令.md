# uv 虚拟环境管理命令

### 1. 创建虚拟环境

```bash
# 创建默认虚拟环境（在当前目录创建 .venv 文件夹）
uv venv

# 创建指定名称的虚拟环境
uv venv myenv

# 创建指定 Python 版本的虚拟环境
uv venv --python 3.11
uv venv --python 3.12
```

### 2. 激活虚拟环境 ⭐

**uv 创建的虚拟环境激活方式与 pip 创建的完全相同：**

```bash
# macOS/Linux
source .venv/bin/activate

# 或者指定名称的环境
source myenv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (cmd)
.venv\Scripts\activate.bat
```

### 3. 退出虚拟环境

```bash
deactivate
```

### 4. 完整工作流示例

```bash
# 1. 创建项目目录
mkdir my_project
cd my_project

# 2. 创建虚拟环境
uv venv

# 3. 激活虚拟环境
source .venv/bin/activate

# 4. 安装依赖（在虚拟环境中）
uv pip install requests numpy pandas

# 5. 查看已安装的包
uv pip list

# 6. 使用完毕后退出
deactivate
```

### 5. uv 的现代化工作流（推荐）⭐

**uv 提供了更简单的方式，无需手动激活：**

```bash
# 1. 初始化项目（自动创建虚拟环境）
uv init

# 2. 添加依赖（自动在虚拟环境中安装）
uv add requests numpy pandas

# 3. 运行脚本（自动使用虚拟环境）
uv run python my_script.py

# 4. 运行命令（自动使用虚拟环境）
uv run pytest
uv run black .
```

**这种方式的优势：**
- ✅ 无需手动激活/退出虚拟环境
- ✅ `uv run` 自动使用项目的虚拟环境
- ✅ 更简洁的工作流

### 6. 检查虚拟环境状态

```bash
# 查看当前使用的 Python（激活虚拟环境后）
which python

# 应该显示类似：
# /Users/tao/Documents/file/python/langchain-demo/.venv/bin/python
```

### 7. 在您的项目中使用

**方式 1: 传统方式（需要激活）**

```bash
cd /Users/tao/Documents/file/python/langchain-demo

# 创建新的 uv 虚拟环境
uv venv uvenv

# 激活
source uvenv/bin/activate

# 安装依赖
uv pip install langchain langchain-mcp-adapters

# 运行脚本
python project/gitlab-demo.py

# 退出
deactivate
```

**方式 2: 现代方式（无需激活）⭐**

```bash
cd /Users/tao/Documents/file/python/langchain-demo

# 初始化项目
uv init

# 添加依赖
uv add langchain langchain-mcp-adapters langchain-openai

# 直接运行（自动使用虚拟环境）
uv run python project/gitlab-demo.py
```

### 8. 快速对比

| 操作 | pip + venv | uv (传统方式) | uv (现代方式) |
|------|------------|---------------|---------------|
| 创建环境 | `python -m venv myenv` | `uv venv` ⚡ | `uv init` ⚡ |
| 激活环境 | `source myenv/bin/activate` | `source .venv/bin/activate` | ❌ 无需激活 |
| 安装包 | `pip install package` | `uv pip install package` ⚡ | `uv add package` ⚡ |
| 运行脚本 | `python script.py` | `python script.py` | `uv run python script.py` ⚡ |
| 退出环境 | `deactivate` | `deactivate` | ❌ 无需退出 |

### 总结

**传统激活方式（与 pip 相同）：**
```bash
uv venv              # 创建
source .venv/bin/activate  # 激活（macOS/Linux）
deactivate           # 退出
```

**现代化方式（推荐）：**
```bash
uv init              # 初始化项目
uv add package       # 添加依赖
uv run python script.py  # 运行（自动使用虚拟环境）
```

