const webpackConf = require('./webpack.config');

webpackConf.externals = {
  'react/addons': true,
  'react/lib/ExecutionEnvironment': true,
  'react/lib/ReactContext': true,
};

webpackConf.devtool = 'inline-source-map';

webpackConf.node = {
  fs: 'empty',
  module: 'empty'
};

const isWSL = typeof process.env.WSL_DISTRO_NAME === 'string';
const browsers = ['CustomChromeHeadless'];
if (!isWSL) {
  browsers.push('FirefoxHeadless');
}

const karmaConfig = {
  autoWatch: true,
  browserNoActivityTimeout: 60000,
  browsers,
  captureTimeout: 60000,
  colors: true,
  concurrency: 1,
  coverageReporter: {
    dir: 'coverage/',
    reporters: [
      { type: 'html' },
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
    'test/index.js',
  ],
  frameworks: ['mocha'],
  logLevel: null,
  preprocessors: {
    'test/index.js': ['webpack', 'sourcemap'],
  },
  reporters: ['mocha', 'coverage'],
  singleRun: true,
  webpack: webpackConf,
  webpackMiddleware: {
    noInfo: true
  },
};

function setKarmaConfig(config) {
  karmaConfig.logLevel = config.LOG_INFO;
  config.set(karmaConfig);
}

module.exports = setKarmaConfig;