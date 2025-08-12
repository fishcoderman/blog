# WebHook

实现一个 **GitHub Webhook 服务**，
让它在仓库发生 `push`、`pull request` 等操作时，自动接收 GitHub 的回调，分析**提交了哪些代码**和**做了哪些操作**。

## 1. GitHub 侧：设置 Webhook

1. 进入的 GitHub 仓库 → **Settings** → **Webhooks**。
2. 点击 **Add webhook**。
3. **Payload URL** 填写自己的服务地址，比如 `https://your-domain.com/github-webhook`。
4. **Content type** 选择 `application/json`。
5. **Secret** 设置一个密钥（服务端会用它验证签名）。
6. **选择事件**

   * 如果只关心提交代码，选 **Just the push event**。
   * 如果还想知道 PR、issue 等事件，选 **Send me everything** 或自定义多个事件。
7. 保存。

## 2. 服务端：监听 GitHub 回调

假设用 Node.js + Express 来写一个简单监听器。

### 2.1 安装依赖

```bash
npm init -y
npm install express body-parser crypto
```

### 2.2 编写服务

```js
// server.js
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = 3000;
const SECRET = "your_webhook_secret"; // 与 GitHub 设置的一致

// GitHub 发送的是 application/json
app.use(bodyParser.json({ verify: verifySignature }));

// 验证 GitHub 签名，防止伪造请求
function verifySignature(req, res, buf) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return;
  const hmac = crypto.createHmac("sha256", SECRET);
  const digest = "sha256=" + hmac.update(buf).digest("hex");
  if (signature !== digest) {
    throw new Error("Invalid signature");
  }
}

// 接收 webhook 回调
app.post("/github-webhook", (req, res) => {
  const event = req.headers["x-github-event"]; // push, pull_request, etc
  console.log("📢 收到事件:", event);

  if (event === "push") {
    const commits = req.body.commits || [];
    console.log(`Push by: ${req.body.pusher.name}`);
    commits.forEach((commit) => {
      console.log("Commit message:", commit.message);
      console.log("Added files:", commit.added);
      console.log("Modified files:", commit.modified);
      console.log("Removed files:", commit.removed);
    });
  }

  res.status(200).send("ok");
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook 监听服务已启动 http://localhost:${PORT}`);
});
```

运行：

```bash
node server.js
```

## 3. 分析提交和操作

GitHub Webhook 的 `push` 事件 payload 会直接给：

* `commits[].added` → 新增文件
* `commits[].modified` → 修改文件
* `commits[].removed` → 删除文件
* `commits[].message` → 提交信息
* `pusher.name` / `pusher.email` → 谁推送的

如果想要具体**diff 内容**：

1. 先拿到 `before` 和 `after` 的 commit SHA：

   ```json
   {
     "before": "abc123...",
     "after": "def456..."
   }
   ```
2. 用 GitHub API 获取差异：

   ```
   GET /repos/:owner/:repo/compare/abc123...def456
   ```
   这样能拿到具体的代码改动（每一行的 diff）。

## 4. 部署与公网访问

因为 GitHub Webhook 必须能访问的服务，使用docker启动node服务。

- 下载指定的镜像版本：

> docker images node:16

- 创建容器
  
将主机根目录的node文件夹映射到容器的node目录中

```bash
# 创建容器  -v /node:/node \ 为根目录/node 文件映射到 容器内的 /node目录
docker run -itd \
  --name my-node16 \
  -p 3000:3000 \
  -v /node:/node \
  node:16
```

- 将本地文件上传到远程

```bash
# 上传文件到容器内的 /node 目录
scp -r /Users/zz/* root@0.0.0:/node/
```

```bash
# 进入容器
docker exec -it my-node16 bash 
# 进入node目录
cd node
# 安装依赖
npm install
# 运行服务
node server.js
```