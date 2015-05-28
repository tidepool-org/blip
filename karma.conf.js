var webpack = require('webpack');

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS' ], // use PhantomJS for now (@gordyd - I'm using a VM)
    singleRun: true,
    frameworks: [ 'mocha' ], // Mocha is our testing framework of choice
    files: [
      'tests.webpack.js' //just load this file
    ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ] //preprocess with webpack and our sourcemap loader
    },
    reporters: [ 'dots' ], //report results in this format
    webpack: { //kind of a copy of your webpack config
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      module: {
        loaders: [
          { test: /\.js$/, loader: 'jsx-loader' }
        ]
      }
    },
    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    }
  });
};