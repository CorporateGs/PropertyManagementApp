
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Check for saved language preference or browser language
    const savedLanguage = localStorage.getItem('language') as Language;
    const browserLanguage = navigator.language.split('-')[0] as Language;
    
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    } else if (translations[browserLanguage]) {
      setLanguage(browserLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const translate = (key: string): string => {
    const keys = key.split('.');
    let translation: any = translations[language];
    
    for (const k of keys) {
      translation = translation?.[k];
    }
    
    // Fallback to English if translation not found
    if (translation === undefined) {
      translation = translations.en;
      for (const k of keys) {
        translation = translation?.[k];
      }
    }
    
    return translation || key;
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t: translate
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

