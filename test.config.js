var path = require('path');
var webpack = require('webpack');

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false'))
});

module.exports = {
  entry: './test/index.js',
  output: {
    path: path.join(__dirname, 'tmp'),
    filename: '_test.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /(node_modules)/, loader: 'babel-loader'},
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
    'jquery': 'jQuery'
  },
  plugins: [
    definePlugin,
    new webpack.DefinePlugin({
      'process.env': Object.keys(process.env).reduce(function(o, k) {
        o[k] = JSON.stringify(process.env[k]);
        return o;
      }, {})
    })
  ]
};
