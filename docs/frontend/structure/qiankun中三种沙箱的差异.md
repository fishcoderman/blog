在qiankun微前端框架中，为了隔离微应用的JavaScript执行环境，提供了三种不同的沙箱实现：`LegacySandbox`、`ProxySandbox`和`SnapshotSandbox`。这三种沙箱各有特点，适用于不同的场景。

## 1. LegacySandbox（传统代理沙箱）

### 实现原理：

• 通过Proxy拦截全局对象（window）的属性访问和修改
• 使用三个Map来记录沙箱运行期间的状态变更：
  ◦ `addedPropsMapInSandbox`：记录沙箱中新增的全局变量
  ◦ `modifiedPropsOriginalValueMapInSandbox`：记录沙箱中被修改的全局变量的原始值
  ◦ `currentUpdatedPropsValueMap`：持续记录更新的全局变量

### 特点：

• 所有子应用共享同一个window对象，修改会直接反映到真实window上
• 当应用切换时，会还原被修改的属性，删除新增的属性
• 适用于单实例场景（singular模式），不适合同时运行多个微应用

## 2. ProxySandbox（代理沙箱）

### 实现原理：

• 为每个微应用创建一个独立的fakeWindow对象
• 通过Proxy拦截对fakeWindow的操作，实现对全局对象的隔离访问
• 使用`updatedValueSet`记录被更新的属性

### 特点：

• 完全隔离，每个微应用有自己独立的全局对象
• 支持多实例模式，多个微应用可以同时运行而不会相互干扰
• 性能更好，不需要在应用切换时执行大量的属性操作
• 提供了白名单机制，允许某些全局变量共享

## 3. SnapshotSandbox（快照沙箱）

### 实现原理：

• 在沙箱激活时，对当前window对象做一个快照
• 在沙箱失活时，比较当前window与快照的差异，记录变更
• 在沙箱再次激活时，恢复之前的变更

### 特点：

• 兼容性最好，可以在不支持Proxy的环境中使用
• 性能较差，需要遍历window的所有属性
• 不支持多实例，只适用于单实例场景

## 沙箱选择逻辑

在qiankun中，沙箱的选择逻辑如下：

  if (window.Proxy) {
  sandbox = useLooseSandbox
    ? new LegacySandbox(appName, globalContext)
    : new ProxySandbox(appName, globalContext, { speedy: !!speedySandBox });
} else {
  sandbox = new SnapshotSandbox(appName);
} 
• 如果浏览器支持Proxy：
  ◦ 当`useLooseSandbox`为true时，使用`LegacySandbox`
  ◦ 否则使用`ProxySandbox`（默认选项）
• 如果浏览器不支持Proxy，则使用`SnapshotSandbox`

## 总结比较

| 实现方式 | Proxy | Proxy | 快照比对 |
| 隔离效果 | 中等 | 最好 | 中等 |
| 性能 | 中等 | 最好 | 最差 |
| 多实例支持 | 不支持 | 支持 | 不支持 |
| 兼容性 | 需要Proxy | 需要Proxy | 最好 |
| 适用场景 | 单实例应用 | 多实例应用 | 低版本浏览器 |

qiankun默认推荐使用`ProxySandbox`，它提供了最好的隔离效果和性能，适合大多数现代浏览器环境。只有在特殊场景下才需要考虑其他两种沙箱实现。
