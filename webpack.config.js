var path = require('path');
var webpack = require('webpack');

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false'))
});

module.exports = {
  entry: './example/example.js',
  output: {
    path: path.join(__dirname, 'example'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'jsx-loader!envify-loader'},
      {test: /\.less$/, loader: 'style-loader!css-loader!autoprefixer-loader!less-loader'},
      {test: /\.svg/, loader: 'url-loader?mimetype=image/svg+xml'},
      {test: /\.png/, loader: 'url-loader?mimetype=image/png'},
      {test: /\.eot/, loader: 'url-loader?mimetype=application/vnd.ms-fontobject'},
      {test: /\.woff/, loader: 'url-loader?mimetype=application/font-woff'},
      {test: /\.ttf/, loader: 'url-loader?mimetype=application/x-font-ttf'},
      {test: /\.json$/, loader: 'json-loader'}
    ]
  },
  externals: {
    'jquery': 'jQuery',
    'net': '{}',
    'isemail': '{}'
  },
  plugins: [definePlugin]
};
