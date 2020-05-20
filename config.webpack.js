const path = require('path');
const webpack = require('webpack');

const isDev = (process.env.NODE_ENV === 'development');

// these values are required in the config.app.js file -- we can't use
// process.env with webpack, we have to create these magic constants
// individually.
const defineEnvPlugin = new webpack.DefinePlugin({
  __UPLOAD_API__: JSON.stringify(process.env.UPLOAD_API || null),
  __API_HOST__: JSON.stringify(process.env.API_HOST || null),
  __INVITE_KEY__: JSON.stringify(process.env.INVITE_KEY || null),
  __LATEST_TERMS__: JSON.stringify(process.env.LATEST_TERMS || null),
  __PASSWORD_MIN_LENGTH__: JSON.stringify(process.env.PASSWORD_MIN_LENGTH || null),
  __PASSWORD_MAX_LENGTH__: JSON.stringify(process.env.PASSWORD_MAX_LENGTH || null),
  __ABOUT_MAX_LENGTH__: JSON.stringify(process.env.ABOUT_MAX_LENGTH || null),
  __I18N_ENABLED__: JSON.stringify(process.env.I18N_ENABLED || false),
  __ALLOW_SIGNUP_PATIENT__: JSON.stringify(process.env.ALLOW_SIGNUP_PATIENT || true),
  __ALLOW_PATIENT_CHANGE_EMAIL__: JSON.stringify(process.env.ALLOW_PATIENT_CHANGE_EMAIL || true),
  __ALLOW_PATIENT_CHANGE_PASSWORD__: JSON.stringify(process.env.ALLOW_PATIENT_CHANGE_PASSWORD || true),
  __CAN_SEE_PWD_LOGIN__: JSON.stringify(process.env.CAN_SEE_PWD_LOGIN || true),
  __SUPPORT_EMAIL_ADDRESS__: JSON.stringify(process.env.SUPPORT_EMAIL_ADDRESS || 'support@tidepool.org'),
  __SUPPORT_WEB_ADDRESS__: JSON.stringify(process.env.SUPPORT_WEB_ADDRESS || 'http://support.tidepool.org'),
  __REGULATORY_WEB_ADDRESS__: JSON.stringify(process.env.REGULATORY_WEB_ADDRESS || ''),
  __HELP_LINK__: JSON.stringify(process.env.HELP_LINK || null),
  __ASSETS_URL__: JSON.stringify(process.env.ASSETS_URL || null),
  __HIDE_DONATE__: JSON.stringify(process.env.HIDE_DONATE || null),
  __HIDE_DEXCOM_BANNER__: JSON.stringify(process.env.HIDE_DEXCOM_BANNER || false),
  __HIDE_UPLOAD_LINK__: JSON.stringify(process.env.HIDE_UPLOAD_LINK || false),
  __BRANDING__: JSON.stringify(process.env.BRANDING || 'tidepool'),
  __METRICS_SERVICE__: JSON.stringify(process.env.METRICS_SERVICE || 'disabled'),
  __MAX_FAILED_LOGIN_ATTEMPTS__: JSON.stringify(process.env.MAX_FAILED_LOGIN_ATTEMPTS || 5),
  __DELAY_BEFORE_NEXT_LOGIN_ATTEMPT__: JSON.stringify(process.env.DELAY_BEFORE_NEXT_LOGIN_ATTEMPT || 10),
  __TERMS_PRIVACY_DATE__: JSON.stringify(process.env.TERMS_PRIVACY_DATE || ''),
  __DEV__: isDev,
  __TEST__: false,
  __DEV_TOOLS__: (process.env.DEV_TOOLS != null) ? process.env.DEV_TOOLS : (isDev ? true : false) //eslint-disable-line eqeqeq
});

module.exports = {
  entry: './config.app.js',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'config.js',
    library: 'config',
  },
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [
      { test: /\.js$/, exclude: /(node_modules)/, use: [] },
    ],
  },
  plugins: [
    defineEnvPlugin,
  ],
};
