<template>
  <div class="docs-container">
    <div class="docs-header">
      <h2>{{ t('menu.docs') }}</h2>
      <p>OpenDesk 文档手册</p>
    </div>
    
    <el-card class="docs-card">
      <div class="docs-content">
        <h3>概述</h3>
        <p>OpenDesk 是一个专业的虚拟桌面管理解决方案，提供虚拟机创建、管理、监控等功能。</p>
        
        <h3 style="margin-top: 20px;">功能模块</h3>
        <ul>
          <li><strong>{{ t('menu.dashboard') }}：</strong>系统概览和关键指标展示</li>
          <li><strong>{{ t('menu.templates') }}：</strong>虚拟机模板管理</li>
          <li><strong>{{ t('menu.vmlist') }}：</strong>虚拟机列表和操作</li>
          <li><strong>{{ t('menu.users') }}：</strong>用户管理和权限设置</li>
          <li><strong>{{ t('menu.settings') }}：</strong>系统配置和参数设置</li>
          <li><strong>{{ t('menu.logs') }}：</strong>系统日志和事件记录</li>
        </ul>
        
        <h3 style="margin-top: 20px;">使用指南</h3>
        <p>详细的使用文档正在编写中，敬请期待。</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'Docs',
  setup() {
    const { t } = useI18n()
    
    return {
      t
    }
  }
}
</script>

<style scoped>
.docs-container {
  padding: 20px;
}

.docs-header {
  margin-bottom: 20px;
}

.docs-header h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.docs-header p {
  margin: 0;
  color: #666;
}

.docs-card {
  width: 100%;
}

.docs-content {
  line-height: 1.6;
}

.docs-content h3 {
  color: #333;
  margin-bottom: 10px;
}

.docs-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.docs-content li {
  margin-bottom: 5px;
}
</style>