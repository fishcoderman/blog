## 🛠️ Shell 常用命令大全

按照类别详细介绍在开发中常用的 Shell 命令：

---

## 1️⃣ 文件和目录操作

### **`ls` - 列出文件和目录**
```bash
ls                    # 列出当前目录
ls -la                # 详细信息 + 隐藏文件
ls -lh                # 人类可读的文件大小
ls -lt                # 按修改时间排序
ls *.js               # 列出所有 .js 文件

# 在 npm scripts 中
"list-src": "ls -la src/"
```

### **`cd` - 切换目录**
```bash
cd src/               # 进入 src 目录
cd ..                 # 返回上级目录
cd ~                  # 回到用户主目录
cd -                  # 返回上一个目录

# 在 npm scripts 中
"build-backend": "cd backend && npm run build"
```

### **`pwd` - 显示当前路径**
```bash
pwd                   # 输出: /Users/tao/Documents/file/ai/gitlab-mcp

# 在 npm scripts 中
"show-path": "pwd"
```

### **`mkdir` - 创建目录**
```bash
mkdir build           # 创建目录
mkdir -p dist/js/src  # 递归创建（父目录不存在时也创建）

# 在 npm scripts 中
"prepare-dirs": "mkdir -p dist/css dist/js dist/images"
```

### **`rm` - 删除文件/目录**
```bash
rm file.txt           # 删除文件
rm -f file.txt        # 强制删除（不提示）
rm -r folder/         # 递归删除目录
rm -rf dist/          # 强制递归删除（危险！）

# 在 npm scripts 中
"clean": "rm -rf build dist coverage"
```

### **`cp` - 复制**
```bash
cp src.txt dst.txt    # 复制文件
cp -r src/ dist/      # 递归复制目录

# 在 npm scripts 中
"copy-assets": "cp -r public/* dist/"
```

### **`mv` - 移动/重命名**
```bash
mv old.txt new.txt    # 重命名
mv file.txt src/      # 移动文件

# 在 npm scripts 中
"rename-dist": "mv build dist"
```

### **`touch` - 创建空文件或更新时间戳**
```bash
touch new-file.js     # 创建空文件

# 在 npm scripts 中
"create-env": "touch .env.local"
```

---

## 2️⃣ 文本查看和处理

### **`cat` - 查看文件内容**
```bash
cat file.txt          # 显示文件内容
cat file1.txt file2.txt  # 显示多个文件
cat *.log             # 显示所有 .log 文件

# 在 npm scripts 中
"show-version": "cat package.json | grep version"
```

### **`head` - 查看文件开头**
```bash
head file.txt         # 显示前 10 行
head -n 20 file.txt   # 显示前 20 行

# 在 npm scripts 中
"preview-log": "head -n 50 build.log"
```

### **`tail` - 查看文件末尾**
```bash
tail file.txt         # 显示最后 10 行
tail -n 20 file.txt   # 显示最后 20 行
tail -f app.log       # 实时监控日志（follow）

# 在 npm scripts 中
"watch-log": "tail -f server.log"
```

### **`echo` - 输出文本**
```bash
echo "Hello World"    # 输出文本
echo $PATH            # 输出环境变量
echo "log" > file.txt # 写入文件
echo "log" >> file.txt # 追加到文件

# 在 npm scripts 中
"log-build": "echo '开始构建...' && npm run build"
```

### **`wc` - 统计字数/行数**
```bash
wc file.txt           # 统计行数、字数、字节数
wc -l file.txt        # 只统计行数
wc -w file.txt        # 只统计字数
wc -c file.txt        # 只统计字节数

# 在 npm scripts 中
"count-files": "ls src/ | wc -l",
"count-lines": "cat src/*.js | wc -l",
"count-todos": "grep -r TODO src/ | wc -l"
```

### **`sort` - 排序**
```bash
sort file.txt         # 按字母排序
sort -r file.txt      # 反向排序
sort -n file.txt      # 按数字排序
sort -u file.txt      # 去重排序

# 在 npm scripts 中
"largest-files": "du -ah | sort -rh | head -n 10"
```

### **`uniq` - 去除重复行**
```bash
uniq file.txt         # 去除相邻重复行
uniq -c file.txt      # 统计重复次数
sort file.txt | uniq  # 先排序再去重

# 在 npm scripts 中
"count-imports": "grep -r '^import' src/ | cut -d: -f2 | sort | uniq -c"
```

### **`cut` - 剪切文本**
```bash
cut -d',' -f1 data.csv    # 提取 CSV 第一列
cut -c1-10 file.txt       # 提取每行前 10 个字符

# 在 npm scripts 中
"list-deps": "npm list | cut -d' ' -f2"
```

### **`sed` - 流编辑器（替换文本）**
```bash
sed 's/old/new/' file.txt          # 替换每行第一个匹配
sed 's/old/new/g' file.txt         # 替换所有匹配
sed -i 's/old/new/g' file.txt      # 直接修改文件

# 在 npm scripts 中
"bump-version": "sed -i 's/\"version\": \"1.0.0\"/\"version\": \"1.0.1\"/' package.json"
```

### **`awk` - 文本分析工具**
```bash
awk '{print $1}' file.txt          # 打印第一列
awk -F',' '{print $2}' data.csv    # 指定分隔符

# 在 npm scripts 中
"disk-usage": "df -h | awk '{print $5}'"
```

### **`find` - 查找文件**
```bash
find . -name "*.js"                # 查找所有 .js 文件
find . -type f -name "test*"       # 查找以 test 开头的文件
find . -mtime -7                   # 查找 7 天内修改的文件
find . -size +10M                  # 查找大于 10MB 的文件

# 在 npm scripts 中
"find-tests": "find . -name '*.test.js'",
"find-old": "find . -name '*.old' -delete"
```

---

## 3️⃣ 系统和进程管理

### **`ps` - 查看进程**
```bash
ps                    # 查看当前终端进程
ps aux                # 查看所有进程
ps aux | grep node    # 查找 node 进程

# 在 npm scripts 中
"list-node": "ps aux | grep node"
```

### **`kill` - 终止进程**
```bash
kill 1234             # 终止进程 ID 1234
kill -9 1234          # 强制终止
killall node          # 终止所有 node 进程

# 在 npm scripts 中
"stop-server": "lsof -ti:3000 | xargs kill"
```

### **`top` / `htop` - 实时监控**
```bash
top                   # 实时查看进程（按 q 退出）
htop                  # 更友好的界面（需安装）
```

### **`chmod` - 修改权限**
```bash
chmod +x script.sh    # 添加执行权限
chmod 755 file        # 设置为 rwxr-xr-x
chmod -R 644 src/     # 递归修改

# 在 npm scripts 中
"make-executable": "chmod +x build/index.js"
```

### **`du` - 磁盘使用情况**
```bash
du -h                 # 人类可读格式
du -sh *              # 显示每个文件/目录大小
du -sh node_modules/  # 查看 node_modules 大小

# 在 npm scripts 中
"size": "du -sh node_modules dist build"
```

### **`df` - 磁盘空间**
```bash
df -h                 # 显示磁盘空间
```

---

## 4️⃣ 网络命令

### **`curl` - 发送 HTTP 请求**
```bash
curl https://api.github.com                    # GET 请求
curl -X POST https://api.example.com           # POST 请求
curl -H "Content-Type: application/json" ...   # 设置请求头
curl -d '{"key":"value"}' ...                  # 发送数据
curl -o file.zip https://example.com/file.zip  # 下载文件

# 在 npm scripts 中
"health-check": "curl http://localhost:3000/health",
"test-api": "curl -X POST http://localhost:3000/api/test"
```

### **`wget` - 下载文件**
```bash
wget https://example.com/file.zip              # 下载文件
wget -c https://example.com/large.zip          # 断点续传

# 在 npm scripts 中
"download-assets": "wget https://cdn.example.com/assets.zip"
```

### **`ping` - 测试网络连接**
```bash
ping google.com       # 测试连接
ping -c 4 google.com  # 只 ping 4 次
```

### **`netstat` / `lsof` - 查看端口**
```bash
netstat -an | grep 3000           # 查看 3000 端口
lsof -i :3000                     # 查看占用 3000 端口的进程

# 在 npm scripts 中
"check-port": "lsof -i :3000",
"kill-port": "lsof -ti:3000 | xargs kill -9"
```

---

## 5️⃣ 压缩和解压

### **`tar` - 打包**
```bash
tar -czf archive.tar.gz folder/   # 压缩
tar -xzf archive.tar.gz           # 解压
tar -tzf archive.tar.gz           # 查看内容

# 在 npm scripts 中
"archive": "tar -czf release.tar.gz dist/",
"extract": "tar -xzf backup.tar.gz"
```

### **`zip` / `unzip`**
```bash
zip -r archive.zip folder/        # 压缩
unzip archive.zip                 # 解压
unzip -l archive.zip              # 查看内容

# 在 npm scripts 中
"package": "zip -r release.zip dist/"
```

---

## 6️⃣ Git 命令

```bash
git status                        # 查看状态
git add .                         # 添加所有文件
git commit -m "message"           # 提交
git push                          # 推送
git pull                          # 拉取
git log                           # 查看提交历史
git branch                        # 查看分支
git checkout -b feature           # 创建并切换分支
git diff                          # 查看差异

# 在 npm scripts 中
"pre-push": "npm run lint && npm test",
"version": "npm version patch && git push --tags"
```

---

## 7️⃣ 实用组合命令

### **在 npm scripts 中的实际应用**

```json
{
  "scripts": {
    "// ===== 文件操作 =====": "",
    "clean": "rm -rf dist build coverage .cache",
    "prepare": "mkdir -p dist/js dist/css dist/images",
    "copy": "cp -r public/* dist/ && cp README.md dist/",
    
    "// ===== 文本处理 =====": "",
    "count-lines": "find src -name '*.js' | xargs wc -l",
    "count-todos": "grep -rn 'TODO\\|FIXME' src/ | wc -l",
    "show-todos": "grep -rn 'TODO\\|FIXME' src/ --color=always",
    
    "// ===== 查找和统计 =====": "",
    "find-large": "find . -size +1M -type f | grep -v node_modules",
    "size-report": "du -sh node_modules dist build",
    "deps-size": "du -sh node_modules/* | sort -rh | head -n 20",
    
    "// ===== 日志分析 =====": "",
    "log-errors": "cat app.log | grep ERROR | wc -l",
    "log-recent": "tail -n 100 app.log",
    "log-watch": "tail -f app.log",
    
    "// ===== 进程管理 =====": "",
    "kill-port": "lsof -ti:3000 | xargs kill -9 || true",
    "check-port": "lsof -i :3000",
    "ps-node": "ps aux | grep node",
    
    "// ===== 网络测试 =====": "",
    "health": "curl http://localhost:3000/health",
    "api-test": "curl -X POST http://localhost:3000/api/test -H 'Content-Type: application/json' -d '{}'",
    
    "// ===== 代码审查 =====": "",
    "audit:console": "grep -rn 'console\\.' src/ --exclude-dir=test || echo '✅ No console'",
    "audit:debugger": "grep -rn 'debugger' src/ || echo '✅ No debugger'",
    "audit:imports": "grep -rn '^import' src/ | cut -d: -f2 | sort | uniq -c",
    
    "// ===== 构建流程 =====": "",
    "prebuild": "npm run clean && npm run prepare",
    "build": "tsc && npm run copy",
    "postbuild": "echo 'Build size:' && du -sh dist/",
    
    "// ===== 部署 =====": "",
    "predeploy": "npm run build && npm test",
    "deploy": "npm publish",
    "postdeploy": "git tag v$(node -p \"require('./package.json').version\") && git push --tags",
    
    "// ===== 打包 =====": "",
    "archive": "tar -czf release-$(date +%Y%m%d).tar.gz dist/",
    "backup": "tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz src/ package.json"
  }
}
```

---

## 8️⃣ 跨平台兼容的 npm 包

由于 Shell 命令在不同操作系统上可能有差异，推荐使用这些跨平台工具：

```json
{
  "scripts": {
    "clean": "rimraf dist build",
    "copy": "cpy 'public/**' dist",
    "mkdir": "mkdirp dist/js dist/css",
    "parallel": "concurrently \"npm:watch:*\"",
    "sequential": "npm-run-all clean build test",
    "cross-env": "cross-env NODE_ENV=production webpack"
  },
  "devDependencies": {
    "rimraf": "^5.0.0",      // 代替 rm -rf
    "cpy-cli": "^5.0.0",     // 代替 cp
    "mkdirp": "^3.0.0",      // 代替 mkdir -p
    "concurrently": "^8.0.0", // 并行运行
    "npm-run-all": "^4.1.5", // 串行/并行运行
    "cross-env": "^7.0.3"    // 设置环境变量
  }
}
```

---

## 📊 命令速查表

| 类别 | 命令 | 用途 |
|------|------|------|
| **文件** | `ls`, `cd`, `pwd`, `mkdir`, `rm`, `cp`, `mv`, `touch` | 文件目录操作 |
| **文本** | `cat`, `head`, `tail`, `echo`, `grep`, `sed`, `awk` | 文本处理 |
| **统计** | `wc`, `sort`, `uniq`, `cut`, `find` | 统计分析 |
| **系统** | `ps`, `kill`, `top`, `chmod`, `du`, `df` | 系统管理 |
| **网络** | `curl`, `wget`, `ping`, `netstat`, `lsof` | 网络操作 |
| **压缩** | `tar`, `zip`, `unzip`, `gzip` | 压缩解压 |
| **Git** | `git status`, `git add`, `git commit`, `git push` | 版本控制 |

---

## 💡 实用技巧

### **1. 命令别名（在 `.bashrc` 或 `.zshrc` 中）**
```bash
alias ll='ls -la'
alias gs='git status'
alias gp='git push'
alias nrs='npm run start'
alias nrb='npm run build'
```

### **2. 管道组合的威力**
```bash
# 找出占用空间最大的 10 个文件
du -ah | sort -rh | head -n 10

# 统计代码行数（排除 node_modules）
find . -name '*.js' | grep -v node_modules | xargs wc -l | sort -rn

# 查看最常使用的命令
history | awk '{print $2}' | sort | uniq -c | sort -rn | head -n 10
```

### **3. 在 npm scripts 中优雅处理错误**
```json
{
  "scripts": {
    "safe-clean": "rm -rf dist || true",
    "optional-test": "npm run test || echo '⚠️ 测试失败但继续'",
    "strict-build": "npm run lint && npm run test && npm run build"
  }
}
```