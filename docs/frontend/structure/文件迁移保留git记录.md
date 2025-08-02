将一个 Git 项目的文件迁移到新项目中，同时保留所有的 `commit` 记录，是一个常见的需求。可以通过几种方法实现这一目标。下面是一个常见的做法，利用 Git 的 **subtree merge** 或 **filter-branch** 来保留历史记录。

### 方法一：使用 `git remote add` 和 `git pull`（推荐）
这种方法通过将旧项目的 Git 历史记录作为远程库添加到新项目中，然后将代码拉取到新项目，从而保留所有提交记录。

#### 步骤：
1. **在新项目中初始化一个 Git 仓库：**

   ```bash
   mkdir new-project
   cd new-project
   git init
   ```

2. **将旧项目添加为远程仓库：**
   
   假设旧项目的 Git 仓库地址是 `old-project-repo-url`，你需要将它作为远程仓库添加到新项目中。

   ```bash
   git remote add old-project <old-project-repo-url>
   ```

3. **拉取旧项目的所有分支和提交记录：**

   你可以拉取旧项目的所有内容到新项目中，确保包括所有历史记录。

   ```bash
   git fetch old-project
   ```

4. **将旧项目的文件合并到新项目中：**

   选择一个合适的分支（例如 `master` 或 `main`）来将旧项目的文件和提交记录合并到新项目中。

   ```bash
   git pull old-project master --allow-unrelated-histories
   ```

   这样，旧项目的所有提交记录会被合并到新项目中。

5. **处理合并冲突：**

   如果在合并时遇到文件冲突，需要手动解决冲突并提交。

6. **推送到新远程仓库：**

   如果已经创建了一个新的 Git 仓库并将其设置为远程仓库（假设是 `new-repo-url`），可以将新项目的所有内容推送到新仓库。

   ```bash
   git remote add origin <new-repo-url>
   git push -u origin master
   ```

### 方法二：使用 `git filter-repo` （适用于迁移部分目录）

如果只想迁移旧项目的一部分文件，并且要保留历史记录，可以使用 `git filter-repo` 工具（是 `git filter-branch` 的替代工具）来提取部分目录或文件，并将其迁移到新项目中。

#### 步骤：
1. **安装 `git-filter-repo` 工具：**

   如果没有安装 `git-filter-repo`，可以通过以下命令安装：

   ```bash
   pip install git-filter-repo
   ```

2. **克隆旧项目：**

   首先，克隆旧项目到本地：

   ```bash
   git clone <old-project-repo-url>
   cd old-project
   ```

3. **过滤目录并保留历史：**

   使用 `git filter-repo` 来保留特定目录（例如 `folder_name`）的历史记录：

   ```bash
   git filter-repo --subdirectory-filter folder_name
   ```

   这会将仓库的历史记录精简为仅包含 `folder_name` 目录的内容，其他内容会被删除。

4. **将文件迁移到新项目中：**

   然后，将过滤后的代码添加到新项目中。

   可以将其复制到新项目的文件夹中，然后通过 `git add` 和 `git commit` 记录历史：

   ```bash
   cd ../new-project
   git remote add old-project <old-project-repo-url>
   git fetch old-project
   git checkout old-project/master -- .
   git commit -m "Migrate folder_name from old project"
   ```

5. **推送到新远程仓库：**

   最后，将内容推送到新项目的远程仓库。

   ```bash
   git push -u origin master
   ```

### 方法三：使用 `git subtree` （适合迁移部分目录）

如果需要迁移旧项目的部分目录，并希望保留历史记录，可以使用 `git subtree`。

#### 步骤：
1. **在新项目中初始化 Git 仓库：**

   ```bash
   mkdir new-project
   cd new-project
   git init
   ```

2. **添加旧项目作为远程仓库：**

   ```bash
   git remote add old-project <old-project-repo-url>
   ```

3. **拉取旧项目的代码：**

   ```bash
   git fetch old-project
   ```

4. **使用 `git subtree` 合并旧项目的子目录：**

   假设想迁移的目录是 `folder_name`，可以使用以下命令将旧项目的子目录历史合并到新项目中：

   ```bash
   git subtree pull --prefix=folder_name old-project master --squash
   ```

   这个命令会将 `folder_name` 目录从 `old-project` 仓库的 `master` 分支拉取到新项目中，并保留历史记录。

5. **推送到新远程仓库：**

   最后，将新项目的所有内容推送到远程仓库：

   ```bash
   git remote add origin <new-repo-url>
   git push -u origin master
   ```

### 总结：

- **如果想迁移整个项目的所有历史记录**，最简单的方法是将旧项目作为远程仓库添加到新项目中，使用 `git pull` 将代码和历史记录合并到新项目中。
- **如果只想迁移项目的部分内容（例如某个文件夹）**，可以使用 `git filter-repo` 或 `git subtree` 来提取部分内容并保留历史记录。