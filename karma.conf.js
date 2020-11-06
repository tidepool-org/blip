const _ = require('lodash');
const optional = require('optional');

const webpackConf = require('./webpack.config.js');
const mochaConf = optional('./config/mocha.opts.json') || {};

const testWebpackConf = _.assign({}, webpackConf, {
  devtool: 'inline-source-map',
});

const isWSL = typeof process.env.WSL_DISTRO_NAME === 'string';
const browsers = ['CustomChromeHeadless'];
if (!isWSL) {
  browsers.push('FirefoxHeadless');
}
const karmaConfig = {
  autoWatch: false,
  port: '8080',
  browserNoActivityTimeout: 60000,
  browsers,
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
    'test/run-tests.js',
  ],
  frameworks: ['mocha', 'chai', 'sinon'],
  preprocessors: {
    'test/run-tests.js': ['webpack', 'sourcemap'],
  },
  reporters: ['mocha', 'coverage'],
  singleRun: true,
  webpack: testWebpackConf,
  webpackMiddleware: {
    noInfo: true,
    stats: 'errors-only',
  },
};

function setKarmaConfig(config) {
  karmaConfig.logLevel = config.LOG_INFO;
  config.set(karmaConfig);
}

module.exports = setKarmaConfig;
