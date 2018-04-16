var webpack = require('webpack');
var webpackConf = require('./test.config.js');

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS' ],
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000, // We need to accept that Webpack may take a while to build!
    singleRun: true,
    colors: true,
    client: {
      mocha: {
        timeout: 4000
      },
    },
    frameworks: [ 'mocha', 'sinon', 'chai', 'intl-shim' ], // Mocha is our testing framework of choice
    files: [
      'test/index.js'
    ],
    preprocessors: {
      'test/index.js': [ 'webpack' ] // Preprocess with webpack and our sourcemap loader
    },
    reporters: [ 'mocha' ],
    webpack: webpackConf,
    webpackServer: {
      noInfo: true // We don't want webpack output
    }
  });
};
