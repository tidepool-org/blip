const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

window.config = {
  TEST: true,
  DEV: true,
};
// Enable bows logging display:
// window.localStorage.setItem('debug', 'true');

const context = require.context('./test', true, /\.js$/); // Load .js files in /test
// eslint-disable-next-line lodash/prefer-lodash-method
context.keys().forEach(context);
