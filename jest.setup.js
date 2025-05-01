/* global jest */

// Add any global setup for Jest tests here
require('@babel/polyfill');

// Setup Intl polyfill
global.IntlPolyfill = require('intl');
require('intl/locale-data/jsonp/en.js');
require('intl-pluralrules');

// Setup Jest DOM matchers
require('@testing-library/jest-dom');

// Mock window.config for tests
if (window.config === undefined) {
  window.config = {};
}

// Define global variables that might be expected in tests
global.__DEV__ = false;
global.__TEST__ = true;
global.__PROD__ = false;
global.__I18N_ENABLED__ = 'false';
global.__DEV_TOOLS__ = false;
