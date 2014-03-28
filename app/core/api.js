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
    var createUserProfile = function(cb) {
      tidepool.addOrUpdateProfile(profile, token, cb);
    };

    // Finally, create necessary groups for a new user account
    var createUserPatientsGroup = function(cb) {
      tidepool.createUserGroup(userId, 'patients', token, cb);
    };

    // NOTE: Can't run this in parallel, apparently the "seagull" api,
    // which both of these calls are using, doesn't allow it
    // (an error occurs when trying to read /metadata/:userId/profile later)
    async.series({
      profile: createUserProfile,
      patientsGroupId: createUserPatientsGroup
    },
    function(err, results) {
      if (err) {
        return cb(err);
      }

      var data = results.profile;
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

api.patient.get = function(patientId, cb) {
  api.log('GET /patients/' + patientId);

  getPatientProfile(patientId, function(err, patient) {
    if (err) {
      return cb(err);
    }

    if (!patient) {
      // No patient profile for this user yet, return "not found"
      return cb({status: 404, response: 'Not found'});
    }

    cb(null, patient);
  });
};

api.patient.post = function(patient, cb) {
  api.log('POST /patients');
  var patientId = api.userId;

  // First, create patient profile for user
  api.patient.put(patientId, patient, function(err, patient) {
    if (err) {
      return cb(err);
    }

    // Then, create necessary groups for new patient
    var userId = api.userId;
    var token = api.token;
    tidepool.createUserGroup(userId, 'team', token,
    function(err, teamGroupId) {
      if (err) {
        return cb(err);
      }

      cb(null, patient);
    });
  });
};

api.patient.put = function(patientId, patient, cb) {
  api.log('PUT /patients/' + patientId);

  // For this backend, patient data is contained in the `patient`
  // attribute of the user's profile
  var token = api.token;
  var profile = {id: patientId, patient: patient};
  tidepool.addOrUpdateProfile(profile, token, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var patient = patientFromUserProfile(profile);
    patient.id = patientId;
    return cb(null, patient);
  });
};

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
