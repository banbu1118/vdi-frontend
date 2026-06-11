<template>
  <div class="users-container">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.userGroupOperation') }}</span>
        <button class="btn btn-info" @click="showAddDialog">{{ t('toolbar.add') }}</button>
        <button class="btn btn-primary" @click="showEditDialog" :disabled="selectedUsers.length !== 1">{{ t('toolbar.edit') }}</button>
        <button class="btn btn-danger" @click="deleteUsers" :disabled="selectedUsers.length === 0">{{ t('toolbar.delete') }}</button>
        <button class="btn btn-warning" @click="toggleUserStatus" :disabled="selectedUsers.length === 0">{{ getToggleButtonText() }}</button>
      </div>
    </div>

    <!-- 添加用户组对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="t('dialog.addUserGroup')"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="120px">
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
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="120px">
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
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="userForm" label-width="150px">
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
          <el-select v-model="userForm.public_gateway" :placeholder="t('form.publicGatewayPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.direct')">
          <el-select v-model="userForm.direct" :placeholder="t('form.directPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.audioRedirect')">
          <el-select v-model="userForm.audio_redirect" :placeholder="t('form.audioRedirectPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.usbRedirect')">
          <el-select v-model="userForm.usb_redirect" :placeholder="t('form.usbRedirectPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.driveRedirect')">
          <el-select v-model="userForm.drive_redirect" :placeholder="t('form.driveRedirectPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.printerRedirect')">
          <el-select v-model="userForm.printer_redirect" :placeholder="t('form.printerRedirectPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.clipboardRedirect')">
          <el-select v-model="userForm.clipboard_redirect" :placeholder="t('form.clipboardRedirectPlaceholder')" @change="handleClipboardRedirectChange">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.clientToServerClipboard')" v-if="userForm.clipboard_redirect === '1'">
          <el-select v-model="userForm.client_to_server_clipboard" :placeholder="t('form.clientToServerClipboardPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.serverToClientClipboard')" v-if="userForm.clipboard_redirect === '1'">
          <el-select v-model="userForm.server_to_client_clipboard" :placeholder="t('form.serverToClientClipboardPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
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
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="userForm" label-width="150px">
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
          <el-select v-model="userForm.public_gateway" :placeholder="t('form.publicGatewayPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.direct')">
          <el-select v-model="userForm.direct" :placeholder="t('form.directPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.audioRedirect')">
          <el-select v-model="userForm.audio_redirect" :placeholder="t('form.audioRedirectPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.usbRedirect')">
          <el-select v-model="userForm.usb_redirect" :placeholder="t('form.usbRedirectPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.driveRedirect')">
          <el-select v-model="userForm.drive_redirect" :placeholder="t('form.driveRedirectPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.printerRedirect')">
          <el-select v-model="userForm.printer_redirect" :placeholder="t('form.printerRedirectPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.clipboardRedirect')">
          <el-select v-model="userForm.clipboard_redirect" :placeholder="t('form.clipboardRedirectPlaceholder')" @change="handleClipboardRedirectChange">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.clientToServerClipboard')" v-if="userForm.clipboard_redirect === '1'">
          <el-select v-model="userForm.client_to_server_clipboard" :placeholder="t('form.clientToServerClipboardPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('form.serverToClientClipboard')" v-if="userForm.clipboard_redirect === '1'">
          <el-select v-model="userForm.server_to_client_clipboard" :placeholder="t('form.serverToClientClipboardPlaceholder')">
            <el-option :label="t('form.yes')" :value="'1'" />
            <el-option :label="t('form.no')" :value="'0'" />
          </el-select>
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
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="passwordForm" label-width="120px">
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

    <!-- 用户列表标题 -->
    <div class="table-title">
      {{ t('userList.title') }}
    </div>

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
            <td>{{ user.vmGroups || '-' }}</td>
            <td>{{ user.disabled === '0' ? t('form.enabled') : t('form.disabled') }}</td>
            <td>{{ user.description || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 用户操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <span class="toolbar-label">{{ t('toolbar.userOperation') }}</span>
        <button class="btn btn-info" @click="showAddUserDialog">{{ t('toolbar.add') }}</button>
        <button class="btn btn-primary" @click="showEditUserDialog" :disabled="selectedUserDetails.length !== 1">{{ t('toolbar.edit') }}</button>
        <button class="btn btn-danger" @click="deleteUser" :disabled="selectedUserDetails.length === 0">{{ t('toolbar.delete') }}</button>
        <button class="btn btn-warning" @click="toggleUserDetailStatus" :disabled="selectedUserDetails.length === 0">{{ getToggleUserDetailButtonText() }}</button>
        <button class="btn btn-info" @click="showChangePasswordDialog" :disabled="selectedUserDetails.length !== 1">{{ t('toolbar.updatePassword') }}</button>
        <button class="btn btn-success" @click="unlockUser" :disabled="selectedUserDetails.length !== 1">{{ t('toolbar.unlockUser') }}</button>
      </div>
    </div>

    <!-- 用户列表标题 -->
    <div class="table-title">
      {{ t('userDetailList.title') }}
    </div>

    <!-- 用户列表 -->
    <div class="table-container">
      <table class="users-table">
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
          <tr v-for="user in userDetailList" :key="user.username">
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'

export default {
  name: 'Users',
  setup() {
    const { t } = useI18n()
    // 响应式数据
    const selectedUsers = ref([])
    const selectedUserDetails = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const windowHeight = ref(window.innerHeight)
    const loading = ref(false)
    const error = ref('')
    
    // 用户详细列表数据
    const userDetailList = ref([])
    
    // 虚拟机组列表数据
    const vmGroups = ref([])
    
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
            vmGroups: item.bind_vm_group ? item.bind_vm_group.join(', ') : '-'
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
            if (!timeString) return '-';
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
            loginIp: item.login_ip || '-',
            clientType: item.client_type || '-',
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
      return userDetailList.value.length > 0 && selectedUserDetails.value.length === userDetailList.value.length
    })

    // 切换用户全选
    const toggleSelectAllUserDetails = () => {
      if (isAllUserDetailsSelected.value) {
        selectedUserDetails.value = []
      } else {
        selectedUserDetails.value = userDetailList.value.map(user => user.username)
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
          resetUserForm()
          // 刷新用户列表
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
      selectedUsers,
      selectedUserDetails,
      currentPage,
      pageSize,
      windowHeight,
      loading,
      error,
      userList,
      userDetailList,
      vmGroups,
      userGroups,
      expandedRemarks,
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

.users-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.users-table th,
.users-table td {
  padding: 10px 15px;
  text-align: left;
  border: 1px solid #ddd;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.users-table tr:hover {
  background-color: #f5f5f5;
}

.col-checkbox {
  width: 60px;
  text-align: center;
}

.col-name {
  width: 150px;
}

.col-email {
  width: 250px;
}

.users-table th.col-status,
.users-table td.col-status {
  width: 100px;
  text-align: center;
}

.col-vm-group {
  width: 200px;
}

.col-description {
  width: 300px;
}

/* 用户列表列宽 */
.col-username {
  width: 100px;
}

.col-password {
  width: 100px;
}

.col-user-group {
  width: 100px;
}

.col-email {
  width: 150px;
}

.col-phone {
  width: 120px;
}

.col-remark {
  width: 40px;
  min-width: 40px;
  max-width: 40px;
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
  color: #007bff;
  margin-left: 5px;
  font-size: 12px;
}

.expand-btn:hover {
  text-decoration: underline;
}

.col-user-status {
  width: 80px;
  text-align: center;
}

.col-fail-count {
  width: 100px;
}

.col-unlock-time {
  width: 120px;
}

.col-last-login {
  width: 150px;
}

.col-login-ip {
  width: 120px;
}

.col-is-public {
  width: 100px;
}

.col-client-type {
  width: 100px;
}

.col-public-gateway {
  width: 100px;
}

.col-direct-connect,
.col-audio-redirect,
.col-usb-redirect,
.col-disk-redirect,
.col-printer-redirect,
.col-clipboard-redirect,
.col-copy-to-vm,
.col-copy-from-vm {
  width: 80px;
  text-align: center;
}

/* 按钮样式 */
.btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>