```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Web Component Fetch Demo</title>
</head>
<body>
  <!-- 使用组件 -->
  <github-user username="fishcoderman"></github-user>

  <!-- 定义模板 -->
  <template id="github-user-template">
    <style>
      .card {
        border: 1px solid #ccc;
        padding: 16px;
        border-radius: 8px;
        max-width: 300px;
        font-family: sans-serif;
      }
      img {
        width: 100px;
        border-radius: 50%;
      }
      button {
        margin-top: 10px;
        padding: 8px 16px;
        background-color: #0366d6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background-color: #0056b3;
      }
    </style>
    <div class="card">
      <img src="" alt="avatar" />
      <h2></h2>
      <p><a href="" target="_blank">GitHub Profile</a></p>
      <p><a class="blog" href="" target="_blank">Blog<a/></p>
      <button id="switch-user">切换用户</button>
    </div>
  </template>

  <script>
    class GitHubUser extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.userList = ['fishcoderman', 'facebook', 'google', 'microsoft', 'apple'];
        this.currentUserIndex = 0;
      }

      connectedCallback() {
        const username = this.getAttribute('username') || 'fishcoderman';
        this.currentUserIndex = this.userList.indexOf(username);
        if (this.currentUserIndex === -1) {
          this.currentUserIndex = 0;
        }
        this.fetchAndRender(username);
      }

      async fetchAndRender(username) {
        this.shadowRoot.innerHTML = `<p>加载中...</p>`;

        try {
          const res = await fetch(`https://api.github.com/users/${username}`);
          if (!res.ok) throw new Error("请求失败");
          const data = await res.json();

          // 使用模板
          const template = document.getElementById('github-user-template');
          const templateContent = template.content.cloneNode(true);

          // 填充数据
          templateContent.querySelector('img').src = data.avatar_url;
          templateContent.querySelector('h2').textContent = data.name || data.login;
          templateContent.querySelector('a').href = data.html_url;
          templateContent.querySelector('.blog').href = data.blog || '';
          templateContent.querySelector('.blog').content = data.blog || '';

          // 清空并添加新内容
          this.shadowRoot.innerHTML = '';
          this.shadowRoot.appendChild(templateContent);

          // 添加按钮点击事件
          this.shadowRoot.querySelector('#switch-user').addEventListener('click', () => {
            this.switchUser();
          });
        } catch (error) {
          this.shadowRoot.innerHTML = `<p>加载失败：${error.message}</p>`;
        }
      }

      // 切换到下一个用户
      switchUser() {
        this.currentUserIndex = (this.currentUserIndex + 1) % this.userList.length;
        const nextUser = this.userList[this.currentUserIndex];
        this.setAttribute('username', nextUser);
        this.fetchAndRender(nextUser);
      }
    }

    customElements.define('github-user', GitHubUser);
  </script>
</body>
</html>


```