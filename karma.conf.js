const _ = require('lodash');
const optional = require('optional');
const webpackConf = require('./webpack.config.js');
const mochaConf = optional('./config/mocha.opts.json') || {};
const testWebpackConf = _.assign({}, webpackConf);
delete testWebpackConf.devServer;

testWebpackConf.output = {
  filename: '[name]',
};

testWebpackConf.mode = 'development';

module.exports = function karmaConfig(config) {
  config.set({
    browserNoActivityTimeout: 60000,
    browsers: ['ChromeHeadless'],
    captureTimeout: 60000,
    client: {
      mocha: mochaConf,
    },
    colors: true,
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html' },
        { type: 'text' },
      ],
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
    webpack: testWebpackConf,
    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only',
    },
  });
};
