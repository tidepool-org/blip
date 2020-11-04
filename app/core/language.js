/* eslint-disable lodash/prefer-lodash-typecheck */
// @ts-nocheck
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import getLocale from 'browser-locale';
import moment from 'moment';
import locales from '../../locales/languages.json';

const crowdinActive = typeof _jipt === 'object';

let language = getLocale();
if (self.localStorage && self.localStorage.lang) {
  language = self.localStorage.lang;

  if (typeof window.zE === 'function') {
    window.zE('webWidget', 'setLocale', language);
  }
}

const i18nOptions = {
  fallbackLng: locales.fallback,
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
  ns: locales.namespaces,
  defaultNS: locales.defaultNS,

  resources: locales.resources,
};

i18n.use(reactI18nextModule);

if (crowdinActive) {
  i18nOptions.fallbackLng = locales.crowdin.fallback;
  i18nOptions.resources[locales.crowdin.fallback] = locales.crowdin.resources;
}

// Update moment with the right language, for date display
i18n.on('languageChanged', (lng) => {
  // FIXME Only perform the update when the locale really changed.
  // For some reason, it is call a lots of times
  if (typeof lng === 'string' && language !== lng) {
    language = lng;

    // FIXME: Get currently use Crowdin language, when Crowdin is active.
    moment.locale(lng);

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

export { i18nOptions };
export default i18n;
