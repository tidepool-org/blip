const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const uglifyJS = require('uglify-es');
const fs = require('fs');

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
      'NODE_ENV': isDev ? JSON.stringify('development') : JSON.stringify('production'),
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
    favicon: 'favicon.ico',
  }),
];

if (isDev) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

const entry = isDev
  ? [
    '@babel/polyfill',
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './app/main.js',
  ] : [
    '@babel/polyfill',
    './app/main.prod.js',
  ];

const output = {
  filename: 'bundle.js',
  path: path.join(__dirname, '/dist'),
  publicPath: isDev ? 'http://localhost:3000/' : '/',
  globalObject: `(typeof self !== 'undefined' ? self : this)`, // eslint-disable-line quotes
};

const resolve = {
  symlinks: false,
  modules: [
    path.join(__dirname, 'node_modules'),
    'node_modules',
  ],
};

module.exports = {
  devServer: {
    publicPath: output.publicPath,
    historyApiFallback: true,
    hot: isDev,
    // clientLogLevel: 'warning',
    clientLogLevel: 'info',
  },
  devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
  entry,
  mode: isDev ? 'development' : 'production',
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
};
