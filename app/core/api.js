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

var rollbar = require('../rollbar').default;

var api = {
  log: bows('Api')
};

api.init = function(cb) {
  var tidepoolLog = bows('Tidepool');
  tidepool = createTidepoolClient({
    host: config.API_HOST,
    dataHost: config.API_HOST + '/dataservices',
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

// ----- Server -----
api.server = {};

api.server.getTime = function(cb) {
  tidepool.getTime(function(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, data);
  });
};

api.server.getInfo = (cb) => {
  api.log('GET /info');
  tidepool.checkUploadVersions((err, resp) => {
    if (err) {
      return cb(err);
    }
    return cb(null, resp);
  });
};

// ----- User -----
api.user = {};

api.user.isAuthenticated = function() {
  return tidepool.isLoggedIn();
};

api.user.login = function (user, options, cb) {
  api.log('POST /user/login');

  options = options || {};
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!tidepool.isLoggedIn()) {
    tidepool.login(user, options, function (err, data) {
      if (err) {
        return cb(err);
      }

      // Set account info in Rollbar config
      _.isFunction(rollbar.configure) && rollbar.configure({
        payload: {
          person: {
            id: data.userid,
            email: user.username,
            username: user.username,
          }
        }
      });
      cb();
    });
  } else {
    cb();
  }
};

api.user.saveSession = function (userId, token, options, cb) {
  api.log('saveSession');
  options = options || {};
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  tidepool.saveSession(userId, token, options, function (err, session) {
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
    if (newProfile) {
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
    } else {
      cb(null, userFromAccountAndProfile({
        account: account,
      }));
    }
  });
};

api.user.logout = function(cb) {
  api.log('POST /user/logout');

  // Unset account info in Rollbar config
  _.isFunction(rollbar.configure) && rollbar.configure({
    payload: {
      person: null,
    },
  });

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
      // We don't want to fire an error if the patient has no profile saved yet,
      // so we check if the error status is not 404 first.
      if (err && err.status !== 404) {
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

  var getPreferences = function(cb) {
    api.metadata.preferences.get(userId, cb);
  };

  async.series({
    account: getAccount,
    profile: getProfile,
    preferences: getPreferences,
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    var user = userFromAccountAndProfile(results);

    // Set account info in Rollbar config
    _.isFunction(rollbar.configure) && rollbar.configure({
      payload: {
        person: {
          id: user.userid,
          email: user.username,
          username: user.username,
        }
      }
    });

    // Set permissions for patient profiles
    if (_.get(user, ['profile', 'patient'])) {
      // The logged-in user's permissions are always root
      user.permissions = { root: {} };

      // Attach the logged-in user's patient settings
      setPatientSettings(user, (err, patient) => {
        if (err) {
          return cb(err);
        }

        cb(err, patient)
      });
    } else {
      cb(null, user);
    }

  });
};

api.user.put = function(user, cb) {
  api.log('PUT /user');

  const account = accountFromUser(user);
  const profile = profileFromUser(user);
  const preferences = preferencesFromUser(user);

  const accountUpdates = _.pick(account, 'username', 'password', 'emails', 'termsAccepted');

  async.series({
    account: !_.isEmpty(accountUpdates) ? tidepool.updateCurrentUser.bind(tidepool, account) : (cb) => cb(null, account),
    profile: tidepool.addOrUpdateProfile.bind(tidepool, user.userid, profile),
    preferences: tidepool.addOrUpdatePreferences.bind(tidepool, user.userid, preferences)
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    cb(null, userFromAccountAndProfile(results));
  });
};

function accountFromUser(user) {
  var account = _.pick(user, 'username', 'password', 'emails', 'roles');
  return account;
}

function profileFromUser(user) {
  return _.cloneDeep(user.profile);
}

function preferencesFromUser(user) {
  return _.cloneDeep(user.preferences);
}

function userFromAccountAndProfile(results) {
  // sometimes `account` isn't in the results after e.g., password update
  var account = results.account || {};

  // sometimes `profile` isn't in the results after e.g., after account signup
  var profile = results.profile || {};

  var user = account;
  user.profile = profile;
  user.preferences = results.preferences;

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

api.user.getDataSources = function(cb) {
  api.log('GET /v1/users/:userId/data_sources');

  tidepool.getDataSourcesForUser(tidepool.getUserId(), cb);
};

api.user.createRestrictedToken = function(request, cb) {
  api.log('POST /v1/users/:userId/restricted_tokens');

  tidepool.createRestrictedTokenForUser(tidepool.getUserId(), request, cb);
}

api.user.createOAuthProviderAuthorization = function(provider, restrictedToken, cb) {
  tidepool.createOAuthProviderAuthorization(provider, restrictedToken, cb);
}

api.user.deleteOAuthProviderAuthorization = function(provider, cb) {
  tidepool.deleteOAuthProviderAuthorization(provider, cb);
}

// Get all accounts associated with the current user
api.user.getAssociatedAccounts = function(cb) {
  api.log('GET /patients');

  tidepool.getAssociatedUsersDetails(tidepool.getUserId(), function(err, users) {
    if (err) {
      return cb(err);
    }

    // Filter out viewable users, data donation, and care team accounts separately
    var viewableUsers = [];
    var dataDonationAccounts = [];
    var careTeam = [];

    _.each(users, function(user) {
      if (personUtils.isDataDonationAccount(user)) {
        dataDonationAccounts.push({
          userid: user.userid,
          email: user.username,
          status: 'confirmed',
        });
      } else {
        // An associated user can be both a trustor and trustee, so we want to include them in all
        // applicable groups.
        if (!_.isEmpty(user.trustorPermissions)) {
          // These are the accounts that have shared their data
          // with a given set of permissions.
          user.permissions = user.trustorPermissions
          viewableUsers.push(_.omit(user, 'trustorPermissions', 'trusteePermissions'));
        }
        if (!_.isEmpty(user.trusteePermissions)) {
          // These are accounts with which the user has shared access to their data, exluding the
          // data donation accounts
          user.permissions = user.trusteePermissions
          careTeam.push(_.omit(user, 'trustorPermissions', 'trusteePermissions'));
        }
      }
    });

    return cb(null, {
      patients: viewableUsers,
      dataDonationAccounts,
      careTeam
    });
  });
};

api.user.createCustodialAccount = (profile, cb) => {
  const userId = tidepool.getUserId();
  api.log(`POST /auth/user/${userId}/user`);
  return tidepool.createCustodialAccount(profile, cb);
};

// ----- Patient -----

api.patient = {};

// Get a user's public info
function getPerson(userId, cb) {
  var person = {userid: userId};

  tidepool.findProfile(userId, function(err, profile) {
    if (err) {
      // Due to existing account creation anti-patterns, coupled with automatically sharing our demo
      // account with new VCAs, we can end up with 404s that break login of our demo user when any
      // VCA account has not completed their profile setup. Until this is addressed on the backend,
      // we can't callback an error for 404s.
      if (err.status === 404) {
        person.profile = null;
        return cb(null, person)
      }
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

    // Attach the settings for the patient
    setPatientSettings(person, cb);
  });
}

function setPatientSettings(person, cb) {
  api.metadata.settings.get(person.userid, function(err, settings) {
    if (err) {
      return cb(err);
    }

    person.settings = settings || {};

    return cb(null, person);
  });
}

function updatePatient(patient, cb) {
  var patientId = patient.userid;

  const profile = profileFromUser(patient);
  const loggedInUserId = tidepool.getUserId();
  const updatedEmails = _.get(patient, 'emails');
  const newEmail = _.get(updatedEmails, '0');

  if (loggedInUserId !== patientId) {
    tidepool.findProfile(patientId, function(err, currentProfile){
      if(err){
        return cb(err);
      }
      const currentEmail = _.get(currentProfile, 'emails[0]');
      const isEmailUpdated = newEmail !== currentEmail;
      if(isEmailUpdated){
        return async.series([
          function(callback){
            tidepool.updateCustodialUser({username: newEmail, emails: updatedEmails}, patientId, callback);
          },
          function(callback){
            tidepool.addOrUpdateProfile(patientId, profile, callback);
          },
          function(callback){
            tidepool.signupStart(patient.userid, callback);
          }
        ], function(err, results){
          if(err){
            return cb(err);
          }
          const updatedPatient = userFromAccountAndProfile({ account: results[0], profile: results[1] });

          return cb(null, updatedPatient)
        })
      } else {
        tidepool.addOrUpdateProfile(patientId, profile, function(err, profile) {
          if (err) {
            return cb(err);
          }

          patient = _.assign({}, patient, {profile});
          return cb(null, patient);
        });
      }
    })
  } else {
    tidepool.addOrUpdateProfile(patientId, profile, function(err, profile) {
      if (err) {
        return cb(err);
      }

      patient = _.assign({}, patient, {
        profile: profile,
      });
      return cb(null, patient);
    });
  }
}

api.patient.get = function(patientId, cb) {
  api.log('GET /patients/' + patientId);

  getPatient(patientId, function(err, patient) {
    if (err) {
      return cb(err);
    }

    if (!patient) {
      // No patient profile for this user yet, return "not found"
      return cb({status: 404, response: 'Not found'});
    }

    return cb(null, patient);
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

// ----- Metadata -----

api.metadata = {};

api.metadata.preferences = {};

api.metadata.preferences.get = function(patientId, cb) {
  api.log('GET /metadata/' + patientId + '/preferences');

  tidepool.findPreferences(patientId, function(err, payload) {
    // We don't want to fire an error if the patient has no preferences saved yet,
    // so we check if the error status is not 404 first.
    if (err && err.status !== 404) {
      return cb(err);
    }

    var preferences = payload || {};

    return cb(null, preferences);
  });
};

api.metadata.preferences.put = function(patientId, preferences, cb) {
  api.log('PUT /metadata/' + patientId + '/preferences');

  tidepool.addOrUpdatePreferences(patientId, preferences, function(err, payload) {
    if (err) {
      return cb(err);
    }

    return cb(null, preferences);
  });
};

api.metadata.settings = {};

api.metadata.settings.get = function(patientId, cb) {
  api.log('GET /metadata/' + patientId + '/settings');

  // We don't want to fire an error if the patient has no settings saved yet,
  // so we check if the error status is not 404 first.
  tidepool.findSettings(patientId, function(err, payload) {
    if (err && err.status !== 404) {
      return cb(err);
    }

    var settings = payload || {};

    return cb(null, settings);
  });
};

api.metadata.settings.put = function(patientId, settings, cb) {
  api.log('PUT /metadata/' + patientId + '/settings');

  tidepool.addOrUpdateSettings(patientId, settings, function(err, payload) {
    if (err) {
      return cb(err);
    }

    return cb(null, settings);
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
api.team.getNotes = function(userId, options = {}, cb){
  api.log('GET /message/notes/' + userId);

  tidepool.getNotesForUser(userId, options, function(error,messages){
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

api.patientData.get = function(patientId, options, cb) {
  api.log('GET /data/' + patientId);

  var now = Date.now();
  tidepool.getDeviceDataForUser(patientId, options, function (err, data) {
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

api.invitation.resend = function(inviteId, callback) {
  api.log('PATCH /confirm/resend/invite/' + inviteId);
  return tidepool.resendInvite(inviteId, callback);
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

// ----- Prescription -----

api.prescription = {};

api.prescription.getAllForClinic = function(clinicId, cb) {
  return tidepool.getPrescriptionsForClinic(clinicId, cb);
};

api.prescription.create = function(clinicId, prescription, cb) {
  return tidepool.createPrescription(clinicId, prescription, cb);
};

api.prescription.createRevision = function(clinicId, revision, prescriptionId, cb) {
  return tidepool.createPrescriptionRevision(clinicId, revision, prescriptionId, cb);
};

api.prescription.delete = function(clinicId, prescriptionId, cb) {
  return tidepool.deletePrescription(clinicId, prescriptionId, cb);
};

// ----- Devices -----

api.devices = {};

api.devices.getAll = function(cb) {
  async.parallel({
    cgm: tidepool.getCGMDevices,
    pump: tidepool.getPumpDevices,
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    cb(null, {
      ...results.cgm,
      ...results.pump,
    });
  });
};

// ----- Clinics -----

api.clinics = {};

api.clinics.getAll = function(options, cb) {
  return tidepool.getClinics(options, cb);
};

api.clinics.create = function(clinic, cb) {
  return tidepool.createClinic(clinic, cb);
};

api.clinics.get = function(clinicId, cb) {
  return tidepool.getClinic(clinicId, cb);
};

api.clinics.update = function(clinicId, clinic, cb) {
  return tidepool.updateClinic(clinicId, clinic, cb);
};

api.clinics.getCliniciansFromClinic = function(clinicId, options, cb) {
  return tidepool.getCliniciansFromClinic(clinicId, options, cb);
};

api.clinics.getClinician = function(clinicId, clinicianId, cb) {
  return tidepool.getClinician(clinicId, clinicianId, cb);
};

api.clinics.updateClinician = function(clinicId, clinicianId, clinician, cb) {
  return tidepool.updateClinician(clinicId, clinicianId, clinician, cb);
};

api.clinics.deleteClinicianFromClinic = function(clinicId, clinicianId, cb) {
  return tidepool.deleteClinicianFromClinic(clinicId, clinicianId, cb);
};

api.clinics.deletePatientFromClinic = function(clinicId, patientId, cb) {
  return tidepool.deletePatientFromClinic(clinicId, patientId, cb);
};

api.clinics.getPatientsForClinic = function(clinicId, options, cb) {
  return tidepool.getPatientsForClinic(clinicId, options, cb);
};

api.clinics.getPatientFromClinic = function(clinicId, patientId, cb) {
  return tidepool.getPatientFromClinic(clinicId, patientId, cb);
};

api.clinics.createClinicCustodialAccount = function(clinicId, patient, cb) {
  return tidepool.createClinicCustodialAccount(clinicId, patient, cb);
}

api.clinics.updateClinicPatient = function(clinicId, patientId, patient, cb) {
  return tidepool.updateClinicPatient(clinicId, patientId, patient, cb);
};

api.clinics.inviteClinician = function(clinicId, clinician, cb) {
  return tidepool.inviteClinician(clinicId, clinician, cb);
};

api.clinics.getClinicianInvite = function(clinicId, inviteId, cb) {
  return tidepool.getClinicianInvite(clinicId, inviteId, cb);
};

api.clinics.resendClinicianInvite = function(clinicId, inviteId, cb) {
  return tidepool.resendClinicianInvite(clinicId, inviteId, cb);
};

api.clinics.deleteClinicianInvite = function(clinicId, inviteId, cb) {
  return tidepool.deleteClinicianInvite(clinicId, inviteId, cb);
};

api.clinics.getPatientInvites = function(clinicId, cb) {
  return tidepool.getPatientInvites(clinicId, cb);
};

api.clinics.acceptPatientInvitation = function(clinicId, inviteId, cb) {
  return tidepool.acceptPatientInvitation(clinicId, inviteId, cb);
};

api.clinics.deletePatientInvitation = function(clinicId, inviteId, cb) {
  return tidepool.deletePatientInvitation(clinicId, inviteId, cb);
};

api.clinics.updatePatientPermissions = function(clinicId, patientId, permissions, cb) {
  return tidepool.updatePatientPermissions(clinicId, patientId, permissions, cb);
};

api.clinics.getMRNSettings = function(clinicId, cb) {
  return tidepool.getClinicMRNSettings(clinicId, cb);
};

api.clinics.getEHRSettings = function(clinicId, cb) {
  return tidepool.getClinicEHRSettings(clinicId, cb);
};

api.clinics.getClinicsForPatient = function(userId, options, cb) {
  return tidepool.getClinicsForPatient(userId, options, cb);
};

api.clinics.getClinicianInvites = function(userId, cb) {
  return tidepool.getClinicianInvites(userId, cb);
};

api.clinics.acceptClinicianInvite = function(userId, inviteId, cb) {
  return tidepool.acceptClinicianInvite(userId, inviteId, cb);
};

api.clinics.dismissClinicianInvite = function(userId, inviteId, cb) {
  return tidepool.dismissClinicianInvite(userId, inviteId, cb);
};

api.clinics.getClinicsForClinician = function(clinicianId, options, cb) {
  return tidepool.getClinicsForClinician(clinicianId, options, cb);
};

api.clinics.inviteClinic = function(shareCode, permissions, patientId, cb) {
  return tidepool.inviteClinic(shareCode, permissions, patientId, cb);
};

api.clinics.getClinicByShareCode = function(shareCode, cb) {
  return tidepool.getClinicByShareCode(shareCode, cb);
};

api.clinics.triggerInitialClinicMigration = function(clinicId, cb) {
  return tidepool.triggerInitialClinicMigration(clinicId, cb);
};

api.clinics.sendPatientUploadReminder = function(clinicId, patientId, cb) {
  return tidepool.sendPatientUploadReminder(clinicId, patientId, cb);
};

api.clinics.sendPatientDexcomConnectRequest = function(clinicId, patientId, cb) {
  return tidepool.sendPatientDexcomConnectRequest(clinicId, patientId, cb);
};

api.clinics.createClinicPatientTag = function(clinicId, patientTag, cb) {
  return tidepool.createClinicPatientTag(clinicId, patientTag, cb);
};

api.clinics.updateClinicPatientTag = function(clinicId, patientTagId, patientTag, cb) {
  return tidepool.updateClinicPatientTag(clinicId, patientTagId, patientTag, cb);
};

api.clinics.deleteClinicPatientTag = function(clinicId, patientTagId, cb) {
  return tidepool.deleteClinicPatientTag(clinicId, patientTagId, cb);
};

// ----- Errors -----

api.errors = {};

api.errors.log = function(error, message, properties, cb) {
  api.log('POST /errors');

  // Log error to Rollbar
  if (_.isFunction(rollbar.error)) {
    const extra = {};
    _.assign(extra, message ? { message } : {}, properties);
    if (extra.error) extra.apiError = extra.error;
    if (_.isError(error.originalError)) {
      _.assign(extra, { displayError: _.omit(error, ['originalError']) });
      error = error.originalError;
    }
    if (_.get(error, 'body.reason')) {
      error.message = `API Error: ${error.body.reason}`;
    }
    rollbar.error(error, extra);
  }

  return tidepool.logAppError(error, message, properties, cb);
};

module.exports = api;
