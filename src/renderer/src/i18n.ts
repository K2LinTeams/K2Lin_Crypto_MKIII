import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import zh from './locales/zh.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: en.common,
        vault: en.vault,
        mimic: en.mimic,
        settings: en.settings,
        identity: en.identity
      },
      zh: {
        common: zh.common,
        vault: zh.vault,
        mimic: zh.mimic,
        settings: zh.settings,
        identity: zh.identity
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
