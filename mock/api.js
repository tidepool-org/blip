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

var createPatch = function(options) {
  var patch = function(api) {
    var getParam = options.getParam || {};
    var data = options.data || {};

    var getDelayFor = function(name) {
      return (getParam('delay') || getParam(name + '.delay') || 0);
    };

    // ----- User -----

    api.user.get = function(callback) {
      api.log('[mock] GET /user');

      var user = _.clone(data.user);
      if (getParam('api.user.get.nopatient')) {
        user = _.omit(user, 'patient');
      }

      setTimeout(function() {
        callback(null, user);
      }, getDelayFor('api.user.get'));
    };

    api.user.put = function(user, callback) {
      api.log('[mock] PUT /user');
      setTimeout(function() {
        var err;
        if (getParam('api.user.put.error')) {
          err = true;
        }
        delete user.password;
        delete user.passwordConfirm;
        callback(err, user);
      }, getDelayFor('api.user.put'));
    };

    // ----- Patient -----

    api.patient.getAll = function(callback) {
      api.log('[mock] GET /patients');
      var patients = [];

      if (!getParam('api.patient.getall.empty')) {
        patients = _.toArray(data.patients);
        var userPatientId = data.user.patient && data.user.patient.id;
        patients = _.filter(patients, function(patient) {
          return patient.id !== userPatientId;
        });
      }
      
      setTimeout(function() {
        callback(null, patients);
      }, getDelayFor('api.patient.getall'));
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
      }, getDelayFor('api.patient.get'));
    };

    api.patient.post = function(patient, callback) {
      api.log('[mock] POST /patients');
      patient = _.clone(patient);
      // Default mock id of patient assigned to user of id '1'
      patient.id = '11';
      setTimeout(function() {
        callback(null, patient);
      }, getDelayFor('api.patient.post'));
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
      }, getDelayFor('api.patient.put'));
    };

    // ----- Patient Data -----

    api.patientData.get = function(patientId, options, callback) {
      api.log('[mock] GET /patients/' + patientId + '/data');
      if (typeof options === 'function') {
        callback = options;
      }
      var patientData = data.patientdata && data.patientdata[patientId];
      patientData = patientData || [];
      setTimeout(function() {
        callback(null, patientData);
      }, getDelayFor('api.patientdata.get'));
    };

    // ----- Upload -----
    api.getUploadUrl = function() {
      return 'about:blank';
    };

    return api;
  };

  return patch;
};

module.exports = createPatch;