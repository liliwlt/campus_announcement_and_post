<template>
  <view class="news-list">
    <view class="page-header">
      <text class="title">公告列表</text>
    </view>

    <view class="list-container">
      <view v-if="tableData.length === 0" class="empty-tip">暂无公告数据</view>
      <uni-swipe-action ref="swipeAction">
        <uni-swipe-action-item
          v-for="item in tableData"
          :key="item._id"
          :right-options="isAdmin ? swipeOptions : []"
          @click="onSwipeClick($event, item)"
        >
          <view class="news-item">
            <image v-if="item.cover" class="cover" :src="getImageUrl(item.cover)" mode="aspectFill" />
            <view v-else class="cover placeholder">无图</view>
            <view class="info">
              <text class="news-title" @tap="handleDetail(item)">{{ item.title }}</text>
              <view class="meta">
                <text class="category-tag">{{ categoryFormat(item.category) }}</text>
                <text class="time">{{ formatTime.getTime(item.editTime) }}</text>
              </view>
              <!-- 管理员才显示发布状态和操作按钮 -->
              <view v-if="isAdmin" class="status-row">
                <text class="status" :class="{ published: item.isPublish === 1 }">
                  {{ item.isPublish === 1 ? '已发布' : '未发布' }}
                </text>
                <switch
                  :checked="item.isPublish === 1"
                  color="#4cd964"
                  @change="handleSwitchChange(item, $event)"
                  class="switch"
                />
              </view>
            </view>
            <view v-if="isAdmin" class="actions">
              <button size="mini" @tap.stop="handlePreview(item)">预览</button>
              <button size="mini" @tap.stop="handleEdit(item)">编辑</button>
              <button size="mini" type="warn" @tap.stop="handleDelete(item)">删除</button>
            </view>
            <!-- 普通用户只显示查看按钮 -->
            <view v-else class="actions">
              <button size="mini" @tap.stop="handleDetail(item)">查看</button>
            </view>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>
    </view>

    <!-- 预览弹窗（管理员用） -->
    <uni-popup ref="previewPopup" type="center" :is-mask-click="true">
      <view class="preview-popup">
        <view class="preview-title">{{ previewData.title }}</view>
        <view class="preview-time">{{ formatTime.getTime(previewData.editTime) }}</view>
        <view class="preview-divider"></view>
        <scroll-view scroll-y class="preview-content">
          <rich-text :nodes="previewData.content" />
        </scroll-view>
        <view class="preview-footer">
          <button @tap="closePreview">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { get, put, del } from '@/api/request'
import formatTime from '@/utils/formatTime'
import { getImageUrl } from '@/utils/image'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const tableData = ref([])
const previewPopup = ref()
const previewData = ref({})
const swipeAction = ref()
const isAdmin = computed(() => userStore.userInfo.role === 1)

const swipeOptions = [
  { text: '删除', style: { backgroundColor: '#dd524d' } }
]

function onSwipeClick(e, item) {
  //只有管理员有删除按钮（right-options 为空时不会触发）
  if (e.index === 0) {
    swipeAction.value.closeAll()
    handleDelete(item)
  }
}

onMounted(() => {
  getTableData()
})

async function getTableData() {
  try {
    //管理员用 /adminapi/news/list（可管理），普通用户用 readlist（只读）
    const url = isAdmin.value ? '/adminapi/news/list' : '/adminapi/news/readlist'
    const res = await get(url)
    tableData.value = res.data.data || []
  } catch (err) {
    console.error('获取公告列表失败', err)
    uni.showToast({ title: err.message || '获取列表失败', icon: 'none' })
  }
}

function categoryFormat(category) {
  const arr = ['最新动态', '典型案例', '通知公告']
  return arr[category - 1] || '未知'
}

//普通用户点击标题或查看按钮，跳转公告详情页
function handleDetail(item) {
  uni.navigateTo({ url: `/pages/news-manage/newsdetail?id=${item._id}` })
}

async function handleSwitchChange(item, e) {
  const isPublish = e.detail.value ? 1 : 0
  item.isPublish = isPublish
  try {
    await put('/adminapi/news/publish', { _id: item._id, isPublish })
    getTableData()
  } catch (err) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

function handlePreview(data) {
  previewData.value = data
  previewPopup.value.open()
}

function closePreview() {
  previewPopup.value.close()
}

function handleEdit(item) {
  uni.navigateTo({ url: `/pages/news-manage/newsedit?id=${item._id}` })
}

function handleDelete(data) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该公告吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          await del(`/adminapi/news/list/${data._id}`)
          getTableData()
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (err) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.news-list {
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

.list-container {
  .news-item {
    display: flex;
    background: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    .cover {
      width: 160rpx;
      height: 160rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
      flex-shrink: 0;
      background-color: #eee;

      &.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ccc;
        font-size: 24rpx;
      }
    }

    .info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;

      .news-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
          font-size: 22rpx;
          color: #999;
        }
      }

      .status-row {
        display: flex;
        align-items: center;

        .status {
          font-size: 22rpx;
          color: #dd524d;
          margin-right: 16rpx;

          &.published {
            color: #4cd964;
          }
        }

        .switch {
          transform: scale(0.8);
        }
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      flex-shrink: 0;
      justify-content: center;

      button {
        margin: 0;
        font-size: 22rpx;
        padding: 0 16rpx;
        line-height: 56rpx;
      }
    }
  }
}

.preview-popup {
  width: 640rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;

  .preview-title {
    font-size: 36rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10rpx;
  }

  .preview-time {
    font-size: 24rpx;
    color: #999;
    text-align: center;
  }

  .preview-divider {
    height: 1rpx;
    background: #eee;
    margin: 20rpx 0;
  }

  .preview-content {
    max-height: 600rpx;
    font-size: 28rpx;
    line-height: 1.6;
  }

  .preview-footer {
    margin-top: 20rpx;

    button {
      width: 100%;
    }
  }
}
</style>
