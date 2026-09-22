const mongoose = require("mongoose");

console.log("开始连接...");
const start = Date.now();

mongoose.connect("mongodb://127.0.0.1:27017/uni-admin", {
  serverSelectionTimeoutMS: 30000  // 30秒超时
})
.then(() => {
  const duration = Date.now() - start;
  console.log(`✅ 连接成功！耗时：${duration}ms`);
  process.exit(0);
})
.catch(err => {
  console.error("❌ 连接失败：", err);
  process.exit(1);
});