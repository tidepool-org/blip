
import i18next from 'i18next';
import moment from 'moment-timezone';
import { initReactI18next } from 'react-i18next';
import locales from '../../../../locales/languages.json';
import config from '../config';

let i18nOptions;
if (config.TEST) {
  console.info('Init i18next for unit tests');
  moment.locale('en');
  i18nOptions = {
    fallbackLng: locales.fallback,
    lng: 'en',

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
      defaultTransParent: 'div', // a valid react element - required before react 16 - kept for now (used)
      transSupportBasicHtmlNodes: true, // allow <br/> and simple html elements in translations
    },
    ns: locales.namespaces,
    defaultNS: locales.defaultNS,

    resources: locales.resources,
  };
  i18next.use(initReactI18next);
  i18next.init(i18nOptions);
} else {
  i18nOptions = i18next.options;
}

export { i18nOptions };
export default i18next;
