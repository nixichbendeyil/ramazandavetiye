import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

// Get saved language or default to German
const savedLanguage = localStorage.getItem('language') || 'de';

i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: savedLanguage,
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
