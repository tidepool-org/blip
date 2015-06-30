var webpack = require('webpack');
var RewirePlugin = require("rewire-webpack");

var defineEnvPlugin = new webpack.DefinePlugin({
  __DEV__: false
});

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS' ], // Use PhantomJS for now (@gordyd - I'm using a VM)
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000, // We need to accept that Webpack may take a while to build!
    singleRun: true,
    colors: true,
    frameworks: [ 'mocha', 'sinon', 'chai' ], // Mocha is our testing framework of choice
    files: [
      'tests.webpack.js'
    ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack' ] // Preprocess with webpack and our sourcemap loader
    },
    reporters: [ 'mocha' ],
    webpack: { // Simplified Webpack configuration
      module: {
        loaders: [
          {test: /\.js$/, loader: 'jsx-loader'},
          {test: /\.less$/, loader: 'style-loader!css-loader!autoprefixer-loader!less-loader'},
          {test: /\.gif$/, loader: 'url-loader?limit=10000&mimetype=image/gif'},
          {test: /\.jpg$/, loader: 'url-loader?limit=10000&mimetype=image/jpg'},
          {test: /\.png$/, loader: 'url-loader?limit=10000&mimetype=image/png'},
          {test: /\.svg$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},
          {test: /favicon\.ico$/, loader: 'file-loader?name=favicon.ico&limit=100000&mimetype=image/x-icon'},
          {test: /\.eot$/, loader: 'url-loader?limit=10000&mimetype=application/vnd.ms-fontobject'},
          {test: /\.woff$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
          {test: /\.ttf$/, loader: 'url-loader?limit=10000&mimetype=application/x-font-ttf'},
          {test: /\.json$/, loader: 'json-loader'}
        ]
      },
      plugins: [
        defineEnvPlugin,
        new RewirePlugin()
      ],
      node: {
        fs: "empty",
        module: "empty"
      }
    },
    webpackServer: {
      noInfo: true // We don't want webpack output
    }
  });
};