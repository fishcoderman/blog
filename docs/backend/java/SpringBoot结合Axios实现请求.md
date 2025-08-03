# SpringBoot结合Axios实现请求

## 前置Axios知识

Axios 会根据请求的数据类型自动设置 `Content-Type`。如果你在发送请求时不显式设置 `Content-Type`，Axios 会根据你传递的数据类型自动识别并添加合适的 `Content-Type`。

### 请求格式的区别

- **form-data**：
  - 多用于文件上传或包含二进制数据的表单。
  - 数据以键值对的形式发送，支持文件上传。
  - Content-Type: `multipart/form-data`。

- **x-www-form-urlencoded**：
  - 适用于简单表单数据的提交。
  - 数据以键值对的形式发送，所有字符都经过 URL 编码。
  - Content-Type: `application/x-www-form-urlencoded`。

- **application/json**：
  - 用于发送结构化数据，如 JSON 对象。
  - 数据以 JSON 格式发送，适合复杂的数据结构。
  - Content-Type: `application/json`。

### 自动设置 Content-Type 的情况：

1. **JSON 数据**：
   - 如果发送的是一个 JavaScript 对象（如使用 `axios.post('/url', data)`），Axios 会自动将 `Content-Type` 设置为 `application/json`。

   ```javascript
   axios.post('/api/submitJson', { name: 'John Doe', email: 'john@example.com' });
   // Content-Type: application/json
   ```

2. **FormData**：
   - 如果使用 `FormData` 对象（如 `new FormData()`）发送数据，Axios 会将 `Content-Type` 设置为 `multipart/form-data`，并会自动处理边界（boundary）。

   ```javascript
   const formData = new FormData();
   formData.append('file', myFile);
   axios.post('/api/upload', formData);
   // Content-Type: multipart/form-data; boundary=...
   ```

3. **URLSearchParams**：
   - 如果使用 `URLSearchParams`，Axios 会将 `Content-Type` 设置为 `application/x-www-form-urlencoded`。

   ```javascript
   const params = new URLSearchParams();
   params.append('name', 'John Doe');
   axios.post('/api/submitForm', params);
   // Content-Type: application/x-www-form-urlencoded
   ```

如果不设置 `Content-Type`，Axios 会根据发送的数据类型自动识别并添加相应的 `Content-Type`。这样可以减少手动设置的麻烦，确保请求的正确性。如果有特定的需求或想要强制使用某种类型，可以手动设置 `Content-Type`。

## 前后端代码案例
在 Spring Boot 中，可以接收来自前端的不同格式的请求，常见的有 `form-data`、`application/x-www-form-urlencoded` 和 `application/json`。下面是这三种请求的区别及实现示例。


###  案例实现

#### 1.1 服务端实现（Spring Boot）

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class ApiController {

    // 处理 form-data 请求
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<String> handleFileUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("description") String description) {
        // 处理文件和描述
        return ResponseEntity.ok("File uploaded: " + file.getOriginalFilename() + ", Description: " + description);
    }

    // 处理 x-www-form-urlencoded 请求
    @PostMapping(value = "/submitForm", consumes = "application/x-www-form-urlencoded")
    public ResponseEntity<String> handleFormSubmit(
            @RequestParam("name") String name,
            @RequestParam("email") String email) {
        // 处理表单数据
        return ResponseEntity.ok("Name: " + name + ", Email: " + email);
    }

    // 处理 JSON 请求
    @PostMapping(value = "/submitJson", consumes = "application/json")
    public ResponseEntity<String> handleJsonSubmit(@RequestBody User user) {
        // 处理 JSON 数据
        return ResponseEntity.ok("Received user: " + user.getName() + ", Email: " + user.getEmail());
    }
}

// 用户类
class User {
    private String name;
    private String email;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

#### 1.2 前端实现（使用 Axios）

```javascript
import axios from 'axios';

// 发送 form-data 请求
const uploadFile = async (file, description) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    const response = await axios.post('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    console.log(response.data);
};

// 发送 x-www-form-urlencoded 请求
const submitForm = async (name, email) => {
    const params = new URLSearchParams();
    params.append('name', name);
    params.append('email', email);
    
    const response = await axios.post('/api/submitForm', params);
    console.log(response.data);
};

// 发送 JSON 请求
const submitJson = async (user) => {
    const response = await axios.post('/api/submitJson', user, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(response.data);
};

// 示例调用
uploadFile(myFile, 'A sample file');
submitForm('John Doe', 'john@example.com');
submitJson({ name: 'Jane Doe', email: 'jane@example.com' });
```

### 总结

- **form-data**：适用于文件上传，使用 `@RequestParam` 处理。
- **x-www-form-urlencoded**：简单表单数据，使用 `@RequestParam` 处理。
- **application/json**：复杂数据结构，使用 `@RequestBody` 处理。

以上示例展示了如何在 Spring Boot 中处理不同格式的请求，以及如何通过 Axios 从前端发送这些请求。