var webdriver = require('selenium-webdriver');
var expect = require('chai').expect;
var helpers = require('../lib/e2ehelpers');

describe('Signup', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var By = webdriver.By;

  var user;

  before(function() {
    driver = helpers.newDriver();
  });

  after(function(done) {
    driver.quit().then(done);
  });

  beforeEach(function() {
    user = {
      userusername: 'demo2',
      password: 'demo',
      firstName: 'John',
      lastName: 'Doe'
    };
  });

  it('should create account with form filled out', function(done) {
    openApp()
      .then(goToSignupPage)
      .then(fillOutForm)
      .then(submitForm)
      .then(checkSignupButtonIsPresent)
      .then(function(result) {
        expect(result).to.be.false;
        done();
      });
  });

  it('should show an error if signup failed', function(done) {
    // Username that already exists
    user.username = 'demo';

    openApp()
      .then(goToSignupPage)
      .then(fillOutForm)
      .then(submitForm)
      .then(getMessageText)
      .then(function(text) {
        expect(text).to.be.ok;
        done();
      });
  });

  function goToSignupPage() {
    return driver.findElement(By.css('.js-signup-link')).click();
  }

  function fillOutForm() {
    driver.findElement(By.name('firstName')).sendKeys(user.firstName);
    driver.findElement(By.name('lastName')).sendKeys(user.lastName);
    driver.findElement(By.name('username')).sendKeys(user.username);
    return driver.findElement(By.name('password')).sendKeys(user.password);
  }

  function submitForm() {
    return driver.findElement(By.css('.js-signup-button')).click();
  }

  function getMessageText() {
    return driver.findElement(By.css('.js-signup-message')).getText();
  }

  function checkSignupButtonIsPresent() {
    return helpers.elementExists(By.css('.js-signup-button'));
  }
});