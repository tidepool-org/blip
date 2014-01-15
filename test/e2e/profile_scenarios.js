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
    helpers.findElement(By.name('firstName'))
      .then(function(q) { return q.sendKeys(user.firstName); });
    helpers.findElement(By.name('lastName'))
      .then(function(q) { return q.sendKeys(user.lastName); });
    helpers.findElement(By.name('username'))
      .then(function(q) { return q.sendKeys(user.username); });
    helpers.findElement(By.name('password'))
      .then(function(q) { return q.sendKeys(user.password); });
    return helpers.findElement(By.name('passwordConfirm'))
      .then(function(q) { return q.sendKeys(user.passwordConfirm); });
  }

  function submitForm() {
    return helpers.findElement(By.css('.js-form-submit'))
      .then(function(q) {
        return q.click();
      });
  }

  function getMessageText() {
    return helpers.findElement(By.css('.js-form-notification'))
      .then(function(q) {
        return q.getText();
      });
  }

  function expectInputValueToBe(inputName, expectedValue) {
    return function() {
      return helpers.findElement(By.name(inputName))
        .then(function(q) { return q.getAttribute('value'); })
        .then(function(value) {
          expect(value).to.equal(expectedValue);
        });
    };
  }
});