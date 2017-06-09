var webpackConf = require('./test.config.js');
var optional = require('optional');
var mochaConf = optional('./config/mocha.opts.json') || {};

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS' ], // Use PhantomJS for now (@gordyd - I'm using a VM)
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000, // We need to accept that Webpack may take a while to build!
    singleRun: true,
    client: {
      mocha: mochaConf,
    },
    colors: true,
    frameworks: [ 'mocha', 'sinon', 'chai' ], // Mocha is our testing framework of choice
    files: [
      'loadtests.js'
    ],
    preprocessors: {
      'loadtests.js': [ 'webpack' ] // Preprocess with webpack and our sourcemap loader
    },
    reporters: [ 'mocha' ],
    webpack: webpackConf,
    webpackServer: {
      noInfo: true // We don't want webpack output
    }
  });
};
