# sanMPage 项目文档

## 项目概述

sanMPage 是一个基于 Node.js 的导航页面，旨在提供一个简洁的导航界面。用户可以通过配置文件自定义导航链接，并通过简单的身份验证访问该页面。

## 快速启动

### Node.js 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器（带热更新）
npm run dev

# 或直接运行
node index.js
```

### Docker 容器运行

```bash
# 构建Docker镜像

docker build -t sanmpage .

# 运行容器（映射3000端口）
docker run -p 3000:3000 sanmpage
```
**重要提醒：数据持久化**  
运行容器时，请确保映射`app/data`目录到宿主机目录，以持久化配置文件和导航数据。否则容器重启后所有配置将丢失。示例命令：

```bash
docker run -p 3000:3000 -v /path/to/your/data:/app/data sanmpage
```

将`/path/to/your/data`替换为宿主机上实际的data目录路径。
```

## 配置文件说明

### config.ini (服务端配置)

位置：`/data/config.ini`

**使用前重命名 config.example.js 为 config.ini**

配置项说明：

```ini
[server]
# 服务端口号
port = 3000

[user]
# 如果为*则不校验，但是这里不能删
name = *
password = *
```

示例 url：

```
http://localhost:300/?name=你的设置&password=你的设置
```

**配置为\*的话可不带对应参数**

### list.json (前端内容配置)

位置：`/data/web/list.json`

**使用前重命名 list.example.json 为 list.json**

配置结构示例：

```json
{
  "tips": "将文件重名名为list.json,然后修改其中的内容即可. 这行可以删掉",
  "title": "TITLE",
  "backgroundColor": "#1A1A1A",
  "fontColor": "#FFFEDA",
  "list": [
    {
      "name": "Lab1",
      "list": [
        {
          "name": "百度",
          "link": "https://www.baidu.com/"
        },
        {
          "name": "必应",
          "link": "https://www.bing.com/"
        }
      ]
    },
    {
      "name": "Lab2",
      "list": [
        {
          "name": "啊B",
          "link": "https://www.bilibili.com/"
        },
        {
          "name": "幻星",
          "link": "https://play-live.bilibili.com/"
        }
      ]
    }
  ]
}
```
