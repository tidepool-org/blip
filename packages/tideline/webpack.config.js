const path = require('path');
const webpack = require('webpack');

const appDirectory = path.resolve(__dirname);

const plugins = [
  new webpack.LoaderOptionsPlugin({
    debug: true,
  }),
];

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
      rootMode: "upward",
      configFile: path.resolve(__dirname, "../../babel.config.json"),
      cacheDirectory: true,
    },
  },
};

// Enzyme as of v2.4.1 has trouble with classes
// that do not start and *end* with an alpha character
// but that will sometimes happen with the base64 hashes
// so we leave them off in the test env
const localIdentName = '[name]--[local]';

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
        },
      },
    },
  ],
};

// This is needed for webpack to import static images in JavaScript files
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  type: "asset/inline",
};

const fontLoaderConfiguration = {
  test: /\.(eot|woff2?|ttf)$/,
  type: "asset/inline",
};

const resolve = {
  alias: {
    'lock.svg': path.resolve(__dirname, `../../branding/lock.svg`),
    'cartridge.png': path.resolve(__dirname, '../../branding/sitechange/cartridge.png'),
    'infusion.png': path.resolve(__dirname, '../../branding/sitechange/infusion.png'),
    'cartridge-vicentra.png': path.resolve(__dirname, '../../branding/sitechange/cartridge-vicentra.png'),
    'warmup-dexcom.svg': path.resolve(__dirname, '../../branding/warmup/warmup-dexcom.svg'),
    // Theses aliases will be needed for webpack 5.x :
    // crypto: require.resolve('crypto-browserify'),
    // path: require.resolve('path-browserify'),
    // stream: require.resolve('stream-browserify'),
  },
};

module.exports = {
  devtool: 'sourcemap',
  entry: './js/index.js',
  stats: "minimal", // See https://webpack.js.org/configuration/stats/
  mode: 'development',
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      lessLoaderConfiguration,
      fontLoaderConfiguration,
    ]
  },
  plugins,
  resolve,
  resolveLoader: resolve,
};
