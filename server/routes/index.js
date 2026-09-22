var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//将来在这里只配置路由，注册子路由。具体的函数处理逻辑放在controllers，
module.exports = router;
