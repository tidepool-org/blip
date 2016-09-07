require('babel-polyfill');

const context = require.context('./test', true, /.js$/); // Load .js files in /test
// eslint-disable-next-line
context.keys().forEach(context);
