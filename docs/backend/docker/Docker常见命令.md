# Docker常见命令

### docker 操作

```bash
从docker库中下载镜像：
> docker pull tomcat

查看docker下载的镜像内容：
> docker images

下载指定的镜像版本：
> docker images tomcat:9

启动tomcat:
> docker run –p 8080:8080 tomcat

查看所有的容器
> docker ps 

查看当前运行的容器
> docker ps -a

启动容器
> docker start 容器名/容器 ID

停止容器
> docker stop 9be696a0c283 //停止正在运行容器（或Ctrl+c）
> docker container stop tomcat1//停止正运行容器(ID或Names)

重启已关闭容器
> docker restart 9be696a0c283//启动容器（根据ID或NAMES）

关闭和删除容器
> docker rm 容器ID

docker run 参数 镜像名称:tag 执⾏的命令 常⽤参数:
- i 保持和 docker 容器内的交互，启动容器时，运⾏的命令结束后，容器依然存活，没有退出（默认是会退出，即停⽌的）
- t 为容器的标准输⼊虚拟⼀个tty
- d 后台运⾏容器
--rm 容器在启动后，执⾏完成命令或程序后就销毁
--name 给容器起⼀个⾃定义名称
-p 宿主机：内部端口

docker run --rm -d --name tomcat1 -p 8080:8080 tomcat

docker exec -it nginx-80 bash //进入容器名称叫nginx-80

whereis nginx
/usr/sbin/nginx /usr/lib/nginx /etc/nginx /usr/share/nginx
// 其中倒二的 /etc/nginx 为配置目录  /usr/share/nginx为静态资源目录 在html文件夹底下

docker cp nginx-80:/usr/share/nginx/html /root // 容器内部复制文件到 外部
docker cp index.html nginx-80:/usr/share/nginx/html // 外部复制文件到容器

数据卷 // 能共享外部和容器内的文件，外部文件更改会实时同步到容器内
docker run --rm -d --name tomcat-8081 -p 8081:8080 -v
/usr/local/docker/qfnj/:/usr/local/tomcat/webapps/qfnj tomcat

```
