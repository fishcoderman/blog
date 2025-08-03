# Docker创建并MySQL容器

要在 Docker 中创建并启动一个 MySQL 容器，可以按照以下步骤进行操作。确保已经安装了 Docker，并且 Docker 服务正在运行。

### 1. 拉取 MySQL 镜像

首先，需要从 Docker Hub 拉取 MySQL 的官方镜像。可以选择特定版本或者使用最新版本：

```bash
docker pull mysql:latest
```

### 2. 创建并启动 MySQL 容器

使用 `docker run` 命令来创建和启动 MySQL 容器。下面是一个基本的命令示例：

```bash
docker run --name my-mysql-container -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
```

解释：
- `--name my-mysql-container`：指定容器的名称为 `my-mysql-container`。
- `-e MYSQL_ROOT_PASSWORD=my-secret-pw`：设置 MySQL 根用户的密码为 `my-secret-pw`。
- `-d`：以后台模式运行容器。
- `mysql:latest`：指定使用的 MySQL 镜像版本。

### 3. 其他常用选项

- **暴露端口**：如果需要从主机或其他容器访问 MySQL，可以使用 `-p` 选项映射端口：

  ```bash
  docker run --name my-mysql-container -e MYSQL_ROOT_PASSWORD=my-secret-pw -p 3306:3306 -d mysql:latest
  ```

  这将 MySQL 容器的 3306 端口映射到主机的 3306 端口。

- **持久化数据**：使用卷挂载来持久化数据库数据：

  ```bash
  docker run --name my-mysql-container -e MYSQL_ROOT_PASSWORD=my-secret-pw -p 3306:3306 -v /my/local/data:/var/lib/mysql -d mysql:latest
  ```

  这会将主机 `/my/local/data` 目录挂载到容器的 `/var/lib/mysql` 目录，从而持久化数据。

### 4. 验证 MySQL 容器

启动容器后，可以查看正在运行的容器：

```bash
docker ps
```

应该能看到 `my-mysql-container` 正在运行。

### 5. 连接到 MySQL 容器

可以通过以下命令连接到 MySQL 容器的终端并使用 MySQL 客户端：

```bash
docker exec -it my-mysql-container mysql -uroot -p
```

输入设置的根密码（`my-secret-pw`），即可进入 MySQL 命令行界面。

通过这些步骤，可以轻松地在 Docker 中创建并运行一个 MySQL 容器。根据需要，可以调整命令中的参数以适应的特定应用场景。