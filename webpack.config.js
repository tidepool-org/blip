const format = require('util').format;
const path = require('path');
const calc = require('postcss-calc');
const cssVariables = require('postcss-custom-properties');

const cssModules = 'modules&localIdentName=[name]--[local]--[hash:base64:5]';
const importLoaders = 'importLoaders=1';

module.exports = {
  debug: true,
  devtool: 'sourcemap',
  entry: path.join(__dirname, '/src/index'),
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: 'index.js',
  },
  resolve: {
    extensions: [
      '',
      '.js',
    ],
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: format('style-loader!css-loader?%s&%s!postcss-loader', importLoaders, cssModules),
      },
      {
        test: /\.js$/,
        exclude: path.join(__dirname, 'node_modules'),
        loader: 'babel-loader',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
    postcss: [calc, cssVariables],
  },
};
