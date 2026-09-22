<template>
  <view class="product-show-detail page-container">
    <view v-if="loading" class="loading-tip">加载中...</view>
    <view v-else-if="!detail.title" class="empty-tip">帖子不存在</view>
    <view v-else>
      <image
        v-if="detail.cover"
        class="cover"
        :src="getImageUrl(detail.cover)"
        mode="widthFix"
      />
      <view class="title-row">
        <text class="title">{{ detail.title }}</text>
        <text v-if="detail.isdelete === 1" class="deleted-tag">已删除</text>
      </view>
      <view class="meta">
        <text class="uploader">发布者：{{ detail.uploader || '匿名' }}</text>
        <text class="time">{{ formatTime.getTime(detail.editTime) }}</text>
      </view>
      <view class="divider"></view>
      <view class="introduction">{{ detail.introduction }}</view>
      <view class="detail-content">{{ detail.detail }}</view>

      <!-- 被管理员驳回的帖子：显示驳回原因和删除时间 -->
      <view v-if="detail.isdelete === 1 && detail.deletereason" class="reject-card">
        <view class="reject-title">
          <text class="reject-icon">⚠</text>
          <text>管理员驳回原因</text>
        </view>
        <view class="reject-reason">{{ detail.deletereason }}</view>
        <view class="reject-time">驳回时间：{{ formatTime.getTime(detail.deleteTime) }}</view>
      </view>

      <!-- 管理员删除按钮 -->
      <view v-if="isAdmin" class="admin-actions">
        <button size="mini" type="warn" @tap="handleDelete">删除帖子</button>
      </view>

      <!-- 评论区 -->
      <view class="comment-section">
        <view class="section-title">评论 ({{ commentList.length }})</view>

        <!-- 发表评论 -->
        <view class="comment-input">
          <uni-easyinput
            v-model="commentText"
            type="textarea"
            placeholder="说点什么..."
            :maxlength="200"
            autoHeight
          />
          <button class="send-btn" type="primary" size="mini" @tap="submitComment">发送</button>
        </view>

        <!-- 评论列表 -->
        <view v-if="commentList.length === 0" class="empty-comment">还没有评论，快来抢沙发</view>
        <view v-else class="comment-list">
          <view v-for="c in commentList" :key="c._id" class="comment-item">
            <view class="comment-head">
              <text class="comment-user">{{ c.username }}</text>
              <text class="comment-time">{{ formatTime.getTime(c.commentTime) }}</text>
            </view>
            <view class="comment-content">{{ c.content }}</view>
            <!-- 只有自己的评论能删，管理员也能删任意 -->
            <view
              v-if="canDeleteComment(c)"
              class="comment-del"
              @tap="deleteComment(c)"
            >删除</view>
          </view>
        </view>
      </view>
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
import { computed, onMounted, reactive, ref } from 'vue'
import { get, post, del } from '@/api/request'
import formatTime from '@/utils/formatTime'
import { getImageUrl } from '@/utils/image'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(true)
const detail = reactive({
  _id: '',
  title: '',
  introduction: '',
  detail: '',
  cover: '',
  uploader: '',
  editTime: '',
  isdelete: 0,
  deletereason: '',
  deleteTime: ''
})

const commentList = ref([])
const commentText = ref('')

// 管理员驳回弹窗
const rejectModalVisible = ref(false)
const rejectReason = ref('')

const isAdmin = computed(() => userStore.userInfo.role === 1)
const currentUsername = computed(() => userStore.userInfo.username || '')

function canDeleteComment(c) {
  return isAdmin.value || c.username === currentUsername.value
}

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
    //帖子详情用 showlist/:id，所有角色都能查看任意帖子
    const res = await get(`/adminapi/product/showlist/${id}`)
    const data = res.data.data || []
    if (data.length > 0) {
      Object.assign(detail, data[0])
      detail._id = id
      getComments(id)
    }
  } catch (err) {
    uni.showToast({ title: err.message || '获取失败', icon: 'none' })
  }
  loading.value = false
}

async function getComments(postId) {
  try {
    const res = await get(`/adminapi/comment/list/${postId}`)
    commentList.value = res.data.data || []
  } catch (err) {
    console.error('获取评论失败', err)
  }
}

async function submitComment() {
  const text = commentText.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入评论内容', icon: 'none' })
    return
  }
  try {
    await post('/adminapi/comment/add', { postId: detail._id, content: text })
    commentText.value = ''
    getComments(detail._id)
    uni.showToast({ title: '评论成功', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: err.message || '评论失败', icon: 'none' })
  }
}

function deleteComment(c) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条评论吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          await del(`/adminapi/comment/${c._id}`)
          getComments(detail._id)
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (err) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 管理员删除帖子：弹出驳回原因输入框
function handleDelete() {
  rejectReason.value = ''
  rejectModalVisible.value = true
}

function closeRejectModal() {
  rejectModalVisible.value = false
  rejectReason.value = ''
}

async function confirmDelete() {
  const reason = rejectReason.value.trim()
  if (!reason) {
    uni.showToast({ title: '请填写驳回原因', icon: 'none' })
    return
  }
  try {
    await del(`/adminapi/product/list/${detail._id}`, { deletereason: reason })
    closeRejectModal()
    // 删除成功后刷新本页数据（会显示驳回原因卡片）
    getData()
    uni.showToast({ title: '删除成功', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: err.message || '删除失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.product-show-detail {
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

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
    flex: 1;
  }

  .deleted-tag {
    flex-shrink: 0;
    font-size: 22rpx;
    color: #dd524d;
    background: #fdecea;
    padding: 4rpx 14rpx;
    border-radius: 6rpx;
  }
}

/* 管理员操作区 */
.admin-actions {
  margin: 20rpx 0;
  text-align: right;
}

/* 驳回原因卡片 */
.reject-card {
  margin: 20rpx 0;
  padding: 20rpx;
  background: #fff8f8;
  border: 1rpx solid #ffd6d6;
  border-radius: 8rpx;

  .reject-title {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    font-weight: bold;
    color: #dd524d;
    margin-bottom: 10rpx;

    .reject-icon {
      margin-right: 8rpx;
    }
  }

  .reject-reason {
    font-size: 28rpx;
    color: #555;
    line-height: 1.6;
    margin-bottom: 10rpx;
    word-break: break-all;
  }

  .reject-time {
    font-size: 22rpx;
    color: #999;
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

.meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;

  .uploader {
    font-size: 24rpx;
    color: #4366ce;
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

.introduction {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.detail-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  word-break: break-all;
  margin-bottom: 30rpx;
}

/* 评论区 */
.comment-section {
  margin-top: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.comment-input {
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
  margin-bottom: 24rpx;

  .send-btn {
    flex-shrink: 0;
    background-color: #4366ce;
    color: #fff;
    border-radius: 8rpx;
    font-size: 24rpx;
    padding: 0 20rpx;
    line-height: 60rpx;
  }
}

.empty-comment {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 40rpx 0;
}

.comment-list {
  .comment-item {
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    position: relative;

    &:last-child {
      border-bottom: none;
    }
  }

  .comment-head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10rpx;

    .comment-user {
      font-size: 26rpx;
      font-weight: bold;
      color: #4366ce;
    }

    .comment-time {
      font-size: 22rpx;
      color: #999;
    }
  }

  .comment-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    word-break: break-all;
  }

  .comment-del {
    position: absolute;
    right: 0;
    bottom: 20rpx;
    font-size: 22rpx;
    color: #dd524d;
    padding: 4rpx 12rpx;
  }
}
</style>
