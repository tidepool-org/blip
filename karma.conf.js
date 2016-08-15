const path = require('path');
const webpackConf = require('./webpack.config.js');

webpackConf.module.preLoaders = [
  {
    test: /\.(js)$/,
    loader: 'isparta-loader',
    include: [
      path.join(__dirname, '/../src'),
    ],
  },
];

webpackConf.externals = {
  cheerio: 'window',
  'react/addons': true,
  'react/lib/ExecutionEnvironment': true,
  'react/lib/ReactContext': true,
};

module.exports = function karmaConfig(config) {
  config.set({
    browsers: ['PhantomJS'],
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000,
    singleRun: true,
    colors: true,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      'loadtests.js',
    ],
    preprocessors: {
      'loadtests.js': ['webpack'],
    },
    reporters: ['mocha', 'coverage'],
    webpack: webpackConf,
    webpackServer: {
      noInfo: true,
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html' },
        { type: 'text' },
      ],
    },
  });
};
