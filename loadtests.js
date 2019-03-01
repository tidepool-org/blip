require('@babel/polyfill');
require('intl/locale-data/jsonp/en.js');

const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-15');

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

const context = require.context('./test', true, /\.js$/); // Load .js files in /test
// eslint-disable-next-line lodash/prefer-lodash-method
context.keys().forEach(context);
