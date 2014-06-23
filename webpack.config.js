module.exports = {
  entry: './example/example.js',
  module: {
    loaders: [
      {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
      {test: /\.svg/, loader: 'url-loader?mimetype=image/svg+xml'},
      {test: /\.eot/, loader: 'url-loader?mimetype=application/vnd.ms-fontobject'},
      {test: /\.woff/, loader: 'url-loader?mimetype=application/font-woff'},
      {test: /\.ttf/, loader: 'url-loader?mimetype=application/x-font-ttf'},
      {test: /\.js$/, loader: 'jsx-loader'},
      {test: /\.json/, loader: 'json-loader'}
    ]
  },
  output: {
    path: __dirname + '/example',
    filename: 'bundle.js'
  }
};