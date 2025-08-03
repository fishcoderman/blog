# Nginx设置请求和响应头
Nginx 配置示例，展示如何同时设置请求和响应的 HTTP 头部。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /path/to/your/static/files;
        index index.html;

        # 设置响应头
        add_header Cache-Control "public, max-age=3600";  # 缓存 1 小时
        add_header X-Custom-Header "MyValue";  # 自定义响应头

        # 设置请求头（例如，代理请求时）
        proxy_set_header X-Real-IP $remote_addr;  # 将客户端 IP 传递给后端
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 转发的 IP 地址
        proxy_set_header Host $host;  # 转发的主机名

        # 代理请求到后端服务器
        proxy_pass http://backend_server;
    }

    location /api {
        # 对 API 请求设置访问控制
        add_header Access-Control-Allow-Origin "*";  # 允许跨域请求
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";  # 允许的方法
        add_header Access-Control-Allow-Headers "Content-Type";  # 允许的请求头
    }
}
```

### 解释

1. **设置响应头**：
   - `add_header Cache-Control "public, max-age=3600";`：为所有响应设置 `Cache-Control` 头，指示客户端缓存该资源 1 小时。
   - `add_header X-Custom-Header "MyValue";`：添加自定义响应头 `X-Custom-Header`。

2. **设置请求头**（在代理请求时）：
   - `proxy_set_header X-Real-IP $remote_addr;`：将客户端的真实 IP 地址传递给后端服务器。
   - `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`：添加转发的 IP 地址，以便后端可以识别原始请求的来源。
   - `proxy_set_header Host $host;`：传递请求的主机名。

3. **代理请求**：
   - `proxy_pass http://backend_server;`：将请求代理到后端服务器。

4. **针对 API 的特定设置**：
   - 在 `/api` 路径下，设置了允许跨域请求的头部，以支持 CORS（跨源资源共享）。

### 总结

这个示例展示了如何在 Nginx 中同时设置请求和响应的 HTTP 头部。通过使用 `add_header` 和 `proxy_set_header` 指令，可以灵活地控制请求和响应的行为，以满足应用的需求。