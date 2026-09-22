<template>
  <view class="news-edit page-container">
    <uni-forms ref="newsFormRef" :model="newsForm" :rules="newsFormRules" label-width="80">
      <uni-forms-item label="公告标题" name="title">
        <uni-easyinput v-model="newsForm.title" placeholder="请输入公告标题" />
      </uni-forms-item>
      <uni-forms-item label="公告内容" >
        <!-- 富文本编辑器：正常渲染 <p> 等标签，替代原来的 textarea -->
        <editor
          id="newsEditor"
          class="editor"
          placeholder="请输入公告内容"
          @ready="onEditorReady"
          @input="onEditorInput"
        ></editor>
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
      <button class="submit-btn" type="primary" @tap="submitForm">更新公告</button>
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
const newsFormRef = ref()
const newsForm = reactive({
  _id: '',
  title: '',
  content: '',
  category: 1,
  cover: '',
  file: '',
  isPublish: 0
})

// content 改为富文本手动校验，不放 rules 里
const newsFormRules = {
  title: { rules: [{ required: true, errorMessage: '请输入标题' }] },
  category: { rules: [{ required: true, errorMessage: '请选择分类' }] }
}

const categoryOptions = [
  { value: 1, text: '最新动态' },
  { value: 2, text: '典型案例' },
  { value: 3, text: '通知公告' }
]

// 富文本编辑器上下文
let editorCtx = null
const editorReady = ref(false)

function onEditorReady() {
  uni.createSelectorQuery()
    .select('#newsEditor')
    .context((res) => {
      editorCtx = res.context
      editorReady.value = true
      // 数据可能比编辑器先就绪，这里补设一次
      if (newsForm.content) {
        editorCtx.setContents({ html: newsForm.content })
      }
    })
    .exec()
}

function onEditorInput(e) {
  // 同步最新 HTML，用于必填判断
  newsForm.content = e.detail.html || newsForm.content || ''
}

function handleUploadChange(filePath) {
  newsForm.cover = filePath
  newsForm.file = filePath
}

onMounted(() => {
  // 公告模块仅管理员可用
  if (userStore.userInfo.role !== 1) {
    uni.showToast({ title: '公告模块仅管理员可用', icon: 'none' })
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
    uni.showToast({ title: '缺少参数', icon: 'error' })
    return
  }
  try {
    const res = await get(`/adminapi/news/list/${id}`)
    Object.assign(newsForm, res.data.data[0])
    // 编辑器已就绪则直接把 HTML 灌进去渲染
    if (editorReady.value && editorCtx) {
      editorCtx.setContents({ html: newsForm.content })
    }
  } catch (err) {
    uni.showToast({ title: '获取数据失败', icon: 'error' })
  }
}

function submitForm() {
  newsFormRef.value.validate().then((valid) => {
    if (!valid) return
    // 从富文本编辑器取最终 HTML
    editorCtx.getContents({
      success: (res) => {
        const html = res.html || ''
        const plainText = (res.text || '').trim()
        if (!plainText) {
          uni.showToast({ title: '请输入公告内容', icon: 'none' })
          return
        }
        doSubmit(html)
      },
      fail: () => {
        uni.showToast({ title: '内容读取失败', icon: 'none' })
      }
    })
  }).catch(() => {})
}

async function doSubmit(contentHtml) {
  uni.showLoading({ title: '更新中...' })
  try {
    await upload(
      '/adminapi/news/list',
      {
        _id: newsForm._id,
        title: newsForm.title,
        content: contentHtml,
        category: String(newsForm.category),
        isPublish: String(newsForm.isPublish)
      },
      newsForm.file
    )
    uni.hideLoading()
    uni.showToast({ title: '更新成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: '更新失败', icon: 'error' })
  }
}
</script>

<style lang="scss" scoped>
.editor {
  width: 100%;
  min-height: 300rpx;
  padding: 20rpx;
  background: #fff;
  border: 1rpx solid #e5e5e5;
  border-radius: 8rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  line-height: 1.6;
}

.submit-btn {
  margin-top: 30rpx;
  background-color: #4366ce;
  color: #fff;
  border-radius: 12rpx;
}
</style>
