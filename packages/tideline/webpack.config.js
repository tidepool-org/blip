var path = require('path');
var webpack = require('webpack');
const buildConfig = require('../../server/config.app');

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
    path.resolve(appDirectory, 'test'),
  ],
  exclude: /node_modules/,
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
        postcssOptions: {
          path: __dirname,
        }
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
      options: {
        mimetype: 'application/vnd.ms-fontobject',
      },
    },
  },
  {
    test: /\.woff$/,
    use: {
      loader: 'url-loader',
      options: {
        mimetype: 'application/font-woff',
      },
    },
  },
  {
    test: /\.ttf$/,
    use: {
      loader: 'url-loader',
      options: {
        mimetype: 'application/octet-stream',
      },
    },
  },
];

const resolve = {
  alias: {
    'lock.svg': path.resolve(__dirname, `../../branding/lock.svg`),
    'cartridge.png': path.resolve(__dirname, '../../branding/sitechange/cartridge.png'),
    'infusion.png': path.resolve(__dirname, '../../branding/sitechange/infusion.png'),
    'cartridge-vicentra.png': path.resolve(__dirname, '../../branding/sitechange/cartridge-vicentra.png'),
    // Theses aliases will be needed for webpack 5.x :
    // crypto: require.resolve('crypto-browserify'),
    // path: require.resolve('path-browserify'),
    // stream: require.resolve('stream-browserify'),
  },
};

module.exports = {
  devtool: 'sourcemap',
  entry: './js/index.js',
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
  plugins,
  resolve,
  resolveLoader: resolve,
};
