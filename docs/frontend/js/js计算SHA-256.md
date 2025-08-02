```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>计算文件 SHA-256</title>
  </head>
  <body>
    <h1>计算文件 SHA-256</h1>
    <input type="file" id="fileInput" />
    <button id="calculateBtn">计算SHA-256</button>
    <p id="result"></p>

    <script>
      document
        .getElementById("calculateBtn")
        .addEventListener("click", async () => {
          const fileInput = document.getElementById("fileInput");
          const file = fileInput.files[0];

          if (!file) {
            alert("请先选择一个文件");
            return;
          }

          const hashBuffer = await sha256(file);
          const hashArray = Array.from(new Uint8Array(hashBuffer)); // 将缓冲区转换为字节数组
          const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""); // 转换为十六进制字符串

          document.getElementById("result").textContent = `SHA-256: ${hashHex}`;
        });

      async function sha256(file) {
        const arrayBuffer = await file.arrayBuffer(); // 将文件读取为 ArrayBuffer
        return crypto.subtle.digest("SHA-256", arrayBuffer); // 计算 SHA-256 哈希
      }
    </script>
  </body>
</html>


```