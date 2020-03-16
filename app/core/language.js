
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import getLocale from 'browser-locale';
import moment from 'moment';
import mainEN from '../../locales/en/translation.json';
import parameterEN from '../../locales/en/parameter.json';
import mainFR from '../../locales/fr/translation.json';
import parameterFR from '../../locales/fr/parameter.json';
import mainDE from '../../locales/de/translation.json';
import parameterDE from '../../locales/de/parameter.json';

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
    nsSeparator: ':::',

    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react!!
    },

    // If the translation is empty, return the key instead
    returnEmptyString: false,

    react: {
      wait: true,
      withRef: true,
      defaultTransParent: 'div', // a valid react element - required before react 16
      transSupportBasicHtmlNodes: true, // allow <br/> and simple html elements in translations
    },
    ns: ['main', 'params'],
    defaultNS: 'main',

    resources: {
      en: {
        // Default namespace
        main: mainEN,
        params: parameterEN
      },
      fr: {
        main: mainFR,
        params: parameterFR
      },
      de: {
        main: mainDE,
        params: parameterDE
      }
    }
  });

export default i18n;
