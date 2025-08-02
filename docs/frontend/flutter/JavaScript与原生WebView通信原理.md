JavaScript 与原生 `WebView` 之间的通信并非单纯通过代理拦截来实现，在不同的平台（如 Android 和 iOS）上，采用了不同的技术和机制来完成这种跨语言、跨环境的交互，下面为你详细介绍：

### Android 平台
• **注入 JavaScript 接口（addJavascriptInterface）**
    ◦ **原理**：这是 Android 中实现 JavaScript 与原生 `WebView` 通信的主要方式之一，并非基于代理拦截。开发者可以通过 `WebView` 的 `addJavascriptInterface` 方法将一个 Java 对象注入到 `WebView` 中，这个 Java 对象的方法可以被 JavaScript 调用。JavaScript 代码可以通过特定的对象名称来访问这个 Java 对象的方法，从而实现从 JavaScript 调用原生代码。
    ◦ **示例代码**：
```java
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        webView.getSettings().setJavaScriptEnabled(true);

        // 注入 Java 对象到 WebView
        webView.addJavascriptInterface(new WebAppInterface(), "Android");

        webView.loadUrl("file:///android_asset/index.html");
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void showToast(String message) {
            // 原生代码处理 JavaScript 调用
        }
    }
}
```
在上述 Java 代码中，`WebAppInterface` 类被注入到 `WebView` 中，JavaScript 可以通过 `Android.showToast('some message')` 来调用 `showToast` 方法。

 • **shouldOverrideUrlLoading 拦截 URL 加载（代理拦截类似机制）**
    ◦ **原理**：这是一种相对早期的通信方式，通过重写 `WebViewClient` 的 `shouldOverrideUrlLoading` 方法来拦截 `WebView` 中的 URL 加载请求。JavaScript 可以通过加载特定的自定义协议 URL（如 `myapp://action?param=value`）来触发原生代码的处理逻辑，原生代码在 `shouldOverrideUrlLoading` 方法中识别这些自定义 URL 并进行相应处理。这种方式有点类似于代理拦截 URL 请求的概念，但实际上是 Android 系统提供的标准机制用于处理自定义协议。
    ◦ **示例代码**：
```java
webView.setWebViewClient(new WebViewClient() {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url.startsWith("myapp://")) {
            // 处理自定义协议 URL
            return true; // 表示已经处理该 URL，不再继续加载
        }
        return super.shouldOverrideUrlLoading(view, url);
    }
});
```

### iOS 平台
 • **WKScriptMessageHandler 协议**
    ◦ **原理**：在 iOS 的 `WKWebView` 中，主要通过 `WKScriptMessageHandler` 协议来实现 JavaScript 与原生的通信，并非代理拦截。开发者需要创建一个遵循 `WKScriptMessageHandler` 协议的类，并实现 `userContentController:didReceiveScriptMessage:` 方法。然后通过 `WKUserContentController` 将这个处理类注册到 `WKWebView` 中，同时 JavaScript 可以通过 `window.webkit.messageHandlers.<messageHandlerName>.postMessage(<message>)` 来发送消息给原生代码。
    ◦ **示例代码**：
```swift
import UIKit
import WebKit

class ViewController: UIViewController, WKScriptMessageHandler {
    var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        let contentController = WKUserContentController()
        contentController.add(self, name: "nativeHandler")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController

        webView = WKWebView(frame: self.view.frame, configuration: config)
        self.view.addSubview(webView)

        // 加载网页...
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "nativeHandler" {
            if let messageBody = message.body as? String {
                // 处理从 JavaScript 接收到的消息
            }
        }
    }
}
```
在上述 Swift 代码中，`ViewController` 遵循 `WKScriptMessageHandler` 协议，并注册了一个名为 `nativeHandler` 的消息处理器，JavaScript 可以通过 `window.webkit.messageHandlers.nativeHandler.postMessage('Hello from JS')` 来触发原生代码中的 `userContentController:didReceiveScriptMessage:` 方法。

综上所述，JavaScript 与原生 `WebView` 之间的通信主要依靠各自平台提供的标准通信机制，虽然某些方式在概念上可能与代理拦截有相似之处，但实际上是专门为跨语言交互设计的不同实现方式 。