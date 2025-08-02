# npm --legacy-peer-deps 详解

npm 的 `--legacy-peer-deps` 命令，可以绕过 peerDependencies 的冲突报错，但很多人并不清楚，最终到底安装的是哪个版本？它是怎么决定的？

## --legacy-peer-deps 做了什么

- 跳过 peerDependencies 的 冲突检查；

- 不自动安装 peerDependencies；

- 更像 npm v6 的行为：只根据 dependencies 来安装。


::: tip
换句话说，安装什么版本由 直接依赖的声明 和 依赖的 dependencies 决定，而不再理会 peerDependencies 声明冲突是否会造成不一致。
:::

### 举个例子：两个包有冲突的 peerDependency

> 假设项目依赖两个包 a 和 b；

- a 的 peerDependencies 要求 react@^17.0.0

- b 的 peerDependencies 要求 react@^18.0.0
  
package.json 中写的是：

```js
{
  "dependencies": {
    "a": "1.0.0",
    "b": "1.0.0",
    "react": "^18.2.0"
  }
}
```
这在 npm v7+ 默认行为下会报错（peer 冲突）：

```js
peer react@"^17.0.0" from a@1.0.0
peer react@"^18.0.0" from b@1.0.0
```

### 使用 --legacy-peer-deps 安装

```bash
npm install --legacy-peer-deps
```

此时：

NPM 忽略了 peerDependencies 的冲突

只根据你在 package.json 中直接声明的 "react": "^18.2.0" 安装

所以最终安装的是：react@18.2.x 最新稳定版本

### 再举个没有声明 react 的例子

在项目中声明 react，只是这样：

```js
{
  "dependencies": {
    "a": "1.0.0",
    "b": "1.0.0"
  }
}
```

使用默认安装：

``` bash
npm install
```

❌ 会报错，因为 npm 无法判断该装哪个版本的 react（两边冲突）。


使用：

```bash
npm install --legacy-peer-deps
```

✅ npm 会：

不报错；

- 也不会自动安装 react；

- a 和 b 都装了，但它们的 peerDependencies 未被满足，你自己必须手动安装一个 react。

接着运行：

```bash
npm install react@18.2.0
```

最终：

项目装的是 react@18.2.0

- b 满意

- a 不满足（但你跳过了检查，所以能运行但可能报错）

### 总结

| 场景                      | 安装行为                          |
| ----------------------- | ----------------------------- |
| 使用 `--legacy-peer-deps` | 忽略 peerDependencies 冲突，安装写的版本 |
| 没写依赖时                   | 不会自动安装任何 peerDependency       |
| 安装哪个版本？                 | 由你项目中 `dependencies` 指定的为准    |
| 是否合理？                   | 有风险，比如 `a` 运行时找不到 `react@17`  |

### 最佳实践

| 需求                     | 建议                                   |
| ---------------------- | ------------------------------------ |
| 要支持多个 react 版本         | 使用 `peerDependencies` + 让用户自己装 react |
| 安装多个冲突依赖版本             | 使用 `pnpm`，它支持多版本共存（软链接隔离）            |
| 用 `--legacy-peer-deps` | 临时绕过冲突，**不建议长期依赖**                   |
