const path = require('path');
const webpack = require('webpack');

const appDirectory = path.resolve(__dirname);

// eslint-disable-next-line no-underscore-dangle
const __DEV__ = process.env.NODE_ENV === 'development';

// Enzyme as of v2.4.1 has trouble with classes
// that do not start and *end* with an alpha character
// but that will sometimes happen with the base64 hashes
// so we leave them off in the test env
const localIdentName = process.env.NODE_ENV === 'test'
  ? '[name]--[local]'
  : '[name]--[local]--[hash:base64:5]';

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
  test: /\.js$/,
  // Add every directory that needs to be compiled by Babel during the build
  include: [
    path.resolve(appDirectory, 'src'),
  ],

  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      plugins: [
        ['transform-runtime', {
          helpers: false,
          polyfill: false,
          regenerator: true,
          moduleName: 'babel-runtime',
        }],
      ],
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
    },
  },
};

module.exports = {
  plugins: [
    // `process.env.NODE_ENV === 'production'` must be `true` for production
    // builds to eliminate development checks and reduce build size. You may
    // wish to include additional optimizations.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __DEV__,
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
  ],
  devtool: 'sourcemap',
  entry: {
    index: [path.join(__dirname, '/src/index')],
    print: [path.join(__dirname, '/src/modules/print/index')],
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '/dist/'),
  },
  resolve: {
    extensions: [
      '.js',
    ],
  },
  module: {
    rules: [
      {
        test: /\.(css)$/,
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
        ],
      },
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      {
        test: /\.ttf$/,
        use: [
          {
            loader: 'url-loader',
            query: {
              limit: 25000,
              mimetype: 'application/octet-stream',
            },
          },
        ],
      },
    ],
  },
};
