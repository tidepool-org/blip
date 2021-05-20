import i18next from 'i18next';
import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

window.config = {
  TEST: true,
  DEV: true,
};

// Enable bows logging display:
// window.localStorage.setItem('debug', 'true');

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

// Return key if no translation is present
i18next.init({ returnEmptyString: false, nsSeparator: '|' }).finally(() => {

  const context = require.context('./test', true, /\.js$/); // Load .js files in /test
  // eslint-disable-next-line lodash/prefer-lodash-method
  context.keys().forEach(context);
});
