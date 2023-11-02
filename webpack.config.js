const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RollbarSourceMapPlugin = require('rollbar-sourcemap-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const terser = require('terser');
const fs = require('fs');
const pkg = require('./package.json');
const cp = require('child_process');
const optional = require('optional');
const _ = require('lodash');

const isDev = (process.env.NODE_ENV === 'development');
const isTest = (process.env.NODE_ENV === 'test');
const isProd = (process.env.NODE_ENV === 'production');

// Get config from local config file or process.env
const linkedPackages = (isDev || isTest) ? _.get(optional('./config/local'), 'linkedPackages', {}) : {};
const apiHost = _.get(optional('./config/local'), 'apiHost', process.env.API_HOST || null);
const uploadApi = _.get(optional('./config/local'), 'uploadApi', process.env.UPLOAD_API || null);
const launchDarklyClientToken = _.get(optional('./config/local'), 'launchDarklyClientToken', process.env.LAUNCHDARKLY_CLIENT_TOKEN || null);
const featureFlags = _.get(optional('./config/local'), 'featureFlags', {
  i18nEnabled: process.env.I18N_ENABLED || false,
  rxEnabled: process.env.RX_ENABLED || false,
  pendoEnabled: process.env.PENDO_ENABLED || true,
});

const VERSION = pkg.version;
const ROLLBAR_POST_CLIENT_TOKEN = '6158068d70fd485ba03e72ce5ffb8998';
const ROLLBAR_POST_SERVER_TOKEN = process.env.ROLLBAR_POST_SERVER_TOKEN;

const VERSION_SHA = process.env.TRAVIS_COMMIT
  || cp.execSync('git rev-parse HEAD || true', { cwd: __dirname, encoding: 'utf8' });

// Enzyme as of v2.4.1 has trouble with classes
// that do not start and *end* with an alpha character
// but that will sometimes happen with the base64 hashes
// so we leave them off in the test env
const localIdentName = process.env.NODE_ENV === 'test'
  ? '[name]--[local]'
  : '[name]--[local]--[hash:base64:5]';

const styleLoaderConfiguration = {
  test: /\.((c|le)ss)$/i,
  use: [
    (isDev || isTest) ? 'style-loader' : MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        importLoaders: 2,
        sourceMap: isDev,
      },
    },
    {
      loader: 'postcss-loader',
    },
    {
      loader: 'less-loader',
      options: {
        sourceMap: isDev,
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  ],
};

const babelLoaderConfiguration = [
  {
    test: /\.js$/,
    exclude: function(modulePath) {
      return /node_modules/.test(modulePath) && !/node_modules\/(tideline|tidepool-platform-client)/.test(modulePath);
    },
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    },
  },
  {
    test: /\.js?$/,
    include: [
      fs.realpathSync('./node_modules/@tidepool/viz'),
    ],
    use: {
      loader: 'source-map-loader',
    },
  },
  { // Needed to resolve material-ui
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  },
];

// This is needed for webpack to import static images in JavaScript files
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  exclude: [
    /node_modules\/@tidepool\/viz(([/\\]).*)static-assets/,
    /node_modules\/@tidepool\/viz(([/\\]).*)lazy-assets/,
  ],
  type: 'asset/resource',
  generator: {
    filename: '[name].[ext]'
  },
};

const fontLoaderConfiguration = [
  {
    test: /\.eot$/,
    type: 'asset/resource',
  },
  {
    test: /\.woff$/,
    type: 'asset/resource',
  },
  {
    test: /\.ttf$/,
    type: 'asset/resource',
  },
];

const plugins = [
  // these values are required in the config.app.js file -- we can't use
  // process.env with webpack, we have to create these magic constants
  // individually.
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': isDev ? JSON.stringify('development') : JSON.stringify('production'),
    },
    __UPLOAD_API__: JSON.stringify(uploadApi),
    __API_HOST__: JSON.stringify(apiHost),
    __INVITE_KEY__: JSON.stringify(process.env.INVITE_KEY || null),
    __LATEST_TERMS__: JSON.stringify(process.env.LATEST_TERMS || null),
    __PASSWORD_MIN_LENGTH__: JSON.stringify(process.env.PASSWORD_MIN_LENGTH || null),
    __PASSWORD_MAX_LENGTH__: JSON.stringify(process.env.PASSWORD_MAX_LENGTH || null),
    __ABOUT_MAX_LENGTH__: JSON.stringify(process.env.ABOUT_MAX_LENGTH || null),
    __I18N_ENABLED__: JSON.stringify(featureFlags.i18nEnabled),
    __RX_ENABLED__: JSON.stringify(featureFlags.rxEnabled),
    __PENDO_ENABLED__: JSON.stringify(featureFlags.pendoEnabled),
    __VERSION__: JSON.stringify(VERSION),
    __ROLLBAR_POST_CLIENT_TOKEN__: JSON.stringify(ROLLBAR_POST_CLIENT_TOKEN),
    __LAUNCHDARKLY_CLIENT_TOKEN__: JSON.stringify(launchDarklyClientToken),
    __VERSION_SHA__: JSON.stringify(VERSION_SHA),
    __DEV__: isDev,
    __TEST__: isTest,
    __PROD__: isProd,
    __DEV_TOOLS__: (process.env.DEV_TOOLS != null) ? process.env.DEV_TOOLS : (isDev ? true : false) //eslint-disable-line eqeqeq
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
    process: 'process/browser.js',
  }),
  new MiniCssExtractPlugin({
    filename: isDev ? 'style.css' : 'style.[contenthash].css',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'static',
        transform: (content, path) => {
          if (isDev || !path.endsWith('js')) return content;
          const code = fs.readFileSync(path, 'utf8');
          const result = terser.minify(code);
          return result.code;
        },
      },
    ],
  }),
  new HtmlWebpackPlugin({
    template: 'index.ejs',
    favicon: 'favicon.ico',
    minify: {
      removeComments: false,
    },
  }),
];

if (isDev) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
  plugins.push(new ReactRefreshWebpackPlugin());
} else if (isProd) {
  plugins.push(
    /** Upload sourcemap to Rollbar */
    new RollbarSourceMapPlugin({
      accessToken: ROLLBAR_POST_SERVER_TOKEN,
      version: VERSION_SHA,
      publicPath: 'https://dynamichost',
    })
  );
}

const devPublicPath = process.env.WEBPACK_PUBLIC_PATH || 'http://localhost:3000/';

const entry = isDev
  ? [
    '@babel/polyfill',
    'webpack-dev-server/client?' + devPublicPath,
    'webpack/hot/only-dev-server',
    './app/main.js',
  ] : [
    '@babel/polyfill',
    './app/main.prod.js',
  ];

const output = {
  filename: '[name].js',
  chunkFilename: '[name].chunk.js',
  path: path.join(__dirname, '/dist'),
  publicPath: isDev ? devPublicPath : '/',
  globalObject: `(typeof self !== 'undefined' ? self : this)`, // eslint-disable-line quotes
};

const resolve = {
  alias: {
    ...linkedPackages,
    'babel-core': path.resolve('node_modules/babel-core'),
    classnames: path.resolve('node_modules/classnames'),
    lodash: path.resolve('node_modules/lodash'),
    moment: path.resolve('node_modules/moment'),
    'moment-timezone': path.resolve('node_modules/moment-timezone'),
    react: path.resolve('node_modules/react'),
    'react-addons-update': path.resolve('node_modules/react-addons-update'),
    'react-redux': path.resolve('node_modules/react-redux'),
    redux: path.resolve('node_modules/redux'),
    // maps fs to a virtual one allowing to register file content dynamically
    fs: 'pdfkit/js/virtual-fs.js',
    // iconv-lite is used to load cid less fonts (not spec compliant)
    'iconv-lite': false,
  },
  fallback: {
    // crypto module is not necessary at browser
    crypto: false,
    // fallbacks for native node libraries (required for PDFKit)
    buffer: require.resolve('buffer/'),
    stream: require.resolve('readable-stream'),
    zlib: require.resolve('browserify-zlib'),
    util: require.resolve('util/'),
    assert: require.resolve('assert/')
  },
};

let devtool = process.env.WEBPACK_DEVTOOL || 'eval-source-map';
if (process.env.WEBPACK_DEVTOOL === false) devtool = undefined;

module.exports = {
  devServer: {
    static: { publicPath: output.publicPath },
    historyApiFallback: true,
    hot: isDev,
    client: { logging: 'info' },
  },
  devtool,
  entry,
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [
      ...babelLoaderConfiguration,
      imageLoaderConfiguration,
      styleLoaderConfiguration,
      ...fontLoaderConfiguration,

      // PDFKit extra rules
      // bundle and load afm files verbatim
      { test: /\.afm$/, type: 'asset/source' },
      // bundle and load binary files inside static-assets folder as base64
      {
        test: /node_modules\/@tidepool\/viz(([/\\]).*)static-assets/,
        type: 'asset/inline',
        generator: {
          dataUrl: content => {
            return content.toString('base64');
          },
        },
      },
      // load binary files inside lazy-assets folder as a URL
      {
        test: /node_modules\/@tidepool\/viz(([/\\]).*)lazy-assets/,
        type: 'asset/resource'
      },
      // convert to base64 and include inline file system binary files used by fontkit and linebreak
      {
        enforce: 'post',
        test: /fontkit[/\\]index.js$/,
        loader: 'transform-loader',
        options: {
          brfs: {}
        }
      },
      {
        enforce: 'post',
        test: /linebreak[/\\]src[/\\]linebreaker.js/,
        loader: 'transform-loader',
        options: {
          brfs: {}
        }
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: { comments: false },
          compress: {
            inline: false,
            conditionals: false,
          }
        }
      }),
      new CssMinimizerPlugin(),
    ],
  },
  output,
  plugins,
  resolve,
  resolveLoader: resolve,
  cache: isDev,
  watchOptions: {
    ignored: /node_modules([\\]+|\/)+(?!(tideline|tidepool-platform-client|@tidepool\/viz))|(tideline|tidepool-platform-client|@tidepool\/viz)([\\]+|\/)node_modules/,
  },
};
