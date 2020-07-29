
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import getLocale from 'browser-locale';
import moment from 'moment';
import parameterEN from '../../locales/en/parameter.json';
import mainCrowdin from '../../locales/co/translation.json';
import languages from '../../locales/languages.json'

const crowdinActive = typeof _jipt === 'object';

let language = getLocale();
if (self.localStorage && self.localStorage.lang) {
  language = self.localStorage.lang;

  if (typeof window.zE === 'function') {
    window.zE('webWidget', 'setLocale', language);
  }
}

const resources = {};
if (languages) {
  languages.forEach( (lang) => {
    resources[lang.value] = {
      main: require(`../../locales/${lang.value}/translation.json`),
      params: require(`../../locales/${lang.value}/parameter.json`)
    };
  })
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

  resources: resources
}


i18n.use(reactI18nextModule);

if (crowdinActive) {
  i18nOptions.fallbackLng = 'co';
  i18nOptions.resources.co = {
    main: mainCrowdin,
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
    if (crowdinActive && lng === 'co') {
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
