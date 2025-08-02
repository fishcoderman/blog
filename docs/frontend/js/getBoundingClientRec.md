```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }
      .app {
        height: 1500px;
        width: 300px;
        /* border: 1px solid #ccc; */
      }
      .box {
        width: 400px;
        height: 200px;
        margin: 100px;
        border: 1px solid #ccc;
      }
      .child {
        width: 200px;
        height: 100px;
        margin: 20px;
        border: 1px solid #ccc;
      }
    </style>
  </head>
  <body>
    <div class="app"></div>
    <div class="box">
      <div class="child">child</div>
    </div>
    <script>
      const childDom = document.querySelector('.child');

      // --- 相对于视口左上角的位置，均是 number ---
      // top: 100     --- 盒子上边框距离视口顶部的距离
      // bottom: 302  --- 盒子底边框距离视口顶部的距离 = top + height
      // left: 394    --- 盒子左边框距离视口左侧的距离
      // right: 796   --- 盒子右边框距离视口左侧的距离 = left + width
      // x: 394       --- 盒子左上角相对于视口左侧的距离
      // y: 100       --- 盒子左上角相对于视口顶部的距离

      // 盒子的宽高
      // width: 402
      // height: 202
      window.addEventListener('scroll', function () {
        console.log(childDom.getBoundingClientRect());
      });
    </script>
  </body>
</html>


```