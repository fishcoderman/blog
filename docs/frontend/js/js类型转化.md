
# js三种类型转换
我们需要知道的第一个规则是：在 JS 中只有 3 种类型的转换
- to string
- to boolean
- to number
第二，类型转换的逻辑在原始类型和对象类型上是不同的，但是他们都只会转换成上面 3 种类型之一。

### 隐式 vs 显式类型转换
类型转换可以分为隐式类型转换和显式类型转换。
当开发人员通过编写适当的代码(如Number(value))用于在类型之间进行转换时，就称为显式类型强制转换(或强制类型转换)。

然而 JavaScript 是弱类型语言，在某些操作下，值可以在两种类型之间自动的转换，这叫做隐式类型转换。在对不同类型的值使用运算符时通常会发生隐式类型转换。比如 1 == null, 2 / "5", null + new Date()。当值被 if 语句包裹时也有可能发生，比如 if(value) {} 会将 value 转换为 boolean类型。

严格相等运算符（===）不会触发类型隐式转换，所以它可以用来比较值和类型是否都相等。
隐式类型转换是一把双刃剑，使用它虽然可以写更少的代码但有时候会出现难以被发现的bug。

### Boolean 类型转换
 Boolean 类型转换只会有 true 或者 false 两种结果
 它的转换规则相对简单：除了以下五个值的转换结果为false，其他的值全部为true。
```js
 undefined
 null
 0（包含-0和+0）
 Na
 ''（空字符串）
```

### String 类型转换
String() 方法可以用来显式将值转为字符串，隐式转换通常在有 + 运算符并且有一个操作数是 string 类型时被触发，如：
```js
String(123) // 显式类型转换

123 + '' // 隐式类型转换
```

所有原始类型转 String 类型

```js
String(123)  // '123'
String(-12.3)  // '-12.3'
String(null)  // 'null'
String(undefined)  // 'undefined'
String(true)  // 'true'
```

### Number 类型转换
和 Boolean()、String() 方法一样， Number() 方法可以用来显式将值转换成 number 类型。
number 的隐式类型转换是比较复杂的，因为它可以在下面多种情况下被触发。
- 比较操作（>, <, <=, >=）
- 按位操作（| & ^ ~）
- 算数操作（- + * / %）， 注意，当 + 操作存在任意的操作数是 string 类型时，不会触发 number 类型的隐式转换
- 一 元 + 操作
- 非严格相等操作（== 或者 != ），注意，== 操作两个操作数都是 string 类型时，不会发生 number 类型的隐式转换
```js
Number('123')    // 显示类型转换
+ '123'          //  隐式类型转换
123 != "456"    //  隐式类型转换
4 > "5"        //  隐式类型转换
5 / null      //  隐式类型转换
true | 0      //  隐式类型转换
```
### ToPrimitive 类型转换

当涉及到对象的操作比如：[1] + [2,3]，引擎首先会尝试将 object 类型转为原始类型，然后在将原始类型转为最终需要的类型，而且仍然只有 3 种类型的转换：number, string, boolean
最简单的情况是 boolean 类型的转换，任何非原始类型总是会转换成 true,无论对象或数组是否为空。
对象通过内部 [[ToPrimitive]] 方法转换为原始类型，该方法负责数字和字符串转换。

[[ToPrimitive]] 方法接受两个参数一个输入值和一个需要转换的类型（Numer or String）
number 和 string的转换都使用了对象的两个方法： valueOf 和 toString。这两个方法都在 Object.prototype 上被声明，因此可用于任何派生类，比如 Date, Array等。

通常上 [[ToPrimitive]] 算法如下：
- 1. 如果输入的值已经是原始类型，直接返回这个值。
- 2. 输入的值调用 toString() 方法，如果结果是原始类型，则返回。
- 3. 输入的值调用 valueOf() 方法，如果结果是原始类型，则返回。
- 4. 如果上面 3 个步骤之后，转换后的值仍然不是原始类型，则抛出 TypeError 错误。
number 类型的转换首先会调用 valueOf() 方法，如果不是原始值在调用 toString() 方法。 string 类型的转换则相反。
大多数 JS 内置对象类型的 valueOf() 返回这个对象本身，其结果经常被忽略，因为它不是一个原始类型。所以大多数情况下当 object 需要转换成 number 或 string 类型时最终都调用了 toString() 方法。

当运算符不同时，[[ToPrimitive]] 方法接受的转换类型参数也不相同。当存在 == 或者 + 运算符时一般会先触发 number 类型的转换再触发 string 类型转换。
在 JS 中你可以通过重写对象的 toString 和 valueOf 方法来修改对象到原始类型转换的逻辑。

### 案例解析

```js
      /**
       * 参考文章地址：
       *  https://juejin.cn/post/6844903907584376839
       *  https://wangdoc.com/javascript/features/conversion
       */
      function run() {
        /**
         * 类型转化主要有  Number  String Boolean 三种
         * 1: Number
         * Number('') 空字符串转为0
         * 布尔值：true 转成 1，false 转成 0
         * Number(true) // 1
         * Number(false) // 0
         * undefined：转成 NaN; Number(undefined) // NaN
         * null：转成0 ; Number(null) // 0
         * 字符串：如果不可以被解析为数值，返回 NaN Number('324abc') // NaN
         * Number 先转 valueOf 再转 toString
         * Number([1]) 先转 valueOf()  =>  不变 [1] => 再转 toString() => '1'
         * Number([1,2]) 先转 valueOf()  =>  不变 [1,2] => 再转 toString() => '1,2'
         * 当 + 操作存在任意的操作数是 string 类型时，不会触发 number 类型的隐式转换
         *
         * 2: String
         * String 先转 toString  再转 valueOf
         * String({a: 1}) // "[object Object]"
         * String([1, 2, 3]) // "1,2,3"
         *
         * 3: Boolean 类型转换只会有 true 或者 false 两种结果
         * 它的转换规则相对简单：除了以下五个值的转换结果为false，其他的值全部为true。
         * undefined
         * null
         * 0（包含-0和+0）
         * Na
         * ''（空字符串）
         */
        const res = [
          true + false, // 1
          12 / '6', // 2
          'number' + 15 + 3, // 'number53'
          15 + 3 + 'number', // '18number'
          [1] > null, // Number([1]) > Number(null) =>  '1' > 0  => true
          'foo' + +'bar', // 'foo' + Number('bar') => 'fooNaN'
          'true' == true, //  Number('true') == Number(true) => NaN === 1 => false
          false == 'false', // Number(false) == Number('false') => 0 === NaN  => false
          null == '', //  Number(null) == Number('') => 0 === 0 => true
          !!'false' == !!'true', // true
          ['x'] == 'x', // true
          [] + null + 1, // 'null1'
          [1, 2, 3] == [1, 2, 3], // 当运算符两边类型相同时，不会执行类型转换,两个数组的内存地址不一样，所以返回 false
          {} + [] + {} + [1], // '[object Object][object Object]1'
          !+[] + [] + ![], // !'' + '' + false => true + '' + false => 'true false'
          new Date(0) - 0, // '-' 运算符执行 number 类型隐式转换对于 Date 型的值，Date.valueOf() 返回到毫秒的时间戳。 => 0 - 0
          new Date(0) + 0, // '+' 运算符触发默认转换，因此使用 toString() 方法，而不是 valueOf()。 => 'Thu Jan 01 1970 02:00:00 GMT+0200 (EET)' + 0
        ];
        
        res.forEach((e, i) => {
          console.info(i, e);
        });

        /**
         * 地址： https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive
         * Symbol.toPrimitive 是内置的 symbol 属性，
         * 其指定了一种接受首选类型并返回对象原始值的表示的方法。
         * 它被所有的强类型转换制算法优先调用。
         * 在 Symbol.toPrimitive 属性（用作函数值）的帮助下，对象可以转换为一个原始值。该函数被调用时，会被传递一个字符串参数 hint，表示要转换到的原始值的预期类型。
         * hint 参数的取值是 "number"、"string" 和 "default" 中的任意一个。
         */
        const object1 = {
          [Symbol.toPrimitive](hint) {
            if (hint === 'number') {
              return 42;
            }
            return null;
          },
        };

        console.log(+object1);
      }

      run();
```