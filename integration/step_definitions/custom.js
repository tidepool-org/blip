module.exports = function () {
  this.World = new require('../support/world');

  var EMAIL = '.login form input[type=email]';
  var PASSWD = '.login form input[type=password]';
  var REMEMBER = '.login form input[type=checkbox]';
  var LOGIN = '.login form button';

  // no-auth routes
  this.Given(/^I am on the login page$/, function (next) {
    this.visit('/login', next);
  });

  this.Given(/^I am on the request password page$/, function (next) {
    this.visit('/request-password-reset', next);
  });

  this.Given(/^I am on the signup page with no key or email set$/, function (next) {
    this.visit('/signup', next);
  });

  this.Given(/^I am on the signup page with an invalid key set$/, function (next) {
    this.visit('/signup?inviteKey=thisisnotakey', next);
  });

  this.Given(/^I am on the signup page with \(valid\) key and email set$/, function (next) {
    this.visit('/signup?inviteKey=thisisakey&inviteEmail=gordonmdent@gmail.com', next);
  });

  this.Given(/^I am on the signup page with \(invalid\) key and email set$/, function (next) {
    this.visit('/signup?inviteKey=thisisnotakey&inviteEmail=gordonmdent@gmail.com', next);
  });

  this.Given(/^I am on the signup page with just \(valid\) key set$/, function (next) {
    this.visit('/signup?inviteKey=thisisakey', next);
  });

  this.Given(/^I am on the signup page with just email set$/, function (next) {
    this.visit('/signup?inviteEmail=gordonmdent@gmail.com', next);
  });

  this.Given(/^I am logged in without 'Remember Me'$/, function (next) {
    var self = this;
    this.visit('/login', function() {
      self.browser.fill(EMAIL, 'jane+skip@tidepool.org')
        .fill(PASSWD, 'password')
        .pressButton(LOGIN, function(err) {
          // we expect an error if the user doesn't have any open invitations
          // because /confirm/invitations/:userid returns a 404
          if (err) {}
          next();
        });
    });
  });

  this.Given(/^I am logged in with 'Remember Me' checked$/, function (next) {
    var self = this;
    this.visit('/login', function() {
      self.browser.fill(EMAIL, 'jane+skip@tidepool.org')
        .fill(PASSWD, 'password')
        .check(REMEMBER)
        .pressButton(LOGIN, function(err) {
          // we expect an error if the user doesn't have any open invitations
          // because /confirm/invitations/:userid returns a 404
          if (err) {}
          next();
        });
    });
  });

  this.When(/^I click on the forgot password link$/, function (next) {
    this.browser.clickLink('I forgot my password', next);
  });

  this.When(/^I enter and submit my credentials$/, function (next) {
    this.browser.fill(EMAIL, 'jane+skip@tidepool.org')
      .fill(PASSWD, 'password')
      .pressButton(LOGIN, function(err) {
        // we expect an error if the user doesn't have any open invitations
        // because /confirm/invitations/:userid returns a 404
        if (err) {}
        next();
      });
  });

  this.When(/^I navigate to the login page$/, function (next) {
    this.visit('/login', function(err) {
      // we expect an error if the user doesn't have any open invitations
      // because /confirm/invitations/:userid returns a 404
      if (err) {}
      next();
    });
  });

  this.Then(/^I should be on the login page$/, function (next) {
    this.browser.assert.url(this.host + '/login');
    next();
  });

  this.Then(/^I should see a login form$/, function (next) {
    this.browser.assert.element(EMAIL);
    this.browser.assert.element(PASSWD);
    this.browser.assert.element(LOGIN);
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

  // you must configure an INVITE_KEY locally for this to work!
  this.Then(/^I should see a waitlist form$/, function (next) {
    this.browser.assert.element('.waitlist .waitlist-container');
    next();
  });
    
  this.Then(/^I should be on my care team memberships page$/, function (next) {
    this.browser.assert.url(this.host + '/patients');
    next();
  });
};
