<template>
  <view class="product-list">
    <view class="page-header">
      <text class="title">帖子列表</text>
    </view>

    <view class="list-container">
      <view v-if="tableData.length === 0" class="empty-tip">{{ isAdmin ? '暂无帖子数据' : '你还没有发布过帖子' }}</view>
      <uni-swipe-action ref="swipeAction">
        <uni-swipe-action-item
          v-for="item in tableData"
          :key="item._id"
          :right-options="item.isdelete === 1 ? [] : swipeOptions"
          @click="onSwipeClick($event, item)"
        >
          <view
            class="product-item"
            :class="{ deleted: item.isdelete === 1 }"
            @tap="goDetail(item)"
          >
            <image v-if="item.cover" class="cover" :src="getImageUrl(item.cover)" mode="aspectFill" />
            <view v-else class="cover placeholder">无图</view>
            <view class="info">
              <view class="title-row">
                <text class="product-title">{{ item.title }}</text>
                <text v-if="item.isdelete === 1" class="deleted-tag">已删除</text>
              </view>
              <text class="intro">{{ item.introduction || '暂无描述' }}</text>
              <view class="meta">
                <text class="uploader">发布者：{{ item.uploader || '未知' }}</text>
                <text class="time">{{ formatTime.getTime(item.editTime) }}</text>
              </view>

              <!-- 被管理员驳回的帖子：额外显示驳回原因和删除时间 -->
              <view v-if="item.isdelete === 1 && item.deletereason" class="reject-card">
                <view class="reject-title">
                  <text class="reject-icon">⚠</text>
                  <text>管理员驳回原因</text>
                </view>
                <view class="reject-reason">{{ item.deletereason }}</view>
                <view class="reject-time">驳回时间：{{ formatTime.getTime(item.deleteTime) }}</view>
              </view>
              <!-- 自己删除的帖子（无驳回原因）也提示删除时间 -->
              <view v-else-if="item.isdelete === 1" class="reject-card self-deleted">
                <view class="reject-time">删除时间：{{ formatTime.getTime(item.deleteTime) }}</view>
              </view>
            </view>
            <view class="actions">
              <!-- 管理员不能编辑，只显示删除；普通用户可编辑和删除自己的；已删除帖子不能编辑 -->
              <button v-if="!isAdmin && item.isdelete !== 1" size="mini" @tap.stop="handleEdit(item)">编辑</button>
              <button size="mini" type="warn" @tap.stop="handleDelete(item)">删除</button>
            </view>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>
    </view>

    <!-- 管理员删除帖子：填写驳回原因弹窗 -->
    <view v-if="rejectModalVisible" class="modal-mask" @tap="closeRejectModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-title">删除帖子</view>
        <view class="modal-tip">请填写驳回原因（必填）</view>
        <textarea
          class="reject-textarea"
          v-model="rejectReason"
          placeholder="请输入驳回原因"
          maxlength="200"
        />
        <view class="modal-btns">
          <button size="mini" @tap="closeRejectModal">取消</button>
          <button size="mini" type="warn" @tap="confirmDelete">确认删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { get, del } from '@/api/request'
import formatTime from '@/utils/formatTime'
import { getImageUrl } from '@/utils/image'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const tableData = ref([])
const isAdmin = computed(() => userStore.userInfo.role === 1)

// 管理员驳回弹窗
const rejectModalVisible = ref(false)
const rejectReason = ref('')
const pendingDeleteItem = ref(null)

// 左划删除
const swipeAction = ref()
const swipeOptions = [
  { text: '删除', style: { backgroundColor: '#dd524d' } }
]

function onSwipeClick(e, item) {
  //已删除的帖子没有 right-options，不会触发；这里直接走 handleDelete（管理员会弹驳回弹窗）
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
    //后端会根据角色返回：管理员返回全部（含已删除），普通用户只返回自己的（含被驳回/已删除）
    const res = await get('/adminapi/product/list')
    tableData.value = res.data.data || []
  } catch (err) {
    console.error('获取帖子列表失败', err)
    uni.showToast({ title: err.message || '获取列表失败', icon: 'none' })
  }
}

function goDetail(item) {
  uni.navigateTo({ url: `/pages/product-manage/productshowdetail?id=${item._id}` })
}

function handleEdit(item) {
  uni.navigateTo({ url: `/pages/product-manage/productedit?id=${item._id}` })
}

function handleDelete(data) {
  if (isAdmin.value) {
    //管理员删除：弹出驳回原因输入框
    pendingDeleteItem.value = data
    rejectReason.value = ''
    rejectModalVisible.value = true
  } else {
    //普通用户删除：直接确认（无需驳回原因）
    uni.showModal({
      title: '确认删除',
      content: '确定要删除该帖子吗?',
      success: async (res) => {
        if (res.confirm) {
          try {
            await del(`/adminapi/product/list/${data._id}`)
            getTableData()
            uni.showToast({ title: '删除成功', icon: 'success' })
          } catch (err) {
            uni.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
}

function closeRejectModal() {
  rejectModalVisible.value = false
  pendingDeleteItem.value = null
  rejectReason.value = ''
}

async function confirmDelete() {
  const reason = rejectReason.value.trim()
  if (!reason) {
    uni.showToast({ title: '请填写驳回原因', icon: 'none' })
    return
  }
  const item = pendingDeleteItem.value
  if (!item) return
  try {
    await del(`/adminapi/product/list/${item._id}`, { deletereason: reason })
    closeRejectModal()
    getTableData()
    uni.showToast({ title: '删除成功', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: err.message || '删除失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.product-list {
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
  .product-item {
    display: flex;
    background: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    &.deleted {
      opacity: 0.75;
      border: 2rpx solid #ffcccb;
    }

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

      .title-row {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;

        .product-title {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .deleted-tag {
          margin-left: 12rpx;
          flex-shrink: 0;
          font-size: 20rpx;
          color: #dd524d;
          background: #fdecea;
          padding: 2rpx 10rpx;
          border-radius: 6rpx;
        }
      }

      .intro {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 10rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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

      /* 驳回原因卡片 */
      .reject-card {
        margin-top: 16rpx;
        padding: 16rpx;
        background: #fff8f8;
        border: 1rpx solid #ffd6d6;
        border-radius: 8rpx;

        &.self-deleted {
          background: #f7f7f7;
          border-color: #e0e0e0;
        }

        .reject-title {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          font-weight: bold;
          color: #dd524d;
          margin-bottom: 8rpx;

          .reject-icon {
            margin-right: 6rpx;
          }
        }

        .reject-reason {
          font-size: 26rpx;
          color: #555;
          line-height: 1.5;
          margin-bottom: 8rpx;
          word-break: break-all;
        }

        .reject-time {
          font-size: 22rpx;
          color: #999;
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

/* 驳回原因弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 80%;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;

  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 16rpx;
  }

  .modal-tip {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .reject-textarea {
    width: 100%;
    height: 160rpx;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    padding: 16rpx;
    font-size: 26rpx;
    box-sizing: border-box;
    margin-bottom: 24rpx;
  }

  .modal-btns {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
  }
}
</style>
