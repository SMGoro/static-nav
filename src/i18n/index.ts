import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言文件
import enTranslation from '../locales/en.json';
import zhTranslation from '../locales/zh.json';

// 支持的语言列表
export const supportedLanguages = [
  { code: 'zh', name: '中文', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: 'English' }
];

// 默认语言
export const defaultLanguage = 'zh';

// 初始化i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      zh: {
        translation: zhTranslation
      }
    },
    lng: defaultLanguage,
    fallbackLng: 'zh',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    ns: ['translation'],
    defaultNS: 'translation',
    
    keySeparator: '.',
    
    supportedLngs: supportedLanguages.map(lang => lang.code),
    
    nonExplicitSupportedLngs: false,
    
    load: 'languageOnly',
    
    cleanCode: true,
    
    preload: supportedLanguages.map(lang => lang.code),
    
    saveMissing: process.env.NODE_ENV === 'development',
    
    missingKeyHandler: (lng: string, ns: string, key: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    }
  } as any);

export default i18n;
