**Node 本地模块（Native Addons）** 是指用 **C**、**C++** 或其他编译型语言编写的模块，这些模块被编译成与特定平台相关的二进制文件（如 `.node` 文件），并可以在 **Node.js** 环境中通过 `require` 函数加载和使用。本地模块允许开发者利用底层系统资源、提高性能，或者复用现有的 C/C++ 库，从而扩展 Node.js 的功能。

### 1. 为什么使用 Node 本地模块？

• **性能优化**：对于计算密集型任务，C/C++ 通常比 JavaScript 更高效。通过本地模块，可以显著提升性能。
• **访问底层系统资源**：有些功能需要直接与操作系统或硬件交互，JavaScript 本身无法做到这一点，而 C/C++ 可以。
• **复用现有库**：许多高性能的库是用 C/C++ 编写的，通过本地模块，可以在 Node.js 中直接使用这些库，而无需重新实现功能。
• **实现特定功能**：某些特定功能在 Node.js 的核心模块中未提供，可以通过本地模块来实现。

### 2. Node 本地模块的工作原理

Node 本地模块通过 **Node-API**（以前称为 **N-API**）或 **nan（Native Abstractions for Node.js）** 等抽象层与 Node.js 进行交互。这些抽象层提供了一组稳定的 C 接口，使得本地模块能够与不同版本的 Node.js 兼容。

当你在 JavaScript 中使用 `require('./myaddon.node')` 时，Node.js 会：

1. **加载二进制文件**：读取并加载 `.node` 文件到内存中。
2. **初始化模块**：调用模块的初始化函数，注册导出的函数和对象。
3. **返回模块对象**：将模块的导出内容作为 JavaScript 对象返回，供后续使用。

### 3. 创建一个简单的 Node 本地模块

以下是使用 **Node-API** 创建一个简单本地模块的步骤：

#### a. 环境准备

确保你已经安装了以下工具：

• **Node.js** 和 **npm**
• **Python**（通常需要版本 2.7 或 3.x，具体取决于 `node-gyp` 的要求）
• **C++ 编译器**：
  • **Windows**：Visual Studio 的 C++ 工具集
  • **macOS**：Xcode 命令行工具
  • **Linux**：GCC 或 Clang

#### b. 初始化项目

```bash
mkdir node-addon-example
cd node-addon-example
npm init -y
```

#### c. 安装构建工具

```bash
npm install --save-dev node-gyp
```

#### d. 创建 `binding.gyp` 文件

`binding.gyp` 是一个构建配置文件，用于指导 `node-gyp` 如何编译本地模块。

```json
{
  "targets": [
    {
      "target_name": "hello",
      "sources": [ "hello.cc" ]
    }
  ]
}
```

#### e. 编写 C++ 代码 (`hello.cc`)

```cpp
// hello.cc
#include <node_api.h>

// 一个简单的函数，返回 "Hello from C++!"
napi_value Hello(napi_env env, napi_callback_info info) {
    napi_status status;
    napi_value greeting;

    // 创建一个字符串
    status = napi_create_string_utf8(env, "Hello from C++!", NAPI_AUTO_LENGTH, &greeting);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Unable to create string");
        return NULL;
    }

    return greeting;
}

// 初始化模块并导出函数
napi_value Init(napi_env env, napi_value exports) {
    napi_status status;
    napi_value fn;

    // 创建一个函数引用
    status = napi_create_function(env, NULL, 0, Hello, NULL, &fn);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Unable to create function");
        return NULL;
    }

    // 将函数设置为导出的 'hello' 属性
    status = napi_set_named_property(env, exports, "hello", fn);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Unable to set property");
        return NULL;
    }

    return exports;
}

// 注册模块的初始化函数
NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
```

#### f. 编译本地模块

首先，确保全局安装了 `node-gyp`：

```bash
npm install -g node-gyp
```

然后，在项目根目录运行以下命令进行编译：

```bash
node-gyp configure
node-gyp build
```

编译成功后，会在 `build/Release` 目录下生成 `hello.node` 文件。

#### g. 在 JavaScript 中使用本地模块

创建一个 `index.js` 文件，并编写以下代码：

```javascript
// index.js
const addon = require('./build/Release/hello.node');

console.log(addon.hello()); // 输出: Hello from C++!
```

运行脚本：

```bash
node index.js
```

你应该会看到输出：

```
Hello from C++!
```

### 4. Node 本地模块的生命周期

1. **加载模块**：当使用 `require('./myaddon.node')` 时，Node.js 会查找并加载对应的 `.node` 文件。
2. **初始化模块**：调用模块中的初始化函数（通常是 `Init` 函数），该函数负责注册导出的函数和对象。
3. **使用模块**：导出的函数和对象可以在 JavaScript 中像普通模块一样使用。
4. **卸载模块**：当不再需要模块时，Node.js 会卸载它，释放相关资源（具体行为依赖于实现）。

### 5. 常用工具和库

• **node-gyp**：用于编译本地模块的构建工具，支持跨平台编译。
• **N-API**：Node.js 提供的一组稳定的 C 接口，用于编写本地模块，保证不同 Node.js 版本之间的兼容性。
• **nan (Native Abstractions for Node.js)**：提供更高层次的抽象，简化了本地模块的开发，但需要额外维护与 N-API 的兼容性。
• **node-addon-api**：基于 N-API 的 C++ 包装器，提供更方便的 C++ 接口来编写本地模块。

### 6. 注意事项

• **平台依赖性**：`.node` 文件是平台相关的，这意味着为一个平台编译的 `.node` 文件不能在另一个平台上运行。因此，跨平台发布时需要为每个目标平台编译相应的二进制文件。
• **Node.js 版本兼容性**：不同版本的 Node.js 可能有不同的 ABI（应用二进制接口），因此为特定 Node.js 版本编译的 `.node` 文件可能不兼容其他版本。使用 N-API 可以在一定程度上缓解这个问题，但仍需注意兼容性。
• **安全性**：本地模块具有更高的权限，可以直接访问系统资源，因此需要确保代码的安全性，避免引入漏洞。
• **调试复杂性**：调试本地模块比调试纯 JavaScript 代码更复杂，需要使用专门的工具和技术，如 GDB、LLDB 等。

### 7. 进阶示例：传递参数和返回复杂数据

以下示例展示如何在本地模块中接收 JavaScript 传递的参数，并返回复杂的数据结构。

#### a. 修改 C++ 代码 (`hello.cc`)

```cpp
// hello.cc
#include <node_api.h>
#include <vector>

// 一个函数，接收两个整数并返回它们的和
napi_value Add(napi_env env, napi_callback_info info) {
    napi_status status;
    size_t argc = 2;
    napi_value args[2];
    napi_value this_arg;
    status = napi_get_cb_info(env, info, &argc, args, &this_arg, NULL);

    if (status != napi_ok || argc < 2) {
        napi_throw_type_error(env, NULL, "Expected two numbers");
        return NULL;
    }

    int a, b;
    status = napi_get_value_int32(env, args[0], &a);
    if (status != napi_ok) {
        napi_throw_type_error(env, NULL, "Invalid number");
        return NULL;
    }

    status = napi_get_value_int32(env, args[1], &b);
    if (status != napi_ok) {
        napi_throw_type_error(env, NULL, "Invalid number");
        return NULL;
    }

    napi_value result;
    status = napi_create_int32(env, a + b, &result);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Unable to create result");
        return NULL;
    }

    return result;
}

// 一个函数，返回一个数组
napi_value GetArray(napi_env env, napi_callback_info info) {
    napi_status status;
    napi_value array;

    // 创建一个包含 3 个元素的数组
    status = napi_create_array_with_length(env, 3, &array);
    if (status != napi_ok) {
        napi_throw_error(env, NULL, "Unable to create array");
        return NULL;
    }

    // 设置数组元素
    int values[3] = {1, 2, 3};
    for (size_t i = 0; i < 3; ++i) {
        napi_value element;
        status = napi_create_int32(env, values[i], &element);
        if (status != napi_ok) {
            napi_throw_error(env, NULL, "Unable to create array element");
            return NULL;
        }
        status = napi_set_element(env, array, i, element);
        if (status != napi_ok) {
            napi_throw_error(env, NULL, "Unable to set array element");
            return NULL;
        }
    }

    return array;
}

// 初始化模块并导出函数
napi_value Init(napi_env env, napi_value exports) {
    napi_status status;
    napi_value fn_add, fn_getArray;

    // 导出 Add 函数
    status = napi_create_function(env, NULL, 0, Add, NULL, &fn_add);
    if (status != napi_ok) return NULL;
    status = napi_set_named_property(env, exports, "add", fn_add);
    if (status != napi_ok) return NULL;

    // 导出 GetArray 函数
    status = napi_create_function(env, NULL, 0, GetArray, NULL, &fn_getArray);
    if (status != napi_ok) return NULL;
    status = napi_set_named_property(env, exports, "getArray", fn_getArray);
    if (status != napi_ok) return NULL;

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
```

#### b. 重新编译模块

```bash
node-gyp rebuild
```

#### c. 使用导出的函数

修改 `index.js`：

```javascript
// index.js
const addon = require('./build/Release/hello.node');

const sum = addon.add(5, 7);
console.log(`Sum: ${sum}`); // 输出: Sum: 12

const arr = addon.getArray();
console.log(`Array: [${arr}]`); // 输出: Array: [1,2,3]
```

运行脚本：

```bash
node index.js
```

输出：

```
Sum: 12
Array: [1,2,3]
```

### 8. 使用 `node-addon-api` 简化开发（可选）

`node-addon-api` 是一个基于 N-API 的 C++ 包装器，提供了更方便的 C++ 接口来编写本地模块。以下是使用 `node-addon-api` 的示例。

#### a. 安装 `node-addon-api`

在项目中安装 `node-addon-api` 和 `node-gyp-build`：

```bash
npm install --save node-addon-api
npm install --save-dev node-gyp-build
```

#### b. 修改 `binding.gyp`

```json
{
  "targets": [
    {
      "target_name": "hello",
      "sources": [ "hello.cc" ],
      "include_dirs": [
        "<!(node -e \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -e \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }
  ]
}
```

#### c. 修改 `hello.cc` 使用 `node-addon-api`

```cpp
// hello.cc
#include <napi.h>

// 一个函数，接收两个数字并返回它们的和
Napi::Number Add(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Expected two numbers").ThrowAsJavaScriptException();
        return Napi::Number::New(env, 0);
    }

    double a = info[0].As<Napi::Number>().DoubleValue();
    double b = info[1].As<Napi::Number>().DoubleValue();
    double sum = a + b;

    return Napi::Number::New(env, sum);
}

// 初始化模块并导出函数
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "add"), Napi::Function::New(env, Add));
    return exports;
}

NODE_API_MODULE(hello, Init)
```

#### d. 编译模块

确保 `binding.gyp` 和 `hello.cc` 已正确配置，然后运行：

```bash
node-gyp rebuild
```

#### e. 使用模块

`index.js` 无需更改，仍可以使用之前的代码：

```javascript
const addon = require('./build/Release/hello.node');

const sum = addon.add(10, 20);
console.log(`Sum: ${sum}`); // 输出: Sum: 30
```

运行脚本：

```bash
node index.js
```

输出：

```
Sum: 30
```

### 9. 总结

**Node 本地模块** 是用 C/C++ 编写的模块，通过编译生成 `.node` 文件，供 Node.js 加载和使用。它们允许开发者利用底层系统资源、提高性能，或复用现有的 C/C++ 库。虽然编写和调试本地模块比纯 JavaScript 更复杂，但在需要高性能或访问底层功能时，本地模块是非常有用的工具。

### 10. 进一步学习资源

• **Node.js 官方文档**：
  • [Native Addons](https://nodejs.org/api/addons.html)
  • [N-API](https://nodejs.org/api/n-api.html)

• **node-gyp 文档**：
  • [node-gyp GitHub 仓库](https://github.com/nodejs/node-gyp)

• **node-addon-api 文档**：
  • [node-addon-api GitHub 仓库](https://github.com/nodejs/node-addon-api)

• **教程与示例**：
  • [Node Addons with N-API](https://github.com/nodejs/node-addon-api/tree/main/doc/tutorial)
  • [Writing Node.js Addons with C++](https://www.rust-lang.org/what/native-tls#writing-node-js-addons-with-c)

通过学习和实践，你可以掌握如何编写高效的 Node 本地模块，扩展 Node.js 的功能以满足特定需求。