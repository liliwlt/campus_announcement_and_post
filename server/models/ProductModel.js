const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ProductType = {
    title:String,
    introduction:String,
    detail:String,
    cover:String,
    uploader:String,           //发布者用户名
    editTime:Date,             //编辑时间
    isdelete:{ type:Number, default:0 },   //0=正常 1=已删除
    deletereason:String,       //管理员驳回原因（isdelete=1时由管理员填写）
    deleteTime:Date            //删除/驳回时间
}
const ProductModel = mongoose.model("Product",new Schema(ProductType,{ versionKey:false }))

module.exports = ProductModel;
