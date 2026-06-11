<template>
  <div class="home-container">
    <!-- 侧边栏导航 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar" :class="{ 'collapsed': isCollapse }">
      <div class="logo" :class="{ 'logo-collapsed': isCollapse }" @click="redirectToVmlist">
        <h3 v-if="!isCollapse">OpenDesk</h3>
        <div v-else class="logo-short">OD</div>
      </div>
      
      <el-menu 
        :default-active="activeMenu" 
        class="el-menu-vertical"
        @select="handleMenuSelect"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        :collapse="isCollapse"
        :collapse-transition="false"
      >
        <el-menu-item index="/home/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>{{ menuTexts.dashboard }}</template>
        </el-menu-item>
        <el-menu-item index="/home/templates">
          <el-icon><CopyDocument /></el-icon>
          <template #title>{{ menuTexts.templates }}</template>
        </el-menu-item>
        <el-menu-item index="/home/vm-management">
          <el-icon><Monitor /></el-icon>
          <template #title>{{ menuTexts.vmManagement }}</template>
        </el-menu-item>
        <el-menu-item index="/home/vmlist">
          <el-icon><House /></el-icon>
          <template #title>{{ menuTexts.vmlist }}</template>
        </el-menu-item>
        <el-menu-item index="/home/users">
          <el-icon><User /></el-icon>
          <template #title>{{ menuTexts.users }}</template>
        </el-menu-item>
        <el-menu-item index="/home/settings">
          <el-icon><Setting /></el-icon>
          <template #title>{{ menuTexts.settings }}</template>
        </el-menu-item>
        <el-menu-item index="/home/logs" v-if="false">
          <el-icon><Document /></el-icon>
          <template #title>{{ menuTexts.logs }}</template>
        </el-menu-item>
        <el-menu-item index="external-subscription">
          <el-icon><Ticket /></el-icon>
          <template #title>{{ menuTexts.subscription }}</template>
        </el-menu-item>
        <el-menu-item index="external-docs">
          <el-icon><Document /></el-icon>
          <template #title>{{ menuTexts.docs }}</template>
        </el-menu-item>
        <el-menu-item index="/logout">
          <el-icon><ArrowRight /></el-icon>
          <template #title>{{ menuTexts.logout }}</template>
        </el-menu-item>
      </el-menu>
      
      <!-- 菜单折叠按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon v-if="!isCollapse"><CaretLeft /></el-icon>
        <el-icon v-else><CaretRight /></el-icon>
      </div>
    </el-aside>
    
    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'content-expanded': isCollapse }">
      <!-- 内容展示区域 -->
      <el-main>
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import {
  House,
  DataLine,
  User,
  Setting,
  CaretRight,
  CaretLeft,
  ArrowRight,
  CopyDocument,
  Document,
  Monitor,
  Ticket
} from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: {
    House,
    DataLine,
    User,
    Setting,
    CaretRight,
    CaretLeft,
    ArrowRight,
    CopyDocument,
    Document,
    Monitor,
    Ticket
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isCollapse = ref(false)
    const { t } = useI18n()
    
    // 缓存菜单翻译，避免每次渲染都调用t()函数
    const menuTexts = computed(() => ({
      dashboard: t('menu.dashboard'),
      templates: t('menu.templates'),
      vmManagement: t('menu.vmManagement'),
      vmlist: t('menu.vmlist'),
      users: t('menu.users'),
      settings: t('menu.settings'),
      logs: t('menu.logs'),
      subscription: t('menu.subscription'),
      docs: t('menu.docs'),
      logout: t('menu.logout')
    }))
    
    // 计算当前激活的菜单
    const activeMenu = computed(() => {
      return route.path
    })
    
    // 切换菜单折叠状态
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value
      // 保存折叠状态到localStorage
      localStorage.setItem('menuCollapse', isCollapse.value ? '1' : '0')
    }
    
    // 处理菜单选择
    const handleMenuSelect = (index) => {
      // 对于订阅服务和文档手册，不进行路由跳转
      if (index === 'external-subscription') {
        openPricingPage()
      } else if (index === 'external-docs') {
        openDocsPage()
      } else if (index === '/logout') {
        logout()
      } else {
        // 其他菜单项，进行路由跳转
        router.push(index)
      }
    }
    
    // 退出登录
    const logout = () => {
      // 清除token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('menuCollapse')
      localStorage.removeItem('userRole')

      ElMessage.success(t('message.logoutSuccess'))
      setTimeout(() => {
        router.push('/login')
      }, 500)
    }
    
    // 点击logo重定向到虚拟机列表
    const redirectToVmlist = () => {
      router.push('/home/vmlist')
    }
    
    // 打开定价页面
    const openPricingPage = () => {
      window.open('https://opendesk.top/pricing', '_blank')
    }
    
    // 打开文档页面
    const openDocsPage = () => {
      window.open('https://opendesk.top/docs', '_blank')
    }
    
    // 监听路由变化，如果是首次访问且没有指定路由，重定向到虚拟机列表
    watch(() => route.path, (newPath) => {
      if (newPath === '/home' || newPath === '/') {
        router.replace('/home/vmlist')
      }
    })
    
    // 初始化
    onMounted(() => {
      // 从localStorage获取菜单折叠状态
      const savedCollapse = localStorage.getItem('menuCollapse')
      if (savedCollapse !== null) {
        isCollapse.value = savedCollapse === '1'
      }
      
      // 检查token
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
      } else {
        // 如果当前路由是根路径，重定向到虚拟机列表
        if (route.path === '/home' || route.path === '/') {
          router.replace('/home/vmlist')
        }
      }
    })
    
    return {
      t,
      menuTexts,
      activeMenu,
      isCollapse,
      toggleCollapse,
      handleMenuSelect,
      logout,
      redirectToVmlist,
      openPricingPage,
      openDocsPage
    }
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #5c6bc0;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 2px 0 6px rgba(92, 107, 192, 0.3);
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px !important;
}

/* Logo样式 */
.logo {
  padding: 20px 0;
  text-align: center;
  border-bottom: 1px solid #3949ab;
  background-color: #5c6bc0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo.logo-collapsed {
  padding: 15px 0;
}

.logo h3 {
  color: white;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  width: 100%;
  text-align: center;
  line-height: 1.2;
}

.logo-desc {
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  font-size: 12px;
}

.logo-short {
  color: #409EFF;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
}

/* 折叠按钮样式 */
.collapse-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 56px;
  background-color: #5c6bc0;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: #fff;
  border: none;
  font-size: 20px;
  transition: all 0.3s ease;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn:hover {
  background-color: #3949ab;
}

/* 菜单样式 */
.el-menu-vertical {
  height: calc(100vh - 56px);
  background-color: #5c6bc0 !important;
  border-right: none;
}

.el-menu-vertical .el-menu-item {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  font-size: 14px;
  will-change: background-color;
  transform: translateZ(0);
}

.el-menu-vertical .el-menu-item:hover {
  background-color: #3949ab !important;
  color: white !important;
}

.el-menu-vertical .el-menu-item.is-active {
  background-color: #3949ab !important;
  color: white !important;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content.content-expanded {
  margin-left: 64px;
}

/* 内容区域样式 */
.el-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f0f2f5;
  margin: 0 !important;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px !important;
  }
  
  .sidebar.collapsed {
    width: 56px !important;
  }
  
  .main-content {
    margin-left: 200px;
  }
  
  .main-content.content-expanded {
    margin-left: 56px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 240px !important;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
}

/* 滚动条样式优化 */
.sidebar::-webkit-scrollbar,
.el-main::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar::-webkit-scrollbar-track,
.el-main::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.el-main::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.el-main::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 加载动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.el-main > * {
  animation: fadeIn 0.3s ease-out;
}
</style>