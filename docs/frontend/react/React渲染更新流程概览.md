# React 18 渲染与更新全流程深度解析

::: tip
React 18 的并发特性是其历史上一次里程碑式的进化。这一变化的核心是 Fiber 架构，它彻底改变了 React 的协调（Reconciliation）过程，使其从同步阻塞变为异步可中断。
:::

本文将从一个应用的诞生到每一次状态更新，逐一剖析其内部精密的工作机制。
## 核心概念：React 宇宙的基石

在启程之前，我们必须先掌握构成 React 内部世界的几个核心概念。

*   **Fiber (纤维):** Fiber 不仅仅是一个数据结构，更是一个“工作单元”。它是一个纯粹的 JavaScript 对象，包含了组件的类型、props、state、以及与其他 Fiber 节点的关系。
    *   **关键属性**:
        *   `tag`: 标记 Fiber 的类型，如 `FunctionComponent`, `ClassComponent`, `HostComponent` (DOM 元素)。
        *   `key`: 我们熟悉的 `key` prop。
        *   `type`: 对于组件，它指向类或函数；对于 DOM 元素，它是字符串（如 'div'）。
        *   `stateNode`: 指向真实的实例，如组件实例、DOM 节点。
        *   `return`: 指向父 Fiber 节点。
        *   `child`: 指向第一个子 Fiber 节点。
        *   `sibling`: 指向下一个兄弟 Fiber 节点。
        *   `pendingProps` & `memoizedProps`: 开始工作时的 props 和完成工作后的 props。
        *   `updateQueue`: 一个待处理的状态更新和回调的链表。
        *   `flags`: 记录副作用（Side Effect）的类型，如 `Placement` (插入), `Update` (更新), `Deletion` (删除)。
        *   `lanes`: 一个位掩码，表示此 Fiber 节点上待处理的更新的优先级。
    *   **双缓冲树 (Double Buffering):** React 在内存中同时维护两棵 Fiber 树。一棵是 **current tree**，代表当前屏幕上已经渲染的 UI。另一棵是 **work-in-progress tree**，是正在后台构建的新树。当更新完成后，work-in-progress tree 会成为新的 current tree，这个过程几乎是瞬时的，避免了 UI 闪烁。

*   **Reconciliation (协调):** 找出新旧两棵树之间差异的过程，也就是我们常说的 "diffing"。在 Fiber 架构下，这个过程是可中断的。

*   **Scheduler (调度器):** 这是一个独立的包 (`scheduler`)，它实现了合作式多任务调度。它提供了一个任务队列，并根据任务的优先级（如 `Immediate`, `UserBlocking`, `Normal`, `Low`）来决定哪个任务先执行。React 的渲染任务会被包装成调度器任务来执行。

*   **Lane (车道) 模型:** 这是 React 18 并发模式的核心。它是一种更精细的优先级管理机制。
    *   **位掩码:** Lanes 是一个 31 位的二进制数，每一位或多位代表一种优先级。例如：
        *   `SyncLane`: 1 (最高，同步执行)
        *   `InputContinuousLane`: 4 (连续输入，如拖拽)
        *   `DefaultLane`: 16 (默认)
        *   `TransitionLane`: 64 (过渡)
        *   `IdleLane`: 536870912 (最低，空闲时执行)
    *   **优先级判断:** React 通过位运算可以快速地判断任务的优先级、合并多个更新、以及确定接下来要处理哪个优先级的任务 (`pickLanes`)。高优先级的 Lane 可以“抢占”正在进行的低优先级任务。

## 第一阶段：应用的启动 - `createRoot`

React 应用的生命始于 `createRoot`。

```javascript
// main.js
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### 1. `createRoot(container)`

这一步在内部调用 `createFiberRoot`，完成了两项至关重要的初始化工作：

1.  **创建 `FiberRootNode`**: 这是整个应用的根容器，一个与 DOM 无直接关联的内部对象。它包含了指向 `current` Fiber 树的指针、待处理的 `lanes`、回调函数队列等。可以把它想象成 React 应用实例的总控制室。
2.  **创建 `RootFiber`**: 这是 Fiber 树的第一个节点，其 `tag` 为 `HostRoot`。`FiberRootNode` 的 `current` 属性会指向这个 `RootFiber`。`RootFiber` 的 `stateNode` 则指向 `FiberRootNode` 自身，形成一个循环引用。

此时，我们有了一个 `FiberRootNode` 和一个 `RootFiber`，构成了 `current` 树的骨架，但屏幕上什么都还没有。

### 2. `root.render(<App />)`

调用 `render` 方法，实际上是调用了 `updateContainer`，这正式拉开了渲染的序幕。

`updateContainer` 的核心逻辑：

1.  **`requestUpdateLane()`**: 为这次更新请求一个 `lane`。对于首次渲染，它会返回最高优先级的 `SyncLane`，因为首次渲染必须是同步的。
2.  **`createUpdate()`**: 创建一个 `Update` 对象。这个对象包含了要渲染的内容（`payload: {element: <App />}`）和本次更新的 `lane`。
3.  **`enqueueUpdate()`**: 将这个 `Update` 对象加入到 `RootFiber` 的 `updateQueue` 中。`updateQueue` 是一个环形链表，存储着该 Fiber 节点上所有待处理的更新。
4.  **`scheduleUpdateOnFiber()`**: 这是所有更新（包括首次渲染和后续的 `setState`）的统一入口，是连接 React 核心（Reconciler）和调度器（Scheduler）的枢纽。

## 第二阶段：渲染阶段 (Render Phase) - 构建 W.I.P. 树

这是 React 最核心、最复杂的部分。此阶段的目标是在内存中构建出 `work-in-progress` 树。**此阶段是异步可中断的**。

### 1. `scheduleUpdateOnFiber`

这个函数是调度的起点。它会：

1.  **`markUpdateLaneFromFiberToRoot`**: 从触发更新的 Fiber 节点开始，沿着 `return` 指针一直向上，为路径上的所有父节点都标记上本次更新的 `lane`。这就像在高速公路上标记出需要施工的路段，让 React 知道哪些路径上有工作需要处理。
2.  **`ensureRootIsScheduled`**: 确保有一个任务被调度。如果当前没有正在进行的工作，它会计算出当前 `FiberRootNode` 上所有待处理的 `lanes` 中最高优的那个，然后调用 `Scheduler` 的 API（如 `Scheduler_runWithPriority`）来安排一个新的宏任务或微任务来执行渲染工作。

### 2. 工作循环 (The Work Loop)

当调度器开始执行 React 的渲染任务时，`performSyncWorkOnRoot` (同步) 或 `performConcurrentWorkOnRoot` (并发) 会被调用。它们内部都包含一个核心的循环，我们称之为 "Work Loop"。

循环的基本单位是 `performUnitOfWork`，它处理单个 Fiber 节点，并返回下一个要处理的节点。

```javascript
function workLoop(workInProgress) {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

`performUnitOfWork` 的逻辑是：

1.  调用 `beginWork` 处理当前节点，并返回其第一个子节点。
2.  如果 `beginWork` 返回了子节点，那么下一个工作单元就是这个子节点。
3.  如果 `beginWork` 没有返回子节点（说明该节点没有子节点），则调用 `completeWork` 处理当前节点。然后，寻找其兄弟节点作为下一个工作单元。
4.  如果没有兄弟节点，则继续对父节点执行 `completeWork`，并寻找父节点的兄弟节点。
5.  这个“递”(`beginWork`)和“归”(`completeWork`)的过程，本质上是对 Fiber 树进行深度优先遍历。

### 3. `beginWork` (向下协调阶段)

`beginWork` 的核心任务是 **“diff”**，即比较新旧状态，决定是否可以复用旧 Fiber，并生成新的子 Fiber。

它的行为取决于 `fiber.tag`：

*   **`FunctionComponent`**: 调用 `renderWithHooks`，这会：
    1.  执行函数组件本身的代码。
    2.  处理 `useState`, `useEffect` 等 hooks。
    3.  返回 JSX (React Elements)。
    4.  然后调用 `reconcileChildren` 来 diff 子节点。
*   **`ClassComponent`**: 实例化组件，调用 `UNSAFE_componentWillMount` (如果存在)，执行 `render()` 方法，然后 `reconcileChildren`。
*   **`HostComponent` (`<div>`, `<span>` 等)**: 它本身不需要做什么，直接 `reconcileChildren`。

**`reconcileChildren` (Diff 算法)**

这是 `beginWork` 的精髓所在。它会根据新的子元素（JSX）和旧的子 Fiber 来生成新的 `work-in-progress` 子 Fiber，并打上副作用 `Flag`。

*   **单节点 Diff (`reconcileSingleElement`)**:
    *   **Key 和 Type 都相同**: 复用旧 Fiber，只更新 props，标记为 `Update`。
    *   **Key 相同，Type 不同**: 无法复用。将旧 Fiber 标记为 `Deletion`，并创建一个全新的 Fiber。
    *   **Key 不同**: 同上，旧的删除，新的创建。

*   **多节点 Diff (`reconcileChildrenArray`)**: 这是最复杂的部分，React 采用了一个高效的**两轮遍历**策略来最小化 DOM 操作。
    1.  **第一轮**: 从头开始同步遍历新旧子节点数组。如果 `key` 和 `type` 都匹配，则复用并继续。一旦遇到不匹配的节点，立即跳出循环。
    2.  **第二轮**:
        *   将剩余的旧子节点放入一个以 `key` 为索引的 Map 中，方便快速查找。
        *   继续遍历剩余的新子节点数组。
        *   对于每个新节点，尝试用它的 `key` 去 Map 中查找可复用的旧节点。
        *   **找到了**: 复用旧节点，并将其从 Map 中移除。因为位置可能变了，所以给这个复用的 Fiber 打上 `Placement` 的 `Flag`。
        *   **没找到**: 这是一个全新的节点，创建新的 Fiber，并打上 `Placement` 的 `Flag`。
    3.  **收尾**: 新数组遍历完后，Map 中还剩下的所有旧节点，都是在新 UI 中不存在的，将它们全部标记为 `Deletion`。

### 4. `completeWork` (向上归并阶段)

当一个节点的所有子节点都处理完毕后，轮到它自己执行 `completeWork`。此阶段的核心任务是**创建 DOM 节点**和**构建副作用列表 (Effect List)**。

*   **创建/更新 DOM**:
    *   对于 `HostComponent`，如果它是新创建的 (`workInProgress.stateNode === null`)，则调用 `createInstance` (`document.createElement`) 创建真实 DOM 节点，并将其赋给 `stateNode`。
    *   调用 `appendInitialChildren` 将其所有子 DOM 节点（此时已在子 Fiber 的 `completeWork` 中创建好）追加到自己身上。
    *   调用 `finalizeInitialChildren` 设置 DOM 属性和事件监听。
*   **构建 Effect List**:
    `completeWork` 会检查当前 Fiber 节点是否有 `Flag`。同时，它会合并其所有子节点已经形成的 `effect list`。最终，它会将子节点的 `effect list` 和自身的 `effect`（如果存在）连接起来，形成一个更长的 `effect list`，并附加到 `return` 父节点上。这个过程不断向上归并，最终在 `RootFiber` 上形成一个包含了所有需要进行 DOM 操作的 Fiber 节点的单向链表。

当 `workLoop` 完成，回到 `RootFiber` 时，我们得到了一棵完整的 `work-in-progress` 树和一条完整的 `effect list`。渲染阶段结束。

## 第三阶段：提交阶段 (Commit Phase) - 应用变更

此阶段负责将渲染阶段计算出的变更应用到真实的 DOM 上。**此阶段是同步且不可中断的**，以保证 UI 的一致性。

`commitRoot` 函数会按顺序执行三个子阶段：

### 1. Before Mutation (突变前)

*   遍历 `effect list`，执行 `getSnapshotBeforeUpdate` 生命周期方法。这使得我们可以在 DOM 实际变化前，从 DOM 中读取一些信息（如滚动位置）。
*   同步调用所有 `useLayoutEffect` 的销毁函数。

### 2. Mutation (突变)

*   再次遍历 `effect list`，根据每个 Fiber 上的 `Flag` 执行实际的 DOM 操作：
    *   **`Placement`**: 调用 `parentNode.insertBefore()` 或 `appendChild()` 将新节点插入 DOM。
    *   **`Update`**: 更新 DOM 节点的属性、样式或文本内容。
    *   **`Deletion`**: 调用 `parentNode.removeChild()` 将节点从 DOM 中移除。

### 3. Layout (布局后)

*   **切换 Fiber 树**: `FiberRootNode.current` 指针从旧的 `current` 树切换到刚刚完成的 `work-in-progress` 树，后者正式成为新的 `current` 树。
*   **调用生命周期和 Hooks**:
    *   遍历 `effect list`，同步调用 `componentDidMount`、`componentDidUpdate` 和 `useLayoutEffect` 的创建函数。因为它们是同步的，所以可以安全地在其中执行 DOM 测量。
    *   **异步调度 `useEffect`**: React 会异步地调度一个新任务来执行所有 `useEffect` 的创建函数。这确保了它们不会阻塞浏览器的绘制，从而提升用户感知的性能。

## 总结

React 18 的工作流程是一套设计精巧、高度优化的系统：

1.  **触发**: `root.render()` 或 `setState()` 产生一个 `Update`。
2.  **调度**: `scheduleUpdateOnFiber` 为更新分配 `Lane`，并请求 `Scheduler` 安排任务。
3.  **渲染 (Render Phase - 可中断)**:
    *   **`beginWork` (向下)**: 通过 `diff` 算法找出差异，生成 `work-in-progress` 子节点并标记 `Flag`。
    *   **`completeWork` (向上)**: 创建 DOM 节点（在内存中），并构建包含所有 `Flag` 节点的 `effect list`。
4.  **提交 (Commit Phase - 不可中断)**:
    *   **Before Mutation**: 执行 `getSnapshotBeforeUpdate`。
    *   **Mutation**: 遍历 `effect list`，执行 DOM 操作。
    *   **Layout**: 切换 Fiber 树，同步执行 `useLayoutEffect`，异步调度 `useEffect`。

通过这套机制，特别是可中断的渲染阶段和精细的 Lane 优先级模型，React 18 能够在执行繁重的渲染任务时，依然能优先响应用户的交互，从而实现真正的并发用户体验。
