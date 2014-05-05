var webdriver = require('selenium-webdriver');
var expect = require('salinity').expect;
var helpers = require('../lib/e2ehelpers');
var _ = require('lodash');

var testUser = require('../../data/sample/user.json');

describe('Profile', function() {
  var openAppTo = helpers.openAppTo;
  var By = webdriver.By;

  var user;

  beforeEach(function() {
    user = testUser;
  });

  it('should show user attribute values', function(done) {
    openAppToProfile()
      .then(function() {
        expect('[name="fullName"]').dom.to.have.value(user.fullName);
        expect('[name="shortName"]').dom.to.have.value(user.shortName);
        expect('[name="username"]').dom.to.have.value(user.username);
        done();
      });
  });

  it('should allow to change user attribute values', function(done) {
    user = {
      fullName: 'Johnny Smith',
      shortName: 'Johnny',
      username: 'johnny.smith@example.com',
      password: 'pw',
      passwordConfirm: 'pw'
    };

    openAppToProfile()
      .then(fillOutForm)
      .then(submitForm)
      .then(function() {
        expect('.js-form-notification').dom.to.contain.text('All changes saved');
        done();
      });
  });

  it('should have link to go back to home page', function(done) {
    openAppToProfile()
      .then(clickBackLink)
      .then(function() {
        expect('.js-patients-page').dom.to.be.visible();
        done();
      });
  });

  it('should disable form submit when fetching profile data', function(done) {
    openAppToProfile({
      'api.user.get.delay': 10000
    })
      .then(function() {
        expect('.js-form-submit').dom.to.be.disabled();
        done();
      });
  });

  function openAppToProfile(qs) {
    return openAppTo('/profile', _.assign({
      'auth.skip': true
    }, qs));
  }

  function fillOutForm() {
    helpers.findElement(By.name('fullName'))
      .then(helpers.clearInput)
      .then(function(q) { return q.sendKeys(user.fullName); });
    helpers.findElement(By.name('shortName'))
      .then(helpers.clearInput)
      .then(function(q) { return q.sendKeys(user.shortName); });
    helpers.findElement(By.name('username'))
      .then(helpers.clearInput)
      .then(function(q) { return q.sendKeys(user.username); });
    helpers.findElement(By.name('password'))
      .then(helpers.clearInput)
      .then(function(q) { return q.sendKeys(user.password); });
    return helpers.findElement(By.name('passwordConfirm'))
      .then(helpers.clearInput)
      .then(function(q) { return q.sendKeys(user.passwordConfirm); });
  }

  function submitForm() {
    return helpers.findElement(By.css('.js-form-submit'))
      .then(function(q) {
        return q.click();
      });
  }

  function clickBackLink() {
    return helpers.findElement(By.css('.js-back'))
      .then(function(q) {
        return q.click();
      });
  }
});
