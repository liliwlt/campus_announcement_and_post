<template>
  <view class="avatar-uploader" @tap="chooseAndUpload">
    <image v-if="avatarUrl" :src="avatarUrl" class="avatar" mode="aspectFill" />
    <view v-else class="upload-placeholder">
      <text class="icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { getAvatarUrl } from '@/utils/image'

const props = defineProps({
  avatar: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['eventchange'])

const avatarUrl = computed(() => getAvatarUrl(props.avatar))

function chooseAndUpload() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed', 'original'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 传递临时文件路径给父组件
      emit('eventchange', tempFilePath)
    },
    fail: () => {
      uni.showToast({ title: '取消选择', icon: 'none' })
    }
  })
}
</script>

<style lang="scss" scoped>
.avatar-uploader {
  width: 180rpx;
  height: 180rpx;
  border: 1rpx dashed #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .avatar {
    width: 100%;
    height: 100%;
  }

  .upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      font-size: 56rpx;
      color: #8c939d;
    }
  }
}
</style>
