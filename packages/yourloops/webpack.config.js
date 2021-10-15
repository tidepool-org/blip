/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { SubresourceIntegrityPlugin } = require("webpack-subresource-integrity");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const blipWebpack = require("./webpack.config.blip");
const buildConfig = require("../../server/config.app");
const pkg = require("./package.json");

/** Match files ending with .js | .jsx | .ts | .tsx */
const reJTSX = /\.[jt]sx?$/;

// Compile mode
const mode =
  process.argv.indexOf("--mode=production") >= 0 || process.env.NODE_ENV === "production" ? "production" : "development";
const isTest = process.env.NODE_ENV === "test";
const isProduction = mode === "production";
const isDev = !isProduction;

if (buildConfig.BRANDING !== "diabeloop") {
  throw new Error("Invalid branding");
}

console.log(`Compiling ${pkg.name} v${pkg.version} for ${mode}`);
console.log(`Branding: ${buildConfig.BRANDING}`);

if (process.env.USE_WEBPACK_DEV_SERVER === "true") {
  console.log(buildConfig);
}

const alias = {
  "branding/theme-base.css": path.resolve(__dirname, `../../branding/${buildConfig.BRANDING}/theme-base.css`),
  "branding/theme.css": path.resolve(__dirname, `../../branding/${buildConfig.BRANDING}/theme.css`),
  "branding/logo.png": path.resolve(__dirname, `../../branding/${buildConfig.BRANDING}/logo.png`),
  "branding/logo-icon.svg": path.resolve(__dirname, `../../branding/${buildConfig.BRANDING}/logo-icon.svg`),
  "branding/logo-full.svg": path.resolve(__dirname, `../../branding/${buildConfig.BRANDING}/logo-full.svg`),
  "cartridge.png": path.resolve(__dirname, "../../branding/sitechange/cartridge.png"),
  "infusion.png": path.resolve(__dirname, "../../branding/sitechange/infusion.png"),
  "cartridge-vicentra.png": path.resolve(__dirname, "../../branding/sitechange/cartridge-vicentra.png"),
  "warmup-dexcom.svg": path.resolve(__dirname, "../../branding/warmup/warmup-dexcom.svg"),
  ...blipWebpack.resolve.alias,
};

const plugins = [
  new webpack.DefinePlugin({
    BUILD_CONFIG:
      isTest || isProduction ? `'${JSON.stringify({ DEV: isDev, TEST: isTest })}'` : `'${JSON.stringify(buildConfig)}'`,
  }),
  new MiniCssExtractPlugin({
    filename: isDev ? "style.css" : "style.[contenthash].css",
  }),
  new SubresourceIntegrityPlugin({
    hashFuncNames: ["sha512"],
    enabled: isProduction,
  }),
  new HtmlWebpackPlugin({
    title: "YourLoops",
    showErrors: !isProduction,
    template: path.resolve(__dirname, "../../templates/index.html"),
    scriptLoading: "defer",
    inject: "body",
    hash: false,
    favicon: path.resolve(__dirname, "../../branding/diabeloop/favicon.ico"),
    minify: false,
  }),
];
if (isTest) {
  plugins.push(
    new webpack.SourceMapDevToolPlugin({
      filename: null, // if no value is provided the sourcemap is inlined
      test: reJTSX, // process .js and .ts files only
    })
  );
}

/** @type {webpack.Configuration & { devServer: { [index: string]: any; }}} */
const webpackConfig = {
  entry: ["../../node-compat.js", "./app/index.tsx"],
  output: {
    path: path.resolve(__dirname, "dist"),
    chunkFilename: "[id].[chunkhash].js",
    crossOriginLoading: "anonymous",
    assetModuleFilename: "[contenthash][ext]",
  },
  target: "web",
  mode,
  stats: "minimal", // See https://webpack.js.org/configuration/stats/

  // Enable sourcemaps for debugging webpack's output.
  devtool: isTest ? "inline-source-map" : "source-map",
  // todo: enhance this part
  devServer: {
    allowedHosts: "auto",
    compress: false,
    port: 3001,
    http2: false,
    historyApiFallback: {
      rewrites: [
        {
          from: /^\/(professional|caregiver|patient|login|signup|request-password-reset|confirm-password-reset|new-consent|renew-consent)/,
          to: (context) => {
            const dirname = path.dirname(context.parsedUrl.pathname);
            const basename = path.basename(context.parsedUrl.pathname);
            const now = new Date().toISOString();
            if (basename.indexOf(".") > 0 && dirname !== "/") {
              console.log(now, context.request.method, context.parsedUrl.pathname, "=>", `/${basename}`);
              return `/${basename}`;
            }
            console.log(now, context.request.method, context.parsedUrl.pathname);
            return "/";
          },
        },
      ],
    },
    hot: true,
    devMiddleware: {
      publicPath: "/",
    },
    static: {
      staticOptions: {
        redirect: true,
      },
    },
    client: {
      progress: true,
      logging: "verbose",
    },
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions. , ".js", ".json", ".css", ".html"
    extensions: [".ts", ".tsx", ".js", ".css"],
    alias,
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
    },
  },

  resolveLoader: {
    alias,
  },

  experiments: {
    asset: true,
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        parallel: true,
        extractComments: isProduction,
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          ie8: false,
          safari10: false,
          toplevel: true,
          sourceMap: true,
          ecma: 2017,
          compress: {},
          output: {
            comments: false,
            beautify: false,
          },
        },
      }),
      new CssMinimizerPlugin({}),
    ],
    splitChunks: {
      chunks: "all",
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 5,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /\/node_modules\//,
          priority: -10,
          reuseExistingChunk: true,
          idHint: "vendors",
          filename: "soup.[contenthash].bundle.js",
        },
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true,
          idHint: "yourloops",
          filename: "yourloops.[contenthash].bundle.js",
        },
      },
    },
  },

  plugins,
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
      blipWebpack.babelLoaderConfiguration,
      blipWebpack.lessLoaderConfiguration,
      blipWebpack.cssLoaderConfiguration,
      blipWebpack.imageLoaderConfiguration,
      blipWebpack.fontLoaderConfiguration,

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: reJTSX, loader: "source-map-loader" },
      { test: /locales\/languages\.json$/, loader: "../../webpack.locales-loader.js" },
    ],
  },
};

module.exports = webpackConfig;
