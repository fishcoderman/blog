# 监控SDK设计

```js
class ErrorMonitor {
  constructor(options = {}) {
    this.options = {
      // 应用标识
      appId: 'default',
      // 上报接口
      reportUrl: '/api/error/report',
      // 是否启用UI崩溃检测
      enableUICrash: true,
      // 采样率 0-1
      sampleRate: 1,
      // 错误去重时间窗口（毫秒）
      dedupeInterval: 10000,
      // 检测的内容元素
      contentEl: document.body,
      ...options,
    };

    this.errorQueue = [];
    this.errorMap = new Map(); // 用于错误去重
    this.timer = null;

    this.init();
  }

  init() {
    // 检查环境
    if (typeof window === 'undefined') {
      console.warn('ErrorMonitor: 当前环境不支持浏览器API，监控功能将不可用');
      return;
    }
    
    this.setupJSErrorMonitor();
    this.setupPromiseErrorMonitor();
    this.setupResourceErrorMonitor();
    this.setupXHRMonitor();
    this.setupFetchMonitor();
    this.setupUserBehaviorTracker();
    this.setupPerformanceMonitor();
    this.setupNetworkMonitor();

    if (this.options.enableUICrash) {
      this.setupUICrashMonitor();
    }

    // 页面卸载前发送所有错误
    window.addEventListener('beforeunload', () => {
      this.sendErrors(true);
    });
  }

  // JS错误监控
  setupJSErrorMonitor() {
    window.onerror = (msg, url, line, column, error) => {
      this.captureError({
        type: 'js_error',
        msg: msg,
        url: url,
        line: line,
        column: column,
        stack: error && error.stack,
      });
      return true;
    };
  }

  // Promise错误监控
  setupPromiseErrorMonitor() {
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'promise_error',
        msg: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : '',
      });
    });
  }

  // 资源加载错误监控
  setupResourceErrorMonitor() {
    window.addEventListener(
      'error',
      (event) => {
        if (event.target && (event.target.src || event.target.href)) {
          this.captureError({
            type: 'resource_error',
            msg: `Failed to load ${event.target.nodeName.toLowerCase()}: ${event.target.src || event.target.href}`,
            url: event.target.src || event.target.href,
            html: event.target.outerHTML,
          });
        }
      },
      true
    );
  }

  // XHR请求监控
  setupXHRMonitor() {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    const self = this;

    XMLHttpRequest.prototype.open = function (...args) {
      this._requestUrl = args[1];
      this._method = args[0];
      this._startTime = Date.now();

      // 在 open 方法中添加错误监听器，确保只添加一次
      if (!this._errorHandlerAdded) {
        this.addEventListener('error', () => {
          self.captureError({
            type: 'xhr_error',
            msg: `XHR Error: ${this._method} ${this._requestUrl}`,
            url: this._requestUrl,
            status: this.status,
            duration: Date.now() - this._startTime,
          });
        });

        this.addEventListener('timeout', () => {
          self.captureError({
            type: 'xhr_timeout',
            msg: `XHR Timeout: ${this._method} ${this._requestUrl}`,
            url: this._requestUrl,
            duration: Date.now() - this._startTime,
          });
        });
        this._errorHandlerAdded = true;
      }
      return originalXHROpen.apply(this, args);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      return originalXHRSend.apply(this, args);
    };
  }

  // Fetch请求监控
  setupFetchMonitor() {
    const originalFetch = window.fetch;
    const self = this;

    window.fetch = function (...args) {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;

      return originalFetch
        .apply(this, args)
        .then((response) => {
          if (!response.ok) {
            self.captureError({
              type: 'fetch_error',
              msg: `Fetch Error: ${response.status} ${response.statusText}`,
              url: url,
              status: response.status,
              duration: Date.now() - startTime,
            });
          }
          return response;
        })
        .catch((error) => {
          self.captureError({
            type: 'fetch_error',
            msg: `Fetch Error: ${error.message}`,
            url: url,
            duration: Date.now() - startTime,
            stack: error.stack,
          });
          throw error;
        });
    };
  }

  // UI崩溃监控（使用取点检测方式）
  setupUICrashMonitor() {
    // 取点检测白屏
    const checkWhiteScreen = () => {
      if (!this.contentEl) return;

      // 基础检测：DOM元素数量
      const childrenCount = this.contentEl.getElementsByTagName('*').length;
      
      // 取点检测是否为白屏
      const isWhiteScreen = this.checkPointsElement();
      
      // 如果DOM元素少于10个或者取点检测判断为白屏
      if (childrenCount < 10 || isWhiteScreen) {
        this.captureError({
          type: 'ui_crash',
          msg: 'UI Crash: Possible white screen detected',
          html: this.contentEl.outerHTML.length > 1000 ? this.contentEl.outerHTML.slice(0, 500) + '...' + this.contentEl.outerHTML.slice(-500) : this.contentEl.outerHTML,
          childrenCount,
          isWhiteScreen,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        });
      }
    };

    // 在页面加载完成后检测
    window.addEventListener('load', () => {
      setTimeout(checkWhiteScreen, 2000);
    });

    // 在路由变化后检测（适用于SPA）
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = function (...args) {
        originalPushState.apply(this, args);
        setTimeout(checkWhiteScreen, 2000);
      };

      window.history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        setTimeout(checkWhiteScreen, 2000);
      };

      window.addEventListener('popstate', () => {
        setTimeout(checkWhiteScreen, 2000);
      });
    }
  }

  // 取点检测元素是否为body（判断白屏）
  checkPointsElement() {
    try {
      // 获取视口尺寸
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 如果视口太小，不进行检测
      if (viewportWidth < 50 || viewportHeight < 50) return false;
      
      // 定义检测点的位置（3x3网格）
      const rows = 3;
      const cols = 3;
      const points = [];
      
      for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
          points.push({
            x: Math.floor(viewportWidth * (i / (rows + 1))),
            y: Math.floor(viewportHeight * (j / (cols + 1)))
          });
        }
      }
      
      // 检测每个点的元素
      let bodyCount = 0;
      const totalPoints = points.length;
      
      for (const point of points) {
        // 获取该点位置的元素
        const elementAtPoint = document.elementFromPoint(point.x, point.y);
        
        // 如果元素是body或html，计数加1
        if (!elementAtPoint || elementAtPoint === document.body || elementAtPoint === document.documentElement) {
          bodyCount++;
        }
      }
      
      // 计算body元素点的比例
      const bodyRatio = bodyCount / totalPoints;
      
      // 如果大部分点都是body元素，判定为白屏
      // 阈值可以根据实际情况调整
      return bodyRatio >= 0.7; // 70%的点为body时判定为白屏
    } catch (error) {
      console.error('白屏检测出错:', error);
      return false;
    }
  }

  // 捕获错误并加入队列
  captureError(error) {
    if (!error || Math.random() > this.options.sampleRate) {
      return; // 采样控制
    }

    const errorInfo = {
      ...error,
      appId: this.options.appId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      // 可以添加更多上下文信息
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      eventId: this.generateUUID(),
    };

    // 错误去重
    const errorKey = `${errorInfo.type}:${errorInfo.msg}`;
    const now = Date.now();
    const lastErrorTime = this.errorMap.get(errorKey);
    
    if (lastErrorTime && now - lastErrorTime < this.options.dedupeInterval) {
      // 在去重时间窗口内，忽略重复错误
      return;
    }
    
    // 更新错误时间
    this.errorMap.set(errorKey, now);
    
    this.errorQueue.push(errorInfo);
    this.sendErrors();
  }

  // 发送错误队列
  sendErrors(immediate = false) {
    if (immediate) {
      if (this.errorQueue.length > 0) {
        this.doSendErrors();
      }
      return;
    }

    // 防抖，避免频繁发送
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.doSendErrors();
    }, 1000);
  }


  // 在ErrorMonitor类中添加
  setupUserBehaviorTracker() {
    const maxBehaviors = 50;
    const behaviors = [];

    // 记录点击事件
    document.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        const behavior = {
          type: 'click',
          time: Date.now(),
          element: target.tagName,
          id: target.id,
          class: target.className,
          text: target.innerText?.substring(0, 50),
          path: this.getElementPath(target),
        };

        behaviors.push(behavior);
        if (behaviors.length > maxBehaviors) {
          behaviors.shift();
        }
      },
      true
    );

    // 在错误上报时附加用户行为
    this.userBehaviors = behaviors;
  }

  // 在ErrorMonitor类中添加
  setupPerformanceMonitor() {
    // 页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        const performance = window.performance;
        if (!performance) return;

        const timing = performance.timing;
        const performanceData = {
          type: 'performance',
          // DNS查询时间
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          // TCP连接时间
          tcp: timing.connectEnd - timing.connectStart,
          // 首字节时间
          ttfb: timing.responseStart - timing.requestStart,
          // DOM解析时间
          domParse: timing.domInteractive - timing.responseEnd,
          // DOM Ready时间
          domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
          // 页面完全加载时间
          load: timing.loadEventEnd - timing.navigationStart,
          // 资源加载时间
          resource: timing.loadEventEnd - timing.domContentLoadedEventEnd,
        };

        // 上报性能数据
        this.captureError(performanceData);

        // 收集资源加载性能
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources
          .filter((item) => item.duration > 1000) // 超过1秒的资源
          .map((item) => ({
            name: item.name,
            duration: item.duration,
            size: item.transferSize,
            type: item.initiatorType,
          }));

        if (slowResources.length > 0) {
          this.captureError({
            type: 'slow_resources',
            resources: slowResources,
          });
        }
      }, 0);
    });
  
    // 添加对 PerformanceObserver 的支持，用于监控长任务
    if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // 超过50ms的任务
            this.captureError({
              type: 'long_task',
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });
          }
        });
      });
      observer.observe({ entryTypes: ['longtask'] });
    }
  }

    
  // 网络状态监控
  setupNetworkMonitor() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const reportNetworkChange = () => {
        this.captureError({
          type: 'network_change',
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          online: navigator.onLine
        });
      };
      
      connection.addEventListener('change', reportNetworkChange);
      
      // 监听在线/离线状态
      window.addEventListener('online', () => {
        this.captureError({
          type: 'network_status',
          status: 'online'
        });
      });
      
      window.addEventListener('offline', () => {
        this.captureError({
          type: 'network_status',
          status: 'offline'
        });
      });
    }
  }

  // 获取元素路径
  getElementPath(element) {
    const path = [];
    let currentElement = element;

    while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
      let selector = currentElement.nodeName.toLowerCase();
      if (currentElement.id) {
        selector += `#${currentElement.id}`;
      } else if (currentElement.className) {
        selector += `.${currentElement.className.split(' ').join('.')}`;
      }
      path.unshift(selector);
      currentElement = currentElement.parentNode;
    }

    return path.join(' > ');
  }

  // 生成唯一ID
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }


  // 实际发送错误的方法
  doSendErrors() {
    if (this.errorQueue.length === 0) return;
    console.log('Received error reports:', this.errorQueue);
    return;
    // 发送错误数据到后端
    // 这里可以使用fetch或XMLHttpReques发送数据
    const errors = [...this.errorQueue];
    this.errorQueue = [];

    // 使用sendBeacon在页面卸载时也能发送数据
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(errors)], { type: 'application/json' });
      navigator.sendBeacon(this.options.reportUrl, blob);
    } else {
      // 降级方案
      fetch(this.options.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errors),
        // 不等待响应
        keepalive: true,
      }).catch(() => {
        // 忽略上报失败
      });
    }
  }

}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorMonitor;
} else if (typeof window !== 'undefined') {
  window.ErrorMonitor = ErrorMonitor;
}


```