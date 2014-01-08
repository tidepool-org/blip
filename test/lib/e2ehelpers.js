var webdriver = require('selenium-webdriver');

var APP_URL = 'http://localhost:3000';
var DRIVER_CAPABILITIES = webdriver.Capabilities.chrome();

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
  }
};

module.exports = helpers;