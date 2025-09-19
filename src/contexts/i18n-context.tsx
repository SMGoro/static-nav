import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, defaultLanguage } from '../i18n';

// 语言上下文类型
interface I18nContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  supportedLanguages: typeof supportedLanguages;
  t: (key: string, options?: any) => string;
  i18n: any;
}

// 创建语言上下文
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 语言提供者组件
interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>(defaultLanguage);

  // 初始化语言
  useEffect(() => {
    if (!i18n.isInitialized) {
      // 等待i18n初始化完成
      const initializeLanguage = () => {
        const savedLanguage = localStorage.getItem('i18nextLng');
        if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
          setCurrentLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        } else {
          setCurrentLanguage(defaultLanguage);
          i18n.changeLanguage(defaultLanguage);
        }
      };

      i18n.on('initialized', initializeLanguage);
      
      // 如果已经初始化，直接执行
      if (i18n.isInitialized) {
        initializeLanguage();
      }

      return () => {
        i18n.off('initialized', initializeLanguage);
      };
    } else {
      // i18n已经初始化，直接设置语言
      const savedLanguage = localStorage.getItem('i18nextLng');
      if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      } else {
        setCurrentLanguage(defaultLanguage);
        i18n.changeLanguage(defaultLanguage);
      }
    }
  }, [i18n]);

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // 切换语言函数
  const setLanguage = (language: string) => {
    if (supportedLanguages.some(lang => lang.code === language)) {
      i18n.changeLanguage(language).then(() => {
        setCurrentLanguage(language);
        localStorage.setItem('i18nextLng', language);
      }).catch((error) => {
        console.error('Failed to change language:', error);
      });
    }
  };

  const contextValue: I18nContextType = {
    currentLanguage,
    setLanguage,
    supportedLanguages,
    t,
    i18n
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// 使用语言上下文的Hook
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// 简化的翻译Hook
export const useAppTranslation = () => {
  const { t, i18n } = useI18n();
  return { t, i18n };
};
