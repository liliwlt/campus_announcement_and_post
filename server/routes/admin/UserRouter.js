//把所有与模型相关的路由都配置在这里

var express = require('express');
var UserRouter = express.Router();
// 2. 关键！引入 UserController
var UserController = require('../../controllers/admin/UserController');
//图片上传
const multer  = require('multer')
const upload = multer({ dest: 'public/avataruploads/' })         //要放在静态资源文件夹下


/* UserRouter.post("/adminapi/user/login",function(){}) 这样写很乱，把function函数放到controlled里 */

UserRouter.post("/adminapi/user/login",UserController.login)
//公开接口：注册与用户名查重（不需要登录）
UserRouter.get("/adminapi/user/checkusername",UserController.checkUserName)
UserRouter.post("/adminapi/user/register",UserController.register)
UserRouter.post("/adminapi/user/upload",upload.single('file'),UserController.upload)
UserRouter.post("/adminapi/user/add",upload.single('file'),UserController.add)
//绑定手机号（所有登录用户可用）
UserRouter.post("/adminapi/user/bindphone",UserController.bindPhone)
//实现用户列表的增删改查
UserRouter.get("/adminapi/user/list",UserController.getList)       //不用写upload.single('file')了，因为没有上传
UserRouter.delete("/adminapi/user/list/:id",UserController.delList)
//                                    -----占位符
UserRouter.get("/adminapi/user/list/:id",UserController.getList)
UserRouter.put("/adminapi/user/list/:id",UserController.putList)


/* UserRouter.get("/adminapi/user/home",(req,res)=>{      //这一句对应的前端在Home.vue
    res.send({ok:1})
}) */

module.exports = UserRouter;
