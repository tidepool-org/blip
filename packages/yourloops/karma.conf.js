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
      base: 'ChromeHeadless',
      flags: [
        '--enable-automation',
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-translate',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-device-discovery-notifications',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--headless',
        '--no-sandbox',
        '--remote-debugging-port=9222',
      ],
    },
  },
  coverageReporter: {
    dir: path.join(__dirname, "coverage"),
    reporters: [
      { type: "html" },
      { type: "text" },
    ],
  },
  mime: {
    "text/x-typescript": ["ts", "tsx"],
  },
  files: ["test/index.ts"],
  frameworks: ["mocha"],
  preprocessors: {
    "test/index.ts": "webpack",
  },
  reporters: ["mocha", "coverage"],
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
