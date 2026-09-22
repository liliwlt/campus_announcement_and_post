var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const UserRouter = require("./routes/admin/UserRouter");
const NewsRouter = require("./routes/admin/NewsRouter");
const ProductRouter = require("./routes/admin/ProductRouter");


const JWT = require('./util/JWT');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());              // 解析POST请求体，必须加！不然req.body拿不到数据
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//在这里面统一地注册路由，



app.use((req,res,next)=>{           // 中间件
  //如果token有效，next（）
  //如果token过期 返回401错误给前端
  //公开接口直接放行（登录/注册/用户名查重），注意要先去掉 ?query 再比较
  const path = req.url.split("?")[0]
  if(path==="/adminapi/user/login" || path==="/adminapi/user/register" || path==="/adminapi/user/checkusername"){
    next()
    return;
  }
  //优先从 Authorization 头取 token；
  //文件上传（multipart）在部分客户端/H5 端可能丢失 Authorization 头，兜底从 query 的 token 取
  let token = ""
  if(req.headers["authorization"]){
    token = req.headers["authorization"].split(" ")[1]
  }
  if(!token && req.query && req.query.token){
    token = req.query.token
  }
  if(token){               //if(token) 只检查 token 存不存在，jwt.verify() 还要检查 token 有没有被篡改、有没有过期。
    var payload = JWT.verify(token)
    //console.log(payload)
    if(payload){
      //公告只读接口（readlist）对所有登录用户开放；
      //其余 news 管理接口（增/删/改/发布/管理列表）仅管理员可用（role===1）
      const isNewsReadPath = path === "/adminapi/news/readlist" || path.startsWith("/adminapi/news/readlist/")
      if(path.startsWith("/adminapi/news") && !isNewsReadPath && payload.role !== 1){
        res.status(403).send({errCode:"-1",errorInfo:"无权限访问公告模块"})
        return
      }
      //把当前用户信息挂到req上，controller据此做权限判断
      req.user = payload
      const newToken = JWT.generate({       //如果没有这个，即使一直刷新页面也会过期，过了第一次的那60s必过期
        _id:payload._id,
        username:payload.username,
        role:payload.role
      },"10m")        //重新生成token
      res.header("Authorization",newToken)  //  只要没有返回body就不会结束继续next走
      next()
    }else{
      res.status(401).send({errCode:"-1",errorInfo:"token过期"})
    }
  }else{
    res.status(401).send({errCode:"-1",errorInfo:"token过期"})   //没有token直接返回401，避免请求挂起
  }

})
//路由注册，因为放在token校验之后，所以只有在token校验完成后才执行路由注册
app.use('/',UserRouter);
app.use('/',NewsRouter);
app.use('/',ProductRouter)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
