// .vitepress/config.js

const base = "/blog/";
export default {
  base,
  lastUpdated: true,
  // 站点级选项
  title: "首页",
  description: "诗酒趁年华",
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    ["link", { rel: "icon", href: `${base}favicon.ico` }],
    ['link', { rel: 'stylesheet', href: `${base}custom.css` }]
  ],
  themeConfig: {
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    nav: [
      {
        text: "前端",
        items: [
          { text: "react", link: "/frontend/react/" },
          { text: "vue", link: "/frontend/vue/" },
          { text: "js", link: "/frontend/js/" },
          { text: "工程化", link: "/frontend/structure/" },
        ],
      },
      {
        text: "服务端",
        items: [
          { text: "html", link: "/backend/html/" },
          { text: "css", link: "/backend/css/" },
          { text: "js", link: "/backend/js/" },
        ],
      },
      {
        text: "生活",
        items: [
          { text: "html", link: "/frontend/html/" },
          { text: "css", link: "/frontend/css/" },
          { text: "js", link: "/frontend/js/" },
        ],
      },
      { text: "关于", link: "/about" },
    ],
    sidebar: {
      "/frontend/react/": {
        text: "react",
        items: [
          { text: "html", link: "/frontend/html/" },
          { text: "html1", link: "/frontend/html/html1" },
          { text: "html2", link: "frontend/html/html2" },
        ],
      },
      "/frontend/css/": {
        text: "css",
        items: [
          { text: "css1", link: "/frontend/css/css1" },
          { text: "css2", link: "/frontend/css/css2" },
        ],
      },
      "/frontend/js/": {
        text: "js",
        items: [
          { text: "js1", link: "/frontend/js/js1" },
          { text: "js2", link: "/frontend/js/js2" },
        ],
      },
      "/frontend/structure/": {
        text: "工程化",
        items: [
          { text: "webpack模块化打包原理", link: "/frontend/structure/webpack模块化打包原理" },
          { text: "移动端主题切换", link: "/frontend/structure/移动端主题切换" },
        ],
      },
    },
  },
};
