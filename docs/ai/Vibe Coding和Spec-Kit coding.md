# Vibe Coding 和 Spec-Kit Coding

## 什么是 Vibe Coding（氛围编程 / vibe coding）？

**Vibe Coding** 是一个新兴的编程术语，指高度依赖 AI（尤其是大型语言模型）来生成代码的开发方式。它的典型特征包括：

- 用自然语言（或简短提示词 / prompt）描述目标，由 AI 生成实现；
- 人类投入的编码量显著下降，更多在“描述需求、运行验证、快速迭代”；
- 由于生成速度快，容易跳过对细节、边界条件和长期演进的系统性思考。

**类比：**

> 如果传统编程是自己开车写代码，Vibe Coding 就像告诉司机“去旧金山”，然后完全相信司机自己选路线。

### 优势

- 快速产出原型与 MVP（最小可行产品），缩短从想法到可运行版本的路径；
- 有利于探索式开发：通过试错快速确认可行性与产品方向；
- 降低入门门槛，使更多角色能够参与实现与验证。

### 风险与边界

- 可控性不足：同一需求在不同上下文下可能生成不同结构，导致风格与架构漂移；
- 隐性缺陷：边界条件、并发、错误处理、权限与安全细节容易被忽略；
- 可维护性下滑：如果缺少统一规范、测试与代码评审，技术债会累积得更快；
- 责任边界：AI 产出不等于正确实现，最终仍需要人对质量与风险负责。

## 什么是 Spec-Kit Coding（规范驱动开发 / Spec Coding）？

**Spec-Kit Coding**（或 **Spec Coding**）源于 **规范驱动开发（Specification-Driven Development, SDD）** 的方法论。
Spec-Kit 是 GitHub 开源的一套工具，用来围绕“规范”来组织整个开发流程。

在 Spec Coding 中，你不会直接给 AI 一个模糊的需求，而是先：

1. **清晰定义规范（Specify）**：明确功能、行为和约束；
2. **制定计划（Plan）**：包括技术架构、技术栈、整体设计；
3. **拆解任务（Tasks）**：把规范拆分成一组可执行的小任务；
4. **再生成代码（Implement）**：AI 按照规范和计划来生成最终代码。

**类比：**

> Spec Coding 更像是先给司机一份详细地图和路线说明，再让他驾驶。
> 你有清晰的目标、步骤和约束，而不是“凭感觉”去走。

**核心理念：**

- 把规范作为“单一事实源”（source of truth）；
- 让规范本身变成可执行的产物（而不仅是团队内部文档）；
- 依托规范，AI 生成的结果更可控、更稳定。

### 典型产出物（建议纳入版本控制）

- 项目原则与约束（例如工程规范、质量门槛、安全要求、团队协作约定）；
- 功能规格（范围、用户故事、验收标准、非功能性要求：性能/安全/可用性等）；
- 技术方案与实现计划（架构、技术栈、模块边界、数据模型、接口约定）；
- 可执行任务清单（可分派、可验收，尽量做到“任务完成即可合并”）。

## 两者的核心区别

| 方面      | Vibe Coding                        | Spec-Kit Coding / Spec Coding          |
| --------- | ---------------------------------- | -------------------------------------- |
| 输入方式  | 模糊、自然语言提示词（prompt）      | 明确、结构化、可复用的规范             |
| 输出可控性 | 较低，容易出现偏差或风格不一致      | 较高，结果更稳定统一                   |
| 适合场景  | 快速探索、验证想法、原型开发        | 复杂项目、多人协作、生产级场景         |
| 人类角色  | 主要是描述需求与事后验证           | 负责定义规范、设计方案与代码审查       |
| 可维护性  | 一般较弱，后续演进依赖更多提示词（prompt） | 较强，规范可持续演进并沉淀为资产       |
| 项目扩展性 | 随 prompt 复杂度提升，结果更难控制  | 更适合长期维护和持续扩展               |

简单来说：

- **Vibe Coding** 更重视“快”，偏向感觉导向、用 AI 迅速把想法变成代码；
- **Spec Coding（Spec-Kit）** 更重视“稳”，先写规范，再让 AI 生成符合规范的代码，更适合复杂或生产环境。

## 什么时候用哪种方式？

### 适合 Vibe Coding 的场景

- 快速试验一个想法、做 Demo 或原型；
- 个人开发、学习和探索阶段；
- 不打算长期维护的“小玩具项目”。

### 适合 Spec Coding / Spec-Kit 的场景

- 团队协作、代码需要多人维护；
- 中大型项目，要求较高的代码质量和一致性；
- 需要把生成流程标准化、可复用、可审计。

### 实务建议：把两者组合起来用

- 用 Vibe Coding 快速“跑通主流程”（证明可行性），用 Spec-Kit 把“可行性”转成“可维护的工程”；
- 当代码开始出现多人协作、迭代频繁或风险提高（支付、权限、数据合规等）时，尽早切换到规范驱动；
- 不论采用哪种方式，都建议将以下作为最低质量门槛：单元测试/集成测试、静态检查、代码评审与持续集成。

## 如何写出更“可执行”的规范（建议清单）

如果希望 AI 产出更稳定、也便于团队评审与验收，规范内容建议至少覆盖以下要素（越具体越好）：

- **目标与范围**：要解决什么问题；包含哪些场景；明确不做什么（Out of Scope）。
- **用户与用例**：目标用户是谁；关键用户路径是什么；异常路径有哪些。
- **验收标准**：用可检查条目描述“完成”的定义（例如输入/输出、边界条件、错误码、UI 状态）。
- **非功能性要求**：性能（响应时间/吞吐）、可靠性、可用性、可观测性（日志/指标/告警）等。
- **安全与合规**：鉴权与授权、数据权限、敏感信息处理、审计日志、依赖与供应链风险。
- **接口与数据约定**：API 契约、字段含义、兼容策略、迁移与回滚方案。
- **开放问题**：尚未确定的点集中列出，避免 AI 自行“脑补”实现。

## 如何在 GitHub Copilot 和 Cursor 中使用 Spec-Kit

下面介绍如何在常见的两种 AI 编程环境中配合 Spec-Kit：

- Visual Studio Code + GitHub Copilot
- Cursor 编辑器

## 1. 先准备好 Spec-Kit 环境（通用步骤）

这部分与使用哪个编辑器无关（VS Code + Copilot 或 Cursor 都通用）。

### 安装与初始化

1. 安装 `uv`（现代 Python 包管理器）：

   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. 用 `uv` 安装 Spec-Kit CLI：

   ```bash
   uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
   ```

3. 在你的项目文件夹中 **初始化 Spec-Kit**：

   ```bash
   specify init my-project --ai copilot   # 使用 GitHub Copilot
   specify init my-project --ai cursor    # 使用 Cursor
   ```

   - 如果要在当前目录初始化，可以使用 `--here` 参数；
   - 初始化时会提示你选择 AI agent。

完成上述步骤后，就可以在对应环境中开始使用 Spec-Kit 了。

## 2. 在 Visual Studio Code + GitHub Copilot 中使用

VS Code + GitHub Copilot 是目前 Spec-Kit 支持得比较完整的一种组合。

### 典型工作流

1. 打开 VS Code，并确保 Copilot 插件已启用且登录完成；
2. 在项目中完成 Spec-Kit 初始化（见上文）；
3. 通过 Copilot Chat 或终端驱动 Spec-Kit 流程。

#### 在 Copilot Chat 中运行 Spec-Kit 指令

在 Copilot 聊天输入框中，可以直接使用 Spec-Kit 的 Slash 指令：

```
/speckit.constitution   # 定义项目原则 / 团队指南
/speckit.specify        # 写清楚功能需求与规格
/speckit.plan           # 制定技术栈及实现计划
/speckit.tasks          # 生成可执行任务列表
/speckit.implement      # 让 AI 按计划生成代码
```

这些命令被 Copilot 识别后，会触发结合 Spec-Kit 规范流程的对话，引导生成对应的规范文件与代码。

#### 在 VS Code 终端中使用 CLI

你也可以直接在 VS Code 的终端中运行 Spec-Kit CLI：

```bash
specify check   # 检查环境
specify init ...
```

然后在 Copilot Chat 中继续使用上述 Slash 指令，按 SDD 流程一步步推进。

## 3. 在 Cursor 编辑器中使用 Spec-Kit

Cursor 是为 AI 编程场景设计的编辑器，Spec-Kit 官方也支持它作为 AI agent。

### 在 Cursor 中的基本操作

#### 初始化项目

在 Cursor 的集成终端中运行：

```bash
specify init my-project --ai cursor
```

该命令会检查 Cursor Agent 是否可用，并创建对应的 Spec-Kit 项目结构。

#### 使用 Slash 指令

在 Cursor 中（和 Copilot 类似），可以使用 Spec-Kit 的 Slash 指令：

```
/speckit.constitution
/speckit.specify
/speckit.plan
/speckit.tasks
/speckit.implement
/speckit.clarify       # 可选，用于澄清规格不明确的部分
```

Cursor 会识别这些命令，并结合其内置的 AI Agent 输出相应的规范内容与实现计划，随后逐步生成代码。

## 4. Spec-Kit 核心 Slash 指令说明（通用于 Copilot / Cursor）

这些 Slash 指令共同驱动“规范 → 计划 → 任务 → 代码实现”的完整闭环：

| 指令                      | 作用                                   |
| ------------------------- | -------------------------------------- |
| `/speckit.constitution`   | 创建或更新项目原则、团队指南           |
| `/speckit.specify`        | 编写要构建的功能规格                   |
| `/speckit.plan`           | 根据规格选择技术栈，制定实现计划       |
| `/speckit.tasks`          | 生成可执行任务清单                     |
| `/speckit.implement`      | 驱动 AI 按任务列表完成代码实现         |
| `/speckit.clarify`        | 澄清规格中的含糊部分（可选步骤）       |

## 5. 整体使用流程示例（简版）

以生成一个“博客系统”为例：

1. **初始化项目：**

   ```bash
   specify init blog --ai copilot   # 或 --ai cursor
   ```

2. **定义规格（specify）：**
   在 Copilot / Cursor 聊天中输入：

   ```
   /speckit.specify Create a blog with posts, comments, user auth.
   ```

3. **生成技术计划（plan）：**

   ```
   /speckit.plan Use Next.js, Tailwind CSS, PostgreSQL.
   ```

4. **生成任务列表（tasks）：**

   ```
   /speckit.tasks
   ```

5. **执行实现（implement）：**

   ```
   /speckit.implement
   ```

AI 会分阶段输出：规格文档、技术计划、任务清单，并依据任务逐步生成对应代码。

## 小技巧与注意事项

- **规范越清晰、越完整，生成的代码就越准确。** 建议把验收标准写成可检查条目，而不是抽象描述。
- **结合版本控制使用。** 规范文件（spec、plan、tasks 等）与代码同仓管理，便于追溯需求变更与实现差异。
- **善用 `/speckit.clarify`。** 在 `/speckit.plan` 之前先消除歧义，能显著降低后续返工。
- **把质量门槛写进规范。** 例如：必须补齐测试、必须通过 CI、必须满足安全与权限要求。
