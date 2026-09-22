/**
 * 后端 API 请求封装 - 基于 uni.request
 * 对应原 admin 前端的 axios.config.js 拦截器逻辑：
 * - 请求自动携带 Authorization: Bearer <token>
 * - 响应自动保存后端返回的新 token
 * - 401 时清除 token 并跳转登录失效页
 * - 非 2xx 状态码一律按失败处理，避免把 404/500 当成成功
 */

// #ifdef H5
const API_HOST = '' // H5 下走 vite proxy（见 vite.config.js），相对路径即可
// #endif

// #ifndef H5
const API_HOST = 'http://localhost:3000' // 小程序/App 直连后端
// #endif

export const BASE_URL = API_HOST + '/adminapi'
export const STATIC_URL = API_HOST

/**
 * 拼接请求地址
 * H5:  /adminapi/xxx                       -> vite proxy 转发到 localhost:3000
 * 其他: http://localhost:3000/adminapi/xxx
 * 注意：url 本身已带 /adminapi 前缀，不要再拼 BASE_URL，否则会变成 /adminapi/adminapi/...
 */
export function buildUrl(url) {
  if (/^https?:\/\//.test(url)) return url
  return API_HOST + url
}

export function request(options = {}) {
  const { url, method = 'GET', data = {}, header = {} } = options

  // 请求拦截：自动携带 token
  const token = uni.getStorageSync('token') || ''
  const fullHeader = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    ...header
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(url),
      method: method.toUpperCase(),
      data,
      header: fullHeader,
      success: (res) => {
        // 响应拦截：保存后端返回的新 token
        const newToken = res.header && (res.header['Authorization'] || res.header['authorization'])
        if (newToken) {
          uni.setStorageSync('token', newToken)
        }
        // 401：token 失效，清除并跳转登录失效页
        if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/notfound/tokenlose' })
          reject(new Error('登录已失效'))
          return
        }
        // 其他非 2xx 一律按失败处理
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`请求失败(${res.statusCode})`))
          return
        }
        resolve(res)
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

/**
 * 封装常用请求方法
 */
export function get(url, data = {}, header = {}) {
  return request({ url, method: 'GET', data, header })
}

export function post(url, data = {}, header = {}) {
  return request({ url, method: 'POST', data, header })
}

export function put(url, data = {}, header = {}) {
  return request({ url, method: 'PUT', data, header })
}

export function del(url, data = {}, header = {}) {
  return request({ url, method: 'DELETE', data, header })
}

export default {
  request,
  get,
  post,
  put,
  del,
  buildUrl,
  BASE_URL,
  STATIC_URL
}
