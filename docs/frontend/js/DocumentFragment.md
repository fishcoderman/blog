# DocumentFragment

## 什么是 DocumentFragment？

`DocumentFragment` 是一个轻量级的文档对象，可以被看作是一个“文档片段”或“代码仓库”。它不是主 DOM 树的一部分，因此对它的操作不会引起页面的重绘或回流，这使得它在处理大量 DOM 操作时非常高效。

可以将 `DocumentFragment` 理解为一个临时的、不可见的容器，可以在其中添加、删除或修改节点，然后一次性地将整个片段插入到主 DOM 树中。

## 为什么要使用 DocumentFragment？

在 Web 开发中，频繁地操作 DOM（例如，在一个循环中多次向一个元素添加子节点）会导致性能问题。每当向 DOM 中添加一个节点时，浏览器都可能需要重新计算页面布局（回流）和重新绘制屏幕（重绘）。

**不使用 `DocumentFragment` 的例子 (性能较低):**

```javascript
const list = document.getElementById('my-list');

for (let i = 0; i < 100; i++) {
  const listItem = document.createElement('li');
  listItem.textContent = `Item ${i + 1}`;
  list.appendChild(listItem); // 每次循环都会操作DOM，可能导致100次回流/重绘
}
```

上面的代码每次循环都会向 `<ul>` 元素中添加一个新的 `<li>` 元素，这可能会触发 100 次 DOM 更新，效率很低。

使用 `DocumentFragment` 可以完美解决这个问题。我们可以先将所有新创建的 `<li>` 元素添加到 `DocumentFragment` 中，然后只需一次操作，就将整个片段附加到主 DOM 上。

## 如何使用 DocumentFragment？

使用 `DocumentFragment` 非常简单，主要分为三步：

1. 创建一个 `DocumentFragment` 实例。
2. 将新的 DOM 节点附加到该片段上。
3. 将整个 `DocumentFragment` 附加到主 DOM 树中的目标节点上。

**使用 `DocumentFragment` 的例子 (性能更高):**

```javascript
const list = document.getElementById('my-list');

// 1. 创建一个 DocumentFragment
const fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
  const listItem = document.createElement('li');
  listItem.textContent = `Item ${i + 1}`;
  // 2. 将新节点附加到 fragment 上
  fragment.appendChild(listItem); 
}

// 3. 将整个 fragment 一次性附加到 DOM
list.appendChild(fragment); // 只会触发一次回流/重绘
```

### 关键点

- 当 `DocumentFragment` 被附加到 DOM 时，被附加的是它所有的子节点，而不是 `DocumentFragment` 本身。它就像一个空的篮子，把里面的东西（子节点）放进 DOM 后，篮子本身就空了。
- 所有对 `DocumentFragment` 的操作都在内存中进行，不会影响页面的实时渲染，因此性能开销极小。

## 总结

`DocumentFragment` 是一个强大且实用的 Web API，尤其适用于需要动态生成和插入大量 DOM 元素的场景。通过将多次 DOM 操作合并为一次，它可以显著提升应用的性能和用户体验。在构建复杂的列表、表格或任何需要批量添加元素的地方，都应该优先考虑使用 `DocumentFragment`。