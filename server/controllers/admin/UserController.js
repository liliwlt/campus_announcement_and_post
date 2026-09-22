const UserService = require("../../services/admin/UserService")
const JWT = require("../../util/JWT")

const UserController = {

    login:async( req,res )=>{
        //用req.body接收前端发来的用户名密码什么的   
        var result = await UserService.login(req.body)        
        if(result.length===0){
            return res.send({
                code:"-1",
                error:"用户与密码不匹配"
            })
        }else{
            //生成token（有效期与刷新token一致为10分钟；过短会导致首页只调公开/webapi接口不续期时，用户操作稍慢就被判过期）
            const token = JWT.generate({
                _id:result[0]._id,
                username:result[0].username,
                role:result[0].role        //角色放进token，后端据此校验公告模块权限
            },"10m")
            res.header("Authorization",token)   

            
            return res.send({
                    ActionType:"ok",
                    data:{
                        username:result[0].username,
                        gender:result[0].gender ?? 0,      //性别，0保密，1，2    如果 result[0].gender 的值是 null 或 undefined，就用 0，否则就用 result[0].gender 本身。
                        introduction:result[0].introduction,//简介
                        avatar:result[0].avatar,
                        role:result[0].role,        //管理员1，编辑2
                        phone:result[0].phone || "",     //手机号
                    }
                })
        }
    },
    upload:async( req,res )=>{
        //console.log(req.body,req.file)
        const {username,introduction,gender} = req.body
        //直接使用中间件挂载的当前用户（已兼容 header 丢失时从 query 取 token 的情况）
        const payload = req.user
        const avatar = req.file ? `/avataruploads/${req.file.filename}` : ""
        if(payload){
            //console.log(payload._id)
            await UserService.upload({_id:payload._id,username,introduction,gender:Number(gender),avatar})
            if(avatar){
                res.send({    
                    ActionType:"ok",
                    data:{
                        username,
                        introduction,
                        gender:Number(gender),
                        avatar

                    }
                })
            }else{
                res.send({     
                    ActionType:"ok",
                    data:{
                        username,
                        introduction,
                        gender:Number(gender)

                    }
                })
            }
        }
        
    },   
    add:async( req,res )=>{
        //console.log(req.body,req.file)
        const {username,introduction,gender,role,password} = req.body
        const avatar = req.file ? `/avataruploads/${req.file.filename}` : ""
        await UserService.add({username,introduction,gender:Number(gender),avatar,role:Number(role),password})
        res.send({      //不管有没有头像都返回响应，否则前端会一直等待
            ActionType:"ok"
        })
    },
    register:async( req,res )=>{
        const {username,password} = req.body
        //基础校验
        if(!username || !password){
            return res.send({ ActionType:"error", error:"用户名和密码不能为空" })
        }
        //查重，用户名已存在就拒绝注册
        const exist = await UserService.checkUserName({ username })
        if(exist){
            return res.send({ ActionType:"error", error:"该用户名已被使用" })
        }
        await UserService.add({
            username,
            password,
            introduction:"",
            gender:0,
            avatar:"",
            role:2          //普通编辑角色（1管理员 / 2编辑）
        })
        res.send({ ActionType:"ok" })
    },
    checkUserName:async(req,res)=>{
        // 从 query 获取用户名
        const { username } = req.query
        // 去service查询是否存在该用户名（注意参数要传对象，service里是解构{username}）
        const exist = await UserService.checkUserName({ username })
        res.send({
            ActionType:"ok",
            exist: exist // true代表已占用，false代表可用
        })
    },
    getList:async(req,res)=>{       //如果这里不写req，res，会显示res未定义
        const result = await UserService.getList(req.params)
        res.send({      
            ActionType:"ok",
            data:result
        })
    },
    putList:async(req,res)=>{      
        const result = await UserService.putList(req.body)
        res.send({      
            ActionType:"ok",
            data:result
        })
    },
    delList:async(req,res)=>{
        console.log(req.params.id)
        const result = await UserService.delList({_id:req.params.id})
        res.send({
            ActionType:"ok"
        })
    },
    //绑定手机号：后端再次校验手机号格式，防止绕过前端提交非法数据
    bindPhone:async(req,res)=>{
        const { phone } = req.body
        const payload = req.user
        if(!payload){
            return res.status(401).send({ ActionType:"error", error:"未登录" })
        }
        //国内 11 位手机号：1 开头，第二位 3-9，共 11 位数字
        const phoneRegex = /^1[3-9]\d{9}$/
        if(!phone || !phoneRegex.test(phone)){
            return res.send({ ActionType:"error", error:"手机号格式不正确" })
        }
        await UserService.bindPhone({_id:payload._id, phone})
        res.send({
            ActionType:"ok",
            data:{ phone }
        })
    }


} 
module.exports = UserController