<template>
  <div class="language-switcher">
    <el-dropdown trigger="click" @command="handleLanguageChange">
      <span class="language-text">{{ currentLanguageText }}</span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
          <el-dropdown-item command="zh-TW">繁體中文</el-dropdown-item>
          <el-dropdown-item command="en">English</el-dropdown-item>
          <el-dropdown-item command="ja">日本語</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'LanguageSwitcher',
  setup() {
    const { locale } = useI18n()
    
    // 当前语言显示文本
    const currentLanguageText = computed(() => {
      const langMap = {
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        en: 'English',
        ja: '日本語'
      }
      return langMap[locale.value] || langMap['zh-CN']
    })
    
    // 处理语言切换
    const handleLanguageChange = (lang) => {
      locale.value = lang
      // 保存到localStorage以便下次使用
      localStorage.setItem('app-language', lang)
    }
    
    return {
      locale,
      currentLanguageText,
      handleLanguageChange
    }
  }
}
</script>

<style scoped>
.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1001;
}

.language-text {
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: background-color 0.3s;
}

.language-text:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>