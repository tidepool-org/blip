var webdriver = require('selenium-webdriver');
var chai = require('chai');
var expect = chai.expect;
var chaiWebdriver = require('chai-webdriver');
var helpers = require('../lib/e2ehelpers');

var patients = require('../../demo/sample/patients.json');

describe('Patients', function() {
  var driver = helpers.getDriver();
  var openApp = helpers.openApp;
  var authenticate = helpers.authenticate;
  var By = webdriver.By;

  before(function() {
    driver = helpers.newDriver();
    chai.use(chaiWebdriver(driver));
  });

  after(function(done) {
    driver.quit().then(done);
  });

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
          .dom.to.have.count(patients.length);
        done();
      });
  });
});