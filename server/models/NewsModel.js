const mongoose = require("mongoose")
const Schema = mongoose.Schema

const NewsType = {
    title:String,
    content:String,
    category:Number,      //类别，1，2，3
    cover:String,
    isPublish:Number,        //未发布，已发布
    editTime:Date             //编辑时间
}
const NewsModel = mongoose.model("news",new Schema(NewsType))

module.exports = NewsModel; 