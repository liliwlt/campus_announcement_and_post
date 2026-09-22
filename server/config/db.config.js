const mongoose = require("mongoose")


mongoose.connect("mongodb://127.0.0.1:27017/uni-admin")
  .then(() => console.log("✅ 数据库连接成功！"))
  .catch(err => console.error("❌ 数据库连接失败：", err));