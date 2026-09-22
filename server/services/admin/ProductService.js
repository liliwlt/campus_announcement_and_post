const ProductModel = require("../../models/ProductModel")

const ProductService = {
    add:async({title,introduction,detail,cover,uploader,editTime}) =>{
        return ProductModel.create({
            title,introduction,detail,cover,uploader,editTime
        })
    },
    //帖子广场列表：所有角色都能看到未被删除的帖子
    //帖子详情（单条）：未删除的帖子所有人可见；已删除的帖子只有发布者本人和管理员可见
    //用 $ne:1 而不是 isdelete:0，兼容数据库中旧数据（没有 isdelete 字段的帖子也要显示）
    getshowlist:async(_id, role, username)=>{
        if(_id){
            if(role === 1){
                //管理员可查看任意帖子（含已删除）
                return ProductModel.find({_id})
            }
            //普通用户：可看未删除的帖子，或自己发布的（含被管理员驳回的）
            return ProductModel.find({
                _id,
                $or: [{isdelete:{$ne:1}}, {uploader: username}]
            })
        }
        return ProductModel.find({isdelete:{$ne:1}}).sort({ editTime: -1 })
    },
    //查询：管理员看全部（含已删除）；普通用户看自己发布的全部（含被驳回/已删除）
    getlist:async({_id,uploader,role})=>{
        if(_id){
            //查单条：管理员任意；普通用户只能查自己的
            if(role===1){
                return ProductModel.find({_id})
            }
            return ProductModel.find({_id,uploader})
        }
        //查列表
        if(role===1){
            return ProductModel.find({}).sort({ editTime: -1 })
        }
        return ProductModel.find({uploader}).sort({ editTime: -1 })
    },
    //软删除：管理员删除时必须带 deletereason（驳回原因）
    delList:async({_id,uploader,role,deletereason})=>{
        const update = { isdelete:1, deletereason: deletereason || "", deleteTime:new Date() }
        if(role===1){
            //管理员可删任意
            return ProductModel.updateOne({_id}, update)
        }
        //普通用户只能删自己的
        return ProductModel.updateOne({_id,uploader}, update)
    },
    updatelist:async({title,introduction,detail,_id,editTime,cover,uploader,role})=>{
        //普通用户只能改自己的；管理员不允许修改
        if(role===1){
            return null       //管理员无权修改，controller 层已拦截
        }
        if(cover){
            return ProductModel.updateOne({_id,uploader},{title,introduction,detail,editTime,cover})
        }
        return ProductModel.updateOne({_id,uploader},{title,introduction,detail,editTime})
    }
}

module.exports = ProductService
