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

  var newAccount = accountFromUser(user);
  var newProfile = profileFromUser(user);

  // First, create user account
  tidepool.signup(newAccount, function(err, account) {
    if (err) {
      return cb(err);
    }

    var token = account.token;
    var userId = account.userid;
    saveSession(userId, token);

    // Then, add additional user info (first name, etc.) to profile
    newProfile.id = userId;
    var createUserProfile = function(cb) {
      tidepool.addOrUpdateProfile(newProfile, token, cb);
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

      var data = userFromAccountAndProfile({
        account: account,
        profile: results.profile
      });

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

api.user.get = function(cb) {
  api.log('GET /user');

  var token = api.token;
  var userId = api.userId;

  // Fetch user account data (username, etc.)...
  var getAccount = tidepool.getCurrentUser.bind(tidepool, token);

  // ...and user profile information (first name, last name, etc.)
  var getProfile = tidepool.findProfile.bind(tidepool, userId, token);

  async.parallel({
    account: getAccount,
    profile: getProfile
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    var user = userFromAccountAndProfile(results);

    cb(null, user);
  });
};

api.user.put = function(user, cb) {
  api.log('PUT /user');

  var token = api.token;
  var userId = api.userId;

  var account = accountFromUser(user);
  var updateAccount =
    tidepool.updateCurrentUser.bind(tidepool, account, token);

  var profile = profileFromUser(user);
  var updateProfile =
    tidepool.addOrUpdateProfile.bind(tidepool, profile, token);

  async.parallel({
    account: updateAccount,
    profile: updateProfile
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    var user = userFromAccountAndProfile(results);

    cb(null, user);
  });
};

function accountFromUser(user) {
  var account = _.pick(user, 'username', 'password');

  if (account.username) {
    account.emails = [user.username];
  }

  return account;
}

function profileFromUser(user) {
  var profile = _.omit(user, 'username', 'password', 'emails');
  return profile;
}

function userFromAccountAndProfile(results) {
  var account = results.account;
  var profile = results.profile;

  var user = _.assign({}, profile, {
    id: account.userid,
    username: account.username
  });

  // If user profile has patient data, just give the "patient id"
  // (which is the same as the userid for this backend)
  if (user.patient != null) {
    user.patient = {id: user.id};
  }

  return user;
}

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

function getUserProfile(userId, cb) {
  var token = api.token;
  tidepool.findProfile(userId, token, function(err, profile) {
    if (err) {
      return cb(err);
    }

    profile.id = userId;
    return cb(null, profile);
  });
}

function getPatientProfile(patientId, cb) {
  return getUserProfile(patientId, function(err, profile) {
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

    // If this is not the current user's patient, we're done
    var userId = api.userId;
    if (patientId !== userId) {
      return cb(null, patient);
    }

    // If it is, fetch the patient's team members
    var token = api.token;
    patient.team = [];
    tidepool.getUsersTeam(userId, token, function(err, group) {
      if (err) {
        return cb(err);
      }

      // set the team id that is used for group realated tasks
      patient.team.id = group.id;

      var peopleIds = (group && group.members) || [];
      if (!peopleIds.length) {
        return cb(null, patient);
      }

      async.map(peopleIds, getUserProfile, function(err, people) {
        // Filter any people ids that returned nothing
        people = _.filter(people);
        patient.team = people;
        return cb(null, patient);
      });
    });
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
  tidepool.getUsersPatients(userId, token, function(err, group) {
    if (err) {
      return cb(err);
    }

    var patientIds = (group && group.members) || [];
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

// ----- Team data -----
api.team = {};

//Get all messages for the given thread
api.team.getMessageThread = function(messageId,cb){
  api.log('GET /message/thread');

  var token = api.token;
  tidepool.getMessageThread(messageId,token,function(error,messages){
    if(error){
      return cb(error);
    }
    return cb(null,messages);
  });
};

//Get all notes (parent messages) for the given team
api.team.getNotes = function(teamId,cb){
  api.log('GET /message/notes');
  var token = api.token;

  tidepool.getNotesForTeam(teamId,token,function(error,messages){
    if(error){
      return cb(error);
    }
    //transform so that they are how Tideline renders them
    messages = _.map(messages, function(message) {
      return {
        utcTime : message.timestamp,
        messageText : message.messagetext,
        parentMessage : message.parentmessage,
        type: 'message',
        _id: message.id
      };
    });
    return cb(null,messages);
  });
};

//Add a comment
api.team.replyToMessageThread = function(message,cb){
  api.log('POST /message/reply');
  var token = api.token;

  tidepool.replyToMessageThread(message.parentmessage, message ,token ,function(error,replyId){
    if (error) {
      return cb(error);
    }
    cb(null, replyId);
  });
};

//New message
api.team.startMessageThread = function(message,cb){
  api.log('POST /message/send');
  var token = api.token;

  tidepool.startMessageThread(message.groupid, message ,token ,function(error,messageId){
    if (error) {
      return cb(error);
    }
    cb(null, messageId);
  });
};

// ----- Patient data -----

api.patientData = {};

// ----- Upload -----

api.getUploadUrl = function() {};

module.exports = api;
