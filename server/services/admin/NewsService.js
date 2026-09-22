const NewsModel = require("../../models/NewsModel")

const NewsService = {
    add:async({title,content,category,cover,isPublish,editTime}) =>{      
        return NewsModel.create({
            title,content,category,cover,isPublish,editTime
        })
    },
    getlist:async({_id})=>{
        return _id ? NewsModel.find({_id}) : NewsModel.find({})
    },
    getreadlist:async({_id})=>{
        return _id ? NewsModel.find({_id,isPublish:1}) 
        : NewsModel.find({isPublish:1}).sort({editTime:-1})     //sort({EditTime:-1}) 逆序排序//刚才写成了EditTime，使得排序不起作用
    },
    publish:async({_id,isPublish,editTime})=>{
        return NewsModel.updateOne({_id},{isPublish,editTime})//前面的索引，后面的是要改变的数据项
    },
    delList:async({_id})=>{
        return NewsModel.deleteOne({_id})
    },
    updatelist:async({title,content,category,isPublish,editTime,_id,cover})=>{
        if(cover){
            return NewsModel.updateOne({_id},{title,content,category,isPublish,editTime,cover})         
        }else{
            return NewsModel.updateOne({_id},{title,content,category,isPublish,editTime})  
        }
    }
}

module.exports = NewsService