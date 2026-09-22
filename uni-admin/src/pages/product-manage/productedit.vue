<template>
  <view class="product-edit page-container">
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
      <button class="submit-btn" type="primary" @tap="submitForm">更新帖子</button>
    </uni-forms>
  </view>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { get } from '@/api/request'
import { upload } from '@/utils/upload'
import { useUserStore } from '@/store/user'
import Upload from '@/components/upload/Upload.vue'

const userStore = useUserStore()
const productFormRef = ref()
const productForm = reactive({
  _id: '',
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

onMounted(() => {
  //管理员不能编辑帖子
  if (userStore.userInfo.role === 1) {
    uni.showToast({ title: '管理员不能编辑帖子', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 800)
    return
  }
  getData()
})

async function getData() {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const id = page.options.id
  if (!id) {
    uni.showToast({ title: '缺少参数', icon: 'none' })
    return
  }
  try {
    //后端会校验：普通用户只能查自己的帖子，非自己的会返回空
    const res = await get(`/adminapi/product/list/${id}`)
    const list = res.data.data || []
    if (list.length === 0) {
      uni.showToast({ title: '无权编辑该帖子', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 800)
      return
    }
    Object.assign(productForm, list[0])
  } catch (err) {
    uni.showToast({ title: '获取数据失败', icon: 'none' })
  }
}

function submitForm() {
  productFormRef.value.validate().then(async (valid) => {
    if (valid) {
      uni.showLoading({ title: '更新中...' })
      try {
        await upload(
          '/adminapi/product/list',
          {
            _id: productForm._id,
            title: productForm.title,
            introduction: productForm.introduction,
            detail: productForm.detail
          },
          productForm.file
        )
        uni.hideLoading()
        uni.showToast({ title: '更新成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } catch (err) {
        uni.hideLoading()
        uni.showToast({ title: err.message || '更新失败', icon: 'none' })
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
