# react的router实现原理

react的router分为hash 模式 和 history 模式

## hash模式

hash 是 url 中 hash(#) 及后面的部分，常用锚点在页面内做导航，改变 url 中的 hash 部分不会引起页面的刷新
通过 [hashchange](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWindow%2Fhashchange_event) 事件监听 URL 的改变。改变 URL 的方式只有以下几种：通过浏览器导航栏的前进后退、通过 a 标签、通过window.location，这几种方式都会触发hashchange事件

## history模式

history 提供了 pushState 和 replaceState 两个方法，这两个方法改变 URL 的 path 部分不会引起页面刷新
通过 [popchange](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWindow%2Fpopstate_event) 事件监听 URL 的改变。需要注意只在通过浏览器导航栏的前进后退改变 URL 时会触发popstate事件，通过a标签和pushState/replaceState不会触发popstate方法。但我们可以拦截a标签的点击事件和pushState/replaceState的调用来检测 URL 变化，也是可以达到监听 URL 的变化，相对hashchange显得略微复杂

### JS实现前端路由

#### 基于hash实现
BrowserRouter使用 history 库提供的createBrowserHistory创建的history对象改变路由状态和监听路由变化。
- 监听路由变化的listen方法以及对应的清理监听unlisten方法
- 改变路由的push方法

```js
// 页面加载完不会触发 hashchange，这里主动触发一次 hashchange 事件，处理默认hash
window.addEventListener('DOMContentLoaded', onLoad);
// 监听路由变化
window.addEventListener('hashchange', onHashChange);
// 路由变化时，根据路由渲染对应 UI
function onHashChange() {
  switch (location.hash) {
    case '#/home':
      routerView.innerHTML = 'This is Home';
      return;
    case '#/about':
      routerView.innerHTML = 'This is About';
      return;
    case '#/list':
      routerView.innerHTML = 'This is List';
      return;
    default:
      routerView.innerHTML = 'Not Found';
      return;
  }
}

```

### 基于 history 实现

BrowserRouter使用 history 库提供的createBrowserHistory创建的history对象改变路由状态和监听路由变化。

- 监听路由变化的listen方法以及对应的清理监听unlisten方法
- 改变路由的push方法

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Parcel Sandbox</title>
    <meta charset="UTF-8" />
    <script>
      function onClick() {
        window.history.pushState({}, null, '/list');
      }
      // Add this:
      var _wr = function (type) {
        var orig = history[type];
        return function () {
          var e = new Event(type);
          e.arguments = arguments;
          var rv = orig.apply(this, arguments);
          window.dispatchEvent(e);
          return rv;
        };
      };
      history.pushState = _wr('pushState');
    </script>
  </head>

  <body>
    <ul>
      <!-- 定义路由 -->
      <li><a href="/home">home</a></li>
      <li><a href="/about">about</a></li>
      <div onclick="onClick()">点击</div>

      <!-- 渲染路由对应的 UI -->
      <div id="routeView"></div>
    </ul>

    <script>
      var routeView = null;
      function onLoad() {
        routerView = document.querySelector('#routeView');
        onPopState();

        // 拦截 a 标签点击事件默认行为
        // 点击时使用 pushState 修改 URL并更新手动 UI，从而实现点击链接更新 URL 和 UI 的效果。
        var linkList = document.querySelectorAll('a[href]');
        linkList.forEach((el) =>
          el.addEventListener('click', function (e) {
            e.preventDefault();
            history.pushState(null, '', el.getAttribute('href'));
          })
        );
      }
      // Use it like this:
      window.addEventListener('pushState', function (e) {
        console.info('addEventListener-pushState-1');
        onPopState();
      });
      // 页面加载完不会触发 hashchange，这里主动触发一次 hashchange 事件，处理默认hash
      window.addEventListener('DOMContentLoaded', onLoad);
      // 监听路由变化
      window.addEventListener('popstate', () => {
        console.info('addEventListener-popstate-2');
        onPopState();
      });
      // 路由变化时，根据路由渲染对应 UI
      function onPopState() {
        switch (location.pathname) {
          case '/home':
            routerView.innerHTML = 'This is Home';
            return;
          case '/about':
            routerView.innerHTML = 'This is About';
            return;
          case '/list':
            routerView.innerHTML = 'This is List';
            return;
          default:
            routerView.innerHTML = 'Not Found';
            return;
        }
      }
    </script>
  </body>
</html>

```

### History 实现


```js
 /**
 * 创建和管理listeners的方法
 */
export const EventEmitter = () => {
  const events = [];
  return {
    subscribe(fn) {
      events.push(fn);
      return function () {
        events = events.filter(handler => handler !== fn);
      };
    },
    emit(arg) {
      events.forEach(fn => fn && fn(arg));
    },
  };
};

const createBrowserHistory = () => {
  const EventBus = EventEmitter();
  // 初始化location
  let location = {
    pathname: '/',
  };
  /**
   * 路由变化时的回调
   */
  const handlePop = function () {
    const currentLocation = {
      pathname: window.location.pathname,
    };
    EventBus.emit(currentLocation); // 路由变化时执行回调
  };
  /**
   * 定义history.push方法
   */
  const push = path => {
    const { history } = window;
    // 为了保持state栈的一致性
    history.pushState(null, '', path);
    // 由于push并不触发popstate，我们需要手动调用回调函数
    location = { pathname: path };
    EventBus.emit(location);
  };

  const listen = listener => EventBus.subscribe(listener);

  // 处理浏览器的前进后退
  window.addEventListener('popstate', handlePop);

  // 返回history
  const history = {
    location,
    listen,
    push,
  };
  return history;
};

```

[具体文章地址](https://juejin.cn/post/7267879720578285607?searchId=202404031607216E852511A5E7A6807332)