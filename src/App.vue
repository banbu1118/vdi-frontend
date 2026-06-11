<template>
  <router-view />
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

// 设置页面标题
const setPageTitle = () => {
  document.title = 'OpenDesk'
}

// 监听语言变化
watch(locale, () => {
  setPageTitle()
})

// 组件挂载时设置标题
onMounted(() => {
  setPageTitle()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
