var path = require('path');
var webpack = require('webpack');

const isDev = (process.env.NODE_ENV === 'development');
const isTest = (process.env.NODE_ENV === 'test');

const output = {
  filename: 'sundial.[hash].js',
  path: path.join(__dirname, '/dist/'),
};

module.exports = {
  devtool: 'sourcemap',
  entry: './sundial.js',
  output,
  mode: isDev || isTest ? 'development' : 'production',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
    }]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: isDev || isTest,
    }),
  ],
};
