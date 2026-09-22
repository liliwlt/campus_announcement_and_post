const mongoose = require("mongoose")
const Schema = mongoose.Schema

//帖子评论：记录所属帖子、评论者用户名、评论内容、评论时间
const CommentType = {
    postId:String,            //所属帖子 _id
    username:String,          //评论者用户名（从token取）
    content:String,           //评论内容
    commentTime:Date          //评论时间
}
const CommentModel = mongoose.model("Comment",new Schema(CommentType,{ versionKey:false }))

module.exports = CommentModel;
