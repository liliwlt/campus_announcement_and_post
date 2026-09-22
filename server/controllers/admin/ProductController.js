const ProductService = require("../../services/admin/ProductService")
const DeleteLogModel = require("../../models/DeleteLogModel")

const ProductController = {
    add:async(req,res)=>{
        //管理员不能发布帖子
        if(req.user && req.user.role === 1){
            return res.status(403).send({ActionType:"error",error:"管理员不能发布帖子"})
        }
        const cover = req.file ? `/Productuploads/${req.file.filename}` : ""
        const {title,introduction,detail} = req.body
        //发布者 = 当前登录用户
        const uploader = req.user ? req.user.username : ""

        await ProductService.add({
            title,introduction,detail,cover,uploader,
            editTime:new Date()
        })
        res.send({
            ActionType:"ok"
        })
    },
    getlist:async(req,res)=>{
        //管理员看全部；普通用户只看自己发布的
        const params = {
            _id:req.params.id,
            uploader:req.user ? req.user.username : "",
            role:req.user ? req.user.role : 2
        }
        const result = await ProductService.getlist(params)
        res.send({
            ActionType:"ok",
            data:result
        })
    },
    getshowlist:async(req,res)=>{
        //帖子广场列表：所有角色都能看未删除的帖子
        //帖子详情（单条）：已删除的帖子只有发布者本人和管理员可见
        const role = req.user ? req.user.role : 2
        const username = req.user ? req.user.username : ""
        const result = await ProductService.getshowlist(req.params.id, role, username)
        res.send({
            ActionType:"ok",
            data:result
        })
    },
    delList:async(req,res)=>{
        const _id = req.params.id
        const role = req.user ? req.user.role : 2
        const username = req.user ? req.user.username : ""
        //管理员删除必须填写驳回原因（普通用户自删不需要）
        const deletereason = req.body ? req.body.deletereason : ""
        if(role===1 && !deletereason){
            return res.status(400).send({ActionType:"error",error:"管理员删除帖子必须填写驳回原因"})
        }

        //先查出原帖子信息（用于删除日志），同时校验普通用户只能删自己的
        const ProductModel = require("../../models/ProductModel")
        const filter = role===1 ? {_id} : {_id,uploader:username}
        const original = await ProductModel.findOne(filter)
        if(!original){
            return res.status(403).send({ActionType:"error",error:"无权删除或帖子不存在"})
        }

        await ProductService.delList({_id,uploader:username,role,deletereason})

        //保存删除日志：记录执行删除的用户
        await DeleteLogModel.create({
            postId:String(original._id),
            title:original.title,
            uploader:original.uploader,
            deletedBy:username,
            deleteTime:new Date()
        })

        res.send({
            ActionType:"ok",
        })
    },
    updatelist:async(req,res)=>{
        //管理员不能修改帖子
        if(req.user && req.user.role === 1){
            return res.status(403).send({ActionType:"error",error:"管理员不能修改帖子"})
        }
        const cover = req.file ? `/Productuploads/${req.file.filename}` : ""
        const {title,introduction,detail,_id} = req.body
        const uploader = req.user ? req.user.username : ""
        const role = req.user ? req.user.role : 2

        const result = await ProductService.updatelist({
            _id,
            title,
            introduction,
            detail,
            cover,
            editTime:new Date(),
            uploader,
            role
        })
        if(result===null){
            return res.status(403).send({ActionType:"error",error:"管理员不能修改帖子"})
        }
        //matchedCount为0说明不是自己的帖子
        if(result && result.matchedCount===0){
            return res.status(403).send({ActionType:"error",error:"只能修改自己发布的帖子"})
        }
        res.send({
            ActionType:"ok",
        })
    }
}

module.exports = ProductController
