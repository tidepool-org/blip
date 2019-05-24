var webpackConf = require('./test.config.js');

module.exports = function (config) {
  config.set({
    autoWatch: true,
    browserNoActivityTimeout: 60000,
    browsers: ['CustomChromeHeadless'],
    captureTimeout: 60000,
    client: {
      mocha: {
        timeout: 4000
      },
    },
    colors: true,
    concurrency: Infinity,
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
      'test/index.js'
    ],
    frameworks: [ 'mocha', 'sinon', 'chai', 'intl-shim' ],
    logLevel: config.LOG_INFO,
    preprocessors: {
      'test/index.js': [ 'webpack' ] // Preprocess with webpack and our sourcemap loader
    },
    reporters: [ 'mocha' ],
    singleRun: true,
    webpack: webpackConf,
    webpackMiddleware: {
      noInfo: true // We don't want webpack output
    }
  });
};
