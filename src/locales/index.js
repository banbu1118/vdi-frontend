import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.js'
import zhTW from './zh-TW.js'
import en from './en.js'
import ja from './ja.js'

const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en: en,
  ja: ja
}

// 从localStorage读取保存的语言设置，默认为en
const savedLanguage = localStorage.getItem('app-language') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages
})

export default i18n