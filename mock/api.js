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
var config = window.config;

var patch = function(api, options) {
  var data = options.data || {};

  // ----- User -----

  api.user.get = function(callback) {
    api.log('[mock] GET /user');
    setTimeout(function() {
      callback(null, data.user);
    }, config.MOCK_DELAY);
  };

  api.user.put = function(user, callback) {
    api.log('[mock] PUT /user');
    setTimeout(function() {
      var err;
      if (config.MOCK_VARIANT === 'api.user.put.error') {
        err = true;
      }
      delete user.password;
      delete user.passwordConfirm;
      callback(err, user);
    }, config.MOCK_DELAY);
  };

  // ----- Patient -----

  api.patient.getAll = function(callback) {
    api.log('[mock] GET /patients');
    var patients = _.toArray(data.patients);
    var userPatientId = data.user.patient && data.user.patient.id;
    patients = _.filter(patients, function(patient) {
      return patient.id !== userPatientId;
    });
    setTimeout(function() {
      callback(null, patients);
    }, config.MOCK_DELAY);
  };

  api.patient.get = function(patientId, callback) {
    api.log('[mock] GET /patients/' + patientId);
    var patient = data.patients[patientId];
    var err;
    if (!patient) {
      err = {message: 'Not found'};
    }
    setTimeout(function() {
      callback(err, patient);
    }, config.MOCK_DELAY);
  };

  api.patient.put = function(patientId, patient, callback) {
    api.log('[mock] PUT /patients/' + patientId);
    var updatedPatient;
    var err;
    if (!data.patients[patientId]) {
      err = {message: 'Not found'};
    }
    else {
      updatedPatient = _.assign(data.patients[patientId], patient);
      updatedPatient = _.cloneDeep(updatedPatient);
    }
    setTimeout(function() {
      callback(err, updatedPatient);
    }, config.MOCK_DELAY);
  };

  return api;
};

module.exports = patch;