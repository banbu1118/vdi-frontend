<template>
  <div class="vm-group-container">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.groupOperation') }}</span>
        <button class="btn btn-info" @click="showAddDialog">{{ t('toolbar.add') }}</button>
        <button class="btn btn-primary" @click="showEditDialog" :disabled="selectedGroups.length !== 1">{{ t('toolbar.edit') }}</button>
        <button class="btn btn-success" @click="applyGroup" :disabled="selectedGroups.length === 0">{{ t('toolbar.apply') }}</button>
        <button class="btn btn-danger" @click="restoreGroup" :disabled="selectedGroups.length === 0">{{ t('toolbar.restore') }}</button>
        <button class="btn btn-danger" @click="rebuildGroup" :disabled="selectedGroups.length === 0">{{ t('toolbar.rebuild') }}</button>
        <button class="btn btn-danger" @click="deleteGroups" :disabled="selectedGroups.length === 0">{{ t('toolbar.delete') }}</button>
      </div>
    </div>

    <!-- 添加虚拟机组对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="t('dialog.addVMGroup')"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="180px">
        <el-form-item :label="t('form.vmGroup')" required>
          <el-input v-model="form.vm_group" :placeholder="t('form.vmGroupPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.description')">
          <el-input v-model="form.description" type="textarea" :placeholder="t('form.descriptionPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.vmUser')" required>
          <el-input v-model="form.vm_user" :placeholder="t('form.vmUserPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.vmPassword')">
          <el-input v-model="form.vm_password" :placeholder="t('form.vmPasswordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.rdpPort')" required>
          <el-input v-model="form.rdp_port" :placeholder="t('form.rdpPortPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.templateName')" required>
          <el-select v-model="form.template_vmid" :placeholder="t('form.templateNamePlaceholder')" filterable>
            <el-option v-for="template in templates" :key="String(template.vmid)" :label="template.name" :value="String(template.vmid)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.isFullClone')" required>
          <el-select v-model="form.is_full_clone" :placeholder="t('form.isFullClonePlaceholder')">
            <el-option :label="t('form.linkedClone')" value="0" />
            <el-option :label="t('form.fullClone')" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.is_full_clone === '0'" :label="t('form.isSnapshot')" required>
          <el-select v-model="form.is_snapshot" :placeholder="t('form.isSnapshotPlaceholder')">
            <el-option :label="t('form.disabled')" :value="'0'" />
            <el-option :label="t('form.enabled')" :value="'1'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.vmCount')" required>
          <el-input v-model="form.vm_count" :placeholder="t('form.vmCountPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.vmPrefix')" required>
          <el-input v-model="form.vm_prefix" :placeholder="t('form.vmPrefixPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.vmSuffix')" required>
          <el-input v-model="form.vm_suffix" :placeholder="t('form.vmSuffixPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.cpus')" required>
          <el-input v-model="form.cpus" :placeholder="t('form.cpusPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.memoryMb')" required>
          <el-select v-model="form.memory_mb" :placeholder="t('form.memoryMbPlaceholder')" filterable allow-create default-first-option>
            <el-option label="512" value="512" />
            <el-option label="1024" value="1024" />
            <el-option label="2048" value="2048" />
            <el-option label="4096" value="4096" />
            <el-option label="6144" value="6144" />
            <el-option label="8192" value="8192" />
            <el-option label="10240" value="10240" />
            <el-option label="12288" value="12288" />
            <el-option label="16384" value="16384" />
            <el-option label="32768" value="32768" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.is_full_clone === '1'" :label="t('form.storage')" required>
          <el-select v-model="form.storage" :placeholder="t('form.storagePlaceholder')" @visible-change="handleStorageSelectVisibleChange">
            <el-option v-for="storage in storages" :key="storage" :label="storage" :value="storage" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.networkInterface')" required>
          <el-select v-model="form.network_interface" :placeholder="t('form.networkInterfacePlaceholder')" @visible-change="handleBridgeSelectVisibleChange">
            <el-option v-for="bridge in bridges" :key="bridge" :label="bridge" :value="bridge" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.isVlan')" required>
          <el-select v-model="form.is_vlan" :placeholder="t('form.isVlanPlaceholder')">
            <el-option :label="t('form.disabled')" value="0" />
            <el-option :label="t('form.enabled')" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.is_vlan === '1'" :label="t('form.vlanId')" required>
          <el-input v-model="form.vlan_id" :placeholder="t('form.vlanIdPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.isStaticIp')" required>
          <el-select v-model="form.is_static_ip" :placeholder="t('form.isStaticIpPlaceholder')">
            <el-option :label="t('form.disabled')" value="0" />
            <el-option :label="t('form.enabled')" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.ipStart')" required>
          <el-input v-model="form.ip_start" :placeholder="t('form.ipStartPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.ipEnd')" required>
          <el-input v-model="form.ip_end" :placeholder="t('form.ipEndPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.netmask')" required>
          <el-input v-model="form.netmask" :placeholder="t('form.netmaskPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.gateway')">
          <el-input v-model="form.gateway" :placeholder="t('form.gatewayPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.dns1')">
          <el-input v-model="form.dns1" :placeholder="t('form.dns1Placeholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.dns2')">
          <el-input v-model="form.dns2" :placeholder="t('form.dns2Placeholder')" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false; resetForm()">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="addVMGroup">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 编辑虚拟机组对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="t('dialog.editVMGroup')"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="180px">
        <el-form-item :label="t('form.vmGroup')" required>
          <el-input v-model="form.vm_group" :placeholder="t('form.vmGroupPlaceholder')" :disabled="true" />
        </el-form-item>
        <el-form-item :label="t('form.description')">
          <el-input v-model="form.description" type="textarea" :placeholder="t('form.descriptionPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.vmUser')" required>
          <el-input v-model="form.vm_user" :placeholder="t('form.vmUserPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.vmPassword')">
          <el-input v-model="form.vm_password" :placeholder="t('form.vmPasswordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.rdpPort')" required>
          <el-input v-model="form.rdp_port" :placeholder="t('form.rdpPortPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.templateName')" required>
          <el-select v-model="form.template_vmid" :placeholder="t('form.templateNamePlaceholder')" filterable>
            <el-option v-for="template in templates" :key="String(template.vmid)" :label="template.name" :value="String(template.vmid)" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.isFullClone')" required>
          <el-select v-model="form.is_full_clone" :placeholder="t('form.isFullClonePlaceholder')">
            <el-option :label="t('form.linkedClone')" value="0" />
            <el-option :label="t('form.fullClone')" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.is_full_clone === '0'" :label="t('form.isSnapshot')" required>
          <el-select v-model="form.is_snapshot" :placeholder="t('form.isSnapshotPlaceholder')">
            <el-option :label="t('form.disabled')" :value="'0'" />
            <el-option :label="t('form.enabled')" :value="'1'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.vmCount')" required>
          <el-input v-model="form.vm_count" :placeholder="t('form.vmCountPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.vmPrefix')" required>
          <el-input v-model="form.vm_prefix" :placeholder="t('form.vmPrefixPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.vmSuffix')" required>
          <el-input v-model="form.vm_suffix" :placeholder="t('form.vmSuffixPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.cpus')" required>
          <el-input v-model="form.cpus" :placeholder="t('form.cpusPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.memoryMb')" required>
          <el-select v-model="form.memory_mb" :placeholder="t('form.memoryMbPlaceholder')" filterable allow-create default-first-option>
            <el-option label="512" value="512" />
            <el-option label="1024" value="1024" />
            <el-option label="2048" value="2048" />
            <el-option label="4096" value="4096" />
            <el-option label="6144" value="6144" />
            <el-option label="8192" value="8192" />
            <el-option label="10240" value="10240" />
            <el-option label="12288" value="12288" />
            <el-option label="16384" value="16384" />
            <el-option label="32768" value="32768" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.is_full_clone === '1'" :label="t('form.storage')" required>
          <el-select v-model="form.storage" :placeholder="t('form.storagePlaceholder')" @visible-change="handleStorageSelectVisibleChange">
            <el-option v-for="storage in storages" :key="storage" :label="storage" :value="storage" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.networkInterface')" required>
          <el-select v-model="form.network_interface" :placeholder="t('form.networkInterfacePlaceholder')" @visible-change="handleBridgeSelectVisibleChange">
            <el-option v-for="bridge in bridges" :key="bridge" :label="bridge" :value="bridge" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.isVlan')" required>
          <el-select v-model="form.is_vlan" :placeholder="t('form.isVlanPlaceholder')">
            <el-option :label="t('form.disabled')" value="0" />
            <el-option :label="t('form.enabled')" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.is_vlan === '1'" :label="t('form.vlanId')" required>
          <el-input v-model="form.vlan_id" :placeholder="t('form.vlanIdPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.isStaticIp')" required>
          <el-select v-model="form.is_static_ip" :placeholder="t('form.isStaticIpPlaceholder')">
            <el-option :label="t('form.disabled')" value="0" />
            <el-option :label="t('form.enabled')" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.ipStart')" required>
          <el-input v-model="form.ip_start" :placeholder="t('form.ipStartPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.ipEnd')" required>
          <el-input v-model="form.ip_end" :placeholder="t('form.ipEndPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.netmask')" required>
          <el-input v-model="form.netmask" :placeholder="t('form.netmaskPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.gateway')">
          <el-input v-model="form.gateway" :placeholder="t('form.gatewayPlaceholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.dns1')">
          <el-input v-model="form.dns1" :placeholder="t('form.dns1Placeholder')" />
        </el-form-item>
        <el-form-item v-if="form.is_static_ip === '1'" :label="t('form.dns2')">
          <el-input v-model="form.dns2" :placeholder="t('form.dns2Placeholder')" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false; resetForm()">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="editVMGroup">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 虚拟机组列表标题 -->
    <div class="table-title">
      {{ t('groupList.title') }}
    </div>

    <!-- 选中信息 -->
    <div class="selected-info" v-if="selectedGroups.length > 0">
      {{ t('groupList.selectedGroups', { count: selectedGroups.length }) }}
    </div>

    <!-- 虚拟机组表格 -->
    <div class="table-container">
      <table class="vm-group-table">
        <thead>
          <tr>
            <th class="col-checkbox">{{ t('groupList.checkbox') }}</th>
            <th class="col-name">{{ t('groupList.name') }}</th>
            <th class="col-snapshot">{{ t('groupList.snapshot') }}</th>
            <th class="col-desc">{{ t('groupList.description') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in groupList" :key="group.vm_group">
            <td>
              <input 
                type="checkbox" 
                :value="group.vm_group"
                v-model="selectedGroups"
              />
            </td>
            <td>{{ group.vm_group }}</td>
            <td>{{ group.is_snapshot === '1' ? t('form.enabled') : t('form.disabled') }}</td>
            <td>{{ group.description || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus'
import { useI18n } from 'vue-i18n'

export default {
  name: 'VMGroup',
  setup() {
    const { t } = useI18n()
    // 响应式数据
    const selectedGroups = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const windowHeight = ref(window.innerHeight)
    const loading = ref(false)
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
    const sortKey = ref('id')  // 当前排序列
    const sortOrder = ref('asc')  // 排序方向: 'asc' 升序, 'desc' 降序
    
    // 虚拟机组列表数据
    const groupList = ref([])
    let pollingTimer = null
    
    // 模板列表数据
    const templates = ref([])
    const templatesLoading = ref(false)
    
    // 存储列表数据
    const storages = ref([])
    const storagesLoading = ref(false)
    
    // 网络接口列表数据
    const bridges = ref([])
    const bridgesLoading = ref(false)

    // 获取虚拟机组列表数据
    const fetchGroupList = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          loading.value = true
        }
        error.value = ''
        
        // 调用真实API获取虚拟机组列表
        const response = await axios.get('/vmgroup/getAllVMGroups')
        const result = response.data
        
        if (result.code === 0 && result.data && Array.isArray(result.data)) {
          groupList.value = result.data
        } else {
          console.warn('⚠️ API返回数据格式不正确:', result)
          groupList.value = []
        }
      } catch (error) {
        console.warn('❌ API调用异常:', error.message)
        error.value = error.message || t('message.networkError')
        groupList.value = []
      } finally {
        if (isInitialLoad) {
          loading.value = false
        }
      }
    }

    // 获取模板列表数据
    const fetchTemplates = async () => {
      try {
        templatesLoading.value = true
        const response = await axios.get('/tasks/templates')
        if (response.data?.code === 0) {
          // 确保模板数据格式正确
          templates.value = (response.data.data || []).map(template => ({
            vmid: template.vmid || template.id || template.VMID,
            name: template.name || template.template_name || 'Unknown Template'
          }))
          // console.log('处理后的模板数据:', templates.value)
        } else {
          console.warn('⚠️ API返回数据格式不正确:', response.data)
          templates.value = []
          ElMessage.error(t('message.templateListFailed'))
        }
      } catch (error) {
        console.error('获取模板列表失败:', error.message)
        templates.value = []
        ElMessage.error('获取模板列表失败: ' + error.message)
      } finally {
        templatesLoading.value = false
      }
    }

    // 获取存储列表数据
    const fetchStorages = async () => {
      try {
        storagesLoading.value = true
        const response = await axios.get('/vmgroup/getStorages')
        if (response.data?.code === 0) {
          storages.value = response.data.data || []
        } else {
          console.warn('⚠️ API返回数据格式不正确:', response.data)
          storages.value = []
          ElMessage.error(t('message.storageListFailed'))
        }
      } catch (error) {
        console.error('获取存储列表失败:', error.message)
        storages.value = []
        ElMessage.error('获取存储列表失败: ' + error.message)
      } finally {
        storagesLoading.value = false
      }
    }

    // 获取网络接口列表数据
    const fetchBridges = async () => {
      try {
        bridgesLoading.value = true
        const response = await axios.get('/vmgroup/getBridges')
        if (response.data?.code === 0) {
          bridges.value = response.data.data || []
        } else {
          console.warn('⚠️ API返回数据格式不正确:', response.data)
          bridges.value = []
          ElMessage.error(t('message.networkInterfaceListFailed'))
        }
      } catch (error) {
        console.error('获取网络接口列表失败:', error.message)
        bridges.value = []
        ElMessage.error('获取网络接口列表失败: ' + error.message)
      } finally {
        bridgesLoading.value = false
      }
    }

    // 启动轮询
    const startPolling = () => {
      fetchGroupList(true)
      pollingTimer = setInterval(() => {
        fetchGroupList(false)
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
    const sortedAllGroups = computed(() => {
      return [...groupList.value].sort((a, b) => {
        let aVal = a[sortKey.value]
        let bVal = b[sortKey.value]
        
        // 处理 null/undefined/空值
        if (aVal == null || aVal === '') aVal = ''
        if (bVal == null || bVal === '') bVal = ''
        
        // 特殊处理数字类型字段
        const numericFields = ['id', 'vmCount']
        if (numericFields.includes(sortKey.value)) {
          aVal = parseFloat(aVal) || 0
          bVal = parseFloat(bVal) || 0
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
    const paginatedGroups = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sortedAllGroups.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(groupList.value.length / pageSize.value)
    })

    // 方法
    const toggleSelectAll = () => {
      if (selectedGroups.value.length === groupList.value.length) {
        selectedGroups.value = []
      } else {
        selectedGroups.value = groupList.value.map(group => group.vm_group)
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

    // 对话框相关
    const addDialogVisible = ref(false)
    const editDialogVisible = ref(false)
    const form = ref({
      vm_group: '',
      description: '',
      vm_user: '',
      vm_password: '',
      rdp_port: '3389',
      template_vmid: '',
      template_name: '',
      is_full_clone: '0',
      vm_count: '',
      vm_prefix: '',
      vm_suffix: '',
      cpus: '',
      memory_mb: '',
      storage: '',
      network_interface: '',
      is_vlan: '0',
      vlan_id: '',
      is_static_ip: '0',
      ip_start: '',
      ip_end: '',
      netmask: '',
      gateway: '',
      dns1: '',
      dns2: '',
      is_snapshot: '0'
    })

    const showAddDialog = async () => {
      resetForm()
      // 确保模板数据已加载
      if (templates.value.length === 0) {
        await fetchTemplates()
      }
      addDialogVisible.value = true
    }

    const showEditDialog = async () => {
      const selectedGroupId = selectedGroups.value[0]
      try {
        // 调用API获取虚拟机组详细信息
        const response = await axios.post('/vmgroup/getVMGroup', { vm_group: selectedGroupId })
        const result = response.data
        
        if (result.code === 0 && result.data) {
          // 使用API返回的数据填充表单
          form.value = {
            vm_group: result.data.vm_group || '',
            description: result.data.description || '',
            vm_user: result.data.vm_user || '',
            vm_password: result.data.vm_password || '',
            rdp_port: result.data.rdp_port || '3389',
            template_vmid: result.data.template_vmid || '',
            template_name: result.data.template_name || '',
            is_full_clone: result.data.is_full_clone || '0',
            vm_count: result.data.vm_count || '',
            vm_prefix: result.data.vm_prefix || '',
            vm_suffix: result.data.vm_suffix || '',
            cpus: result.data.cpus || '',
            memory_mb: result.data.memory_mb || '',
            storage: result.data.storage || '',
            network_interface: result.data.network_interface || '',
            is_vlan: result.data.is_vlan || '0',
            vlan_id: result.data.vlan_id || '',
            is_static_ip: result.data.is_static_ip || '0',
            ip_start: result.data.ip_start || '',
            ip_end: result.data.ip_end || '',
            netmask: result.data.netmask || '',
            gateway: result.data.gateway || '',
            dns1: result.data.dns1 || '',
            dns2: result.data.dns2 || '',
            is_snapshot: result.data.is_snapshot || '0'
          }
          
          // 确保模板数据已加载
          await fetchTemplates()
          
          // 确保模板VMID类型一致
          form.value.template_vmid = String(form.value.template_vmid)
          
          // 检查模板是否存在
          const templateExists = templates.value.some(template => String(template.vmid) == form.value.template_vmid)
          if (!templateExists) {
            ElMessage.warning('找不到对应的模板信息，可能需要重新选择模板')
          }
          
          editDialogVisible.value = true
        } else {
          ElMessage.error(t('message.groupDetailFailed'))
        }
      } catch (error) {
        console.error('获取虚拟机组详情失败:', error.message)
        ElMessage.error('获取虚拟机组详情失败: ' + error.message)
      }
    }

    const resetForm = () => {
      form.value = {
        vm_group: '',
        description: '',
        vm_user: '',
        vm_password: '',
        rdp_port: '3389',
        template_vmid: '',
        template_name: '',
        is_full_clone: '0',
        vm_count: '',
        vm_prefix: '',
        vm_suffix: '',
        cpus: '',
        memory_mb: '',
        storage: '',
        network_interface: '',
        is_vlan: '0',
        vlan_id: '',
        is_static_ip: '0',
        ip_start: '',
        ip_end: '',
        netmask: '',
        gateway: '',
        dns1: '',
        dns2: '',
        is_snapshot: '0'
      }
    }

    // 处理存储选择框显示/隐藏事件
    const handleStorageSelectVisibleChange = async (visible) => {
      if (visible && storages.value.length === 0) {
        await fetchStorages()
      }
    }

    // 处理网络接口选择框显示/隐藏事件
    const handleBridgeSelectVisibleChange = async (visible) => {
      if (visible && bridges.value.length === 0) {
        await fetchBridges()
      }
    }

    // 辅助函数：过滤非数字字符
    const filterNonDigits = (value) => {
      return String(value).replace(/[^0-9]/g, '')
    }

    // 辅助函数：验证IPv4地址格式
    const validateIPv4 = (ip) => {
      const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipv4Regex.test(ip)) {
        return false
      }
      // 检查每段是否以0开头（除了0本身）
      const parts = ip.split('.')
      for (const part of parts) {
        if (part.length > 1 && part.startsWith('0')) {
          return false
        }
      }
      return true
    }

    // 辅助函数：验证IPv4子网掩码格式
    const validateNetmask = (netmask) => {
      const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipv4Regex.test(netmask)) {
        return false
      }
      // 检查是否为有效的子网掩码
      const parts = netmask.split('.').map(Number)
      const binary = parts.map(p => p.toString(2).padStart(8, '0')).join('')
      // 子网掩码必须是连续的1后面跟着连续的0
      return /^1+0+$/.test(binary)
    }

    const addVMGroup = async () => {
      try {
        // 过滤非数字字段
        form.value.rdp_port = filterNonDigits(form.value.rdp_port)
        form.value.vm_count = filterNonDigits(form.value.vm_count)
        form.value.cpus = filterNonDigits(form.value.cpus)
        form.value.memory_mb = filterNonDigits(form.value.memory_mb)
        form.value.vlan_id = filterNonDigits(form.value.vlan_id)

        // 根据选择的template_vmid设置template_name
        const selectedTemplate = templates.value.find(t => t.vmid === parseInt(form.value.template_vmid))
        if (selectedTemplate) {
          form.value.template_name = selectedTemplate.name
        }

        // 确保字段类型正确
        if (form.value.is_snapshot === undefined || form.value.is_snapshot === null) {
          form.value.is_snapshot = '0'
        } else {
          form.value.is_snapshot = String(form.value.is_snapshot)
        }
        
        // 验证必填项和格式
        if (!form.value.vm_group.trim()) {
          ElMessage.warning(t('message.enterVMGroup'))
          return
        }
        if (form.value.vm_group.length < 2 || form.value.vm_group.length > 50) {
          ElMessage.warning(t('message.vmGroupLength'))
          return
        }
        // 描述验证
        if (form.value.description && form.value.description.length > 200) {
          ElMessage.warning(t('message.descriptionLength'))
          return
        }
        // 虚拟机用户名验证
        if (!form.value.vm_user.trim()) {
          ElMessage.warning(t('message.enterVMUser'))
          return
        }
        if (form.value.vm_user.length < 1 || form.value.vm_user.length > 32) {
          ElMessage.warning(t('message.vmUserLength'))
          return
        }
        if (!/^[a-zA-Z0-9_.]+$/.test(form.value.vm_user)) {
          ElMessage.warning(t('message.vmUserPattern'))
          return
        }
        // 虚拟机密码验证
        if (form.value.vm_password) {
          if (form.value.vm_password.length > 64) {
            ElMessage.warning(t('message.vmPasswordLength'))
            return
          }
          // 验证密码字符限制（字母大写、小写、数字、特殊字符）
          if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(form.value.vm_password)) {
            ElMessage.warning(t('message.vmPasswordPattern'))
            return
          }
        }
        // RDP端口验证
        if (!form.value.rdp_port) {
          ElMessage.warning(t('message.enterRDPPort'))
          return
        }
        const rdpPort = parseInt(form.value.rdp_port)
        if (isNaN(rdpPort) || rdpPort < 1 || rdpPort > 65535) {
          ElMessage.warning(t('message.rdpPortRange'))
          return
        }
        // 模板验证
        if (!form.value.template_vmid) {
          ElMessage.warning(t('message.selectTemplate'))
          return
        }
        if (!form.value.template_name) {
          ElMessage.warning(t('message.selectTemplate'))
          return
        }
        // 虚拟机数量验证
        if (!form.value.vm_count) {
          ElMessage.warning(t('message.enterVMCount'))
          return
        }
        const vmCount = parseInt(form.value.vm_count)
        if (isNaN(vmCount) || vmCount < 1 || vmCount > 1000) {
          ElMessage.warning(t('message.vmCountRange'))
          return
        }
        // 虚拟机前缀验证
        if (!form.value.vm_prefix.trim()) {
          ElMessage.warning(t('message.enterVMPrefix'))
          return
        }
        if (form.value.vm_prefix.length < 1 || form.value.vm_prefix.length > 20) {
          ElMessage.warning(t('message.vmPrefixLength'))
          return
        }
        if (!/^[a-zA-Z0-9-]+$/.test(form.value.vm_prefix)) {
          ElMessage.warning(t('message.vmPrefixPattern'))
          return
        }
        // 虚拟机后缀验证
        if (!form.value.vm_suffix.trim()) {
          ElMessage.warning(t('message.enterVMSuffix'))
          return
        }
        if (form.value.vm_suffix.length > 10) {
          ElMessage.warning(t('message.vmSuffixLength'))
          return
        }
        if (!/^[a-zA-Z0-9]+$/.test(form.value.vm_suffix)) {
          ElMessage.warning(t('message.vmSuffixPattern'))
          return
        }
        // 验证最后一个字符必须是数字
        if (!/[0-9]$/.test(form.value.vm_suffix)) {
          ElMessage.warning(t('message.vmSuffixEndWithNumber'))
          return
        }
        // CPU数量验证
        if (!form.value.cpus) {
          ElMessage.warning(t('message.enterCPUs'))
          return
        }
        const cpus = parseInt(form.value.cpus)
        if (isNaN(cpus) || cpus < 1 || cpus > 512) {
          ElMessage.warning(t('message.cpusRange'))
          return
        }
        // 内存验证
        if (!form.value.memory_mb) {
          ElMessage.warning(t('message.enterMemory'))
          return
        }
        const memory = parseInt(form.value.memory_mb)
        if (isNaN(memory) || memory < 32 || memory > 262144) {
          ElMessage.warning(t('message.memoryRange'))
          return
        }
        // 存储验证（仅在完整克隆时验证）
        if (form.value.is_full_clone === '1' && !form.value.storage.trim()) {
          ElMessage.warning(t('message.enterStorage'))
          return
        }
        // 网络接口验证
        if (!form.value.network_interface.trim()) {
          ElMessage.warning(t('message.enterNetworkInterface'))
          return
        }
        // VLAN验证
        if (form.value.is_vlan === '1') {
          if (!form.value.vlan_id) {
            ElMessage.warning(t('message.enterVlanId'))
            return
          }
          const vlanId = parseInt(form.value.vlan_id)
          if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
            ElMessage.warning(t('message.vlanIdRange'))
            return
          }
        }
        // 静态IP验证
        if (form.value.is_static_ip === '1') {
          if (!form.value.ip_start.trim()) {
            ElMessage.warning(t('message.enterIPStart'))
            return
          }
          if (!validateIPv4(form.value.ip_start)) {
            ElMessage.warning(t('message.ipStartFormat'))
            return
          }
          if (!form.value.ip_end.trim()) {
            ElMessage.warning(t('message.enterIPEnd'))
            return
          }
          if (!validateIPv4(form.value.ip_end)) {
            ElMessage.warning(t('message.ipEndFormat'))
            return
          }
          if (!form.value.netmask.trim()) {
            ElMessage.warning(t('message.enterNetmask'))
            return
          }
          if (!validateNetmask(form.value.netmask)) {
            ElMessage.warning(t('message.netmaskFormat'))
            return
          }
          // 默认网关验证
          if (!form.value.gateway.trim()) {
            ElMessage.warning(t('message.enterValidGateway'))
            return
          }
          if (!validateIPv4(form.value.gateway)) {
            ElMessage.warning(t('message.gatewayFormat'))
            return
          }
          // DNS验证
          if (form.value.dns1 && !validateIPv4(form.value.dns1)) {
            ElMessage.warning(t('message.dns1Format'))
            return
          }
          if (form.value.dns2 && !validateIPv4(form.value.dns2)) {
            ElMessage.warning(t('message.dns2Format'))
            return
          }
        }
        
        // 检查表单数据
        // console.log('发送的表单数据:', form.value)
        
        // 发送API请求
        const response = await axios.post('/vmgroup/addVMGroup', form.value)
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('message.addSuccess'))
          addDialogVisible.value = false
          await fetchGroupList()
          resetForm()
        } else {
          ElMessage.error(result.message || t('message.addFailed'))
        }
      } catch (error) {
        console.error('添加虚拟机组失败:', error.message)
        if (error.response && error.response.status === 400) {
          ElMessage.error(t('message.vmGroupAlreadyExists'))
        } else {
          ElMessage.error(t('message.addFailed') + ': ' + error.message)
        }
      }
    }

    const applyGroup = async () => {
      try {
        if (selectedGroups.value.length === 0) {
          ElMessage.warning(t('message.selectAtLeastOneGroup'))
          return
        }
        
        // 遍历应用每个选中的虚拟机组
        for (const vmGroup of selectedGroups.value) {
          try {
            // console.log('应用虚拟机组:', vmGroup)
            // 发送API请求
            const response = await axios.post('/vmgroup/apply', { vm_group: vmGroup })
            const result = response.data
            
            if (result.code === 0) {
              ElMessage.success(t('message.applySuccess'))
            } else {
              ElMessage.error(`${t('message.groupApplyFailed', { error: result.message || t('message.unknownError') })}`)
            }
          } catch (error) {
            console.error(`应用虚拟机组 ${vmGroup} 失败:`, error.message)
            ElMessage.error(t('message.groupApplyFailed', { error: error.message }))
          }
        }
      } catch (error) {
        console.error('应用虚拟机组失败:', error.message)
        ElMessage.error(t('message.groupApplyFailed', { error: error.message }))
      }
    }

    const restoreGroup = async () => {
      try {
        if (selectedGroups.value.length === 0) {
          ElMessage.warning(t('message.selectAtLeastOneGroup'))
          return
        }
        
        // 遍历还原每个选中的虚拟机组
        for (const vmGroup of selectedGroups.value) {
          try {
            // console.log('还原虚拟机组:', vmGroup)
            // 发送API请求
            const response = await axios.post('/vmgroup/rollback', { vm_group: vmGroup })
            const result = response.data
            
            if (result.code === 0) {
              ElMessage.success(t('message.groupRestoreSuccess'))
            } else {
              ElMessage.error(t('message.groupRestoreFailed', { error: result.message || t('message.unknownError') }))
            }
          } catch (error) {
            console.error(`还原虚拟机组 ${vmGroup} 失败:`, error.message)
            ElMessage.error(t('message.groupRestoreFailed', { error: error.message }))
          }
        }
      } catch (error) {
        console.error('还原虚拟机组失败:', error.message)
        ElMessage.error(t('message.groupRestoreFailed', { error: error.message }))
      }
    }

    const rebuildGroup = async () => {
      try {
        if (selectedGroups.value.length === 0) {
          ElMessage.warning(t('message.selectAtLeastOneGroup'))
          return
        }
        
        // 遍历重建每个选中的虚拟机组
        for (const vmGroup of selectedGroups.value) {
          try {
            // console.log('重建虚拟机组:', vmGroup)
            // 发送API请求
            const response = await axios.post('/vmgroup/rebuild', { vm_group: vmGroup })
            const result = response.data
            
            if (result.code === 0) {
              ElMessage.success(t('message.groupRebuildSuccess'))
            } else {
              ElMessage.error(t('message.groupRebuildFailed', { error: result.message || t('message.unknownError') }))
            }
          } catch (error) {
            console.error(`重建虚拟机组 ${vmGroup} 失败:`, error.message)
            ElMessage.error(t('message.groupRebuildFailed', { error: error.message }))
          }
        }
      } catch (error) {
        console.error('重建虚拟机组失败:', error.message)
        ElMessage.error(t('message.groupRebuildFailed', { error: error.message }))
      }
    }

    const deleteGroups = async () => {
      try {
        await ElMessageBox.confirm(
          t('dialog.confirmDeleteGroups', { count: selectedGroups.value.length }),
          t('common.confirm'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'danger'
          }
        )
        
        // 遍历删除每个选中的虚拟机组
        for (const vmGroup of selectedGroups.value) {
          try {
            const response = await axios.delete('/vmgroup/deleteVMGroup', {
              data: { vm_group: vmGroup }
            })
            const result = response.data
            
            if (result.code !== 0) {
              ElMessage.error(`${t('message.groupDeleteFailed', { error: result.message || t('message.unknownError') })}`)
            }
          } catch (error) {
            console.error(`删除虚拟机组 ${vmGroup} 失败:`, error.message)
            ElMessage.error(t('message.groupDeleteFailed', { error: error.message }))
          }
        }
        
        // 删除完成后刷新列表
        await fetchGroupList()
        selectedGroups.value = []
        ElMessage.success(t('message.groupDeleteSuccess'))
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除虚拟机组失败:', error.message)
          ElMessage.error(t('message.groupDeleteFailed', { error: error.message }))
        }
      }
    }

    const editVMGroup = async () => {
      try {
        // 过滤非数字字段
        form.value.rdp_port = filterNonDigits(form.value.rdp_port)
        form.value.vm_count = filterNonDigits(form.value.vm_count)
        form.value.cpus = filterNonDigits(form.value.cpus)
        form.value.memory_mb = filterNonDigits(form.value.memory_mb)
        form.value.vlan_id = filterNonDigits(form.value.vlan_id)

        // 验证必填项和格式
        if (!form.value.vm_group.trim()) {
          ElMessage.warning(t('message.enterVMGroup'))
          return
        }
        if (form.value.vm_group.length < 2 || form.value.vm_group.length > 50) {
          ElMessage.warning(t('message.vmGroupLength'))
          return
        }
        // 描述验证
        if (form.value.description && form.value.description.length > 200) {
          ElMessage.warning(t('message.descriptionLength'))
          return
        }
        // 虚拟机用户名验证
        if (!form.value.vm_user.trim()) {
          ElMessage.warning(t('message.enterVMUser'))
          return
        }
        if (form.value.vm_user.length < 1 || form.value.vm_user.length > 32) {
          ElMessage.warning(t('message.vmUserLength'))
          return
        }
        if (!/^[a-zA-Z0-9_.]+$/.test(form.value.vm_user)) {
          ElMessage.warning(t('message.vmUserPattern'))
          return
        }
        // 虚拟机密码验证
        if (form.value.vm_password) {
          if (form.value.vm_password.length > 64) {
            ElMessage.warning(t('message.vmPasswordLength'))
            return
          }
          // 验证密码字符限制（字母大写、小写、数字、特殊字符）
          if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(form.value.vm_password)) {
            ElMessage.warning(t('message.vmPasswordPattern'))
            return
          }
        }
        // RDP端口验证
        if (!form.value.rdp_port) {
          ElMessage.warning(t('message.enterRDPPort'))
          return
        }
        const rdpPort = parseInt(form.value.rdp_port)
        if (isNaN(rdpPort) || rdpPort < 1 || rdpPort > 65535) {
          ElMessage.warning(t('message.rdpPortRange'))
          return
        }
        // 模板验证
        if (!form.value.template_vmid) {
          ElMessage.warning(t('message.selectTemplate'))
          return
        }
        if (!form.value.template_name) {
          ElMessage.warning(t('message.selectTemplate'))
          return
        }
        // 虚拟机数量验证
        if (!form.value.vm_count) {
          ElMessage.warning(t('message.enterVMCount'))
          return
        }
        const vmCount = parseInt(form.value.vm_count)
        if (isNaN(vmCount) || vmCount < 1 || vmCount > 1000) {
          ElMessage.warning(t('message.vmCountRange'))
          return
        }
        // 虚拟机前缀验证
        if (!form.value.vm_prefix.trim()) {
          ElMessage.warning(t('message.enterVMPrefix'))
          return
        }
        if (form.value.vm_prefix.length < 1 || form.value.vm_prefix.length > 20) {
          ElMessage.warning(t('message.vmPrefixLength'))
          return
        }
        if (!/^[a-zA-Z0-9-]+$/.test(form.value.vm_prefix)) {
          ElMessage.warning(t('message.vmPrefixPattern'))
          return
        }
        // 虚拟机后缀验证
        if (!form.value.vm_suffix.trim()) {
          ElMessage.warning(t('message.enterVMSuffix'))
          return
        }
        if (form.value.vm_suffix.length > 10) {
          ElMessage.warning(t('message.vmSuffixLength'))
          return
        }
        if (!/^[a-zA-Z0-9]+$/.test(form.value.vm_suffix)) {
          ElMessage.warning(t('message.vmSuffixPattern'))
          return
        }
        // 验证最后一个字符必须是数字
        if (!/[0-9]$/.test(form.value.vm_suffix)) {
          ElMessage.warning(t('message.vmSuffixEndWithNumber'))
          return
        }
        // CPU数量验证
        if (!form.value.cpus) {
          ElMessage.warning(t('message.enterCPUs'))
          return
        }
        const cpus = parseInt(form.value.cpus)
        if (isNaN(cpus) || cpus < 1 || cpus > 512) {
          ElMessage.warning(t('message.cpusRange'))
          return
        }
        // 内存验证
        if (!form.value.memory_mb) {
          ElMessage.warning(t('message.enterMemory'))
          return
        }
        const memory = parseInt(form.value.memory_mb)
        if (isNaN(memory) || memory < 32 || memory > 262144) {
          ElMessage.warning(t('message.memoryRange'))
          return
        }
        // 存储验证（仅在完整克隆时验证）
        if (form.value.is_full_clone === '1' && !form.value.storage.trim()) {
          ElMessage.warning(t('message.enterStorage'))
          return
        }
        // 网络接口验证
        if (!form.value.network_interface.trim()) {
          ElMessage.warning(t('message.enterNetworkInterface'))
          return
        }
        // VLAN验证
        if (form.value.is_vlan === '1') {
          if (!form.value.vlan_id) {
            ElMessage.warning(t('message.enterVlanId'))
            return
          }
          const vlanId = parseInt(form.value.vlan_id)
          if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
            ElMessage.warning(t('message.vlanIdRange'))
            return
          }
        }
        // 静态IP验证
        if (form.value.is_static_ip === '1') {
          if (!form.value.ip_start.trim()) {
            ElMessage.warning(t('message.enterIPStart'))
            return
          }
          if (!validateIPv4(form.value.ip_start)) {
            ElMessage.warning(t('message.ipStartFormat'))
            return
          }
          if (!form.value.ip_end.trim()) {
            ElMessage.warning(t('message.enterIPEnd'))
            return
          }
          if (!validateIPv4(form.value.ip_end)) {
            ElMessage.warning(t('message.ipEndFormat'))
            return
          }
          if (!form.value.netmask.trim()) {
            ElMessage.warning(t('message.enterNetmask'))
            return
          }
          if (!validateNetmask(form.value.netmask)) {
            ElMessage.warning(t('message.netmaskFormat'))
            return
          }
          // 默认网关验证
          if (!form.value.gateway.trim()) {
            ElMessage.warning(t('message.enterValidGateway'))
            return
          }
          if (!validateIPv4(form.value.gateway)) {
            ElMessage.warning(t('message.gatewayFormat'))
            return
          }
          // DNS验证
          if (form.value.dns1 && !validateIPv4(form.value.dns1)) {
            ElMessage.warning(t('message.dns1Format'))
            return
          }
          if (form.value.dns2 && !validateIPv4(form.value.dns2)) {
            ElMessage.warning(t('message.dns2Format'))
            return
          }
        }
        
        // 确保字段类型正确
        if (form.value.is_snapshot === undefined || form.value.is_snapshot === null) {
          form.value.is_snapshot = '0'
        } else {
          form.value.is_snapshot = String(form.value.is_snapshot)
        }
        
        // 检查表单数据
        // console.log('发送的表单数据:', form.value)
        
        // 发送API请求
        const response = await axios.put('/vmgroup/updateVMGroup', form.value)
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('message.editSuccess'))
          editDialogVisible.value = false
          await fetchGroupList()
          resetForm()
        } else {
          ElMessage.error(result.message || t('message.editFailed'))
        }
      } catch (error) {
        console.error('编辑虚拟机组失败:', error.message)
        ElMessage.error(t('message.editFailed') + ': ' + error.message)
      }
    }

    // 组件挂载时启动轮询
    onMounted(() => {
      startPolling()
      fetchTemplates()
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
      selectedGroups,
      currentPage,
      pageSize,
      windowHeight,
      loading,
      error,
      groupList,
      templates,
      templatesLoading,
      storages,
      storagesLoading,
      bridges,
      bridgesLoading,
      paginatedGroups,
      totalPages,
      toggleSelectAll,
      handleSort,
      getSortIndicator,
      updatePageSize,
      handleResize,
      showAddDialog,
      showEditDialog,
      applyGroup,
      restoreGroup,
      rebuildGroup,
      deleteGroups,
      addDialogVisible,
      editDialogVisible,
      form,
      addVMGroup,
      editVMGroup,
      resetForm,
      fetchTemplates,
      fetchStorages,
      fetchBridges,
      handleStorageSelectVisibleChange,
      handleBridgeSelectVisibleChange,
      t
    }
  }
}
</script>

<style scoped>
.vm-group-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-weight: 600;
  color: #555;
  font-size: 13px;
  white-space: nowrap;
}

/* 表格标题 */
.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 10px 0;
}

.selected-info {
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 4px;
  color: #004085;
  font-size: 13px;
}

.table-container {
  overflow-x: auto;
  overflow-y: visible;
  margin-bottom: 20px;
  width: 100%;
}

.vm-group-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.vm-group-table th,
.vm-group-table td {
  padding: 10px 15px;
  text-align: left;
  border: 1px solid #ddd;
}

.vm-group-table th {
  background: white;
  font-weight: 600;
  color: #333;
}

/* 列宽设置 */
.col-checkbox {
  width: 80px;
  text-align: center;
}

.col-name {
  width: 200px;
}

.col-desc {
  flex: 1;
}

.col-snapshot {
  width: 100px;
  text-align: center;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-warning {
  background: #fd7e14;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
  }
  
  .toolbar-group {
    flex-wrap: wrap;
  }
  
  .vm-group-table {
    min-width: 600px;
  }
}
</style>
