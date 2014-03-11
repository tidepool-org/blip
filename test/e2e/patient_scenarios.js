var webdriver = require('selenium-webdriver');
var expect = require('salinity').expect;
var helpers = require('../lib/e2ehelpers');
var _ = require('lodash');

var patientId = '21';
var patient = require('../../data/sample/patients/' + patientId +'.json');
var userPatientId = '11';

describe('Patient', function() {
  var openAppTo = helpers.openAppTo;
  var By = webdriver.By;

  it('should show patient attribute values', function(done) {
    var birthdayYear = patient.birthday.slice(0, 4);
    var diagnosisYear = patient.diagnosisDate.slice(0, 4);

    openAppToPatient(patientId)
      .then(function() {
        expect('[name="firstName"]').dom.to.have.text(patient.firstName);
        expect('[name="lastName"]').dom.to.have.text(patient.lastName);
        expect('[name="aboutMe"]').dom.to.have.text(patient.aboutMe);
        expect('[name="age"]').dom.to.contain.text(birthdayYear);
        expect('[name="diagnosis"]').dom.to.contain.text(diagnosisYear);
        done();
      });
  });

  it('should not show patient attribute if has no value', function(done) {
    var noAboutMePatientId = '31';

    openAppToPatient(noAboutMePatientId)
      // For some reason here, need to give time for app to render patient
      // (and get rid of "loading" placeholders, which includes "aboutMe")
      .then(helpers.sleep(200))
      .then(function() {
        return helpers.elementExists(By.name('aboutMe'));
      })
      .then(function(aboutMeElementExists) {
        expect(aboutMeElementExists).to.be.false;
        done();
      });
  });

  it('should show edit button if user patient', function(done) {
    openAppToPatient(userPatientId)
      .then(helpers.sleep(200))
      .then(function() {
        expect('.js-edit-patient').dom.to.be.visible();
        done();
      });
  });

  it('should not show edit button if not user patient', function(done) {
    openAppToPatient(patientId)
      .then(helpers.sleep(200))
      .then(function() {
        return helpers.elementExists(By.css('.js-edit-patient'));
      })
      .then(function(editButtonExists) {
        expect(editButtonExists).to.be.false;
        done();
      });
  });

  it('should have back link to patient data page', function(done) {
    openAppToPatient(patientId)
      .then(clickBackLink)
      .then(function() {
        expect('.js-patient-data-page').dom.to.be.visible();
        done();
      });
  });

  it('should show placeholder when fetching patient data', function(done) {
    openAppToPatient(patientId, {
      'api.patient.get.delay': 10000
    })
      .then(function() {
        expect('.js-patient-attribute-empty').dom.to.have.count(5);
        done();
      });
  });

  function openAppToPatient(id, qs) {
    return openAppTo('/patients/' + id, _.assign({
      'auth.skip': true
    }, qs));
  }

  function clickBackLink() {
    return helpers.findElement(By.css('.js-back'))
      .then(function(q) {
        return q.click();
      });
  }
});