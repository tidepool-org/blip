var webdriver = require('selenium-webdriver');
var expect = require('chai').expect;
var helpers = require('../lib/e2ehelpers');

describe('Login', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var authenticate = helpers.authenticate;
  var By = webdriver.By;

  var username;
  var password;

  before(function() {
    driver = helpers.newDriver();
  });

  after(function(done) {
    driver.quit().then(done);
  });

  beforeEach(function() {
    username = 'demo';
    password = 'demo';
  });

  it('should log in with correct credentials', function(done) {
    openApp()
      .then(authenticate)
      .then(checkLoginButtonIsPresent)
      .then(function(result) {
        expect(result).to.be.false;
        done();
      });
  });

  it('should show an error if username is not filled in', function(done) {
    openApp()
      .then(fillOutPassword)
      .then(submitForm)
      .then(getMessageText)
      .then(function(text) {
        expect(text).to.be.ok;
        done();
      });
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

  it('should show an error if login failed', function(done) {
    password = 'wrong';

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
    return driver.findElement(By.name('username')).sendKeys(username);
  }

  function fillOutPassword() {
    return driver.findElement(By.name('password')).sendKeys(password);
  }

  function submitForm() {
    return driver.findElement(By.css('.js-login-form-button')).click();
  }

  function getMessageText() {
    return driver.findElement(By.css('.js-login-message')).getText();
  }

  function checkLoginButtonIsPresent() {
    return helpers.elementExists(By.css('.js-login-form-button'));
  }
});