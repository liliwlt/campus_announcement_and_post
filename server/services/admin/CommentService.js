const CommentModel = require("../../models/CommentModel")

const CommentService = {
    //新增评论
    add:async({postId,username,content,commentTime})=>{
        return CommentModel.create({postId,username,content,commentTime})
    },
    //查询某帖子的全部评论（按时间正序，方便阅读）
    getlist:async({postId})=>{
        return CommentModel.find({postId}).sort({ commentTime: 1 })
    },
    //删除评论（仅评论者本人或管理员可删）
    del:async({_id,username,role})=>{
        if(role===1){
            return CommentModel.deleteOne({_id})
        }
        return CommentModel.deleteOne({_id,username})
    }
}

module.exports = CommentService
