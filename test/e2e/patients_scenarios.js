var webdriver = require('selenium-webdriver');
var expect = require('salinity').expect;
var helpers = require('../lib/e2ehelpers');
var _ = require('lodash');

describe('Patients', function() {
  var openAppTo = helpers.openAppTo;
  var By = webdriver.By;

  it('should show user patient', function(done) {
    openAppToPatients()
      .then(function() {
        expect('.js-patients-user .js-patient').dom.to.have.count(1);
        done();
      });
  });

  it('should show shared patients', function(done) {
    openAppToPatients()
      .then(helpers.sleep(200))
      .then(function() {
        expect('.js-patients-shared .js-patient').dom.to.have.count(3);
        done();
      });
  });

  it('should show create button if user has no patient profile', function(done) {
    openAppToPatients({
      'api.user.get.nopatient': true
    })
      .then(function() {
        expect('.js-create-patient-profile').dom.to.be.visible();
        done();
      });
  });

  it('should show message if user has no shared patients', function(done) {
    openAppToPatients({
      'api.patient.getall.empty': true
    })
      // Wait a bit for loading placeholders to clear
      .then(helpers.sleep(200))
      .then(function() {
        expect('.js-patients-shared-empty').dom.to.be.visible();
        done();
      });
  });

  it('should show placeholder when fetching user patient', function(done) {
    openAppToPatients({
      'api.user.get.delay': 10000
    })
      .then(function() {
        expect('.js-patients-user .js-patient-empty').dom.to.have.count(1);
        done();
      });
  });

  it('should show placeholder when fetching shared patients', function(done) {
    openAppToPatients({
      'api.patient.getall.delay': 10000
    })
      .then(function() {
        expect('.js-patients-shared .js-patient-empty').dom.to.have.count(2);
        done();
      });
  });

  function openAppToPatients(qs) {
    return openAppTo('/patients', _.assign({
      'auth.skip': true
    }, qs));
  }
});