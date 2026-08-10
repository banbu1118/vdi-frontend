<template>
  <div class="vm-list-container">

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.powerOperation') }}</span>
        <el-button class="btn btn-primary" :class="{ 'not-operable': selectedVMs.length === 0 }" @click="selectedVMs.length > 0 && startVMs()">{{ t('toolbar.start') }}</el-button>
        <el-button class="btn btn-warning" :class="{ 'not-operable': selectedVMs.length === 0 }" @click="selectedVMs.length > 0 && stopVMs()">{{ t('toolbar.stop') }}</el-button>
        <el-button class="btn btn-info" :class="{ 'not-operable': selectedVMs.length === 0 }" @click="selectedVMs.length > 0 && rebootVMs()">{{ t('toolbar.reboot') }}</el-button>
        <el-button class="btn btn-danger" :class="{ 'not-operable': selectedVMs.length === 0 }" @click="selectedVMs.length > 0 && resetVMs()">{{ t('toolbar.reset') }}</el-button>
      </div>
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.snapshotOperation') }}</span>
        <el-button class="btn btn-warning" :class="{ 'not-operable': selectedVMs.length === 0 }" @click="selectedVMs.length > 0 && revertSnapshot()">{{ t('toolbar.revert') }}</el-button>
      </div>
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.vmOperation') }}</span>
        <el-button class="btn btn-danger" :class="{ 'not-operable': selectedVMs.length === 0 }" @click="selectedVMs.length > 0 && deleteVMs()">{{ t('toolbar.delete') }}</el-button>
      </div>
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.configOperation') }}</span>
        <el-button class="btn btn-primary" :class="{ 'not-operable': selectedVMs.length !== 1 }" @click="selectedVMs.length === 1 && showEditNameDialog()">{{ t('toolbar.rename') }}</el-button>
        <el-button class="btn btn-primary" :class="{ 'not-operable': selectedVMs.length !== 1 }" @click="selectedVMs.length === 1 && showSetStaticIPDialog()">{{ t('toolbar.setStaticIP') }}</el-button>
        <el-button class="btn btn-primary" :class="{ 'not-operable': selectedVMs.length !== 1 }" @click="selectedVMs.length === 1 && showEditUserDialog()">{{ t('toolbar.updateUser') }}</el-button>
        <el-button class="btn btn-primary" :class="{ 'not-operable': selectedVMs.length !== 1 }" @click="selectedVMs.length === 1 && showEditPasswordDialog()">{{ t('toolbar.updatePassword') }}</el-button>
        <el-button class="btn btn-primary" :class="{ 'not-operable': selectedVMs.length !== 1 }" @click="selectedVMs.length === 1 && showUpdateRDPPortDialog()">{{ t('toolbar.updateRDPPort') }}</el-button>
      </div>
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.userBinding') }}</span>
        <el-button class="btn btn-success" :class="{ 'not-operable': selectedVMs.length !== 1 }" @click="selectedVMs.length === 1 && showBindUserDialog()">{{ t('toolbar.bindUser') }}</el-button>
        <el-button class="btn btn-warning" :class="{ 'not-operable': selectedVMs.length !== 1 }" @click="selectedVMs.length === 1 && unbindUser()">{{ t('toolbar.unbindUser') }}</el-button>
      </div>
    </div>

    <!-- 选中信息 -->
    <div class="selected-info" v-if="selectedVMs.length > 0">
      {{ t('vmList.selectedVMs', { count: selectedVMs.length }) }}
    </div>

    <!-- 虚拟机表格 -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <p>{{ t('vmList.loadingVMData') }}</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>{{ t('vmList.loadFailed') }}: {{ error }}</p>
        <el-button class="btn btn-primary" @click="refreshVMs">{{ t('vmList.retry') }}</el-button>
      </div>
      <table v-else class="vm-table">
         <thead>
           <tr>
             <th class="col-chk sticky-col-1">
               <input 
                 type="checkbox" 
                 @change="toggleSelectAll"
                 :checked="selectedVMs.length === vmList.length && vmList.length > 0"
               />
             </th>
             <th @click="handleSort('vmid')" class="sortable sticky-col-2">
               vmid <span class="sort-indicator" v-html="getSortIndicator('vmid')"></span>
             </th>
             <th @click="handleSort('name')" class="sortable">
               name <span class="sort-indicator" v-html="getSortIndicator('name')"></span>
             </th>
             <th @click="handleSort('group')" class="sortable">
               group <span class="sort-indicator" v-html="getSortIndicator('group')"></span>
             </th>
             <th @click="handleSort('user_name')" class="sortable">
               user_name <span class="sort-indicator" v-html="getSortIndicator('user_name')"></span>
             </th>
             <th @click="handleSort('ip')" class="sortable">
               ip <span class="sort-indicator" v-html="getSortIndicator('ip')"></span>
             </th>
             <th @click="handleSort('status')" class="sortable">
               status <span class="sort-indicator" v-html="getSortIndicator('status')"></span>
             </th>
             <th @click="handleSort('vm_user')" class="sortable">
               vm_user <span class="sort-indicator" v-html="getSortIndicator('vm_user')"></span>
             </th>
             <th @click="handleSort('vm_password')" class="sortable">
               vm_password <span class="sort-indicator" v-html="getSortIndicator('vm_password')"></span>
             </th>
             <th @click="handleSort('cpu')" class="sortable">
               cpu <span class="sort-indicator" v-html="getSortIndicator('cpu')"></span>
             </th>
             <th @click="handleSort('cpus')" class="sortable">
               cpus <span class="sort-indicator" v-html="getSortIndicator('cpus')"></span>
             </th>
             <th @click="handleSort('mem')" class="sortable">
               mem <span class="sort-indicator" v-html="getSortIndicator('mem')"></span>
             </th>
             <th @click="handleSort('disk')" class="sortable">
               disk <span class="sort-indicator" v-html="getSortIndicator('disk')"></span>
             </th>
             <th @click="handleSort('uptime')" class="sortable">
               uptime <span class="sort-indicator" v-html="getSortIndicator('uptime')"></span>
             </th>
             <th @click="handleSort('netin')" class="sortable">
               netin <span class="sort-indicator" v-html="getSortIndicator('netin')"></span>
             </th>
             <th @click="handleSort('netout')" class="sortable">
               netout <span class="sort-indicator" v-html="getSortIndicator('netout')"></span>
             </th>
             <th>{{ t('vmList.rdpPort') }}</th>
             <th @click="handleSort('has_snapshot')" class="sortable">
               snapshot <span class="sort-indicator" v-html="getSortIndicator('has_snapshot')"></span>
             </th>
           </tr>
         </thead>
         <tbody>
           <tr v-for="vm in paginatedVMs" :key="vm.vmid">
            <td class="col-chk sticky-col-1">
              <input 
                type="checkbox" 
                :value="vm.vmid"
                v-model="selectedVMs"
              />
            </td>
            <td class="sticky-col-2" title="{{ vm.vmid }}">{{ vm.vmid }}</td>
            <td class="col-name" :title="vm.name">{{ vm.name }}</td>
            <td class="col-group" :title="vm.group">{{ vm.group }}</td>
            <td class="col-user" :title="vm.user_name">{{ vm.user_name }}</td>
            <td class="col-ip" :title="vm.ip">{{ vm.ip }}</td>
            <td>
              <span v-if="vm.status" :class="['status-badge', vm.status]">
                {{ vm.status }}
              </span>
            </td>
            <td class="col-user" :title="vm.vm_user">{{ vm.vm_user }}</td>
            <td>
              <div class="password-cell">
                <span v-if="!vm.showPassword" class="password-mask">* * * * * *</span>
                <span v-else class="password-text" :title="vm.vm_password">{{ vm.vm_password }}</span>
                <el-button
                  v-if="vm.vm_password"
                  type="primary"
                  link
                  size="small"
                  @click="vm.showPassword = !vm.showPassword"
                >
                  <el-icon><View v-if="!vm.showPassword" /><Hide v-else /></el-icon>
                </el-button>
                <el-button
                  v-if="vm.showPassword && vm.vm_password"
                  type="primary"
                  link
                  size="small"
                  @click="copyPassword(vm.vm_password)"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
            </td>
            <td class="col-cpu" :title="vm.cpu">{{ Number(vm.cpu) === 0 ? '0' : Number(vm.cpu).toFixed(4) }}</td>
            <td class="col-num" :title="vm.cpus">{{ vm.cpus }}</td>
            <td class="col-num" :title="formatMemory(vm.mem)">{{ formatMemory(vm.mem) }}</td>
            <td class="col-num" :title="formatDisk(vm.disk)">{{ formatDisk(vm.disk) }}</td>
            <td class="col-num" :title="formatUptime(vm.uptime)">{{ formatUptime(vm.uptime) }}</td>
            <td class="col-num" :title="formatNetwork(vm.netin)">{{ formatNetwork(vm.netin) }}</td>
            <td class="col-num" :title="formatNetwork(vm.netout)">{{ formatNetwork(vm.netout) }}</td>
            <td class="col-num" :title="vm.rdp_port">{{ vm.rdp_port }}</td>
            <td class="col-num" :title="vm.has_snapshot">{{ vm.has_snapshot == '1' ? 'Y' : 'N' }}</td>
          </tr>
         </tbody>
      </table>
      
      <!-- 空状态 -->
      <div v-if="!loading && !error && vmList.length === 0" class="empty-state">
        <p>{{ t('vmList.noVMData') }}</p>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <el-button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        {{ t('vmList.previousPage') }}
      </el-button>
      <span class="page-info">
        {{ t('vmList.pageInfo', { current: currentPage, total: totalPages, count: vmList.length }) }}
      </span>
      <el-button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        {{ t('vmList.nextPage') }}
      </el-button>
    </div>
    
    <!-- 绑定用户对话框 -->
    <el-dialog
      v-model="bindUserDialogVisible"
      :title="t('dialog.bindUser')"
      width="500px"
      :close-on-click-modal="false"
      draggable
      class="vm-list-dialog"
    >
      <div class="user-list-container">
        <div v-if="usersLoading" class="loading-state">
          <p>{{ t('dialog.loadingUsers') }}</p>
        </div>
        <div v-else-if="users.length === 0" class="empty-state">
          <p>{{ t('dialog.noUsers') }}</p>
        </div>
        <div v-else>
          <div class="user-item" v-for="user in users" :key="user.id">
            <el-radio
              v-model="selectedUsername"
              :label="user.username"
              size="large"
            >
              <div class="user-info">
                <div class="user-name">{{ user.username }}</div>
                <div class="user-details">
                  <span class="user-group">{{ user.group }}</span>
                </div>
              </div>
            </el-radio>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bindUserDialogVisible = false; selectedUsername = ''">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="bindUser">{{ t('dialog.bind') }}</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 重命名虚拟机对话框 -->
    <el-dialog
      v-model="renameDialogVisible"
      :title="t('dialog.renameVM')"
      width="400px"
      :close-on-click-modal="false"
      draggable
      class="vm-list-dialog"
    >
      <div class="dialog-content">
        <el-input
          v-model="newVMName"
          :placeholder="t('dialog.renameVMPlaceholder')"
          size="large"
          maxlength="50"
          show-word-limit
        />
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="renameDialogVisible = false; newVMName.value = ''">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="updateVMName">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 设置静态IP对话框 -->
    <el-dialog
      v-model="staticIPDialogVisible"
      :title="t('dialog.setStaticIP')"
      width="500px"
      :close-on-click-modal="false"
      draggable
      class="vm-list-dialog"
    >
      <div class="dialog-content">
        <el-form label-position="top" label-width="100px">
          <el-form-item :label="t('dialog.staticIPAddress')" required>
            <el-input
              v-model="staticIPForm.address"
              :placeholder="t('dialog.staticIPAddressPlaceholder')"
              size="large"
            />
          </el-form-item>
          <el-form-item :label="t('dialog.staticIPNetmask')" required>
            <el-input
              v-model="staticIPForm.netmask"
              :placeholder="t('dialog.staticIPNetmaskPlaceholder')"
              size="large"
            />
          </el-form-item>
          <el-form-item :label="t('dialog.staticIPGateway')" required>
            <el-input
              v-model="staticIPForm.gateway"
              :placeholder="t('dialog.staticIPGatewayPlaceholder')"
              size="large"
            />
          </el-form-item>
          <el-form-item :label="t('dialog.staticIPDNS1')">
            <el-input
              v-model="staticIPForm.dns1"
              :placeholder="t('dialog.staticIPDNSPlaceholder')"
              size="large"
            />
          </el-form-item>
          <el-form-item :label="t('dialog.staticIPDNS2')">
            <el-input
              v-model="staticIPForm.dns2"
              :placeholder="t('dialog.staticIPDNSPlaceholder')"
              size="large"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="staticIPDialogVisible = false; staticIPForm = { address: '', netmask: '', gateway: '', dns1: '', dns2: '' }">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="setStaticIP">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { View, Hide, DocumentCopy } from '@element-plus/icons-vue'

export default {
  name: 'VMList',
  components: {
    View,
    Hide,
    DocumentCopy
  },
  setup() {
    const { t } = useI18n()
    // 响应式数据
    const selectedVMs = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const windowHeight = ref(window.innerHeight)
    const loading = ref(false)
    const refreshLoading = ref(false)
    const error = ref('')
    
    // 根据窗口高度动态计算每页显示条数
    const updatePageSize = () => {
      windowHeight.value = window.innerHeight
      const tableHeaderHeight = 180
      const rowHeight = 40
      const availableHeight = windowHeight.value - tableHeaderHeight
      pageSize.value = Math.max(5, Math.floor(availableHeight / rowHeight))
    }
    
    // 监听窗口大小变化
    const handleResize = () => {
      updatePageSize()
    }
    
    // 排序配置
    const sortKey = ref('vmid')  // 当前排序列
    const sortOrder = ref('asc')  // 排序方向: 'asc' 升序, 'desc' 降序
    
    // 虚拟机列表数据
    const vmList = ref([])
    let pollingTimer = null

    // 获取虚拟机列表数据
    const fetchVMList = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          loading.value = true
        }
        error.value = ''
        
        const response = await axios.get('/tasks/vms')
        const result = response.data
        
        if (result.code === 0 && result.data && Array.isArray(result.data)) {
          if (vmList.value.length === 0) {
            vmList.value = result.data.map(vm => ({ ...vm, showPassword: false }))
            // console.log('✅ 初次加载虚拟机数据:', vmList.value.length, '条记录')
          } else {
            const updatedList = []
            const currentVMsMap = new Map(vmList.value.map(vm => [vm.vmid, vm]))
            
            for (const newVM of result.data) {
              const currentVM = currentVMsMap.get(newVM.vmid)
              
              if (currentVM && isDataChanged(currentVM, newVM)) {
                updatedList.push({ ...newVM, showPassword: currentVM.showPassword })
                // console.log(`🔄 虚拟机数据更新: vmid=${newVM.vmid}, name=${newVM.name}, status=${newVM.status}`)
              } else if (currentVM && !isDataChanged(currentVM, newVM)) {
                updatedList.push(currentVM)
                // console.log(`🔒 虚拟机数据未变化: vmid=${newVM.vmid}（保持引用）`)
              } else {
                updatedList.push({ ...newVM, showPassword: false })
                // console.log(`➕ 新增虚拟机: vmid=${newVM.vmid}, name=${newVM.name}`)
              }
            }
            
            const deletedCount = vmList.value.length - updatedList.length
            if (deletedCount > 0) {
              // console.log(`❌ 检测到 ${deletedCount} 个已删除的虚拟机`)
            }
            
            vmList.value = updatedList
            // console.log(`🔄 智能更新完成: 总计 ${updatedList.length} 条记录`)
          }
        } else {
          console.warn('⚠️ API返回数据格式不正确:', result)
          error.value = t('vmList.apiFormatError')
          vmList.value = []
        }
      } catch (error) {
        console.warn('❌ API调用异常:', error.message)
        error.value = error.message || t('vmList.networkConnectionFailed')
        vmList.value = []
      } finally {
        if (isInitialLoad) {
          loading.value = false
        }
      }
    }

    // 检查两个虚拟机对象是否有数据变化
    const isDataChanged = (oldVM, newVM) => {
      return oldVM.name !== newVM.name ||
             oldVM.status !== newVM.status ||
             oldVM.ip !== newVM.ip ||
             oldVM.cpus !== newVM.cpus ||
             oldVM.mem !== newVM.mem ||
             oldVM.disk !== newVM.disk ||
             oldVM.node !== newVM.node ||
             oldVM.vm_user !== newVM.vm_user ||
             oldVM.vm_password !== newVM.vm_password ||
             oldVM.rdp_port !== newVM.rdp_port
    }

    // 启动轮询
    const startPolling = () => {
      fetchVMList(true)
      pollingTimer = setInterval(() => {
        fetchVMList(false)
      }, 5000)
    }

    // 停止轮询
    const stopPolling = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
    }
    
    // 页面可见性处理函数
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面不可见时，停止轮询
        stopPolling()
      } else {
        // 页面可见时，重新启动轮询
        if (!pollingTimer) {
          startPolling()
        }
      }
    }

    // 排序后的完整数据
    const sortedAllVMs = computed(() => {
      return [...vmList.value].sort((a, b) => {
        let aVal = a[sortKey.value]
        let bVal = b[sortKey.value]
        
        // 处理 null/undefined/空值
        if (aVal == null || aVal === '') aVal = ''
        if (bVal == null || bVal === '') bVal = ''
        
        // 特殊处理数字类型字段
        const numericFields = ['vmid', 'cpu', 'cpus', 'mem', 'disk', 'uptime', 'netin', 'netout']
        if (numericFields.includes(sortKey.value)) {
          aVal = parseFloat(aVal) || 0
          bVal = parseFloat(bVal) || 0
        }
        
        // 特殊处理 has_snapshot
        if (sortKey.value === 'has_snapshot') {
          aVal = aVal === '1' ? 1 : 0
          bVal = bVal === '1' ? 1 : 0
        }
        
        // 字符串比较（不区分大小写）
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    })

    // 分页数据（基于排序后的所有数据）
    const paginatedVMs = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sortedAllVMs.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(vmList.value.length / pageSize.value)
    })

    // 格式化函数
    const formatMemory = (bytes) => {
      if (!bytes) return ''
      const gb = bytes / (1024 * 1024 * 1024)
      return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(bytes / 1024 / 1024).toFixed(0)}MB`
    }

    const formatNetwork = (bytes) => {
      if (!bytes) return ''
      const gb = bytes / (1024 * 1024 * 1024)
      return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(bytes / 1024 / 1024).toFixed(0)}MB`
    }

    // 复制密码到剪贴板
    const copyPassword = async (password) => {
      try {
        await navigator.clipboard.writeText(password)
        ElMessage.success(t('message.passwordCopied'))
      } catch (err) {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea')
        textArea.value = password
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
          ElMessage.success(t('message.passwordCopied'))
        } catch (err) {
          ElMessage.error(t('message.copyFailed'))
        }
        document.body.removeChild(textArea)
      }
    }

    const formatDisk = (bytes) => {
      if (!bytes) return ''
      const gb = bytes / (1024 * 1024 * 1024)
      return `${gb.toFixed(0)}GB`
    }

    const formatUptime = (seconds) => {
      if (!seconds) return ''
      
      const days = Math.floor(seconds / (24 * 3600))
      const hours = Math.floor((seconds % (24 * 3600)) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}min`
      } else if (hours > 0) {
        return `${hours}h ${minutes}min`
      } else {
        return `${minutes}min`
      }
    }

    // 方法
    const toggleSelectAll = () => {
      if (selectedVMs.value.length === vmList.value.length) {
        selectedVMs.value = []
      } else {
        selectedVMs.value = vmList.value.map(vm => vm.vmid)
      }
    }

    // 排序处理函数
    const handleSort = (key) => {
      if (sortKey.value === key) {
        // 点击同一列，切换排序方向
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        // 点击新列，设置升序排序
        sortKey.value = key
        sortOrder.value = 'asc'
      }
    }

    // 获取排序指示器图标
    const getSortIndicator = (key) => {
      if (sortKey.value !== key) return '&#8597;'  // 双向箭头
      return sortOrder.value === 'asc' ? '&#8593;' : '&#8595;'  // 上箭头或下箭头
    }

    const refreshVMs = async () => {
      try {
        // console.log('🔄 用户手动刷新虚拟机列表')
        refreshLoading.value = true
        error.value = ''
        
        const response = await axios.get('/tasks/vms')
        const result = response.data
        
        if (result.code === 0 && result.data && Array.isArray(result.data)) {
          if (vmList.value.length === 0) {
            vmList.value = result.data.map(vm => ({ ...vm, showPassword: false }))
            // console.log('✅ 手动刷新加载虚拟机数据:', vmList.value.length, '条记录')
          } else {
            const updatedList = []
            const currentVMsMap = new Map(vmList.value.map(vm => [vm.vmid, vm]))
            
            for (const newVM of result.data) {
              const currentVM = currentVMsMap.get(newVM.vmid)
              
              if (currentVM && isDataChanged(currentVM, newVM)) {
                updatedList.push({ ...newVM, showPassword: currentVM.showPassword })
                // console.log(`🔄 虚拟机数据更新: vmid=${newVM.vmid}, name=${newVM.name}, status=${newVM.status}`)
              } else if (currentVM && !isDataChanged(currentVM, newVM)) {
                updatedList.push(currentVM)
                // console.log(`🔒 虚拟机数据未变化: vmid=${newVM.vmid}（保持引用）`)
              } else {
                updatedList.push({ ...newVM, showPassword: false })
                // console.log(`➕ 新增虚拟机: vmid=${newVM.vmid}, name=${newVM.name}`)
              }
            }
            
            const deletedCount = vmList.value.length - updatedList.length
            if (deletedCount > 0) {
              // console.log(`❌ 检测到 ${deletedCount} 个已删除的虚拟机`)
            }
            
            vmList.value = updatedList
            // console.log(`🔄 手动刷新完成: 总计 ${updatedList.length} 条记录`)
          }
          
          ElMessage.success(t('vmList.refreshSuccess', { count: result.data.length }))
        } else {
          console.warn('⚠️ API返回数据格式不正确:', result)
          error.value = 'API返回数据格式不正确'
          ElMessage.error(t('vmList.refreshFailed'))
        }
      } catch (error) {
        console.error('❌ 手动刷新失败:', error.message)
        error.value = '网络错误: ' + error.message
        ElMessage.error(t('vmList.networkError', { error: error.message }))
      } finally {
        refreshLoading.value = false
      }
    }

    const deleteVM = async (vmid) => {
      try {
        await ElMessageBox.confirm(
          t('vmList.confirmDeleteVM'),
          t('common.confirm'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )
        try {
          // console.log('删除虚拟机:', vmid)
          const response = await axios.delete(`/vm/${vmid}`)
          await fetchVMList()
          selectedVMs.value = selectedVMs.value.filter(id => id !== vmid)
          ElMessage.success(response.data?.message || t('vmList.vmDeletedSuccess'))
        } catch (error) {
          console.error('删除虚拟机失败:', error.message)
          ElMessage.error(t('vmList.deleteFailed') + error.message)
        }
      } catch (error) {
        // 用户取消操作
      }
    }

    const startVMs = async () => {
      try {
        // console.log('开机虚拟机:', selectedVMs.value)
        
        // 为每个选中的虚拟机调用单独的开机接口
        for (const vmid of selectedVMs.value) {
          // 轮询任务需要更长的超时时间（30秒）
          const response = await axios.post(`/vm/${vmid}/start`, {}, { timeout: 30000 })
          // console.log(`虚拟机 ${vmid} 开机响应:`, response.data)
          
          // 根据接口规范处理响应
          if (response.data?.code === 0) {
            ElMessage.success(t('message.vmStartSuccess', { vmid }))
          } else {
            ElMessage.error(response.data?.message || t('message.vmStartFailed', { vmid }))
          }
        }
        
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        console.error('开机失败:', error.message)
        ElMessage.error(t('message.vmStartFailed', { vmid: selectedVMs.value[0] }) + ': ' + error.message)
      }
    }

    const stopVMs = async () => {
      try {
        // console.log('关机虚拟机:', selectedVMs.value)
        
        // 为每个选中的虚拟机调用单独的关机接口
        for (const vmid of selectedVMs.value) {
          // 轮询任务需要更长的超时时间（30秒）
          const response = await axios.post(`/vm/${vmid}/shutdown`, {}, { timeout: 30000 })
          // console.log(`虚拟机 ${vmid} 关机响应:`, response.data)
          
          if (response.data?.code === 0) {
            ElMessage.success(t('message.vmStopSuccess', { vmid }))
          } else {
            ElMessage.error(response.data?.message || t('message.vmStopFailed', { vmid }))
          }
        }
        
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        console.error('关机失败:', error.message)
        ElMessage.error(t('message.vmStopFailed', { vmid: selectedVMs.value[0] }) + ': ' + error.message)
      }
    }

    const rebootVMs = async () => {
      try {
        // console.log('重启虚拟机:', selectedVMs.value)
        
        // 为每个选中的虚拟机调用单独的重启接口
        for (const vmid of selectedVMs.value) {
          // 轮询任务需要更长的超时时间（30秒）
          const response = await axios.post(`/vm/${vmid}/restart`, {}, { timeout: 30000 })
          // console.log(`虚拟机 ${vmid} 重启响应:`, response.data)
          
          if (response.data?.code === 0) {
            ElMessage.success(t('message.vmRebootSuccess', { vmid }))
          } else {
            ElMessage.error(response.data?.message || t('message.vmRebootFailed', { vmid }))
          }
        }
        
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        console.error('重启失败:', error.message)
        ElMessage.error(t('message.vmRebootFailed', { vmid: selectedVMs.value[0] }) + ': ' + error.message)
      }
    }

    const resetVMs = async () => {
      try {
        // console.log('停止虚拟机:', selectedVMs.value)
        
        // 为每个选中的虚拟机调用单独的停止接口
        for (const vmid of selectedVMs.value) {
          // 轮询任务需要更长的超时时间（30秒）
          const response = await axios.post(`/vm/${vmid}/stop`, {}, { timeout: 30000 })
          // console.log(`虚拟机 ${vmid} 停止响应:`, response.data)
          
          if (response.data?.code === 0) {
            ElMessage.success(t('message.vmResetSuccess', { vmid }))
          } else {
            ElMessage.error(response.data?.message || t('message.vmResetFailed', { vmid }))
          }
        }
        
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        console.error('停止失败:', error.message)
        ElMessage.error(t('message.vmResetFailed', { vmid: selectedVMs.value[0] }) + ': ' + error.message)
      }
    }

    const revertSnapshot = async () => {
      try {
        await ElMessageBox.confirm(
          t('message.confirmRevertVM', { count: selectedVMs.value.length }),
          t('common.confirm'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )
        
        // console.log('还原虚拟机:', selectedVMs.value)
        
        // 为每个选中的虚拟机调用单独的还原接口
        for (const vmid of selectedVMs.value) {
          // 轮询任务需要更长的超时时间（30秒）
          const response = await axios.post(`/vm/${vmid}/rollback`, {}, { timeout: 30000 })
          // console.log(`虚拟机 ${vmid} 还原响应:`, response.data)
          
          if (response.data?.code === 0) {
            ElMessage.success(t('message.vmRevertSuccess', { vmid }))
          } else {
            ElMessage.error(response.data?.message || t('message.vmRevertFailed', { vmid }))
          }
        }
        
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        if (error !== 'cancel') {
          console.error('还原失败:', error.message)
          ElMessage.error(t('message.vmRevertFailed', { vmid: selectedVMs.value[0] }) + ': ' + error.message)
        }
      }
    }

    const deleteVMs = async () => {
      try {
        await ElMessageBox.confirm(
          t('dialog.confirmDeleteVMs', { count: selectedVMs.value.length }),
          t('common.confirm'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'danger'
          }
        )
        
        // console.log('批量删除虚拟机:', selectedVMs.value)
        
        let successCount = 0
        const totalCount = selectedVMs.value.length
        
        // 为每个选中的虚拟机调用单独的删除接口
        for (const vmid of selectedVMs.value) {
          try {
            const response = await axios.delete(`/vm/${vmid}`)
            // console.log(`虚拟机 ${vmid} 删除响应:`, response.data)
            
            if (response.data?.code === 0) {
              successCount++
            }
          } catch (error) {
            console.error(`虚拟机 ${vmid} 删除失败:`, error.message)
          }
        }
        
        // 显示结果
        if (successCount === totalCount) {
          ElMessage.success(t('dialog.deleteAllSuccess', { count: totalCount }))
        } else if (successCount > 0) {
          ElMessage.warning(t('dialog.deletePartialSuccess', { success: successCount, total: totalCount }))
        } else {
          ElMessage.error(t('dialog.deleteAllFailed'))
        }
        
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除操作失败:', error.message)
          ElMessage.error(t('dialog.deleteFailed', { error: error.message }))
        }
      }
    }

    const showEditNameDialog = () => {
      const selectedVMID = selectedVMs.value[0]
      const vm = vmList.value.find(v => Number(v.vmid) === Number(selectedVMID))
      if (vm) {
        currentRenameVMID = Number(vm.vmid)
        newVMName.value = vm.name || ''
        renameDialogVisible.value = true
      }
    }

    const updateVMName = async () => {
      const vmName = newVMName.value.trim()
      
      if (!vmName) {
        ElMessage.warning(t('vmList.pleaseEnterVMName'))
        return
      }
      
      // 验证名称格式：只允许字母、数字和连字符，且必须以字母或数字开头
      const nameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/
      if (!nameRegex.test(vmName)) {
        ElMessage.warning(t('message.vmNameInvalid'))
        return
      }
      
      try {
        // console.log('重命名虚拟机:', currentRenameVMID, '新名称:', vmName)
        const response = await axios.post(`/vm/${currentRenameVMID}/rename`, { newName: vmName })
        await fetchVMList()
        selectedVMs.value = []
        ElMessage.success(t('message.vmRenameSuccess'))
        renameDialogVisible.value = false
        newVMName.value = ''
      } catch (error) {
        console.error('修改名称失败:', error.message)
        ElMessage.error(t('message.vmRenameFailed') + ': ' + error.message)
      }
    }

    const showSetStaticIPDialog = () => {
      const vm = vmList.value.find(v => v.vmid === selectedVMs.value[0])
      if (vm) {
        currentStaticIPVMID = Number(vm.vmid)
        // 重置表单
        staticIPForm.value = {
          address: vm.ip || '',
          netmask: '',
          gateway: '',
          dns1: '',
          dns2: ''
        }
        staticIPDialogVisible.value = true
      }
    }

    const setStaticIP = async () => {
      // 验证必填项
      if (!staticIPForm.value.address.trim()) {
        ElMessage.warning(t('message.enterValidIP'))
        return
      }
      
      if (!staticIPForm.value.netmask.trim()) {
        ElMessage.warning(t('message.enterValidNetmask'))
        return
      }
      
      // 验证IP地址格式
      const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      
      if (!ipRegex.test(staticIPForm.value.address.trim())) {
        ElMessage.warning(t('message.enterValidIP'))
        return
      }
      
      if (!ipRegex.test(staticIPForm.value.netmask.trim())) {
        ElMessage.warning(t('message.enterValidNetmask'))
        return
      }
      
      // 验证默认网关
      if (!staticIPForm.value.gateway.trim()) {
        ElMessage.warning(t('message.enterValidGateway'))
        return
      }
      if (!ipRegex.test(staticIPForm.value.gateway.trim())) {
        ElMessage.warning(t('message.enterValidGateway'))
        return
      }
      
      // 验证选填项
      
      if (staticIPForm.value.dns1.trim() && !ipRegex.test(staticIPForm.value.dns1.trim())) {
        ElMessage.warning(t('message.enterValidDNS'))
        return
      }
      
      if (staticIPForm.value.dns2.trim() && !ipRegex.test(staticIPForm.value.dns2.trim())) {
        ElMessage.warning(t('message.enterValidDNS'))
        return
      }
      
      try {
        // console.log('设置静态IP:', currentStaticIPVMID, staticIPForm.value)
        const response = await axios.post(`/vm/${currentStaticIPVMID}/ip`, staticIPForm.value, { timeout: 120000 })
        await fetchVMList()
        selectedVMs.value = []
        ElMessage.success(t('message.vmStaticIPSuccess'))
        staticIPDialogVisible.value = false
        // 重置表单
        staticIPForm.value = {
          address: '',
          netmask: '',
          gateway: '',
          dns1: '',
          dns2: ''
        }
      } catch (error) {
        console.error('设置静态IP失败:', error.message)
        ElMessage.error(t('message.vmStaticIPFailed') + ': ' + error.message)
      }
    }

    const showEditUserDialog = async () => {
      const vm = vmList.value.find(v => v.vmid === selectedVMs.value[0])
      try {
        const { value: newUser } = await ElMessageBox.prompt(
          '',
          t('dialog.updateUsername'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            inputPlaceholder: t('dialog.updateUsernamePlaceholder'),
            inputValue: vm?.vm_user || ''
          }
        )
        
        if (newUser !== null) {
          updateVMUser(selectedVMs.value[0], newUser)
        }
      } catch (error) {
        // 取消操作
      }
    }

    const updateVMUser = async (vmid, newUser) => {
      // 验证输入
      if (!newUser.trim()) {
        ElMessage.warning(t('message.enterValidUsername'))
        return
      }
      
      try {
        // console.log('更新用户名:', vmid, newUser)
        const response = await axios.post(`/vm/${vmid}/vmusername`, { vmusername: newUser }, { timeout: 120000 })
        ElMessage.success(t('message.vmUserUpdateSuccess'))
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        console.error('更新用户名失败:', error.message)
        ElMessage.error(t('message.vmUserUpdateFailed') + ': ' + error.message)
      }
    }

    const showEditPasswordDialog = async () => {
      try {
        const { value: newPassword } = await ElMessageBox.prompt(
          '',
          t('dialog.updatePassword'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            inputPlaceholder: t('dialog.updatePasswordPlaceholder'),
            inputType: 'password'
          }
        )
        
        if (newPassword !== null) {
          updateVMPassword(selectedVMs.value[0], newPassword)
        }
      } catch (error) {
        // 取消操作
      }
    }

    const updateVMPassword = async (vmid, newPassword) => {
      try {
        // console.log('更新密码:', vmid, newPassword)
        const response = await axios.post(`/vm/${vmid}/password`, { vm_user_password: newPassword }, { timeout: 120000 })
        ElMessage.success(t('message.vmPasswordUpdateSuccess'))
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        console.error('更新密码失败:', error.message)
        ElMessage.error(t('message.vmPasswordUpdateFailed') + ': ' + error.message)
      }
    }

    const showUpdateRDPPortDialog = async () => {
      const vm = vmList.value.find(v => v.vmid === selectedVMs.value[0])
      try {
        const { value: newPort } = await ElMessageBox.prompt(
          '',
          t('dialog.updateRDPPort'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            inputPlaceholder: t('dialog.updateRDPPortPlaceholder'),
            inputValue: vm?.rdp_port || '3389'
          }
        )
        
        if (newPort !== null) {
          updateRDPPort(selectedVMs.value[0], newPort)
        }
      } catch (error) {
        // 取消操作
      }
    }

    const updateRDPPort = async (vmid, newPort) => {
      // 验证输入
      if (!newPort.trim()) {
        ElMessage.warning(t('message.enterValidRDPPort'))
        return
      }
      
      // 验证端口格式
      const portRegex = /^\d+$/;
      if (!portRegex.test(newPort) || parseInt(newPort) < 1 || parseInt(newPort) > 65535) {
        ElMessage.warning(t('message.enterValidRDPPort'))
        return
      }
      
      try {
        // console.log('更新RDP端口:', vmid, newPort)
        const response = await axios.post(`/vm/${vmid}/rdpport`, { rdp_port: newPort }, { timeout: 120000 })
        ElMessage.success(t('message.vmRDPPortUpdateSuccess'))
        await fetchVMList()
        selectedVMs.value = []
      } catch (error) {
        console.error('更新RDP端口失败:', error.message)
        ElMessage.error(t('message.vmRDPPortUpdateFailed') + ': ' + error.message)
      }
    }

    // 用户列表数据
    const users = ref([])
    const usersLoading = ref(false)
    const bindUserDialogVisible = ref(false)
    const selectedUsername = ref('')
    
    // 重命名虚拟机对话框
    const renameDialogVisible = ref(false)
    const newVMName = ref('')
    let currentRenameVMID = 0
    
    // 设置静态IP对话框
    const staticIPDialogVisible = ref(false)
    const staticIPForm = ref({
      address: '',
      netmask: '',
      gateway: '',
      dns1: '',
      dns2: ''
    })
    let currentStaticIPVMID = 0
    
    // 显示绑定用户对话框
    const showBindUserDialog = async () => {
      try {
        usersLoading.value = true
        bindUserDialogVisible.value = true
        
        // 获取用户列表
        const response = await axios.get('/users')
        if (response.data?.code === 0) {
          users.value = response.data.data || []
        } else {
          ElMessage.error('获取用户列表失败')
          users.value = []
        }
      } catch (error) {
        console.error('获取用户列表失败:', error.message)
        ElMessage.error('获取用户列表失败: ' + error.message)
        users.value = []
      } finally {
        usersLoading.value = false
      }
    }

    // 绑定用户
    const bindUser = async () => {
      if (!selectedUsername.value) {
        ElMessage.warning('请选择一个用户')
        return
      }
      
      try {
        const vmid = selectedVMs.value[0]
        await axios.post(`/users/assign-vm/${vmid}`, { username: selectedUsername.value })
        ElMessage.success(t('message.userBindSuccess'))
        await fetchVMList()
        selectedVMs.value = []
        bindUserDialogVisible.value = false
        selectedUsername.value = ''
      } catch (error) {
        console.error('绑定用户失败:', error.message)
        ElMessage.error(t('message.userBindFailed') + ': ' + error.message)
      }
    }

    const unbindUser = async () => {
      const vmid = selectedVMs.value[0]
      const vm = vmList.value.find(v => v.vmid === vmid)
      
      if (!vm || !vm.user_name) {
        ElMessage.warning(t('message.noUserBound'))
        return
      }
      
      try {
        await ElMessageBox.confirm(
          t('message.confirmUnbindUser', { username: vm.user_name, vmid }),
          t('common.confirm'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )
        
        // console.log('Unbinding user:', vm.user_name, 'from VM:', vmid)
        const response = await axios.post(`/users/unassign/${vmid}`, { username: vm.user_name })
        await fetchVMList()
        selectedVMs.value = []
        ElMessage.success(t('message.userUnbindSuccess'))
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to unbind user:', error.message)
          ElMessage.error(t('message.userUnbindFailed', { error: error.message }))
        }
      }
    }

    // 组件挂载时启动轮询
    onMounted(() => {
      startPolling()
      updatePageSize()
      window.addEventListener('resize', handleResize)
      // 添加页面可见性监听
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })

    // 组件卸载前停止轮询
    onBeforeUnmount(() => {
      stopPolling()
      window.removeEventListener('resize', handleResize)
      // 清理页面可见性监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    return {
      vmList,
      selectedVMs,
      currentPage,
      pageSize,
      windowHeight,
      loading,
      refreshLoading,
      error,
      paginatedVMs,
      totalPages,
      formatMemory,
      formatDisk,
      formatUptime,
      formatNetwork,
      toggleSelectAll,
      refreshVMs,
      handleSort,
      getSortIndicator,
      deleteVM,
      updatePageSize,
      handleResize,
      startVMs,
      stopVMs,
      rebootVMs,
      resetVMs,
      revertSnapshot,
      deleteVMs,
      showEditNameDialog,
      updateVMName,
      showSetStaticIPDialog,
      setStaticIP,
      showEditUserDialog,
      updateVMUser,
      showEditPasswordDialog,
      updateVMPassword,
      showUpdateRDPPortDialog,
      updateRDPPort,
      showBindUserDialog,
      bindUser,
      unbindUser,
      users,
      usersLoading,
      bindUserDialogVisible,
      selectedUsername,
      renameDialogVisible,
      newVMName,
      staticIPDialogVisible,
      staticIPForm,
      copyPassword,
      t
    }
  }
}
</script>

<style scoped>
.vm-list-container {
  background: #f8f7fc;
  padding: 20px;
  width: 100%;
  max-width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  --fs-base: clamp(15px, 1.05vw, 20px);
  --fs-header: clamp(16px, 1.15vw, 22px);
  --fs-card-title: clamp(18px, 1.3vw, 26px);
  --fs-toolbar: clamp(13px, 0.9vw, 17px);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fcfcfd;
  border: 1px solid rgba(92, 107, 192, 0.25);
  border-radius: 4px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-label {
  font-weight: 600;
  color: #909399;
  font-size: var(--fs-header);
  white-space: nowrap;
  margin-right: 4px;
}

.selected-info {
  margin-bottom: 12px;
  padding: clamp(6px, 0.5vw, 10px) clamp(10px, 0.8vw, 14px);
  background: rgba(92, 107, 192, 0.08);
  border: 1px solid rgba(92, 107, 192, 0.25);
  border-radius: 4px;
  color: #5c6bc0;
  font-size: var(--fs-toolbar);
}

.table-container {
  overflow-x: scroll;
  overflow-y: visible;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  scrollbar-width: auto;
  scrollbar-color: rgba(92, 107, 192, 0.6) rgba(92, 107, 192, 0.12);
  padding-bottom: 2px;
}
.table-container::-webkit-scrollbar {
  height: 10px;
}
.table-container::-webkit-scrollbar-track {
  background: rgba(92, 107, 192, 0.12);
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb {
  background: rgba(92, 107, 192, 0.55);
  border-radius: 4px;
  min-width: 60px;
}
.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(92, 107, 192, 0.75);
}

.vm-table {
  width: 1800px;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgba(92, 107, 192, 0.25);
  border-radius: 4px;
  background: #fcfcfd;
  font-size: var(--fs-base);
}

.vm-table th,
.vm-table td {
  padding-top: clamp(6px, 0.6vw, 12px);
  padding-bottom: clamp(6px, 0.6vw, 12px);
  padding-left: clamp(2px, 0.2vw, 5px);
  padding-right: clamp(2px, 0.2vw, 5px);
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid rgba(92, 107, 192, 0.15);
  border-bottom: 1px solid rgba(92, 107, 192, 0.15);
  white-space: nowrap;
  box-sizing: border-box;
}

.vm-table th:last-child,
.vm-table td:last-child {
  border-right: none;
}

.vm-table tr:last-child td {
  border-bottom: none;
}

.vm-table th {
  background: rgba(92, 107, 192, 0.06);
  font-weight: 600;
  color: #909399;
  font-size: var(--fs-header);
  text-align: center;
}

.vm-table td {
  font-size: var(--fs-base);
}

.vm-table tr:hover td {
  background: rgba(92, 107, 192, 0.04);
}

.vm-table input[type="checkbox"] {
  width: clamp(14px, 1vw, 18px);
  height: clamp(14px, 1vw, 18px);
  cursor: pointer;
  accent-color: #5c6bc0;
}

.vm-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.vm-table th.sortable:hover {
  background: rgba(92, 107, 192, 0.12);
}

.vm-table .sticky-col-1 {
  min-width: 44px;
}

.vm-table .sticky-col-2 {
  min-width: 40px;
}

.vm-table th:nth-child(3), .vm-table td.col-name {
  min-width: 100px;
}
.vm-table th:nth-child(4), .vm-table td.col-group {
  min-width: 75px;
}
.vm-table th:nth-child(5), .vm-table td.col-user {
  min-width: 65px;
}
.vm-table th:nth-child(6), .vm-table td.col-ip {
  min-width: 80px;
}
.vm-table th:nth-child(7),
.vm-table td:nth-child(7) {
  min-width: 90px;
}
.vm-table th:nth-child(8), .vm-table td:nth-child(8) {
  min-width: 80px;
}
.vm-table th:nth-child(9),
.vm-table td:nth-child(9) {
  min-width: 80px;
}
.vm-table th:nth-child(10), .vm-table td.col-cpu {
  min-width: 55px;
}
.vm-table th:nth-child(11), .vm-table td:nth-child(11) {
  min-width: 40px;
}
.vm-table th:nth-child(12),
.vm-table td:nth-child(12) {
  min-width: 70px;
}
.vm-table th:nth-child(13),
.vm-table td:nth-child(13) {
  min-width: 70px;
}
.vm-table th:nth-child(14),
.vm-table td:nth-child(14) {
  min-width: 80px;
}
.vm-table th:nth-child(15),
.vm-table td:nth-child(15) {
  min-width: 60px;
}
.vm-table th:nth-child(16),
.vm-table td:nth-child(16) {
  min-width: 60px;
}
.vm-table th:nth-child(17),
.vm-table td:nth-child(17) {
  min-width: 55px;
}
.vm-table th:nth-child(18),
.vm-table td:nth-child(18) {
  min-width: 55px;
}

.vm-table td.col-name,
.vm-table td.col-group,
.vm-table td.col-user,
.vm-table td.col-ip,
.vm-table td.col-cpu,
.vm-table td.col-num,
.vm-table td.sticky-col-2 {
  white-space: nowrap;
}

.sort-indicator {
  display: none;
}

.status-badge {
  padding: clamp(2px, 0.2vw, 4px) clamp(6px, 0.5vw, 10px);
  border-radius: 4px;
  font-size: var(--fs-toolbar);
  font-weight: 500;
  display: inline-block;
}

.status-badge.running {
  background: #e1f3d8;
  color: #529b2e;
}

.status-badge.stopped {
  background: #fde2e2;
  color: #c45656;
}

.status-badge.creating {
  background: #faecd8;
  color: #b88230;
}

.status-badge.error {
  background: #fde2e2;
  color: #c45656;
}

.status-badge.unknown {
  background: #e9e9eb;
  color: #606266;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: clamp(24px, 3vw, 48px);
  color: #909399;
  font-size: var(--fs-base);
}

.error-state {
  color: #f56c6c;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  font-size: var(--fs-base);
}

.page-btn {
  padding: clamp(6px, 0.5vw, 10px) clamp(12px, 1vw, 20px);
  border: 1px solid rgba(92, 107, 192, 0.4);
  background: rgba(92, 107, 192, 0.12);
  color: #5c6bc0;
  border-radius: 4px;
  cursor: pointer;
  font-size: var(--fs-base);
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #5c6bc0;
  color: #fff;
  border-color: #5c6bc0;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: #606266;
}

.vm-list-container :deep(.toolbar .el-button.btn) {
  font-size: var(--fs-header);
  transition: all 0.2s;
}

.vm-list-container :deep(.toolbar .el-button.btn.not-operable) {
  cursor: not-allowed;
  pointer-events: auto;
}

.vm-list-container :deep(.toolbar .el-button.btn-info),
.vm-list-container :deep(.toolbar .el-button.btn-primary) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.vm-list-container :deep(.toolbar .el-button.btn-info:hover),
.vm-list-container :deep(.toolbar .el-button.btn-primary:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-info:active),
.vm-list-container :deep(.toolbar .el-button.btn-primary:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-success) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.vm-list-container :deep(.toolbar .el-button.btn-success:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-success:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-danger) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.vm-list-container :deep(.toolbar .el-button.btn-danger:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-danger:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-warning) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.vm-list-container :deep(.toolbar .el-button.btn-warning:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-warning:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-secondary) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.vm-list-container :deep(.toolbar .el-button.btn-secondary:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.vm-list-container :deep(.toolbar .el-button.btn-secondary:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.user-list-container {
  max-height: 400px;
  overflow-y: auto;
}

.user-item {
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  margin-bottom: 8px;
}

.user-item:hover {
  background-color: rgba(92, 107, 192, 0.06);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: var(--fs-base);
  font-weight: 600;
  color: #303133;
}

.user-details {
  display: flex;
  gap: 8px;
  font-size: var(--fs-toolbar);
}

.user-group {
  color: #909399;
}

.user-item .el-radio__input {
  margin-right: 12px;
}

.password-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.password-mask {
  color: #909399;
  font-family: monospace;
  letter-spacing: 2px;
}

.password-text {
  color: #606266;
  font-family: monospace;
}

@media (max-width: 768px) {
  .vm-list-container {
    padding: 10px;
    --fs-base: 13px;
    --fs-header: 14px;
    --fs-card-title: 16px;
    --fs-toolbar: 12px;
  }

  .toolbar {
    gap: 8px;
    padding: 10px;
  }

  .toolbar-group {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .vm-list-container {
    --fs-base: 12px;
    --fs-header: 13px;
    --fs-card-title: 15px;
    --fs-toolbar: 11px;
  }
}
</style>

<style>
.vm-list-dialog {
  --d-fs-base: clamp(15px, 1.05vw, 20px);
  --d-fs-header: clamp(16px, 1.15vw, 22px);
}

.vm-list-dialog .el-dialog__title {
  font-size: var(--d-fs-header);
  font-weight: 600;
  color: #5c6bc0;
}

.vm-list-dialog .el-form-item__label {
  font-size: var(--d-fs-base);
  color: #606266;
  position: relative;
  padding-left: 12px;
  width: auto !important;
  white-space: nowrap;
  text-align: left;
}

.vm-list-dialog .el-form-item.is-required .el-form-item__label::before {
  position: absolute;
  left: 0;
}

.vm-list-dialog .el-input__inner,
.vm-list-dialog .el-textarea__inner {
  font-size: var(--d-fs-base);
}

.vm-list-dialog .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.vm-list-dialog .dialog-footer .el-button {
  font-size: var(--d-fs-base);
}
</style>
