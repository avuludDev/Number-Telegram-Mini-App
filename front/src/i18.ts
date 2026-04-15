import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationRU from './locales/ru/translation.json';
import translationUK from './locales/uk/translation.json';
import translationHI from './locales/hi/translation.json';

i18n
  .use(initReactI18next) // интеграция с react-i18next
  .init({
    resources: {
      en: { translation: translationEN },
      ru: { translation: translationRU },
      uk: { translation: translationUK},
      hi: { translation: translationHI},
    },
    fallbackLng: 'en',  // язык по умолчанию, если автоопределение не сработало
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
