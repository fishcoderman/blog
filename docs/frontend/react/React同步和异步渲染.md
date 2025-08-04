# React 18 并发渲染：告别卡顿，拥抱未来

是否曾遇到过这样的场景：在一个复杂的 React 应用中，用户在输入框里打字，页面却因为背后庞大的数据处理或渲染任务而出现卡顿？这种恼人的延迟，正是 React 17 及之前版本同步渲染模式的“通病”。

为了解决这个问题，React 18 带来了一场革命性的变化：**并发渲染（Concurrent Rendering）**。这不仅仅是一次性能优化，更是对 React 核心渲染机制的重塑。它赋予了 React “一心多用”的能力，能够智能地处理多个渲染任务，优先响应用户操作。

本文将带深入浅出地理解并发渲染的魔力，从它与传统同步渲染的区别，到如何在的项目中开启和使用它，让彻底告别 UI 卡顿的烦恼。

### 一、两种渲染模式的对决：同步 vs. 并发

想象一下，传统的同步渲染就像一条单行道，一旦有任务（比如一个庞大的组件渲染）上路，就必须等它跑完全程，其他任务（包括用户的点击、输入）都得排队等着，这就是 UI 卡顿的根源。

而并发渲染则像一个智能的交通调度系统。它将大的渲染任务拆分成许多小片段，在渲染过程中可以随时“暂停”，去处理更紧急的任务（比如响应用户输入），处理完后再回来继续之前的渲染。

| 特性 | 同步渲染 (React 17 及以前) | 并发渲染 (React 18+) |
| :--- | :--- | :--- |
| **核心机制** | **阻塞式**，一旦开始无法中断 | **可中断**，可调度优先级 |
| **UI 响应** | 长任务会阻塞 UI，导致卡顿 | 优先响应用户输入，UI 更流畅 |
| **时间分片** | ❌ 不支持 | ✅ 支持，React 自动切分任务 |
| **用户体验** | 关键操作可能被延迟 | 始终保持平滑、不卡顿的交互 |
| **实现原理** | 栈式递归同步更新 | Fiber 架构 + 调度器 |

### 二、重要提醒：React 18 默认不开启并发

虽然 React 18 内置了强大的并发能力，但为了保证向后兼容，它并**不会默认开启**。应用需要“主动选择”进入并发模式。如果升级到 React 18 后，没有修改任何代码，那么它仍然会以旧的同步模式运行。

### 三、如何“解锁”并发渲染？

开启并发渲染就像是为的 React 应用开启一个新纪元。下面是几种关键的“解锁”方式：

#### 1. 基础前提：使用 `createRoot`

这是开启并发渲染的**入场券**。React 18 引入了新的根节点 API `createRoot`，只有通过它创建的应用，才能使用所有并发新特性。

```tsx
// React 17 及以前的写法
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// React 18 开启并发模式的写法
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

> ⚠️ **注意**：只要的应用还在使用 `ReactDOM.render`，并发模式就永远不会被激活。

#### 2. 核心工具：`startTransition`

这个 API 是控制渲染优先级的“魔杖”。它告诉 React：“接下来的这个状态更新不那么紧急，可以稍后处理，如果遇到更重要的事，可以随时打断它。”

这非常适合用于处理搜索框输入、筛选列表等场景，既要更新 UI，又不能影响用户的输入体验。

```tsx
import { startTransition, useState } from 'react';

function SearchComponent() {
  const [inputValue, setInputValue] = useState(''); // 紧急更新
  const [searchQuery, setSearchQuery] = useState(''); // 非紧急更新

  const handleChange = (e) => {
    // 1. 立刻更新输入框，保证用户输入流畅
    setInputValue(e.target.value);

    // 2. 将“搜索”这个耗时任务标记为非紧急
    startTransition(() => {
      setSearchQuery(e.target.value); // 这个更新可以被中断
    });
  };

  return (
    <>
      <input value={inputValue} onChange={handleChange} />
      {/* 基于 searchQuery 显示搜索结果的列表... */}
    </>
  );
}
```

#### 3. 优雅降级：`Suspense` 与 `React.lazy`

`<Suspense>` 是并发模式下的重要组成部分，它允许声明式地处理“加载中”的状态。当一个组件因为数据获取或代码懒加载而“暂停”渲染时，`Suspense` 会优雅地展示一个 `fallback` UI，而不会拖慢整个应用的响应。

```tsx
import React, { Suspense } from 'react';

const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      <h1>我的应用</h1>
      <Suspense fallback={<div>正在加载，请稍候...</div>}>
        {/* LazyComponent 加载完成前，会显示上面的 fallback */}
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

#### 4. 延迟更新：`useDeferredValue`

`useDeferredValue` 是 `startTransition` 的一个变种，它用于“延迟”一个值的更新。当无法直接控制状态更新的代码时（例如，值来自父组件的 props），这个 Hook 就派上了用场。

它会返回一个“延迟后”的版本，这个版本的更新优先级较低，不会阻塞紧急渲染。

```tsx
import { useState, useDeferredValue } from 'react';

function Typeahead() {
  const [text, setText] = useState('');
  // deferredText 的更新会“让步”于其他紧急更新
  const deferredText = useDeferredValue(text);

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      {/* 使用 deferredText 来渲染建议列表，避免输入卡顿 */}
      <SuggestionList text={deferredText} />
    </div>
  );
}
```

### 四、调试技巧：洞察并发的运作

如何知道的应用是否真的在以并发模式运行？React 官方的开发者工具有力地支持了这一点。

- **React DevTools (v4+)**：在 Profiler 中，可以清晰地看到哪些组件的渲染是由 `startTransition` 触发的，以及 `Suspense` 的挂起和恢复过程。
- **组件高亮**：在开发者工具的设置中开启“高亮由 transition 触发的更新”，可以直观地看到哪些 UI 变化是低优先级更新。

### 总结：迈向现代 React 开发

并发渲染是 React 发展的一大步，它将开发者从手动优化性能的繁琐工作中解放出来，让我们能更专注于业务逻辑。

要拥抱并发，请记住以下核心要点：

1. **必须使用 `createRoot`**：这是激活并发能力的唯一入口。
2. **善用 `startTransition`**：将非紧急、可能耗时的更新包裹起来，是提升交互体验的关键。
3. **拥抱 `Suspense`**：用它来管理异步加载状态，提供更优雅的用户体验。

从同步到并发，不仅仅是 API 的变化，更是思维模式的转变。
