<template>
  <view class="news-detail page-container">
    <view v-if="loading" class="loading-tip">加载中...</view>
    <view v-else-if="!news.title" class="empty-tip">公告不存在</view>
    <view v-else>
      <!-- 封面图 -->
      <image
        v-if="news.cover"
        class="cover"
        :src="getImageUrl(news.cover)"
        mode="widthFix"
      />
      <!-- 标题 -->
      <view class="title">{{ news.title }}</view>
      <!-- 信息行 -->
      <view class="meta">
        <text class="category-tag">{{ categoryFormat(news.category) }}</text>
        <text class="time">{{ formatTime.getTime(news.editTime) }}</text>
      </view>
      <view class="divider"></view>
      <!-- 内容 -->
      <view class="content">
        <rich-text :nodes="news.content" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { get } from '@/api/request'
import formatTime from '@/utils/formatTime'
import { getImageUrl } from '@/utils/image'

const loading = ref(true)
const news = reactive({
  _id: '',
  title: '',
  content: '',
  category: 1,
  cover: '',
  editTime: ''
})

onMounted(() => {
  getData()
})

async function getData() {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const id = page.options.id
  if (!id) {
    uni.showToast({ title: '缺少参数', icon: 'none' })
    loading.value = false
    return
  }
  try {
    //用 readlist 只读接口，所有登录角色都能查看公告详情
    const res = await get(`/adminapi/news/readlist/${id}`)
    const data = res.data.data || []
    if (data.length > 0) {
      Object.assign(news, data[0])
    }
  } catch (err) {
    uni.showToast({ title: '获取公告失败', icon: 'none' })
  }
  loading.value = false
}

function categoryFormat(category) {
  const arr = ['最新动态', '典型案例', '通知公告']
  return arr[(category || 1) - 1] || '未知'
}
</script>

<style lang="scss" scoped>
.news-detail {
  padding: 20rpx;
}

.loading-tip,
.empty-tip {
  text-align: center;
  color: #999;
  padding: 60rpx 0;
}

.cover {
  width: 100%;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  margin-bottom: 16rpx;
}

.meta {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;

  .category-tag {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    background-color: #e6f0ff;
    color: #4366ce;
    margin-right: 16rpx;
  }

  .time {
    font-size: 24rpx;
    color: #999;
  }
}

.divider {
  height: 1rpx;
  background: #eee;
  margin: 20rpx 0;
}

.content {
  font-size: 30rpx;
  line-height: 1.8;
  color: #333;
  word-break: break-all;
}
</style>
