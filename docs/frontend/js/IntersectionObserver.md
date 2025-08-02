```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
      }
      #main {
        width: 200px;
        height: 500px;
        border: 1px solid #ccc;
        overflow: auto;
      }
      .item1 {
        width: 100%;
        height: 100px;
        background-color: purple;
      }
      .item2 {
        width: 100%;
        height: 100px;
        background-color: orange;
        border: 5px solid #ccc;
      }
      .item3 {
        width: 100%;
        height: 500px;
        background-color: #999;
      }
    </style>
  </head>
  <body>
    <div id="main">
      <div class="item1"></div>
      <div id="box" class="item2"></div>
      <div class="item3"></div>
    </div>
    <script>
      // MutationObserver ResizeObserver IntersectionObserver 区别
      const box = document.getElementById('box');
      console.log('offsetHeight', box.offsetHeight);
      console.log('clientHeight', box.clientHeight);
      var io = new IntersectionObserver(
        (entries) => {
          entries.forEach((item) => {
            console.info('item', item);
          });
        },
        {
          root: null,
          threshold: 1, // 阀值设为1，当只有比例达到1时才触发回调函数
        }
      );
      io.observe(box);
    </script>
  </body>
</html>


```