var webdriver = require('selenium-webdriver');
var expect = require('chai').expect;
var helpers = require('../lib/e2ehelpers');

describe('Login', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;

  before(function() {
    driver = helpers.newDriver();
  });

  after(function(done) {
    driver.quit().then(done);
  });

  it('should have correct page title', function(done) {
    openApp()
      .then(function() {
        return driver.getTitle();
      }).then(function(title) {
        expect(title).to.equal('Blip');
        done();
      });
  });
});