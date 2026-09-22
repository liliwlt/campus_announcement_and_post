/**
 * 资源地址拼接工具
 */
import { STATIC_URL } from '../api/request'

/**
 * 拼接图片地址
 * 如果是本地临时文件(blob/tempFilePath)直接返回
 * 否则拼接后端静态资源地址
 */
export function getAvatarUrl(path) {
  if (!path) {
    return 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  }
  // 本地临时文件
  if (path.startsWith('blob:') || path.startsWith('http://tmp/') || path.startsWith('wxfile://') || path.startsWith('/var/')) {
    return path
  }
  // #ifdef H5
  return path.startsWith('http') ? path : path
  // #endif
  // #ifndef H5
  return path.startsWith('http') ? path : STATIC_URL + path
  // #endif
}

export function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('blob:') || path.startsWith('http://tmp/') || path.startsWith('wxfile://') || path.startsWith('/var/')) {
    return path
  }
  // #ifdef H5
  return path.startsWith('http') ? path : path
  // #endif
  // #ifndef H5
  return path.startsWith('http') ? path : STATIC_URL + path
  // #endif
}

export default { getAvatarUrl, getImageUrl }
