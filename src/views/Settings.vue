<template>
  <div class="settings-container">

    
    <!-- PVE配置表格 -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.pveConfig') }}</h3>
      <div class="table-container">
        <table class="settings-table">
          <tbody>
            <tr>
              <td class="col-label">{{ t('settings.ip') }}</td>
              <td class="col-value">
                <el-input v-model="pveConfig.host" :placeholder="t('settings.pleaseEnterIp')" />
              </td>
              <td class="col-label">{{ t('settings.port') }}</td>
              <td class="col-value">
                <el-input v-model="pveConfig.port" :placeholder="t('settings.pleaseEnterPort')" />
              </td>
            </tr>
            <tr>
              <td class="col-label">{{ t('settings.user') }}</td>
              <td class="col-value">
                <el-input v-model="pveConfig.user" :placeholder="t('settings.pleaseEnterUsername')" />
              </td>
              <td class="col-label">{{ t('settings.password') }}</td>
              <td class="col-value">
                <el-input v-model="pveConfig.password" type="password" :placeholder="t('settings.pleaseEnterPassword')" show-password />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="saveConfig">{{ t('settings.saveConfig') }}</el-button>
      </div>
    </div>
    
    <!-- 管理网络配置表格 -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.ipConfig') }}</h3>
      <div class="table-container">
        <table class="settings-table">
          <tbody>
            <tr>
              <td class="col-label">{{ t('settings.mode') }}</td>
              <td class="col-value" colspan="3">
                <el-radio-group v-model="ipConfig.mode">
                  <el-radio value="dhcp">{{ t('settings.dhcp') }}</el-radio>
                  <el-radio value="static">{{ t('settings.static') }}</el-radio>
                </el-radio-group>
              </td>
            </tr>
            <template v-if="ipConfig.mode === 'static'">
              <tr>
                <td class="col-label">{{ t('settings.website') }}</td>
                <td class="col-value">
                  <el-input v-model="ipConfig.ipAddress" :placeholder="t('settings.pleaseEnterWebsite')" />
                </td>
                <td class="col-label">{{ t('settings.subnetMask') }}</td>
                <td class="col-value">
                  <el-input v-model="ipConfig.subnetMask" :placeholder="t('settings.pleaseEnterSubnetMask')" />
                </td>
              </tr>
              <tr>
                <td class="col-label">{{ t('settings.gateway') }}</td>
                <td class="col-value">
                  <el-input v-model="ipConfig.gateway" :placeholder="t('settings.pleaseEnterGateway')" />
                </td>
                <td class="col-label">{{ t('settings.dns') }}</td>
                <td class="col-value">
                  <el-input v-model="ipConfig.dns" :placeholder="t('settings.pleaseEnterDns')" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="saveIpConfig">{{ t('settings.saveConfig') }}</el-button>
      </div>
    </div>
    
    <!-- 公网网关配置表格 -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.publicGatewayProxy') }}</h3>
      <div class="table-container">
        <table class="settings-table">
          <tbody>
            <tr>
              <td class="col-label">{{ t('settings.ip') }}</td>
              <td class="col-value">
                <el-input v-model="publicGatewayConfig.ip" :placeholder="t('settings.pleaseEnterIp')" />
              </td>
              <td class="col-label">{{ t('settings.port') }}</td>
              <td class="col-value">
                <el-input v-model="publicGatewayConfig.port" :placeholder="t('settings.pleaseEnterPort')" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="savePublicGatewayConfig">{{ t('settings.saveConfig') }}</el-button>
      </div>
    </div>
    
    <!-- 内网网关配置表格 -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.internalGatewayProxy') }}</h3>
      <div class="table-container">
        <table class="settings-table">
          <tbody>
            <tr>
              <td class="col-label">{{ t('settings.ip') }}</td>
              <td class="col-value">
                <el-input v-model="internalGatewayConfig.ip" :placeholder="t('settings.pleaseEnterIp')" />
              </td>
              <td class="col-label">{{ t('settings.port') }}</td>
              <td class="col-value">
                <el-input v-model="internalGatewayConfig.port" :placeholder="t('settings.pleaseEnterPort')" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="saveInternalGatewayConfig">{{ t('settings.saveConfig') }}</el-button>
      </div>
    </div>
    
    <!-- FreeRDP配置表格 -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.freeRdpConfig') }}</h3>
      <div class="table-container">
        <table class="settings-table freerdp-config-table">
          <tbody>
            <tr>
              <td class="col-label">{{ t('settings.rdpEncoder') }}</td>
              <td class="col-value freerdp-config-value" colspan="3">
                <el-select v-model="freeRdpConfig.rdpEncoder" :placeholder="t('settings.pleaseSelectRdpEncoder')" style="width: 100%;">
                  <el-option label="rfx" value="rfx" />
                  <el-option label="gfx" value="gfx" />
                </el-select>
              </td>
            </tr>
            <tr>
              <td class="col-label">{{ t('settings.gdiAcceleration') }}</td>
              <td class="col-value freerdp-config-value" colspan="3">
                <el-switch v-model="freeRdpConfig.gdiAcceleration" :active-text="t('settings.on')" :inactive-text="t('settings.off')" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="saveFreeRdpConfig">{{ t('settings.saveConfig') }}</el-button>
      </div>
    </div>
    
    <!-- 修改密码表格 -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.changeAdminPassword') }}</h3>
      <div class="table-container">
        <table class="settings-table">
          <tbody>
            <tr>
              <td class="col-label">{{ t('settings.oldPassword') }}</td>
              <td class="col-value">
                <el-input v-model="passwordForm.oldPassword" type="password" :placeholder="t('settings.pleaseEnterOldPassword')" show-password />
              </td>
            </tr>
            <tr>
              <td class="col-label">{{ t('settings.newPassword') }}</td>
              <td class="col-value">
                <el-input v-model="passwordForm.newPassword" type="password" :placeholder="t('settings.pleaseEnterNewPassword')" show-password />
              </td>
            </tr>
            <tr>
              <td class="col-label">{{ t('settings.confirmNewPassword') }}</td>
              <td class="col-value">
                <el-input v-model="passwordForm.confirmPassword" type="password" :placeholder="t('settings.pleaseConfirmNewPassword')" show-password />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="changePassword">{{ t('settings.saveConfig') }}</el-button>
      </div>
    </div>
    
    <!-- 产品信息表格 -->
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.productInfo') }}</h3>
      <div class="table-container">
        <table class="settings-table product-info-table">
          <tbody>
            <tr>
              <td class="col-label">{{ t('settings.productName') }}</td>
              <td class="col-value product-info-value">{{ productInfo.product || '-' }}</td>
            </tr>
            <tr>
              <td class="col-label">{{ t('settings.version') }}</td>
              <td class="col-value product-info-value">{{ productInfo.version || '-' }}</td>
            </tr>
            <tr>
              <td class="col-label">{{ t('settings.license') }}</td>
              <td class="col-value product-info-value">{{ productInfo.license || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export default {
  name: 'Settings',
  setup() {
    const { t } = useI18n()
    
    const pveConfig = ref({
      host: '',
      port: '',
      user: '',
      password: ''
    })
    
    const passwordForm = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const ipConfig = ref({
      mode: 'dhcp',
      ipAddress: '',
      subnetMask: '',
      gateway: '',
      dns: ''
    })
    
    const freeRdpConfig = ref({
      rdpEncoder: 'rfx',
      gdiAcceleration: false
    })
    
    const publicGatewayConfig = ref({
      ip: '',
      port: ''
    })
    
    const internalGatewayConfig = ref({
      ip: '',
      port: ''
    })
    
    const productInfo = ref({
      version: '',
      license: '',
      product: ''
    })
    
    const fetchPveConfig = async () => {
      try {
        const response = await axios.get('/setting/pve')
        const result = response.data
        
        if (result.data) {
          pveConfig.value.host = result.data.host || ''
          pveConfig.value.port = result.data.port || ''
          pveConfig.value.user = result.data.user || ''
        }
      } catch (error) {
        console.error('获取PVE配置失败:', error)
      }
    }
    
    const fetchIpConfig = async () => {
      try {
        const response = await axios.get('/setting/ipmode')
        const result = response.data
        
        if (result.data) {
          ipConfig.value.mode = result.data.ip_mode || 'dhcp'
          if (result.data.ip_mode === 'static') {
            ipConfig.value.ipAddress = result.data.ip_address || ''
            ipConfig.value.subnetMask = result.data.ip_netmask || ''
            ipConfig.value.gateway = result.data.ip_gateway || ''
            ipConfig.value.dns = result.data.ip_dns || ''
          }
        }
      } catch (error) {
        console.error('获取网络配置失败:', error)
      }
    }
    
    const fetchPublicGatewayConfig = async () => {
      try {
        const response = await axios.get('/setting/publicgateway')
        const result = response.data
        
        if (result.data) {
          publicGatewayConfig.value.ip = result.data.gwPublicHost || ''
          publicGatewayConfig.value.port = result.data.gwPublicPort || ''
        }
      } catch (error) {
        console.error('获取公网网关代理配置失败:', error)
      }
    }
    
    const fetchInternalGatewayConfig = async () => {
      try {
        const response = await axios.get('/setting/gateway')
        const result = response.data
        
        if (result.data) {
          internalGatewayConfig.value.ip = result.data.gwHost || ''
          internalGatewayConfig.value.port = result.data.gwPort || ''
        }
      } catch (error) {
        console.error('获取内网网关代理配置失败:', error)
      }
    }
    
    const fetchFreeRdpConfig = async () => {
      try {
        const response = await axios.get('/setting/rdpconf')
        const result = response.data
        
        if (result.data) {
          freeRdpConfig.value.rdpEncoder = result.data.rdpCoder || 'rfx'
          freeRdpConfig.value.gdiAcceleration = result.data.rdpGdi === '1'
        }
      } catch (error) {
        console.error('获取FreeRDP配置失败:', error)
      }
    }
    
    const saveConfig = async () => {
      try {
        const response = await axios.post('/setting/pve', {
          host: pveConfig.value.host,
          port: pveConfig.value.port,
          user: pveConfig.value.user,
          password: pveConfig.value.password
        })
        const result = response.data
        
        if (result.code === 200) {
          ElMessage.success(t('settings.pveConfigSaveSuccess'))
          // console.log('保存的配置:', pveConfig.value)
        } else {
          ElMessage.error(result.message || t('settings.saveFailed'))
        }
      } catch (error) {
        console.error('保存PVE配置失败:', error)
        ElMessage.error(t('settings.saveFailed'))
      }
    }
    
    const changePassword = async () => {
      if (!passwordForm.value.oldPassword) {
        ElMessage.warning(t('settings.pleaseEnterOldPasswordFirst'))
        return
      }
      if (!passwordForm.value.newPassword) {
        ElMessage.warning(t('settings.pleaseEnterNewPasswordFirst'))
        return
      }
      if (passwordForm.value.newPassword.length < 6) {
        ElMessage.error(t('settings.passwordLengthError'))
        return
      }
      if (!passwordForm.value.confirmPassword) {
        ElMessage.warning(t('settings.pleaseConfirmNewPasswordFirst'))
        return
      }
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        ElMessage.error(t('settings.passwordsNotMatch'))
        return
      }
      
      try {
        const response = await axios.post('/setting/updateadminpassword', {
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword
        })
        const result = response.data
        
        if (result.code === 200) {
          ElMessage.success(t('settings.passwordChangeSuccess'))
          // console.log('修改密码:', passwordForm.value)
          passwordForm.value = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        } else {
          ElMessage.error(result.message || t('settings.passwordUpdateFailed'))
        }
      } catch (error) {
        console.error('更新管理员密码失败:', error)
        ElMessage.error(t('settings.passwordUpdateFailed'))
      }
    }
    
    const saveIpConfig = async () => {
      try {
        let requestData
        if (ipConfig.value.mode === 'static') {
          requestData = {
            ip_mode: 'static',
            address: ipConfig.value.ipAddress,
            netmask: ipConfig.value.subnetMask,
            gateway: ipConfig.value.gateway,
            dns: ipConfig.value.dns
          }
        } else {
          requestData = {
            ip_mode: 'dhcp'
          }
        }
        
        const response = await axios.post('/setting/ipmode', requestData)
        const result = response.data
        
        if (result.code === 200) {
          ElMessage.success(t('settings.ipConfigSaveSuccess'))
          // console.log('保存的IP配置:', requestData)
        } else {
          ElMessage.error(result.message || t('settings.saveFailed'))
        }
      } catch (error) {
        console.error('保存网络配置失败:', error)
        ElMessage.error(t('settings.saveFailed'))
      }
    }
    
    const saveFreeRdpConfig = async () => {
      try {
        const response = await axios.post('/setting/rdpconf', {
          rdpCoder: freeRdpConfig.value.rdpEncoder,
          rdpGdi: freeRdpConfig.value.gdiAcceleration ? '1' : '0'
        })
        const result = response.data
        
        if (result.code === 200) {
          ElMessage.success(t('settings.freeRdpConfigSaveSuccess'))
          // console.log('保存的FreeRDP配置:', freeRdpConfig.value)
        } else {
          ElMessage.error(result.message || t('settings.saveFailed'))
        }
      } catch (error) {
        console.error('保存FreeRDP配置失败:', error)
        ElMessage.error(t('settings.saveFailed'))
      }
    }
    
    const savePublicGatewayConfig = async () => {
      try {
        const response = await axios.post('/setting/publicgateway', {
          gwPublicHost: publicGatewayConfig.value.ip,
          gwPublicPort: publicGatewayConfig.value.port
        })
        const result = response.data
        
        if (result.code === 200) {
          ElMessage.success(t('settings.publicGatewaySaveSuccess'))
          // console.log('保存的公网网关代理配置:', publicGatewayConfig.value)
        } else {
          ElMessage.error(result.message || t('settings.saveFailed'))
        }
      } catch (error) {
        console.error('保存公网网关代理配置失败:', error)
        ElMessage.error(t('settings.saveFailed'))
      }
    }
    
    const saveInternalGatewayConfig = async () => {
      try {
        const response = await axios.post('/setting/gateway', {
          gwHost: internalGatewayConfig.value.ip,
          gwPort: internalGatewayConfig.value.port
        })
        const result = response.data
        
        if (result.code === 200) {
          ElMessage.success(t('settings.internalGatewaySaveSuccess'))
          // console.log('保存的内网网关代理配置:', internalGatewayConfig.value)
        } else {
          ElMessage.error(result.message || t('settings.saveFailed'))
        }
      } catch (error) {
        console.error('保存内网网关代理配置失败:', error)
        ElMessage.error(t('settings.saveFailed'))
      }
    }
    
    const fetchProductInfo = async () => {
      try {
        const response = await axios.get('/setting/productVersion')
        const result = response.data
        
        if (result.code === 200 && result.data) {
          productInfo.value = result.data
        }
      } catch (error) {
        console.error('获取产品信息失败:', error)
      }
    }
    
    onMounted(() => {
      fetchPveConfig()
      fetchIpConfig()
      fetchPublicGatewayConfig()
      fetchInternalGatewayConfig()
      fetchFreeRdpConfig()
      fetchProductInfo()
    })
    
    return {
      t,
      pveConfig,
      passwordForm,
      ipConfig,
      freeRdpConfig,
      publicGatewayConfig,
      internalGatewayConfig,
      productInfo,
      saveConfig,
      changePassword,
      saveIpConfig,
      saveFreeRdpConfig,
      savePublicGatewayConfig,
      saveInternalGatewayConfig
    }
  }
}
</script>

<style scoped>
.settings-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}



.settings-section {
  margin-top: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.settings-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e4e7ed;
}

.settings-table td {
  padding: 0;
  border: 1px solid #e4e7ed;
  vertical-align: middle;
}

.col-label {
  width: 150px;
  min-width: 150px;
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
  text-align: center;
  padding: 12px 16px;
}

.col-value {
  width: auto;
  min-width: 200px;
  padding: 12px 16px;
}

.col-value :deep(.el-input) {
  width: 100%;
  height: 100%;
}

.col-value :deep(.el-input__wrapper) {
  width: 100%;
  box-shadow: none;
  border-radius: 0;
  padding: 12px 16px;
  min-height: 48px;
}

.col-value :deep(.el-input__inner) {
  width: 100%;
  height: 100%;
}

.col-value :deep(.el-select) {
  width: 100%;
}

.col-value :deep(.el-select .el-input__wrapper) {
  width: 100%;
  box-shadow: none;
  border-radius: 0;
  padding: 12px 16px;
  min-height: 48px;
}

.col-value :deep(.el-radio-group) {
  padding: 12px 16px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* 产品信息表格样式 */
.product-info-table .product-info-value {
  padding: 12px 16px;
}

/* FreeRDP配置表格样式 */
.freerdp-config-table .freerdp-config-value {
  padding: 12px 16px;
}
</style>
