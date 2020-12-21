/**
 * Copyright (c) 2020, Diabeloop
 * Yourloops API client
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */
import i18n, { InitOptions, TFunction, Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import moment from 'moment-timezone';
import locales from '../../../locales/languages.json';
import getLocale from './browser-locale';

const crowdinActive = typeof window._jipt === 'object';

let language = getLocale();
if (self.localStorage && self.localStorage.lang) {
  language = self.localStorage.lang;

  if (typeof window.zE === 'function') {
    window.zE('webWidget', 'setLocale', language);
  }
}

const i18nOptions: InitOptions = {
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
    defaultTransParent: 'div', // a valid react element - required before react 16
    transSupportBasicHtmlNodes: true, // allow <br/> and simple html elements in translations
  },
  ns: locales.namespaces,
  defaultNS: locales.defaultNS,

  resources: locales.resources,
};


if (crowdinActive) {
  i18nOptions.fallbackLng = locales.crowdin.fallback;
  (i18nOptions.resources as Resource)[locales.crowdin.fallback] = locales.crowdin.resources;
}
i18n.use(initReactI18next);

// Update moment with the right language, for date display
i18n.on('languageChanged', (lng: string) => {
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

async function initI18n(): Promise<TFunction> {
  return i18n.init(i18nOptions);
}
const t = i18n.t.bind(i18n);

export { initI18n, t };
export default i18n;
