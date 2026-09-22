/**
 * 文件上传封装 - 对应原 admin 前端的 util/upload.js
 * 使用 uni.uploadFile 代替 axios + FormData
 * 没有选择文件时退化为普通 JSON 请求（后端 multer 对非 multipart 请求会直接跳过）
 */
import { request, buildUrl } from '../api/request'

/**
 * 上传文件（带其他表单字段）
 * @param {String} url 后端接口路径，如 /adminapi/user/upload
 * @param {Object} formData 表单数据
 * @param {String} filePath 临时文件路径（通过 uni.chooseImage 获得），可为空
 * @param {String} fileKey 后端接收文件的字段名，默认 file
 */
export async function upload(url, formData = {}, filePath = '', fileKey = 'file') {
  const token = uni.getStorageSync('token') || ''
  const requestUrl = buildUrl(url)

  // 没有文件：走普通 JSON 请求
  if (!filePath) {
    const res = await request({ url, method: 'POST', data: formData })
    return res.data
  }

  return new Promise((resolve, reject) => {
    //兜底：H5/小程序 multipart 上传时自定义 Authorization 头偶尔会丢失，
    //同时把 token 拼到 URL query，后端中间件在 header 取不到时回退读 query
    const sep = requestUrl.includes('?') ? '&' : '?'
    const uploadUrl = token ? `${requestUrl}${sep}token=${encodeURIComponent(token)}` : requestUrl

    const uploadTask = uni.uploadFile({
      url: uploadUrl,
      filePath,
      name: fileKey,
      formData,
      header: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        // 响应拦截：保存新 token
        if (res.header) {
          const newToken = res.header['Authorization'] || res.header['authorization']
          if (newToken) {
            uni.setStorageSync('token', newToken)
          }
        }
        // uploadFile 的 data 是字符串，需解析
        let data
        try {
          data = JSON.parse(res.data)
        } catch (e) {
          data = res.data
        }
        // 401：token 失效
        if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/notfound/tokenlose' })
          reject(new Error('登录已失效'))
          return
        }
        // 非 2xx 一律按失败处理，避免把 404/500 当成成功
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`上传失败(${res.statusCode})`))
          return
        }
        resolve(data)
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })

    // 上传进度
    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度：' + res.progress + '%')
    })
  })
}

/**
 * 选择图片
 * @param {Number} count 最多选择数量
 */
export function chooseImage(count = 1) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export default upload
