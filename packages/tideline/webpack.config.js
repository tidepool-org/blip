var path = require('path');
var webpack = require('webpack');

const appDirectory = path.resolve(__dirname);
const isDev = (process.env.NODE_ENV === 'development');
const isTest = (process.env.NODE_ENV === 'test');

const plugins = [
  new webpack.LoaderOptionsPlugin({
    debug: isDev || isTest,
  }),
];

const output = {
  filename: '[name].js',
  path: path.join(__dirname, '/dist/'),
};

const babelLoaderConfiguration = {
  test: /\.jsx?$/,
  include: [
    // Add every directory that needs to be compiled by babel during the build
    path.resolve(appDirectory, 'js'),
    path.resolve(appDirectory, 'plugins'),
    path.resolve(appDirectory, 'example'),
    path.resolve(appDirectory, 'test'),
  ],
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
};

// Enzyme as of v2.4.1 has trouble with classes
// that do not start and *end* with an alpha character
// but that will sometimes happen with the base64 hashes
// so we leave them off in the test env
const localIdentName = isTest
  ? '[name]--[local]'
  : '[name]--[local]--[hash:base64:5]';

  const lessLoaderConfiguration = {
    test: /\.less$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 2,
          sourceMap: true,
          onlyLocals: false,
          modules: {
            auto: true,
            exportGlobals: true,
            localIdentName,
          }
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
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

module.exports = {
  devtool: 'sourcemap',
  entry: './example/example.js',
  output,
  mode: isDev || isTest ? 'development' : 'production',
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      lessLoaderConfiguration,
      ...fontLoaderConfiguration,
    ]
  },
  plugins
};
