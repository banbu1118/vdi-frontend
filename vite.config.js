import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: ['/guacamole-common-js/guacamole-common.min.js']
    }
  },
  // 配置代理，将/api请求转发到后端服务
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://192.168.1.60:443',
        changeOrigin: true,
        // 移除rewrite，保留/api/v1路径前缀
        // 开发环境下禁用HTTPS证书验证
        secure: false
      }
    },
    // 配置前端开发服务器端口
    port: 5173,
    // 自动打开浏览器
    open: true,
    // 允许其他主机访问
    host: '0.0.0.0'
  }
})
