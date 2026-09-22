var express = require('express');
var ProductRouter = express.Router();
var ProductController = require('../../controllers/admin/ProductController');
var CommentController = require('../../controllers/admin/CommentController');

//导入中间件
const multer  = require('multer')
const upload = multer({ dest: 'public/Productuploads/' })

//涉及到文件上传，普通的post不行，需要加multer中间件
ProductRouter.post("/adminapi/product/add",upload.single("file"),ProductController.add)
ProductRouter.get(`/adminapi/product/showlist`,ProductController.getshowlist)
ProductRouter.get(`/adminapi/product/showlist/:id`,ProductController.getshowlist)
ProductRouter.get(`/adminapi/product/list`,ProductController.getlist)
ProductRouter.get(`/adminapi/product/list/:id`,ProductController.getlist)
ProductRouter.delete(`/adminapi/product/list/:id`,ProductController.delList)

ProductRouter.post("/adminapi/product/list",upload.single("file"),ProductController.updatelist)

//帖子评论
ProductRouter.post("/adminapi/comment/add",CommentController.add)
ProductRouter.get("/adminapi/comment/list/:postId",CommentController.getlist)
ProductRouter.delete("/adminapi/comment/:id",CommentController.del)

module.exports = ProductRouter