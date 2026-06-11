import { createRouter, createWebHistory } from 'vue-router'
import i18n from '../locales'

// 导入组件
const Login = () => import('../views/Login.vue')
const Home = () => import('../views/Home.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const VMList = () => import('../views/vm/VMList.vue')
const VMGroup = () => import('../views/vm/VMGroup.vue')
const UserHome = () => import('../views/user/UserHome.vue')
const RDP = () => import('../views/user/RDP.vue')
// 创建占位组件用于尚未实现的页面
const PlaceholderView = (name) => {
  return {
    template: `<div style="padding: 40px; text-align: center;">
      <h2>页面开发中</h2>
      <p>{{ name }} 页面正在开发中，敬请期待...</p>
    </div>`,
    setup() {
      return { name }
    }
  }
}

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/user',
    name: 'UserHome',
    component: UserHome,
    meta: { title: '用户中心' }
  },
  {
    path: '/rdp',
    name: 'RDP',
    component: RDP,
    meta: { title: 'RDP' }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/home/vmlist',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表盘' }
      },
      {
        path: 'templates',
        name: 'Templates',
        component: () => import('../views/Templates.vue'),
        meta: { title: '模板管理' }
      },
      {
        path: 'vm-management',
        name: 'VMManagement',
        component: VMGroup,
        meta: { title: '虚拟机组管理' }
      },
      {
        path: 'vmlist',
        name: 'VMList',
        component: VMList,
        meta: { title: '虚拟机列表' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => PlaceholderView('日志事件'),
        meta: { title: '日志事件' }
      },

    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 页面可见性API监听，当用户切换回页面时检查token
window.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    const token = localStorage.getItem('token')
    if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/user') {
      router.push('/login')
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    // 根据当前语言和用户角色设置标题
    const currentLocale = i18n.global.locale.value
    const userRole = localStorage.getItem('userRole') || 'user'
    let pageTitle = to.meta.title
    let suffix = 'VDI管理后台'
    
    // 根据语言切换后缀和标题
    if (currentLocale === 'en') {
      suffix = 'VDI Admin'
      // 英文标题映射
      const titleMap = {
        '仪表盘': 'Dashboard',
        '模板管理': 'Template Management',
        '虚拟机组管理': 'VM Group Management',
        '虚拟机列表': 'VM List',
        '用户管理': 'User Management',
        '系统设置': 'System Settings',
        '日志事件': 'Log Events',
        '用户中心': 'User Center',
        'RDP连接': 'RDP'
      }
      if (titleMap[to.meta.title]) {
        pageTitle = titleMap[to.meta.title]
      }
      // 普通用户不显示 Admin 后缀
      if (userRole !== 'admin') {
        suffix = ''
      }
    } else if (currentLocale === 'ja') {
      suffix = 'VDI管理'
      // 日语标题映射
      const titleMap = {
        '仪表盘': 'ダッシュボード',
        '模板管理': 'テンプレート管理',
        '虚拟机组管理': 'VMグループ管理',
        '虚拟机列表': 'VMリスト',
        '用户管理': 'ユーザー管理',
        '系统设置': 'システム設定',
        '日志事件': 'ログイベント',
        '用户中心': 'ユーザーセンター',
        'RDP连接': 'RDP'
      }
      if (titleMap[to.meta.title]) {
        pageTitle = titleMap[to.meta.title]
      }
      // 普通用户不显示 管理 后缀
      if (userRole !== 'admin') {
        suffix = ''
      }
    } else if (currentLocale === 'zh-TW') {
      suffix = 'VDI管理後台'
      // 繁体中文标题映射
      const titleMap = {
        '仪表盘': '儀表盤',
        '模板管理': '模板管理',
        '虚拟机组管理': '虛擬機組管理',
        '虚拟机列表': '虛擬機列表',
        '用户管理': '用戶管理',
        '系统设置': '系統設定',
        '日志事件': '日誌事件',
        '用户中心': '用戶中心',
        'RDP连接': 'RDP'
      }
      if (titleMap[to.meta.title]) {
        pageTitle = titleMap[to.meta.title]
      }
      // 普通用户不显示 管理後台 后缀
      if (userRole !== 'admin') {
        suffix = ''
      }
    } else {
      // 简体中文，普通用户不显示 管理后台 后缀
      const titleMap = {
        'RDP连接': 'RDP'
      }
      if (titleMap[to.meta.title]) {
        pageTitle = titleMap[to.meta.title]
      }
      if (userRole !== 'admin') {
        suffix = ''
      }
    }
    
    document.title = suffix ? pageTitle + ' - ' + suffix : pageTitle
  }
  
  // 获取token
  const token = localStorage.getItem('token')
  
  // 如果不是登录页且没有token，重定向到登录页
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
