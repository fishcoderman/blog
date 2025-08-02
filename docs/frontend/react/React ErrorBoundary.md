# React ErrorBoundary

::: tip
Error Boundary是React中的错误边界组件，用于捕获并处理React组件树中的JavaScript错误。它提供了一种优雅的错误处理机制，避免整个应用因为单个组件的错误而崩溃。
:::

## Error Boundary的错误捕获范围

### ✅ 可以捕获的错误

1. **子组件渲染过程中的错误**
2. **生命周期方法中的错误**
3. **构造函数中的错误**
4. **React组件树中任何位置的JavaScript错误**

### ❌ 不能捕获的错误

#### 1. 事件处理器中的错误

```javascript
// 这种错误无法被 ErrorBoundary 捕获
onClick={() => {
  throw new Error('Click Error');
}}
```

#### 2. 异步代码错误

```javascript
// Promise、setTimeout、requestAnimationFrame 等异步操作中的错误
setTimeout(() => {
  throw new Error('Async Error');
}, 1000);
```

#### 3. 其他无法捕获的错误类型

- 服务端渲染错误
- Error Boundary自身内部的错误

## 基本使用示例

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 可以将错误日志上报给服务器
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// 使用方式
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## 函数组件中的Error Boundary

由于Error Boundary必须是class组件，在函数组件中可以使用第三方库或自定义Hook：

```javascript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function MyApp() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => window.location.reload()}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## 注意事项

1. **Error Boundary必须是class组件**
2. **需要实现getDerivedStateFromError或componentDidCatch至少一个方法**
3. **建议在较高层级组件中使用Error Boundary**
4. **对于不能捕获的错误，需要使用try-catch或其他错误处理机制**

## 其他错误处理方式

对于ErrorBoundary无法捕获的错误，通常需要使用其他错误处理方式：

### 事件处理器错误

```javascript
const handleClick = () => {
  try {
    // 可能出错的代码
    riskyOperation();
  } catch (error) {
    // 错误处理
    console.error('Event handler error:', error);
  }
};
```

### 异步错误处理

```javascript
// Promise错误处理
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// 或者使用 .catch()
fetch('/api/data')
  .then(response => response.json())
  .catch(error => console.error('Fetch error:', error));
```

### 全局错误处理

```javascript
// 捕获未处理的Promise rejection
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});

// 捕获全局JavaScript错误
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', error);
};
```

## 最佳实践

### 1. 分层错误边界

```javascript
// 应用级错误边界
<AppErrorBoundary>
  <Router>
    <Routes>
      <Route path="/dashboard" element={
        // 页面级错误边界
        <PageErrorBoundary>
          <Dashboard />
        </PageErrorBoundary>
      } />
    </Routes>
  </Router>
</AppErrorBoundary>
```

### 2. 错误信息收集

```javascript
componentDidCatch(error, errorInfo) {
  // 发送错误信息到监控服务
  errorReportingService.captureException(error, {
    extra: errorInfo,
    tags: {
      component: 'ErrorBoundary',
      section: this.props.section || 'unknown'
    }
  });
}
```

### 3. 用户友好的错误UI

```javascript
render() {
  if (this.state.hasError) {
    return (
      <div className="error-boundary">
        <h2>Oops! Something went wrong</h2>
        <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    );
  }
  return this.props.children;
}
```

## 建议的错误处理策略

- **在应用的顶层使用ErrorBoundary捕获渲染错误**
- **在关键的功能模块外层添加ErrorBoundary**
- **对于异步操作和事件处理，使用try/catch进行错误处理**
- **实现全局的错误监控机制**
- **为用户提供友好的错误反馈和恢复选项**

通过合理使用ErrorBoundary和其他错误处理机制，可以大大提升React应用的稳定性和用户体验！

---

*原文来源：[GitHub Issue #68](https://github.com/fishcoderman/fishcoderman.github.io/issues/68)*
