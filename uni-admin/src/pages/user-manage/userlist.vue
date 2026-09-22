<template>
  <view class="user-list">
    <view class="page-header">
      <text class="title">用户列表</text>
    </view>

    <!-- 用户列表 -->
    <view class="list-container">
      <view v-if="tableData.length === 0" class="empty-tip">暂无用户数据</view>
      <uni-swipe-action ref="swipeAction">
        <uni-swipe-action-item
          v-for="item in tableData"
          :key="item._id"
          :right-options="swipeOptions"
          @click="onSwipeClick($event, item)"
        >
          <view class="user-item">
            <image class="avatar" :src="getAvatarUrl(item.avatar)" mode="aspectFill" />
            <view class="info">
              <view class="name-row">
                <text class="name">{{ item.username }}</text>
                <text class="role-tag" :class="{ admin: item.role === 1 }">
                  {{ item.role === 1 ? '管理员' : '用户' }}
                </text>
              </view>
              <text class="intro">{{ item.introduction || '暂无介绍' }}</text>
            </view>
            <view class="actions">
              <button size="mini" @tap.stop="handleEdit(item)">编辑</button>
              <button size="mini" type="warn" @tap.stop="handleDelete(item)">删除</button>
            </view>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>
    </view>

    <!-- 编辑弹窗 -->
    <uni-popup ref="editPopup" type="center" :is-mask-click="true" @change="onPopupChange">
      <view class="edit-popup">
        <view class="popup-title">编辑用户</view>
        <uni-forms ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80">
          <uni-forms-item label="用户名" name="username">
            <uni-easyinput v-model="userForm.username" placeholder="请输入用户名" />
          </uni-forms-item>
          <uni-forms-item label="密码" name="password">
            <uni-easyinput v-model="userForm.password" type="password" placeholder="请输入密码" />
          </uni-forms-item>
          <uni-forms-item label="角色" name="role">
            <uni-data-select v-model="userForm.role" :localdata="roleOptions" placeholder="选择权限" />
          </uni-forms-item>
          <uni-forms-item label="个人介绍" name="introduction">
            <uni-easyinput v-model="userForm.introduction" type="textarea" placeholder="请输入介绍" />
          </uni-forms-item>
        </uni-forms>
        <view class="popup-footer">
          <button size="mini" @tap="closeEdit">取消</button>
          <button size="mini" type="primary" @tap="handleEditConfirm">提交</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { get, put, del } from '@/api/request'
import { getAvatarUrl } from '@/utils/image'

const tableData = ref([])
const editPopup = ref()
const userFormRef = ref()
const swipeAction = ref()

const swipeOptions = [
  { text: '删除', style: { backgroundColor: '#dd524d' } }
]

function onSwipeClick(e, item) {
  //e = {content, index}，这里只有一个删除按钮，直接触发删除
  if (e.index === 0) {
    swipeAction.value.closeAll()
    handleDelete(item)
  }
}

const userForm = reactive({
  _id: '',
  username: '',
  password: '',
  role: 2,
  introduction: ''
})

const userFormRules = {
  username: { rules: [{ required: true, errorMessage: '请输入名字' }] },
  password: { rules: [{ required: true, errorMessage: '请选择密码' }] },
  role: { rules: [{ required: true, errorMessage: '请选择权限' }] },
  introduction: { rules: [{ required: true, errorMessage: '请输入介绍' }] }
}

const roleOptions = [
  { value: 1, text: '管理员' },
  { value: 2, text: '用户' }
]

onMounted(() => {
  getTableData()
})

async function getTableData() {
  try {
    const res = await get('/adminapi/user/list')
    tableData.value = res.data.data || []
  } catch (err) {
    console.error('获取用户列表失败', err)
  }
}

async function handleEdit(data) {
  try {
    const res = await get(`/adminapi/user/list/${data._id}`)
    Object.assign(userForm, res.data.data[0])
    editPopup.value.open()
  } catch (err) {
    uni.showToast({ title: '获取用户信息失败', icon: 'error' })
  }
}

function onPopupChange(e) {
  if (!e.show) {
    resetForm()
  }
}

function closeEdit() {
  editPopup.value.close()
}

function resetForm() {
  Object.assign(userForm, { _id: '', username: '', password: '', role: 2, introduction: '' })
}

function handleEditConfirm() {
  userFormRef.value.validate().then(async (valid) => {
    if (valid) {
      try {
        await put(`/adminapi/user/list/${userForm._id}`, userForm)
        editPopup.value.close()
        getTableData()
        uni.showToast({ title: '更新成功', icon: 'success' })
      } catch (err) {
        uni.showToast({ title: '更新失败', icon: 'error' })
      }
    }
  }).catch(() => {})
}

function handleDelete(data) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该用户吗?',
    success: async (res) => {
      if (res.confirm) {
        try {
          await del(`/adminapi/user/list/${data._id}`)
          getTableData()
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (err) {
          uni.showToast({ title: '删除失败', icon: 'error' })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.user-list {
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
  .user-item {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    .avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      background-color: #eee;
      flex-shrink: 0;
    }

    .info {
      flex: 1;
      min-width: 0;

      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;

        .name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          margin-right: 16rpx;
        }

        .role-tag {
          font-size: 22rpx;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          background-color: #fff1f0;
          color: #dd524d;

          &.admin {
            background-color: #f0fff4;
            color: #4cd964;
          }
        }
      }

      .intro {
        font-size: 24rpx;
        color: #999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 10rpx;
      flex-shrink: 0;

      button {
        margin: 0;
        font-size: 22rpx;
        padding: 0 16rpx;
        line-height: 56rpx;
      }
    }
  }
}

.edit-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  max-height: 80vh;
  overflow-y: auto;

  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20rpx;
  }

  .popup-footer {
    display: flex;
    justify-content: space-around;
    margin-top: 20rpx;

    button {
      width: 40%;
    }
  }
}
</style>
