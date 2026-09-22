<template>
  <view class="center-page">
    <!-- 用户信息卡片 -->
    <uni-card class="profile-card" :is-shadow="true" :border="false">
      <view class="profile-info">
        <image class="avatar" :src="avatarUrl" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ userStore.userInfo.username || '' }}</text>
          <text class="role">{{ userStore.userInfo.role === 1 ? '管理员' : '用户' }}</text>
        </view>
      </view>
	  <view>
		  <button @tap="handleLogout">退出登录</button>
	  </view>
    </uni-card>

    <!-- 信息编辑表单 -->
    <uni-card :is-shadow="true" :border="false">
      <template v-slot:title>
        <view class="card-title">个人信息</view>
      </template>
      <uni-forms ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80">
        <uni-forms-item label="用户名" name="username">
          <uni-easyinput v-model="userForm.username" placeholder="请输入用户名" />
        </uni-forms-item>
        <uni-forms-item label="性别" name="gender">
          <uni-data-select
            v-model="userForm.gender"
            :localdata="genderOptions"
            placeholder="选择性别"
          />
        </uni-forms-item>
        <uni-forms-item label="个人介绍" name="introduction">
          <uni-easyinput
            v-model="userForm.introduction"
            type="textarea"
            placeholder="请输入个人介绍"
          />
        </uni-forms-item>
        <uni-forms-item label="头像" name="avatar">
          <Upload :avatar="userForm.avatar" @eventchange="handleChange" />
        </uni-forms-item>
        <button class="submit-btn" type="primary" @tap="submitForm">更新</button>
      </uni-forms>
    </uni-card>

    <!-- 手机号绑定 -->
    <uni-card :is-shadow="true" :border="false">
      <template v-slot:title>
        <view class="card-title">手机号绑定</view>
      </template>
      <view class="phone-bind-tip" v-if="userStore.userInfo.phone">
        当前已绑定：{{ maskedPhone }}
      </view>
      <view class="phone-bind-tip" v-else>
        尚未绑定手机号
      </view>
      <uni-forms label-width="80">
        <uni-forms-item label="手机号" name="phone">
          <uni-easyinput
            v-model="phoneInput"
            type="number"
            maxlength="11"
            placeholder="请输入11位手机号"
          />
        </uni-forms-item>
      </uni-forms>
      <button class="submit-btn" type="primary" @tap="bindPhone">绑定手机号</button>
    </uni-card>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { getAvatarUrl } from '@/utils/image'
import { upload } from '@/utils/upload'
import { post } from '@/api/request'
import Upload from '@/components/upload/Upload.vue'

const userStore = useUserStore()
const avatarUrl = computed(() => getAvatarUrl(userStore.userInfo.avatar))

//手机号绑定
const phoneInput = ref('')
//手机号脱敏显示（中间4位用*）
const maskedPhone = computed(() => {
  const p = userStore.userInfo.phone || ''
  if (p.length === 11) {
    return p.slice(0, 3) + '****' + p.slice(7)
  }
  return p
})

//国内 11 位手机号正则：1 开头，第二位 3-9，共 11 位数字
const phoneRegex = /^1[3-9]\d{9}$/

async function bindPhone() {
  const phone = phoneInput.value.trim()
  if (!phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!phoneRegex.test(phone)) {
    uni.showToast({ title: '手机号格式不正确（需为11位国内手机号）', icon: 'none' })
    return
  }
  try {
    const res = await post('/adminapi/user/bindphone', { phone })
    if (res.data.ActionType === 'ok') {
      userStore.changeUserInfo({ phone: res.data.data.phone })
      phoneInput.value = ''
      uni.showToast({ title: '绑定成功', icon: 'success' })
    } else {
      uni.showToast({ title: res.data.error || '绑定失败', icon: 'none' })
    }
  } catch (err) {
    uni.showToast({ title: err.message || '绑定失败', icon: 'none' })
  }
}

const userFormRef = ref()
const userForm = reactive({
  username: userStore.userInfo.username || '',
  gender: userStore.userInfo.gender ?? 0,
  introduction: userStore.userInfo.introduction || '',
  avatar: userStore.userInfo.avatar || '',
  file: ''
})

const userFormRules = {
  username: { rules: [{ required: true, errorMessage: '请输入名字' }] },
  gender: { rules: [{ required: true, errorMessage: '请选择性别' }] },
  introduction: { rules: [{ required: true, errorMessage: '请输入介绍' }] }
}

const genderOptions = [
  { value: 0, text: '保密' },
  { value: 1, text: '男' },
  { value: 2, text: '女' }
]

function handleChange(filePath) {
  userForm.avatar = filePath
  userForm.file = filePath
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗?',
    success: (res) => {
      if (res.confirm) {
        // 清除 token 和用户信息
        uni.removeStorageSync('token')
        userStore.clearUserInfo()
        // reLaunch 会清空所有页面栈，直接跳到登录页
        uni.reLaunch({ url: '/pages/login/login' })
      }
    }
  })
}

function submitForm() {
  userFormRef.value.validate().then(async (valid) => {
    if (valid) {
      uni.showLoading({ title: '更新中...' })
      try {
        const res = await upload(
          '/adminapi/user/upload',
          {
            username: userForm.username,
            gender: String(userForm.gender),
            introduction: userForm.introduction
          },
          userForm.file
        )
        uni.hideLoading()
        if (res.ActionType === 'ok') {
          userStore.changeUserInfo(res.data)
          userForm.file = ''
          uni.showToast({ title: '更新成功', icon: 'success' })
        }
      } catch (err) {
        uni.hideLoading()
        uni.showToast({ title: '更新失败', icon: 'error' })
      }
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.center-page {
  padding: 20rpx;
}

.profile-card {
  margin-bottom: 20rpx;
}

.profile-info {
  display: flex;
  align-items: center;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 30rpx;
    background-color: #eee;
  }

  .info {
    display: flex;
    flex-direction: column;

    .name {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .role {
      font-size: 26rpx;
      color: #999;
      margin-top: 10rpx;
    }
  }
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  padding: 10rpx 0;
}

.submit-btn {
  margin-top: 20rpx;
  background-color: #4366ce;
  color: #fff;
  border-radius: 12rpx;
}

.phone-bind-tip {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}

</style>
