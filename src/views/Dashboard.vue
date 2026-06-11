<template>
  <div class="dashboard-container">
    
    <div class="dashboard-content">
      <!-- 节点信息表格 -->
      <el-card class="node-info">
        <template #header>
          <div class="card-header">
            <span>{{ t('dashboard.nodeInfo') }}</span>
          </div>
        </template>
        <div class="table-container">
          <el-table :data="nodeInfo" :style="{ width: '100%' }" :border="true" fit size="default" :header-row-class-name="'full-width-header'" :row-class-name="'full-width-row'">
          <el-table-column prop="name" :label="t('dashboard.node')" min-width="80"></el-table-column>
          <el-table-column prop="ip" :label="t('dashboard.ipAddress')" min-width="120"></el-table-column>
          <el-table-column prop="pveVersion" :label="t('dashboard.pveVersion')" min-width="100"></el-table-column>
          <el-table-column prop="kernelVersion" :label="t('dashboard.kernelVersion')" min-width="120"></el-table-column>
          <el-table-column prop="processor" :label="t('dashboard.processor')" min-width="150">
          <template #default="{row}">
            <div style="white-space: pre-line;">{{ row.processor }}</div>
          </template>
        </el-table-column>
          <el-table-column prop="memory" :label="t('dashboard.memory')" width="100"></el-table-column>
          <el-table-column prop="storage" :label="t('dashboard.storage')" width="100">
          <template #default="{row}">
            <div style="white-space: pre-line;">{{ row.storage }}</div>
          </template>
        </el-table-column>
          </el-table>
        </div>
      </el-card>
      
      <!-- 节点状态表格 -->
      <el-card class="node-status">
        <template #header>
          <div class="card-header">
            <span>{{ t('dashboard.nodeStatus') }}</span>
          </div>
        </template>
        <div class="table-container">
          <el-table :data="nodeStatus" :style="{ width: '100%' }" :border="true" fit size="default" :header-row-class-name="'full-width-header'" :row-class-name="'full-width-row'">
          <el-table-column prop="uptime" :label="t('dashboard.uptime')" min-width="100"></el-table-column>
          <el-table-column prop="cpu" :label="t('dashboard.cpu')" min-width="120">
          <template #default="{row}">
            <div class="cpu-progress-container" v-if="row.cpuData">
              <div class="progress-circle">
                <div class="progress-circle-inner">
                  <div class="progress-text">{{ row.cpuData.percentage }}%</div>
                  <div class="progress-label">{{ t('dashboard.cpu') }}</div>
                </div>
                <svg class="progress-svg" width="80" height="80">
                  <circle class="progress-circle-background" cx="40" cy="40" r="30" />
                  <circle class="progress-circle-bar" cx="40" cy="40" r="30" 
                    :stroke-dasharray="row.cpuData.circleLength" 
                    :stroke-dashoffset="row.cpuData.offset" />
                </svg>
              </div>
            </div>
          </template>
        </el-table-column>
          <el-table-column prop="memory" :label="t('dashboard.memory')" min-width="120">
          <template #default="{row}">
            <div class="memory-progress-container" v-if="row.memoryData">
              <div class="progress-circle">
                <div class="progress-circle-inner">
                  <div class="progress-text">{{ row.memoryData.percentage }}%</div>
                  <div class="progress-label">{{ t('dashboard.memory') }}</div>
                </div>
                <svg class="progress-svg" width="80" height="80">
                  <circle class="progress-circle-background" cx="40" cy="40" r="30" />
                  <circle class="progress-circle-bar" cx="40" cy="40" r="30" 
                    :stroke-dasharray="row.memoryData.circleLength" 
                    :stroke-dashoffset="row.memoryData.offset" />
                </svg>
              </div>
              <div class="memory-details">{{ row.memoryData.used }} / {{ row.memoryData.total }}</div>
            </div>
          </template>
        </el-table-column>
          <el-table-column prop="swap" :label="t('dashboard.swap')" min-width="120">
          <template #default="{row}">
            <div class="swap-progress-container" v-if="row.swapData">
              <div class="progress-circle">
                <div class="progress-circle-inner">
                  <div class="progress-text">{{ row.swapData.percentage }}%</div>
                  <div class="progress-label">SWAP</div>
                </div>
                <svg class="progress-svg" width="80" height="80">
                  <circle class="progress-circle-background" cx="40" cy="40" r="30" />
                  <circle class="progress-circle-bar" cx="40" cy="40" r="30" 
                    :stroke-dasharray="row.swapData.circleLength" 
                    :stroke-dashoffset="row.swapData.offset" />
                </svg>
              </div>
              <div class="swap-details">{{ row.swapData.used }} / {{ row.swapData.total }}</div>
            </div>
          </template>
        </el-table-column>
          <el-table-column prop="loadAverage" :label="t('dashboard.loadAverage')" min-width="100">
            <template #default="{row}">
              <div v-if="row.loadavg && Array.isArray(row.loadavg)">
                <div v-for="(value, index) in row.loadavg" :key="index">
                  {{ value }}
                </div>
              </div>
              <span v-else>{{ row.loadAverage }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ioDelay" :label="t('dashboard.ioDelay')" min-width="90">
            <template #default="{row}">
              <span v-if="row.ioDelay && row.ioDelay !== t('dashboard.noData')">{{ row.ioDelay }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="storage" :label="t('dashboard.storage')" min-width="200">
          <template #default="{row}">
            <div class="storage-container" v-if="row.storageData && Array.isArray(row.storageData)">
              <div v-for="storage in row.storageData" :key="storage.storage" class="storage-progress-item">
                <div class="storage-progress-circle">
                  <div class="progress-circle-inner">
                    <div class="progress-text">{{ storage.processedData.percentage }}%</div>
                    <div class="progress-label">{{ storage.storage }}</div>
                  </div>
                  <svg class="progress-svg" width="80" height="80">
                    <circle class="progress-circle-background" cx="40" cy="40" r="30" />
                    <circle class="progress-circle-bar" cx="40" cy="40" r="30" 
                      :stroke-dasharray="storage.processedData.circleLength" 
                      :stroke-dashoffset="storage.processedData.offset"
                      :style="{ stroke: getProgressColor(storage.processedData.percentage) }" />
                  </svg>
                </div>
                <div class="storage-details">
                  <div>{{ storage.processedData.used }} / {{ storage.processedData.total }}</div>
                </div>
              </div>
            </div>
            <span v-else>{{ row.storage || t('dashboard.noData') }}</span>
          </template>
        </el-table-column>
          </el-table>
        </div>
      </el-card>

      <el-card class="dashboard-card">
        <template #header>
          <div class="card-header">
            <span>{{ t('dashboard.statistics') }}</span>
          </div>
        </template>
        <div class="table-container">
          <el-table :data="statistics" :style="{ width: '100%' }" :border="true" fit size="default" :header-row-class-name="'full-width-header'" :row-class-name="'full-width-row'">
            <el-table-column prop="template" :label="t('dashboard.template')" min-width="120"></el-table-column>
            <el-table-column prop="vm" :label="t('dashboard.vm')" min-width="100"></el-table-column>
            <el-table-column prop="vmGroup" :label="t('dashboard.vmGroup')" min-width="100"></el-table-column>
            <el-table-column prop="user" :label="t('dashboard.user')" min-width="100"></el-table-column>
            <el-table-column prop="userGroup" :label="t('dashboard.userGroup')" min-width="100"></el-table-column>
          </el-table>
        </div>
      </el-card>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

export default {
  name: 'Dashboard',
  setup() {
    const { t } = useI18n()
    
    const nodeInfo = ref([
      {
        name: '',
        ip: '',
        pveVersion: '',
        kernelVersion: '',
        processor: '',
        memory: '',
        storage: ''
      }
    ])
    
    // 节点状态数据，1行7列
    // 使用shallowRef减少响应式开销，因为内部对象频繁更新
    const nodeStatus = shallowRef([
      {
        uptime: null,
        cpu: null,
        memory: null,
        swap: null,
        loadAverage: null,
        ioDelay: null,
        storage: null
      }
    ])
    
    // 存储名称排序缓存，用于保持存储信息的排序稳定性
    const storageNameOrder = ref([])
    
    // 统计信息数据，1行5列（根据接口返回数据填写）
    const statistics = ref([
      {
        template: 0,  // templateCount，默认显示0
        vm: 0,       // vmCount，默认显示0
        vmGroup: 0,   // vmGroupCount，默认显示0
        user: 0,      // userCount，默认显示0
        userGroup: 0  // userGroupCount，默认显示0
      }
    ])
    
    // 获取统计信息
    const fetchStatistics = async () => {
      try {
        // console.log('开始调用统计信息接口(/tasks)...')
        // 使用axios调用统计信息接口
        const response = await axios.get('/tasks')
        // console.log('统计信息接口响应:', response)
        // console.log('响应数据结构:', response.data)
        
        // 尝试从不同的数据结构中提取统计信息
        let statsData = null
        
        // 尝试多种可能的数据结构
        if (response.data?.data) {
          statsData = response.data.data
        } else if (typeof response.data === 'object' && response.data !== null) {
          statsData = response.data
        }
        
        if (statsData) {
          // 尝试从不同的字段名中获取数据
          const newStats = {
            template: statsData.templateCount ?? statsData.template ?? 0,
            vm: statsData.vmCount ?? statsData.vm ?? 0,
            vmGroup: statsData.vmGroupCount ?? statsData.vmGroup ?? 0,
            user: statsData.userCount ?? statsData.user ?? 0,
            userGroup: statsData.userGroupCount ?? statsData.userGroup ?? 0
          }
          
          // 确保只有当获取到有效值时才更新，否则保持默认值
          if (newStats.template !== 0 || newStats.vm !== 0 || newStats.vmGroup !== 0 || newStats.user !== 0 || newStats.userGroup !== 0) {
            statistics.value = [newStats]
          }
        }
        // 注意：我们不再在else分支中将统计信息设置为null，而是保持默认值
      } catch (error) {
        console.error('获取统计信息失败:', error)
        if (error.response) {
          console.error('错误响应数据:', error.response.data)
          console.error('错误状态码:', error.response.status)
        }
        // 不再将统计信息设置为null，保持默认值
      }
    }
    
    // 获取节点信息
    const fetchNodeInfo = async () => {
      try {
        // 使用axios调用/system/node接口获取节点名称
        // axios的baseURL已在main.js中设置为'/api/v1'，所以实际请求路径是'/api/v1/system/node'
        const nodeResponse = await axios.get('/system/node')
        
        // console.log('节点信息响应:', nodeResponse.data)
        
        // 初始化节点信息
        const nodeData = {
          name: nodeResponse.data?.code === 0 && nodeResponse.data?.data?.node ? nodeResponse.data.data.node : 'pve',
          ip: '192.168.1.100', // 默认IP，稍后会被覆盖
          pveVersion: '7.4-17',
          kernelVersion: '5.15.108-1',
          processor: 'Intel Xeon E5-2680 v3',
          memory: '128GB',
          storage: '4TB'
        }
        
        // 调用/system/pveip接口获取IP地址
        try {
          const ipResponse = await axios.get('/system/pveip')
          // console.log('IP地址响应:', ipResponse.data)
          
          // 如果IP地址接口调用成功，使用返回的IP地址
          if (ipResponse.data?.code === 0 && ipResponse.data?.data?.pveIp) {
            nodeData.ip = ipResponse.data.data.pveIp
          }
        } catch (ipError) {
          console.error('获取IP地址失败:', ipError)
          // IP地址获取失败时保持默认值
        }
        
        // 调用/system/info接口获取系统详细信息
        try {
          const infoResponse = await axios.get('/system/info')
          // console.log('系统信息响应:', infoResponse.data)
          
          // 如果系统信息接口调用成功，更新相应字段
          if (infoResponse.data?.code === 0 && infoResponse.data?.data) {
            const infoData = infoResponse.data.data
            
            // 更新PVE版本，只提取两个//中间的版本号
            if (infoData.pveversion) {
              // 使用正则表达式提取两个//中间的版本号部分
              const versionMatch = infoData.pveversion.match(/\/(\d+\.\d+\.\d+)\//);
              nodeData.pveVersion = versionMatch && versionMatch[1] ? versionMatch[1] : infoData.pveversion;
            }
            
            // 更新核心版本，提取Linux内核版本中第二列的有效数据（6.17.2-1-pve）
            if (infoData.kversion) {
              // 针对格式"Linux 6.17.2-1-pve #1 SMP PREEMPT_DYNAMIC PMX 6.17.2-1 (2025-10-21T11:55Z)"
              // 提取第二个空格后的完整版本号（6.17.2-1-pve）
              const versionParts = infoData.kversion.split(/\s+/);
              nodeData.kernelVersion = versionParts.length > 1 ? versionParts[1] : infoData.kversion;
            }
            
            // 更新内存信息（转换为GB）
            if (infoData.memory && infoData.memory.total) {
              // 转换字节为GB（除以1024三次）
              const totalGB = (infoData.memory.total / (1024 * 1024 * 1024)).toFixed(1)
              nodeData.memory = `${totalGB}GB`
            }
            
            // 更新处理器信息（显示为3行）
            if (infoData.cpuinfo) {
              const { model, cores, cpus } = infoData.cpuinfo
              // 移除CPU型号中的频率信息，只保留型号
              const modelName = model ? model.replace(/ CPU @ .*$/, '') : t('dashboard.unknown')
              nodeData.processor = `${t('dashboard.model')}: ${modelName}\n${t('dashboard.cores')}: ${cores || t('dashboard.unknown')}\n${t('dashboard.threads')}: ${cpus || t('dashboard.unknown')}`
            }
          }
        } catch (infoError) {
          console.error('获取系统信息失败:', infoError)
          // 系统信息获取失败时保持默认值
        }
        
        // 调用/system/storage接口获取存储信息
            try {
              const storageResponse = await axios.get('/system/storage')
              // console.log('存储信息响应:', storageResponse.data)
              
              // 如果存储接口调用成功，将所有storage值合并为一个字符串显示在单个单元格内
              if (storageResponse.data?.code === 0 && Array.isArray(storageResponse.data?.data) && storageResponse.data.data.length > 0) {
                const storageData = storageResponse.data.data
                
                // 按照接口返回的原始顺序，将所有storage值合并为一个字符串，使用换行符分隔
                const storageValues = storageData.map(item => item.storage || '未知').join('\n')
                nodeData.storage = storageValues
              } else {
                // 如果没有获取到有效的存储数据，显示null
                nodeData.storage = null
              }
              
              // 设置为单行数据
              nodeInfo.value = [nodeData]
            } catch (storageError) {
              console.error('获取存储信息失败:', storageError)
              // 存储信息获取失败时显示null
              nodeData.storage = null
              nodeInfo.value = [nodeData]
            }
      } catch (error) {
        console.error('获取节点信息失败:', error)
        // 错误情况下显示null值
        nodeInfo.value = [{
          name: null,
          ip: null,
          pveVersion: null,
          kernelVersion: null,
          processor: null,
          memory: null,
          storage: null
        }]
      }
    }
    
    // 获取节点状态信息
    // 添加条件判断，只有当数据实际发生变化时才更新，减少不必要的重渲染
    const fetchNodeStatus = async () => {
      try {
        // 保存当前数据的快照，用于后续比较
        const currentData = JSON.stringify(nodeStatus.value[0])
        // 使用axios调用/system/node/status接口获取节点状态
        const response = await axios.get('/system/node/status')
        // console.log('节点状态响应:', response.data)
        
        // 检查响应是否成功
        if (response.data?.code === 0 && response.data?.data) {
          const statusData = response.data.data
          
          // 格式化运行时间（从秒转换为可读格式）
            const formatUptime = (seconds) => {
              const days = Math.floor(seconds / 86400)
              const hours = Math.floor((seconds % 86400) / 3600)
              const minutes = Math.floor((seconds % 3600) / 60)
              const secs = Math.floor(seconds % 60)
              
              let result = ''
              if (days > 0) result += `${days}${t('dashboard.dayUnit')} `
              if (hours > 0 || days > 0) result += `${hours}${t('dashboard.hourUnit')} `
              if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}${t('dashboard.minuteUnit')} `
              result += `${secs}${t('dashboard.secondUnit')}`
              return result.trim()
            }
          
          // 更新uptime字段
          nodeStatus.value[0].uptime = formatUptime(statusData.uptime)
          
          // 更新CPU字段，将小数转换为百分比格式，精确到0.01%
          if (statusData.cpu !== undefined && statusData.cpu !== null) {
            const cpuPercentage = (statusData.cpu * 100).toFixed(2)
            nodeStatus.value[0].cpu = `${cpuPercentage}%`
            
            // 计算圆形进度条参数
            const radius = 30
            const circumference = 2 * Math.PI * radius
            const offset = circumference - (cpuPercentage / 100) * circumference
            
            // 更新CPU数据
            nodeStatus.value[0].cpuData = {
              percentage: cpuPercentage,
              circleLength: circumference,
              offset: offset
            }
          }
          
          // 格式化内存大小（MB或GB）
            const formatMemory = (bytes) => {
              if (bytes >= 1024 * 1024 * 1024) {
                return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
              } else {
                return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
              }
            }
            
            // 处理内存数据
            if (statusData.memory && statusData.memory.used !== undefined && statusData.memory.total !== undefined) {
              const usedBytes = statusData.memory.used
              const totalBytes = statusData.memory.total
              
              // 计算使用率
              const percentage = ((usedBytes / totalBytes) * 100).toFixed(2)
              
              // 计算圆形进度条参数
              const radius = 30
              const circumference = 2 * Math.PI * radius
              const offset = circumference - (percentage / 100) * circumference
              
              // 更新内存数据
              nodeStatus.value[0].memoryData = {
                percentage: percentage,
                used: formatMemory(usedBytes),
                total: formatMemory(totalBytes),
                circleLength: circumference,
                offset: offset
              }
            }
          
          // 处理swap数据
            if (statusData.swap && statusData.swap.used !== undefined && statusData.swap.total !== undefined) {
              const swapUsedBytes = statusData.swap.used
              const swapTotalBytes = statusData.swap.total
              
              // 计算使用率
              const swapPercentage = ((swapUsedBytes / swapTotalBytes) * 100).toFixed(2)
              nodeStatus.value[0].swap = `${swapPercentage}%`
              
              // 格式化swap大小（MB或GB）
              const swapUsed = formatMemory(swapUsedBytes)
              const swapTotal = formatMemory(swapTotalBytes)
              
              // 计算圆形进度条参数
              const swapRadius = 30
              const swapCircumference = 2 * Math.PI * swapRadius
              const swapOffset = swapCircumference - (swapPercentage / 100) * swapCircumference
              
              // 更新swap数据
              nodeStatus.value[0].swapData = {
                percentage: swapPercentage,
                used: swapUsed,
                total: swapTotal,
                circleLength: swapCircumference,
                offset: swapOffset
              }
            }
            
            // 处理loadavg数据
            if (statusData.loadavg && Array.isArray(statusData.loadavg)) {
              // 保存原始loadavg数组，用于后续模板中换行显示
              nodeStatus.value[0].loadavg = statusData.loadavg;
              // 为了兼容当前表格显示，暂时使用第一个值作为初始显示
              nodeStatus.value[0].loadAverage = statusData.loadavg[0];
            }
            
            // 处理wait数据作为IO延迟
            if (statusData.wait !== undefined) {
              // 将wait值转换为百分比并精确到0.01%（乘以100后保留两位小数）
              const ioDelayPercentage = (statusData.wait * 100).toFixed(2);
              nodeStatus.value[0].ioDelay = `${ioDelayPercentage}%`;
            }
            
            // 获取存储状态数据
            try {
              const storageResponse = await axios.get('/system/storage/usage');
              // console.log('存储状态响应:', storageResponse.data);
              
              // 如果存储状态接口调用成功，保存数据
              if (storageResponse.data?.code === 0 && Array.isArray(storageResponse.data?.data)) {
                // 保存原始数据
                const storageData = storageResponse.data.data;
                
                // 处理存储数据，计算使用率并准备圆形进度图数据
                storageData.forEach(storage => {
                  const used = storage.info.used;
                  const total = storage.info.total;
                  
                  // 计算使用率
                  const percentage = total > 0 ? ((used / total) * 100).toFixed(2) : '0';
                  
                  // 格式化存储大小（转换为GB或TB）
                  const formatStorage = (bytes) => {
                    if (bytes >= 1024 * 1024 * 1024 * 1024) {
                      return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
                    } else {
                      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
                    }
                  };
                  
                  // 计算圆形进度条参数
                  const radius = 30;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference - (percentage / 100) * circumference;
                  
                  // 添加处理后的数据
                  storage.processedData = {
                    percentage: percentage,
                    used: formatStorage(used),
                    total: formatStorage(total),
                    circleLength: circumference,
                    offset: offset
                  };
                });
                
                // 如果是首次加载，保存存储名称的排序顺序
                if (storageNameOrder.value.length === 0) {
                  storageNameOrder.value = storageData.map(item => item.storage);
                }
                
                // 根据缓存的排序顺序重新排列存储数据
                const sortedStorageData = [...storageData].sort((a, b) => {
                  const indexA = storageNameOrder.value.indexOf(a.storage);
                  const indexB = storageNameOrder.value.indexOf(b.storage);
                  
                  // 如果两个存储名称都在缓存中，按照缓存顺序
                  if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                  }
                  // 如果一个在缓存中，一个不在，则缓存中的排在前面
                  if (indexA !== -1) return -1;
                  if (indexB !== -1) return 1;
                  // 如果都不在缓存中，则按名称字母顺序排列
                  return a.storage.localeCompare(b.storage);
                });
                
                // 保存处理后的数据
            nodeStatus.value[0].storageData = sortedStorageData;
          }
        } catch (storageError) {
          console.error('获取存储状态失败:', storageError);
        }
        
        // 比较更新前后的数据，只有当数据实际发生变化时才更新，减少不必要的重渲染
        const newData = JSON.stringify(nodeStatus.value[0]);
        if (newData !== currentData) {
          // 数据发生变化，创建新对象触发更新，避免深层比较
          nodeStatus.value = [{ ...nodeStatus.value[0] }];
        }
      }
    } catch (error) {
        console.error('获取节点状态失败:', error)
        // 错误情况下将所有字段设置为null，防止渲染错误
        nodeStatus.value = [{
          uptime: null,
          cpu: null,
          memory: null,
          swap: null,
          loadAverage: null,
          ioDelay: null,
          storage: null,
          cpuData: null,
          memoryData: null,
          swapData: null,
          loadavg: null,
          storageData: null
        }]
      }
    }
    
    // 定时器引用
    let nodeStatusTimer = null
    let statisticsTimer = null
    
    // 页面可见性处理函数
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面不可见时，停止所有定时器
        if (nodeStatusTimer) {
          clearInterval(nodeStatusTimer)
          nodeStatusTimer = null
        }
        if (statisticsTimer) {
          clearInterval(statisticsTimer)
          statisticsTimer = null
        }
      } else {
        // 页面可见时，重新启动定时器
        if (!nodeStatusTimer) {
          fetchNodeStatus()
          nodeStatusTimer = setInterval(fetchNodeStatus, 5000)
        }
        if (!statisticsTimer) {
          fetchStatistics()
          statisticsTimer = setInterval(fetchStatistics, 10000)
        }
      }
    }
    
    // 添加防抖函数，用于减少窗口调整时的重渲染
    const debounce = (func, wait) => {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }
    
    // 声明handleResize变量以便在不同钩子函数间共享
      let handleResize = null
      
      onMounted(() => {
        // 节点信息只刷新一次
        fetchNodeInfo()
        
        // 初始加载节点状态
        fetchNodeStatus()
        // 降低刷新频率，从2秒改为5秒，减少重渲染压力
        nodeStatusTimer = setInterval(fetchNodeStatus, 5000)
        
        // 初始加载统计信息
        fetchStatistics()
        // 改为统计信息10秒刷新一次
        statisticsTimer = setInterval(fetchStatistics, 10000)
        
        // 添加窗口调整事件监听，使用防抖优化
        handleResize = debounce(() => {
          // 窗口大小调整时可以添加适当的优化措施
          // 例如重新计算布局或重新渲染必要的组件
        }, 300)
        
        window.addEventListener('resize', handleResize)
        
        // 添加页面可见性监听
        document.addEventListener('visibilitychange', handleVisibilityChange)
      })
    
    onBeforeUnmount(() => {
      // 清理定时器，防止内存泄漏
      if (nodeStatusTimer) {
        clearInterval(nodeStatusTimer)
      }
      if (statisticsTimer) {
        clearInterval(statisticsTimer)
      }
      // 清理窗口调整事件监听器
      window.removeEventListener('resize', handleResize)
      // 清理页面可见性监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
    
    // 根据百分比获取进度条颜色
    const getProgressColor = (percentage) => {
      const value = parseFloat(percentage)
      if (value < 60) return '#67c23a' // 绿色
      if (value < 80) return '#e6a23c' // 黄色
      return '#f56c6c' // 红色
    }
    
    return {
      t,
      nodeInfo,
      nodeStatus,
      statistics,
      getProgressColor
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  width: 100%;
  max-width: none;
  box-sizing: border-box;
  margin: 0;
  overflow: visible;
}

.dashboard-content {
  margin: 0;
  width: 100%;
  max-width: none;
  box-sizing: border-box;
}

.node-info,
.node-status {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: none;
  box-sizing: border-box;
  min-width: 0; /* 允许内容收缩 */
}

/* 表格容器样式，添加水平滚动 */
.table-container {
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch; /* 优化移动端滚动体验 */
  display: flex;
  flex-direction: column;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
}

.table-container::-webkit-scrollbar {
  height: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .dashboard-content {
    max-width: 1600px;
    margin: 0 auto;
  }
  
  .el-table {
    width: 100% !important;
    table-layout: auto !important;
  }
  
  .el-table__header-wrapper,
  .el-table__body-wrapper {
    width: 100%;
    overflow-x: visible;
  }
}

/* 表格行全宽样式 */
.dashboard-content :deep(.full-width-header),
.dashboard-content :deep(.full-width-row) {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
}

/* 强制表格头和表格体宽度为100% */
.dashboard-content :deep(.el-table__header-wrapper),
.dashboard-content :deep(.el-table__body-wrapper) {
  width: 100% !important;
  min-width: 100% !important;
  overflow-x: hidden !important;
}

/* 强制表格元素宽度为100% */
.dashboard-content :deep(.el-table__header),
.dashboard-content :deep(.el-table__body) {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: auto !important;
}

/* 覆盖固定宽度设置 */
.dashboard-content :deep(.el-table--layout-fixed) {
  table-layout: auto !important;
  width: 100% !important;
}

/* 中等屏幕优化 */
@media (min-width: 769px) and (max-width: 1199px) {
  .dashboard-content {
    max-width: none;
  }
  
  .el-table {
    width: 100% !important;
  }
}

/* 小屏幕优化 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  /* 在小屏幕上优化存储容器显示 */
  .storage-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .storage-progress-item {
    flex: 0 0 calc(50% - 4px); /* 在小屏幕上每行显示两个 */
  }
  
  /* 减小小屏幕上的进度圈大小 */
  .storage-progress-circle,
  .progress-circle {
    width: 60px;
    height: 60px;
  }
  
  .progress-svg {
    width: 60px;
    height: 60px;
  }
  
  .progress-circle-bar,
  .progress-circle-background {
    stroke-width: 3;
  }
  
  .progress-text {
    font-size: 12px;
  }
  
  .progress-label {
    font-size: 10px;
  }
  
  .storage-details,
  .memory-details,
  .swap-details {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  /* 在更小的屏幕上每行显示一个存储项 */
  .storage-progress-item {
    flex: 0 0 100%;
  }
  
  /* 进一步减小进度圈大小 */
  .storage-progress-circle,
  .progress-circle {
    width: 50px;
    height: 50px;
  }
  
  .progress-svg {
    width: 50px;
    height: 50px;
  }
}

/* 进度图样式 */
.memory-progress-container, .cpu-progress-container, .swap-progress-container {
  display: flex;
  flex-direction: column;
}

/* 存储进度图样式 */
.storage-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.storage-progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.storage-progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
  /* 限制最大尺寸以避免在大屏幕下过大 */
  max-width: 80px;
  max-height: 80px;
}

.progress-svg {
  position: absolute;
  top: 0;
  left: 0;
  /* 合并transform属性，添加硬件加速 */
  transform: translateZ(0) rotate(-90deg);
  will-change: transform;
}

.progress-circle-background {
  fill: none;
  stroke: #e6e6e6;
  stroke-width: 6;
}

.progress-circle-bar {
  fill: none;
  stroke-width: 6;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-circle-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-text {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.progress-label {
  font-size: 12px;
  color: #606266;
  margin-top: 2px;
}

.storage-details {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
  /* 限制最大尺寸以避免在大屏幕下过大 */
  max-width: 80px;
  max-height: 80px;
}

.progress-circle-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.progress-label {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.progress-svg {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
}

.progress-circle-background {
  fill: transparent;
  stroke: #e4e7ed;
  stroke-width: 4;
}

.progress-circle-bar {
  fill: transparent;
  stroke: #409eff;
  stroke-width: 4;
  stroke-linecap: round;
}

.memory-details,
.swap-details {
  font-size: 11px;
  color: #606266;
  margin-top: 5px;
}
</style>