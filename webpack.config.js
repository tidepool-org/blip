const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const uglifyJS = require('uglify-es');
const fs = require('fs');

const appDirectory = path.resolve(__dirname);
const isDev = (process.env.NODE_ENV === 'development');

// Enzyme as of v2.4.1 has trouble with classes
// that do not start and *end* with an alpha character
// but that will sometimes happen with the base64 hashes
// so we leave them off in the test env
const localIdentName = process.env.NODE_ENV === 'test'
  ? '[name]--[local]'
  : '[name]--[local]--[hash:base64:5]';

const styleLoaderConfiguration = {
  test: /\.less$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader?sourceMap',
      query: {
        modules: true,
        importLoaders: 1,
        localIdentName,
      },
    },
    'postcss-loader?sourceMap',
    'less-loader',
  ],
};

// This is needed for webpack to compile JavaScript.
// Some OSS packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
  test: /\.js$/,
  // Add every directory that needs to be compiled by Babel during the build
  include: [
    path.resolve(appDirectory, 'app'),
    path.resolve(appDirectory, 'test'),
    path.resolve(appDirectory, 'node_modules/tideline'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // plugins: [
      //   ['@babel/plugin-transform-runtime', {
      //     helpers: false,
      //   }],
      // ],//
    },
  },
};

// This is needed for webpack to import static images in JavaScript files
const imageLoaderConfiguration = [
  {
    test: /\.(gif|jpe?g|png|svg)$/,
    use: {
      loader: 'url-loader',
      options: {
        name: '[name].[ext]',
      },
    },
  },
  {
    test: /favicon\.ico$/,
    use: {
      loader: 'file-loader',
      options: {
        name: 'favicon.ico&limit=100000&mimetype=image/x-icon',
      },
    },
  },
];

const fontLoaderConfiguration = [
  {
    test: /\.eot$/,
    use: {
      loader: 'url-loader',
      query: {
        limit: 10000,
        mimetype: 'application/vnd.ms-fontobject',
      },
    },
  },
  {
    test: /\.woff$/,
    use: {
      loader: 'url-loader',
      query: {
        limit: 10000,
        mimetype: 'application/font-woff',
      },
    },
  },
  {
    test: /\.ttf$/,
    use: {
      loader: 'url-loader',
      query: {
        limit: 10000,
        mimetype: 'application/octet-stream',
      },
    },
  },
];

const plugins = [
  // these values are required in the config.app.js file -- we can't use
  // process.env with webpack, we have to create these magic constants
  // individually.
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': isDev ? JSON.stringify('development') : JSON.stringify('production')
    },
    __UPLOAD_API__: JSON.stringify(process.env.UPLOAD_API || null),
    __API_HOST__: JSON.stringify(process.env.API_HOST || null),
    __INVITE_KEY__: JSON.stringify(process.env.INVITE_KEY || null),
    __LATEST_TERMS__: JSON.stringify(process.env.LATEST_TERMS || null),
    __PASSWORD_MIN_LENGTH__: JSON.stringify(process.env.PASSWORD_MIN_LENGTH || null),
    __PASSWORD_MAX_LENGTH__: JSON.stringify(process.env.PASSWORD_MAX_LENGTH || null),
    __ABOUT_MAX_LENGTH__: JSON.stringify(process.env.ABOUT_MAX_LENGTH || null),
    __I18N_ENABLED__: JSON.stringify(process.env.I18N_ENABLED || false),
    __DEV__: isDev,
    __TEST__: false,
    __DEV_TOOLS__: (process.env.DEV_TOOLS != null) ? process.env.DEV_TOOLS : (isDev ? true : false) //eslint-disable-line eqeqeq
  }),
  new ExtractTextPlugin('style.[contenthash].css'),
  new CopyWebpackPlugin([
    {
      from: 'static',
      transform: (content, path) => {
        if (isDev) {
         return content;
        }

        const code = fs.readFileSync(path, 'utf8');
        const result = uglifyJS.minify(code);
        return result.code;
      }
    }
  ]),
  new HtmlWebpackPlugin({
    template: 'index.ejs',
  }),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: ['pdfkit.js', 'blob-stream.js'],
    hash: true,
    append: true,
  })
];

// const entry = isDev
//   ? [
//     'babel-polyfill',
//     'webpack-dev-server/client?http://localhost:3000',
//     'webpack/hot/only-dev-server',
//     './app/main.js',
//   ] : [
//     'babel-polyfill',
//     './app/main.prod.js',
//   ];

const entry = {
  index: [path.join(__dirname, '/app/main.js')],
};

const output = {
  filename: 'bundle.js',
  path: path.join(__dirname, '/dist'),
  publicPath: isDev ? 'http://localhost:3000/' : '/',
};

module.exports = {
  plugins,
  devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
  entry,
  output,
  resolve: {
    extensions: [
      '.js',
    ],
  },
  module: {
    rules: [
      ...imageLoaderConfiguration,
      ...fontLoaderConfiguration,
      styleLoaderConfiguration,
      babelLoaderConfiguration,
    ],
  },
  devServer: {
    publicPath: output.publicPath,
    hot: true,
    historyApiFallback: true
  },
  mode: isDev ? 'development' : 'production',
};
