var path = require('path');
var webpack = require('webpack');

var defineEnvPlugin = new webpack.DefinePlugin({
  __DEV__: false,
  __TEST__: true,
  __HIDE_DONATE__: JSON.stringify(process.env.HIDE_DONATE || null),
  __HIDE_DEXCOM_BANNER__: JSON.stringify(process.env.HIDE_DEXCOM_BANNER || null),
  __BRANDING__: JSON.stringify(process.env.BRANDING || 'tidepool')
});

module.exports = {
  module: {
    loaders: [
      {test: /\.js$/, exclude: /(node_modules)/, loader: 'babel-loader'},
      // the JSX in tideline needs transpiling
      {test: /node_modules\/tideline\/.*\.js$/, exclude: /tideline\/node_modules/, loader: 'babel-loader'},
      {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
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
    defineEnvPlugin
  ],
  node: {
    fs: 'empty',
    module: 'empty'
  },
  resolve: { fallback: path.join(__dirname, 'node_modules') },
  resolveLoader: { fallback: path.join(__dirname, 'node_modules') },
  externals: {
    cheerio: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
  },
};
