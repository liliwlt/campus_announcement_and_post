<template>
  <view class="tokenlose">
    <view class="text">登录时间太长，登录失效了</view>
    <button class="btn" type="primary" @tap="goLogin">重新登录</button>
  </view>
</template>

<script setup>
function goLogin() {
  uni.removeStorageSync('token')
  uni.reLaunch({ url: '/pages/login/login' })
}
</script>

<style lang="scss" scoped>
.tokenlose {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;

  .text {
    color: #dd524d;
    font-size: 32rpx;
    margin-bottom: 40rpx;
  }

  .btn {
    width: 60%;
  }
}
</style>
