const mongoose = require("mongoose")
const Schema = mongoose.Schema

//帖子删除日志：记录被删的帖子信息 + 执行删除的用户
const DeleteLogType = {
    postId:String,            //被删帖子原 _id
    title:String,             //帖子标题
    uploader:String,          //帖子原发布者
    deletedBy:String,         //执行删除操作的用户名
    deleteTime:Date           //删除时间
}
const DeleteLogModel = mongoose.model("DeleteLog",new Schema(DeleteLogType,{ versionKey:false }))

module.exports = DeleteLogModel;
