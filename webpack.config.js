var path = require('path');

module.exports = {
  entry: './example/running.js',
  output: {
    path: path.join(__dirname, 'example'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.svg/, loader: 'url-loader?mimetype=image/svg+xml'},
      {test: /\.js$/, loader: 'jsx-loader'},
      {test: /\.json/, loader: 'json-loader'}
    ]
  }
};
