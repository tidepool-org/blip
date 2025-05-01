/* global chai */

require('@babel/polyfill');
require('intl/locale-data/jsonp/en.js');
require('intl-pluralrules');

const _ = require('lodash');
const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const i18next = require('i18next');

// Should be initialized in calling module
if (_.get(i18next, 'options.returnEmptyString') === undefined) {
  // Return key if no translation is present
  i18next.init({ returnEmptyString: false, nsSeparator: '|' });
}

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

const context = require.context('./test', true, /\.test\.js$/); // Load .js files in /test
context.keys().forEach(context);
