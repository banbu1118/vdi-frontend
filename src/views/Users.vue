<template>
  <div class="users-container" ref="containerRef">
    <!-- 用户组列表标题 -->
    <div class="table-title">
      {{ t('userList.title') }}
    </div>

    <!-- 用户组操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.userGroupOperation') }}</span>
        <el-button class="btn btn-info" @click="showAddDialog">{{ t('toolbar.add') }}</el-button>
        <el-button class="btn btn-primary" :class="{ 'not-operable': selectedUsers.length !== 1 }" @click="selectedUsers.length === 1 && showEditDialog()">{{ t('toolbar.edit') }}</el-button>
        <el-button class="btn btn-danger" :class="{ 'not-operable': selectedUsers.length === 0 }" @click="selectedUsers.length > 0 && deleteUsers()">{{ t('toolbar.delete') }}</el-button>
        <el-button class="btn btn-warning" :class="{ 'not-operable': selectedUsers.length === 0 }" @click="selectedUsers.length > 0 && toggleUserStatus()">{{ getToggleButtonText() }}</el-button>
      </div>
    </div>

    <!-- 添加用户组对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="t('dialog.addUserGroup')"
      width="min(560px, 80vw)"
      :close-on-click-modal="false"
      draggable
      class="users-dialog"
    >
      <el-form :model="form" label-width="auto" label-position="left">
        <el-form-item :label="t('form.userGroup')" required>
          <el-input v-model="form.user_group" :placeholder="t('form.userGroupPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.description')">
          <el-input v-model="form.description" type="textarea" :placeholder="t('form.descriptionPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.bindVMGroup')">
          <el-select v-model="form.bind_vm_group" multiple :placeholder="t('form.bindVMGroupPlaceholder')" @visible-change="handleVMGroupSelectVisibleChange">
            <el-option v-for="vmGroup in vmGroups" :key="vmGroup" :label="vmGroup" :value="vmGroup" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false; resetForm()">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="addUserGroup">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 编辑用户组对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="t('dialog.editUserGroup')"
      width="min(560px, 80vw)"
      :close-on-click-modal="false"
      draggable
      class="users-dialog"
    >
      <el-form :model="form" label-width="auto" label-position="left">
        <el-form-item :label="t('form.userGroup')" required>
          <el-input v-model="form.user_group" :placeholder="t('form.userGroupPlaceholder')" :disabled="true" />
        </el-form-item>
        <el-form-item :label="t('form.description')">
          <el-input v-model="form.description" type="textarea" :placeholder="t('form.descriptionPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.bindVMGroup')">
          <el-select v-model="form.bind_vm_group" multiple :placeholder="t('form.bindVMGroupPlaceholder')" @visible-change="handleVMGroupSelectVisibleChange">
            <el-option v-for="vmGroup in vmGroups" :key="vmGroup" :label="vmGroup" :value="vmGroup" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false; resetForm()">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="editUserGroup">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量添加用户对话框 -->
    <el-dialog
      v-model="addUserDialogVisible"
      :title="t('dialog.batchAddUsers')"
      width="min(560px, 80vw)"
      :close-on-click-modal="false"
      draggable
      class="users-dialog"
    >
      <el-form :model="userForm" label-width="auto" label-position="left">
        <el-form-item :label="t('form.userPrefix')" required>
          <el-input v-model="userForm.userPrefix" :placeholder="t('form.userPrefixPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.userSuffix')" required>
          <el-input v-model="userForm.userSuffix" :placeholder="t('form.userSuffixPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.userCount')" required>
          <el-input v-model.number="userForm.userCount" type="number" :placeholder="t('form.userCountPlaceholder')" min="1" max="1000" />
        </el-form-item>
        <el-form-item :label="t('form.password')" required>
          <el-input v-model="userForm.password" type="password" :placeholder="t('form.passwordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.remark')">
          <el-input v-model="userForm.remark" type="textarea" :placeholder="t('form.remarkPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.group')" required>
          <el-select v-model="userForm.group" :placeholder="t('form.groupPlaceholder')">
            <el-option v-for="group in userGroups" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.publicGateway')">
          <el-segmented v-model="userForm.public_gateway" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.direct')">
          <el-segmented v-model="userForm.direct" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.audioRedirect')">
          <el-segmented v-model="userForm.audio_redirect" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.usbRedirect')">
          <el-segmented v-model="userForm.usb_redirect" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.driveRedirect')">
          <el-segmented v-model="userForm.drive_redirect" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.printerRedirect')">
          <el-segmented v-model="userForm.printer_redirect" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.clipboardRedirect')">
          <el-segmented v-model="userForm.clipboard_redirect" :options="yesNoOptions" @change="handleClipboardRedirectChange" />
        </el-form-item>
        <el-form-item :label="t('form.clientToServerClipboard')" v-if="userForm.clipboard_redirect === '1'">
          <el-segmented v-model="userForm.client_to_server_clipboard" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.serverToClientClipboard')" v-if="userForm.clipboard_redirect === '1'">
          <el-segmented v-model="userForm.server_to_client_clipboard" :options="yesNoOptions" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addUserDialogVisible = false; resetUserForm()">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="batchAddUsers">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editUserDialogVisible"
      :title="t('dialog.editUser')"
      width="min(560px, 80vw)"
      :close-on-click-modal="false"
      draggable
      class="users-dialog"
    >
      <el-form :model="userForm" label-width="auto" label-position="left">
        <el-form-item :label="t('form.username')" required>
          <el-input v-model="userForm.username" :placeholder="t('form.usernamePlaceholder')" :disabled="true" />
        </el-form-item>
        <el-form-item :label="t('form.password')" v-if="false">
          <el-input v-model="userForm.password" type="password" :placeholder="t('form.passwordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.remark')">
          <el-input v-model="userForm.remark" type="textarea" :placeholder="t('form.remarkPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('form.group')" required>
          <el-select v-model="userForm.group" :placeholder="t('form.groupPlaceholder')">
            <el-option v-for="group in userGroups" :key="group" :label="group" :value="group" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.publicGateway')">
          <el-segmented v-model="userForm.public_gateway" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.direct')">
          <el-segmented v-model="userForm.direct" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.audioRedirect')">
          <el-segmented v-model="userForm.audio_redirect" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.usbRedirect')">
          <el-segmented v-model="userForm.usb_redirect" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.driveRedirect')">
          <el-segmented v-model="userForm.drive_redirect" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.printerRedirect')">
          <el-segmented v-model="userForm.printer_redirect" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.clipboardRedirect')">
          <el-segmented v-model="userForm.clipboard_redirect" :options="yesNoOptions" @change="handleClipboardRedirectChange" />
        </el-form-item>
        <el-form-item :label="t('form.clientToServerClipboard')" v-if="userForm.clipboard_redirect === '1'">
          <el-segmented v-model="userForm.client_to_server_clipboard" :options="yesNoOptions" />
        </el-form-item>
        <el-form-item :label="t('form.serverToClientClipboard')" v-if="userForm.clipboard_redirect === '1'">
          <el-segmented v-model="userForm.server_to_client_clipboard" :options="yesNoOptions" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editUserDialogVisible = false; resetUserForm()">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="editUser">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="changePasswordDialogVisible"
      :title="t('toolbar.updatePassword')"
      width="min(420px, 80vw)"
      :close-on-click-modal="false"
      draggable
      class="users-dialog"
    >
      <el-form :model="passwordForm" label-width="auto" label-position="left">
        <el-form-item :label="t('form.username')" required>
          <el-input v-model="passwordForm.username" :placeholder="t('form.usernamePlaceholder')" :disabled="true" />
        </el-form-item>
        <el-form-item :label="t('form.password')" required>
          <el-input v-model="passwordForm.password" type="password" :placeholder="t('form.passwordPlaceholder')" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="changePasswordDialogVisible = false; resetPasswordForm()">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="changePassword">{{ t('common.ok') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 选中信息 -->
    <div class="selected-info" v-if="selectedUsers.length > 0">
      {{ t('userList.selectedUsers', { count: selectedUsers.length }) }}
    </div>

    <!-- 用户组表格 -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th class="col-checkbox">
              <input 
                type="checkbox" 
                :checked="isAllUsersSelected"
                @change="toggleSelectAllUsers"
              />
            </th>
            <th class="col-name">{{ t('userList.userGroup') }}</th>
            <th class="col-vm-group">{{ t('userList.bindVMGroup') }}</th>
            <th class="col-status">{{ t('userList.status') }}</th>
            <th class="col-description">{{ t('userList.description') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.userGroup">
            <td>
              <input 
                type="checkbox" 
                :value="user.userGroup"
                v-model="selectedUsers"
              />
            </td>
            <td>{{ user.userGroup }}</td>
            <td>{{ user.vmGroups }}</td>
            <td>{{ user.disabled === '0' ? t('form.enabled') : t('form.disabled') }}</td>
            <td>{{ user.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 用户列表标题 -->
    <div class="table-title">
      {{ t('userDetailList.title') }}
    </div>

    <!-- 用户操作工具栏 -->
    <div class="toolbar" ref="userDetailToolbarRef">
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.userOperation') }}</span>
        <el-button class="btn btn-info" @click="showAddUserDialog">{{ t('toolbar.add') }}</el-button>
        <el-button class="btn btn-primary" :class="{ 'not-operable': selectedUserDetails.length !== 1 }" @click="selectedUserDetails.length === 1 && showEditUserDialog()">{{ t('toolbar.edit') }}</el-button>
        <el-button class="btn btn-danger" :class="{ 'not-operable': selectedUserDetails.length === 0 }" @click="selectedUserDetails.length > 0 && deleteUser()">{{ t('toolbar.delete') }}</el-button>
        <el-button class="btn btn-warning" :class="{ 'not-operable': selectedUserDetails.length === 0 }" @click="selectedUserDetails.length > 0 && toggleUserDetailStatus()">{{ getToggleUserDetailButtonText() }}</el-button>
        <el-button class="btn btn-info" :class="{ 'not-operable': selectedUserDetails.length !== 1 }" @click="selectedUserDetails.length === 1 && showChangePasswordDialog()">{{ t('toolbar.updatePassword') }}</el-button>
        <el-button class="btn btn-success" :class="{ 'not-operable': selectedUserDetails.length !== 1 }" @click="selectedUserDetails.length === 1 && unlockUser()">{{ t('toolbar.unlockUser') }}</el-button>
      </div>
    </div>

    <!-- 用户筛选栏 -->
    <div class="users-search-bar" ref="userDetailSearchBarRef">
      <el-input
        v-model="searchKeyword"
        class="search-input"
        :placeholder="t('userDetailList.searchPlaceholder')"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        v-model="accountStatusFilter"
        class="status-select"
        :placeholder="t('userDetailList.accountStatusLabel')"
        clearable
      >
        <el-option :value="''" :label="t('userDetailList.accountStatusAll')" />
        <el-option :value="'0'" :label="t('userDetailList.accountStatusEnabled')" />
        <el-option :value="'1'" :label="t('userDetailList.accountStatusDisabled')" />
      </el-select>
      <div class="selected-info" v-if="selectedUserDetails.length > 0">
        {{ t('userDetailList.selectedUsers', { count: selectedUserDetails.length }) }}
      </div>
      <div class="users-search-bar-pagination" v-if="totalPagesUserDetails > 1">
        <el-button
          class="page-btn"
          :disabled="currentPageUserDetails === 1"
          @click="currentPageUserDetails--"
        >
          {{ t('vmList.previousPage') }}
        </el-button>
        <span class="page-info">
          {{ t('vmList.pageInfo', { current: currentPageUserDetails, total: totalPagesUserDetails, count: filteredUserDetails.length }) }}
        </span>
        <el-button
          class="page-btn"
          :disabled="currentPageUserDetails === totalPagesUserDetails"
          @click="currentPageUserDetails++"
        >
          {{ t('vmList.nextPage') }}
        </el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="table-container" ref="userDetailTableContainer">
      <table class="users-table user-detail-table">
        <thead>
          <tr>
            <th class="col-checkbox">
              <input 
                type="checkbox" 
                :checked="isAllUserDetailsSelected"
                @change="toggleSelectAllUserDetails"
              />
            </th>
            <th class="col-username">{{ t('userDetailList.username') }}</th>

            <th class="col-user-group">{{ t('userDetailList.userGroup') }}</th>

            <th class="col-user-status">{{ t('userDetailList.accountStatus') }}</th>
            <th class="col-status">{{ t('userDetailList.loginStatus') }}</th>


            <th class="col-last-login">{{ t('userDetailList.loginTime') }}</th>
            <th class="col-login-ip">{{ t('userDetailList.loginIP') }}</th>

            <th class="col-client-type">{{ t('userDetailList.loginMode') }}</th>
            <th class="col-public-gateway">{{ t('userDetailList.publicConnection') }}</th>
            <th class="col-direct-connect">{{ t('userDetailList.directConnect') }}</th>
            <th class="col-audio-redirect">{{ t('userDetailList.audioRedirect') }}</th>
            <th class="col-usb-redirect">{{ t('userDetailList.usbRedirect') }}</th>
            <th class="col-disk-redirect">{{ t('userDetailList.diskRedirect') }}</th>
            <th class="col-printer-redirect">{{ t('userDetailList.printerRedirect') }}</th>
            <th class="col-clipboard-redirect">{{ t('userDetailList.clipboardRedirect') }}</th>
            <th class="col-copy-to-vm">{{ t('userDetailList.copyToVM') }}</th>
            <th class="col-copy-from-vm">{{ t('userDetailList.copyFromVM') }}</th>
            <th class="col-remark">{{ t('userDetailList.remark') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUserDetails" :key="user.username">
            <td>
              <input 
                type="checkbox" 
                :value="user.username"
                v-model="selectedUserDetails"
              />
            </td>
            <td>{{ user.username }}</td>
            <td>{{ user.userGroup }}</td>
            <td>{{ user.userStatus || t('form.enabled') }}</td>
            <td class="col-status">{{ getStatusIcon(user.status) }}</td>
            <td>{{ user.lastLogin }}</td>
            <td>{{ user.loginIp }}</td>
            <td>{{ user.clientType }}</td>
            <td>{{ user.publicGateway }}</td>
            <td>{{ user.directConnect ? t('form.yes') : t('form.no') }}</td>
            <td>{{ user.audioRedirect ? t('form.yes') : t('form.no') }}</td>
            <td>{{ user.usbRedirect ? t('form.yes') : t('form.no') }}</td>
            <td>{{ user.diskRedirect ? t('form.yes') : t('form.no') }}</td>
            <td>{{ user.printerRedirect ? t('form.yes') : t('form.no') }}</td>
            <td>{{ user.clipboardRedirect ? t('form.yes') : t('form.no') }}</td>
            <td>{{ user.copyToVm ? t('form.yes') : t('form.no') }}</td>
            <td>{{ user.copyFromVm ? t('form.yes') : t('form.no') }}</td>
            <td>
              <div class="remark-container">
                <span v-if="!expandedRemarks[user.username]" class="remark-content" @click="expandedRemarks[user.username] = true">
                  {{ user.remark.length > 20 ? user.remark.substring(0, 20) + '...' : user.remark }}
                  <span v-if="user.remark.length > 20" class="expand-btn">▼</span>
                </span>
                <span v-else class="remark-content expanded" @click="expandedRemarks[user.username] = false">
                  {{ user.remark }}
                  <span class="expand-btn">▲</span>
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'Users',
  components: { Search },
  setup() {
    const { t } = useI18n()
    // 响应式数据
    const selectedUsers = ref([])
    const selectedUserDetails = ref([])
    const currentPage = ref(1)
    const currentPageUserDetails = ref(1)
    const pageSize = ref(10)
    const windowHeight = ref(window.innerHeight)
    const loading = ref(false)
    const error = ref('')
    const containerRef = ref(null)
    const userDetailToolbarRef = ref(null)
    const userDetailSearchBarRef = ref(null)
    const userDetailTableContainer = ref(null)
    let resizeObserver = null
    let pendingPageSizeUpdate = false

    const schedulePageSizeUpdate = () => {
      if (pendingPageSizeUpdate) return
      pendingPageSizeUpdate = true
      nextTick(() => {
        requestAnimationFrame(() => {
          updatePageSize()
          pendingPageSizeUpdate = false
        })
      })
    }
    
    // 用户详细列表数据
    const userDetailList = ref([])

    // 搜索与筛选
    const searchKeyword = ref('')
    const accountStatusFilter = ref('')

    const filteredUserDetails = computed(() => {
      const kw = searchKeyword.value.trim().toLowerCase()
      const af = accountStatusFilter.value
      return userDetailList.value.filter(u => {
        const matchKw = !kw || (
          (u.username || '').toLowerCase().includes(kw) ||
          (u.userGroup || '').toLowerCase().includes(kw)
        )
        const matchStatus = af === '' || u.disabled === af
        return matchKw && matchStatus
      })
    })

    watch(searchKeyword, () => {
      selectedUserDetails.value = []
      currentPageUserDetails.value = 1
    })
    watch(accountStatusFilter, () => {
      selectedUserDetails.value = []
      currentPageUserDetails.value = 1
    })

    // 用户详情分页切片
    const totalPagesUserDetails = computed(() => {
      return Math.ceil(filteredUserDetails.value.length / pageSize.value)
    })

    const paginatedUserDetails = computed(() => {
      const start = (currentPageUserDetails.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredUserDetails.value.slice(start, end)
    })

    watch(userDetailList, () => {
      schedulePageSizeUpdate()
    })
    
    // 虚拟机组列表数据
    const vmGroups = ref([])
    
    // 根据窗口高度动态计算每页显示条数（真实 DOM 测量）
    const updatePageSize = () => {
      windowHeight.value = window.innerHeight
      const tableContainer = userDetailTableContainer.value
      if (!tableContainer) return

      const tableHeaderRow = tableContainer.querySelector('.users-table thead tr')
      if (!tableHeaderRow) return

      const allRows = tableContainer.querySelectorAll('.users-table tbody tr')
      let rowHeight = 48
      if (allRows.length >= 2) {
        rowHeight = allRows[1].offsetHeight
      } else if (allRows.length === 1) {
        rowHeight = allRows[0].offsetHeight
      }
      const tableHeaderHeight = tableHeaderRow.offsetHeight

      const tcRect = tableContainer.getBoundingClientRect()
      const theadTopRelative = tableHeaderRow.getBoundingClientRect().top - tcRect.top

      const availableHeight = tableContainer.clientHeight - theadTopRelative - tableHeaderHeight
      pageSize.value = Math.max(5, Math.floor((availableHeight - 6) / rowHeight))
    }
    
    // 监听窗口大小变化
    const handleResize = () => {
      schedulePageSizeUpdate()
    }
    
    // 排序配置
    const sortKey = ref('username')  // 当前排序列
    const sortOrder = ref('asc')  // 排序方向: 'asc' 升序, 'desc' 降序
    
    // 用户列表数据
    const userList = ref([])
    let pollingTimer = null
    
    // 获取虚拟机组列表
    const fetchVMGroups = async () => {
      try {
        // 调用API获取虚拟机组列表
        const response = await axios.get('/vmgroup/getAllVMGroups')
        const result = response.data
        
        if (result.code === 0 && result.data) {
          // 从响应数据中提取虚拟机组名称
          vmGroups.value = result.data.map(item => item.vm_group)
        } else {
          vmGroups.value = []
        }
      } catch (error) {
        console.error('获取虚拟机组列表失败:', error.message)
        vmGroups.value = []
      }
    }
    
    // 处理虚拟机组选择框显示/隐藏事件
    const handleVMGroupSelectVisibleChange = async (visible) => {
      if (visible && vmGroups.value.length === 0) {
        await fetchVMGroups()
      }
    }
    
    // 获取用户列表数据
    const fetchUserList = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          loading.value = true
        }
        error.value = ''
        
        // 调用真实API获取用户列表
        // console.log('获取用户组列表')
        const response = await axios.get('/usergroup/getUserGroups')
        const result = response.data
        
        // console.log('API响应:', result)
        
        if (result.code === 0 && result.data) {
          // 处理响应数据
          userList.value = result.data.map(item => ({
            userGroup: item.user_group,
            description: item.description || '',
            disabled: item.disabled,
            vmGroups: item.bind_vm_group ? item.bind_vm_group.join(', ') : ''
          }))
          // console.log('处理后的用户组列表:', userList.value)
        } else {
          userList.value = []
          // console.log('没有用户组数据')
        }
      } catch (error) {
        console.warn('❌ API调用异常:', error)
        error.value = error.message || t('message.networkError')
        userList.value = []
      } finally {
        if (isInitialLoad) {
          loading.value = false
        }
      }
    }

    // 启动轮询
    const startPolling = () => {
      fetchUserList(true)
      fetchUserDetailList()
      pollingTimer = setInterval(() => {
        fetchUserList(false)
        fetchUserDetailList()
      }, 3000)
    }

    // 获取用户详细列表数据
    const fetchUserDetailList = async () => {
      try {
        // 调用真实API获取用户详细列表
        const response = await axios.get('/users')
        const result = response.data
        
        if (result.code === 0 && result.data) {
          // 处理响应数据
          // console.log('后端返回的用户数据:', result.data);
          // 格式化时间函数
          const formatTime = (timeString) => {
            if (!timeString) return '';
            const date = new Date(timeString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month} ${hours}:${minutes}:${seconds}`;
          };
          
          userDetailList.value = result.data.map(item => ({
            username: item.username,
            userGroup: item.group,
            userStatus: item.disabled === '0' ? t('form.enabled') : t('form.disabled'),
            disabled: item.disabled,
            status: item.status,
            lastLogin: formatTime(item.last_login),
            loginIp: item.login_ip,
            clientType: item.client_type,
            publicGateway: item.public_gateway === '1' ? t('form.yes') : t('form.no'),
            directConnect: item.direct === '1',
            audioRedirect: item.audio_redirect === '1',
            usbRedirect: item.usb_redirect === '1',
            diskRedirect: item.drive_redirect === '1',
            printerRedirect: item.printer_redirect === '1',
            clipboardRedirect: item.clipboard_redirect === '1',
            copyToVm: item.client_to_server_clipboard === '1',
            copyFromVm: item.server_to_client_clipboard === '1',
            remark: item.remark || ''
          })).sort((a, b) => a.username.localeCompare(b.username))
        } else {
          userDetailList.value = []
        }
      } catch (error) {
        console.warn('❌ API调用异常:', error.message)
        userDetailList.value = []
      }
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
    const sortedAllUsers = computed(() => {
      return [...userList.value].sort((a, b) => {
        let aVal = a[sortKey.value]
        let bVal = b[sortKey.value]
        
        // 处理 null/undefined/空值
        if (aVal == null || aVal === '') aVal = ''
        if (bVal == null || bVal === '') bVal = ''
        
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
    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sortedAllUsers.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(userList.value.length / pageSize.value)
    })

    // 方法
    const toggleSelectAll = () => {
      if (selectedUsers.value.length === userList.value.length) {
        selectedUsers.value = []
      } else {
        selectedUsers.value = userList.value.map(user => user.userGroup)
      }
    }

    // 用户组列表是否全选
    const isAllUsersSelected = computed(() => {
      return userList.value.length > 0 && selectedUsers.value.length === userList.value.length
    })

    // 切换用户组全选
    const toggleSelectAllUsers = () => {
      if (isAllUsersSelected.value) {
        selectedUsers.value = []
      } else {
        selectedUsers.value = userList.value.map(user => user.userGroup)
      }
    }

    // 用户列表是否全选
    const isAllUserDetailsSelected = computed(() => {
      return filteredUserDetails.value.length > 0
        && filteredUserDetails.value.every(u => selectedUserDetails.value.includes(u.username))
    })

    const toggleSelectAllUserDetails = () => {
      if (isAllUserDetailsSelected.value) {
        selectedUserDetails.value = selectedUserDetails.value.filter(
          name => !filteredUserDetails.value.some(u => u.username === name)
        )
      } else {
        const filteredNames = filteredUserDetails.value.map(u => u.username)
        const existing = new Set(selectedUserDetails.value)
        filteredNames.forEach(n => existing.add(n))
        selectedUserDetails.value = Array.from(existing)
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
    const addUserDialogVisible = ref(false)
    const editUserDialogVisible = ref(false)
    const form = ref({
      username: '',
      password: '',
      email: ''
    })
    const userForm = ref({
      username: '',
      userPrefix: '',
      userSuffix: '',
      userCount: 1,
      password: '',
      remark: '',
      group: '',
      public_gateway: '0',
      direct: '0',
      audio_redirect: '0',
      usb_redirect: '0',
      drive_redirect: '0',
      printer_redirect: '0',
      clipboard_redirect: '0',
      client_to_server_clipboard: '0',
      server_to_client_clipboard: '0'
    })
    // 是/否 二选一选项（el-segmented 左右点击选择）
    const yesNoOptions = computed(() => [
      { label: t('form.yes'), value: '1' },
      { label: t('form.no'), value: '0' }
    ])
    const passwordForm = ref({
      username: '',
      password: ''
    })
    const userGroups = ref([])
    const expandedRemarks = ref({})
    const changePasswordDialogVisible = ref(false)

    const showAddDialog = async () => {
      resetForm()
      addDialogVisible.value = true
    }

    const showEditDialog = async () => {
      const selectedUserGroup = selectedUsers.value[0]
      try {
        // 调用API获取用户组详细信息
        const response = await axios.get('/usergroup/getUserGroups')
        const result = response.data
        
        if (result.code === 0 && result.data) {
          // 查找选中的用户组
          const userGroup = result.data.find(item => item.user_group === selectedUserGroup)
          
          if (userGroup) {
            form.value = {
              user_group: userGroup.user_group,
              description: userGroup.description || '',
              bind_vm_group: userGroup.bind_vm_group || []
            }
            
            // 确保虚拟机组数据已加载
            await fetchVMGroups()
            
            editDialogVisible.value = true
          } else {
            ElMessage.error(t('message.userGroupNotFound'))
          }
        } else {
          ElMessage.error(t('message.userGroupInfoFailed'))
        }
      } catch (error) {
        console.error('获取用户组详情失败:', error.message)
        ElMessage.error(t('message.userGroupInfoFailed'))
      }
    }

    // 显示添加用户对话框（批量添加）
    const showAddUserDialog = async () => {
      await fetchUserGroupsList()
      resetUserForm()
      addUserDialogVisible.value = true
    }

    // 显示编辑用户对话框
    const showEditUserDialog = async () => {
      if (selectedUserDetails.value.length !== 1) {
        ElMessage.warning(t('message.pleaseSelectUserToEdit'))
        return
      }
      
      const selectedUsername = selectedUserDetails.value[0]
      const user = userDetailList.value.find(u => u.username === selectedUsername)
      
      if (!user) {
        ElMessage.error(t('message.selectedUserNotFound'))
        return
      }
      
      await fetchUserGroupsList()
      
      // 填充用户数据到表单
      userForm.value = {
        username: user.username,
        password: '', // 密码不自动填充
        remark: user.remark || '',
        group: user.userGroup,
        public_gateway: user.publicGateway === t('form.yes') ? '1' : '0',
        direct: user.directConnect ? '1' : '0',
        audio_redirect: user.audioRedirect ? '1' : '0',
        usb_redirect: user.usbRedirect ? '1' : '0',
        drive_redirect: user.diskRedirect ? '1' : '0',
        printer_redirect: user.printerRedirect ? '1' : '0',
        clipboard_redirect: user.clipboardRedirect ? '1' : '0',
        client_to_server_clipboard: user.copyToVm ? '1' : '0',
        server_to_client_clipboard: user.copyFromVm ? '1' : '0',
        userPrefix: '',
        userSuffix: '',
        userCount: 1
      }
      
      editUserDialogVisible.value = true
    }

    // 显示修改密码对话框
    const showChangePasswordDialog = async () => {
      if (selectedUserDetails.value.length !== 1) {
        ElMessage.warning(t('message.pleaseSelectUserForPassword'))
        return
      }
      
      const selectedUsername = selectedUserDetails.value[0]
      const user = userDetailList.value.find(u => u.username === selectedUsername)
      
      if (!user) {
        ElMessage.error(t('message.selectedUserNotFound'))
        return
      }
      
      // 填充用户数据到密码表单
      passwordForm.value = {
        username: user.username,
        password: ''
      }
      
      changePasswordDialogVisible.value = true
    }

    const unlockUser = async () => {
      if (selectedUserDetails.value.length !== 1) {
        ElMessage.warning(t('message.pleaseSelectUserForPassword'))
        return
      }
      
      const selectedUsername = selectedUserDetails.value[0]
      
      try {
        const response = await axios.post('/users/unlockUser', {
          username: selectedUsername
        })
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('message.unlockSuccess', { username: selectedUsername }))
          selectedUserDetails.value = []
        } else {
          ElMessage.error(t('message.unlockFailed', { username: selectedUsername }))
        }
      } catch (error) {
        console.error('Unlock user failed:', error.message)
        ElMessage.error(t('message.unlockFailed', { username: selectedUsername }) + ': ' + error.message)
      }
    }

    const resetForm = () => {
      form.value = {
        user_group: '',
        description: '',
        bind_vm_group: []
      }
    }

    const resetUserForm = () => {
      userForm.value = {
        username: '',
        userPrefix: '',
        userSuffix: '',
        userCount: 1,
        password: '',
        remark: '',
        group: '',
        public_gateway: '0',
        direct: '0',
        audio_redirect: '0',
        usb_redirect: '0',
        drive_redirect: '0',
        printer_redirect: '0',
        clipboard_redirect: '0',
        client_to_server_clipboard: '0',
        server_to_client_clipboard: '0'
      }
    }

    // 重置密码表单
    const resetPasswordForm = () => {
      passwordForm.value = {
        username: '',
        password: ''
      }
    }

    // 修改密码
    const changePassword = async () => {
      try {
        // 验证必填项
        if (!passwordForm.value.username) {
          ElMessage.warning(t('message.pleaseEnterUsername'))
          return
        }
        if (!passwordForm.value.password) {
          ElMessage.warning(t('message.pleaseEnterPassword'))
          return
        }
        
        // 检查表单数据
        // console.log('发送的修改密码数据:', passwordForm.value)
        
        // 发送API请求
        const response = await axios.put('/users/password', {
          username: passwordForm.value.username,
          newPassword: passwordForm.value.password
        })
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('message.passwordChangeSuccess'))
          changePasswordDialogVisible.value = false
          selectedUserDetails.value = []
          resetPasswordForm()
        } else {
          ElMessage.error(result.message || t('message.passwordUpdateFailed'))
        }
      } catch (error) {
        console.error('修改密码失败:', error.message)
        ElMessage.error(t('message.passwordUpdateFailed') + ': ' + error.message)
      }
    }

    // 编辑用户
    const editUser = async () => {
      try {
        // 验证必填项
        if (!userForm.value.username) {
          ElMessage.warning(t('message.pleaseEnterUsername'))
          return
        }
        if (!userForm.value.group) {
          ElMessage.warning(t('message.pleaseSelectUserGroup'))
          return
        }
        
        // 检查表单数据
        // console.log('发送的编辑用户数据:', userForm.value)
        
        // 发送API请求
        const response = await axios.post('/users/updateUser', userForm.value)
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('message.userEditSuccess'))
          editUserDialogVisible.value = false
          selectedUserDetails.value = []
          resetUserForm()
          await fetchUserDetailList()
        } else {
          ElMessage.error(result.message || t('message.userEditFailed'))
        }
      } catch (error) {
        console.error('编辑用户失败:', error.message)
        ElMessage.error(t('message.userEditFailed') + ': ' + error.message)
      }
    }

    // 删除用户
    const deleteUser = async () => {
      if (selectedUserDetails.value.length === 0) {
        ElMessage.warning(t('message.pleaseSelectUsersToDelete'))
        return
      }
      
      try {
        await ElMessageBox.confirm(
          t('message.confirmDeleteUsers', { count: selectedUserDetails.value.length }),
          t('common.confirm'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'danger'
          }
        )
        
        // 遍历删除每个选中的用户
        for (const username of selectedUserDetails.value) {
          try {
            // 发送API请求
            const response = await axios.delete(`/users/${username}`)
            const result = response.data
            
            if (result.code !== 0) {
              ElMessage.error(t('message.userDeleteFailed', { error: result.message || t('message.unknownError') }))
            }
          } catch (error) {
            console.error(`删除用户 ${username} 失败:`, error.message)
            ElMessage.error(t('message.userDeleteFailed', { error: error.message }))
          }
        }
        
        // 删除完成后刷新列表
        await fetchUserDetailList()
        selectedUserDetails.value = []
        ElMessage.success(t('message.userDeleteSuccess'))
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除用户失败:', error.message)
          ElMessage.error(t('message.userDeleteFailed', { error: error.message }))
        }
      }
    }

    // 获取用户组列表
    const fetchUserGroupsList = async () => {
      try {
        const response = await axios.get('/usergroup/getUserGroups')
        const result = response.data
        
        if (result.code === 0 && result.data) {
          userGroups.value = result.data.map(item => item.user_group)
        } else {
          userGroups.value = []
        }
      } catch (error) {
        console.error('获取用户组列表失败:', error.message)
        userGroups.value = []
      }
    }

    // 批量添加用户
    const batchAddUsers = async () => {
      try {
        // 验证必填项
        if (!userForm.value.userPrefix.trim()) {
          ElMessage.warning(t('message.pleaseEnterUserPrefix'))
          return
        }
        if (!userForm.value.userSuffix.trim()) {
          ElMessage.warning(t('message.pleaseEnterUserSuffix'))
          return
        }
        if (!userForm.value.userCount || userForm.value.userCount < 1) {
          ElMessage.warning(t('message.pleaseEnterValidUserCount'))
          return
        }
        if (!userForm.value.password.trim()) {
          ElMessage.warning(t('message.pleaseEnterPassword'))
          return
        }
        if (!userForm.value.group) {
          ElMessage.warning(t('message.pleaseSelectUserGroup'))
          return
        }
        
        // 检查表单数据
        // console.log('发送的批量添加用户数据:', userForm.value)
        
        // 发送API请求
        const response = await axios.post('/users/batch', userForm.value)
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('message.batchCreateSuccess'))
          addUserDialogVisible.value = false
          resetUserForm()
          // 刷新用户列表
          await fetchUserDetailList()
        } else {
          ElMessage.error(result.message || t('message.batchCreateFailed'))
        }
      } catch (error) {
        console.error('批量添加用户失败:', error.message)
        ElMessage.error(t('message.batchCreateFailed') + ': ' + error.message)
      }
    }

    const addUserGroup = async () => {
      try {
        // 验证必填项
        if (!form.value.user_group.trim()) {
          ElMessage.warning(t('message.enterUserGroup'))
          return
        }
        if (form.value.user_group.length < 2 || form.value.user_group.length > 50) {
          ElMessage.warning(t('message.userGroupLength'))
          return
        }
        if (form.value.description && form.value.description.length > 200) {
          ElMessage.warning(t('message.descriptionLength'))
          return
        }
        
        // 检查表单数据
        // console.log('发送的表单数据:', form.value)
        
        // 发送API请求
        const response = await axios.post('/usergroup/addUserGroup', form.value)
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('message.addSuccess'))
          addDialogVisible.value = false
          await fetchUserList()
          resetForm()
        } else {
          ElMessage.error(result.message || t('message.addFailed'))
        }
      } catch (error) {
        console.error('添加用户组失败:', error.message)
        if (error.response && error.response.status === 400) {
          ElMessage.error(t('message.userGroupAlreadyExists'))
        } else {
          ElMessage.error(t('message.addFailed') + ': ' + error.message)
        }
      }
    }

    const editUserGroup = async () => {
      try {
        // 验证必填项
        if (!form.value.user_group.trim()) {
          ElMessage.warning(t('message.enterUserGroup'))
          return
        }
        if (form.value.description && form.value.description.length > 200) {
          ElMessage.warning(t('message.descriptionLength'))
          return
        }
        
        // 检查表单数据
        // console.log('发送的表单数据:', form.value)
        
        // 发送API请求
        const response = await axios.post('/usergroup/updateUserGroup', form.value)
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('message.editSuccess'))
          editDialogVisible.value = false
          selectedUsers.value = []
          await fetchUserList()
          resetForm()
        } else {
          ElMessage.error(result.message || t('message.editFailed'))
        }
      } catch (error) {
        console.error('编辑用户组失败:', error.message)
        ElMessage.error(t('message.editFailed') + ': ' + error.message)
      }
    }

    const deleteUsers = async () => {
      try {
        await ElMessageBox.confirm(
          t('dialog.confirmDeleteUserGroups', { count: selectedUsers.value.length }),
          t('common.confirm'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'danger'
          }
        )
        
        // 遍历删除每个选中的用户组
        for (const userGroup of selectedUsers.value) {
          try {
            // 发送API请求
            const response = await axios.post('/usergroup/deleteUserGroup', { user_group: userGroup })
            const result = response.data
            
            if (result.code !== 0) {
              ElMessage.error(t('message.userGroupDeleteFailed', { error: result.message || t('message.unknownError') }))
            }
          } catch (error) {
            console.error(`删除用户组 ${userGroup} 失败:`, error.message)
            ElMessage.error(t('message.userGroupDeleteFailed', { error: error.message }))
          }
        }
        
        // 删除完成后刷新列表
        await fetchUserList()
        selectedUsers.value = []
        ElMessage.success(t('message.userGroupDeleteSuccess'))
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除用户组失败:', error.message)
          ElMessage.error(t('message.userGroupDeleteFailed', { error: error.message }))
        }
      }
    }

    // 切换用户组状态
    const toggleUserStatus = async () => {
      try {
        // 遍历切换每个选中的用户组状态
        for (const userGroup of selectedUsers.value) {
          try {
            // 查找用户组，获取当前状态
            const user = userList.value.find(u => u.userGroup === userGroup)
            if (!user) {
              console.warn(`未找到用户组 ${userGroup}，跳过`)
              continue
            }
            
            // 计算目标状态：0 启用，1 禁用，前端不计算，后端计算取反
            const targetDisabled = user.disabled
            
            // 直接传递用户组和 disabled 值给后端
            const response = await axios.post('/usergroup/toggleUserGroupStatus', {
              user_group: userGroup,
              disabled: targetDisabled
            })
            
            const result = response.data
            
            if (result.code === 0) {
              ElMessage.success(t('message.userGroupStatusChanged', { userGroup }))
              // 立即更新前端状态
              user.disabled = targetDisabled
            } else {
              ElMessage.error(t('message.userGroupStatusChangeFailed', { userGroup, error: result.message || t('message.unknownError') }))
            }
          } catch (error) {
            console.error(`切换用户组 ${userGroup} 状态失败:`, error.message)
            ElMessage.error(t('message.userGroupStatusChangeFailed', { userGroup, error: error.message }))
          }
        }
        
        // 操作完成后刷新列表
        await fetchUserList()
        selectedUsers.value = []
      } catch (error) {
        console.error('切换用户组状态失败:', error.message)
        ElMessage.error(t('message.userGroupStatusChangeFailed', { userGroup: selectedUsers.value.join(', '), error: error.message }))
      }
    }

    // 获取切换状态按钮文本
    const getToggleButtonText = () => {
      if (selectedUsers.value.length === 0) {
        return t('toolbar.disable')
      }
      // 检查选中的用户组是否都已禁用
      const allDisabled = selectedUsers.value.every(userGroup => {
        const user = userList.value.find(u => u.userGroup === userGroup)
        return user && user.disabled === '1'
      })
      return allDisabled ? t('toolbar.enable') : t('toolbar.disable')
    }

    // 切换用户状态
    const toggleUserDetailStatus = async () => {
      try {
        // 遍历切换每个选中的用户状态
        for (const username of selectedUserDetails.value) {
          try {
            // 查找用户，获取当前状态
            const user = userDetailList.value.find(u => u.username === username)
            if (!user) {
              console.warn(`未找到用户 ${username}，跳过`)
              continue
            }

            // 计算目标状态：0 禁用，1 启用
            // 当用户当前是启用状态(disabled: "0")，点击按钮应禁用，传递 "0"
            // 当用户当前是禁用状态(disabled: "1")，点击按钮应启用，传递 "1"
            // 发送API请求
            const response = await axios.post('/users/disableUser', {
              username: username,
              disabled: user.disabled
            })
            
            const result = response.data
            
            if (result.code === 0) {
              ElMessage.success(t('message.userStatusChanged', { username }))
            } else {
              ElMessage.error(t('message.userStatusChangeFailed', { username, error: result.message || t('message.unknownError') }))
            }
          } catch (error) {
            console.error(`切换用户 ${username} 状态失败:`, error.message)
            ElMessage.error(t('message.userStatusChangeFailed', { username, error: error.message }))
          }
        }
        
        // 操作完成后刷新列表
        await fetchUserDetailList()
        selectedUserDetails.value = []
      } catch (error) {
        console.error('切换用户状态失败:', error.message)
        ElMessage.error(t('message.userStatusChangeFailed', { username: selectedUserDetails.value.join(', '), error: error.message }))
      }
    }

    // 获取用户切换状态按钮文本
    const getToggleUserDetailButtonText = () => {
      if (selectedUserDetails.value.length === 0) {
        return t('toolbar.disable')
      }
      // 检查选中的用户是否都已禁用
      const allDisabled = selectedUserDetails.value.every(username => {
        const user = userDetailList.value.find(u => u.username === username)
        return user && user.userStatus === t('form.disabled')
      })
      return allDisabled ? t('toolbar.enable') : t('toolbar.disable')
    }

    // 获取状态图标
    const getStatusIcon = (status) => {
      switch (status) {
        case 'online':
          return '🟢'
        case 'offline':
          return '🔘'
        case 'locked':
          return '🔒'
        default:
          return status
      }
    }

    // 处理粘贴板重定向变更
    const handleClipboardRedirectChange = (value) => {
      if (value === '0') {
        // 当粘贴板重定向为否时，自动设置其他两个粘贴板选项为否
        userForm.value.client_to_server_clipboard = '0'
        userForm.value.server_to_client_clipboard = '0'
      }
    }

    onMounted(() => {
      startPolling()
      nextTick(() => {
        if (userDetailTableContainer.value && 'ResizeObserver' in window) {
          resizeObserver = new ResizeObserver(() => schedulePageSizeUpdate())
          resizeObserver.observe(userDetailTableContainer.value)
        }
        updatePageSize()
      })
      window.addEventListener('resize', handleResize)
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })

    onBeforeUnmount(() => {
      stopPolling()
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
    })

    return {
      Search,
      selectedUsers,
      selectedUserDetails,
      currentPage,
      currentPageUserDetails,
      pageSize,
      windowHeight,
      loading,
      error,
      containerRef,
      userDetailToolbarRef,
      userDetailSearchBarRef,
      userDetailTableContainer,
      userList,
      userDetailList,
      filteredUserDetails,
      paginatedUserDetails,
      totalPagesUserDetails,
      vmGroups,
      userGroups,
      expandedRemarks,
      searchKeyword,
      accountStatusFilter,
      paginatedUsers,
      totalPages,
      toggleSelectAll,
      isAllUsersSelected,
      toggleSelectAllUsers,
      isAllUserDetailsSelected,
      toggleSelectAllUserDetails,
      handleSort,
      getSortIndicator,
      updatePageSize,
      handleResize,
      showAddDialog,
      showEditDialog,
      showAddUserDialog,
      showEditUserDialog,
      showChangePasswordDialog,
      unlockUser,
      addUserGroup,
      editUserGroup,
      deleteUsers,
      deleteUser,
      toggleUserStatus,
      toggleUserDetailStatus,
      getToggleButtonText,
      getToggleUserDetailButtonText,
      handleClipboardRedirectChange,
      getStatusIcon,
      changePassword,
      addDialogVisible,
      editDialogVisible,
      addUserDialogVisible,
      editUserDialogVisible,
      changePasswordDialogVisible,
      form,
      userForm,
      yesNoOptions,
      passwordForm,
      resetForm,
      resetUserForm,
      resetPasswordForm,
      handleVMGroupSelectVisibleChange,
      batchAddUsers,
      editUser,
      t
    }
  }
}
</script>

<style scoped>
.users-container {
  background: #f8f7fc;
  padding: 16px 20px 20px 20px !important;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  --fs-base: 14px;
  --fs-header: 15px;
  --fs-card-title: 20px;
  --fs-toolbar: 15px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 16px;
  background: #fcfcfd;
  border: 1px solid rgba(92, 107, 192, 0.25);
  border-radius: 4px;
  align-items: center;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  height: 46px;
}

.toolbar-label {
  font-weight: 600;
  color: #909399;
  font-size: 17px;
  white-space: nowrap;
}

.table-title {
  font-size: var(--fs-card-title);
  font-weight: 600;
  color: #5c6bc0;
  margin: 0 0 8px 0;
  padding: 0;
  line-height: 1.2;
}

.selected-info {
  margin-bottom: 12px;
  padding: 8px 14px;
  background: rgba(92, 107, 192, 0.08);
  border: 1px solid rgba(92, 107, 192, 0.2);
  border-radius: 4px;
  color: #5c6bc0;
  font-size: var(--fs-base);
}

.users-search-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: clamp(8px, 0.8vw, 16px);
  margin-bottom: 12px;
}

.users-search-bar .search-input {
  width: clamp(160px, 18vw, 240px);
  flex-shrink: 0;
  font-size: var(--fs-header);
}

.users-search-bar .search-input :deep(.el-input__wrapper) {
  height: clamp(32px, 2.6vw, 40px);
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid rgba(92, 107, 192, 0.25);
  box-shadow: none;
  transition: all 0.2s;
}

.users-search-bar .search-input :deep(.el-input__wrapper:hover),
.users-search-bar .search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #5c6bc0;
  box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.15);
}

.users-search-bar .status-select {
  width: clamp(100px, 10vw, 150px);
  flex-shrink: 0;
  font-size: var(--fs-header);
}

.users-search-bar :deep(.el-select .el-select__wrapper) {
  height: clamp(32px, 2.6vw, 40px);
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid rgba(92, 107, 192, 0.25);
  box-shadow: none;
  transition: all 0.2s;
  min-height: unset;
}

.users-search-bar :deep(.el-select .el-select__wrapper:hover),
.users-search-bar :deep(.el-select .el-select__wrapper.is-focused) {
  border-color: #5c6bc0;
  box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.15);
}

.users-search-bar :deep(.el-select__placeholder),
.users-search-bar :deep(.el-select__selected-item) {
  font-size: var(--fs-header);
  color: #303133;
  line-height: 30px;
}

.users-search-bar :deep(.el-select__placeholder) {
  color: #b0b3b8;
}

.users-search-bar :deep(.el-input__inner) {
  font-size: var(--fs-header);
  color: #303133;
}

.users-search-bar :deep(.el-input__inner::placeholder) {
  color: #b0b3b8;
}

.users-search-bar .selected-info {
  margin-bottom: 0;
  height: clamp(32px, 2.6vw, 40px);
  line-height: clamp(32px, 2.6vw, 40px);
  padding: 0 clamp(10px, 0.8vw, 14px);
  box-sizing: border-box;
  white-space: nowrap;
}

.table-container {
  overflow-x: scroll;
  overflow-y: visible;
  margin-bottom: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  scrollbar-width: auto;
  scrollbar-color: rgba(92, 107, 192, 0.6) rgba(92, 107, 192, 0.12);
  padding-bottom: 2px;
}

.table-container:last-child {
  flex: 1;
  min-height: 0;
  margin-bottom: 0;
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

.users-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgba(92, 107, 192, 0.25);
  border-radius: 4px;
  background: #fcfcfd;
  font-size: var(--fs-base);
}

.users-table.user-detail-table {
  width: 100%;
}

.users-table.user-detail-table .col-username {
  min-width: 80px;
}

.users-table .col-checkbox,
.users-table tbody td:first-child {
  min-width: 44px !important;
  padding-left: clamp(2px, 0.2vw, 5px) !important;
  padding-right: clamp(2px, 0.2vw, 5px) !important;
}

.users-table.user-detail-table .col-user-group {
  min-width: 80px;
}

.users-table.user-detail-table .col-user-status {
  min-width: 70px;
}

.users-table.user-detail-table th.col-status,
.users-table.user-detail-table td.col-status {
  min-width: 60px;
}

.users-table.user-detail-table .col-last-login {
  min-width: 110px;
}

.users-table.user-detail-table .col-login-ip {
  min-width: 100px;
}

.users-table.user-detail-table .col-client-type {
  min-width: 70px;
}

.users-table.user-detail-table .col-public-gateway {
  min-width: 70px;
}

.users-table.user-detail-table .col-direct-connect {
  min-width: 60px;
}

/* 重定向/粘贴方向列（是/否短值列），参照 VMList 各列保持舒适宽度 */
.users-table.user-detail-table th:nth-child(n+11):nth-child(-n+17),
.users-table.user-detail-table td:nth-child(n+11):nth-child(-n+17) {
  min-width: 70px;
}

.users-table th,
.users-table td {
  height: 48px;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: clamp(6px, 0.6vw, 12px);
  padding-right: clamp(6px, 0.6vw, 12px);
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid rgba(92, 107, 192, 0.15);
  border-bottom: 1px solid rgba(92, 107, 192, 0.15);
  box-sizing: border-box;
}

.users-table th:last-child,
.users-table td:last-child {
  border-right: none;
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.users-table th {
  background-color: rgba(92, 107, 192, 0.06);
  font-weight: 600;
  color: #909399;
  border-bottom: 1px solid rgba(92, 107, 192, 0.25);
  font-size: 15px;
  white-space: nowrap;
}

.users-table td {
  font-size: 14px;
  white-space: nowrap;
}

.users-table tbody tr:hover {
  background-color: rgba(92, 107, 192, 0.05);
}

.users-table input[type="checkbox"] {
  accent-color: #5c6bc0;
  width: clamp(14px, 1vw, 18px);
  height: clamp(14px, 1vw, 18px);
  cursor: pointer;
}

.col-checkbox {
  min-width: 60px;
  text-align: center;
}

.col-name {
  min-width: 150px;
}

.col-email {
  min-width: 250px;
}

.users-table th.col-status,
.users-table td.col-status {
  min-width: 100px;
  text-align: center;
}

.col-vm-group {
  min-width: 200px;
}

.col-description {
  min-width: 300px;
}

/* 用户列表列宽 */
.col-username {
  min-width: 100px;
}

.col-password {
  min-width: 100px;
}

.col-user-group {
  min-width: 100px;
}

.col-phone {
  min-width: 120px;
}

.col-remark {
  min-width: 100px;
}

.remark-container {
  position: relative;
  width: 100%;
}

.remark-content {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.remark-content.expanded {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.expand-btn {
  color: #5c6bc0;
  margin-left: 5px;
  font-size: var(--fs-toolbar);
}

.expand-btn:hover {
  text-decoration: underline;
}

.col-user-status {
  min-width: 80px;
  text-align: center;
}

.col-fail-count {
  min-width: 100px;
}

.col-unlock-time {
  min-width: 120px;
}

.col-last-login {
  min-width: 150px;
}

.col-login-ip {
  min-width: 120px;
}

.col-is-public {
  min-width: 100px;
}

.col-client-type {
  min-width: 100px;
}

.col-public-gateway {
  min-width: 100px;
}

.col-direct-connect,
.col-audio-redirect,
.col-usb-redirect,
.col-disk-redirect,
.col-printer-redirect,
.col-clipboard-redirect,
.col-copy-to-vm,
.col-copy-from-vm {
  min-width: 80px;
  text-align: center;
}

.users-container :deep(.toolbar .el-button) {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  line-height: 32px !important;
  font-size: 15px !important;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
}

.users-container :deep(.toolbar .el-button.btn.not-operable) {
  cursor: not-allowed;
  pointer-events: auto;
}

.users-container :deep(.toolbar .el-button.btn-info),
.users-container :deep(.toolbar .el-button.btn-primary) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.users-container :deep(.toolbar .el-button.btn-info:hover),
.users-container :deep(.toolbar .el-button.btn-primary:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.users-container :deep(.toolbar .el-button.btn-info:active),
.users-container :deep(.toolbar .el-button.btn-primary:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.users-container :deep(.toolbar .el-button.btn-success) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.users-container :deep(.toolbar .el-button.btn-success:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.users-container :deep(.toolbar .el-button.btn-success:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.users-container :deep(.toolbar .el-button.btn-danger) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.users-container :deep(.toolbar .el-button.btn-danger:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.users-container :deep(.toolbar .el-button.btn-danger:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.users-container :deep(.toolbar .el-button.btn-warning) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.users-container :deep(.toolbar .el-button.btn-warning:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.users-container :deep(.toolbar .el-button.btn-warning:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .users-container {
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
}

@media (max-width: 480px) {
  .users-container {
    padding: 6px;
    --fs-base: 12px;
    --fs-header: 13px;
    --fs-card-title: 15px;
    --fs-toolbar: 11px;
  }

  .toolbar {
    gap: 6px;
    padding: 8px;
  }
}

.users-search-bar .users-search-bar-pagination {
  display: flex;
  align-items: center;
  gap: clamp(6px, 0.6vw, 12px);
  margin-left: auto;
  font-size: var(--fs-header);
}

.users-search-bar-pagination .page-btn {
  padding: clamp(4px, 0.4vw, 8px) clamp(10px, 0.9vw, 16px);
  height: clamp(32px, 2.6vw, 40px);
  border-radius: 4px;
  font-size: var(--fs-header);
}

.users-container .page-btn {
  padding: clamp(6px, 0.5vw, 10px) clamp(12px, 1vw, 20px);
  border: 1px solid rgba(92, 107, 192, 0.4);
  background: rgba(92, 107, 192, 0.12);
  color: #5c6bc0;
  transition: all 0.2s;
  font-size: var(--fs-base);
}

.users-container .page-btn:hover:not(:disabled) {
  background: #5c6bc0;
  color: #fff;
  border-color: #5c6bc0;
}

.users-container .page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.users-container .page-info {
  color: #606266;
}
</style>

<style>
.users-dialog {
  --d-fs-base: 15px;
  --d-fs-header: 17px;
}

.users-dialog .el-dialog__title {
  font-size: 17px;
  color: #000;
}

.users-dialog .el-dialog__body {
  font-size: var(--d-fs-base);
}

.users-dialog .el-form-item__label {
  font-size: var(--d-fs-base);
  position: relative;
  padding-left: 12px;
  width: auto !important;
  white-space: nowrap;
  text-align: left;
}

.users-dialog .el-form-item.is-required .el-form-item__label::before {
  position: absolute;
  left: 0;
}

.users-dialog .el-input__inner,
.users-dialog .el-textarea__inner {
  font-size: var(--d-fs-base);
}

.users-dialog .el-input__inner::placeholder,
.users-dialog .el-textarea__inner::placeholder {
  font-size: var(--d-fs-base);
}

.users-dialog .el-select__selected-item,
.users-dialog .el-select__placeholder {
  font-size: var(--d-fs-base);
}

.users-dialog .el-select__input {
  font-size: var(--d-fs-base);
}

.users-dialog .dialog-footer .el-button {
  font-size: var(--d-fs-base);
}

.users-dialog .el-form-item__error {
  font-size: clamp(12px, 0.85vw, 14px);
}

.users-dialog .el-segmented {
  --el-segmented-item-selected-bg-color: #5c6bc0;
  --el-segmented-item-selected-color: #fff;
  --el-segmented-item-hover-bg-color: rgba(92, 107, 192, 0.15);
  font-size: var(--d-fs-base);
}

.users-dialog .el-segmented .el-segmented__item {
  font-size: var(--d-fs-base);
  padding: 0 26px;
}

.users-dialog .el-segmented .el-segmented__item:not(.is-selected):hover {
  color: #5c6bc0;
}
</style>