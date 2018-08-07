require('babel-polyfill');
require('intl/locale-data/jsonp/en.js');

// eslint-disable-next-line no-var,vars-on-top
var context = require.context('./test', true, /.js$/); // Load .js files in /test
// eslint-disable-next-line lodash/prefer-lodash-method
context.keys().forEach(context);
