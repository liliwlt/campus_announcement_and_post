路由配置信息


app.js:挂载路由   在这里面统一地注册路由，路由放在routes文件的admin ,web中

routes：admin ,web

controllers：admin ,web     具体的函数处理逻辑放在controllers，拿到前端数据，处理加工，进行调用数据层（services）


index.js：路由逻辑

services：引用创建的数据库模型，进行数据的增删改查具体操作

models：创建数据库模型





使用mvc模式：经典的软件设计模式，它把程序代码分成 Model（模型）、View（视图）、Controller（控制器） 三部分，
        目的是让代码更清晰、好维护、好扩展。