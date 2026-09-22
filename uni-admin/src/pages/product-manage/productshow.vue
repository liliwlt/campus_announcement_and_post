<template>
  <view class="product-show">
    <view class="page-header">
      <text class="title">帖子广场</text>
    </view>

    <view v-if="loading" class="loading-tip">加载中...</view>
    <view v-else-if="tableData.length === 0" class="empty-tip">还没有人发布帖子</view>

    <!-- 瀑布流：双列 -->
    <view v-else class="waterfall">
      <view class="column">
        <view
          v-for="item in leftColumn"
          :key="item._id"
          class="card"
          @tap="goDetail(item)"
        >
          <image
            v-if="item.cover"
            class="cover"
            :src="getImageUrl(item.cover)"
            mode="widthFix"
          />
          <view class="body">
            <text class="card-title">{{ item.title }}</text>
            <text class="intro">{{ item.introduction || '暂无描述' }}</text>
            <view class="meta">
              <text class="uploader">{{ item.uploader || '匿名' }}</text>
              <text class="time">{{ formatTime.getTime(item.editTime) }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="column">
        <view
          v-for="item in rightColumn"
          :key="item._id"
          class="card"
          @tap="goDetail(item)"
        >
          <image
            v-if="item.cover"
            class="cover"
            :src="getImageUrl(item.cover)"
            mode="widthFix"
          />
          <view class="body">
            <text class="card-title">{{ item.title }}</text>
            <text class="intro">{{ item.introduction || '暂无描述' }}</text>
            <view class="meta">
              <text class="uploader">{{ item.uploader || '匿名' }}</text>
              <text class="time">{{ formatTime.getTime(item.editTime) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { get } from '@/api/request'
import formatTime from '@/utils/formatTime'
import { getImageUrl } from '@/utils/image'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(true)
const tableData = ref([])

// 瀑布流双列拆分：奇数左列，偶数右列
const leftColumn = computed(() => tableData.value.filter((_, i) => i % 2 === 0))
const rightColumn = computed(() => tableData.value.filter((_, i) => i % 2 === 1))

onMounted(() => {
  getData()
})

async function getData() {
  try {
    //所有角色都能看到全部帖子
    const res = await get('/adminapi/product/showlist')
    tableData.value = res.data.data || []
  } catch (err) {
    uni.showToast({ title: err.message || '获取帖子失败', icon: 'none' })
  }
  loading.value = false
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product-manage/productshowdetail?id=${item._id}` })
}

// 下拉刷新
onPullDownRefresh(async () => {
  try {
    const res = await get('/adminapi/product/showlist')
    tableData.value = res.data.data || []
    uni.showToast({ title: '刷新成功', icon: 'none' })
  } catch (err) {
    uni.showToast({ title: '刷新失败', icon: 'none' })
  }
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.product-show {
  padding: 20rpx;
}

.page-header {
  margin-bottom: 20rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.loading-tip,
.empty-tip {
  text-align: center;
  color: #999;
  padding: 60rpx 0;
}

.waterfall {
  display: flex;
  gap: 20rpx;

  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .card {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);

    .cover {
      width: 100%;
      display: block;
    }

    .body {
      padding: 20rpx;

      .card-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .intro {
        font-size: 24rpx;
        color: #666;
        display: block;
        margin-bottom: 12rpx;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .meta {
        display: flex;
        justify-content: space-between;

        .uploader {
          font-size: 22rpx;
          color: #4366ce;
        }

        .time {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
