var webpack = require('webpack');

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS' ], // Use PhantomJS for now (@gordyd - I'm using a VM)
    singleRun: true,
    frameworks: [ 'mocha', 'sinon' ], // Mocha is our testing framework of choice
    files: [
      'tests.webpack.js' // We're using Webpack to build
    ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ] // Preprocess with webpack and our sourcemap loader
    },
    reporters: [ 'mocha' ],
    webpack: { // Simplified Webpack configuration
      module: {
        loaders: [
          { test: /\.js$/, loader: 'jsx-loader' },
          { test: /\.json$/, loader: 'json-loader' }
        ]
      }
    },
    webpackServer: {
      noInfo: true // We don't want webpack output
    }
  });
};