
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

i18n
  .use(LanguageDetector)
  .use(reactI18nextModule)
  .init({
    fallbackLng: 'en',

    debug: true,

    interpolation: {
      escapeValue: false, // not needed for react!!
    },

    returnEmptyString: false,

    react: {
      wait: true,
      // Needed for react < 16
      defaultTransParent: 'div'
    },

    resources: {
      en: {
        // Default namespace
        translation: require('../../locales/en/translation.json')
      },
      fr: {
        // Default namespace
        translation: require('../../locales/fr/translation.json')
      }
    }
  });

export default i18n;
