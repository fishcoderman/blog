以下是 **ES6（ES2015）到 ESNext** 各年度 ECMAScript 标准新增的主要语法特性总结，按年份分类：

---

### **ES6 / ES2015**  
JavaScript 的重大更新，引入了现代编程的核心特性。  
**新增语法**：

- `let` / `const`（块级作用域变量）
- 箭头函数（`() => {}`）
- 模板字符串（`` `Hello ${name}` ``）
- 解构赋值（`const { a, b } = obj;`）
- 默认参数（`function foo(a = 1) {}`）
- Rest/Spread 操作符（`...args`）
- 类（`class`）
- 模块化（`import` / `export`）
- `Promise`（异步处理）
- `Symbol`（唯一值）
- `for...of` 循环
- 生成器（`function*` 和 `yield`）
​- Proxy / Reflect（元编程）
​- Object.assign() 
---

### **ES2016**  
小版本更新，仅新增 2 个特性。  
**新增语法**：
1. 数组的 `includes()` 方法  
   ```javascript
   [1, 2, 3].includes(2); // true
   ```
2. 指数运算符（`**`）  
   ```javascript
   2 ** 3; // 8（替代 Math.pow(2, 3)）
   ```

---

### **ES2017**  
**新增语法**：
1. `async` / `await`（异步终极解决方案）  
   ```javascript
   async function fetchData() {
     const res = await fetch(url);
   }
   ```
2. `Object.values()` / `Object.entries()`  
   ```javascript
   Object.values({ a: 1, b: 2 }); // [1, 2]
   ```
3. 字符串填充方法（`padStart()` / `padEnd()`）  
   ```javascript
   '5'.padStart(2, '0'); // "05"
   ```
4. 函数参数尾逗号（`function foo(a, b,) {}`）

---

### **ES2018**  
**新增语法**：
1. Rest/Spread 属性（对象解构）  
   ```javascript
   const { a, ...rest } = { a: 1, b: 2 };
   ```
2. 异步迭代器（`for await...of`）  
   ```javascript
   for await (const chunk of stream) {}
   ```
3. `Promise.finally()`  
   ```javascript
   fetch(url).finally(() => cleanup());
   ```
4. 正则表达式改进：
   • 命名捕获组（`(?<name>pattern)`）
   • `dotAll` 模式（`/s` 标志）
   • 后行断言（`(?<=...)` / `(?<!...)`）

---

### **ES2019**  
**新增语法**：
1. `Array.flat()` / `Array.flatMap()`  
   ```javascript
   [1, [2]].flat(); // [1, 2]
   ```
2. `Object.fromEntries()`  
   ```javascript
   Object.fromEntries([['a', 1]]); // { a: 1 }
   ```
3. 字符串的 `trimStart()` / `trimEnd()`  
4. `try...catch` 可省略绑定（`catch {}`）  
5. `Symbol.description`  
   ```javascript
   Symbol('foo').description; // "foo"
   ```

---

### **ES2020**  
**新增语法**：
1. 可选链（`?.`）  
   ```javascript
   obj?.prop?.method?.();
   ```
2. 空值合并（`??`）  
   ```javascript
   const value = input ?? 'default';
   ```
3. `Promise.allSettled()`  
   ```javascript
   Promise.allSettled([promise1, promise2]);
   ```
4. `BigInt`（大整数）  
   ```javascript
   123n + 456n; // 579n
   ```
5. 动态导入（`import()`）  
   ```javascript
   const module = await import('./module.js');
   ```

---

### **ES2021**  
**新增语法**：
1. 逻辑赋值运算符（`&&=` / `||=` / `??=`）  
   ```javascript
   a ||= b; // 等价于 a = a || b
   ```
2. `String.replaceAll()`  
   ```javascript
   'aabb'.replaceAll('a', 'c'); // "ccbb"
   ```
3. `Promise.any()`  
   ```javascript
   Promise.any([promise1, promise2]); // 返回第一个成功的
   ```
4. 数字分隔符（`_`）  
   ```javascript
   1_000_000; // 更易读
   ```

---

### **ES2022**  
**新增语法**：
1. 类的私有字段（`#`）  
   ```javascript
   class Foo { #privateField = 1; }
   ```
2. `await` 顶层使用（模块中）  
   ```javascript
   const data = await fetch(url); // 模块顶层直接使用
   ```
3. `Array.at()`  
   ```javascript
   [1, 2, 3].at(-1); // 3（负索引）
   ```
4. `Object.hasOwn()`  
   ```javascript
   Object.hasOwn(obj, 'key'); // 替代 obj.hasOwnProperty
   ```
5. 静态类块（`static {}`）  
   ```javascript
   class Foo { static { initialize(); } }
   ```

---

### **ES2023**  
**新增语法**：
1. `Array.findLast()` / `Array.findLastIndex()`  
   ```javascript
   [1, 2, 3].findLast(x => x > 1); // 3
   ```
2. `Hashbang` 语法标准化  
   ```javascript
   #!/usr/bin/env node
   ```

---

### **ESNext（未来提案）**  
实验性特性（可能在未来版本中发布）：
1. **装饰器（Decorators）**（`@decorator`）  
2. **Record & Tuple**（不可变数据结构）  
   ```javascript
   #{ a: 1 } 和 #[1, 2, 3]
   ```
3. **管道操作符（Pipeline Operator）**  
   ```javascript
   value |> foo |> bar;
   ```

---

### **总结**
| 版本      | 关键特性                              |
|-----------|---------------------------------------|
| **ES6**   | `let`/`const`、箭头函数、类、模块化  |
| **ES2017**| `async`/`await`、`Object.entries()`   |
| **ES2020**| 可选链（`?.`）、空值合并（`??`）      |
| **ES2022**| 私有字段（`#`）、顶层 `await`         |
| **ESNext**| 装饰器、Record & Tuple（提案中）      |

建议根据目标运行环境选择支持的版本（可通过 [Can I Use](https://caniuse.com/) 检查兼容性）。