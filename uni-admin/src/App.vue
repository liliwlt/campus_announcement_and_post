<script>
export default {
  onLaunch() {
    console.log('校园公告及兴趣交流')
  },
  onShow() {},
  onHide() {}
}
</script>

<style lang="scss">
/* uni-ui 全局样式 */


/* 全局公共样式 */
page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  color: #333;
}

view, text {
  box-sizing: border-box;
}

/* 卡片通用样式 */
.uni-card-margin {
  margin: 20rpx 0;
}

/* 按钮通用样式 */
.btn-primary {
  background-color: #4366ce;
  color: #fff;
}

/* 页面容器 */
.page-container {
  padding: 20rpx;
}

/* 标题样式 */
.page-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

/* 空状态 */
.empty-tip {
  text-align: center;
  color: #999;
  padding: 60rpx 0;
  font-size: 28rpx;
}
</style>
