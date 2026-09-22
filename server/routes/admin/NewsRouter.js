var express = require('express');
var NewsRouter = express.Router();
var NewsController = require('../../controllers/admin/NewsController');

//导入中间件
const multer  = require('multer')
const upload = multer({ dest: 'public/newsuploads/' })   

//涉及到文件上传，普通的post不行，需要加multer中间件
NewsRouter.post("/adminapi/news/add",upload.single("file"),NewsController.add)
NewsRouter.get(`/adminapi/news/list`,NewsController.getlist)
NewsRouter.get(`/adminapi/news/list/:id`,NewsController.getlist)
NewsRouter.get(`/adminapi/news/readlist`,NewsController.getreadlist)
NewsRouter.get(`/adminapi/news/readlist/:id`,NewsController.getreadlist)
NewsRouter.put(`/adminapi/news/publish`,NewsController.publish)
NewsRouter.delete(`/adminapi/news/list/:id`,NewsController.delList)

NewsRouter.post("/adminapi/news/list",upload.single("file"),NewsController.updatelist)

module.exports = NewsRouter