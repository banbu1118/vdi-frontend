<template>
  <div class="templates-container">
    <div class="template-list">
      <h3 class="section-title">{{ t('templates.templateList') }}</h3>
      <div v-if="loading" class="loading-placeholder">
        <el-skeleton :rows="6" animated />
      </div>
      <el-table 
        v-else
        :data="templateList" 
        style="width: 100%" 
        empty-text=""
      >
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
        <el-table-column :label="t('templates.action')" width="200" align="center">
          <template #default="scope">
            <el-button 
              class="delete-btn"
              @click="handleDeleteSingleTemplate(scope.row)"
            >
              {{ t('templates.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
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
    const loading = ref(true)
    let pollingTimer = null

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

    const handleDeleteSingleTemplate = async (template) => {
      try {
        const vmid = template.vmid
        const templateName = template.name
        
        await ElMessageBox.confirm(
          t('dialog.confirmDeleteTemplate', { name: templateName }),
          t('dialog.confirmDelete'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
          }
        )
        
        await axios.delete(`/vm/template/${vmid}`, { timeout: 15000 })
        ElMessage.success(t('dialog.deleteTemplateSuccess', { name: templateName }))
        
        await fetchTemplateList()
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('❌ 删除单个模板失败:', error.message)
          ElMessage.error(t('dialog.deleteTemplateFailed', { error: error.message }))
        }
      }
    }
    
    return {
      templateList,
      loading,
      formatMemory,
      formatDisk,
      handleDeleteSingleTemplate,
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
  --fs-base: 14px;
  --fs-header: 15px;
  --fs-card-title: 20px;
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

.templates-container :deep(.el-table .cell) {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.templates-container :deep(.delete-btn) {
  background-color: rgba(92, 107, 192, 0.12);
  border-color: rgba(92, 107, 192, 0.4);
  color: #5c6bc0;
  font-size: var(--fs-base);
  transition: all 0.2s;
}

.templates-container :deep(.delete-btn:hover) {
  background-color: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.templates-container :deep(.delete-btn:active) {
  background-color: #3949ab;
  border-color: #3949ab;
  color: #fff;
}

@media (max-width: 768px) {
  .templates-container {
    padding: 10px;
    --fs-card-title: 16px;
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
    --fs-card-title: 15px;
  }
}
</style>
