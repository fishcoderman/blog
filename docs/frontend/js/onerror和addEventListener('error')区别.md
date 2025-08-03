# onerror和addEventListener('error')区别
在某些情况下 window.onerror 和 addEventListener('error') 会出现重叠捕获。通过代码示例来说明：

```js
class ErrorCaptureDemo {
  constructor() {
    // 设置错误处理器
    this.setupErrorHandlers();
    
    // 用于记录错误捕获次数
    this.captureCount = {
      onerror: 0,
      addEventListener: 0
    };
  }

  setupErrorHandlers() {
    // 方式1：onerror
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureCount.onerror++;
      console.log('window.onerror 捕获:', {
        count: this.captureCount.onerror,
        message,
        source,
        lineno,
        colno
      });
      return true;
    };

    // 方式2：addEventListener
    window.addEventListener('error', (event) => {
      this.captureCount.addEventListener++;
      console.log('addEventListener 捕获:', {
        count: this.captureCount.addEventListener,
        message: event.message,
        filename: event.filename,
        error: event.error
      });
    }, true);
  }

  // 测试不同类型的错误
  testErrors() {
    // 1. 运行时错误 - 两种方式都会捕获
    console.log('测试运行时错误:');
    try {
      throw new Error('运行时错误');
    } catch (e) {
      // 手动抛出以便观察
      throw e;
    }

    // 2. 资源加载错误 - 只有 addEventListener 会捕获
    console.log('测试资源加载错误:');
    const img = new Image();
    img.src = 'nonexistent.jpg';

    // 3. 语法错误 - 两种方式都可能捕获
    console.log('测试语法错误:');
    setTimeout(() => {
      eval('2 +* 2');
    }, 0);
  }
}

// 使用示例
const demo = new ErrorCaptureDemo();
```
为了避免重复捕获，可以实现一个优化版本：

```js
class OptimizedErrorHandler {
  constructor() {
    this.handledErrors = new Set(); // 用于存储已处理的错误
    this.setupOptimizedHandlers();
  }

  setupOptimizedHandlers() {
    // 使用 WeakMap 存储错误信息，防止内存泄漏
    const errorInfo = new WeakMap();

    // 处理 JavaScript 运行时错误
    window.onerror = (message, source, lineno, colno, error) => {
      if (error && !this.handledErrors.has(error)) {
        this.handledErrors.add(error);
        this.handleJSError({
          type: 'runtime',
          message,
          source,
          lineno,
          colno,
          error
        });
      }
      return true;
    };

    // 处理资源加载错误和其他错误
    window.addEventListener('error', (event) => {
      // 检查是否是资源加载错误
      if (event.target && (event.target.src || event.target.href)) {
        // 资源错误使用 URL 作为唯一标识
        const errorKey = `${event.target.tagName}-${event.target.src || event.target.href}`;
        if (!this.handledErrors.has(errorKey)) {
          this.handledErrors.add(errorKey);
          this.handleResourceError({
            type: 'resource',
            target: event.target,
            url: event.target.src || event.target.href,
            tagName: event.target.tagName
          });
        }
      } 
      // 处理其他类型的错误
      else if (event.error && !this.handledErrors.has(event.error)) {
        this.handledErrors.add(event.error);
        this.handleJSError({
          type: 'other',
          error: event.error,
          message: event.message,
          filename: event.filename
        });
      }
    }, true);
  }

  handleJSError(errorInfo) {
    console.log('处理 JS 错误:', errorInfo);
    this.reportError('js', errorInfo);
  }

  handleResourceError(errorInfo) {
    console.log('处理资源错误:', errorInfo);
    this.reportError('resource', errorInfo);
  }

  reportError(type, info) {
    // 实现错误上报逻辑
    const errorReport = {
      type,
      info,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // 可以添加错误上报逻辑
    console.log('错误报告:', errorReport);
  }

  // 定期清理已处理的错误集合
  cleanupHandledErrors() {
    // 为了防止 Set 无限增长，可以定期清理
    if (this.handledErrors.size > 1000) {
      this.handledErrors.clear();
    }
  }
}

// 使用示例
const handler = new OptimizedErrorHandler();

// 测试各种错误场景
function testErrorScenarios() {
  // 1. 运行时错误
  setTimeout(() => {
    throw new Error('测试运行时错误');
  }, 0);

  // 2. 资源加载错误
  const img = new Image();
  img.src = 'nonexistent.jpg';

  // 3. 语法错误
  setTimeout(() => {
    eval('2 +* 2');
  }, 0);

  // 4. Promise 错误
  Promise.reject(new Error('Promise 错误')).catch(() => {});
}

```

### 关键点说明：
1. 重叠情况：
- JavaScript 运行时错误通常会被两种方式都捕获
- 资源加载错误只会被 addEventListener 捕获
- 语法错误可能会被两种方式都捕获

2. 最佳实践：
- 使用 addEventListener 专门处理资源错误
- 使用 window.onerror 处理 JavaScript 运行时错误
- 实现错误去重机制
- 考虑内存管理
- 添加适当的错误分类和上报逻辑
