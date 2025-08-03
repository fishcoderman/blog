# React点击指定dom以外的位置

### 场景分析
比如说是有个按钮 ，点击这个按钮会出现下拉框 ，想点击除了下拉框其他的地方能关闭下拉框。

### 实现思路

核心思路是在`document`上添加一个全局的点击事件监听器。当用户点击页面任意位置时，这个监听器会检查点击的目标元素是否在需要监听的组件（比如下拉框）的 DOM 树内部。如果不在，就执行关闭下拉框的回调函数。

为了在 React 中优雅地实现这个功能，我们通常会封装一个自定义 Hook（Custom Hook），例如 `useClickOutside`。

### 代码实现

下面是一个 `useClickOutside` 自定义 Hook 的实现：

```jsx
import { useEffect, useRef } from 'react';

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // 如果 ref 不存在或者点击的就是 ref 内部的元素，则不执行
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // 使用 mousedown 事件，因为它在 click 事件之前触发
    // 这可以防止一些意外情况，比如点击关闭按钮时，按钮立即消失，导致 click 事件的目标元素已经不是原来的按钮
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener); // 兼容触摸设备

    return () => {
      // 组件卸载时移除事件监听
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // 依赖项数组，确保 ref 和 handler 变化时能重新绑定事件
};

export default useClickOutside;
```

### 使用案例

现在我们来看一个如何使用这个 `useClickOutside` Hook 的例子。我们将创建一个简单的下拉菜单组件，当点击按钮时显示，点击菜单外部区域时隐藏。

```jsx
import React, { useState, useRef } from 'react';
import useClickOutside from './useClickOutside'; // 假设 hook 文件在同级目录下

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 使用 useClickOutside hook，当点击外部时，设置 isOpen 为 false
  useClickOutside(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <div className="dropdown-container">
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '关闭' : '打开'}下拉菜单
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="dropdown-menu">
          <ul>
            <li>选项 1</li>
            <li>选项 2</li>
            <li>选项 3</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
```

### 关键点说明

1. **`useRef`**: 我们使用 `useRef` 来创建一个指向下拉菜单 `div` 的引用 (`dropdownRef`)。这使得我们可以在组件的整个生命周期内持有对该 DOM 元素的引用，而不会因为重新渲染而丢失。
2. **`useEffect`**: `useEffect` 用于处理副作用，这里是添加和移除全局事件监听器。返回一个清理函数是 `useEffect` 的标准模式，这可以确保在组件卸载时，我们添加的监听器被正确移除，防止内存泄漏。
3. **`ref.current.contains(event.target)`**: 这是实现的核心。`Node.contains()` 方法会判断传入的节点是否是当前节点的后代。通过这个检查，我们就能知道点击事件是否发生在下拉菜单组件内部。
4. **事件选择**: 使用 `mousedown` 而不是 `click` 是一个常见的优化。`mousedown` 事件触发在 `click` 之前。如果用户点击一个元素，而这个元素的 `click` 事件处理器会将其从 DOM 中移除（例如关闭按钮），那么 `document` 上的 `click` 监听器可能永远不会触发，或者触发时目标元素已经变了。使用 `mousedown` 可以更可靠地捕捉到用户的意图。

