/* global chai */

require('@babel/polyfill');
require('intl/locale-data/jsonp/en.js');
require('intl-pluralrules');

const _ = require('lodash');
const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const i18next = require('i18next');
const chaiDOM = require('chai-dom');

// Should be initialized in calling module
if (_.get(i18next, 'options.returnEmptyString') === undefined) {
  // Return key if no translation is present
  i18next.init({ returnEmptyString: false, nsSeparator: '|' });
}

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

chai.use(chaiDOM);

// Load RTL tests in ./__tests__'
console.log('Running RTL tests');
const rtlContext = require.context('./__tests__', true, /\.test\.js$/);
rtlContext.keys().forEach(rtlContext);

// Load Enzyme tests in './test
console.log('Running Enzyme tests');
const enzymeContext = require.context('./test', true, /\.test\.js$/);
enzymeContext.keys().forEach(enzymeContext);

