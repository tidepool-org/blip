var webdriver = require('selenium-webdriver');

var DEFAULT_BROWSER_ENV = 'chrome:32:Windows 8.1';

var sauce = {
  createNewDriver: function() {
    var caps = this._getCapabilities();
    var hubUrl = this._getHubUrl();

    var driver = new webdriver.Builder().
      withCapabilities(caps).
      usingServer(hubUrl).
      build();

    return driver;
  },

  _getCapabilities: function() {
    var testName = 'Blip (local)';
    var buildLabel;
    var tunnelIdentifier;
    var credentials = this._getCredentials();
    var browser = this._getBrowser();
    var tags = ['e2e', 'local'];

    var caps = new webdriver.Capabilities()
      .set('username', credentials.username)
      .set('accessKey', credentials.accessKey)
      .set(webdriver.Capability.BROWSER_NAME, browser[0])
      .set(webdriver.Capability.VERSION, browser[1])
      .set(webdriver.Capability.PLATFORM, browser[2]);

    if (process.env.TRAVIS) {
      testName = 'Blip';
      buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
      tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
      tags[1] = 'ci';

      caps
        .set('tunnel-identifier', tunnelIdentifier)
        .set('build', buildLabel);
    }

    caps
      .set('name', testName)
      .set('tags', tags);

    return caps;
  },

  _getCredentials: function() {
    var username = process.env.SAUCE_USERNAME;
    var accessKey = process.env.SAUCE_ACCESS_KEY;

    if (!(username && accessKey)) {
      throw new Error('Must set both SAUCE_USERNAME and SAUCE_ACCESS_KEY' +
                      ' env variables');
    }

    return {
      username: username,
      accessKey: accessKey
    };
  },

  _getBrowser: function() {
    var result;
    var browserEnv = process.env.BROWSER || DEFAULT_BROWSER_ENV;
    if (browserEnv) {
      result = browserEnv.split(':');
    }
    if (!result.length >= 3) {
      throw new Error('Unrecognized BROWSER env variable "' +
                      browserEnv + '"');
    }
    return result;
  },

  _getHubUrl: function() {
    var credentials = this._getCredentials();

    return [
      'http://',
      credentials.username, ':', credentials.accessKey,
      '@localhost:4445/wd/hub'
    ].join('');
  },
};

module.exports = sauce;