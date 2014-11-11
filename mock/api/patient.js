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

var personUtils = require('../../app/core/personutils');
var common = require('./common');
var publicPersonInfo = common.publicPersonInfo;

var patch = function(mock, api) {
  var data = mock.data;
  var getParam = mock.getParam;
  var getDelayFor = mock.getDelayFor;

  function updatePatient(patient) {
    var patientId = patient.userid;
    var profile = data.users[patientId].profile;
    data.users[patientId].profile = _.assign(profile, patient.profile);
  }

  api.patient.getAll = function(callback) {
    api.log('[mock] GET /patients');

    setTimeout(function() {
      if (getParam('api.patient.getall.empty')) {
        return callback(null, []);
      }

      var userId = api.userId;
      var groups = data.groups[userId];
      if (_.isEmpty(groups)) {
        return callback(null, []);
      }

      var patients = _.reduce(groups, function(result, permissions, groupId) {
        if (groupId === userId) {
          return result;
        }

        var person = data.users[groupId];
        if (!personUtils.isPatient(person)) {
          return result;
        }

        var patient = _.cloneDeep(person);
        patient = publicPersonInfo(patient);
        patient.permissions = permissions;
        result.push(patient);
        return result;
      }, []);

      callback(null, patients);
    }, getDelayFor('api.patient.getall'));
  };

  api.patient.get = function(patientId, callback) {
    api.log('[mock] GET /patients/' + patientId);

    setTimeout(function() {
      var person = data.users[patientId];

      var userId = api.userId;
      var permissions;
      if (patientId === userId) {
        permissions = {root: {}};
      }
      else {
        permissions = data.groups[userId] || {};
        permissions = permissions[patientId];
      }
      var canViewPatient = !_.isEmpty(permissions);

      if (!(person && personUtils.isPatient(person) && canViewPatient)) {
        var err = {status: 404, response: 'Not found'};
        return callback(err);
      }

      var patient = _.cloneDeep(person);
      patient = publicPersonInfo(patient);
      patient.permissions = permissions;

      patient.team = [];
      if (!getParam('api.patient.get.emptyteam')) {
        patient.team = common.getMembersForGroup(data, patientId);
      }

      callback(null, patient);
    }, getDelayFor('api.patient.get'));
  };

  api.patient.post = function(patient, callback) {
    api.log('[mock] POST /patients');
    patient = _.assign({}, patient, {userid: api.userId});
    updatePatient(patient);
    setTimeout(function() {
      callback(null, patient);
    }, getDelayFor('api.patient.post'));
  };

  api.patient.put = function(patient, callback) {
    var patientId = patient.userid;
    api.log('[mock] PUT /patients/' + patientId);
    var updatedPatient;
    var err;
    if (!data.users[patientId]) {
      err = {status: 404, response: 'Not found'};
    }
    else {
      updatePatient(patient);
      updatedPatient = data.users[patientId];
    }
    setTimeout(function() {
      callback(err, updatedPatient);
    }, getDelayFor('api.patient.put'));
  };

  return api;
};

module.exports = patch;
