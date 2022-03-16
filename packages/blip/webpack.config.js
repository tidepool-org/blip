/* eslint-disable lodash/prefer-lodash-typecheck */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const buildConfig = require("../../server/config.app");

// Enzyme as of v2.4.1 has trouble with classes
// that do not start and *end* with an alpha character
// but that will sometimes happen with the base64 hashes
// so we leave them off in the test env
const localIdentName = "[name]--[local]";

const lessLoaderConfiguration = {
  test: /\.less$/,
  use: [
    "style-loader",
    {
      loader: "css-loader",
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
      loader: "postcss-loader",
      options: {
        sourceMap: true,
        postcssOptions: {
          path: __dirname,
        }
      },
    },
    {
      loader: "less-loader",
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
    "style-loader",
    {
      loader: "css-loader",
      options: {
        importLoaders: 1,
        sourceMap: true,
        modules: {
          localIdentName,
        }
      },
    },
    {
      loader: "postcss-loader",
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
      return /node_modules/.test(modulePath) && !/(tideline|tidepool-viz)/.test(modulePath);
    },
    use: {
      loader: "babel-loader",
      options: {
        rootMode: "upward",
        configFile: path.resolve(__dirname, "../../babel.config.json"),
        cacheDirectory: true,
      },
    },
  },
  {
    test: /\.js?$/,
    use: {
      loader: "source-map-loader",
    },
  },
];

// This is needed for webpack to import static images in JavaScript files
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  type: "asset/inline",
};

const fontLoaderConfiguration = {
  test: /\.(eot|woff2?|ttf)$/,
  type: "asset/inline",
};

const localesLoader = {
  test: /locales\/languages\.json$/,
  use: {
    loader: "../../webpack.locales-loader.js"
  }
};

const plugins = [
  // these values are required in the config.app.js file -- we can't use
  // process.env with webpack, we have to create these magic constants
  // individually.
  // When running the test, we always use the default config.
  new webpack.DefinePlugin({
    BUILD_CONFIG: `'${JSON.stringify({DEV: true, TEST: true })}'`,
    __DEV__: true,
    __TEST__: true,
  }),
  new HtmlWebpackPlugin({
    template: "../../templates/index.html",
    minify: false,
    scriptLoading: "defer",
    inject: "body",
    showErrors: true,
    title: buildConfig.BRANDING,
  }),
];

const resolve = {
  symlinks: false,
  modules: [
    path.join(__dirname, "node_modules"),
    "node_modules",
  ],
  alias: {
    "pdfkit": "pdfkit/js/pdfkit.standalone.js",
    "lock.svg": path.resolve(__dirname, "../../branding/lock.svg"),
    "cartridge.png": path.resolve(__dirname, "../../branding/sitechange/cartridge.png"),
    "infusion.png": path.resolve(__dirname, "../../branding/sitechange/infusion.png"),
    "cartridge-vicentra.png": path.resolve(__dirname, "../../branding/sitechange/cartridge-vicentra.png"),
    "warmup-dexcom.svg": path.resolve(__dirname, "../../branding/warmup/warmup-dexcom.svg"),
  },
  fallback: {
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
  },
};

const webpackConfig = {
  devtool: "inline-source-map",
  stats: "minimal", // See https://webpack.js.org/configuration/stats/
  mode: "development",
  module: {
    rules: [
      ...babelLoaderConfiguration,
      imageLoaderConfiguration,
      lessLoaderConfiguration,
      cssLoaderConfiguration,
      fontLoaderConfiguration,
      localesLoader,
    ],
  },
  plugins,
  resolve,
  resolveLoader: resolve,
  cache: false,
};

// console.log(JSON.stringify(webpackConfig, null, 2));
module.exports = webpackConfig;
