var webpack = require('webpack');
var webpackConf = require('./test.config.js');

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS', 'Chrome' ],
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000, // We need to accept that Webpack may take a while to build!
    singleRun: true,
    colors: true,
    frameworks: [ 'mocha', 'sinon', 'chai' ], // Mocha is our testing framework of choice
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