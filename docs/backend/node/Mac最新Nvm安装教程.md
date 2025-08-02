推荐使用curl安装nvm，因为使用brew安装，有bug，之前用brew安装的话，先卸载

```js
brew uninstall nvm
```

接着使用 curl 运行如下命令

```js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

安装失败的话，是因为网站被墙了拉不下来资源，使用最新的ip，根据下面的网站可以查看

```js
https://sites.ipaddress.com/raw.githubusercontent.com/
```

然后获取该网站中的最新ip(目前最新的ip是: `185.199.108.133`)去系统 hosts 中，更改DNS解

```js
// 控制台运行 
sudo vim /etc/hosts

// 接着添加
185.199.108.133 raw.githubusercontent

// 然后再次运行
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

下载成功之后，接着分别在  ` ~/.bash_profile`  和 ` ~/.zshrc`  添加如下代码：

```js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

分别执行` source ~/.bash_profile` 和 ` source ~/.zshrc ` 应用保存

特别注意：

>  如果只在 ~/.zshrc 添加如上代码，则nvm相关配置只在在当前命令行窗口生效，新开窗口后之前操作比如nvm use 都会失效，非持久生效

接着查看是否安装成功：

```js
nvm --version 
```

然后 安装node：

```js
nvm install 16.20.0
```

如果发现安装太慢， 镜像切换，直接控制台运行以下命令：

```js
NVM_NODEJS_ORG_MIRROR=https://npm.taobao.org/mirrors/node
```

最后附上 nvm 常用命令 ：

```js
nvm use 16.20.0 // 使用16.20.0 

nvm ls // 查看本地版本

nvm ls-remote // 列出所以远程服务器的版本
```



参考文章：

 https://www.jianshu.com/p/3f5f944d7b56

https://www.jianshu.com/p/7e3fe824056a

https://blog.csdn.net/sinat_17775997/article/details/121262970

