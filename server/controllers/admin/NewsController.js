const NewsService = require("../../services/admin/NewsService")
const JWT = require("../../util/JWT")

const NewsController = {
    add:async(req,res)=>{           
        //console.log(req.file,req.body)

        //数据整合后给到service处理
        const cover = req.file ? `/newsuploads/${req.file.filename}` : ""
        const {title,content,category,isPublish} = req.body

        //调用service进行增
        await NewsService.add({
            title,content,
            category:Number(category),
            isPublish:Number(isPublish),
            cover,
            editTime:new Date()
        })
        res.send({  
            ActionType:"ok"
        })

    },
    getlist:async(req,res)=>{
        const result = await NewsService.getlist({_id:req.params.id})
        res.send({
            ActionType:"ok",
            data:result
        })

    },
    getreadlist:async(req,res)=>{
        const result = await NewsService.getreadlist({_id:req.params.id})
        res.send({
            ActionType:"ok",
            data:result
        })

    },
    publish:async(req,res)=>{
        await NewsService.publish({...req.body,editTime:new Date()})

        res.send({
            ActionType:"ok",
        })
    },
    delList:async(req,res)=>{
        await NewsService.delList({_id:req.params.id})
        res.send({
            ActionType:"ok",
        })
    },
    updatelist:async(req,res)=>{
        const cover = req.file ? `/newsuploads/${req.file.filename}` : ""
        const {title,content,category,isPublish,_id} = req.body
        await NewsService.updatelist({
            _id,
            title,content,
            category:Number(category),
            isPublish:Number(isPublish),
            cover,
            editTime:new Date()
        })
        res.send({
            ActionType:"ok",
        })
    }
}

module.exports = NewsController