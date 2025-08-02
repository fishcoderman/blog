在 Flutter 中，`WebView` 与 `JavaScript` 之间的通信是通过特定的机制和方法实现的，允许 Flutter 应用与嵌入的网页内容进行双向数据交换。以下为你详细介绍 Flutter 的 `WebView` 与 JavaScript 通信的方式：

### 1. 依赖库
通常使用官方 `webview_flutter` 插件来实现 `WebView` 功能，（不过目前更多的反而是用flutter_inappwebview 插件）在 `pubspec.yaml` 文件中添加依赖：
```yaml
dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.0.7 # 版本号可根据实际情况调整
```

### 2. 从 Flutter 调用 JavaScript 代码
• **基本原理**：Flutter 层通过 `WebView` 组件提供的方法，将 JavaScript 代码字符串发送给原生层，原生层的 `WebView` 实例会在加载的网页环境中执行这段 JavaScript 代码。
• **示例代码**：
```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class FlutterToJs extends StatefulWidget {
  @override
  _FlutterToJsState createState() => _FlutterToJsState();
}

class _FlutterToJsState extends State<FlutterToJs> {
  late WebViewController _controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter to JS Communication'),
      ),
      body: WebView(
        initialUrl: 'about:blank',
        javascriptMode: JavascriptMode.unrestricted,
        onWebViewCreated: (WebViewController webViewController) {
          _controller = webViewController;
          // 加载本地 HTML 文件或远程 URL
          _controller.loadUrl('https://example.com'); 
        },
        onPageFinished: (String url) {
          // 页面加载完成后执行 JavaScript 代码
          _controller.runJavascript(
            "alert('Hello from Flutter!');",
          );
        },
      ),
    );
  }
}
```
在上述代码中，当页面加载完成后，通过 `runJavascript` 方法执行了一段简单的 JavaScript 代码 `alert('Hello from Flutter!');`。

### 3. 从 JavaScript 调用 Flutter 方法
• **基本原理**：在原生层（iOS 或 Android）注入一个 JavaScript 接口对象，JavaScript 代码可以通过这个接口对象调用 Flutter 层的方法。Flutter 层通过监听相应事件来接收并处理来自 JavaScript 的调用。
• **示例代码**：
```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class JsToFlutter extends StatefulWidget {
  @override
  _JsToFlutterState createState() => _JsToFlutterState();
}

class _JsToFlutterState extends State<JsToFlutter> {
  late WebViewController _controller;
  bool _isJsCalled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('JS to Flutter Communication'),
      ),
      body: Column(
        children: [
          Expanded(
            child: WebView(
              initialUrl: 'about:blank',
              javascriptMode: JavascriptMode.unrestricted,
              onWebViewCreated: (WebViewController webViewController) {
                _controller = webViewController;
                // 注入 JavaScript 通道
                _controller.addJavascriptChannels(
                  Set.from([
                    JavascriptChannel(
                      name: 'flutterChannel',
                      onMessageReceived: (JavascriptMessage message) {
                        setState(() {
                          _isJsCalled = true;
                          // 处理从 JavaScript 接收到的消息
                          print('Message from JS: ${message.message}');
                        });
                      },
                    ),
                  ]),
                );
                _controller.loadUrl('data:text/html;charset=utf-8,'
                    '<html>'
                    '<body>'
                    '<button onclick="sendToFlutter()">Send to Flutter</button>'
                    '<script>'
                    'function sendToFlutter() {'
                    '  flutterChannel.postMessage("Hello from JavaScript!");'
                    '}'
                    '</script>'
                    '</body>'
                    '</html>');
              },
            ),
          ),
          SizedBox(
            height: 50,
            child: Text(
              _isJsCalled ? 'JS has called Flutter!' : '',
              style: TextStyle(fontSize: 18),
            ),
          ),
        ],
      ),
    );
  }
}
```
在上述代码中：
    ◦ 首先通过 `addJavascriptChannels` 方法注入了一个名为 `flutterChannel` 的 JavaScript 通道，并指定了消息接收回调函数。
    ◦ 在加载的 HTML 页面中，定义了一个按钮，点击按钮时会调用 `sendToFlutter` 函数，该函数通过 `flutterChannel.postMessage` 方法向 Flutter 层发送消息。
    ◦ Flutter 层接收到消息后，更新状态显示相应信息。

### 4. 注意事项
• **JavaScript 模式**：确保 `WebView` 的 `javascriptMode` 设置为 `JavascriptMode.unrestricted` 以允许执行 JavaScript 代码，但要注意潜在的安全风险。
• **平台差异**：虽然 `webview_flutter` 插件封装了大部分跨平台的细节，但在某些特殊情况下，可能需要针对 iOS 和 Android 平台进行一些细微的调整和适配 。