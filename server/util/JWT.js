const jsonwebtoken = require("jsonwebtoken")
const secret = "aaacc"      //密钥
const JWT = {
    generate(value,expires){            //负责生成token
        return jsonwebtoken.sign(value,secret,{expiresIn: expires})    //{expiresIn: expires}过期时间
    },      
    verify(token ){                           //负责验证token
        try{
            return jsonwebtoken.verify(token,secret)

        }catch(e){                  //e是error的意思
            return false
        }
    }
}

module.exports =JWT;