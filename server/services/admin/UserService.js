const UserModel = require("../../models/UserModel")

const UserService = {
    login:async({username,password})=>{
        console.log("UserService 接收:", { username, password });
        return UserModel.find({
            username,
            password
        })
    },
    upload:async({_id,username,introduction,gender,avatar})=>{
        if(avatar){
            return UserModel.updateOne({
                _id
            },
            {
                username,introduction,gender:Number(gender),avatar
            })             //利用模型更新数据库
        }else{
            return UserModel.updateOne({
                _id
            },
            {
                username,introduction,gender:Number(gender)
            })             //不更新头像，更新其他的
        }
    },
    add:async({username,introduction,gender,avatar,role,password})=>{
        console.log("UserService 接收:", { username, password });
        return UserModel.create({
            username,introduction,gender,avatar,role,password
        })
    },
    checkUserName:async({username})=>{
        // countDocuments：统计匹配的文档数量，不需要把完整数据查出来
        const count = await UserModel.countDocuments({username})
        return count > 0 
    },
    getList:async ({id})=>{     
        return id ? UserModel.find({_id:id},["username","introduction","password","role"]) 
                : UserModel.find({},["username","introduction","gender","avatar","role"])    //传所有的，如果要查找单个的就传_id
    },
    putList:async (body)=>{         //不是{body}，这样是解构了body
        return UserModel.updateOne({_id:body._id},body) 
    },
    delList:async({_id})=>{
        return UserModel.deleteOne({_id})
    },
    //绑定手机号
    bindPhone:async({_id,phone})=>{
        return UserModel.updateOne({_id},{phone})
    }

}

module.exports = UserService