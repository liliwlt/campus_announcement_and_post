const CommentService = require("../../services/admin/CommentService")

const CommentController = {
    //发表评论
    add:async(req,res)=>{
        const {postId,content} = req.body
        if(!postId || !content || !content.trim()){
            return res.status(400).send({ActionType:"error",error:"帖子ID和评论内容不能为空"})
        }
        //评论者 = 当前登录用户（从中间件挂载的 req.user 取）
        const username = req.user ? req.user.username : ""
        if(!username){
            return res.status(401).send({ActionType:"error",error:"未登录"})
        }
        await CommentService.add({
            postId,
            username,
            content:content.trim(),
            commentTime:new Date()
        })
        res.send({ActionType:"ok"})
    },
    //获取某帖子的全部评论
    getlist:async(req,res)=>{
        const postId = req.params.postId
        if(!postId){
            return res.status(400).send({ActionType:"error",error:"缺少帖子ID"})
        }
        const result = await CommentService.getlist({postId})
        res.send({ActionType:"ok",data:result})
    },
    //删除评论（仅本人或管理员）
    del:async(req,res)=>{
        const _id = req.params.id
        const role = req.user ? req.user.role : 2
        const username = req.user ? req.user.username : ""
        const result = await CommentService.del({_id,username,role})
        if(result && result.deletedCount===0){
            return res.status(403).send({ActionType:"error",error:"无权删除该评论"})
        }
        res.send({ActionType:"ok"})
    }
}

module.exports = CommentController
