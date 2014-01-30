var webdriver = require('selenium-webdriver');
var _ = require('lodash');

var APP_URL = 'http://localhost:3000';
var DRIVER_CAPABILITIES = webdriver.Capabilities.chrome();

var By = webdriver.By;

var driver;

var helpers = {
  getDriver: function() {
    return driver;
  },

  newDriver: function() {
    driver = new webdriver.Builder().
      withCapabilities(DRIVER_CAPABILITIES).
      build();
    return driver;
  },

  openApp: function() {
    var deferred = webdriver.promise.defer();
    driver.get(APP_URL).then(function () {
      deferred.fulfill();
    });
    return deferred.promise;
  },

  authenticate: function() {
    var username = 'demo';
    var password = 'demo';
    var deferred = webdriver.promise.defer();
    helpers.findElement(By.name('username'))
      .then(function(q) { return q.sendKeys(username); });
    helpers.findElement(By.name('password'))
      .then(function(q) { return q.sendKeys(password); });
    helpers.findElement(By.css('.js-form-submit'))
      .then(function(q) { return q.click(); })
      .then(deferred.fulfill);
    return deferred.promise;
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

  // See:
  // selenium-webdriver/lib/atoms/error.js
  errorCodes: {
    NO_SUCH_ELEMENT: 7
  }
};

module.exports = helpers;