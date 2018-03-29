require('babel-polyfill');

var context = require.context('./test', true, /\.js$/); // Load .js files in /test
context.keys().forEach(context);
