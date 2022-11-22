// import Vue from 'vue'
import { createI18n } from 'vue-i18n'
import enUS from './langs/en-US'
import zhCN from './langs/zh-CN'
import zhTW from './langs/zh-TW'
import ptBR from './langs/pt-BR'
import jaJP from './langs/ja-JP'
import heIL from './langs/he-IL'
import koKR from './langs/ko-KR'
import frFR from './langs/fr-FR'

// if (!Object.prototype.hasOwnProperty.call(Vue, '$i18n'))
//   Vue.use(VueI18n)

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    'en': enUS,
    'en-US': enUS,
    'zh': zhCN,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'pt': ptBR,
    'pt-BR': ptBR,
    'ja': jaJP,
    'ja-JP': jaJP,
    'he': heIL,
    'he-IL': heIL,
    'ko': koKR,
    'ko-KR': koKR,
    'fr': frFR,
    'fr-FR': frFR,
  },
})

export default i18n
