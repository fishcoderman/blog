# AbortController

## AbortController 介绍  
**AbortController** 是 JavaScript 内置的 Web API，用于**标准化取消异步操作**，核心包含：  
- **`abort()` 方法**：触发取消信号，终止关联的异步操作。  
- **`signal` 属性**：传递给支持取消的 API（如 `fetch`），监听中断事件。  
- **`aborted` 属性**：标记信号是否已触发取消（布尔值）。  

**关键特性**：  
- 支持**批量取消多个异步操作**（如同时中断多个 `fetch` 请求）。  
- 与 `addEventListener` 结合时，可通过 `signal` 自动清理事件监听器，避免内存泄漏。  

## 实际应用场景  
1. **用户交互场景**  
   - **搜索框输入优化**：用户快速输入时，取消前一次未完成的搜索请求，避免显示过时结果。  
   - **文件上传/下载中断**：用户点击取消按钮时，终止文件传输任务，释放网络资源。  

2. **数据获取与性能优化**  
   - **实时数据更新**：切换页面时取消旧的数据请求（如股票行情、新闻列表），减少无效流量。  
   - **超时控制**：为请求设置超时时间，超时后自动中断（结合 `setTimeout` 和 `abort()`）。  

3. **复杂异步任务管理**  
   - **竞态条件处理**：确保只处理最新请求的响应（如搜索建议、自动补全），丢弃旧请求。  
   - **长轮询/定时任务**：用户离开页面时中断长连接或定时任务（如服务器通知推送）。  

4. **跨 API 兼容场景**  
   - 除 `fetch` 外，还可用于支持 `AbortSignal` 的其他 API（如 `axios`、`WebSocket`、`Node.js http` 模块等）。  

## 示例代码  

### 1. **组件卸载时取消请求**（如 React 中）

防止组件卸载后仍然设置 state：

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });

  return () => {
    controller.abort(); // 组件卸载时中止请求
  };
}, []);
```

### 2. **搜索输入防抖 + 请求取消**

比如用户快速输入时，只保留最后一次请求，前面的全部取消：

```js
let controller = null;

async function handleSearch(query) {
  if (controller) controller.abort(); // 取消上一次请求

  controller = new AbortController();

  try {
    const res = await fetch(`/api/search?q=${query}`, {
      signal: controller.signal
    });
    const data = await res.json();
    console.log('结果', data);
  } catch (err) {
    if (err.name !== 'AbortError') console.error('搜索失败', err);
  }
}
```

### 3. **设置请求超时机制**

原生 `fetch` 没有超时机制，可以结合 `AbortController` 手动实现：

```js
function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(); // 超时取消
  }, timeout);

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

fetchWithTimeout('/api/data', 3000)
  .then(res => res.json())
  .then(console.log)
  .catch(err => {
    if (err.name === 'AbortError') {
      console.error('请求超时');
    } else {
      console.error(err);
    }
  });
```

### 4. **多个异步任务之间取消其他任务**

```js
const controller1 = new AbortController();
const controller2 = new AbortController();

// 开始两个请求
fetch('/api/a', { signal: controller1.signal });
fetch('/api/b', { signal: controller2.signal });

// 你可以根据某个条件取消其中一个
controller1.abort(); // 取消第一个请求
```

## 支持 `AbortSignal` 的操作

除了 `fetch`，越来越多的 API 开始支持 `AbortSignal`，如：

* `ReadableStream`
* `WritableStream`
* `WebSocket`（未来可能）
* 第三方库（如 Axios 支持转换为 signal）

## 注意事项

* `fetch` 被中止时，返回一个 `AbortError` 类型错误。
* `abort()` 调用后，所有使用该 `signal` 的操作都会被中止。
* `AbortSignal` 是不可复用的，调用一次 `abort()` 后就不能再次使用。
