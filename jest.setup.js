/* global jest */

// Add any global setup for Jest tests here
import 'core-js/stable';

// Setup Intl polyfill
global.IntlPolyfill = require('intl');
require('intl/locale-data/jsonp/en.js');
require('intl-pluralrules');

// Setup Jest DOM matchers
require('@testing-library/jest-dom');

global.chai = require('chai');
global.sinon = require('sinon');
global.before = beforeAll;
global.after = afterAll;
global.context = describe;

// Define global variables that might be expected in tests
global.__DEV__ = true;
global.__TEST__ = true;
global.__PROD__ = false;
global.__I18N_ENABLED__ = 'false';
global.__DEV_TOOLS__ = false;

if (!global.URL) {
	global.URL = require('url').URL;
}

if (!global.URL.createObjectURL) {
	global.URL.createObjectURL = () => 'blob:test-url';
}

if (!console.save) {
	console.save = () => {};
}

if (!global.Worker) {
	global.Worker = class Worker {
		constructor() {}
		postMessage() {}
		terminate() {}
		addEventListener() {}
		removeEventListener() {}
	};
}

// Prevent computing of styles for faster test execution
// https://web.archive.org/web/20250216081109/https://www.helpscout.com/blog/improve-react-testing-times/
window.getComputedStyle = () => ({ getPropertyValue: () => undefined });

if (!window.scrollTo) {
	window.scrollTo = () => {};
}
