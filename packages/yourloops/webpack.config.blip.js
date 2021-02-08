/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const buildConfig = require('../../server/config.app');

const isDev = (process.env.NODE_ENV === 'development');
const isTest = (process.env.NODE_ENV === 'test');
const isProduction = (process.env.NODE_ENV === 'production');

// Enzyme as of v2.4.1 has trouble with classes
// that do not start and *end* with an alpha character
// but that will sometimes happen with the base64 hashes
// so we leave them off in the test env
const localIdentName = process.env.NODE_ENV === 'test'
  ? '[name]--[local]'
  : '[name]--[local]--[hash:base64:5]';

const lessLoaderConfiguration = {
  test: /\.less$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        importLoaders: 2,
        sourceMap: true,
        modules: {
          auto: true,
          exportGlobals: true,
          localIdentName,
        },
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        postcssOptions: {
          path: __dirname,
        },
      },
    },
    {
      loader: 'less-loader',
      options: {
        sourceMap: true,
        lessOptions: {
          strictUnits: true,
          strictMath: true,
          javascriptEnabled: true, // Deprecated
        },
      },
    },
  ],
};
const cssLoaderConfiguration = {
  test: /\.css$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        sourceMap: true,
        modules: {
          localIdentName,
        },
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        postcssOptions: {
          path: __dirname,
        },
      },
    },
  ],
};

const babelLoaderConfiguration = {
  test: /\.js$/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
    },
  },
};

// This is needed for webpack to import static images in JavaScript files
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

const minimizer = [
  new TerserPlugin({
    test: /\.js(\?.*)?$/i,
    cache: true,
    parallel: true,
    sourceMap: true,
    extractComments: isProduction,
    terserOptions: {
      // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
      ie8: false,
      toplevel: true,
      warnings: false,
      ecma: 2017,
      compress: {},
      output: {
        comments: false,
        beautify: false,
      },
    },
  }),
  new OptimizeCSSAssetsPlugin({}),
];

const output = {
  filename: isDev || isTest ? 'blip.js' : 'blip.[hash].js',
  path: path.join(__dirname, 'dist'),
};

if (typeof process.env.PUBLIC_PATH === 'string' && process.env.PUBLIC_PATH.startsWith('https')) {
  output.publicPath = process.env.PUBLIC_PATH;
}

const resolve = {
  modules: [
    path.join(__dirname, 'node_modules'),
    path.join(__dirname, '../../node_modules'),
    'node_modules',
  ],
  alias: {
    pdfkit: 'pdfkit/js/pdfkit.standalone.js',
    'lock.svg': path.resolve(__dirname, `../../branding/lock.svg`),
  },
};

module.exports = {
  babelLoaderConfiguration,
  lessLoaderConfiguration,
  cssLoaderConfiguration,
  imageLoaderConfiguration,
  resolve,
  minimizer,
};
