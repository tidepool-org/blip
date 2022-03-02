/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
const _ = require("lodash");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { SubresourceIntegrityPlugin } = require("webpack-subresource-integrity");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const blipWebpack = require("./webpack.config.blip");
const buildConfig = require("../../server/config.app");
const brandings = require("../../branding/branding.json");
const languages = require("../../locales/languages.json");
const pkg = require("./package.json");

/** Match files ending with .js | .jsx | .ts | .tsx */
const reJTSX = /\.[jt]sx?$/;

// Compile mode
const mode =
  process.argv.indexOf("--mode=production") >= 0 || process.env.NODE_ENV === "production" ? "production" : "development";
const isTest = process.env.NODE_ENV === "test";
const isProduction = mode === "production";
const isDev = !isProduction;

if (!(buildConfig.BRANDING in brandings)) {
  throw new Error("Invalid branding");
}

console.log(`Compiling ${pkg.name} v${pkg.version} for ${mode}`);
console.log(`Branding: ${buildConfig.BRANDING}`);

if (process.env.USE_WEBPACK_DEV_SERVER === "true") {
  console.log(buildConfig);
}

const branding = brandings[buildConfig.BRANDING];

const alias = {
  "branding/theme.css": path.resolve(__dirname, "../../branding/theme.css"),
  "branding/logo.png": path.resolve(__dirname, `../../branding/${branding["branding/logo.png"]}`),
  "branding/pdf-logo.png": path.resolve(__dirname, `../../branding/${branding["branding/pdf-logo.png"]}`),
  "branding/logo-icon.svg": path.resolve(__dirname, `../../branding/${branding["branding/logo-icon.svg"]}`),
  "branding/logo-full.svg": path.resolve(__dirname, `../../branding/${branding["branding/logo-full.svg"]}`),
  "branding/palette.css": path.resolve(__dirname, `../../branding/${branding["branding/palette.css"]}`),
  "pro-sante-connect.svg": path.resolve(__dirname, "images/pro-sante-connect-gris.svg"),
  "cartridge.png": path.resolve(__dirname, "../../branding/sitechange/cartridge.png"),
  "infusion.png": path.resolve(__dirname, "../../branding/sitechange/infusion.png"),
  "cartridge-vicentra.png": path.resolve(__dirname, "../../branding/sitechange/cartridge-vicentra.png"),
  "warmup-dexcom.svg": path.resolve(__dirname, "../../branding/warmup/warmup-dexcom.svg"),
  "diabeloop-logo.svg": path.resolve(__dirname, "../../branding/diabeloop/diabeloop-logo.svg"),
  "diabeloop-label.svg": path.resolve(__dirname, "../../branding/diabeloop/diabeloop-label.svg"),
  ...blipWebpack.resolve.alias,
};


// Dynamically import dayjs locales from our declared locales

const dayJSLocales = _.map(_.keysIn(languages.resources), (lang) => `dayjs/locale/${lang}`);
// Bundle the dayjs plugins too
dayJSLocales.push("dayjs/plugin/utc");
dayJSLocales.push("dayjs/plugin/timezone");
dayJSLocales.push("dayjs/plugin/localizedFormat");
if (!isProduction) {
  dayJSLocales.push("dayjs/plugin/devHelper");
}

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
    favicon: path.resolve(__dirname, `../../branding/${buildConfig.BRANDING}/favicon.ico`),
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
  entry: {
    nodeCompat: { import: path.resolve(__dirname, "../../node-compat.js"), runtime: false, filename: "node-compat.[contenthash].js" },
    dayjs: { import: dayJSLocales, runtime: false, filename: "dayjs.[contenthash].js" },
    yourloops: { import: path.resolve(__dirname, "./app/index.tsx"), dependOn: ["nodeCompat", "dayjs"], filename: "yourloops.[contenthash].js" },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    chunkFilename: "[id].[contenthash].js",
    crossOriginLoading: "anonymous",
    assetModuleFilename: "[contenthash][ext]",
  },
  target: "web",
  mode,
  stats: "minimal", // See https://webpack.js.org/configuration/stats/

  // Enable sourcemaps for debugging webpack's output.
  devtool: isTest || isDev ? "inline-source-map" : "source-map",
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
    cache: true,
    symlinks: true,
  },

  resolveLoader: {
    alias,
  },

  optimization: {
    realContentHash: true,
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
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: "all",
      minSize: 32768,
      cacheGroups: {
        polyfills: {
          test: /\/node_modules\/(.*babel.*|core-js.*)\//,
          priority: 0,
          reuseExistingChunk: true,
          idHint: "polyfills",
          filename: "polyfills.[contenthash].js",
        },
        d3: {
          test: /\/node_modules\/.*d3.*\//,
          priority: 0,
          reuseExistingChunk: true,
          idHint: "d3",
          filename: "d3.[contenthash].js",
        },
        pdfkit: {
          test: /\/node_modules\/pdfkit\//,
          priority: 0,
          reuseExistingChunk: true,
          idHint: "pdfkit",
          filename: "pdfkit.[contenthash].js",
        },
        react: {
          test: /\/node_modules\/(@material-ui|.*react.*)\//,
          priority: 0,
          reuseExistingChunk: true,
          idHint: "react",
          filename: "react.[contenthash].js",
        },
        modules: {
          test: /(node_modules)/,
          priority: -1,
          reuseExistingChunk: true,
          idHint: "modules",
          filename: "modules.[contenthash].js",
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
