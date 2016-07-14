var path = require('path');

module.exports = {
  entry: './config.app.js',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'config.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /(node_modules)/, loaders: []},
      {test: /\.json$/, loader: 'json-loader'}
    ]
  }
};
