var webdriver = require('selenium-webdriver');
var expect = require('salinity').expect;
var helpers = require('../lib/e2ehelpers');

describe('Patients', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var authenticate = helpers.authenticate;
  var By = webdriver.By;

  it('should show user patient', function(done) {
    openApp()
      .then(authenticate)
      .then(function() {
        expect('.js-patients-user .js-patient').dom.to.have.count(1);
        done();
      });
  });

  it('should show shared patients', function(done) {
    openApp()
      .then(authenticate)
      .then(function() {
        expect('.js-patients-shared .js-patient')
          .dom.to.have.count(3);
        done();
      });
  });
});