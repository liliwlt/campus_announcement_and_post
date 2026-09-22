/**
 * 时间格式化工具 - 对应原 admin 前端的 util/formatTime.js
 * 不依赖 moment，使用原生 Date
 */
const formatTime = {
  /**
   * 格式化时间 YYYY/MM/DD
   */
  getTime(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}/${m}/${day}`
  },
  /**
   * 格式化时间 YYYY-MM-DD HH:mm:ss
   */
  getFullTime(date) {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const s = String(d.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}:${s}`
  }
}

export default formatTime
