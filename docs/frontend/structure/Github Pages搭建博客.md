### 使用github pages，编写静态网页
有很多文档网站是使用这种方式搭建，一般是作为demo页面或者单页文档页面，否则页面稍微一复杂，就变得非常难以维护。
### 使用issues 写文章
这种方式简单粗暴，直接在issues写文章，评论、标签、提醒神马的都有了，现在其实很流行这种方式，看看这几个博客，都几千个star了
* https://github.com/tmallfe/tmallfe.github.io
* https://github.com/lifesinger/blog
* https://github.com/xufei/blog
* https://github.com/fouber/blog
。
要说它的缺点嘛，就是人人都可以往你博客提交文章，界面千篇一律，而且也不怎么好看

### github pages

github Pages可以被认为是用户编写的、托管在github上的静态网页，如下方式可开启：

* 当仓库名称为{username}.github.io时自动生成github page首页，页面地址为 http://{username}.github.io
* 当仓库中有 gh-pages分支时会自动生成github pages，访问地址为：http://{username}.github.io/{reponame}
### github api
github 提供了一系列api可让用户操作数据，详细内容可到[api官网](https://developer.github.com/v3/)查看

### issues api
官方文档： https://developer.github.com/v3/issues/

列出了操作issues接口，我们暂时只用到 查看 功能。

列出issues
>GET https://api.github.com/repos/eyasliu/blog/issues

每条issues都有详细信息，包括标题、内容、标签、用户，时间等等信息。

可以使用查询过滤或排序issues，比如以最近评论时间排序

>GET https://api.github.com/repos/eyasliu/blog/issues?filter=updated

获取单条issues
>GET https://api.github.com/repos/eyasliu/blog/issues/1

注意：这里的1是指的是issues对象中的number而不是id

获取评论

>GET https://api.github.com/repos/eyasliu/blog/issues/1/comments

获取labels
labels可用作与 分类 或 标签 功能

>GET https://api.github.com/repos/eyasliu/blog/labels
