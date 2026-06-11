import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import i18n from './locales'

const app = createApp(App)

// 语言翻译映射 - 用于axios拦截器中独立使用
const tokenExpiredMessages = {
  'zh-CN': '会话已过期，请重新登录',
  'zh-TW': '會話已過期，請重新登錄',
  'en': 'Session expired, please login again',
  'ja': 'セッションが期限切れです。再度ログインしてください'
}

// 获取当前语言
function getCurrentLanguage() {
  return localStorage.getItem('app-language') || 'en'
}

// 标记是否已经显示过token过期提示，防止重复提示
window.tokenExpiredMessageShown = false

// 配置axios - 现在改为'/api/v1'，由vite代理转发到实际后端
axios.defaults.baseURL = '/api/v1'
// 设置请求超时时间
axios.defaults.timeout = 10000

// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 从localStorage中获取token
    const token = localStorage.getItem('token')
    // 如果存在token，则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  response => {
    // 根据接口规范，统一处理响应
    // 大部分接口可能返回{code, message, data}格式
    // 这里可以根据需要进行统一的数据转换或处理
    return response
  },
  error => {
    // 处理401和403错误（未授权或禁止访问）- JWT token验证失败
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // 排除登录接口的401错误处理（登录时还没有token，401表示用户名/密码错误）
      const requestUrl = error.response.config.url
      if (requestUrl && requestUrl.includes('/auth/login')) {
        // 登录接口的401错误由登录页面自己处理
        return Promise.reject(error)
      }
      
      // 如果已经显示过token过期提示，就不再显示，只重定向
      if (!window.tokenExpiredMessageShown) {
        window.tokenExpiredMessageShown = true
        
        const currentLang = getCurrentLanguage()
        const message = tokenExpiredMessages[currentLang] || tokenExpiredMessages['en']
        
        // 使用ElementPlus的ElMessage显示提示
        import('element-plus').then(({ ElMessage }) => {
          ElMessage.error(message)
        })
        
        console.error('认证失败，需要重新登录')
      }
      
      // 清除localStorage中的token
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('userRole')
      // 重定向到登录页面
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

app.config.globalProperties.$axios = axios

// 使用插件
app.use(ElementPlus)
app.use(router)
app.use(i18n)

app.mount('#app')
