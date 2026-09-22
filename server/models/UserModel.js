//创建数据库模型

const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserType = {
    username:String,
    password:String,
    gender:Number,      //性别，0，1，2
    introduction:String,//简介
    avatar:String,
    role:Number,        //管理员1，编辑2
    phone:String,       //手机号
}
//user模型===>users集合（在mongodb中都叫集合
const UserModel = mongoose.model("user",new Schema(UserType))//通过schema进行初始化

module.exports = UserModel; 