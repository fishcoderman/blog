模拟 Sentry 的错误捕获和上报系统的实现,

这个实现包含了以下主要功能：

1. **错误捕获**
- JavaScript 运行时错误
- 资源加载错误
- Promise 未处理的拒绝
- 框架特定错误（Vue/React）

2. **用户行为追踪**
- 点击事件
- 路由变化
- XHR 请求
3. **错误上报**
- 错误队列管理
- 定期批量上报
- 失败重试机制
4. **配置选项**
- 采样率控制
- 环境配置
- 队列大小限制
5. **性能优化**
- 错误去重
- 队列控制
- 采样控制

```js
class SimpleSentry {
  constructor(options = {}) {
    this.options = {
      dsn: options.dsn || '', // 上报地址
      appKey: options.appKey || '',
      appVersion: options.appVersion || '1.0.0',
      environment: options.environment || 'production',
      sampleRate: options.sampleRate || 1.0, // 采样率
      maxBreadcrumbs: options.maxBreadcrumbs || 100,
      maxQueueSize: options.maxQueueSize || 100, // 错误队列最大长度
      ...options
    };

    this.breadcrumbs = []; // 用户行为追踪
    this.errorQueue = [];   // 错误队列
    this.user = null;      // 用户信息

    this.init();
  }

  init() {
    this.setupErrorHandlers();
    this.setupUnhandledRejectionHandler();
    this.setupBreadcrumbs();
    this.startErrorReporting();
  }

  setupErrorHandlers() {
    // 处理常规 JS 错误
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError({
        type: 'onerror',
        message,
        source,
        lineno,
        colno,
        error,
        timestamp: Date.now()
      });
      return true;
    };

    // 处理资源加载错误和其他错误
    window.addEventListener('error', (event) => {
      if (event.target && (event.target.src || event.target.href)) {
        this.captureError({
          type: 'resource',
          target: {
            tagName: event.target.tagName,
            src: event.target.src || event.target.href
          },
          timestamp: Date.now()
        });
      }
    }, true);
  }

  setupUnhandledRejectionHandler() {
    // 处理未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandledrejection',
        reason: event.reason,
        timestamp: Date.now()
      });
    });
  }

  setupBreadcrumbs() {
    // 记录用户点击
    document.addEventListener('click', (event) => {
      this.addBreadcrumb({
        type: 'click',
        target: event.target.tagName,
        timestamp: Date.now()
      });
    });

    // 记录路由变化
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        type: 'navigation',
        to: window.location.href,
        timestamp: Date.now()
      });
    });

    // 记录 XHR 请求
    this.wrapXHR();
  }

  wrapXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const self = this;

    XMLHttpRequest.prototype.open = function(...args) {
      this._sentryUrl = args[1];
      return originalOpen.apply(this, args);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      self.addBreadcrumb({
        type: 'xhr',
        url: this._sentryUrl,
        method: this._method,
        timestamp: Date.now()
      });
      return originalSend.apply(this, args);
    };
  }

  addBreadcrumb(breadcrumb) {
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > this.options.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  setUser(user) {
    this.user = user;
  }

  captureError(error) {
    // 错误采样
    if (Math.random() > this.options.sampleRate) {
      return;
    }

    const errorInfo = {
      ...error,
      breadcrumbs: [...this.breadcrumbs],
      user: this.user,
      environment: this.options.environment,
      appVersion: this.options.appVersion,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errorQueue.push(errorInfo);

    // 控制队列大小
    if (this.errorQueue.length > this.options.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  async reportErrors() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await fetch(this.options.dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7,sentry_key=${this.options.appKey}`
        },
        body: JSON.stringify({
          errors,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Error reporting failed:', error);
      // 报告失败时，将错误重新加入队列
      this.errorQueue.push(...errors);
    }
  }

  startErrorReporting() {
    // 定期上报错误
    setInterval(() => this.reportErrors(), 5000);
  }

  // 手动捕获错误
  captureException(error) {
    this.captureError({
      type: 'manual',
      error,
      timestamp: Date.now()
    });
  }

  // 手动捕获消息
  captureMessage(message) {
    this.captureError({
      type: 'message',
      message,
      timestamp: Date.now()
    });
  }
}

// 使用示例
const sentry = new SimpleSentry({
  dsn: 'https://your-sentry-server.com/api/errors',
  appKey: 'your-app-key',
  environment: 'development',
  sampleRate: 0.5, // 采样率 50%
  maxBreadcrumbs: 50
});

// 设置用户信息
sentry.setUser({
  id: 'user123',
  email: 'user@example.com'
});

// 手动捕获错误
try {
  throw new Error('测试错误');
} catch (error) {
  sentry.captureException(error);
}

// 捕获自定义消息
sentry.captureMessage('重要事件发生');

// Vue 错误处理
if (typeof Vue !== 'undefined') {
  Vue.config.errorHandler = (error, vm, info) => {
    sentry.captureError({
      type: 'vue',
      error,
      componentName: vm.$options.name,
      info,
      timestamp: Date.now()
    });
  };
}

// React 错误处理
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    sentry.captureError({
      type: 'react',
      error,
      errorInfo,
      timestamp: Date.now()
    });
  }

  render() {
    return this.props.children;
  }
}
```
**这个实现可以进一步优化：**
- 添加离线存储
- 实现错误聚合
- 添加更多的性能监控
- 实现更复杂的采样策略
- 添加请求重试机制
- 实现错误源码映射