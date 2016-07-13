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

api.user.oauthLogin = function(accessToken, cb) {
  api.log('GET /user/oauthLogin');

  tidepool.oauthLogin(accessToken, function(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, data);
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

    /**
     * Because Platform Client handles this error slightly weirdly, and returns
     * it in the account object we need to inspect the account object
     * for the following object signature and then if found, call the
     * callback with an error based on the contents of the object
     *
     * TODO: consider when refactoring platform client
     */
    if(account.code && account.code === 409) {
      return cb({
        status: account.code,
        error: account.reason
      });
    }

    var userId = account.userid;

    tidepool.signupStart(userId, function(err, results){
      if (err){
        api.log('signup process error', err);
      }
      api.log('signup process started');
    });

    // Then, add additional user info (full name, etc.) to profile
    tidepool.addOrUpdateProfile(userId, newProfile, function(err, results) {
      if (err) {
        return cb(err);
      }

      api.log('added profile info to signup', results);
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
    api.log('not authenticated but still destroySession');
    tidepool.destroySession();
    if (cb) {
      cb();
    }
    return;
  }

  tidepool.logout(function(err) {
    if (err) {
      api.log('error logging out but still destroySession');
      tidepool.destroySession();
    }
    if (cb) {
      cb();
    }
    return;
  });
};

api.user.acceptTerms = function(termsData, cb){
  api.log('PUT /user' );
  api.log('terms accepted on', termsData.termsAccepted);
  return tidepool.updateCurrentUser(termsData,cb);
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
  // sometimes `account` isn't in the results after e.g., password update
  var account = results.account || {};
  var profile = results.profile;

  var user = account;
  user.profile = profile;

  return user;
}

api.user.resendEmailVerification = function(email, callback) {
  api.log('POST /confirm/resend/signup/' + email);
  return tidepool.signupResend(email, callback);
};

api.user.requestPasswordReset = function(email, callback) {
  api.log('POST /confirm/send/forgot/' + email);
  return tidepool.requestPasswordReset(email, callback);
};

api.user.confirmPasswordReset = function(payload, callback) {
  api.log('PUT /confirm/accept/forgot');
  return tidepool.confirmPasswordReset(payload, callback);
};

api.user.confirmSignUp = function(key, callback) {
  api.log('PUT /confirm/accept/signup/'+key);
  return tidepool.signupConfirm(key, callback);
};

api.user.custodialConfirmSignUp = function(key, birthday, password, callback) {
  api.log('PUT /confirm/accept/signup/'+key, 'custodial');
  return tidepool.custodialSignupConfirm(key, birthday, password, callback);
};

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

/*
 * Not every user is a "patient".
 * Get the "patient" and attach the logged in users permissons
 */
function getPatient(patientId, cb) {
  return getPerson(patientId, function(err, person) {
    if (err) {
      return cb(err);
    }

    if (!personUtils.isPatient(person)) {
      return cb();
    }
    // Attach the logged-in user's permissions for that patient
    var userId = tidepool.getUserId();
    tidepool.getAccessPermissionsForGroup(patientId, userId, function(err, permissions) {
      if (err) {
        return cb(err);
      }

      person.permissions = permissions;
      return cb(null, person);
    });

  });
}

function updatePatient(patient, cb) {
  var patientId = patient.userid;
  // Hang on to team, we'll add back later
  var team = patient.team || [];

  var profile = patient.profile;
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

      async.map(memberIds, getPerson, function(err, members) {
        if (err) {
          return cb(err);
        }
        // Filter any member ids that returned nothing
        members = _.filter(members);
        // Add each member's permissions
        members = _.map(members, function(member) {
          member.permissions = permissions[member.userid];
          return member;
        });
        patient.team = members;
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
    if (error){
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
    if (error){
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
    if (cb) {
      cb(null, replyId);
    }
  });
};

//New message
api.team.startMessageThread = function(message,cb){
  api.log('POST /message/send/' + message.groupid);

  tidepool.startMessageThread(message, function(error,messageId){
    if (error) {
      return cb(error);
    }
    if (cb) {
      cb(null, messageId);
    }
  });
};

api.team.editMessage = function(message,cb){
  api.log('PUT /message/edit/' + message.id);

  tidepool.editMessage(message, function(error, details){
    if (error) {
      return cb(error);
    }
    if (cb) {
      cb(null, null);
    }
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

api.invitation.send = function(emailAddress, permissions, callback) {
  var loggedInUser = tidepool.getUserId();
  api.log('POST /confirm/send/invite/' + loggedInUser);
  return tidepool.inviteUser(emailAddress, permissions, loggedInUser, callback);
};

api.invitation.getReceived = function(callback) {
  api.log('GET /confirm/invitations');
  return tidepool.invitesReceived(tidepool.getUserId(),callback);
};

api.invitation.accept = function(key, fromUserId, callback) {
  var loggedInUser = tidepool.getUserId();
  api.log('POST /confirm/accept/invite/' + loggedInUser +'/'+fromUserId );
  return tidepool.acceptInvite(key, loggedInUser, fromUserId, callback);
};

api.invitation.dismiss = function(key, fromUserId, callback) {
  var loggedInUser = tidepool.getUserId();
  api.log('POST /confirm/dismiss/invite/'+ loggedInUser+ '/'+fromUserId );
  return tidepool.dismissInvite(key, loggedInUser, fromUserId, callback);
};

api.invitation.getSent = function(callback) {
  var loggedInUser = tidepool.getUserId();
  api.log('GET /confirm/invite/'+loggedInUser);
  return  tidepool.invitesSent(loggedInUser, callback);
};

api.invitation.cancel = function(emailAddress, callback) {
   var loggedInUser = tidepool.getUserId();
  api.log('DELETE /confirm/' + loggedInUser+ '/invited/'+ emailAddress);
  return tidepool.removeInvite(emailAddress, loggedInUser, callback);
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
  api.log('POST /access/' + groupId + '/' + memberId);
  return tidepool.setAccessPermissions(memberId, null, callback);
};

api.access.leaveGroup = function(groupId, callback) {
  var memberId = tidepool.getUserId();
  api.log('POST /access/' + groupId + '/' + memberId);
  return tidepool.setAccessPermissionsOnGroup(groupId, memberId, null, callback);
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

api.errors.log = function(error, message, properties, cb) {
  api.log('POST /errors');

  return tidepool.logAppError(error, message, properties, cb);
};

module.exports = api;
