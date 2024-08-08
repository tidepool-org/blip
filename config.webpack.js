const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const cp = require('child_process');
const optional = require('optional');
const _ = require('lodash');

const isDev = (process.env.NODE_ENV === 'development');
const apiHost = _.get(optional('./config/local'), 'apiHost', process.env.API_HOST || null);
const uploadApi = _.get(optional('./config/local'), 'uploadApi', process.env.UPLOAD_API || null);
const VERSION = pkg.version;
const ROLLBAR_POST_CLIENT_TOKEN = '6158068d70fd485ba03e72ce5ffb8998';

const VERSION_SHA = process.env.TRAVIS_COMMIT
  || cp.execSync('git rev-parse HEAD || true', { cwd: __dirname, encoding: 'utf8' });


// these values are required in the config.app.js file -- we can't use
// process.env with webpack, we have to create these magic constants
// individually.
const defineEnvPlugin = new webpack.DefinePlugin({
  __UPLOAD_API__: JSON.stringify(uploadApi),
  __API_HOST__: JSON.stringify(apiHost),
  __INVITE_KEY__: JSON.stringify(process.env.INVITE_KEY || null),
  __LATEST_TERMS__: JSON.stringify(process.env.LATEST_TERMS || null),
  __PASSWORD_MIN_LENGTH__: JSON.stringify(process.env.PASSWORD_MIN_LENGTH || null),
  __PASSWORD_MAX_LENGTH__: JSON.stringify(process.env.PASSWORD_MAX_LENGTH || null),
  __ABOUT_MAX_LENGTH__: JSON.stringify(process.env.ABOUT_MAX_LENGTH || null),
  __I18N_ENABLED__: JSON.stringify(process.env.I18N_ENABLED || false),
  __PENDO_ENABLED__: JSON.stringify(process.env.PENDO_ENABLED || true),
  __VERSION__: JSON.stringify(VERSION),
  __ROLLBAR_POST_CLIENT_TOKEN__: JSON.stringify(ROLLBAR_POST_CLIENT_TOKEN),
  __LAUNCHDARKLY_CLIENT_TOKEN__: JSON.stringify(process.env.LAUNCHDARKLY_CLIENT_TOKEN),
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
