/**
 * 用户信息 Store - 对应原 admin 前端的 Vuex store
 * 使用 Pinia 替代 Vuex
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息（持久化存储）
  const userInfo = ref(uni.getStorageSync('userInfo') || {})

  // 更新用户信息
  function changeUserInfo(value) {
    userInfo.value = {
      ...userInfo.value,
      ...value
    }
    uni.setStorageSync('userInfo', userInfo.value)
  }

  // 清空用户信息
  function clearUserInfo() {
    userInfo.value = {}
    uni.removeStorageSync('userInfo')
  }

  return {
    userInfo,
    changeUserInfo,
    clearUserInfo
  }
})
