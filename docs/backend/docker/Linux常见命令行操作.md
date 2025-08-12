# Linux常见命令行操作

本文介绍一些常用的Linux命令。

## 文件和目录操作

### `ls`

`ls` 命令用于列出目录中的文件和子目录。 <mcreference link="https://www.runoob.com/w3cnote/linux-common-command-2.html" index="2">2</mcreference>

常用选项：
* `-a`: 显示所有文件，包括以`.`开头的隐藏文件。 <mcreference link="https://www.runoob.com/w3cnote/linux-common-command-2.html" index="2">2</mcreference>
* `-l`: 使用长格式显示文件信息，包括权限、所有者、大小和修改时间。 <mcreference link="https.://www.runoob.com/w3cnote/linux-common-command-2.html" index="2">2</mcreference>
* `-h`: 以人类可读的格式显示文件大小 (例如，KB, MB, GB)。 <mcreference link="https://www.runoob.com/w3cnote/linux-common-command-2.html" index="2">2</mcreference>

### `cd`

`cd` 命令用于切换当前工作目录。

* `cd ~`: 切换到主目录。
* `cd ..`: 切换到上一级目录。
* `cd /path/to/directory`: 切换到指定目录。

### `pwd`

`pwd` 命令用于显示当前工作目录的路径。

### `mkdir`

`mkdir` 命令用于创建新目录。

* `mkdir new_directory`: 创建一个名为 `new_directory` 的新目录。
* `mkdir -p /path/to/new_directory`: 递归地创建目录，如果父目录不存在，也会一并创建。

### `rm`

`rm` 命令用于删除文件和目录。

* `rm file.txt`: 删除一个名为 `file.txt` 的文件。
* `rm -r directory`: 递归地删除一个目录及其所有内容。
* `rm -f file.txt`: 强制删除文件，不进行提示。

### `cp`

`cp` 命令用于复制文件和目录。

* `cp source.txt destination.txt`: 将 `source.txt` 复制为 `destination.txt`。
* `cp -r source_directory destination_directory`: 递归地复制整个目录。

### `mv`

`mv` 命令用于移动或重命名文件和目录。

* `mv old_name.txt new_name.txt`: 将 `old_name.txt` 重命名为 `new_name.txt`。
* `mv file.txt /path/to/destination`: 将 `file.txt` 移动到指定目录。

## 文件内容操作

### `cat`

`cat` 命令用于查看文件内容。

* `cat file.txt`: 显示 `file.txt` 的全部内容。

### `less`

`less` 命令用于分页查看文件内容，对于大文件非常有用。

* `less large_file.txt`: 分页显示 `large_file.txt` 的内容。

### `head`

`head` 命令用于查看文件的开头部分。

* `head -n 20 file.txt`: 显示 `file.txt` 的前20行。

### `tail`

`tail` 命令用于查看文件的结尾部分。

* `tail -n 20 file.txt`: 显示 `file.txt` 的后20行。
* `tail -f log_file.txt`: 实时跟踪 `log_file.txt` 的更新，常用于查看日志文件。

## 系统信息

### `df`

`df` 命令用于显示磁盘空间使用情况。

* `df -h`: 以人类可读的格式显示磁盘空间。

### `du`

`du` 命令用于显示文件或目录的磁盘使用情况。

* `du -sh /path/to/directory`: 以人类可读的格式显示指定目录的总大小。

### `top`

`top` 命令用于实时显示系统进程和资源使用情况。

### `ps`

`ps` 命令用于显示当前用户的进程。

* `ps aux`: 显示所有用户的进程，包括详细信息。

## 网络

### `ping`

`ping` 命令用于测试与另一台主机的网络连接。

* `ping google.com`: 测试与 `google.com` 的连接。

### `ifconfig` / `ip`

`ifconfig` (较旧) 或 `ip addr` (较新) 命令用于显示和配置网络接口。