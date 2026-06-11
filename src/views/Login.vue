<template>
  <div class="login-container">
    <LanguageSwitcher />
    <div class="login-content">
        <div class="login-left">
          <div class="login-brand">
            <h1>{{ t('brand.name') }}</h1>
            <p class="brand-desc">{{ t('brand.description') }}</p>
          </div>
        </div>
        <div class="login-right">
          <div class="login-form-wrapper">
            <div class="login-header">
              <h2>{{ t('login.title') }}</h2>
            </div>
            <el-form
              :model="loginForm"
              :rules="rules"
              ref="loginFormRef"
              label-position="top"
              label-width="100px"
              class="login-form"
              @submit.prevent="login"
            >
              <el-form-item :label="t('login.username')" prop="username">
                <el-input
                  v-model="loginForm.username"
                  :placeholder="t('login.usernamePlaceholder')"
                  size="large"
                ></el-input>
              </el-form-item>
              <el-form-item :label="t('login.password')" prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  :placeholder="t('login.passwordPlaceholder')"
                  show-password
                  size="large"
                ></el-input>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  native-type="submit"
                  :loading="loading"
                  style="width: 100%"
                  size="large"
                >{{ t('login.login') }}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

export default {
  name: 'Login',
  components: {
    LanguageSwitcher
  },
  setup() {
    const router = useRouter()
    const loginFormRef = ref(null)
    const loading = ref(false)
    const { t } = useI18n()
    
    // 组件挂载时重置token过期提示标记
    onMounted(() => {
      window.tokenExpiredMessageShown = false
    })

    const loginForm = ref({
      username: '',
      password: ''
    })

    const rules = {
      username: [
        { required: true, message: t('login.username') + t('login.required'), trigger: 'blur' }
      ],
      password: [
        { required: true, message: t('login.password') + t('login.required'), trigger: 'blur' },
        { min: 6, message: t('login.password') + t('login.passwordMinLength'), trigger: 'blur' }
      ]
    }

    const login = async () => {
      if (loading.value) return
      
      loading.value = true

      await loginFormRef.value.validate(async (valid) => {
        if (!valid) {
          loading.value = false
          return false
        }

        try {
          const loginServer = `${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}`

          const loginData = {
            username: loginForm.value.username,
            password: loginForm.value.password,
            login_server: window.location.hostname,
            client_type: 'web_client'
          }

          const response = await axios.post('/auth/login', loginData)

          if (response.data?.code === 0 && response.data?.data?.token) {
            const token = response.data.data.token
            const username = response.data.data.username
            
            // 重置token过期提示标记，允许下次token过期时再次显示提示
            window.tokenExpiredMessageShown = false

            let userRole = 'user'
            try {
              const tokenParts = token.split('.')
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]))
                userRole = payload.role || 'user'
              }
            } catch (e) {
              console.error('解析token失败:', e)
            }

            localStorage.setItem('token', token)
            localStorage.setItem('username', username)
            localStorage.setItem('userRole', userRole)

            ElMessage.success(t('login.loginSuccess'))

            if (userRole === 'admin') {
              router.push('/home/vmlist')
            } else {
              router.push('/user')
            }
          } else {
            console.error('无效的响应数据:', response.data)
            ElMessage.error(t('login.loginFailed') + '：' + t('login.invalidResponse'))
          }
        } catch (error) {
          console.error('登录请求错误:', error)

          if (error.response) {
            console.error('响应状态:', error.response.status)
            console.error('响应数据:', error.response.data)
            const status = error.response.status
            if (status === 401) {
              ElMessage.error(t('login.loginFailed') + '：' + t('login.invalidCredentials'))
            } else if (status === 423) {
              ElMessage.error(t('login.loginFailed') + '：' + t('login.accountLocked'))
            } else {
              ElMessage.error(t('login.loginFailed'))
            }
          } else if (error.request) {
            console.error('网络错误详情:', error.request)
            ElMessage.error(t('login.networkError'))
          } else {
            console.error('请求配置错误:', error.message)
            ElMessage.error(t('login.loginFailed') + '：' + error.message)
          }
        } finally {
          loading.value = false
        }
      })
    }

    return {
      loginFormRef,
      loginForm,
      rules,
      loading,
      login,
      t
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  z-index: 1000;
}

:deep(.el-form-item__error) {
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1;
  padding-top: 4px;
  position: relative;
  z-index: 1;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
  position: relative;
}

:deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.el-input__wrapper.is-error:focus-within) {
  box-shadow: 0 0 0 1px #f56c6c inset, 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.login-content {
  position: relative;
  display: flex;
  flex-direction: row;
  max-width: 1400px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  align-items: center;
  justify-content: center;
}

.login-left {
  flex: 1;
  padding-right: 40px;
  padding-left: 150px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.login-brand h1 {
  font-size: clamp(2.5rem, 6vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.brand-desc {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 40px;
}

.login-right {
  flex: 0 0 480px;
  max-width: 100%;
}

.login-form-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.6s ease-out;
  width: 100%;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  padding: 30px 24px 16px;
  text-align: center;
}

.login-header h2 {
  font-size: clamp(1.5rem, 3vw, 1.75rem);
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.login-form {
  padding: 0 24px 24px;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-button) {
  width: 100%;
  font-size: 16px;
  padding: 12px 0;
}

@media (max-width: 1024px) {
  .login-left {
    flex: 0 0 50%;
    padding-right: 30px;
  }
}

@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
    padding: 40px 16px;
    height: auto;
    min-height: 100vh;
  }

  .login-left {
    flex: none;
    padding-right: 0;
    margin-bottom: 30px;
    text-align: center;
  }

  .login-right {
    flex: none;
    width: 100%;
    max-width: 420px;
  }

  .login-brand h1 {
    font-size: 2rem;
  }

  .login-form-wrapper {
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 20px 12px;
  }

  .login-header {
    padding: 24px 16px 12px;
  }

  .login-form {
    padding: 0 16px 16px;
  }

  :deep(.el-input__wrapper) {
    min-height: 44px;
  }

  :deep(.el-button) {
    min-height: 44px;
    font-size: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .login-content {
    padding: 0 30px;
  }

  .login-right {
    flex: 0 0 400px;
  }
}
</style>