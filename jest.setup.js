/* global jest */

// Add any global setup for Jest tests here
require('@babel/polyfill');

// Setup Intl polyfill
global.IntlPolyfill = require('intl');
require('intl/locale-data/jsonp/en.js');
require('intl-pluralrules');

// Setup Enzyme
const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    hash: '',
    host: 'localhost',
    hostname: 'localhost',
    href: 'http://localhost/',
    origin: 'http://localhost',
    pathname: '/',
    port: '',
    protocol: 'http:',
    search: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
});
