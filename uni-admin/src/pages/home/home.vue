<template>
  <view class="home-page">
    <!-- 欢迎卡片 -->
    <uni-card class="welcome-card" :is-shadow="true" :border="false">
      <view class="welcome-row">
        <image class="avatar" :src="avatarUrl" mode="aspectFill" />
        <view class="welcome-text">
          <text class="hello">欢迎{{ userStore.userInfo.username || '' }}回来</text>
          <text class="sub">{{ welcomeText }}</text>
        </view>
      </view>
    </uni-card>

    <!-- 公告轮播（所有角色可见，点击跳转公告详情） -->
    <uni-card class="product-card" :is-shadow="true" :border="false">
      <template v-slot:title>
        <view class="card-title">公告通知</view>
      </template>
      <swiper
        v-if="loopList.length"
        class="swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="4000"
        :duration="500"
        circular
      >
        <swiper-item v-for="item in loopList" :key="item._id" @tap="onNewsTap(item)">
          <view class="swiper-item">
            <image class="swiper-img" :src="getImageUrl(item.cover)" mode="aspectFill" />
            <view class="swiper-title">{{ item.title }}</view>
          </view>
        </swiper-item>
      </swiper>
      <view v-else class="empty-tip">暂无公告</view>
    </uni-card>

    <!-- 快捷入口 -->
    <uni-card class="quick-card" :is-shadow="true" :border="false">
      <template v-slot:title>
        <view class="card-title">管理入口</view>
      </template>
      <view class="quick-grid">
        <view
          v-for="item in menuItems"
          :key="item.path"
          class="quick-item"
          @tap="goPage(item)"
        >
          <view class="quick-icon" :style="{ backgroundColor: item.color }">
            <text class="icon-text">{{ item.icon }}</text>
          </view>
          <text class="quick-label">{{ item.label }}</text>
        </view>
      </view>
    </uni-card>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { get } from '@/api/request'
import { useUserStore } from '@/store/user'
import { getAvatarUrl, getImageUrl } from '@/utils/image'

const userStore = useUserStore()
const loopList = ref([])

const avatarUrl = computed(() => getAvatarUrl(userStore.userInfo.avatar))
const welcomeText = computed(() => (new Date().getHours() < 12 ? '现在是上午' : '现在是下午'))

const menuItems = computed(() => {
  const base = [
    { label: '个人中心', icon: '人', path: '/pages/center/center', color: '#36c5f0' },
    { label: '帖子广场', icon: '广', path: '/pages/product-manage/productshow', color: '#e74c3c' },
	{ label: '公告列表', icon: '闻', path: '/pages/news-manage/newslist', color: '#f0ad4e' }
  ]
  if (userStore.userInfo.role === 1) {
    //管理员：用户管理 + 公告 + 帖子（只看不发）
    base.unshift(
      { label: '添加用户', icon: '加', path: '/pages/user-manage/useradd', color: '#4366ce' },
      { label: '用户列表', icon: '户', path: '/pages/user-manage/userlist', color: '#1abc9c' },
      { label: '创建公告', icon: '文', path: '/pages/news-manage/newsadd', color: '#4cd964' },
    )
  } else {
    //普通用户：可以发布帖子，也能查看公告列表
    base.unshift(
	  { label: '发布帖子', icon: '发', path: '/pages/product-manage/productadd', color: '#dd524d' },
	  { label: '我的帖子', icon: '帖', path: '/pages/product-manage/productlist', color: '#9b59b6' },
    )
  }
  return base
})

onMounted(() => {
  getData()
})

async function getData() {
  try {
    const res = await get('/adminapi/news/readlist')
    loopList.value = res.data.data || []
  } catch (err) {
    console.error('获取公告列表失败', err)
  }
}

function onNewsTap(item) {
  //所有角色都能跳转到公告详情页
  uni.navigateTo({ url: `/pages/news-manage/newsdetail?id=${item._id}` })
}

function goPage(item) {
  uni.navigateTo({ url: item.path })
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 20rpx;
}

.welcome-card {
  margin-bottom: 20rpx;
}

.welcome-row {
  display: flex;
  align-items: center;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 30rpx;
    background-color: #eee;
  }

  .welcome-text {
    display: flex;
    flex-direction: column;

    .hello {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .sub {
      font-size: 26rpx;
      color: #999;
      margin-top: 10rpx;
    }
  }
}

.news-card {
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  padding: 10rpx 0;
}

.swiper {
  height: 300rpx;
  border-radius: 12rpx;
  overflow: hidden;

  .swiper-item {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .swiper-img {
    width: 100%;
    height: 100%;
  }

  .swiper-title {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    color: #fff;
    font-size: 30rpx;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  }
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;

  .quick-item {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0;

    .quick-icon {
      width: 90rpx;
      height: 90rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon-text {
        color: #fff;
        font-size: 36rpx;
        font-weight: bold;
      }
    }

    .quick-label {
      font-size: 26rpx;
      color: #666;
      margin-top: 12rpx;
    }
  }
}
</style>
