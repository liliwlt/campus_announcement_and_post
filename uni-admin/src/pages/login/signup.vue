<template>
  <view class="login-page">
    <view class="form-container">
      <view class="title">校园公告和兴趣帖子交流</view>
	  <view class="title">注册</view>
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
        <button class="login-btn" type="primary" @tap="submitForm">去登录</button>
		<button class="login-btn" type="primary" @tap="sign_up">注册</button>
      </uni-forms>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { post, get } from '@/api/request'
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
	uni.navigateTo({
		url:'/pages/login/login'
	})
}

// function sign_up(){
// 	//判断是否写,并添加用户
// 	loginFormRef.value.validate().then(async (valid) => {
// 	  if (!valid) {
// 		  //判断是否已有此人，
// 		  //2获取全部用户列表，判断用户名重复
// 		    const resAllUser = await get('/adminapi/user/list')
// 			const userList = resAllUser.data.data
// 		  //查找是否存在同名
// 		    const existUser = userList.find(item=> item.username === loginForm.username)
// 		    if(existUser){
// 		      uni.showToast({ title: '该用户名已被使用', icon: 'error' })
// 		      return
// 		    }else{//如果没有这个名字的人
// 			//创建一个用户
// 			const res = await upload('/adminapi/user/register',userForm)
// 			uni.showToast({ title: '注册成功' })
// 			console.log("注册成功")
// 			uni.navigateTo({
// 				url:'/pages/login/login'
// 			})
			  
// 		  }
// 	  }
// 	}).catch(() => {})
// }
async function sign_up(){
  try{
    //1 表单校验（校验失败时 validate 会 reject，uni-forms 自动显示字段错误）
    await loginFormRef.value.validate()
  }catch(e){
    return
  }
  try{
    //2 查重：用户名是否已存在
    const checkRes = await get('/adminapi/user/checkusername', {
      username: loginForm.username
    })
    if(checkRes.data && checkRes.data.exist){
      uni.showToast({ title: '该用户名已被使用', icon: 'none' })
      return
    }

    //3 用户名不重复，调用注册接口，补齐后端需要字段
    const registerData = {
      username: loginForm.username,
      password: loginForm.password,
      role: 2,   // 普通编辑角色（1管理员 / 2编辑）
      gender: 0, // 保密
      introduction: "",
      avatar: ""
    }
    const regRes = await post('/adminapi/user/register', registerData)
    if(regRes.data && regRes.data.ActionType === 'ok'){
      uni.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/login' })
      }, 800)
    }else{
      uni.showToast({ title: (regRes.data && regRes.data.error) || '注册失败', icon: 'none' })
    }
  }catch(err){
    console.error(err)
    uni.showToast({ title: err.message || '注册请求异常', icon: 'none' })
  }
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
