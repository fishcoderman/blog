# 背景

Mac 的 m 系列芯片需要使用到 arm 架构的 Node，但是之前安装的是 Rosetta2 环境下的 Node。
使用@esbuild/darwin-x64 的时候错误如下，大致意思就是 m 系列的 node 需要@esbuild/darwin-arm64，所以需要安装 arm 架构的 Node。

Error:
You installed esbuild for another platform than the one you’re currently using.
This won’t work because esbuild is written with native code and needs to
install a platform-specific binary executable.

Specifically the “@esbuild/darwin-x64” package is present but this platform
needs the “@esbuild/darwin-arm64” package instead. People often get into this
situation by installing esbuild with npm running inside of Rosetta 2 and then
trying to use it with node running outside of Rosetta 2, or vice versa (Rosetta
2 is Apple’s on-the-fly x86_64-to-arm64 translation service).

## 使用 fnm 安装 Node

1.安装 fnm：您可以使用 Homebrew 来安装 fnm。只需打开终端并运行以下命令：

> arch -arm64 brew install fnm

2. 初始化 fnm：安装后，您需要将 fnm 初始化代码添加到您的 shell 配置文件中（如 .bashrc, .zshrc, 等）。fnm 安装命令通常会提供相应的指导。
   对于 bash，运行：

> echo 'eval "$(fnm env)"' >> ~/.zshrc

对于 zsh，运行：

> echo 'eval "$(fnm env)"' >> ~/.bashrc

3.使用 fnm 安装 arm 的 Node.js,

> fnm install 16.19.0 --arch arm64

4.切换 Node.js 版本：安装多个版本的 Node.js 后，您可以使用以下命令在它们之间切换：

> fnm use 16.19.0

5.设置默认 Node.js 版本：要设置某个版本的 Node.js 为默认使用版本，可以使用：

> fnm default 16.19.0

6.查看安装的 Node.js 版本

> fnm ls

7.查看架构

> node -p process.arch // arm64
