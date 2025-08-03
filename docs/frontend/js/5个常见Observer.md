# 5个常见Observer

以下是 JavaScript 中 5 个常见 Observer 的用法和区别，重点对比 IntersectionObserver 和 ResizeObserver，并补充其他常用 Observer：

## IntersectionObserver（交叉观察器）

作用：监听目标元素与视口（或指定根元素）的交叉状态（即可见性）。

核心用法：

- 触发条件：当目标元素进入或离开视口，或者它们的交叉比例达到设定的阈值时触发。
- 典型场景：图片懒加载、无限滚动、广告曝光统计、内容到达可视区域后执行动画。

示例代码：

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('元素进入视口:', entry.target);
      // 加载图片或执行其他操作
      observer.unobserve(entry.target); // 停止观察已处理的元素，避免重复触发
    }
  });
}, {
  root: null, // 基于浏览器视口进行观察
  rootMargin: '0px', // 视口外延，'10px 20px 30px 40px' (top, right, bottom, left)
  threshold: 0.5 // 交叉比例阈值，可以是单个数字或数组 [0, 0.5, 1]
});

observer.observe(document.querySelector('.lazy-image')); // 观察目标元素
```

关键特性：

- 异步执行，性能好，不会阻塞主线程。
- 允许自定义根元素（`root`），实现容器内的滚动检测。
- 可通过 `rootMargin` 扩展或收缩根元素的边界，提前或延迟触发。

## ResizeObserver（尺寸观察器）

作用：监听元素尺寸（内容区域或边框盒子）的变化。

核心用法：

- 触发条件：元素的尺寸发生变化时（例如，内容撑开、CSS 属性改变、窗口大小调整）。
- 典型场景：响应式布局调整、图表库自适应容器大小、可拖拽组件的尺寸实时计算。

示例代码：

```js
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    // entry.contentRect 是旧版 API，推荐使用 borderBoxSize
    const borderBox = entry.borderBoxSize[0];
    if (borderBox) {
      const { inlineSize, blockSize } = borderBox;
      console.log(`元素尺寸变化: width=${inlineSize}px, height=${blockSize}px`);
      // 动态调整布局或重绘图表
    }
  }
});

observer.observe(document.querySelector('.resizable-box')); // 观察目标元素
```

关键特性：

- 能精确监听元素自身的尺寸变化，而不是整个窗口。
- 回调中提供 `borderBoxSize` 和 `contentBoxSize`，可以获取更精确的尺寸信息。
- 避免了在 `requestAnimationFrame` 中手动轮询检查尺寸的低效做法。

## MutationObserver（突变观察器）

作用：监听 DOM 树的变化，包括节点的增删、属性的修改或文本内容的变化。

核心用法：

- 触发条件：当观察的目标节点或其子树的结构、属性或文本发生变化时。
- 典型场景：富文本编辑器内容变化检测、监控第三方脚本对 DOM 的修改、动态表单校验。

示例代码：

```js
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      console.log('子节点发生变化');
    } else if (mutation.type === 'attributes') {
      console.log(`属性 '${mutation.attributeName}' 被修改`);
    }
  });
});

// 观察 body 元素及其整个子树的节点添加/删除和属性变化
observer.observe(document.body, {
  childList: true, // 监听子节点的增加或删除
  attributes: true, // 监听属性变化
  subtree: true // 递归监听所有后代节点
});
```

关键特性：

- 功能强大，可精细化配置需要观察的变化类型（`childList`, `attributes`, `characterData`）。
- 支持递归监听整个子树 (`subtree: true`)。
- 将多次 DOM 变动合并到一次回调中，以微任务（microtask）形式异步执行，避免性能问题。

## PerformanceObserver（性能观察器）

作用：监听并收集页面性能指标数据，如首次绘制（FP）、资源加载时间、长任务等。

核心用法：

- 触发条件：当指定的性能事件（performance entry）发生时。
- 典型场景：前端性能监控、分析页面加载瓶颈、上报 Web Vitals 指标。

示例代码：

```js
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.entryType === 'paint') {
      console.log(`${entry.name} 时间:`, entry.startTime);
    }
  });
});

// 观察 "paint" 类型的性能条目
observer.observe({ entryTypes: ['paint'] });
```

关键特性：

- 专为性能监控设计，是获取精确性能数据的标准方式。
- 可以通过 `buffered: true` 获取在观察开始前就已经发生的性能条目。
- 支持多种 `entryTypes`，如 `resource`, `navigation`, `longtask` 等。

## 自定义事件实现的观察者模式

作用：这并非一个原生的 Observer API，而是利用浏览器的自定义事件（CustomEvent）来实现的一种观察者设计模式，用于应用内模块或组件间的解耦通信。

核心用法：

- 触发条件：当代码中手动派发（dispatch）一个自定义事件时。
- 典型场景：跨组件通信、复杂交互逻辑解耦、状态管理。

示例代码：

```js
// 监听方 (Observer)
document.addEventListener('myCustomEvent', (e) => {
  console.log('自定义事件触发，接收到数据:', e.detail);
});


// 发布方 (Notifier)
function doSomething() {
  // 创建一个自定义事件
  const event = new CustomEvent('myCustomEvent', {
    detail: { data: '一些重要信息' }
  });
  // 在 document 上派发事件
  document.dispatchEvent(event);
}

doSomething();
```

关键特性：

- 极高的灵活性，可以根据业务需求定义任意事件和数据结构。
- 需要手动管理事件的监听和移除，以避免内存泄漏。
- 是实现发布/订阅模式的常用浏览器原生机制。

## 核心区别对比

| Observer             | 监听目标                 | 触发条件                       | 典型场景                       | 性能开销                               |
| -------------------- | ------------------------ | ------------------------------ | ------------------------------ | -------------------------------------- |
| **IntersectionObserver** | 元素与视口的交叉状态     | 交叉比例达到阈值               | 懒加载、无限滚动               | 低（浏览器底层优化）                   |
| **ResizeObserver**       | 元素自身尺寸             | 尺寸发生变化                   | 响应式布局、图表自适应         | 中（高效于手动轮询）                   |
| **MutationObserver**     | DOM 树结构或属性         | 节点增删、属性或文本内容修改   | 动态表单、监控脚本行为         | 较高（取决于观察范围和频率）           |
| **PerformanceObserver**  | 页面性能指标             | 指定性能事件发生               | 性能监控、Web Vitals           | 低（专为性能监控设计）                 |
| **自定义事件**       | 自定义事件               | 手动派发事件                   | 组件通信、应用内解耦           | 取决于实现逻辑和事件复杂度             |

总结：

- **元素可见性** → 选 `IntersectionObserver`。
- **元素尺寸变化** → 选 `ResizeObserver`。
- **DOM 结构变化** → 选 `MutationObserver`。
- **页面性能监控** → 选 `PerformanceObserver`。
- **应用内逻辑解耦** → 使用**自定义事件**实现观察者模式。