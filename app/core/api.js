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

var _ = require('lodash');
var async = require('async');
var bows = require('bows');

var createTidepoolClient = require('tidepool-platform-client');
var tidepool;

var config = require('../config');

var personUtils = require('./personutils');
var migrations = require('./lib/apimigrations');

var api = {
  log: bows('Api')
};

api.init = function(cb) {
  var tidepoolLog = bows('Tidepool');
  tidepool = createTidepoolClient({
    host: config.API_HOST,
    uploadApi: config.UPLOAD_API,
    log: {
      warn: tidepoolLog,
      info: tidepoolLog,
      debug: tidepoolLog
    },
    localStore: window.localStorage,
    metricsSource: 'blip',
    metricsVersion: config.VERSION
  });

  api.tidepool = tidepool;

  tidepool.initialize(function() {
    api.log('Initialized');
    cb();
  });
};

// ----- User -----

api.user = {};

api.user.isAuthenticated = function() {
  return tidepool.isLoggedIn();
};

api.user.login = function(user, options, cb) {
  api.log('POST /user/login');

  options = options || {};
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  tidepool.login(user, options, function(err, data) {
    if (err) {
      return cb(err);
    }

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

    var userId = account.userid;

    // Then, add additional user info (full name, etc.) to profile
    tidepool.addOrUpdateProfile(userId, newProfile, function(err, results) {
      if (err) {
        return cb(err);
      }

      cb(null, userFromAccountAndProfile({
        account: account,
        profile: results
      }));
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

    cb();
  });
};

api.user.destroySession = function() {
  tidepool.destroySession();
};

api.user.get = function(cb) {
  api.log('GET /user');

  var userId = tidepool.getUserId();

  // Fetch user account data (username, etc.)...
  var getAccount = tidepool.getCurrentUser.bind(tidepool);

  // ...and user profile information (full name, etc.)
  var getProfile = function(cb) {
    tidepool.findProfile(userId, function(err, profile) {
      if (err) {
        return cb(err);
      }

      var updateProfileAfterMigration = false;
      var migration;

      migration = migrations.profileFullName;
      if (migration.isRequired(profile)) {
        api.log('Migrating and saving user [' + userId + '] profile to "fullName"');
        profile = migration.migrate(profile);
        updateProfileAfterMigration = true;
      }

      if (updateProfileAfterMigration) {
        return tidepool.addOrUpdateProfile(userId, profile, cb);
      }

      return cb(null, profile);
    });
  };

  async.parallel({
    account: getAccount,
    profile: getProfile
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    cb(null, userFromAccountAndProfile(results));
  });
};

api.user.put = function(user, cb) {
  api.log('PUT /user');

  var account = accountFromUser(user);
  var profile = profileFromUser(user);

  async.parallel({
    account: tidepool.updateCurrentUser.bind(tidepool, account),
    profile: tidepool.addOrUpdateProfile.bind(tidepool, user.userid, profile)
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    cb(null, userFromAccountAndProfile(results));
  });
};

function accountFromUser(user) {
  var account = _.pick(user, 'username', 'password', 'emails');
  return account;
}

function profileFromUser(user) {
  return _.cloneDeep(user.profile);
}

function userFromAccountAndProfile(results) {
  var account = results.account;
  var profile = results.profile;

  var user = _.pick(account, 'userid', 'username', 'emails');
  user.profile = profile;

  return user;
}

// ----- Patient -----

api.patient = {};

// Get a user's public info
function getPerson(userId, cb) {
  var person = {userid: userId};

  tidepool.findProfile(userId, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var migration;

    migration = migrations.profileFullName;
    if (migration.isRequired(profile)) {
      api.log('Migrating user [' + userId + '] profile to "fullName"');
      profile = migration.migrate(profile);
    }

    person.profile = profile;
    return cb(null, person);
  });
}

// Not every user is a "patient"
function getPatient(patientId, cb) {
  return getPerson(patientId, function(err, person) {
    if (err) {
      return cb(err);
    }

    if (!personUtils.isPatient(person)) {
      return cb();
    }

    return cb(null, person);
  });
}

function updatePatient(patient, cb) {
  var patientId = patient.userid;
  // Hang on to team, we'll add back later
  var team = patient.team || [];
  // Patient info is contained in the `patient` attribute of the user's profile
  var patientInfo = personUtils.patientInfo(patient);
  var profile = {patient: patientInfo};
  tidepool.addOrUpdateProfile(patientId, profile, function(err, profile) {
    if (err) {
      return cb(err);
    }

    patient = _.assign({}, patient, {
      profile: profile,
      team: team
    });
    return cb(null, patient);
  });
}

api.patient.get = function(patientId, cb) {
  api.log('GET /patients/' + patientId);

  var userId = tidepool.getUserId();

  getPatient(patientId, function(err, patient) {
    if (err) {
      return cb(err);
    }

    if (!patient) {
      // No patient profile for this user yet, return "not found"
      return cb({status: 404, response: 'Not found'});
    }

    // If patient doesn't belong to current user, we're done
    if (patientId !== userId) {
      return cb(null, patient);
    }

    // Fetch the patient's team
    tidepool.getTeamMembers(userId, function(err, permissions) {
      if (err) {
        return cb(err);
      }

      if (_.isEmpty(permissions)) {
        return cb(null, patient);
      }

      // A user is always part of her own team:
      // filter her id from set of permissions
      permissions = _.omit(permissions, userId);
      // Convert to array of user ids
      var memberIds = Object.keys(permissions);

      async.map(memberIds, getPerson, function(err, people) {
        if (err) {
          return cb(err);
        }
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
  var userId = tidepool.getUserId();
  patient = _.assign({}, patient, {userid: userId});

  return updatePatient(patient, cb);
};

api.patient.put = function(patient, cb) {
  api.log('PUT /patients/' + patient.userid);

  return updatePatient(patient, cb);
};

// Get all patients in current user's "patients" group
api.patient.getAll = function(cb) {
  api.log('GET /patients');

  var userId = tidepool.getUserId();

  // First, get a list of of patient ids in user's "patients" group
  tidepool.getViewableUsers(userId, function(err, permissions) {
    if (err) {
      return cb(err);
    }

    if (_.isEmpty(permissions)) {
      return cb(null, []);
    }

    // A user is always able to view her own data:
    // filter her id from set of permissions
    permissions = _.omit(permissions, userId);
    // Convert to array of user ids
    var patientIds = Object.keys(permissions);

    // Second, get the patient object for each patient id
    async.map(patientIds, getPatient, function(err, patients) {
      if (err) {
        return cb(err);
      }
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
  api.log('GET /message/thread/' + messageId);

  tidepool.getMessageThread(messageId, function(error,messages){
    if(error){
      return cb(error);
    }

    //the `note` is always first and then just order the comments on that note
    messages = _.sortBy(messages, function(message) {
      return _.isEmpty(message.parentmessage) || new Date(message.timestamp);
    });

    return cb(null,messages);
  });
};

//Get all notes (parent messages) for the given team
api.team.getNotes = function(userId,cb){
  api.log('GET /message/notes/' + userId);

  //at present we are not using the date range
  var dateRange = null;

  tidepool.getNotesForUser(userId, dateRange, function(error,messages){
    if(error){
      return cb(error);
    }

    return cb(null,messages);
  });
};

//Add a comment
api.team.replyToMessageThread = function(message,cb){
  api.log('POST /message/reply/' + message.parentmessage);

  tidepool.replyToMessageThread(message, function(error,replyId){
    if (error) {
      return cb(error);
    }
    cb(null, replyId);
  });
};

//New message
api.team.startMessageThread = function(message,cb){
  api.log('POST /message/send/' + message.groupid);

  tidepool.startMessageThread(message, function(error,messageId){
    if (error) {
      return cb(error);
    }
    cb(null, messageId);
  });
};

api.team.editMessage = function(message,cb){
  api.log('PUT /message/edit/' + message.id);

  tidepool.editMessage(message, function(error, details){
    if (error) {
      return cb(error);
    }
    cb(null, null);
  });
};

// ----- Patient data -----

api.patientData = {};

api.patientData.get = function(patientId, cb) {
  api.log('GET /data/' + patientId);

  var now = Date.now();
  tidepool.getDeviceDataForUser(patientId, function(err, data) {
    if (err) {
      return cb(err);
    }
    api.log('Data received in ' + (Date.now() - now) + ' millis.');

    window.inData = data;

    cb(null, data);
  });
};

// ----- Invitation -----

api.invitation = {};

api.invitation.getReceived = function(callback) {
  api.log('GET /invitations/received [NOT IMPLEMENTED]');
  callback(null, []);
};

api.invitation.accept = function(fromUserId, callback) {
  api.log('POST /invitations/from/' + fromUserId + '/accept [NOT IMPLEMENTED]');
  callback(null, {});
};

api.invitation.dismiss = function(fromUserId, callback) {
  api.log('POST /invitations/from/' + fromUserId + '/dismiss [NOT IMPLEMENTED]');
  callback(null, {});
};

api.invitation.getSent = function(callback) {
  api.log('GET /invitations/sent [NOT IMPLEMENTED]');
  callback(null, []);
};

api.invitation.cancel = function(toEmail, callback) {
  api.log('POST /invitations/to/' + toEmail + '/cancel [NOT IMPLEMENTED]');
  callback();
};

// ----- Access -----

api.access = {};

api.access.setMemberPermissions = function(memberId, permissions, callback) {
  var groupId = tidepool.getUserId();
  api.log('PUT /access/' + groupId + '/' + memberId);
  return tidepool.setAccessPermissions(memberId, permissions, callback);
};

api.access.removeMember = function(memberId, callback) {
  var groupId = tidepool.getUserId();
  api.log('DELETE /access/' + groupId + '/' + memberId);
  return tidepool.setAccessPermissions(memberId, null, callback);
};

api.access.leaveGroup = function(groupId, callback) {
  var memberId = tidepool.getUserId();
  api.log('DELETE /access/' + groupId + '/' + memberId);
  return tidepool.setAccessPermissions(memberId, null, callback);
};

// ----- Upload -----

api.getUploadUrl = function() {
  return tidepool.getUploadUrl();
};

// ----- Metrics -----

api.metrics = {};

api.metrics.track = function(eventName, properties, cb) {
  api.log('GET /metrics/' + window.encodeURIComponent(eventName));

  return tidepool.trackMetric(eventName, properties, cb);
};

// ----- Errors -----

api.errors = {};

api.errors.log = function(error, message, properties) {
  api.log('POST /errors');

  return tidepool.logAppError(error, message, properties);
};

module.exports = api;
