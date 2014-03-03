var chai = require('chai');
var chaiWebdriver = require('chai-webdriver');
var helpers = require('./e2ehelpers');

// Initialize a WebDriver instance before test run
// Close it when test run completes
// 
// Run this as part of your tests, i.e.:
// `$ mocha test/lib/e2esetup.js test/e2e/some_other_test.js`

var driver;

before(function() {
  driver = helpers.newDriver();
  chai.use(chaiWebdriver(driver));
});

after(function(done) {
  driver.quit().then(done);
});