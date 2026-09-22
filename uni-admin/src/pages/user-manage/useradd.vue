<template>
  <view class="user-add page-container">
    <uni-forms ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80">
      <uni-forms-item label="用户名" name="username">
        <uni-easyinput v-model="userForm.username" placeholder="请输入用户名" />
      </uni-forms-item>
      <uni-forms-item label="密码" name="password">
        <uni-easyinput v-model="userForm.password" type="password" placeholder="请输入密码" />
      </uni-forms-item>
      <uni-forms-item label="性别" name="gender">
        <uni-data-select
          v-model="userForm.gender"
          :localdata="genderOptions"
          placeholder="选择性别"
        />
      </uni-forms-item>
      <uni-forms-item label="角色" name="role">
        <uni-data-select
          v-model="userForm.role"
          :localdata="roleOptions"
          placeholder="选择权限"
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
      <button class="submit-btn" type="primary" @tap="submitForm">添加用户</button>
    </uni-forms>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { upload } from '@/utils/upload'
import Upload from '@/components/upload/Upload.vue'

const userFormRef = ref()
const userForm = reactive({
  username: '',
  password: '',
  role: 2,
  introduction: '',
  avatar: '',
  file: '',
  gender: 0
})

const userFormRules = {
  username: { rules: [{ required: true, errorMessage: '请输入名字' }] },
  password: { rules: [{ required: true, errorMessage: '请输入密码' }] },
  gender: { rules: [{ required: true, errorMessage: '请选择性别' }] },
  role: { rules: [{ required: true, errorMessage: '请选择权限' }] },
  introduction: { rules: [{ required: true, errorMessage: '请输入介绍' }] }
}

const genderOptions = [
  { value: 0, text: '保密' },
  { value: 1, text: '男' },
  { value: 2, text: '女' }
]

const roleOptions = [
  { value: 1, text: '管理员' },
  { value: 2, text: '用户' }
]

function handleChange(filePath) {
  userForm.avatar = filePath
  userForm.file = filePath
}

function submitForm() {
  userFormRef.value.validate().then(async (valid) => {
    if (valid) {
      uni.showLoading({ title: '提交中...' })
      try {
        await upload(
          '/adminapi/user/add',
          {
            username: userForm.username,
            password: userForm.password,
            gender: String(userForm.gender),
            role: String(userForm.role),
            introduction: userForm.introduction
          },
          userForm.file
        )
        uni.hideLoading()
        uni.showToast({ title: '添加成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/user-manage/userlist' })
        }, 1000)
      } catch (err) {
        uni.hideLoading()
        uni.showToast({ title: '添加失败', icon: 'error' })
      }
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.submit-btn {
  margin-top: 30rpx;
  background-color: #4366ce;
  color: #fff;
  border-radius: 12rpx;
}
</style>
