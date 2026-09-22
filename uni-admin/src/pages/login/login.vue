<template>
  <view class="login-page">
    <view class="form-container">
      <view class="title">校园公告和兴趣帖子交流</view>
	  <view class="title">登录</view>
      <uni-forms ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" class="login-form">
        <uni-forms-item name="username">
          <uni-easyinput
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefixIcon="person"
          />
        </uni-forms-item>
        <uni-forms-item name="password">
          <uni-easyinput
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefixIcon="locked"
          />
        </uni-forms-item>
        <button class="login-btn" type="primary" @tap="submitForm">登录</button>
		<button class="login-btn" type="primary" @tap="sign_up">去注册</button>
      </uni-forms>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { post } from '@/api/request'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: ''
})

const loginFormRef = ref()

const loginRules = {
  username: {
    rules: [{ required: true, errorMessage: '请输入用户名' }]
  },
  password: {
    rules: [{ required: true, errorMessage: '请输入密码' }]
  }
}

function submitForm() {
  loginFormRef.value.validate().then(async (valid) => {
    if (valid) {
      try {
        const res = await post('/adminapi/user/login', loginForm)
        if (res.data && res.data.ActionType === 'ok') {
          userStore.changeUserInfo(res.data.data)
          uni.reLaunch({ url: '/pages/home/home' })
        } else {
          // 后端匹配失败时返回 { code:"-1", error:"用户与密码不匹配" }
          uni.showToast({ title: (res.data && res.data.error) || '用户名与密码不匹配', icon: 'none' })
        }
      } catch (err) {
        uni.showToast({ title: '登录失败', icon: 'error' })
      }
    }
  }).catch(() => {})
}

function sign_up(){
	uni.navigateTo({
		url: '/pages/login/signup'
	})
}


</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4366ce 0%, #5b8def 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 85%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 60rpx;
}

.login-form {
  :deep(.uni-easyinput) {
    margin-bottom: 10rpx;
  }
}

.login-btn {
  margin-top: 20rpx;
  background-color: #4366ce;
  color: #fff;
  border-radius: 12rpx;
}
</style>
