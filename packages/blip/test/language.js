
import i18next from 'i18next';
import moment from 'moment-timezone';
import { initReactI18next } from 'react-i18next';
import { expect } from 'chai';
import locales from '../../../locales/languages.json';

describe('i18next', () => {
  before(async () => {
    moment.locale('en');
    const i18nOptions = {
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
        transSupportBasicHtmlNodes: true, // allow <br/> and simple html elements in translations
      },
      ns: locales.namespaces,
      defaultNS: locales.defaultNS,

      resources: locales.resources,
    };

    i18next.use(initReactI18next);
    await i18next.init(i18nOptions);
  });

  it('should be initialized', () => {
    expect(i18next.isInitialized).to.be.true;
  });
});
