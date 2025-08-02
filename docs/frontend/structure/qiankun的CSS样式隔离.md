在qiankun微前端框架中，CSS样式隔离是通过为每个微应用的样式选择器添加特定前缀来实现的。这个过程主要由`ScopedCSS`类负责，下面详细解析其实现原理：

## 1. 样式处理入口

样式处理的入口是`process`函数，它接收三个参数：
- `appWrapper`: 微应用的容器元素
- `stylesheetElement`: 需要处理的样式元素
- `appName`: 微应用的名称

```typescript
export const process = (appWrapper, stylesheetElement, appName) => {
  // 懒加载单例模式创建处理器
  if (!processor) {
    processor = new ScopedCSS();
  }
  
  // 获取容器标签名
  const tag = (mountDOM.tagName || '').toLowerCase();
  
  // 只处理style标签
  if (tag && stylesheetElement.tagName === 'STYLE') {
    // 生成前缀，格式为：标签名[data-qiankun="应用名"]
    const prefix = `${tag}[${QiankunCSSRewriteAttr}="${appName}"]`;
    // 调用ScopedCSS实例的process方法处理样式
    processor.process(stylesheetElement, prefix);
  }
};
```

## 2. 样式解析与重写

`ScopedCSS`类的`process`方法负责处理样式元素：

```typescript
process(styleNode, prefix = '') {
  // 防止重复处理
  if (ScopedCSS.ModifiedTag in styleNode) {
    return;
  }

  if (styleNode.textContent !== '') {
    // 将样式内容添加到临时节点
    const textNode = document.createTextNode(styleNode.textContent || '');
    this.swapNode.appendChild(textNode);
    // 获取CSS规则
    const sheet = this.swapNode.sheet;
    const rules = arrayify<CSSRule>(sheet?.cssRules ?? []);
    // 重写CSS规则，添加前缀
    const css = this.rewrite(rules, prefix);
    // 更新样式节点内容
    styleNode.textContent = css;
    // 标记为已处理
    (styleNode as any)[ScopedCSS.ModifiedTag] = true;
    return;
  }
  
  // 对于动态生成的样式，使用MutationObserver监听变化
  const mutator = new MutationObserver((mutations) => {
    // 当样式内容变化时，重新处理
    // ...
  });
  mutator.observe(styleNode, { childList: true });
}
```

## 3. CSS规则重写

核心的重写逻辑在`rewrite`方法中：

```typescript
private rewrite(rules: CSSRule[], prefix: string = '') {
  let css = '';

  rules.forEach((rule) => {
    switch (rule.type) {
      case RuleType.STYLE:  // 普通样式规则
        css += this.ruleStyle(rule as CSSStyleRule, prefix);
        break;
      case RuleType.MEDIA:  // 媒体查询
        css += this.ruleMedia(rule as CSSMediaRule, prefix);
        break;
      case RuleType.SUPPORTS:  // 特性查询
        css += this.ruleSupport(rule as CSSSupportsRule, prefix);
        break;
      default:  // 其他规则类型保持不变
        if (typeof rule.cssText === 'string') {
          css += `${rule.cssText}`;
        }
        break;
    }
  });

  return css;
}
```

## 4. 选择器处理

最关键的是`ruleStyle`方法，它负责处理各种CSS选择器并添加前缀：

```typescript
private ruleStyle(rule: CSSStyleRule, prefix: string) {
  // 匹配根元素选择器的正则表达式
  const rootSelectorRE = /((?:[^\w\-.#]|^)(body|html|:root))/gm;
  const rootCombinationRE = /(html[^\w{[]+)/gm;

  const selector = rule.selectorText.trim();
  let cssText = rule.cssText;

  // 处理html、body、:root选择器
  if (selector === 'html' || selector === 'body' || selector === ':root') {
    return cssText.replace(rootSelectorRE, prefix);
  }

  // 处理html body、html > body等组合选择器
  if (rootCombinationRE.test(rule.selectorText)) {
    // 特殊处理html + body这种非标准组合
    const siblingSelectorRE = /(html[^\w{]+)(\+|~)/gm;
    if (!siblingSelectorRE.test(rule.selectorText)) {
      cssText = cssText.replace(rootCombinationRE, '');
    }
  }

  // 处理分组选择器，如a,span,p,div { ... }
  cssText = cssText.replace(/^[\s\S]+{/, (selectors) =>
    selectors.replace(/(^|,\n?)([^,]+)/g, (item, p, s) => {
      // 处理包含根元素的选择器，如div,body,span { ... }
      if (rootSelectorRE.test(item)) {
        return item.replace(rootSelectorRE, (m) => {
          // 保留有效的前导字符
          const whitePrevChars = [',', '('];
          if (m && whitePrevChars.includes(m[0])) {
            return `${m[0]}${prefix}`;
          }
          // 替换根选择器为前缀
          return prefix;
        });
      }
      // 为普通选择器添加前缀
      return `${p}${prefix} ${s.replace(/^ */, '')}`;
    }),
  );

  return cssText;
}
```

## 5. 处理特殊规则

对于媒体查询和特性查询等特殊规则，qiankun也提供了专门的处理方法：

```typescript
// 处理媒体查询
private ruleMedia(rule: CSSMediaRule, prefix: string) {
  // 递归处理媒体查询中的规则
  const css = this.rewrite(arrayify(rule.cssRules), prefix);
  return `@media ${rule.conditionText || rule.media.mediaText} {${css}}`;
}

// 处理特性查询
private ruleSupport(rule: CSSSupportsRule, prefix: string) {
  // 递归处理特性查询中的规则
  const css = this.rewrite(arrayify(rule.cssRules), prefix);
  return `@supports ${rule.conditionText || rule.cssText.split('{')[0]} {${css}}`;
}
```

## 样式隔离效果

通过上述机制，qiankun将微应用的CSS选择器转换为带有特定前缀的选择器，例如：

```css
/* 原始CSS */
body { margin: 0; }
.title { color: red; }

/* 转换后的CSS */
div[data-qiankun="app1"] { margin: 0; }
div[data-qiankun="app1"] .title { color: red; }
```

这样，微应用的样式就只会应用到其容器内部，不会影响到主应用或其他微应用，实现了有效的样式隔离。

## 总结

qiankun通过以下步骤实现CSS样式隔离：

1. 拦截微应用的样式元素
2. 解析CSS规则
3. 为选择器添加特定前缀（如`div[data-qiankun="app1"]`）
4. 处理各种特殊选择器和规则
5. 将处理后的CSS内容重新写入样式元素