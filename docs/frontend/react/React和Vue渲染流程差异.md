# React和Vue渲染流程差异

### React 状态变更更新流程：

setState 或 useState 触发更新

将更新对象加入队列（UpdateQueue）

找到 Root Fiber 节点

自顶向下执行调和（beginWork → completeWork）

比较虚拟 DOM（Fiber）差异

生成 Effect List（变更操作队列）

执行 commitWork 应用到真实 DOM

即使只更新了子组件，也会从 Root Fiber 重新走一遍整棵 Fiber Tree（但有 bailout 优化：不变组件跳过）。

### Vue状态变更流程：
以 Vue 3 Composition API 为例，修改 reactive 或 ref 的值

Proxy 拦截到变更，触发 trigger() 函数

通过依赖追踪系统，精确知道哪个组件用到了这个值

调度该组件的 effect.run()，重新渲染这个组件（render()）

虚拟 DOM diff 并 patch 到真实 DOM

Vue 是“点对点更新”：谁依赖了这个响应式数据，谁就更新。

### 性能优化

优化方式 | React | Vue
|-- | -- | --|
|跳过重渲染 | React.memo / PureComponent | 响应式依赖自动追踪|
|避免子组件重算 | useMemo, useCallback | 不需要，除非用到 computed 优化|
|更新调度 | startTransition / flushSync | nextTick, flushPostFlushCbs|
|静态模板优化 | 较弱（需插件） | 静态提升，Patch Flag 非常强|

### 渲染区别

维度 | React | Vue
-- | -- | --
响应式系统 | 无内建响应式（状态不可变） | Proxy + Dep 依赖收集系统
渲染粒度 | 从 Root Fiber 向下全树遍历 | 精准组件更新
更新触发路径 | setState → Root Fiber → 全树渲染 | ref.value = x → 当前组件渲染
性能优化依赖开发者 | 高（需 memo/useMemo） | 低（自动依赖追踪）
并发调度能力（v18+） | 支持，使用 Fiber 架构 | Vue 3 也有调度系统，但无时间切片


**react 每次都要从 Root Fiber 向下全树遍历在diff变更，而vue只要根据依赖变更精准渲染，所以是不是react的性能损耗更大？**

### React 的渲染机制导致的“全树 diff

在 React 中，每次状态变更（比如 setState），React 会：

根据变更的组件（子组件）从其 Fiber 节点向上找到 Root Fiber

从 Root Fiber 开始重新走一遍 “render 阶段”（beginWork → completeWork），也就是全树调和

如果某些节点 props 和 state 没有变化，会触发“bailout”（跳过节点）

然后在 commitWork 阶段执行真正的 DOM 更新（只更新变化的部分）

➡️ 所以：虽然是全树遍历，但只有真正变化的节点才会生成 DOM 更新操作，React 是“调和 + 最小更新”策略。

### Vue 的精细依赖追踪优势
Vue 的响应式系统基于 Proxy + Dep，实现的是精确依赖追踪：

每个组件在 render 过程中会收集用到的响应式变量

每次状态变更时，trigger() 精确知道是哪个组件要重新执行 render

只重新渲染用到这个响应式数据的组件

比如你有一个页面 100 个组件，只有第 3 个组件用了这个值，那就只更新它 ✅

➡️ 所以 Vue 的渲染是“点对点”、“组件粒度更新”，性能更细致，浪费更少。

### 为什么 React 依然性能很好？
虽然 React 没有 Vue 的“依赖追踪”，但它有：

⏳ 时间分片调度（React 18 concurrent mode）：可以把耗时渲染任务拆分执行

🧠 跳过未变化的组件（通过 shouldComponentUpdate, React.memo，useMemo 等）

🚀 增量更新 Fiber 树（仅保留变化路径上的工作节点）

🛠️ React Dev Tools 帮助优化识别不必要的更新

➡️ 但这些都需要 开发者主动参与。而 Vue 是默认帮你“自动优化”。

### 总结：谁的性能更好？

结论 | 说明
-- | --
理论上 Vue 渲染开销更小 | 响应式依赖追踪+精准组件更新，天然适合细粒度场景
React 易产生“无效遍历” | 虽然只更新部分，但遍历 Fiber 树代价还是存在
React 可通过优化逼近 Vue 性能 | 使用 memo、useCallback 等手动优化手段
Vue 更适合不想手动优化的小团队/页面 | 几乎零优化也能跑得很稳
React 更适合控制粒度与高度可定制的系统 | 比如动画并发、异步 UI、复杂调度
