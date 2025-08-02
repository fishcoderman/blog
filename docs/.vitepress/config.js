// .vitepress/config.js

const base = "/blog/";
export default {
  base,
  // 站点级选项
  title: "首页",
  description: "诗酒趁年华",
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
          { text: "Vue", link: "/frontend/vue/" },
          { text: "工程化", link: "/frontend/structure/" },
        ],
      },
      {
        text: "服务端",
        items: [
          { text: "Node", link: "/backend/node/" },
          { text: "Java", link: "/backend/java/" },
          { text: "Docker", link: "/backend/docker/" },
          { text: "Nginx", link: "/backend/nginx/" },
          { text: "SQL", link: "/backend/sql/" },
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
          { text: "js1", link: "/frontend/js/js1" },
          { text: "js2", link: "/frontend/js/js2" },
        ],
      },
      "/frontend/react/": {
        text: "react",
        items: [
          { text: "React的Router实现原理", link: "/frontend/react/React的Router实现原理" },
          { text: "React和Vue渲染流程差异", link: "/frontend/react/React和Vue渲染流程差异" },
        ],
      },
      "/frontend/vue/": {
        text: "vue",
        items: [
          { text: "react的router实现原理", link: "/frontend/react/react的router实现原理" },
          { text: "html1", link: "/frontend/html/html1" },
          { text: "html2", link: "frontend/html/html2" },
        ],
      },
      "/frontend/structure/": {
        text: "工程化",
        items: [
          { text: "webpack模块化打包原理", link: "/frontend/structure/webpack模块化打包原理" },
          { text: "安装arm架构的Node", link: "/frontend/structure/mac安装Node" },
          { text: "移动端主题切换", link: "/frontend/structure/移动端主题切换" },
          { text: "legacy-peer-deps", link: "/frontend/structure/legacy-peer-deps" },
        ],
      },
      "/frontend/algorithm/": {
        text: "算法",
        items: [
          { text: "webpack模块化打包原理", link: "/frontend/structure/webpack模块化打包原理" },
          { text: "安装arm架构的Node", link: "/frontend/structure/mac安装Node" },
          { text: "移动端主题切换", link: "/frontend/structure/移动端主题切换" },
        ],
      },
      "/ai/": {
        text: "AI",
        items: [
          { text: "大模型原理", link: "/ai/大模型原理" },
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
