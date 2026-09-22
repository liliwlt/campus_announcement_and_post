# 校园公告和兴趣帖子交流 - uni-app 后台管理端

基于 uni-app + Vue3 + uni-ui 构建的后台管理系统，复用原项目的 Express + MongoDB 后端 API。

## 技术栈

- **框架**: uni-app (Vue 3 + Vite)
- **UI 组件库**: uni-ui (@dcloudio/uni-ui)
- **状态管理**: Pinia
- **后端**: 复用原项目 `server/` 下的 Express + MongoDB 服务（端口 3000）

## 项目结构

```
uni-admin/
├── src/
│   ├── api/
│   │   └── request.js          # 请求封装（对应原 axios.config.js）
│   ├── components/
│   │   └── upload/
│   │       └── Upload.vue      # 图片上传组件
│   ├── pages/
│   │   ├── login/login.vue          # 登录页
│   │   ├── home/home.vue            # 首页
│   │   ├── center/center.vue        # 个人中心
│   │   ├── user-manage/
│   │   │   ├── useradd.vue         # 添加用户
│   │   │   └── userlist.vue        # 用户列表
│   │   ├── news-manage/
│   │   │   ├── newsadd.vue         # 创建新闻
│   │   │   ├── newslist.vue        # 新闻列表
│   │   │   └── newsedit.vue        # 编辑新闻
│   │   ├── product-manage/
│   │   │   ├── productadd.vue      # 添加产品
│   │   │   ├── productlist.vue     # 产品列表
│   │   │   └── productedit.vue     # 编辑产品
│   │   └── notfound/tokenlose.vue  # 登录失效页
│   ├── store/
│   │   └── user.js             # 用户信息状态管理（Pinia）
│   ├── utils/
│   │   ├── upload.js           # 文件上传封装
│   │   ├── formatTime.js       # 时间格式化
│   │   └── image.js            # 图片地址拼接
│   ├── App.vue                 # 根组件
│   ├── main.js                # 入口文件
│   ├── manifest.json          # 应用配置
│   ├── pages.json             # 页面路由配置
│   └── uni.scss               # 全局样式变量
├── index.html
├── package.json
└── vite.config.js
```

## 快速开始

### 1. 安装依赖

```bash
cd uni-admin
npm install
```

### 2. 启动后端服务

确保 MongoDB 已运行，然后启动原项目的后端：

```bash
cd ../server
npm start
```

后端服务运行在 `http://localhost:3000`。

### 3. 启动 uni-app 前端

#### H5 端（浏览器）

```bash
npm run dev:h5
```

浏览器访问 `http://localhost:8080`，H5 环境下通过 Vite proxy 自动转发 `/adminapi` 请求到后端。

#### 微信小程序

```bash
npm run dev:mp-weixin
```

然后用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

> 注意：小程序环境下需要在微信开发者工具中关闭"不校验合法域名"（设置 -> 项目设置 -> 勾选）。

## 后端 API 接口

复用原项目后端，主要接口如下：

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 用户 | POST | /adminapi/user/login | 登录 |
| 用户 | POST | /adminapi/user/upload | 更新个人信息 |
| 用户 | POST | /adminapi/user/add | 添加用户 |
| 用户 | GET | /adminapi/user/list | 用户列表 |
| 用户 | GET | /adminapi/user/list/:id | 单个用户 |
| 用户 | PUT | /adminapi/user/list/:id | 更新用户 |
| 用户 | DELETE | /adminapi/user/list/:id | 删除用户 |
| 新闻 | POST | /adminapi/news/add | 添加新闻 |
| 新闻 | GET | /adminapi/news/list | 新闻列表 |
| 新闻 | GET | /adminapi/news/list/:id | 单条新闻 |
| 新闻 | PUT | /adminapi/news/publish | 发布/取消发布 |
| 新闻 | DELETE | /adminapi/news/list/:id | 删除新闻 |
| 新闻 | POST | /adminapi/news/list | 更新新闻 |
| 产品 | POST | /adminapi/product/add | 添加产品 |
| 产品 | GET | /adminapi/product/list | 产品列表 |
| 产品 | GET | /adminapi/product/list/:id | 单个产品 |
| 产品 | DELETE | /adminapi/product/list/:id | 删除产品 |
| 产品 | POST | /adminapi/product/list | 更新产品 |

## 与原 admin 项目的对应关系

| 原 admin 项目 | uni-admin 项目 | 说明 |
|--------------|----------------|------|
| Vue Router | pages.json + uni.navigateTo | uni-app 使用配置式路由 |
| Vuex | Pinia | 状态管理 |
| axios | uni.request 封装 | 请求库 |
| Element Plus | uni-ui | UI 组件库 |
| wangeditor | textarea + rich-text | 富文本编辑器 |
| localStorage | uni.setStorageSync | 本地存储 |
| FormData 文件上传 | uni.uploadFile | 文件上传 |
