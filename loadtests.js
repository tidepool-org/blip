require('babel-polyfill');
require('intl/locale-data/jsonp/en.js');

var context = require.context('./test', true, /\.js$/); // Load .js files in /test
context.keys().forEach(context);
