var webdriver = require('selenium-webdriver');
var expect = require('chai').expect;
var helpers = require('../lib/e2ehelpers');

var demoUser = require('../../demo/sample/user.json');

describe('Profile', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var authenticate = helpers.authenticate;
  var By = webdriver.By;

  var user;

  before(function() {
    driver = helpers.newDriver();
  });

  after(function(done) {
    driver.quit().then(done);
  });

  beforeEach(function() {
    user = demoUser;
  });

  it('should show user attribute values', function(done) {
    openApp()
      .then(authenticate)
      .then(expectInputValueToBe('firstName', user.firstName))
      .then(expectInputValueToBe('lastName', user.lastName))
      .then(expectInputValueToBe('username', user.username))
      .then(function() {
        done();
      });
  });

  it('should allow to change user attribute values', function(done) {
    user = {
      firstName: 'Johnny',
      lastName: 'Smith',
      email: 'johnny.smith@example.com',
      password: 'pw',
      passwordConfirm: 'pw'
    };

    openApp()
      .then(authenticate)
      .then(fillOutForm)
      .then(submitForm)
      .then(getMessageText)
      .then(function(text) {
        expect(text).to.equal('All changes saved.');
        done();
      });
  });

  function fillOutForm() {
    driver.findElement(By.name('firstName')).sendKeys(user.firstName);
    driver.findElement(By.name('lastName')).sendKeys(user.lastName);
    driver.findElement(By.name('username')).sendKeys(user.username);
    driver.findElement(By.name('password')).sendKeys(user.password);
    return driver.findElement(By.name('passwordConfirm'))
      .sendKeys(user.passwordConfirm);
  }

  function submitForm() {
    return driver.findElement(By.css('.js-profile-button')).click();
  }

  function getMessageText() {
    return driver.findElement(By.css('.js-profile-message')).getText();
  }

  function expectInputValueToBe(inputName, expectedValue) {
    return function() {
      return driver.findElement(By.name(inputName)).getAttribute('value')
        .then(function(value) {
          expect(value).to.equal(expectedValue);
        });
    };
  }
});