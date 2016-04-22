/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

var _ = require('lodash');
var sundial = require('sundial');

//date masks we use
var FORM_DATE_FORMAT = 'MM/DD/YYYY';
var SERVER_DATE_FORMAT = 'YYYY-MM-DD';

var utils = require('./utils');

var personUtils = {};

personUtils.fullName = function(person) {
  return utils.getIn(person, ['profile', 'fullName']);
};

personUtils.patientInfo = function(person) {
  return utils.getIn(person, ['profile', 'patient']);
};

personUtils.hasAcceptedTerms = function(person) {
  return !_.isEmpty(_.get(person, 'termsAccepted', null));
};

personUtils.isPatient = function(person) {
  return Boolean(personUtils.patientInfo(person));
};

personUtils.patientFullName = function(person) {
  var profile = utils.getIn(person, ['profile'], {});
  var patientInfo = profile.patient || {};

  if (patientInfo.isOtherPerson) {
    return patientInfo.fullName;
  }

  return profile.fullName;
};

personUtils.patientIsOtherPerson = function(person) {
  return Boolean(utils.getIn(person, ['profile', 'patient', 'isOtherPerson']));
};

personUtils.isOnlyCareGiver = function(person) {
  return Boolean(utils.getIn(person, ['profile', 'isOnlyCareGiver']));
};

personUtils.isSame = function(first, second) {
  first = first || {};
  second = second || {};

  if (!(first.userid && second.userid)) {
    return false;
  }

  return (first.userid === second.userid);
};

personUtils.hasEditPermissions = function(person) {
  return (
    person &&
    !_.isEmpty(person.permissions) &&
    (person.permissions.admin || person.permissions.root)
  );
};

personUtils.isRemoveable = function(person) {
  return (
    person &&
    !_.isEmpty(person.permissions) &&
    !person.permissions.admin &&
    !person.permissions.root
  );
};

/**
   * Validate the form data
   *  - name has to be present (can only not be present if user is not patient)
   *  - date of birth needs to be a valid date, and not in the future
   *  - diagnosis date need to be a valid date, and not in the future, and not before date of birth
   *
   * @param  {Object} formValues
   * @param  {Boolean} isNameRequired
   * @param  {String} dateFormat of input
   * @param  {Date|null} currentDate mainly for testing purposes
   *
   * @return {String|undefined} returns a string if there is an error
   */
personUtils.validateFormValues = function(formValues, isNameRequired, dateFormat, currentDateObj) {
  var validationErrors = {};

  var INVALID_DATE_TEXT = 'Hmm, this date doesn’t look right';
  var OUT_OF_ORDER_TEXT = 'Hmm, diagnosis date usually comes after birthday';

  // Legacy: revisit when proper "child accounts" are implemented
  if (isNameRequired &&
      !formValues.fullName) {
    validationErrors.fullName = 'Full name is required';
  }

  var birthday = formValues.birthday;
  if (!(birthday && sundial.isValidDateForMask(birthday, dateFormat))) {
    validationErrors.birthday = INVALID_DATE_TEXT;
  }

  // moving to make diagnosisDate optional so we can use this to verify custodial accounts
  var diagnosisDate = formValues.diagnosisDate;
  if (diagnosisDate && !(diagnosisDate && sundial.isValidDateForMask(diagnosisDate, dateFormat))) {
    validationErrors.diagnosisDate = INVALID_DATE_TEXT;
  }

  var now = new Date();
  currentDateObj = currentDateObj || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  var birthdayDateObj = sundial.parseFromFormat(birthday, dateFormat);
  var diagnosisDateObj = sundial.parseFromFormat(diagnosisDate, dateFormat);

  if (!validationErrors.birthday && birthdayDateObj > currentDateObj) {
    validationErrors.birthday = INVALID_DATE_TEXT;
  }

  if (!validationErrors.diagnosisDate && diagnosisDateObj > currentDateObj) {
    validationErrors.diagnosisDate = INVALID_DATE_TEXT;
  }

  if (!validationErrors.diagnosisDate && birthdayDateObj > diagnosisDateObj) {
    validationErrors.diagnosisDate = OUT_OF_ORDER_TEXT;
  }

  var maxLength = 256;
  var about = formValues.about;
  if (about && about.length > maxLength) {
    validationErrors.about = 'Please keep "about" text under ' + maxLength + ' characters';
  }

  return validationErrors;
};

module.exports = personUtils;
