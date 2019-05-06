## git提交显示名字
使用 git push 的时候，git 上显示的是真名，是因为跟公司的 gitlab 冲突了，这显然不是我想要的结果。

还好 git 的每个仓库可以单独配置：

```shell
git config --global user.name blacker
```

之后的提交就显示 blacker 而不是真名了。

## git每次push都需要输入账号密码
修改`.git/config`文件，以保存账号密码：
```
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
    logallrefupdates = true
[remote "origin"]
    url = https://github.com/Miss-you/kernel-netfilter-sample-code.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
    remote = origin
    merge = refs/heads/master
## 新增如下两行
[credential]
    helper = store
```

## 安装依赖后启动时报错
按照官方命令:
```

```
运行后报错：

```
There might be a problem with the project dependency tree.
It is likely not a bug in Create React App, but something you need to fix locally.

The react-scripts package provided by Create React App requires a dependency:

  "babel-jest": "24.7.1"

...

To fix the dependency tree, try following the steps below in the exact order:

  1. ...

In most cases, this should be enough to fix the problem.
If this has not helped, there are a few other things you can try:
...

  7. Try running npm ls babel-jest in your project folder.
     This will tell you which other package (apart from the expected react-scripts) installed babel-jest.

If nothing else helps, add SKIP_PREFLIGHT_CHECK=true to an .env file in your project.
That would permanently disable this preflight check in case you want to proceed anyway.

P.S. We know this message is long but please read the steps above :-) We hope you find them helpful!
```

省略了一部分内容，按照提示的1,2,3,4操作后并没有什么卵用。

这个错误不是react脚手架的错误，是npm包依赖冲突。根据错误提示，是`babel-jest`这个包出现了问题，运行`npm ls babel-jest` ：
```
my-app@0.1.0 D:\s\My React Blog
`-- react-scripts@3.0.0
  +-- babel-jest@24.7.1
  `-- jest@24.7.1
    `-- jest-cli@24.8.0
      `-- jest-config@24.8.0
        `-- babel-jest@24.8.0
```
可以发现`react-scripts@3.0.0`依赖`babel-jest@24.7.1`和`jest@24.7.1` 而`jest`中的一些依赖又依赖包`babel-jest@24.8.0` 这就导致了版本冲突，卸载其中一个即可：
```
npm uninstall babel-jest@24.8.0
```
