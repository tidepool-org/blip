/**
 * Copyright (c) 2021, Diabeloop
 * Karma test configuration file
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const _ = require("lodash");
const webpack = require("./webpack.config.js");

const isWSL = _.isString(process.env.WSL_DISTRO_NAME);
const browsers = ["CustomChromeHeadless"];
if (!isWSL) {
  browsers.push("FirefoxHeadless");
}

delete webpack.entry;
webpack.devtool = "inline-source-map";
webpack.module.rules[0].options = { configFile: "tsconfig.test.json" };
webpack.module.rules.push({
  test: /\.tsx?$/,
  exclude: /node_modules/,
  loader: "@jsdevtools/coverage-istanbul-loader",
  enforce: "post",
  options: {
    esModules: true,
  },
});

const karmaConfig = {
  autoWatch: false,
  port: "8080",
  browserNoActivityTimeout: 60000,
  captureTimeout: 60000,
  colors: true,
  concurrency: 1,
  singleRun: true,
  browsers,
  customLaunchers: {
    CustomChromeHeadless: {
      base: "ChromeHeadless",
      flags: [
        "--enable-automation",
        "--no-default-browser-check",
        "--no-first-run",
        "--disable-default-apps",
        "--disable-popup-blocking",
        "--disable-translate",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-device-discovery-notifications",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--headless",
        "--no-sandbox",
        "--remote-debugging-port=9222",
      ],
    },
  },
  coverageIstanbulReporter: {
    // reports can be any that are listed here: https://github.com/istanbuljs/istanbuljs/tree/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib
    reports: ["html", "text-summary"],
    // base output directory. If you include %browser% in the path it will be replaced with the karma browser name
    dir: path.join(__dirname, "coverage"),
    // Combines coverage information from multiple browsers into one report rather than outputting a report for each browser.
    combineBrowserReports: true,
    // if using webpack and pre-loaders, work around webpack breaking the source path
    fixWebpackSourcePaths: false,
    // Omit files with no statements, no functions and no branches covered from the report
    skipFilesWithNoCoverage: true,
    // Most reporters accept additional config options. You can pass these through the `report-config` option
    "report-config": {
      // all options available at: https://github.com/istanbuljs/istanbuljs/blob/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib/html/index.js#L257-L261
      html: {
        // outputs the report in ./coverage/html
        subdir: "html",
      },
    },
    // enforce percentage thresholds
    // anything under these percentages will cause karma to fail with an exit code of 1 if not running in watch mode
    thresholds: {
      emitWarning: true, // set to `true` to not fail the test command when thresholds are not met
      // thresholds for all files
      global: {
        statements: 90,
        lines: 95,
        branches: 95,
        functions: 100,
      },
      // thresholds per file
      // each: {
      //   statements: 100,
      //   lines: 100,
      //   branches: 100,
      //   functions: 100,
      //   overrides: {
      //     'baz/component/**/*.js': {
      //       statements: 98
      //     }
      //   }
      // },
    },

    verbose: true, // output config used by istanbul for debugging
  },
  mime: {
    "text/x-typescript": ["ts", "tsx"],
  },
  files: ["test/index.ts"],
  frameworks: ["mocha"],
  preprocessors: {
    "test/index.ts": "webpack",
  },
  reporters: ["mocha", "coverage-istanbul"],
  webpack,
  webpackMiddleware: {
    noInfo: true,
    stats: "errors-only",
  },
};

function setKarmaConfig(config) {
  karmaConfig.logLevel = config.LOG_INFO;
  config.set(karmaConfig);
}

module.exports = setKarmaConfig;
