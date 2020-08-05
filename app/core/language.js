
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import getLocale from 'browser-locale';
import moment from 'moment';

/* global __I18N_ENABLED__ */

const I18N_ENABLED = __I18N_ENABLED__ === 'true';

// Update moment with the right language, for date display
i18n.on('languageChanged', lng => {
  moment.locale(lng);
  if (I18N_ENABLED && self.localStorage) {
    self.localStorage.lang = lng;
  }
});

let defaultLanguage = I18N_ENABLED ? getLocale() : 'en';
if (I18N_ENABLED && self.localStorage && self.localStorage.lang) {
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
      },
      es: {
        // Default namespace
        translation: require('../../locales/es/translation.json')
      }
    }
  });

export default i18n;
