# Poetry Monorepo 多包管理指南

Poetry 是 Python 的现代依赖管理和打包工具，它提供了优雅的方式来管理 Monorepo（单体仓库）中的多个包。本文将详细介绍如何使用 Poetry 管理 Monorepo 项目。

## 什么是 Monorepo？

Monorepo（单体仓库）是指将多个相关项目存放在同一个代码仓库中的开发策略。这种方式的优点包括：

- 代码共享更容易
- 统一的版本控制
- 简化依赖管理
- 原子性的跨项目更改

## 项目结构

一个典型的 Poetry Monorepo 项目结构如下：

```
my-monorepo/
├── pyproject.toml          # 根项目配置
├── poetry.lock             # 锁定文件
├── packages/
│   ├── package-a/
│   │   ├── pyproject.toml
│   │   ├── package_a/
│   │   │   └── __init__.py
│   │   └── tests/
│   ├── package-b/
│   │   ├── pyproject.toml
│   │   ├── package_b/
│   │   │   └── __init__.py
│   │   └── tests/
│   └── package-c/
│       ├── pyproject.toml
│       ├── package_c/
│       │   └── __init__.py
│       └── tests/
└── README.md
```

## 初始化 Monorepo 项目

### 1. 创建根项目

```bash
# 创建项目目录
mkdir my-monorepo
cd my-monorepo

# 初始化根 Poetry 项目
poetry init
```

### 2. 创建子包

```bash
# 创建 packages 目录
mkdir packages
cd packages

# 创建第一个子包
mkdir package-a
cd package-a
poetry init

# 创建第二个子包
cd ..
mkdir package-b
cd package-b
poetry init

# 以此类推...
```

## 配置 pyproject.toml

### 根项目配置

根目录的 `pyproject.toml` 配置示例：

```toml
[tool.poetry]
name = "my-monorepo"
version = "0.1.0"
description = "Monorepo project with multiple packages"
authors = ["Your Name <you@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.9"

# 可以在这里添加所有子包共享的依赖
requests = "^2.31.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
black = "^23.7.0"
flake8 = "^6.1.0"
mypy = "^1.5.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### 子包配置

`packages/package-a/pyproject.toml` 配置示例：

```toml
[tool.poetry]
name = "package-a"
version = "0.1.0"
description = "Package A in the monorepo"
authors = ["Your Name <you@example.com>"]
readme = "README.md"
packages = [{include = "package_a"}]

[tool.poetry.dependencies]
python = "^3.9"

# 引用同一 Monorepo 中的其他包
package-b = {path = "../package-b", develop = true}

# 子包特定的依赖
numpy = "^1.24.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

## 子包之间的依赖管理

### 使用本地路径依赖

在 Monorepo 中，子包之间可以通过本地路径相互依赖：

```toml
[tool.poetry.dependencies]
# 使用相对路径引用其他包
package-b = {path = "../package-b", develop = true}
package-c = {path = "../package-c", develop = true}
```

`develop = true` 参数表示以可编辑模式安装，这样修改代码后无需重新安装。

### 添加依赖的命令

```bash
# 在 package-a 中添加对 package-b 的依赖
cd packages/package-a
poetry add ../package-b --editable
```

## 安装依赖

### 安装所有依赖

#### 方式一：在根目录安装

```bash
# 在根目录安装所有依赖
cd my-monorepo
poetry install
```

这会创建一个统一的虚拟环境，包含所有子包的依赖。

#### 方式二：分别安装各个子包

```bash
# 进入子包目录安装
cd packages/package-a
poetry install

cd ../package-b
poetry install

cd ../package-c
poetry install
```

### 添加新依赖

#### 在根项目添加共享依赖

```bash
# 在根目录添加所有包共享的依赖
cd my-monorepo
poetry add requests
```

#### 在子包添加特定依赖

```bash
# 进入子包目录
cd packages/package-a

# 添加生产依赖
poetry add numpy pandas

# 添加开发依赖
poetry add pytest --group dev

# 添加其他子包作为依赖
poetry add ../package-b --editable
```

### 更新依赖

```bash
# 更新所有依赖
poetry update

# 更新特定依赖
poetry update numpy

# 更新到最新版本（忽略锁定文件）
poetry update --lock
```

## 虚拟环境管理

### 创建和激活虚拟环境

#### 方式一：使用 Poetry Shell

```bash
# 在根目录或子包目录中
cd my-monorepo
poetry shell
```

这会激活虚拟环境，你会看到命令行提示符前面出现虚拟环境名称。

#### 方式二：使用 Poetry Run

不需要激活虚拟环境，直接运行命令：

```bash
# 运行 Python 脚本
poetry run python script.py

# 运行测试
poetry run pytest

# 运行其他命令
poetry run black .
```

### 查看虚拟环境信息

```bash
# 显示虚拟环境信息
poetry env info

# 显示虚拟环境路径
poetry env info --path

# 列出所有虚拟环境
poetry env list
```

### 退出虚拟环境

```bash
# 在 poetry shell 中
exit

# 或者
deactivate
```

### 删除虚拟环境

```bash
# 删除当前项目的虚拟环境
poetry env remove python

# 或指定 Python 版本
poetry env remove 3.9

# 删除所有虚拟环境
poetry env remove --all
```

## 工作流示例

### 场景一：开发新功能

```bash
# 1. 进入项目根目录
cd my-monorepo

# 2. 激活虚拟环境
poetry shell

# 3. 进入要开发的子包
cd packages/package-a

# 4. 编辑代码...

# 5. 运行测试
poetry run pytest

# 6. 格式化代码
poetry run black .

# 7. 退出虚拟环境
exit
```

### 场景二：添加新的子包

```bash
# 1. 创建新子包目录
cd packages
mkdir package-d
cd package-d

# 2. 初始化 Poetry 项目
poetry init

# 3. 创建包目录和文件
mkdir package_d
touch package_d/__init__.py

# 4. 如果需要依赖其他子包
poetry add ../package-a --editable

# 5. 安装依赖
poetry install

# 6. 在根目录重新安装（可选）
cd ../../
poetry install
```

### 场景三：在不同子包之间切换

```bash
# 方式一：使用统一的虚拟环境（推荐）
cd my-monorepo
poetry shell

# 现在可以自由切换到任何子包
cd packages/package-a
python -m package_a

cd ../package-b
python -m package_b

# 方式二：每个子包使用独立虚拟环境
cd packages/package-a
poetry shell
# 工作...
exit

cd ../package-b
poetry shell
# 工作...
exit
```

## 测试管理

### 运行测试

```bash
# 在根目录运行所有测试
cd my-monorepo
poetry run pytest

# 运行特定子包的测试
cd packages/package-a
poetry run pytest

# 运行特定测试文件
poetry run pytest tests/test_module.py

# 运行特定测试函数
poetry run pytest tests/test_module.py::test_function

# 显示详细输出
poetry run pytest -v

# 显示覆盖率
poetry run pytest --cov=package_a
```

### 配置 pytest

在根目录创建 `pytest.ini`：

```ini
[pytest]
testpaths = packages
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --strict-markers
```

或在 `pyproject.toml` 中配置：

```toml
[tool.pytest.ini_options]
testpaths = ["packages"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = ["-v", "--strict-markers"]
```

## 代码质量工具

### Black（代码格式化）

```bash
# 格式化所有代码
poetry run black .

# 格式化特定目录
poetry run black packages/package-a

# 检查而不修改
poetry run black --check .
```

### Flake8（代码检查）

```bash
# 检查所有代码
poetry run flake8 .

# 检查特定包
poetry run flake8 packages/package-a
```

### MyPy（类型检查）

```bash
# 类型检查所有代码
poetry run mypy packages

# 检查特定包
poetry run mypy packages/package-a
```

## 构建和发布

### 构建包

```bash
# 构建特定子包
cd packages/package-a
poetry build

# 这会在 dist/ 目录生成 wheel 和 tar.gz 文件
```

### 发布到 PyPI

```bash
# 配置 PyPI 凭证（只需一次）
poetry config pypi-token.pypi your-api-token

# 发布到 PyPI
cd packages/package-a
poetry publish --build

# 发布到测试 PyPI
poetry publish --build -r testpypi
```

## 实用脚本

### 批量操作脚本

创建 `scripts/install-all.sh`：

```bash
#!/bin/bash

# 安装所有子包的依赖

echo "Installing root dependencies..."
poetry install

echo "Installing package-a dependencies..."
cd packages/package-a && poetry install && cd ../..

echo "Installing package-b dependencies..."
cd packages/package-b && poetry install && cd ../..

echo "Installing package-c dependencies..."
cd packages/package-c && poetry install && cd ../..

echo "All packages installed!"
```

创建 `scripts/test-all.sh`：

```bash
#!/bin/bash

# 运行所有子包的测试

echo "Testing package-a..."
cd packages/package-a && poetry run pytest && cd ../..

echo "Testing package-b..."
cd packages/package-b && poetry run pytest && cd ../..

echo "Testing package-c..."
cd packages/package-c && poetry run pytest && cd ../..

echo "All tests completed!"
```

### 使用脚本

```bash
# 添加执行权限
chmod +x scripts/*.sh

# 运行脚本
./scripts/install-all.sh
./scripts/test-all.sh
```

## 常见问题

### 1. 依赖冲突

如果不同子包依赖同一个库的不同版本，会导致冲突。解决方案：

```bash
# 查看依赖树
poetry show --tree

# 更新锁定文件
poetry lock --no-update

# 重新解析依赖
poetry update --lock
```

### 2. 虚拟环境路径问题

Poetry 默认在缓存目录创建虚拟环境。如果想在项目目录创建：

```bash
# 配置在项目目录创建虚拟环境
poetry config virtualenvs.in-project true

# 重新创建虚拟环境
poetry env remove python
poetry install
```

### 3. 子包修改未生效

确保使用 `develop = true` 或 `--editable` 标志：

```toml
[tool.poetry.dependencies]
package-b = {path = "../package-b", develop = true}
```

或：

```bash
poetry add ../package-b --editable
```

### 4. 循环依赖

避免子包之间的循环依赖。如果必须共享代码，考虑创建一个公共包。

## 最佳实践

1. **统一 Python 版本**：所有子包使用相同的 Python 版本约束
2. **共享开发依赖**：在根项目中定义共享的开发工具
3. **使用 develop 模式**：子包之间使用 `develop = true` 进行依赖
4. **定期更新依赖**：使用 `poetry update` 保持依赖最新
5. **版本号管理**：使用语义化版本号，统一管理子包版本
6. **CI/CD 集成**：在 CI 中使用 `poetry install --no-root` 优化构建
7. **锁定文件**：提交 `poetry.lock` 到版本控制
8. **文档**：为每个子包维护独立的 README

## 总结

Poetry 为 Monorepo 项目提供了强大的依赖管理能力。通过合理的项目结构和配置，可以：

- 高效管理多个相关包
- 简化子包之间的依赖关系
- 统一虚拟环境和依赖版本
- 提供一致的开发体验

掌握这些技巧后，你就能够轻松管理复杂的 Python Monorepo 项目了。
