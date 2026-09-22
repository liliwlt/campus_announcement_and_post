import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      // 后端接口（需登录）
      '/adminapi': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      // 后端公开接口（首页轮播等，无需登录）
      '/webapi': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      // 后端静态资源（头像/新闻封面/产品图片）
      '/avataruploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/newsuploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/Productuploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
