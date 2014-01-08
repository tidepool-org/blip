var webdriver = require('selenium-webdriver');
var expect = require('chai').expect;
var helpers = require('../lib/e2ehelpers');

describe('Profile', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var authenticate = helpers.authenticate;
  var By = webdriver.By;

  before(function() {
    driver = helpers.newDriver();
  });

  after(function(done) {
    driver.quit().then(done);
  });

  it('should show the first name', function(done) {
    openApp()
      .then(authenticate)
      .then(function() {
        return driver.findElement(By.name('firstName')).getAttribute('value');
      }).then(function(value) {
        expect(value).to.equal('Mary');
        done();
      });
  });
});