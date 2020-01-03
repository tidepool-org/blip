const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const uglifyJS = require('uglify-es');
const fs = require('fs');
const DblpHtmlWebpackPlugin = require('./dblp-webpack-html-plugin');

const isDev = (process.env.NODE_ENV === 'development');
const isTest = (process.env.NODE_ENV === 'test');

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
    (isDev || isTest) ? 'style-loader' : MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      query: {
        importLoaders: 2,
        localIdentName,
        sourceMap: isDev,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: isDev,
      },
    },
    {
      loader: 'less-loader',
      options: {
        sourceMap: isDev,
        javascriptEnabled: true,
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
];

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

const plugins = [
  // these values are required in the config.app.js file -- we can't use
  // process.env with webpack, we have to create these magic constants
  // individually.
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': isDev || isTest ? JSON.stringify('development') : JSON.stringify('production'),
    },
    __UPLOAD_API__: JSON.stringify(process.env.UPLOAD_API || null),
    __API_HOST__: JSON.stringify(process.env.API_HOST || null),
    __INVITE_KEY__: JSON.stringify(process.env.INVITE_KEY || null),
    __LATEST_TERMS__: JSON.stringify(process.env.LATEST_TERMS || null),
    __PASSWORD_MIN_LENGTH__: JSON.stringify(process.env.PASSWORD_MIN_LENGTH || null),
    __PASSWORD_MAX_LENGTH__: JSON.stringify(process.env.PASSWORD_MAX_LENGTH || null),
    __ABOUT_MAX_LENGTH__: JSON.stringify(process.env.ABOUT_MAX_LENGTH || null),
    __I18N_ENABLED__: JSON.stringify(process.env.I18N_ENABLED || false),
    __ALLOW_SIGNUP_PATIENT__: JSON.stringify(process.env.ALLOW_SIGNUP_PATIENT || true),
    __ALLOW_PATIENT_CHANGE_EMAIL__: JSON.stringify(process.env.ALLOW_PATIENT_CHANGE_EMAIL || true),
    __ALLOW_PATIENT_CHANGE_PASSWORD__: JSON.stringify(process.env.ALLOW_PATIENT_CHANGE_PASSWORD || true),
    __CAN_SEE_PWD_LOGIN__: JSON.stringify(process.env.CAN_SEE_PWD_LOGIN || true),
    __HELP_LINK__: JSON.stringify(process.env.HELP_LINK || null),
    __ASSETS_URL__: JSON.stringify(process.env.ASSETS_URL || null),
    __HIDE_DONATE__: JSON.stringify(process.env.HIDE_DONATE || false),
    __HIDE_DEXCOM_BANNER__: JSON.stringify(process.env.HIDE_DEXCOM_BANNER || false),
    __HIDE_UPLOAD_LINK__: JSON.stringify(process.env.HIDE_UPLOAD_LINK || false),
    __BRANDING__: JSON.stringify(process.env.BRANDING || 'tidepool'),
    __DEV__: isDev,
    __TEST__: isTest,
    __DEV_TOOLS__: (process.env.DEV_TOOLS != null) ? process.env.DEV_TOOLS : (isDev ? true : false) //eslint-disable-line eqeqeq
  }),
  new MiniCssExtractPlugin({
    filename: isDev ? 'style.css' : 'style.[contenthash].css',
  }),
  new CopyWebpackPlugin([
    {
      from: 'static',
      transform: (content, path) => {
        if (isDev || isTest) {
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
    favicon: 'favicon.ico',
    minify: false
  }),
];

if (isDev) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
  if (process.env.WEBPACK_DEV_SERVER === 'true' && typeof process.env.HELP_LINK === 'string') {
    plugins.push(new DblpHtmlWebpackPlugin());
  }
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
  filename: isDev || isTest ? 'bundle.js' : 'bundle.[hash].js',
  path: path.join(__dirname, '/dist'),
  publicPath: isDev ? devPublicPath : '/',
  globalObject: `(typeof self !== 'undefined' ? self : this)`, // eslint-disable-line quotes
};

const resolve = {
  modules: [
    path.join(__dirname, 'node_modules'),
    'node_modules',
  ],
};

let devtool = process.env.WEBPACK_DEVTOOL || 'eval-source-map';
if (process.env.WEBPACK_DEVTOOL === false) devtool = undefined;

module.exports = {
  devServer: {
    publicPath: output.publicPath,
    historyApiFallback: true,
    hot: isDev,
    clientLogLevel: 'info',
    disableHostCheck: true,
  },
  devtool,
  entry,
  mode: isDev || isTest ? 'development' : 'production',
  module: {
    rules: [
      ...babelLoaderConfiguration,
      imageLoaderConfiguration,
      styleLoaderConfiguration,
      ...fontLoaderConfiguration,
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
      new UglifyJsPlugin({
        uglifyOptions: {
          ie8: false,
          output: { comments: false },
          compress: {
            inline: false,
            conditionals: false,
          },
        },
        cache: true,
        parallel: true,
        sourceMap: false, // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  output,
  plugins,
  resolve,
  resolveLoader: resolve,
  cache: isDev,
  watchOptions: {
    ignored: [
      /node_modules([\\]+|\/)+(?!(tideline|tidepool-platform-client|@tidepool\/viz))/,
      /(tideline|tidepool-platform-client|@tidepool\/viz)([\\]+|\/)node_modules/
    ]
  },
};
