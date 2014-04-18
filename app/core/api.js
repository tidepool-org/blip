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
var tidepool = window.tidepool({host: config.API_HOST, uploadApi: config.UPLOAD_API});

var api = {
  log: bows('Api'),
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

api.user.isAuthenticated = function() {
  return tidepool.isLoggedIn();
};

api.user.login = function(user, cb) {
  api.log('POST /user/login');

  tidepool.login(user, function(err, data) {
    if (err) {
      return cb(err);
    }
    api.userId = data.userid;
    saveSessionForTidepoolPlatformApi(data.userid, data.token);
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

    api.userId = account.userid;
    saveSessionForTidepoolPlatformApi(account.userid, account.token);

    // Then, add additional user info (first name, etc.) to profile
    newProfile.id = userId;
    var createUserProfile = function(cb) {
      tidepool.addOrUpdateProfile(newProfile, cb);
    };

    // Finally, create necessary groups for a new user account
    var createUserPatientsGroup = function(cb) {
      tidepool.createUserGroup(userId, 'patients', cb);
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

  tidepool.logout(function(err) {
    if (err) {
      return cb(err);
    }

    // Clear session
    api.userId = null;
    saveSessionForTidepoolPlatformApi(null, null);

    cb();
  });
};

api.user.get = function(cb) {
  api.log('GET /user');

  var userId = api.userId;

  // Fetch user account data (username, etc.)...
  var getAccount = tidepool.getCurrentUser.bind(tidepool);

  // ...and user profile information (first name, last name, etc.)
  var getProfile = tidepool.findProfile.bind(tidepool, userId);

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

  var userId = api.userId;

  var account = accountFromUser(user);
  var updateAccount =
    tidepool.updateCurrentUser.bind(tidepool, account);

  var profile = profileFromUser(user);
  var updateProfile =
    tidepool.addOrUpdateProfile.bind(tidepool, profile);

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

  tidepool.findProfile(userId, function(err, profile) {
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

  var userId = api.userId;

  getPatientProfile(patientId, function(err, patient) {
    if (err) {
      return cb(err);
    }

    if (!patient) {
      // No patient profile for this user yet, return "not found"
      return cb({status: 404, response: 'Not found'});
    }

    // Fetch the patient's team
    tidepool.getUsersTeam(userId, function(err, group) {
      if (err) {
        return cb(err);
      }

      if (!(group && group.id)) {
        return cb(null, patient);
      }

      patient.teamId = group.id;

      // If this is not the current user's patient, we're done
      if (patientId !== userId) {
        return cb(null, patient);
      }

      // If it is, fetch the patient's team members
      var peopleIds = group.members || [];
      if (!peopleIds.length) {
        patient.team = [];
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
  // For this backend, patient data is contained in the `patient`
  // attribute of the user's profile
  patient = _.omit(patient, 'firstName', 'lastName');
  var profile = {id: patientId, patient: patient};
  tidepool.addOrUpdateProfile(profile, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var patient = patientFromUserProfile(profile);
    patient.id = patientId;

    // Then, create necessary groups for new patient
    tidepool.createUserGroup(patientId, 'team',
    function(err, teamGroupId) {
      if (err) {
        return cb(err);
      }

      patient.teamId = teamGroupId;
      patient.team = [];

      cb(null, patient);
    });
  });
};

api.patient.put = function(patientId, patient, cb) {
  api.log('PUT /patients/' + patientId);

  // Hang on to team, add back after update
  var teamId = patient.teamId;
  var team = patient.team;

  // Don't save info already in user's profile, or team
  patient = _.omit(patient, 'id', 'firstName', 'lastName', 'teamId', 'team');

  var profile = {id: patientId, patient: patient};
  tidepool.addOrUpdateProfile(profile, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var patient = patientFromUserProfile(profile);
    patient.id = patientId;
    if (teamId) {
      patient.teamId = teamId;
    }
    if (team) {
      patient.team = team;
    }

    return cb(null, patient);
  });
};

// Get all patient profiles in current user's "patients" group
api.patient.getAll = function(cb) {
  api.log('GET /patients');

  var userId = api.userId;

  // First, get a list of of patient ids in user's "patients" group
  tidepool.getUsersPatients(userId, function(err, group) {
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

  tidepool.getMessageThread(messageId, function(error,messages){
    if(error){
      return cb(error);
    }
    return cb(null,messages);
  });
};

//Get all notes (parent messages) for the given team
api.team.getNotes = function(userId,cb){
  api.log('GET /message/notes');

  //at present we are not using the date range
  var dateRange = null;

  tidepool.getNotesForUser(userId, dateRange, function(error,messages){
    if(error){
      return cb(error);
    }
    //transform so that they are how Tideline renders them
    messages = _.map(messages, function(message) {
      return {
        normalTime : message.timestamp,
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

  tidepool.replyToMessageThread(message, function(error,replyId){
    if (error) {
      return cb(error);
    }
    cb(null, replyId);
  });
};

//New message
api.team.startMessageThread = function(message,cb){
  api.log('POST /message/send');

  tidepool.startMessageThread(message, function(error,messageId){
    if (error) {
      return cb(error);
    }
    cb(null, messageId);
  });
};

// ----- Patient data -----

api.patientData = {};

api.patientData.get = function(userId,cb){

};

// ----- Upload -----

api.getUploadUrl = function() {
  return tidepool.uploadUrl();
};

module.exports = api;
