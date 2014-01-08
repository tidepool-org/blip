var webdriver = require('selenium-webdriver');
var expect = require('chai').expect;
var helpers = require('../lib/e2ehelpers');

describe('Login', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var By = webdriver.By;

  before(function() {
    driver = helpers.newDriver();
  });

  after(function(done) {
    driver.quit().then(done);
  });

  it('should show an error if password is not filled in', function(done) {
    openApp()
      .then(fillOutUsername)
      .then(submitForm)
      .then(getMessageText)
      .then(function(text) {
        expect(text).to.be.ok;
        done();
      });
  });

  function fillOutUsername() {
    var username = 'demo@example.com';
    return driver.findElement(By.name('username')).sendKeys(username);
  }

  function submitForm() {
    return driver.findElement(By.css('.js-login-form-button')).click();
  }

  function getMessageText() {
    return driver.findElement(By.css('.js-login-message')).getText();
  }
});