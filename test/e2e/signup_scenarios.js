var webdriver = require('selenium-webdriver');
var expect = require('salinity').expect;
var helpers = require('../lib/e2ehelpers');

describe('Signup', function() {
  var openAppTo = helpers.openAppTo;
  var By = webdriver.By;

  var user;

  beforeEach(function() {
    user = {
      username: 'demo2',
      password: 'demo',
      fullName: 'John Doe'
    };
  });

  it('should create account with form filled out', function(done) {
    openAppToSignup()
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

    openAppToSignup()
      .then(fillOutForm)
      .then(submitForm)
      .then(function() {
        expect('.js-form-notification').dom.to.contain.text('already exists');
        done();
      });
  });

  it('should show terms overlay that is dismissed once accepted', function(done) {
    openAppToSignup()
      .then(fillOutForm)
      .then(submitForm)
      .then(acceptTerms)
      .then(function() {
        expect('.js-terms').dom.not.to.be.visible();
        done();
      });
  });

  function openAppToSignup(qs) {
    return openAppTo('/signup', qs);
  }

  function fillOutForm() {
    helpers.findElement(By.name('fullName'))
      .then(function(q) { return q.sendKeys(user.fullName); });
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

  function acceptTerms() {
    helpers.findElement(By.css('.js-terms-checkbox'))
      .then(function(q) { return q.click(); });
    return helpers.findElement(By.css('.js-terms-submit'))
      .then(function(q) { return q.click(); });
  }
});
