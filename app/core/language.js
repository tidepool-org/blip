
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
import mainIT from '../../locales/it/translation.json';

const crowdinActive = typeof _jipt === 'object';

let language = getLocale();
if (self.localStorage && self.localStorage.lang) {
  language = self.localStorage.lang;

  if (typeof window.zE === 'function') {
    window.zE('webWidget', 'setLocale', language);
  }
}

const i18nOptions = {
  fallbackLng: 'en',
  lng: language,

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
    }
  }
}


i18n.use(reactI18nextModule);

if (crowdinActive) {
  i18nOptions.fallbackLng = 'it';
  i18nOptions.resources.it = {
    main: mainIT,
    params: parameterEN
  }

}

// Update moment with the right language, for date display
i18n.on('languageChanged', (lng) => {
  // FIXME Only perform the update when the locale really changed.
  // For some reason, it is call a lots of times
  if (typeof lng === 'string' && language !== lng) {
    language = lng;

    // Update moment locale, but if crowdin is enabled then force 'en'
    if (crowdinActive && lng === 'it') {
      moment.locale('en');
    } else {
      moment.locale(lng);
    }

    // Zendesk locale
    if (typeof window.zE === 'function') {
      window.zE('webWidget', 'setLocale', language);
    }

    // Save locale for future load
    if (self.localStorage) {
      self.localStorage.lang = lng;
    }
  }
});

i18n.init(i18nOptions);

export default i18n;
