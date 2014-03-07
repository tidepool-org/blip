var webdriver = require('selenium-webdriver');
var expect = require('salinity').expect;
var helpers = require('../lib/e2ehelpers');

describe('Login', function() {
  var openApp = helpers.openApp;
  var By = webdriver.By;

  var username;
  var password;

  beforeEach(function() {
    username = 'demo';
    password = 'demo';
  });

  it('should log in with correct credentials', function(done) {
    openApp()
      .then(fillOutUsername)
      .then(fillOutPassword)
      .then(submitForm)
      .then(function() {
        expect('.js-navbar-user').dom.to.be.visible();
        done();
      });
  });

  it('should show an error if login failed', function(done) {
    password = 'wrong';

    openApp()
      .then(fillOutUsername)
      .then(fillOutPassword)
      .then(submitForm)
      .then(function() {
        expect('.js-form-notification').dom.to.contain.text('Wrong username or password');
        done();
      });
  });

  function fillOutUsername() {
    return helpers.findElement(By.name('username'))
      .then(function(q) {
        return q.sendKeys(username);
      });
  }

  function fillOutPassword() {
    return helpers.findElement(By.name('password'))
      .then(function(q) {
        return q.sendKeys(password);
      });
  }

  function submitForm() {
    return helpers.findElement(By.css('.js-form-submit'))
      .then(function(q) {
        return q.click();
      });
  }
});