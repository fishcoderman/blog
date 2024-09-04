---
layout: home

hero:
  name: 郑涛的博客
  text: 技术和生活随笔
  tagline: 休对故人思故国，且将新火试新茶，诗酒趁年华。
  image:
    src: /logo.jpg
    alt: logo
  actions:
    - theme: brand
      text: Get Started
      link: /bigFrontEnd/html/
    - theme: alt
      text: View on GitHub
      link: https://fishcoderman.github.io/blog/
---

## Getting Started

You can get started using VitePress!

```sh
git clone https://fishcoderman.github.io/blog/
pnpm i
pnpm run dev

```

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

 --vp-home-hero-text-color: transparent;
  --vp-home-hero-text-font-size: 24px;

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
