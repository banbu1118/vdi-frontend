<template>
  <div class="templates-container">




    <!-- 模板列表 -->
    <div class="template-list">
      <h3>{{ t('templates.templateList') }}</h3>
      <el-table 
        :data="templateList" 
        style="width: 100%" 
        border
      >
        <el-table-column prop="vmid" label="vmid" width="120" align="center"></el-table-column>
        <el-table-column prop="name" :label="t('templates.name')" align="center"></el-table-column>
        <el-table-column :label="t('templates.action')" width="200" align="center">
          <template #default="scope">
            <el-button 
              type="danger" 
              size="small"
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
    // 模拟任务列表数据
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

    // 模板列表数据
    const templateList = ref([])
    let pollingTimer = null

    // 获取模板列表数据 - 智能更新策略
    const fetchTemplateList = async () => {
      try {
        // 使用axios直接调用，baseURL已在main.js中配置
        const response = await axios.get('/tasks/templates')
        const result = response.data
        
        if (result.code === 0 && result.data && Array.isArray(result.data)) {
          const newTemplates = result.data.sort((a, b) => a.vmid - b.vmid)
          
          // 智能更新策略：只更新有变化的数据
          if (templateList.value.length === 0) {
            // 初次加载，直接设置
            templateList.value = newTemplates
            // console.log('✅ 初次加载模板数据:', newTemplates.length, '条记录')
          } else {
            // 智能更新：创建新的数组，保持未变化数据的引用
            const updatedList = []
            const currentTemplatesMap = new Map(templateList.value.map(t => [t.vmid, t]))
            const newTemplatesMap = new Map(newTemplates.map(t => [t.vmid, t]))
            
            // 遍历新数据，保持未变化数据的引用
            for (const newTemplate of newTemplates) {
              const currentTemplate = currentTemplatesMap.get(newTemplate.vmid)
              
              if (currentTemplate && isDataChanged(currentTemplate, newTemplate)) {
                // 数据有变化，更新该记录
                updatedList.push(newTemplate)
                // console.log(`🔄 模板数据更新: vmid=${newTemplate.vmid}, name=${newTemplate.name}`)
              } else if (currentTemplate && !isDataChanged(currentTemplate, newTemplate)) {
                // 数据未变化，保持原引用
                updatedList.push(currentTemplate)
                // console.log(`🔒 模板数据未变化: vmid=${newTemplate.vmid}（保持引用）`)
              } else {
                // 新增数据
                updatedList.push(newTemplate)
                // console.log(`➕ 新增模板: vmid=${newTemplate.vmid}, name=${newTemplate.name}`)
              }
            }
            
            // 检查是否有删除的数据
            const newVmids = new Set(newTemplates.map(t => t.vmid))
            const deletedCount = templateList.value.length - updatedList.length
            if (deletedCount > 0) {
              // console.log(`❌ 检测到 ${deletedCount} 个已删除的模板`)
            }
            
            templateList.value = updatedList
            // console.log(`🔄 智能更新完成: 总计 ${updatedList.length} 条记录 (新增/更新/删除: ${newTemplates.length - currentTemplatesMap.size}/${Object.keys(newTemplatesMap).length - currentTemplatesMap.size}/${deletedCount})`)
          }
        } else {
          console.warn('⚠️ API返回数据格式不正确:', result)
          // API返回格式不正确时设置为空数组，不显示模拟数据
          templateList.value = []
        }
      } catch (error) {
        console.warn('❌ API调用异常:', error.message)
        // 网络异常或其他错误时设置为空数组，不显示模拟数据
        templateList.value = []
      }
    }

    // 检查两个模板对象是否有数据变化
    const isDataChanged = (oldTemplate, newTemplate) => {
      // 比较关键字段是否发生变化
      return oldTemplate.name !== newTemplate.name ||
             oldTemplate.status !== newTemplate.status ||
             oldTemplate.description !== newTemplate.description ||
             oldTemplate.createTime !== newTemplate.createTime ||
             oldTemplate.updateTime !== newTemplate.updateTime
    }

    // 启动轮询
    const startPolling = () => {
      fetchTemplateList() // 立即获取一次数据
      pollingTimer = setInterval(fetchTemplateList, 5000) // 每5秒轮询一次
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

    // 组件挂载时启动轮询
    onMounted(() => {
      startPolling()
      // 添加页面可见性监听
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })

    // 组件卸载前停止轮询
    onBeforeUnmount(() => {
      stopPolling()
      // 清理页面可见性监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    // 处理单个模板删除
    const handleDeleteSingleTemplate = async (template) => {
      try {
        const vmid = template.vmid
        const templateName = template.name
        
        // 确认删除对话框
        await ElMessageBox.confirm(
          t('dialog.confirmDeleteTemplate', { name: templateName }),
          t('dialog.confirmDelete'),
          {
            confirmButtonText: t('common.ok'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
          }
        )
        
        // 调用删除接口，设置超时时间为15秒
        await axios.delete(`/vm/template/${vmid}`, { timeout: 15000 })
        // console.log(`✅ 成功删除单个模板: vmid=${vmid}, name=${templateName}`)
        ElMessage.success(t('dialog.deleteTemplateSuccess', { name: templateName }))
        
        // 删除成功后刷新列表
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
      handleDeleteSingleTemplate,
      t
    }
  }
}
</script>

<style scoped>
.templates-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
}

.template-list {
  margin-top: 20px;
}

.template-list h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .template-list {
    overflow-x: auto;
  }
  
  .el-table {
    min-width: 600px;
  }
}
</style>