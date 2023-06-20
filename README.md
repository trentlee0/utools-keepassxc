# utools-keepassxc

一个 KeePassXC 的 uTools 插件，通过 KeePassXC CLI 快速搜索 KeePass 数据库中的账号和密码并输入、生成密码。

## 安装

在 [Releases](https://github.com/trentlee0/utools-keepassxc/releases) 页面下载。

## 特性

1. 根据标题或群组进行搜索

2. 支持多关键词搜索，使用空格分开

3. 搜索当前网站下的账号

4. 密码生成器

## 配置

1. 本插件依赖 [KeePassXC](https://keepassxc.org/)（一款免费开源的跨平台密码管理器），首先需要下载并安装它
2. 进入插件配置以下信息
   - 数据库文件路径
   - 数据库密码
   - 密钥文件路径（可选）
   - KeePassXC 位置
3. 可以使用啦

## 快捷键

- 自动输入（如有用户名或密码）：`Enter`
- 复制用户名：`Ctrl`/`Cmd` + `B`
- 复制密码：`Ctrl`/`Cmd` + `C`
- 复制 URL：`Ctrl`/`Cmd` + `U`
- 打开 URL：`Ctrl`/`Cmd` + `Shift` + `U`
- 复制标题：`Ctrl`/`Cmd` + `I`
- 复制 TOTP：`Ctrl`/`Cmd` + `T`

## 感谢

- [KeepassXC Extension for Raycast](https://github.com/raycast/extensions/blob/f9501ceb951d6ea029e47c974f99a27d3e9dd5ab/extensions/keepassxc/README.md)
- [[分享] 关于模板插件自定义设置界面的其中一种做法](https://yuanliao.info/d/3979)
