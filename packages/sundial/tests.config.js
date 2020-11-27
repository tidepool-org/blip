'use strict';

var path = require('path');

module.exports = {
  entry: './test/test_datetimeWrapper.js',
  output: {
    path: path.join(__dirname, 'tmp'),
    filename: '_test.js'
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json-loader'}
    ]
  }
};
