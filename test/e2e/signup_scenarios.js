var webdriver = require('selenium-webdriver');
var chai = require('chai');
var expect = chai.expect;
var chaiWebdriver = require('chai-webdriver');
var helpers = require('../lib/e2ehelpers');

describe('Signup', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var By = webdriver.By;

  var user;

  beforeEach(function() {
    user = {
      username: 'demo2',
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
      .then(function() {
        expect('.js-navbar-user').dom.to.be.visible();
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
      .then(function() {
        expect('.js-form-notification').dom.to.contain.text('already exists');
        done();
      });
  });

  function goToSignupPage() {
    return helpers.findElement(By.css('.js-signup-link'))
      .then(function(q) {
        return q.click();
      });
  }

  function fillOutForm() {
    helpers.findElement(By.name('firstName'))
      .then(function(q) { return q.sendKeys(user.firstName); });
    helpers.findElement(By.name('lastName'))
      .then(function(q) { return q.sendKeys(user.lastName); });
    helpers.findElement(By.name('username'))
      .then(function(q) { return q.sendKeys(user.username); });
    return helpers.findElement(By.name('password'))
      .then(function(q) { return q.sendKeys(user.password); });
  }

  function submitForm() {
    return helpers.findElement(By.css('.js-form-submit'))
      .then(function(q) {
        return q.click();
      });
  }
});