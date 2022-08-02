const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const cp = require('child_process');

const isDev = (process.env.NODE_ENV === 'development');

const VERSION = pkg.version;
const ROLLBAR_POST_CLIENT_TOKEN = '7e29ff3610ab407f826307c8f5ad386f';

const VERSION_SHA = process.env.TRAVIS_COMMIT
  || cp.execSync('git rev-parse HEAD || true', { cwd: __dirname, encoding: 'utf8' });

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
  __RX_ENABLED__: JSON.stringify(process.env.RX_ENABLED || false),
  __PENDO_ENABLED__: JSON.stringify(process.env.PENDO_ENABLED || true),
  __VERSION__: JSON.stringify(VERSION),
  __ROLLBAR_POST_CLIENT_TOKEN__: JSON.stringify(ROLLBAR_POST_CLIENT_TOKEN),
  __VERSION_SHA__: JSON.stringify(VERSION_SHA),
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
