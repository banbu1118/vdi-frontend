<template>
  <div class="templates-container">
    <div class="template-list">
      <h3 class="section-title">{{ t('templates.templateList') }}</h3>

      <!-- 操作工具栏 -->
      <div class="toolbar">
        <div class="toolbar-group">
          <span class="toolbar-label">{{ t('toolbar.templateOperation') }}</span>
          <el-button class="btn btn-info" @click="showImportDialog = true">{{ t('toolbar.import') }}</el-button>
          <el-button class="btn btn-info" :class="{ 'not-operable': selectedTemplates.length === 0 }" @click="selectedTemplates.length > 0 && (showExportDialog = true)">{{ t('toolbar.export') }}</el-button>
          <el-button class="btn btn-info" :class="{ 'not-operable': selectedTemplates.length === 0 }" @click="selectedTemplates.length > 0 && (showCloneDialog = true)">{{ t('toolbar.clone') }}</el-button>
          <el-button class="btn btn-info" @click="showTemplateDialog = true">{{ t('toolbar.save') }}</el-button>
          <el-button class="btn btn-danger" :class="{ 'not-operable': selectedTemplates.length === 0 }" @click="selectedTemplates.length > 0 && deleteTemplates()">{{ t('templates.delete') }}</el-button>
        </div>
      </div>

      <!-- 选中信息 -->
      <div class="selected-info" v-if="selectedTemplates.length > 0">
        {{ t('templates.selectedTemplates', { count: selectedTemplates.length }) }}
      </div>

      <div v-if="loading" class="loading-placeholder">
        <el-skeleton :rows="6" animated />
      </div>
      <el-table
        v-else
        :data="templateList.length > 0 ? templateList : [{}]"
        style="width: 100%"
        :border="true"
        empty-text=""
      >
        <el-table-column width="80" align="center">
          <template #header>
            {{ t('groupList.checkbox') }}
          </template>
          <template #default="scope">
            <input
              v-if="scope.row.vmid !== undefined"
              type="checkbox"
              :value="scope.row.vmid"
              v-model="selectedTemplates"
            />
          </template>
        </el-table-column>
        <el-table-column prop="vmid" label="vmid" width="120" align="center"></el-table-column>
        <el-table-column prop="name" :label="t('templates.name')" align="center"></el-table-column>
        <el-table-column prop="cpus" label="cpus" align="center"></el-table-column>
        <el-table-column prop="mem" label="mem" align="center">
          <template #default="scope">
            {{ formatMemory(scope.row.mem) }}
          </template>
        </el-table-column>
        <el-table-column prop="disk" label="disk" align="center">
          <template #default="scope">
            {{ formatDisk(scope.row.disk) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 导入模板对话框 -->
    <el-dialog v-model="showImportDialog" :title="t('dialog.importTemplate')" width="480px" draggable :close-on-click-modal="!importing" :close-on-press-escape="!importing" :show-close="!importing">
      <el-form label-position="left" label-width="auto">
        <el-form-item :label="t('dialog.templateFile')">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".vma.zst,.vma,.tar,.gz,.qcow2,.iso"
            :disabled="importing"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-exceed="handleFileExceed"
          >
            <el-button class="btn btn-info" :disabled="importing">{{ t('dialog.selectFile') }}</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item :label="t('dialog.storage')">
          <el-select v-model="importStorage" :disabled="importing" :placeholder="t('message.enterStorage')" @visible-change="handleStorageSelectVisibleChange" style="width: 100%">
            <el-option v-for="storage in storages" :key="storage" :label="storage" :value="storage" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 上传进度 / 等待还原 -->
      <div v-if="importing" class="import-progress">
        <template v-if="importStage === 'uploading'">
          <div class="progress-meta">
            <span class="progress-label">{{ t('dialog.uploading') }}</span>
            <span class="progress-info">{{ formatSize(uploadLoaded) }} / {{ formatSize(uploadTotal) }} · {{ uploadSpeed }}</span>
          </div>
          <el-progress :percentage="uploadProgress" :stroke-width="12" />
        </template>
        <template v-else>
          <div class="restoring">
            <span class="spinner"></span>
            <span>{{ t('dialog.waitingRestore') }}</span>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button :disabled="importing" @click="showImportDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button class="btn btn-info" :loading="importing" @click="importTemplate">{{ t('common.ok') }}</el-button>
      </template>
    </el-dialog>

    <!-- 导出模板对话框 -->
    <el-dialog v-model="showExportDialog" :title="t('dialog.exportTemplate')" width="480px" draggable :close-on-click-modal="!exporting || exportStage === 'savePrompt'" :close-on-press-escape="!exporting || exportStage === 'savePrompt'" :show-close="!exporting || exportStage === 'savePrompt'" @close="handleExportDialogClose">
      <!-- 备份 / 保存提示 / 下载进度 -->
      <div v-if="exporting" class="import-progress">
        <template v-if="exportStage === 'backingUp'">
          <div class="restoring">
            <span class="spinner"></span>
            <span>{{ t('dialog.backingUp') }}</span>
          </div>
        </template>
        <template v-else-if="exportStage === 'savePrompt'">
          <div class="save-prompt">
            <span class="progress-label">{{ t('dialog.backupDoneChoosePath') }}</span>
            <el-button class="btn btn-info" @click="chooseSavePath">{{ t('dialog.chooseSavePath') }}</el-button>
          </div>
        </template>
        <template v-else>
          <div class="progress-meta">
            <span class="progress-label">{{ t('dialog.downloading') }}</span>
            <span class="progress-info">{{ formatSize(downloadLoaded) }} / {{ formatSize(downloadTotal) }} · {{ downloadSpeed }}</span>
          </div>
          <el-progress :percentage="downloadProgress" :indeterminate="downloadTotal === 0" :stroke-width="12" />
        </template>
      </div>
      <template #footer>
        <el-button :disabled="exporting && exportStage !== 'savePrompt'" @click="showExportDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button class="btn btn-info" :loading="exporting" @click="exportTemplate">{{ t('common.ok') }}</el-button>
      </template>
    </el-dialog>

    <!-- 克隆模板对话框 -->
    <el-dialog v-model="showCloneDialog" :title="t('dialog.cloneTemplate')" width="480px" draggable :close-on-click-modal="!cloning" :close-on-press-escape="!cloning" :show-close="!cloning">
      <el-form label-position="left" label-width="auto">
        <el-form-item :label="t('dialog.cloneVmName')">
          <el-input v-model="cloneForm.name" :disabled="cloning" @input="handleCloneNameInput" />
        </el-form-item>
        <el-form-item :label="t('dialog.cloneUsername')">
          <el-input v-model="cloneForm.username" :disabled="cloning" />
        </el-form-item>
        <el-form-item :label="t('dialog.clonePassword')">
          <el-input v-model="cloneForm.password" show-password :disabled="cloning" />
        </el-form-item>
        <el-form-item :label="t('dialog.cloneRdpPort')">
          <el-input-number v-model="cloneForm.rdp_port" :min="1" :max="65535" :disabled="cloning" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('dialog.storage')">
          <el-select v-model="cloneForm.storage" :disabled="cloning" :placeholder="t('message.enterStorage')" @visible-change="handleStorageSelectVisibleChange" style="width: 100%">
            <el-option v-for="storage in storages" :key="storage" :label="storage" :value="storage" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 克隆进度提示 -->
      <div v-if="cloning" class="import-progress">
        <div class="restoring">
          <span class="spinner"></span>
          <span>{{ t('dialog.cloning') }}</span>
        </div>
      </div>
      <template #footer>
        <el-button :disabled="cloning" @click="showCloneDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button class="btn btn-info" :loading="cloning" @click="cloneTemplate">{{ t('common.ok') }}</el-button>
      </template>
    </el-dialog>

    <!-- 转为模板对话框 -->
    <el-dialog v-model="showTemplateDialog" :title="t('dialog.makeTemplate')" width="480px" draggable :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <el-form label-position="left" label-width="auto">
        <el-form-item :label="t('dialog.selectVm')">
          <el-select v-model="templateVmid" :disabled="saving" :placeholder="t('dialog.selectVm')" style="width: 100%" @visible-change="handleTemplateSelectVisibleChange">
            <el-option v-for="vm in vmOptions" :key="vm.vmid" :label="`${vm.vmid} - ${vm.name}`" :value="vm.vmid" />
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 转换进度提示 -->
      <div v-if="saving" class="import-progress">
        <div class="restoring">
          <span class="spinner"></span>
          <span>{{ t('dialog.makingTemplate') }}</span>
        </div>
      </div>
      <template #footer>
        <el-button :disabled="saving" @click="showTemplateDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button class="btn btn-info" :loading="saving" @click="saveTemplate">{{ t('common.ok') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

export default {
  name: 'Templates',
  setup() {
    const { t } = useI18n()
    const taskList = [
      {
        queue: '1',
        type: '创建模板',
        status: '正在导入win10镜像',
        actionType: 'cancel'
      },
      {
        queue: '2',
        type: '导入模板',
        status: '正在还原模板',
        actionType: 'cancel'
      },
      {
        queue: '3',
        type: '复制模板',
        status: '虚拟机创建完成（请管理员审核）',
        actionType: 'edit'
      }
    ]

    const templateList = ref([])
    const selectedTemplates = ref([])
    const loading = ref(true)
    const showImportDialog = ref(false)
    const importStorage = ref('data')
    const storages = ref([])
    const storagesLoading = ref(false)
    const importFile = ref(null)
    const importing = ref(false)
    const importStage = ref('uploading')
    const uploadProgress = ref(0)
    const uploadSpeed = ref('')
    const uploadLoaded = ref(0)
    const uploadTotal = ref(0)
    const uploadRef = ref(null)
    const showExportDialog = ref(false)
    const exporting = ref(false)
    const exportStage = ref('backingUp')
    const downloadProgress = ref(0)
    const downloadSpeed = ref('')
    const downloadLoaded = ref(0)
    const downloadTotal = ref(0)
    let pollingTimer = null
    let lastSampleLoaded = 0
    let lastSampleTime = 0
    let downloadSampleLoaded = 0
    let downloadSampleTime = 0
    let exportResponse = null
    let exportFilename = null
    let exportWritable = null
    let exportUsingFS = false
    let exportSaveResolve = null
    let exportCancelled = false
    let exportAbortController = null
    let exportTimeoutId = null
    const showCloneDialog = ref(false)
    const cloning = ref(false)
    const cloneForm = reactive({
      name: '',
      username: 'administrator',
      password: '123456',
      rdp_port: 3389,
      storage: ''
    })
    const showTemplateDialog = ref(false)
    const saving = ref(false)
    const templateVmid = ref('')
    const vmOptions = ref([])
    const vmOptionsLoading = ref(false)

    const formatMemory = (bytes) => {
      if (!bytes) return ''
      const gb = bytes / (1024 * 1024 * 1024)
      return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(bytes / 1024 / 1024).toFixed(0)}MB`
    }

    const formatDisk = (bytes) => {
      if (!bytes) return ''
      const gb = bytes / (1024 * 1024 * 1024)
      return `${gb.toFixed(0)}GB`
    }

    const formatSize = (bytes) => {
      if (!bytes) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let i = 0
      let value = bytes
      while (value >= 1024 && i < units.length - 1) {
        value /= 1024
        i++
      }
      return `${value.toFixed(1)} ${units[i]}`
    }

    const formatSpeed = (bps) => {
      if (!bps || bps <= 0) return '0 B/s'
      const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
      let i = 0
      let value = bps
      while (value >= 1024 && i < units.length - 1) {
        value /= 1024
        i++
      }
      return `${value.toFixed(1)} ${units[i]}`
    }

    const fetchTemplateList = async () => {
      try {
        const response = await axios.get('/tasks/templates')
        const result = response.data
        
        if (result.code === 0 && result.data && Array.isArray(result.data)) {
          const newTemplates = result.data.sort((a, b) => a.vmid - b.vmid)
          
          if (templateList.value.length === 0) {
            templateList.value = newTemplates
          } else {
            const updatedList = []
            const currentTemplatesMap = new Map(templateList.value.map(t => [t.vmid, t]))
            const newTemplatesMap = new Map(newTemplates.map(t => [t.vmid, t]))
            
            for (const newTemplate of newTemplates) {
              const currentTemplate = currentTemplatesMap.get(newTemplate.vmid)
              
              if (currentTemplate && isDataChanged(currentTemplate, newTemplate)) {
                updatedList.push(newTemplate)
              } else if (currentTemplate && !isDataChanged(currentTemplate, newTemplate)) {
                updatedList.push(currentTemplate)
              } else {
                updatedList.push(newTemplate)
              }
            }
            
            const newVmids = new Set(newTemplates.map(t => t.vmid))
            const deletedCount = templateList.value.length - updatedList.length
            
            templateList.value = updatedList
          }
        } else {
          console.warn('⚠️ API返回数据格式不正确:', result)
          templateList.value = []
        }
      } catch (error) {
        console.warn('❌ API调用异常:', error.message)
        templateList.value = []
      } finally {
        loading.value = false
      }
    }

    const isDataChanged = (oldTemplate, newTemplate) => {
      return oldTemplate.name !== newTemplate.name ||
             oldTemplate.status !== newTemplate.status ||
             oldTemplate.description !== newTemplate.description ||
             oldTemplate.createTime !== newTemplate.createTime ||
             oldTemplate.updateTime !== newTemplate.updateTime
    }

    const startPolling = () => {
      fetchTemplateList()
      pollingTimer = setInterval(fetchTemplateList, 5000)
    }

    const stopPolling = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
    }
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        if (!pollingTimer) {
          startPolling()
        }
      }
    }

    onMounted(() => {
      startPolling()
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })

    onBeforeUnmount(() => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    const deleteTemplates = async () => {
      try {
        await ElMessageBox.confirm(
          t('dialog.confirmDeleteTemplates', { count: selectedTemplates.value.length }),
          t('dialog.confirmDelete'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'danger'
          }
        )
        
        for (const vmid of selectedTemplates.value) {
          try {
            await axios.delete(`/vm/template/${vmid}`, { timeout: 15000 })
          } catch (error) {
            console.error(`❌ 删除模板 ${vmid} 失败:`, error.message)
            ElMessage.error(t('dialog.deleteTemplateFailed', { error: error.message }))
          }
        }
        
        ElMessage.success(t('dialog.templateDeleteSuccess'))
        selectedTemplates.value = []
        await fetchTemplateList()
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('❌ 删除模板失败:', error.message)
          ElMessage.error(t('dialog.deleteTemplateFailed', { error: error.message }))
        }
      }
    }
    
    const getFilenameFromDisposition = (disposition) => {
      if (!disposition) return 'template-export.bin'
      const utf8Match = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disposition)
      if (utf8Match) return decodeURIComponent(utf8Match[1].replace(/"/g, '').trim())
      const plainMatch = /filename="?([^";]+)"?/i.exec(disposition)
      if (plainMatch) return plainMatch[1].trim()
      return 'template-export.bin'
    }

    const resetDownloadProgress = () => {
      downloadProgress.value = 0
      downloadSpeed.value = ''
      downloadLoaded.value = 0
      downloadTotal.value = 0
      downloadSampleLoaded = 0
      downloadSampleTime = 0
    }

    // 备份完成后，用户点击“保存”按钮时选择保存位置（需用户手势激活）
    const chooseSavePath = async () => {
      if (!exportResponse) return
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: exportFilename || 'template-export.bin',
          types: [{
            description: 'Backup File',
            accept: { 'application/octet-stream': ['.zst', '.vma', '.tar', '.gz', '.qcow2', '.bin'] }
          }]
        })
        exportWritable = await fileHandle.createWritable()
        exportUsingFS = true
      } catch (error) {
        if (error.name === 'AbortError') {
          // 用户取消选择，保持等待，可再次点击保存
          return
        }
        // 其他错误：回退到内存下载
        console.warn('文件系统API不可用，回退到内存下载:', error.message)
        ElMessage.warning(t('message.downloadFallbackMemory'))
        exportUsingFS = false
      }
      exportStage.value = 'downloading'
      if (exportSaveResolve) {
        const resolve = exportSaveResolve
        exportSaveResolve = null
        resolve()
      }
    }

    // 对话框在“选择保存位置”阶段被关闭时，中止导出的下载
    const handleExportDialogClose = () => {
      if (exporting && exportStage.value === 'savePrompt') {
        exportCancelled = true
        exportAbortController?.abort()
        if (exportSaveResolve) {
          const resolve = exportSaveResolve
          exportSaveResolve = null
          resolve()
        }
      }
    }

    const exportTemplate = async () => {
      const vmids = [...selectedTemplates.value]
      if (vmids.length === 0) {
        ElMessage.warning(t('dialog.selectTemplateFirst'))
        return
      }
      if (vmids.length > 1) {
        ElMessage.warning(t('dialog.selectOneTemplateOnly'))
        return
      }

      exporting.value = true
      exportStage.value = 'backingUp'
      resetDownloadProgress()
      exportCancelled = false
      exportResponse = null
      exportWritable = null
      exportUsingFS = false

      // 备份阶段最长等待 2 小时
      exportAbortController = new AbortController()
      exportTimeoutId = setTimeout(() => {
        exportAbortController.abort()
        if (exportSaveResolve) {
          const resolve = exportSaveResolve
          exportSaveResolve = null
          resolve()
        }
      }, 2 * 60 * 60 * 1000)

      try {
        const response = await fetch(`/api/v1/vm/template/${vmids[0]}/export`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          signal: exportAbortController.signal
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            localStorage.removeItem('userRole')
            window.location.href = '/login'
            return
          }
          throw new Error(`HTTP ${response.status}`)
        }

        // 备份完成，后端开始流式传输；此时再提示用户选择保存位置
        exportResponse = response
        exportFilename = getFilenameFromDisposition(response.headers.get('Content-Disposition'))
        const total = Number(response.headers.get('Content-Length')) || 0
        downloadTotal.value = total

        if (window.showSaveFilePicker) {
          exportStage.value = 'savePrompt'
          // 等待用户点击“保存”按钮（showSaveFilePicker 必须在用户手势内调用）
          await new Promise((resolve) => { exportSaveResolve = resolve })
        } else {
          ElMessage.warning(t('message.downloadFallbackMemory'))
          exportUsingFS = false
          exportStage.value = 'downloading'
        }

        if (exportCancelled) {
          return
        }
        if (!response.body) {
          throw new Error('Response body is unavailable')
        }

        // 流式下载
        const reader = response.body.getReader()
        let loaded = 0

        if (exportUsingFS) {
          // 直接流式写入硬盘，不占浏览器内存
          // 小块攒够 2MB 再批量写；UI 进度节流到每 100ms 更新一次，避免逐块触发 Vue 重渲染拖慢主线程
          let buffer = []
          let buffered = 0
          let lastUiUpdate = 0
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer.push(value)
            buffered += value.byteLength
            loaded += value.byteLength

            const now = Date.now()
            // 每秒采样一次，计算瞬时下载速度（每秒一次，无渲染压力）
            if (!downloadSampleTime) {
              downloadSampleTime = now
              downloadSampleLoaded = loaded
            } else {
              const dt = (now - downloadSampleTime) / 1000
              if (dt >= 1) {
                downloadSpeed.value = formatSpeed((loaded - downloadSampleLoaded) / dt)
                downloadSampleTime = now
                downloadSampleLoaded = loaded
              }
            }

            // 节流 UI 更新（每 100ms），避免逐块触发重渲染
            if (now - lastUiUpdate >= 100) {
              downloadLoaded.value = loaded
              if (total > 0) {
                downloadProgress.value = Math.min(Math.round((loaded / total) * 100), 100)
              }
              lastUiUpdate = now
            }

            if (buffered >= 2 * 1024 * 1024) {
              await exportWritable.write(new Blob(buffer))
              buffer = []
              buffered = 0
            }
          }
          if (buffer.length) {
            await exportWritable.write(new Blob(buffer))
          }
          await exportWritable.close()
          // 收尾：进度归整到 100%
          downloadLoaded.value = loaded
          downloadProgress.value = 100
        } else {
          // 回退：内存中组装后触发下载（不推荐用于超大文件）
          const chunks = []
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
            loaded += value.byteLength
            downloadLoaded.value = loaded
            if (total > 0) {
              downloadProgress.value = Math.min(Math.round((loaded / total) * 100), 100)
            }
          }
          const blob = new Blob(chunks)
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = exportFilename || 'template-export.bin'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }

        ElMessage.success(t('message.exportTemplateSuccess'))
        showExportDialog.value = false

      } catch (error) {
        if (exportCancelled) {
          return
        }
        if (error.name === 'AbortError') {
          ElMessage.error(t('message.exportTemplateTimeout'))
        } else {
          console.error('❌ 导出模板失败:', error.message)
          ElMessage.error(t('message.exportTemplateFailed', { error: error.message }))
        }
      } finally {
        if (exportWritable) {
          try { await exportWritable.abort() } catch (e) { /* 忽略 */ }
        }
        clearTimeout(exportTimeoutId)
        exportAbortController = null
        exportResponse = null
        exportWritable = null
        exportSaveResolve = null
        exporting.value = false
        exportStage.value = 'backingUp'
        resetDownloadProgress()
      }
    }

    const handleFileChange = (uploadFile) => {
      importFile.value = uploadFile.raw
    }

    const handleFileRemove = () => {
      importFile.value = null
    }

    const handleFileExceed = () => {
      ElMessage.warning(t('dialog.onlyOneFile'))
    }

    // 限制虚拟机名称只能为数字、字母和英文横杠，且以数字或字母开头
    const handleCloneNameInput = () => {
      cloneForm.name = cloneForm.name.replace(/[^a-zA-Z0-9-]/g, '').replace(/^-+/, '')
    }

    const cloneTemplate = async () => {
      const vmids = [...selectedTemplates.value]
      if (vmids.length === 0) {
        ElMessage.warning(t('dialog.selectTemplateFirst'))
        return
      }
      if (vmids.length > 1) {
        ElMessage.warning(t('dialog.selectOneTemplateOnly'))
        return
      }
      if (!cloneForm.name.trim()) {
        ElMessage.warning(t('message.enterVmName'))
        return
      }
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(cloneForm.name)) {
        ElMessage.warning(t('message.invalidVmName'))
        return
      }
      if (!cloneForm.storage) {
        ElMessage.warning(t('message.enterStorage'))
        return
      }

      cloning.value = true
      try {
        await axios.post(`/vm/template/${vmids[0]}/clone`, {
          name: cloneForm.name.trim(),
          username: cloneForm.username.trim(),
          password: cloneForm.password,
          rdp_port: Number(cloneForm.rdp_port),
          storage: cloneForm.storage
        }, { timeout: 2 * 60 * 60 * 1000 })

        // 克隆完成：提示用户客户端 admin 登录安装软件
        ElMessage.success(t('message.cloneTemplateSuccess'))
        showCloneDialog.value = false
        cloneForm.name = ''
      } catch (error) {
        console.error('❌ 克隆模板失败:', error.message)
        ElMessage.error(t('message.cloneTemplateFailed', { error: error.message }))
      } finally {
        cloning.value = false
      }
    }

    const fetchVms = async () => {
      try {
        vmOptionsLoading.value = true
        const response = await axios.get('/vm/admin/vms')
        if (response.data?.code === 0) {
          vmOptions.value = response.data.data || []
        } else {
          console.warn('⚠️ API返回数据格式不正确:', response.data)
          vmOptions.value = []
          ElMessage.error(t('message.vmListFailed'))
        }
      } catch (error) {
        console.error('获取虚拟机列表失败:', error.message)
        vmOptions.value = []
        ElMessage.error(t('message.vmListFailed'))
      } finally {
        vmOptionsLoading.value = false
      }
    }

    const handleTemplateSelectVisibleChange = async (visible) => {
      if (visible && vmOptions.value.length === 0) {
        await fetchVms()
      }
    }

    const saveTemplate = async () => {
      if (!templateVmid.value) {
        ElMessage.warning(t('message.selectVmFirst'))
        return
      }
      saving.value = true
      try {
        // 转模板为长任务，等待后端完成（最多 2 小时）
        await axios.post(`/vm/${templateVmid.value}/template`, {}, { timeout: 2 * 60 * 60 * 1000 })
        ElMessage.success(t('message.makeTemplateSuccess'))
        showTemplateDialog.value = false
        templateVmid.value = ''
      } catch (error) {
        console.error('❌ 转为模板失败:', error.message)
        ElMessage.error(t('message.makeTemplateFailed', { error: error.message }))
      } finally {
        saving.value = false
      }
    }

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
        ElMessage.error(t('message.storageListFailed'))
      } finally {
        storagesLoading.value = false
      }
    }

    const handleStorageSelectVisibleChange = async (visible) => {
      if (visible && storages.value.length === 0) {
        await fetchStorages()
      }
    }

    const importTemplate = async () => {
      if (!importFile.value) {
        ElMessage.warning(t('dialog.selectFileFirst'))
        return
      }

      importing.value = true
      importStage.value = 'uploading'
      uploadProgress.value = 0
      uploadSpeed.value = ''
      uploadLoaded.value = 0
      uploadTotal.value = importFile.value.size
      lastSampleLoaded = 0
      lastSampleTime = 0
      try {
        await axios.post('/vm/template/import', importFile.value, {
          params: {
            storage: importStorage.value,
            filesize: importFile.value.size,
            filename: importFile.value.name
          },
          headers: { 'Content-Type': 'application/octet-stream' },
          timeout: 2 * 60 * 60 * 1000,
          onUploadProgress: (progressEvent) => {
            const total = importFile.value.size
            const loaded = progressEvent.loaded
            uploadProgress.value = total ? Math.min(Math.round((loaded / total) * 100), 100) : 0
            uploadLoaded.value = loaded
            uploadTotal.value = total

            // 每秒采样一次，计算瞬时上传速度
            const now = Date.now()
            if (!lastSampleTime) {
              lastSampleTime = now
              lastSampleLoaded = loaded
            } else {
              const dt = (now - lastSampleTime) / 1000
              if (dt >= 1) {
                uploadSpeed.value = formatSpeed((loaded - lastSampleLoaded) / dt)
                lastSampleTime = now
                lastSampleLoaded = loaded
              }
            }

            // 上传完成后，等待后端还原
            if (total > 0 && loaded >= total) {
              importStage.value = 'restoring'
            }
          }
        })

        ElMessage.success(t('message.importTemplateSuccess'))
        showImportDialog.value = false
        importFile.value = null
        if (uploadRef.value) {
          uploadRef.value.clearFiles()
        }
        await fetchTemplateList()

      } catch (error) {
        console.error('❌ 导入模板失败:', error.message)
        ElMessage.error(t('message.importTemplateFailed', { error: error.message }))
      } finally {
        importing.value = false
        uploadProgress.value = 0
        uploadSpeed.value = ''
        uploadLoaded.value = 0
        uploadTotal.value = 0
        importStage.value = 'uploading'
        lastSampleLoaded = 0
        lastSampleTime = 0
      }
    }
    
    return {
      templateList,
      selectedTemplates,
      loading,
      showImportDialog,
      importStorage,
      storages,
      storagesLoading,
      importing,
      importStage,
      uploadProgress,
      uploadSpeed,
      uploadLoaded,
      uploadTotal,
      uploadRef,
      showExportDialog,
      exporting,
      exportStage,
      downloadProgress,
      downloadSpeed,
      downloadLoaded,
      downloadTotal,
      formatMemory,
      formatDisk,
      formatSize,
      formatSpeed,
      deleteTemplates,
      handleFileChange,
      handleFileRemove,
      handleFileExceed,
      handleStorageSelectVisibleChange,
      importTemplate,
      exportTemplate,
      chooseSavePath,
      handleExportDialogClose,
      showCloneDialog,
      cloning,
      cloneForm,
      cloneTemplate,
      showTemplateDialog,
      saving,
      templateVmid,
      vmOptions,
      vmOptionsLoading,
      handleTemplateSelectVisibleChange,
      saveTemplate,
      t
    }
  }
}
</script>

<style scoped>
.templates-container {
  background: #f8f7fc;
  padding: 16px 20px 20px 20px !important;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  --el-button-font-size: 15px;
  --fs-base: 14px;
  --fs-header: 15px;
  --fs-card-title: 20px;
  --fs-toolbar: 15px;
}

.template-list {
  margin-bottom: 16px;
}

.loading-placeholder {
  background: #fcfcfd;
  border: 1px solid rgba(92, 107, 192, 0.25);
  border-radius: 4px;
  padding: clamp(16px, 1.5vw, 24px);
}

.section-title {
  font-size: var(--fs-card-title);
  font-weight: 600;
  color: #5c6bc0;
  margin: 0 0 8px 0;
  padding: 0;
  line-height: 1.2;
}

.templates-container :deep(.el-table) {
  width: 100% !important;
  font-size: var(--fs-base);
  background: #fcfcfd;
  border: 1px solid rgba(92, 107, 192, 0.25);
  border-radius: 4px;
  transition: none !important;
}

.templates-container :deep(.el-table *) {
  transition: none !important;
}

.templates-container :deep(.el-table th.el-table__cell) {
  background: rgba(92, 107, 192, 0.06) !important;
}

.templates-container :deep(.el-table th .cell) {
  font-size: var(--fs-header);
  font-weight: 600;
  color: #909399;
}

.templates-container :deep(.el-table td .cell) {
  font-size: var(--fs-base);
}

.templates-container :deep(.el-table__header-wrapper),
.templates-container :deep(.el-table__body-wrapper) {
  width: 100% !important;
}

.templates-container :deep(.el-table th.el-table__cell),
.templates-container :deep(.el-table td.el-table__cell) {
  height: 48px;
  padding-top: 6px;
  padding-bottom: 6px;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid rgba(92, 107, 192, 0.15) !important;
  border-bottom: 1px solid rgba(92, 107, 192, 0.15) !important;
}

.templates-container :deep(.el-table th.el-table__cell:last-child),
.templates-container :deep(.el-table td.el-table__cell:last-child) {
  border-right: none !important;
}

.templates-container :deep(.el-table__body tr:last-child td.el-table__cell) {
  border-bottom: none !important;
}

/* 表格无数据时的空白行高度与数据行保持一致 */
.templates-container :deep(.el-table__empty-block) {
  height: 48px !important;
  min-height: 48px !important;
}

.templates-container :deep(.el-table .cell) {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
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

.templates-container :deep(.toolbar .el-button) {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  line-height: 32px !important;
  font-size: 15px !important;
  transition: all 0.2s;
}

.templates-container :deep(.toolbar .el-button.btn.not-operable) {
  cursor: not-allowed;
  pointer-events: auto;
}

.templates-container :deep(.toolbar .el-button.btn-info) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.templates-container :deep(.toolbar .el-button.btn-info:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.templates-container :deep(.toolbar .el-button.btn-info:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.templates-container :deep(.toolbar .el-button.btn-danger) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.templates-container :deep(.toolbar .el-button.btn-danger:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.templates-container :deep(.toolbar .el-button.btn-danger:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.templates-container :deep(.el-dialog .btn-info) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
}

.templates-container :deep(.el-dialog .btn-info:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.templates-container :deep(.el-dialog .btn-info:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

.templates-container :deep(.el-table input[type="checkbox"]) {
  width: clamp(14px, 1vw, 18px);
  height: clamp(14px, 1vw, 18px);
  cursor: pointer;
  accent-color: #5c6bc0;
}

.import-progress {
  margin-top: 16px;
  padding: clamp(10px, 1vw, 14px);
  background: rgba(92, 107, 192, 0.06);
  border: 1px solid rgba(92, 107, 192, 0.25);
  border-radius: 4px;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 15px;
  font-weight: 600;
  color: #5c6bc0;
}

.save-prompt {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.progress-info {
  font-size: 13px;
  color: #909399;
}

.restoring {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #5c6bc0;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(92, 107, 192, 0.3);
  border-top-color: #5c6bc0;
  border-radius: 50%;
  animation: templates-spin 0.8s linear infinite;
}

@keyframes templates-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .templates-container {
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

  .template-list {
    overflow-x: auto;
  }
  
  .templates-container :deep(.el-table) {
    min-width: 400px;
  }
}

@media (max-width: 480px) {
  .templates-container {
    --fs-base: 12px;
    --fs-header: 13px;
    --fs-card-title: 15px;
    --fs-toolbar: 11px;
  }
}
</style>
