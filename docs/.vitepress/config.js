// .vitepress/config.js

const base = "/blog/";
export default {
  base,
  // 站点级选项
  title: "首页",
  description: "诗酒趁年华",
  // 忽略死链接检查，避免构建失败
  ignoreDeadLinks: true,
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    ["link", { rel: "icon", href: `${base}favicon.ico` }],
    ['link', { rel: 'stylesheet', href: `${base}custom.css` }]
  ],
  footer: {
    message: "Released under the MIT License.",
    copyright: "Copyright ©fishcoderman",
  },
  themeConfig: {
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/fishcoderman'}
    ],
    search: {
      provider: "local",
    },
    nav: [
      {
        text: "前端",
        items: [
          { text: "JS", link: "/frontend/js/" },
          { text: "React", link: "/frontend/react/" },
          { text: "Vue", link: "https://segmentfault.com/u/chinamasters/articles" },
          { text: "工程化", link: "/frontend/structure/" },
          { text: "Flutter", link: "/frontend/flutter/" },
        ],
      },
      {
        text: "服务端",
        items: [
          { text: "Node", link: "/backend/node/" },
          { text: "Java", link: "/backend/java/" },
          { text: "Docker", link: "/backend/docker/" },
        ],
      },
      {
        text: "AI",
        link: "/ai"
      },
      {
        text: "生活",
        link: "/life"
      },
    ],
    sidebar: {
      "/frontend/js/": {
        text: "js",
        items: [
          {text: "Web性能优化",  link: "/frontend/js/Web性能优化概览" },
          { text: "事件循环", link: "/frontend/js/事件循环" },
          { text: "http缓存和cdn缓存", link: "/frontend/js/http缓存和cdn缓存" },
          { text: "手写Promise", link: "/frontend/js/手写Promise" },
          { text: "监控SDK设计", link: "/frontend/js/监控SDK设计" },
          { text: "常见错误拦截", link: "/frontend/js/常见错误拦截" },
          { text: "js类型转化", link: "/frontend/js/js类型转化" },
          { text: "正则语法和案例", link: "/frontend/js/正则语法和案例" },
          { text: 'AbortController', link: '/frontend/js/AbortController'},
          { text: "滚动吸顶的四种方式", link: "/frontend/js/滚动吸顶的四种方式" },
          { text: "事件循环实际案例", link: "/frontend/js/事件循环实际案例" },
          { text: "虚拟滚动", link: "/frontend/js/虚拟滚动" },
          { text: "DocumentFragment", link: "/frontend/js/DocumentFragment" },
          { text: "5个常见Observer", link: "/frontend/js/5个常见Observer" },
          { text: "Web Component", link: "/frontend/js/Web Component" },
          { text: "getBoundingClientRec详解", link: "/frontend/js/getBoundingClientRec详解" },
          { text: "js二叉树前序、中序、后序遍历", link: "/frontend/js/js二叉树前序、中序、后序遍历" },
          { text: "js树搜索及列表转数结构", link: "/frontend/js/js树搜索及列表转数结构" },
          { text: "js计算SHA-256", link: "/frontend/js/js计算SHA-256" },
          { text: "trycatch", link: "/frontend/js/trycatch" },
          { text: "tsconfig配置输出", link: "/frontend/js/tsconfig配置输出" },
          { text: "tsconfig.json编译选项", link: "/frontend/js/tsconfig.json编译选项" },
          { text: "onerror和addEventListener('error')区别", link: "/frontend/js/onerror和addEventListener('error')区别" },
          { text: "发布订阅addEventListener", link: "/frontend/js/发布订阅addEventListener" },
          { text: "如何监听路由变化", link: "/frontend/js/如何监听路由变化" },
          { text: "ES6到ESNext各年度的新增语法特性", link: "/frontend/js/ES6到ESNext各年度的新增语法特性" },
          { text: "自定义模板引擎", link: "/frontend/js/自定义模板引擎" },
        ],
      },
      "/frontend/react/": {
        text: "react",
        items: [
        { text: "React渲染更新流程概览", link: "/frontend/react/React渲染更新流程概览" },
          { text: "React和Vue渲染流程差异", link: "/frontend/react/React和Vue渲染流程差异" },
          { text: "React的Router实现原理", link: "/frontend/react/React的Router实现原理" },
          { text: "React同步和异步渲染", link: "/frontend/react/React同步和异步渲染" },
          { text: "React错误捕获", link: "/frontend/react/React错误捕获" },
          { text: "React事件池", link: "/frontend/react/React事件池" },
          { text: "React源码中flags按位运算", link: "/frontend/react/React源码中flags按位运算" },
          { text: "React点击指定dom以外的位置", link: "/frontend/react/React点击指定dom以外的位置" },
        ],
      },
      "/frontend/vue/": {
        text: "vue",
        items: [],
      },
      "/frontend/structure/": {
        text: "工程化",
        items: [
          { text: "手写qiankun", link: "/frontend/structure/手写qiankun" },
          { text: "Babel配置最佳实践", link: "/frontend/structure/Babel配置最佳实践" },
          { text: "组件库搭建指南", link: "/frontend/structure/组件库搭建指南" },
          { text: "webpack模块化打包原理", link: "/frontend/structure/webpack模块化打包原理" },
          { text: "安装arm架构的Node", link: "/frontend/structure/mac安装Node" },
          { text: "移动端主题切换", link: "/frontend/structure/移动端主题切换" },
          { text: "legacy-peer-deps", link: "/frontend/structure/legacy-peer-deps" },
          { text: "Webpack的watch模式和HMR的区别", link: "/frontend/structure/Webpack的watch模式和HMR的区别" },
          { text: "qiankun中三种沙箱的差异", link: "/frontend/structure/qiankun中三种沙箱的差异" },
          { text: "qiankun的CSS样式隔离", link: "/frontend/structure/qiankun的CSS样式隔离" },
          { text: "前端并发请求控制", link: "/frontend/structure/前端并发请求控制" },
          { text: "如何真机调试", link: "/frontend/structure/如何真机调试" },
          { text: "webpack的runtimeChunk含义及其使用", link: "/frontend/structure/webpack的runtimeChunk含义及其使用" },
          { text: "webpack_public_path动态设置", link: "/frontend/structure/webpack_public_path动态设置" },
          { text: "文件迁移保留git记录", link: "/frontend/structure/文件迁移保留git记录" },
          { text: "Mermaid语法", link: "/frontend/structure/Mermaid语法" },
          { text: 'Github Pages搭建博客', link: '/frontend/structure/Github Pages搭建博客' },
          { text: "npm包依赖关系", link: "/frontend/structure/npm包依赖关系" },
        ],
      },
      "/frontend/flutter/": {
        text: "Flutter",
        items: [
          { text: "Flutter的渲染原理", link: "/frontend/flutter/Flutter的渲染原理" },
          { text: "flutter和web开发的差别", link: "/frontend/flutter/flutter和web开发的差别" },
          { text: "JavaScript与原生WebView通信原理", link: "/frontend/flutter/JavaScript与原生WebView通信原理" },
          { text: "WebView与JavaScript如何互相通信", link: "/frontend/flutter/WebView与JavaScript如何互相通信" }
        ],
      },
      "/backend/node/": {
        text: "Node.js",
        items: [
          { text: "WebHook", link: "/backend/node/WebHook" },
          { text: "Codemod自动化代码转换", link: "/backend/node/Codemod自动化代码转换" },
          { text: "Node专属于ESM的语法", link: "/backend/node/Node专属于ESM的语法" },
          { text: "Node的Native Addons", link: "/backend/node/Node的Native Addons" },
          { text: "Mac最新Nvm安装教程", link: "/backend/node/Mac最新Nvm安装教程" },
          { text: "Node和Rust交互", link: "/backend/node/Node和Rust交互" },
          { text: "Node子进程和子线程", link: "/backend/node/Node子进程和子线程" },
        ],
      },
      "/backend/java/": {
        text: "Java",
        items: [
          { text: "SpringBoot结合Axios实现请求", link: "/backend/java/SpringBoot结合Axios实现请求" },
          { text: "chmod 权限设置", link: "/backend/java/chmod" },
          { text: "中间件", link: "/backend/java/中间件" },
        ],
      },
      "/backend/docker/": {
        text: "Docker & Linux",
        items: [
          { text: "Docker创建MySQL容器", link: "/backend/docker/Docker创建MySQL容器" },
          { text: "Nginx设置请求和响应头", link: "/backend/docker/Nginx设置请求和响应头" },
          { text: "Linux常见命令行操作", link: "/backend/docker/Linux常见命令行操作" },
          { text: "Docker常见命令", link: "/backend/docker/Docker常见命令" },
        ],
      },
      "/ai/": {
        text: "AI",
        items: [
          { text: "DeepSeek构建本地知识库", link: "/ai/DeepSeek构建本地知识库" },
          { text: "大模型原理", link: "/ai/大模型原理" },
          { text: "LangChain工作流", link: "/ai/LangChain工作流" },
          { text: "LangChain接入MCP实现流程", link: "/ai/LangChain接入MCP完整实现流程" },
          { text: "LangChain实现本地知识库问答", link: "/ai/LangChain实现本地知识库问答" },
          { text: "LangGraph", link: "/ai/LangGraph" },
          { text: "Dify私有化部署", link: "/ai/Dify私有化部署" },
        ],
      },
      "/life/": {
        text: "生活",
        items: [
          { text: "人身保险科普", link: "/life/人身保险科普" },
        ],
      },
    },
  },
  outline: {
    label: '页面导航'
  },
  langMenuLabel: '多语言',
  returnToTopLabel: '回到顶部',
  sidebarMenuLabel: '菜单',
  darkModeSwitchLabel: '主题',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式'
};
