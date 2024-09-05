# webpack 模块化打包原理

在使用 webpack 的过程中，你是否好奇 webpack 打包的代码为什么可以直接在浏览器中跑？为什么 webpack 可以支持 CommonJS 、UMD 、ES6 Module 等语法。以及 Webpack 中懒加载的原理是什么？

## 前置准备

webpack 不同版本模块化打包的代码都不一样，但是核心原理都一样。为了防止出现我可以，你不可以的情况，我们先统一配置 webpack 版本：

```
{
  "name": "practice",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "npx webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^5.91.0",
    "webpack-cli": "^5.1.4"
  }
}
```

项目目录结构

```
├── node_modules
├── package-lock.json
├── package.json
├── src
│   ├── deep.js
│   ├── index.js
│   ├── job.js
│   ├── play.js
│   └── run.js
├── webpack.config.js
```

其中 src 底下各个文件的代码：

```
// index.s
import { run } from "./run.js"
import play from "./play.js"
const deep = require('./deep.js')

console.info('run---', run())
console.info('play---', play())
console.log("deep---", deep);

// run.js 为export导出
export const run = () => "this is run";

// play.js 为 export default 导出
export default () => {
  return "this is play"
};

// deep.js 为CommonJS 的 module.exports 导出
const deep = "this is deep";
module.exports = deep;
webpack.config.js 的代码为：
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'entry.js',
    clean: true
  },
  mode: "development"
};
```

## 模块化分析

执行 npx webpack 打包得到的 dist 目录 底下的 enty.js 为：

```
// 该文件为删除注释等，精简之后的结果
(() => { // webpackBootstrap
  var __webpack_modules__ = ({
    "./src/deep.js":
      ((module) => {
        eval("const deep = \"this is deep\";\n\nmodule.exports = deep;\n\n//# sourceURL=webpack://practice/./src/deep.js?");
      }),
    "./src/index.js":
      ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
        "use strict";
        // eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _run_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./run.js */ \"./src/run.js\");\n/* harmony import */ var _play_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./play.js */ \"./src/play.js\");\n\n\nconst deep = __webpack_require__(/*! ./deep.js */ \"./src/deep.js\")\n\nconsole.info('run---', (0,_run_js__WEBPACK_IMPORTED_MODULE_0__.run)())\nconsole.info('play---', (0,_play_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"])())\nconsole.log(\"deep---\", deep);\n\n\n\n//# sourceURL=webpack://practice/./src/index.js?");
        __webpack_require__.r(__webpack_exports__);
        var _run_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/run.js");
        var _play_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/play.js");
        const deep = __webpack_require__("./src/deep.js");
        console.info('run---', (0, _run_js__WEBPACK_IMPORTED_MODULE_0__.run)());
        console.info('play---', (0, _play_js__WEBPACK_IMPORTED_MODULE_1__["default"])());
        console.log("deep---", deep);
        console.log("__webpack_module_cache__", __webpack_module_cache__);
        //# sourceURL=webpack://practice/./src/index.js?
      }),
    "./src/play.js":
      ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
        "use strict";
        // eval("__webpack_require__.r(__webpack_exports__);\n __webpack_require__.d(__webpack_exports__, {\n   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (() => {\n  return \"this is play\"\n});\n\n//# sourceURL=webpack://practice/./src/play.js?");
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, {
          "default": () => (__WEBPACK_DEFAULT_EXPORT__)
        });
      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (() => {
          return "this is play"
        });
        //# sourceURL=webpack://practice/./src/play.js?
      }),
    "./src/run.js":
      ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
        "use strict";
        //  eval("__webpack_require__.r(__webpack_exports__);\n __webpack_require__.d(__webpack_exports__, {\n   run: () => (/* binding */ run)\n });\nconst run = () => \"this is run\";\n\n//# sourceURL=webpack://practice/./src/run.js?");
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, {
          run: () => (/* binding */ run)
        });
        const run = () => "this is run";
        //# sourceURL=webpack://practice/./src/run.js?
      })
  });
  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // Create a new module (and put it into the cache)
    var module = __webpack_module_cache__[moduleId] = {
      // no module.id needed
      // no module.loaded needed
      exports: {}
    };
    // Execute the module function
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    // Return the exports of the module
    return module.exports;
  }

  /************************************************************************/
  /* webpack/runtime/define property getters */
  (() => {
    // define getter functions for harmony exports
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      }
    };
  })();

  /* webpack/runtime/hasOwnProperty shorthand */
  (() => {
    __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
  })();

  /* webpack/runtime/make namespace object */
  (() => {
    // define __esModule on exports
    __webpack_require__.r = (exports) => {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  })();
  // 代码入口
  var __webpack_exports__ = __webpack_require__("./src/index.js");
})();
```

以上代码中，webpack 通过**webpack_require** 函数模拟了模块的加载，把定义的模块内容通过 Object.defineProperty 挂载到 module.exports 上。同时**webpack_module_cache**缓存了所有的模块代码，二次加载的时候直接从缓存中获取，所以模块中的代码即使被引入多次，也只会执行第一次。通过打印**webpack_module_cache**可以得到如下的伪代码：

```
// console.log("__webpack_module_cache__", __webpack_module_cache__);
 {
     "./src/index.js":{"exports":  {}}, //
     "./src/run.js":{exports: { run: () => "this is run" }}, // export
     "./src/play.js":{exports:{ default: () => { return "this is play" } }}, // export default
     "./src/deep.js":{exports: "this is deep"} // CommonJS
 }
```

其中 export default 的时候会手动添加一个 default 属性，export 返回对应的属性，CommonJS 直接返回结果。

## Import 懒加载

更改 index.js 为：

```
function component() {
  const btn = document.createElement('button');
  btn.onclick = () => {
    import('./play.js').then((res) => {
      console.log('动态加载paly.js..', res);
    });
  };
  btn.innerHTML = 'Button';
  return btn;
}
document.body.appendChild(component());
```

执行 npx webpack 打包得到的 dist ，目录为：

```
├── dist
│   ├── entry.js
│   └── src_play_js.entry.js
```

其中 src_play_js.entry.js 为 ：

```
(self["webpackChunkpractice"] = self["webpackChunkpractice"] || []).push([["src_play_js"],{

/***/ "./src/play.js":
/*!*********************!*\
  !*** ./src/play.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (() => {\n  return \"this is play\"\n});\n\n//# sourceURL=webpack://practice/./src/play.js?");

/***/ })

}]);
```

self["webpackChunkpractice"] 是 webpack 全局注入的一个对象，在调用 push 方法的时候,entry.js 为：

```
(() => { // webpackBootstrap
  var __webpack_modules__ = ({
/***/ "./src/index.js":
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
        // eval("function component() {\n  const btn = document.createElement('button');\n  btn.onclick = () => {\n    __webpack_require__.e(/*! import() */ \"src_play_js\").then(__webpack_require__.bind(__webpack_require__, /*! ./play.js */ \"./src/play.js\")).then((res) => {\n      console.log('动态加载paly.js..', res);\n    });\n  };\n  btn.innerHTML = 'Button';\n\n  return btn;\n}\ndocument.body.appendChild(component());\n\n\n\n//# sourceURL=webpack://practice/./src/index.js?");
        function component() {
          const btn = document.createElement('button');
          btn.onclick = () => {
            __webpack_require__.e("src_play_js")
              .then(__webpack_require__.bind(__webpack_require__, "./src/play.js"))
              .then((res) => { console.log('动态加载paly.js..', res) });
          };
          btn.innerHTML = 'Button';
          return btn;
        }
        document.body.appendChild(component());
        //# sourceURL=webpack://practice/./src/index.js?
        /***/
      })
  });
  /************************************************************************/
  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // Create a new module (and put it into the cache)
    var module = __webpack_module_cache__[moduleId] = {
      // no module.id needed
      // no module.loaded needed
      exports: {}
    };

    // Execute the module function
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    // Return the exports of the module
    return module.exports;
  }

  // expose the modules object (__webpack_modules__)
  __webpack_require__.m = __webpack_modules__;

  /************************************************************************/
  /* webpack/runtime/define property getters */
  (() => {
    // define getter functions for harmony exports
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      }
    };
  })();

  /* webpack/runtime/ensure chunk */
  (() => {
    __webpack_require__.f = {};
    // This file contains only the entry chunk.
    // The chunk loading function for additional chunks
    __webpack_require__.e = (chunkId) => {
      return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
        __webpack_require__.f[key](chunkId, promises);
        return promises;
      }, []));
    };
  })();

  /* webpack/runtime/get javascript chunk filename */
  (() => {
    // This function allow to reference async chunks
    __webpack_require__.u = (chunkId) => {
      // return url for filenames based on template
      return "" + chunkId + ".entry.js";
    };
  })();

  /* webpack/runtime/global */
  (() => {
    __webpack_require__.g = (function () {
      if (typeof globalThis === 'object') return globalThis;
      try {
        return this || new Function('return this')();
      } catch (e) {
        if (typeof window === 'object') return window;
      }
    })();
  })();

  /* webpack/runtime/hasOwnProperty shorthand */
  (() => {
    __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
  })();

  /* webpack/runtime/load script */
  (() => {
    var inProgress = {};
    var dataWebpackPrefix = "practice:";
    // loadScript function to load a script via script tag
    __webpack_require__.l = (url, done, key, chunkId) => {
      if (inProgress[url]) { inProgress[url].push(done); return; }
      var script, needAttach;
      if (key !== undefined) {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
          var s = scripts[i];
          if (s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
        }
      }
      if (!script) {
        needAttach = true;
        script = document.createElement('script');

        script.charset = 'utf-8';
        script.timeout = 120;
        if (__webpack_require__.nc) {
          script.setAttribute("nonce", __webpack_require__.nc);
        }
        script.setAttribute("data-webpack", dataWebpackPrefix + key);

        script.src = url;
      }
      inProgress[url] = [done];
      var onScriptComplete = (prev, event) => {
        // avoid mem leaks in IE.
        script.onerror = script.onload = null;
        clearTimeout(timeout);
        var doneFns = inProgress[url];
        delete inProgress[url];
        script.parentNode && script.parentNode.removeChild(script);
        doneFns && doneFns.forEach((fn) => (fn(event)));
        if (prev) return prev(event);
      }
      // 加载超过12s，处理超时逻辑
      var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
      script.onerror = onScriptComplete.bind(null, script.onerror);
      script.onload = onScriptComplete.bind(null, script.onload);
      needAttach && document.head.appendChild(script);
    };
  })();

  /* webpack/runtime/make namespace object */
  (() => {
    // define __esModule on exports
    __webpack_require__.r = (exports) => {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  })();

  /* webpack/runtime/publicPath */
  (() => {
    var scriptUrl;
    if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
    var document = __webpack_require__.g.document;
    if (!scriptUrl && document) {
      if (document.currentScript)
        scriptUrl = document.currentScript.src;
      if (!scriptUrl) {
        var scripts = document.getElementsByTagName("script");
        if (scripts.length) {
          var i = scripts.length - 1;
          while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
        }
      }
    }
    // When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
    // or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
    if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
    scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
    __webpack_require__.p = scriptUrl;
  })();

  /* webpack/runtime/jsonp chunk loading */
  (() => {
    // no baseURI

    // object to store loaded and loading chunks
    // undefined = chunk not loaded, null = chunk preloaded/prefetched
    // [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
    var installedChunks = {
      "main": 0
    };

    __webpack_require__.f.j = (chunkId, promises) => {
      // JSONP chunk loading for javascript
      var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
      if (installedChunkData !== 0) { // 0 means "already installed".
        // a Promise means "currently loading".
        if (installedChunkData) {
          promises.push(installedChunkData[2]);
        } else {
          if (true) { // all chunks have JS
            // setup Promise in chunk cache
            var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
            promises.push(installedChunkData[2] = promise);

            // 也可以这么写
            // const { promise, resolve, reject } = Promise.withResolvers();
            // promises.push(promise);
            // installedChunkData = [resolve, reject, promise];

            // start chunk loading
            var url = __webpack_require__.p + __webpack_require__.u(chunkId);
            // create error before stack unwound to get useful stacktrace later
            var error = new Error();
            var loadingEnded = (event) => {
              if (__webpack_require__.o(installedChunks, chunkId)) {
                installedChunkData = installedChunks[chunkId];
                if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
                if (installedChunkData) { // installedChunkData 不为空，说明数据没有加载成功，处理报错逻辑
                  var errorType = event && (event.type === 'load' ? 'missing' : event.type);
                  var realSrc = event && event.target && event.target.src;
                  error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
                  error.name = 'ChunkLoadError';
                  error.type = errorType;
                  error.request = realSrc;
                  installedChunkData[1](error);
                }
              }
            };
            __webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
          }
        }
      }
    };

    // install a JSONP callback for chunk loading
    var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
      var [chunkIds, moreModules, runtime] = data;
      // add "moreModules" to the modules object,
      // then flag all "chunkIds" as loaded and fire callback
      var moduleId, chunkId, i = 0;
      if (chunkIds.some((id) => (installedChunks[id] !== 0))) {
        for (moduleId in moreModules) {
          if (__webpack_require__.o(moreModules, moduleId)) {
            // 将加载的代码挂载到 __webpack_modules__
            __webpack_require__.m[moduleId] = moreModules[moduleId];
          }
        }
        if (runtime) var result = runtime(__webpack_require__);
      }
      debugger
      if (parentChunkLoadingFunction) {
        parentChunkLoadingFunction(data);
      };
      for (; i < chunkIds.length; i++) {
        chunkId = chunkIds[i];
        if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
          // 执行 resolve
          installedChunks[chunkId][0]();
        }
        // 置空
        installedChunks[chunkId] = 0;
      }
    }

    var chunkLoadingGlobal = self["webpackChunkpractice"] = self["webpackChunkpractice"] || [];
    chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
    // 注意这个chunkLoadingGlobal的push的区别
    chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
  })();

  /************************************************************************/

  // startup
  // Load entry module and return exports
  // This entry module can't be inlined because the eval devtool is used.
  var __webpack_exports__ = __webpack_require__("./src/index.js");

})()
  ;
```

从上面源码可以知道，webpack 实现模块的异步加载有点像 jsonp 的流程。在主 js 文件中通过在 head 中构建 script 标签方式，异步加载模块信息，过程中调用 self["webpackChunkpractice"]的 push 方法，调用了回调函数 webpackJsonpCallback，把异步的模块的源码同步到主文件中，所以后续操作异步模块可以像同步模块一样。
源码具体实现流程：

1. 遇到异步模块时，使用 webpack_require.e 函数去把异步代码加载进来。该函数会在 html 的 head 中动态增加 script 标签，src 指向指定的异步模块存放的文件。
2. 加载的异步模块文件会执行 webpackJsonpCallback 函数，把异步模块加载到主文件中。
3. 所以后续可以像同步模块一样,直接使用 webpack_require("./src/async.js")加载异步模块。
   注意源码中的 promise 使用非常精妙，主模块加载完成异步模块才 resolve();
   总结
4. webpack 对于 ES 模块/CommonJS 模块的实现，是基于自己实现的 webpack_require，所以代码能跑在浏览器中。
5. 从 webpack2 开始，已经内置了对 ES6、CommonJS、AMD 模块化语句的支持。但不包括新的 ES6 语法转为 ES5 代码，这部分工作还是留给了 babel 及其插件。
6. 在 webpack 中可以同时使用 ES6 模块和 CommonJS 模块。因为 module.exports 很像 export default，所以 ES6 模块可以很方便兼容 CommonJS：import XXX from 'commonjs-module'。反过来 CommonJS 兼容 ES6 模块，需要额外加上 default：require('es-module').default。
7. webpack 异步加载模块实现流程跟 jsonp 基本一致。
