var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var entry = (process.env.MOCK === 'true') ? './app/main.mock.js' : './app/main.js';

// these values are required in the config.app.js file -- we can't use
// process.env with webpack, we have to create these magic constants
// individually.
var defineEnvPlugin = new webpack.DefinePlugin({
  __MOCK__: JSON.stringify(process.env.MOCK || null),
  __MOCK_PARAMS__: JSON.stringify(process.env.MOCK_PARAMS || null),
  __UPLOAD_API__: JSON.stringify(process.env.UPLOAD_API || null),
  __API_HOST__: JSON.stringify(process.env.API_HOST || null),
  __SHOW_ACCEPT_TERMS__: JSON.stringify(process.env.SHOW_ACCEPT_TERMS || null),
  __PASSWORD_MIN_LENGTH__: JSON.stringify(process.env.PASSWORD_MIN_LENGTH || null),
  __INVITE_KEY__: JSON.stringify(process.env.INVITE_KEY || null),
  __DEV__: false,
  __TEST__: false
});

module.exports = {
  entry: entry,
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /(node_modules)/, loader: 'babel-loader'},
      // need this condition when Tideline loaded from Github branch
      {test: /node_modules\/tideline\/.*\.js$/, exclude: /tideline\/node_modules/, loader: 'babel-loader'},
      {test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader!less-loader')},
      {test: /\.gif$/, loader: 'url-loader?limit=100000&mimetype=image/gif'},
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
  // tideline DEV env variable only needs to be true in tideline local dev
  plugins: [
    defineEnvPlugin,
    new ExtractTextPlugin('style.css')
  ],
  // resolves tideline's embedded React dependencies
  resolve: { fallback: path.join(__dirname, 'node_modules') },
  resolveLoader: { fallback: path.join(__dirname, 'node_modules') },
  devServer: {
    historyApiFallback: true
  }
};
