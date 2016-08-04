const webpackConf = require('./webpack.config.js');
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
    frameworks: ['mocha', 'chai'],
    files: [
      'loadtests.js',
    ],
    preprocessors: {
      'loadtests.js': ['webpack'],
    },
    reporters: ['mocha'],
    webpack: webpackConf,
    webpackServer: {
      noInfo: true,
    },
  });
};
