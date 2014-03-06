// Prevent this file from being reloaded more than once during execution
// This allows us to re-use the same WebDriver instance for all tests
require('require-guard')();

var crypto = require('crypto');
var webdriver = require('selenium-webdriver');
var _ = require('lodash');
var queryString = require('query-string');
var sauce = require('./saucelabs');

var APP_URL = 'http://localhost:3000';
var noAuthRoutes = ['/login', '/signup'];

var By = webdriver.By;

var driver;

var helpers = {
  getDriver: function() {
    return driver;
  },

  newDriver: function() {
    if (process.env.SAUCE) {
      driver = sauce.createNewDriver();
      return driver;
    }

    driver = new webdriver.Builder().
      withCapabilities(webdriver.Capabilities.chrome()).
      build();
    return driver;
  },

  openApp: function() {
    var deferred = webdriver.promise.defer();
    driver.get(APP_URL)
      .then(deferred.fulfill);
    return deferred.promise;
  },

  openAppTo: function(path, qs) {
    qs = qs || {};
    var deferred = webdriver.promise.defer();

    // Add random token to query string to force refresh
    qs.token = helpers._randomToken();
    // Go to requested url
    var url = helpers._makeUrl(path, qs);
    driver.get(url)
      .then(deferred.fulfill);

    return deferred.promise;
  },

  _randomToken: function(len) {
    len = len || 6;
    return crypto.randomBytes(Math.ceil(len/2))
      .toString('hex')
      .slice(0, len);
  },

  _makeUrl: function(path, qs) {
    path = path || '/';
    qs = qs || {};
    qs = queryString.stringify(qs);
    if (qs) {
      qs = '?' + qs;
    }
    else {
      qs = '';
    }
    var url = [APP_URL, qs, '/#', path].join('');
    return url;
  },

  // Wrapper around `driver.findElement` that throws a more useful error
  // by printing the "locator" used to find the element and shortening stack
  findElement: function(locator) {
    var deferred = webdriver.promise.defer();
    driver.findElement(locator)
      .then(deferred.fulfill, function(err) {
        if (err.code === helpers.errorCodes.NO_SUCH_ELEMENT) {
          err.message = 'no such element ' + locator.toString();
          // Stack is very long and not very useful here...
          var stack = err.stack.split('\n');
          // Filter out all lines from third-party code ('node_modules')
          stack = _.filter(stack, function(line) {
            return !_.contains(line, 'node_modules');
          });
          // Replace first line with new error message
          stack[0] = err.toString();
          err.stack = stack.join('\n');
        }
        deferred.reject(err);
      });
    return deferred.promise;
  },

  sleep: function(delay) {
    return function() {
      return driver.sleep(delay);
    };
  },

  // See:
  // selenium-webdriver/lib/atoms/error.js
  errorCodes: {
    NO_SUCH_ELEMENT: 7
  }
};

module.exports = helpers;