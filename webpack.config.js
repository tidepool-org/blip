module.exports = {
  entry: './example/running.js',
  module: {
    loaders: [
      {test: /\.svg/, loader: 'url-loader?mimetype=image/svg+xml'},
      {test: /\.js$/, loader: 'jsx-loader'},
      {test: /\.json/, loader: 'json-loader'}
    ]
  },
  output: {
    path: __dirname + '/example',
    filename: 'bundle.js'
  }
};