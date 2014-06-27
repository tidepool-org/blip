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

var _ = window._;

var utils = require('./utils');

var Person = {};

Person.fullName = function(person) {
  return utils.getIn(person, ['profile', 'fullName']);
};

Person.patientInfo = function(person) {
  return utils.getIn(person, ['profile', 'patient']);
};

Person.isPatient = function(person) {
  return Boolean(Person.patientInfo(person));
};

Person.patientFullName = function(person) {
  var profile = utils.getIn(person, ['profile'], {});
  var patientInfo = profile.patient || {};

  if (patientInfo.isOtherPerson) {
    return patientInfo.fullName;
  }

  return profile.fullName;
};

Person.patientIsOtherPerson = function(person) {
  return Boolean(utils.getIn(person,
    ['profile', 'patient', 'isOtherPerson'], false));
};

Person.isSame = function(first, second) {
  first = first || {};
  second = second || {};

  if (!(first.userid && second.userid)) {
    return false;
  }

  return (first.userid === second.userid);
};

module.exports = Person;
