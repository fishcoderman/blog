# 发布订阅addEventListener

window.addEventListener 是基于发布订阅模式实现的，同一个事件可以添加多个监听器。解释一下关键点：

1. **多次声明示例**
```javascript
// 同一个事件可以添加多个不同的处理函数
window.addEventListener('click', () => {
    console.log('点击处理器 1');
});

window.addEventListener('click', () => {
    console.log('点击处理器 2');
});

// 点击时会按照添加顺序依次输出：
// "点击处理器 1"
// "点击处理器 2"
```

2. **相同函数重复添加**
```javascript
const handler = () => console.log('点击了');

// 完全相同的处理函数只会被添加一次
window.addEventListener('click', handler);
window.addEventListener('click', handler); // 这个会被忽略
```

3. **移除监听器**
```javascript
const handler = () => console.log('点击了');

window.addEventListener('click', handler);
// 移除特定的监听器
window.removeEventListener('click', handler);

// 注意：匿名函数无法被移除
window.addEventListener('click', () => console.log('点击'));
// 这样是无效的，因为每次创建的都是新的函数引用
window.removeEventListener('click', () => console.log('点击'));
```

4. **事件选项**
```javascript
window.addEventListener('click', handler, {
    once: true,      // 只执行一次就自动移除
    capture: false,  // 是否在捕获阶段处理
    passive: true    // 承诺不会调用 preventDefault()
});
```

5. **简单的发布订阅模式实现示例**
```javascript
class EventTarget {
  constructor() {
    // 存储所有事件监听器的对象
    this.listeners = new Map();
  }

  addEventListener(type, callback, options = false) {
    // 获取该类型事件的所有监听器
    let handlers = this.listeners.get(type);
    
    // 如果还没有这个事件类型的处理数组，创建一个
    if (!handlers) {
      handlers = new Map();
      this.listeners.set(type, handlers);
    }

    // 防止重复添加相同的处理函数
    if (!handlers.has(callback)) {
      // 将回调函数和选项一起存储
      handlers.set(callback, {
        callback,
        options: typeof options === 'boolean' ? { capture: options } : options
      });
    }
  }

  removeEventListener(type, callback, options = false) {
    // 获取该类型的所有监听器
    const handlers = this.listeners.get(type);
    
    if (handlers) {
      // 删除特定的回调函数
      handlers.delete(callback);
      
      // 如果该事件类型没有处理函数了，删除整个事件类型
      if (handlers.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  dispatchEvent(event) {
    // 获取事件类型的所有监听器
    const handlers = this.listeners.get(event.type);
    
    if (handlers) {
      // 复制处理函数列表，防止在执行过程中的修改影响遍历
      const handlersArray = Array.from(handlers.values());
      
      for (const { callback, options } of handlersArray) {
        // 检查 once 选项
        if (options.once) {
          this.removeEventListener(event.type, callback);
        }
        
        // 执行回调
        callback.call(this, event);
      }
    }
  }
}
```

实际的浏览器实现要复杂得多，还需要考虑：

1. **事件捕获和冒泡**
```javascript
class EventTarget {
  dispatchEvent(event) {
    // 捕获阶段
    this._dispatchPhase(event, true);
    // 目标阶段
    this._dispatchToTarget(event);
    // 冒泡阶段
    this._dispatchPhase(event, false);
  }

  _dispatchPhase(event, capture) {
    const handlers = this.listeners.get(event.type);
    
    if (handlers) {
      handlers.forEach(({ callback, options }) => {
        // 只在相应的阶段执行对应的处理函数
        if (options.capture === capture) {
          callback.call(this, event);
        }
      });
    }
  }
}
```
2. **事件委托的优化**
```javascript
class EventTarget {
  constructor() {
    // 使用 WeakMap 存储事件处理函数，防止内存泄漏
    this.listeners = new WeakMap();
  }

  // 优化的事件委托处理
  _handleDelegatedEvent(event) {
    let target = event.target;
    
    // 向上遍历 DOM 树
    while (target && target !== this) {
      const handlers = this.listeners.get(target);
      if (handlers) {
        handlers.forEach(handler => handler(event));
      }
      target = target.parentNode;
    }
  }
}
```
3. **被动事件监听器（Passive Event Listeners）**
```javascript
class EventTarget {
  addEventListener(type, callback, options = {}) {
    // 处理 passive 选项
    if (options.passive) {
      // 标记这个监听器不会调用 preventDefault()
      // 这允许浏览器在不等待 JavaScript 的情况下执行默认行为
      // 特别适用于触摸事件和滚动事件
    }
  }
}
```

4. **事件优先级**
```javascript
class EventTarget {
  dispatchEvent(event) {
    const handlers = this.listeners.get(event.type);
    
    if (handlers) {
      // 按优先级排序处理函数
      const sortedHandlers = Array.from(handlers.values())
        .sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));
      
      for (const handler of sortedHandlers) {
        handler.callback.call(this, event);
      }
    }
  }
}
```

5. **内存管理**
```javascript
class EventTarget {
  constructor() {
    // 使用 WeakMap 和 WeakSet 来自动清理不再使用的监听器
    this.listeners = new WeakMap();
  }

  cleanup() {
    // 移除所有监听器
    this.listeners = new WeakMap();
  }
}
```
下面是一个相对完整的 EventTarget 实现，包含了事件捕获/冒泡、事件委托、优先级、passive 选项等特性：
```javascript
class Event {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles ?? true;
    this.cancelable = options.cancelable ?? true;
    this.defaultPrevented = false;
    this.currentTarget = null;
    this.target = null;
    this.eventPhase = 0; // 0: none, 1: capturing, 2: target, 3: bubbling
    this.timeStamp = Date.now();
    this._stopPropagation = false;
    this._stopImmediatePropagation = false;
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  stopPropagation() {
    this._stopPropagation = true;
  }

  stopImmediatePropagation() {
    this._stopPropagation = true;
    this._stopImmediatePropagation = true;
  }
}

class EventTarget {
  constructor() {
    // 使用 WeakMap 存储事件监听器，防止内存泄漏
    this.listeners = new Map();
    this.parentNode = null;
    this.children = new Set();
  }

  addEventListener(type, callback, options = {}) {
    if (typeof callback !== 'function') {
      return;
    }

    // 标准化选项
    const normalizedOptions = {
      capture: Boolean(typeof options === 'boolean' ? options : options.capture),
      once: Boolean(options.once),
      passive: Boolean(options.passive),
      priority: Number(options.priority) || 0
    };

    // 获取该类型事件的所有监听器
    let handlers = this.listeners.get(type);
    
    if (!handlers) {
      handlers = new Map();
      this.listeners.set(type, handlers);
    }

    // 防止重复添加相同的处理函数
    if (!handlers.has(callback)) {
      handlers.set(callback, {
        callback,
        options: normalizedOptions
      });
    }
  }

  removeEventListener(type, callback, options = {}) {
    const handlers = this.listeners.get(type);
    
    if (handlers) {
      handlers.delete(callback);
      
      if (handlers.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  dispatchEvent(event) {
    if (!(event instanceof Event)) {
      throw new Error('Invalid event object');
    }

    // 设置目标元素
    event.target = this;

    // 构建传播路径
    const path = [];
    let node = this;
    while (node) {
      path.unshift(node);
      node = node.parentNode;
    }

    // 捕获阶段
    event.eventPhase = 1;
    for (let i = 0; i < path.length - 1; i++) {
      event.currentTarget = path[i];
      this._dispatchToNode(event, path[i], true);
      
      if (event._stopPropagation) break;
    }

    // 目标阶段
    if (!event._stopPropagation) {
      event.eventPhase = 2;
      event.currentTarget = this;
      this._dispatchToNode(event, this, false);
    }

    // 冒泡阶段
    if (event.bubbles && !event._stopPropagation) {
      event.eventPhase = 3;
      for (let i = path.length - 2; i >= 0; i--) {
        event.currentTarget = path[i];
        this._dispatchToNode(event, path[i], false);
        
        if (event._stopPropagation) break;
      }
    }

    // 重置事件状态
    event.currentTarget = null;
    event.eventPhase = 0;

    return !event.defaultPrevented;
  }

  _dispatchToNode(event, node, isCapturing) {
    const handlers = node.listeners.get(event.type);
    
    if (!handlers) return;

    // 将处理函数转换为数组并按优先级排序
    const handlersArray = Array.from(handlers.values())
      .filter(({ options }) => options.capture === isCapturing)
      .sort((a, b) => b.options.priority - a.options.priority);

    for (const { callback, options } of handlersArray) {
      if (event._stopImmediatePropagation) break;

      // 如果是 passive 监听器，创建一个新的不可 preventDefault 的事件对象
      let eventToDispatch = event;
      if (options.passive) {
        eventToDispatch = new Proxy(event, {
          get(target, prop) {
            if (prop === 'preventDefault') {
              return () => {
                console.warn('Unable to preventDefault inside passive event listener');
              };
            }
            return target[prop];
          }
        });
      }

      try {
        callback.call(node, eventToDispatch);
      } catch (error) {
        console.error('Error in event handler:', error);
      }

      // 处理 once 选项
      if (options.once) {
        node.removeEventListener(event.type, callback, options);
      }
    }
  }

  // 添加子节点（用于事件冒泡）
  appendChild(child) {
    if (child instanceof EventTarget) {
      child.parentNode = this;
      this.children.add(child);
    }
  }

  // 移除子节点
  removeChild(child) {
    if (this.children.has(child)) {
      child.parentNode = null;
      this.children.delete(child);
    }
  }

  // 清理所有监听器
  cleanup() {
    this.listeners.clear();
  }
}

// 使用示例
const parent = new EventTarget();
const child = new EventTarget();
parent.appendChild(child);

// 添加事件监听器
parent.addEventListener('test', e => {
  console.log('Parent capturing', e.eventPhase);
}, { capture: true, priority: 2 });

parent.addEventListener('test', e => {
  console.log('Parent bubbling', e.eventPhase);
}, { priority: 1 });

child.addEventListener('test', e => {
  console.log('Child handling', e.eventPhase);
  // e.stopPropagation(); // 取消注释以停止传播
});

// 创建并分发事件
const event = new Event('test', { bubbles: true, cancelable: true });
child.dispatchEvent(event);

// 使用 passive 监听器
parent.addEventListener('scroll', e => {
  e.preventDefault(); // 这将被忽略，并显示警告
}, { passive: true });

// 使用 once 选项
parent.addEventListener('click', e => {
  console.log('This will only run once');
}, { once: true });

```

这个实现包含了以下特性：
### 1. 完整的事件对象
- 支持标准的事件属性和方法
- 实现了事件阶段（捕获、目标、冒泡）
- 支持 preventDefault 和 stopPropagation
### 2.事件监听器选项
- capture：捕获阶段处理
- once：只执行一次
- passive：承诺不会调用 preventDefault
- priority：处理优先级
### 3.事件传播
- 完整的捕获-目标-冒泡阶段
- 支持事件传播路径
- 支持停止传播
### 4.错误处理和安全性
- 处理函数执行错误捕获
- 类型检查
- 防止重复添加监听器
### 5. 性能和内存管理
- 使用 Map 存储监听器
- 支持清理功能
- 优化的事件处理顺序
### 6. DOM 类似的节点结构
- 支持父子节点关系
- 支持事件冒泡路径