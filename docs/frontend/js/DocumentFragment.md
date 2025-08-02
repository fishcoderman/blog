```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div id="root" class="root">
      <div class="container">
        <section class="sidebar">
          <ul class="menu">
            menu
          </ul>
        </section>
        <section class="main">
          <article class="post">post</article>
          <p class="copyright">copyright</p>
        </section>
      </div>
    </div>
    <script>
      let node = document.getElementById('root');
      const list = [node];
      while (list.length) {
        const shift = list.shift();
        // shift.children && list.push(...shift.children);
        shift.children.length && list.push.apply(list, shift.children);
        console.info('run', shift.className);
      }
    </script>
  </body>
</html>


```