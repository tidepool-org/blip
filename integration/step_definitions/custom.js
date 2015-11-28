module.exports = function () {
  this.World = require('../support/world');

  this.Given(/^I am on the login page$/, function (next) {
    this.visit('/login', next);
  });

  this.Given(/^I am on the signup page with no key or email set$/, function (next) {
    this.visit('/signup', next);
  });

  this.Given(/^I am on the signup page with key and email set$/, function (next) {
    this.visit('/signup?inviteKey=awesome&inviteEmail=gordonmdent@gmail.com', next);
  });

  this.When(/^I click on the forgot password link$/, function (next) {
    this.browser.clickLink('I forgot my password', next);
  });

  this.Then(/^I should see a login form$/, function (next) {
    this.browser.assert.element('.login form input[type=email]');
    this.browser.assert.element('.login form input[type=password]');
    this.browser.assert.element('.login form button');
    next();
  });

  this.Then(/^I should see a forgot my password link$/, function (next) {
    this.browser.assert.attribute('.login-forgotpassword a', 'href', '/request-password-reset');
    next();
  });

  this.Then(/^I should see a request password form$/, function (next) {
    this.browser.assert.element('.PasswordReset form input[type=email]');
    this.browser.assert.element('.PasswordReset form button');
    next();
  });

  this.Then(/^I should be on the request password page$/, function(next) {
    this.browser.assert.url(this.host + '/request-password-reset');
    next();
  });

  this.Then(/^I should see a signup form$/, function (next) {
    this.browser.assert.element('.signup form input[name=fullName]');
    this.browser.assert.element('.signup form input[name=username]');
    this.browser.assert.element('.signup form input[name=password]');
    this.browser.assert.element('.signup form input[name=passwordConfirm]');
    this.browser.assert.element('.signup form button');
    next();
  });

  this.Then(/^I should see a waitlist form$/, function (next) {
    this.browser.assert.element('.waitlist .waitlist-container');
    next();
  });
};