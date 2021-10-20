import i18next from "i18next";
import enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import locales from "../../../locales/languages.json";

// Partial translation to avoid changing lot of tests
locales.resources.en.main = {
  ...locales.resources.en.main,
  abbrev_duration_day: "d", // eslint-disable-line camelcase
  abbrev_duration_hour: "h", // eslint-disable-line camelcase
  abbrev_duration_minute: "min", // eslint-disable-line camelcase
  abbrev_duration_minute_m: "m", // eslint-disable-line camelcase
  abbrev_duration_second: "s", // eslint-disable-line camelcase
};

const i18nOptions = {
  fallbackLng: locales.fallback,
  lng: "en",

  /** @type {false} To allow . in keys */
  keySeparator: false,
  // To allow : in keys
  nsSeparator: "|",

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

window.config = {
  TEST: true,
  DEV: true,
};

// Enable bows logging display:
// window.localStorage.setItem('debug', 'true');

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

// Return key if no translation is present
i18next.init(i18nOptions).finally(() => {
  const context = require.context(".", true, /\.js$/); // Load .js files in /test
  // eslint-disable-next-line lodash/prefer-lodash-method
  context.keys().forEach(context);
});
