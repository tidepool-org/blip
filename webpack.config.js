const format = require('util').format;
const path = require('path');
const calc = require('postcss-calc');
const cssVariables = require('postcss-custom-properties');

const cssModules = process.env.NODE_ENV === 'test' ?
  // Enzyme as of v2.4.1 has trouble with classes
  // that do not start and *end* with an alpha character
  // but that will sometimes happen with the base64 hashes
  // so we leave them off in the test env
  'modules&localIdentName=[name]--[local]' :
  'modules&localIdentName=[name]--[local]--[hash:base64:5]';
const importLoaders = 'importLoaders=1';

module.exports = {
  debug: true,
  devtool: 'sourcemap',
  entry: {
    index: path.join(__dirname, '/src/index'),
    print: path.join(__dirname, '/src/modules/print/index'),
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '/dist/'),
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
      {
        test: /\.png$/,
        loader: 'url-loader?limit=25000&mimetype=image/png',
      },
    ],
    postcss: [calc, cssVariables],
  },
};
