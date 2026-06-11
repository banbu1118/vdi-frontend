<template>
  <div class="user-home-container">
    <div class="vm-list-card">
      <h2 class="card-title">{{ t('userHome.title') }}</h2>
      
      <div class="vm-items">
        <div class="vm-item" v-for="vm in vmList" :key="vm.vmid">
          <div class="vm-header">
            <div class="vm-info">
              <span class="vm-name">{{ vm.vm_name }}</span>
            </div>
            <span :class="['vm-status', vm.status]">{{ vm.status === 'running' ? t('userHome.running') : t('userHome.stopped') }}</span>
          </div>
          <div class="vm-actions">
            <button class="action-btn" @click="handlePowerOn(vm)">{{ t('userHome.powerOn') }}</button>
            <button class="action-btn" @click="handlePowerOff(vm)">{{ t('userHome.powerOff') }}</button>
            <button class="action-btn" @click="handleReboot(vm)">{{ t('userHome.reboot') }}</button>
            <button class="action-btn" v-if="vm.hasRestore" @click="handleRestore(vm)">{{ t('userHome.restore') }}</button>
            <button class="action-btn" @click="handleConnect(vm)">{{ t('userHome.connect') }}</button>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="footer-left">
          <button class="footer-btn return-btn" @click="logout">{{ t('userHome.return') }}</button>
          <button class="footer-btn" @click="showChangePasswordDialog = true">{{ t('userHome.changePassword') }}</button>
        </div>
        <div class="footer-right">
          <button class="footer-btn refresh-btn" @click="fetchVMList" :disabled="isLoading">
            <span v-if="isLoading">{{ t('userHome.refreshLoading') }}</span>
            <span v-else>{{ t('userHome.refresh') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog
      :title="t('userHome.changePasswordTitle')"
      v-model="showChangePasswordDialog"
      width="500px"
      :close-on-click-modal="false"
      top="50%"
    >
      <div class="password-form">
        <el-form :model="passwordForm" label-width="160px">
          <el-form-item :label="t('userHome.newPassword')">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              :placeholder="t('userHome.passwordPlaceholder')"
              show-password
            />
          </el-form-item>
          <el-form-item :label="t('userHome.confirmPassword')">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              :placeholder="t('userHome.confirmPasswordPlaceholder')"
              show-password
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePasswordDialog = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitChangePassword">{{ t('common.ok') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

export default {
  name: 'UserHome',
  components: {
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton
  },
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const username = ref('')
    const vmList = ref([])
    const showChangePasswordDialog = ref(false)
    const passwordForm = ref({
      newPassword: '',
      confirmPassword: ''
    })
    const isLoading = ref(false)

    const timeoutPromise = (ms, errorMessage) => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(errorMessage))
        }, ms)
      })
    }

    const fetchWithTimeout = async (axiosPromise, errorMessage, timeout = 120000) => {
      return Promise.race([
        axiosPromise,
        timeoutPromise(timeout, errorMessage)
      ])
    }

    const fetchVMList = async () => {
        isLoading.value = true
        try {
            const currentUsername = localStorage.getItem('username') || 'user01'
            const response = await axios.get(`/users/${currentUsername}/vms`)
            const result = response.data
            
            if (result.code === 0 && result.data) {
                const vmsWithSnapshot = await Promise.all(
                    result.data.map(async (vm) => {
                        try {
                            const snapshotResponse = await axios.get(`/vm/${vm.vmid}/hasmilestone`)
                            const snapshotResult = snapshotResponse.data
                            return {
                                ...vm,
                                hasRestore: snapshotResult.code === 0
                            }
                        } catch (error) {
                            console.error(`查询虚拟机 ${vm.vmid} 快照失败:`, error)
                            return {
                                ...vm,
                                hasRestore: false
                            }
                        }
                    })
                )
                
                const vmsWithStatus = await Promise.all(
                    vmsWithSnapshot.map(async (vm) => {
                        try {
                            const statusResponse = await axios.get(`/vm/${vm.vmid}/currentstatus`)
                            const statusResult = statusResponse.data
                            return {
                                ...vm,
                                status: statusResult.code === 0 ? statusResult.data.status : 'stopped'
                            }
                        } catch (error) {
                            console.error(`获取虚拟机 ${vm.vmid} 状态失败:`, error)
                            return {
                                ...vm,
                                status: 'stopped'
                            }
                        }
                    })
                )
                
                vmList.value = vmsWithStatus
            } else {
                ElMessage.error(result.message || t('userHome.networkError'))
            }
        } catch (error) {
            console.error('获取虚拟机列表失败:', error)
            ElMessage.error(t('userHome.networkError'))
            vmList.value = [
                { vmid: 143, vm_name: 'Debian13-gnome-test', status: 'stopped', hasRestore: true },
                { vmid: 149, vm_name: 'debian13.2-lxqt', status: 'stopped', hasRestore: true },
                { vmid: 170, vm_name: 'win1001', status: 'running', hasRestore: true }
            ]
        } finally {
            isLoading.value = false
        }
    }

    let heartbeatTimer = null

    const sendHeartbeat = async () => {
      try {
        const currentUsername = localStorage.getItem('username') || 'user01'
        const response = await axios.post('/users/heartbeat', {
          username: currentUsername
        })
        
        if (response.data && response.data.code === 0) {
          console.log('心跳检测成功')
        } else {
          console.warn('心跳检测响应异常:', response.data)
        }
      } catch (error) {
        console.error('心跳检测失败:', error)
      }
    }

    const startHeartbeat = () => {
      sendHeartbeat()
      heartbeatTimer = setInterval(() => {
        sendHeartbeat()
      }, 30000)
    }

    const stopHeartbeat = () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = null
      }
    }

    onMounted(() => {
      username.value = localStorage.getItem('username') || 'User'
      fetchVMList()
      startHeartbeat()
    })

    onBeforeUnmount(() => {
      stopHeartbeat()
    })

    const logout = () => {
      stopHeartbeat()
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('userRole')
      ElMessage.success(t('userHome.logoutSuccess'))
      router.push('/login')
    }

    const handlePowerOn = async (vm) => {
      try {
        const response = await fetchWithTimeout(
          axios.post(`/vm/${vm.vmid}/start`),
          t('userHome.timeout')
        )
        const result = response.data
        
        if (result.code === 0) {
          ElMessage.success(`${vm.vm_name} ${t('userHome.powerOnSuccess')}`)
          const vmIndex = vmList.value.findIndex(item => item.vmid === vm.vmid)
          if (vmIndex !== -1) {
            vmList.value[vmIndex].status = 'running'
          }
        } else {
          ElMessage.error(t('userHome.operationFailed'))
        }
      } catch (error) {
        console.error(`启动虚拟机 ${vm.vm_name} 失败:`, error)
        ElMessage.error(t('userHome.networkError'))
      }
    }

    const handlePowerOff = async (vm) => {
      try {
        const response = await fetchWithTimeout(
          axios.post(`/vm/${vm.vmid}/shutdown`),
          t('userHome.timeout')
        )
        const result = response.data
        
        if (result.code === 0) {
          ElMessage.success(`${vm.vm_name} ${t('userHome.powerOffSuccess')}`)
          const vmIndex = vmList.value.findIndex(item => item.vmid === vm.vmid)
          if (vmIndex !== -1) {
            vmList.value[vmIndex].status = 'stopped'
          }
        } else {
          ElMessage.error(t('userHome.operationFailed'))
        }
      } catch (error) {
        console.error(`关闭虚拟机 ${vm.vm_name} 失败:`, error)
        ElMessage.error(t('userHome.networkError'))
      }
    }

    const handleReboot = async (vm) => {
      try {
        const response = await fetchWithTimeout(
          axios.post(`/vm/${vm.vmid}/restart`),
          t('userHome.timeout')
        )
        const result = response.data
        
        if (result.code === 0) {
          ElMessage.success(`${vm.vm_name} ${t('userHome.rebootSuccess')}`)
        } else {
          ElMessage.error(t('userHome.operationFailed'))
        }
      } catch (error) {
        console.error(`重启虚拟机 ${vm.vm_name} 失败:`, error)
        ElMessage.error(t('userHome.networkError'))
      }
    }

    const handleRestore = async (vm) => {
      try {
        const response = await fetchWithTimeout(
          axios.post(`/vm/${vm.vmid}/rollback`),
          t('userHome.timeout')
        )
        const result = response.data
        
        if (result.code === 0) {
          ElMessage.success(`${vm.vm_name} ${t('userHome.restoreSuccess')}`)
          const vmIndex = vmList.value.findIndex(item => item.vmid === vm.vmid)
          if (vmIndex !== -1) {
            vmList.value[vmIndex].status = 'stopped'
          }
        } else {
          ElMessage.error(t('userHome.operationFailed'))
        }
      } catch (error) {
        console.error(`还原虚拟机 ${vm.vm_name} 失败:`, error)
        ElMessage.error(t('userHome.networkError'))
      }
    }

    const handleConnect = (vm) => {
      localStorage.setItem('rdp_vmid', vm.vmid)
      localStorage.setItem('rdp_name', vm.vm_name)
      window.open('/rdp', '_blank')
    }

    const submitChangePassword = async () => {
      const currentUsername = localStorage.getItem('username') || 'user01'
      
      if (!passwordForm.value.newPassword) {
        ElMessage.warning(t('userHome.passwordRequired'))
        return
      }
      
      if (passwordForm.value.newPassword.length < 6) {
        ElMessage.warning(t('userHome.passwordMinLength'))
        return
      }
      
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        ElMessage.warning(t('userHome.passwordNotMatch'))
        return
      }

      try {
        const response = await fetchWithTimeout(
          axios.put('/users/password', {
            username: currentUsername,
            newPassword: passwordForm.value.newPassword
          }),
          t('userHome.timeout')
        )
        const result = response.data

        if (result.code === 0) {
          ElMessage.success(t('userHome.passwordSuccess'))
          showChangePasswordDialog.value = false
          passwordForm.value = {
            newPassword: '',
            confirmPassword: ''
          }
        } else {
          ElMessage.error(t('userHome.operationFailed'))
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error(t('userHome.networkError'))
      }
    }

    return {
      t,
      username,
      vmList,
      showChangePasswordDialog,
      passwordForm,
      isLoading,
      logout,
      fetchVMList,
      handlePowerOn,
      handlePowerOff,
      handleReboot,
      handleRestore,
      handleConnect,
      submitChangePassword
    }
  }
}
</script>

<style scoped>
.user-home-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  box-sizing: border-box;
}

.vm-list-card {
  width: 100%;
  max-width: 800px;
  background: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.card-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 30px 0;
}

.vm-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vm-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}

.vm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.vm-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vm-name {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  background: #ecf5ff;
  padding: 4px 12px;
  border-radius: 4px;
}

.vm-id {
  font-size: 12px;
  color: #909399;
}

.vm-status {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
}

.vm-status.running {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #b3e6b5;
}

.vm-status.stopped {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.vm-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 20px;
  background: #7eb3ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #5a9eff;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.footer-left {
  display: flex;
  gap: 12px;
}

.footer-right {
  display: flex;
  gap: 12px;
}

.footer-btn {
  padding: 8px 24px;
  background: white;
  color: #606266;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.footer-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.return-btn {
  color: #606266;
  border-color: #dcdfe6;
}

.return-btn:hover {
  background: transparent;
}

.refresh-btn {
  color: #606266;
}

.password-form {
  padding: 20px 0;
}

:deep(.el-dialog) {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
}
</style>
