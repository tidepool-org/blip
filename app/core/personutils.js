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

var utils = require('./utils');

var personUtils = {};

personUtils.fullName = function(person) {
  return utils.getIn(person, ['profile', 'fullName']);
};

personUtils.patientInfo = function(person) {
  return utils.getIn(person, ['profile', 'patient']);
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

module.exports = personUtils;
