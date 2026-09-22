<template>
  <view class="news-add page-container">
    <uni-forms ref="newsFormRef" :model="newsForm" :rules="newsFormRules" label-width="80">
      <uni-forms-item label="公告标题" name="title">
        <uni-easyinput v-model="newsForm.title" placeholder="请输入公告标题" />
      </uni-forms-item>
      <uni-forms-item label="公告内容" name="content">
        <uni-easyinput
          v-model="newsForm.content"
          type="textarea"
          :maxlength="-1"
          placeholder="请输入公告内容"
          autoHeight
        />
      </uni-forms-item>
      <uni-forms-item label="类别" name="category">
        <uni-data-select
          v-model="newsForm.category"
          :localdata="categoryOptions"
          placeholder="选择类别"
        />
      </uni-forms-item>
      <uni-forms-item label="封面" name="cover">
        <Upload :avatar="newsForm.cover" @eventchange="handleUploadChange" />
      </uni-forms-item>
      <button class="submit-btn" type="primary" @tap="submitForm">添加公告</button>
    </uni-forms>
  </view>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { upload } from '@/utils/upload'
import { useUserStore } from '@/store/user'
import Upload from '@/components/upload/Upload.vue'

const userStore = useUserStore()

// 公告模块仅管理员可用
onMounted(() => {
  if (userStore.userInfo.role !== 1) {
    uni.showToast({ title: '公告模块仅管理员可用', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 800)
  }
})

const newsFormRef = ref()
const newsForm = reactive({
  title: '',
  content: '',
  category: 1,
  cover: '',
  file: '',
  isPublish: 0
})

const newsFormRules = {
  title: { rules: [{ required: true, errorMessage: '请输入标题' }] },
  content: { rules: [{ required: true, errorMessage: '请输入内容' }] },
  category: { rules: [{ required: true, errorMessage: '请选择分类' }] }
}

const categoryOptions = [
  { value: 1, text: '最新动态' },
  { value: 2, text: '典型案例' },
  { value: 3, text: '通知公告' }
]

function handleUploadChange(filePath) {
  newsForm.cover = filePath
  newsForm.file = filePath
}

function submitForm() {
  newsFormRef.value.validate().then(async (valid) => {
    if (valid) {
      uni.showLoading({ title: '提交中...' })
      try {
        await upload(
          '/adminapi/news/add',
          {
            title: newsForm.title,
            content: newsForm.content,
            category: String(newsForm.category),
            isPublish: String(newsForm.isPublish)
          },
          newsForm.file
        )
        uni.hideLoading()
        uni.showToast({ title: '添加成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/news-manage/newslist' })
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
