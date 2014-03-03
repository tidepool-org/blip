var webdriver = require('selenium-webdriver');
var chai = require('chai');
var expect = chai.expect;
var chaiWebdriver = require('chai-webdriver');
var helpers = require('../lib/e2ehelpers');

var testUser = require('../../data/sample/user.json');

describe('Profile', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var authenticate = helpers.authenticate;
  var By = webdriver.By;

  var user;

  beforeEach(function() {
    user = testUser;
  });

  it('should show user attribute values', function(done) {
    openApp()
      .then(authenticate)
      .then(goToProfile)
      .then(function() {
        expect('[name="firstName"]').dom.to.have.value(user.firstName);
        expect('[name="lastName"]').dom.to.have.value(user.lastName);
        expect('[name="username"]').dom.to.have.value(user.username);
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
      .then(goToProfile)
      .then(fillOutForm)
      .then(submitForm)
      .then(function() {
        expect('.js-form-notification').dom.to.contain.text('All changes saved');
        done();
      });
  });

  function goToProfile() {
    return helpers.findElement(By.css('.js-navbar-profile-link'))
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
});