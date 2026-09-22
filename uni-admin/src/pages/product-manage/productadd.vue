<template>
  <view class="product-add page-container">
    <uni-forms ref="productFormRef" :model="productForm" :rules="productFormRules" label-width="80">
      <uni-forms-item label="帖子标题" name="title">
        <uni-easyinput v-model="productForm.title" placeholder="请输入帖子标题" />
      </uni-forms-item>
      <uni-forms-item label="简要描述" name="introduction">
        <uni-easyinput
          v-model="productForm.introduction"
          type="textarea"
          placeholder="请输入简要描述"
        />
      </uni-forms-item>
      <uni-forms-item label="详细内容" name="detail">
        <uni-easyinput
          v-model="productForm.detail"
          type="textarea"
          :maxlength="-1"
          placeholder="请输入详细内容"
          autoHeight
        />
      </uni-forms-item>
      <uni-forms-item label="帖子图片" name="cover">
        <Upload :avatar="productForm.cover" @eventchange="handleChange" />
      </uni-forms-item>
      <button class="submit-btn" type="primary" @tap="submitForm">发布帖子</button>
    </uni-forms>
  </view>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { upload } from '@/utils/upload'
import { useUserStore } from '@/store/user'
import Upload from '@/components/upload/Upload.vue'

const userStore = useUserStore()

//管理员不能发布帖子
onMounted(() => {
  if (userStore.userInfo.role === 1) {
    uni.showToast({ title: '管理员不能发布帖子', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 800)
  }
})

const productFormRef = ref()
const productForm = reactive({
  title: '',
  introduction: '',
  detail: '',
  cover: '',
  file: ''
})

const productFormRules = {
  title: { rules: [{ required: true, errorMessage: '请输入帖子标题' }] },
  introduction: { rules: [{ required: true, errorMessage: '请输入简要介绍' }] },
  detail: { rules: [{ required: true, errorMessage: '请输入详细内容' }] }
}

function handleChange(filePath) {
  productForm.cover = filePath
  productForm.file = filePath
}

function submitForm() {
  productFormRef.value.validate().then(async (valid) => {
    if (valid) {
      uni.showLoading({ title: '发布中...' })
      try {
        //uploader 由后端从 token 自动取，前端不需要传
        await upload(
          '/adminapi/product/add',
          {
            title: productForm.title,
            introduction: productForm.introduction,
            detail: productForm.detail
          },
          productForm.file
        )
        uni.hideLoading()
        uni.showToast({ title: '发布成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/product-manage/productlist' })
        }, 1000)
      } catch (err) {
        uni.hideLoading()
        uni.showToast({ title: err.message || '发布失败', icon: 'none' })
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
