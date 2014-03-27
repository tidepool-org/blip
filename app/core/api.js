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

// Wrapper around the Tidepool client library

var _ = window._;
var async = window.async;
var bows = window.bows;
var config = window.config;

// Legacy
var tidepoolPlatform = require('../tidepool/tidepoolplatform');
var tidepoolPlatformApi;
// New
var tidepool = window.tidepool({host: config.API_HOST});

var api = {
  log: bows('Api'),
  token: null,
  userId: null
};

api.init = function(cb) {
  tidepoolPlatformApi = tidepoolPlatform({
    apiHost: config.API_HOST,
    uploadApi: config.UPLOAD_API
  });

  _.extend(api.user, tidepoolPlatformApi.user);
  _.extend(api.patient, tidepoolPlatformApi.patient);
  _.extend(api.patientData,  tidepoolPlatformApi.patientData);
  api.getUploadUrl = tidepoolPlatformApi.getUploadUrl;

  api.log('Initialized');
  cb();
};

// ----- User -----

api.user = {};

function saveSession(newUserId, newToken) {
  api.token = newToken;
  api.userId = newUserId;

  // NOTE: `tidepoolPlatformApi` to be deprecated
  tidepoolPlatformApi.setToken(newToken);
  tidepoolPlatformApi.setUserId(newUserId);

  if (!newToken) {
    api.log('Session cleared');
    return;
  }

  api.log('Session saved');

  var refreshSessionInterval = 10 * 60 * 1000;
  var refreshSession = function() {
    if (api.token == null || newUserId !== api.userId) {
      api.log('Stopping session token refresh');
      return;
    }

    api.log('Refreshing session token');
    tidepool.refreshUserToken(api.token, newUserId, function(err, data) {
      var hasNewSession = data && data.userid && data.token;
      if (err || !hasNewSession) {
        api.log('Failed refreshing session token', err);
        return;
      }

      saveSession(data.userid, data.token);
    });
  };

  setTimeout(refreshSession, refreshSessionInterval);
}

api.user.isAuthenticated = function() {
  return Boolean(api.token);
};

api.user.login = function(user, cb) {
  api.log('POST /user/login');

  tidepool.login(user, function(err, data) {
    if (err) {
      return cb(err);
    }

    saveSession(data.userid, data.token);
    cb();
  });
};

api.user.signup = function(user, cb) {
  api.log('POST /user');

  // First, create user account
  tidepool.signup(user, function(err, data) {
    if (err) {
      return cb(err);
    }

    var token = data.token;
    var userId = data.userid;
    saveSession(userId, token);

    // Then, add additional user info (first name, etc.) to profile
    var profile = _.omit(user, 'username', 'password');
    profile.id = userId;
    tidepool.addOrUpdateProfile(profile, token, function(err, data) {
      if (err) {
        return cb(err);
      }

      // Add back some account info to profile for response
      data.id = userId;
      data.username = user.username;
      cb(null, data);
    });
  });
};

api.user.logout = function(cb) {
  api.log('POST /user/logout');

  if (!api.user.isAuthenticated()) {
    return;
  }

  var token = api.token;
  tidepool.logout(token, function(err) {
    if (err) {
      return cb(err);
    }

    // Clear session
    saveSession(null, null);

    cb();
  });
};

// ----- Patient -----

api.patient = {};

function patientFromUserProfile(profile) {
  // Merge user profile attributes with patient
  var patient = profile && profile.patient;
  if (!patient) {
    return;
  }

  patient.firstName = profile.firstName;
  patient.lastName = profile.lastName;
  return patient;
}

function getPatientProfile(patientId, cb) {
  var token = tidepoolPlatformApi.getToken();
  tidepool.findProfile(patientId, token, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var patient = patientFromUserProfile(profile);
    if (!patient) {
      return cb();
    }

    patient.id = patientId;
    return cb(null, patient);
  });
}

// Get all patient profiles in current user's "patients" group
api.patient.getAll = function(cb) {
  api.log('GET /patients');

  var token = api.token;
  var userId = api.userId;

  // First, get a list of of patient ids in user's "patients" group
  tidepool.getUsersPatients(userId, token, function(err, team) {
    if (err) {
      return cb(err);
    }

    var patientIds = (team && team.members) || [];
    if (!patientIds.length) {
      return cb(null, []);
    }

    // Second, get the patient profile info for each patient id
    async.map(patientIds, getPatientProfile, function(err, patients) {
      // Filter any patient ids that returned nothing
      patients = _.filter(patients);
      return cb(null, patients);
    });
  });
};

// ----- Patient data -----

api.patientData = {};

// ----- Upload -----

api.getUploadUrl = function() {};

module.exports = api;
