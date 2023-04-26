const webpack = require('webpack');
const _ = require('lodash');
const optional = require('optional');

const webpackConf = require('./webpack.config.js');
const mochaConf = optional('./config/mocha.opts.json') || { timeout: 4000 };

const watch = process.env.npm_lifecycle_script.indexOf('--no-single-run') !== -1;
const testWebpackConf = _.assign({}, webpackConf, {
  devtool: watch ? false : 'inline-cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: false,
      __TEST__: true,
      __PROD__: false,
      __I18N_ENABLED__: 'false',
    }),
  ],
});

delete testWebpackConf.devServer;

testWebpackConf.output = {
  filename: '[name]',
};

testWebpackConf.mode = 'development';

module.exports = function karmaConfig(config) {
  const defaultConfig = {
    autoWatch: true,
    browserNoActivityTimeout: 60000,
    browsers: ['CustomChromeHeadless'],
    captureTimeout: 60000,
    client: {
      mocha: mochaConf,
    },
    colors: true,
    concurrency: Infinity,
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html' },
        { type: 'text' },
      ],
    },
    customLaunchers: {
      CustomChromeHeadless: {
        base: 'ChromeHeadless',
        flags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--remote-debugging-port=9222',
        ],
      },
    },
    files: [
      'loadtests.js',
    ],
    frameworks: ['mocha', 'chai', 'sinon', 'intl-shim'],
    logLevel: config.LOG_INFO,
    preprocessors: {
      'loadtests.js': ['webpack', 'sourcemap'],
    },
    reporters: ['mocha', 'coverage'],
    singleRun: true,
    mochaReporter: {
        showDiff: true,
    },
    webpack: testWebpackConf,
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only',
    },
  };
  if(watch){ //remove test coverage for test-watch
    delete defaultConfig.coverageReporter;
    defaultConfig.reporters = ['mocha'];
  }
  config.set(defaultConfig);
};
