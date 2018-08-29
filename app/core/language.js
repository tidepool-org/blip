
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import getLocale from 'browser-locale';
import moment from 'moment';

// Update moment with the right language, for date display
i18n.on('languageChanged', lng => {
  moment.locale(lng);
  if (self.localStorage) {
    self.localStorage.lang = lng;
  }
});

let defaultLanguage = getLocale();
if (self.localStorage && self.localStorage.lang) {
  defaultLanguage = self.localStorage.lang;
}

i18n
  .use(reactI18nextModule)
  .init({
    fallbackLng: 'en',
    lng: defaultLanguage,

    // To allow . in keys
    keySeparator: false,
    // To allow : in keys
    nsSeparator: '|',

    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react!!
    },

    // If the translation is empty, return the key instead
    returnEmptyString: false,

    react: {
      wait: true,
      withRef: true,
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
