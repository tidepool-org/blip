var webdriver = require('selenium-webdriver');
var expect = require('salinity').expect;
var helpers = require('../lib/e2ehelpers');
var _ = require('lodash');

var patientId = '11';
var testPatient = require('../../data/sample/patients/' + patientId +'.json');

describe('Profile', function() {
  var openAppTo = helpers.openAppTo;
  var By = webdriver.By;

  var patient;

  beforeEach(function() {
    patient = testPatient;
  });

  it('should show patient attribute values', function(done) {
    openAppToPatientEdit()
      .then(function() {
        expect('[name="birthday"]').dom.to.have.value(patient.birthday);
        expect('[name="diagnosisDate"]').dom.to.have.value(patient.diagnosisDate);
        expect('[name="aboutMe"]').dom.to.have.value(patient.aboutMe);
        done();
      });
  });

  it('should allow to change patient attribute values', function(done) {
    patient = {
      birthday: '1990-01-23',
      diagnosisDate: '2003-02-21',
      aboutMe: 'I\'m testing this app'
    };

    openAppToPatientEdit()
      .then(fillOutForm)
      .then(submitForm)
      .then(function() {
        expect('.js-form-notification').dom.to.contain.text('All changes saved');
        done();
      });
  });

  it('should have link to go back to patient view', function(done) {
    openAppToPatientEdit()
      .then(clickBackLink)
      .then(function() {
        expect('.js-patient-page').dom.to.be.visible();
        done();
      });
  });

  it('should disable form submit when fetching patient data', function(done) {
    openAppToPatientEdit({
      'api.patient.get.delay': 10000
    })
      .then(function() {
        expect('.js-form-submit').dom.to.be.disabled();
        done();
      });
  });

  function openAppToPatientEdit(qs) {
    return openAppTo('/patients/' + patientId + '/edit', _.assign({
      'auth.skip': true
    }, qs));
  }

  function fillOutForm() {
    helpers.findElement(By.name('birthday'))
      .then(helpers.clearInput)
      .then(function(q) { return q.sendKeys(patient.birthday); });
    helpers.findElement(By.name('diagnosisDate'))
      .then(helpers.clearInput)
      .then(function(q) { return q.sendKeys(patient.diagnosisDate); });
    return helpers.findElement(By.name('aboutMe'))
      .then(helpers.clearInput)
      .then(function(q) { return q.sendKeys(patient.aboutMe); });
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