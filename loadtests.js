require('babel-polyfill');

const context = require.context('./test', true, /PrintView\.test\.js$/); // Load .js files in /test
// eslint-disable-next-line lodash/prefer-lodash-method
context.keys().forEach(context);
