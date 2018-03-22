
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

i18n
  .use(LanguageDetector)
  .use(reactI18nextModule)
  .init({
    fallbackLng: 'en',

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    debug: true,

    interpolation: {
      escapeValue: false, // not needed for react!!
    },

    react: {
      wait: true,
      // Needed for react < 16
      defaultTransParent: 'div'
    },

    resources: {
      en: {
        translations: require('../../translations/json/en.json')
      },
      fr: {
        translations: require('../../translations/json/fr.json')
      }
    }
  });

export default i18n;
