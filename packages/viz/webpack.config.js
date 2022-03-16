const path = require("path");
const webpack = require("webpack");

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

const babelLoaderConfiguration = {
  test: /\.js$/,
  exclude: (modulePath) => {
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

const localesLoader = {
  test: /locales\/languages\.json$/,
  use: {
    loader: "../../webpack.locales-loader.js"
  }
};

const plugins = [
  // `process.env.NODE_ENV === 'production'` must be `true` for production
  // builds to eliminate development checks and reduce build size. You may
  // wish to include additional optimizations.
  new webpack.LoaderOptionsPlugin({
    debug: true,
  }),
];

const entry = {
  index: [path.join(__dirname, "/src/index")],
  print: [path.join(__dirname, "/src/modules/print/index")],
};
const resolve = {
  alias: {
    "pdfkit": "pdfkit/js/pdfkit.standalone.js",
    "lock.svg": path.resolve(__dirname, "../../branding/lock.svg"),
    "cartridge.png": path.resolve(__dirname, "../../branding/sitechange/cartridge.png"),
    "cartridge-vicentra.png": path.resolve(__dirname, "../../branding/sitechange/cartridge-vicentra.png"),
    "infusion.png": path.resolve(__dirname, "../../branding/sitechange/infusion.png"),
    "warmup-dexcom.svg": path.resolve(__dirname, "../../branding/warmup/warmup-dexcom.svg"),
  },
  fallback: {
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
  },
  extensions: [
    ".js",
  ],
};

module.exports = {
  devtool: "sourcemap",
  entry,
  stats: "minimal", // See https://webpack.js.org/configuration/stats/
  mode: "development",
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      cssLoaderConfiguration,
      lessLoaderConfiguration,
      fontLoaderConfiguration,
      localesLoader,
    ],
  },
  plugins,
  resolve,
};
