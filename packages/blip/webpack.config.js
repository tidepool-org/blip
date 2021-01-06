/* eslint-disable lodash/prefer-lodash-typecheck */
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SriWebpackPlugin = require('webpack-subresource-integrity');
const DblpHtmlWebpackPlugin = require('./dblp-webpack-html-plugin');
const buildConfig = require('../../server/config.app');

const isDev = (process.env.NODE_ENV === 'development');
const isTest = (process.env.NODE_ENV === 'test');
const isProduction = (process.env.NODE_ENV === 'production');
const useWebpackDevServer = isDev && (process.env.USE_WEBPACK_DEV_SERVER === 'true');

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
    (isProduction) ? MiniCssExtractPlugin.loader : 'style-loader',
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
const cssLoaderConfiguration = {
  test: /\.css$/,
  use: [
    (isProduction) ? MiniCssExtractPlugin.loader : 'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        sourceMap: true,
        modules: {
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
    }
  ],
};

const babelLoaderConfiguration = [
  {
    test: /\.js$/,
    exclude: function(modulePath) {
      return /node_modules/.test(modulePath) && !/(tideline|tidepool-platform-client|tidepool-viz)/.test(modulePath);
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
    use: {
      loader: 'source-map-loader',
    },
  },
];

// This is needed for webpack to import static images in JavaScript files
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      limit: 1024,
      name: '[contenthash].[ext]',
      esModule: false,
    },
  },
};

const fontLoaderConfiguration = [
  {
    test: /\.eot$/,
    use: {
      loader: 'url-loader',
      options: {
        // Max limit to be included in the bundle js file:
        limit: 1024,
        name: '[contenthash].[ext]',
        mimetype: 'application/vnd.ms-fontobject',
      },
    },
  },
  {
    test: /\.woff$/,
    use: {
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: '[contenthash].[ext]',
        mimetype: 'application/font-woff',
      },
    },
  },
  {
    test: /\.ttf$/,
    use: {
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: '[contenthash].[ext]',
        mimetype: 'application/octet-stream',
      },
    },
  },
];

const localesLoader = {
  test: /locales\/languages\.json$/,
  use: {
    loader: './locales-loader.js'
  }
};

const plugins = [
  // these values are required in the config.app.js file -- we can't use
  // process.env with webpack, we have to create these magic constants
  // individually.
  // When running the test, we always use the default config.
  new webpack.DefinePlugin({
    BUILD_CONFIG: `'${JSON.stringify(isTest ? {DEV: isDev, TEST: isTest} : buildConfig)}'`,
    __DEV__: isDev,
    __TEST__: isTest,
  }),
  new SriWebpackPlugin({
    hashFuncNames: ['sha512'],
    enabled: isProduction,
  }),
  new HtmlWebpackPlugin({
    template: '../../templates/index.html',
    favicon:  `../../branding/${buildConfig.BRANDING}/favicon.ico`,
    minify: false,
    scriptLoading: 'defer',
    inject: 'body',
    showErrors: !isProduction,
    title: buildConfig.BRANDING,
  }),
];

if (isProduction) {
  plugins.push(
    new MiniCssExtractPlugin({
      filename: isDev ? 'style.css' : 'style.[contenthash].css',
    })
  );
}

if (isDev) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
  if (process.env.WEBPACK_DEV_SERVER === 'true' && typeof process.env.HELP_SCRIPT_URL === 'string') {
    plugins.push(new DblpHtmlWebpackPlugin());
  }
}

const minimizer = [
  new TerserPlugin({
    test: /\.js(\?.*)?$/i,
    parallel: true,
    extractComments: false,
    terserOptions: {
      // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
      ie8: false,
      toplevel: true,
      ecma: 2017,
      compress: {},
      output: {
        comments: false,
        beautify: false
      }
    }
  }),
  new OptimizeCSSAssetsPlugin({}),
];

const output = {
  filename: isDev || isTest ? '[name].js' : '[name].[contenthash].js',
  path: path.join(__dirname, 'dist'),
  chunkFilename: '[id].[chunkhash].js',
  crossOriginLoading: 'anonymous',
  // globalObject: `(typeof self !== 'undefined' ? self : this)`, // eslint-disable-line quotes
};

if (typeof process.env.PUBLIC_PATH === 'string' && process.env.PUBLIC_PATH.startsWith('https')) {
  output.publicPath = process.env.PUBLIC_PATH;
}

const resolve = {
  symlinks: false,
  modules: [
    path.join(__dirname, 'node_modules'),
    'node_modules',
  ],
  alias: {
    pdfkit: 'pdfkit/js/pdfkit.standalone.js',
    './images/tidepool/logo.png': path.resolve(__dirname, `../../branding/${buildConfig.BRANDING}/logo.png`),
    'lock.svg': path.resolve(__dirname, `../../branding/lock.svg`),
    'cartridge.png': path.resolve(__dirname, '../../branding/sitechange/cartridge.png'),
    'infusion.png': path.resolve(__dirname, '../../branding/sitechange/infusion.png'),
    'cartridge-vicentra.png': path.resolve(__dirname, '../../branding/sitechange/cartridge-vicentra.png'),
    // Theses aliases will be needed for webpack 5.x :
    // crypto: require.resolve('crypto-browserify'),
    // path: require.resolve('path-browserify'),
    // stream: require.resolve('stream-browserify'),
  }
};

let entry = [];
let devServer;
if (isTest) {
  entry = undefined; // Speed up the compile of the tests
} else if (useWebpackDevServer) {
  console.info('Webpack dev-server is enable');
  const devPublicPath = process.env.WEBPACK_PUBLIC_PATH || 'http://localhost:3001/';
  output.publicPath = devPublicPath;
  entry = [
    'webpack-dev-server/client?' + devPublicPath,
    'webpack/hot/only-dev-server',
    './app/main.dev.js',
  ];
  devServer = {
    publicPath: devPublicPath,
    historyApiFallback: true,
    hot: isDev,
    clientLogLevel: 'info',
    disableHostCheck: true,
  };
  resolve.alias['./Root.prod'] = './Root.dev';
  resolve.alias['./configureStore.prod'] = './configureStore.dev';
} else {
  entry = [ './app/main.prod.js' ];
}

let devtool = 'source-map';
if (process.env.WEBPACK_DEVTOOL === 'false') {
  devtool = undefined;
} else if (isTest) {
  devtool = 'inline-source-map';
} else if (isProduction) {
  devtool = 'source-map';
} else if (typeof process.env.WEBPACK_DEVTOOL === 'string') {
  devtool = process.env.WEBPACK_DEVTOOL;
}

const webpackConfig = {
  devServer,
  devtool,
  entry,
  mode: isDev || isTest ? 'development' : 'production',
  module: {
    rules: [
      ...babelLoaderConfiguration,
      imageLoaderConfiguration,
      lessLoaderConfiguration,
      cssLoaderConfiguration,
      ...fontLoaderConfiguration,
      localesLoader,
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.(css|less)$/,
          chunks: 'all',
          enforce: true
        }
      }
    },
    minimize: isProduction,
    minimizer
  },
  output,
  plugins,
  resolve,
  resolveLoader: resolve,
  cache: isDev,
};

// console.log(JSON.stringify(webpackConfig, null, 2));
module.exports = webpackConfig;
