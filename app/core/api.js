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

import config from '../config';
import { CONFIG as constants } from './constants';
import i18n from './language';
import migrations from './lib/apimigrations';

var personUtils = require('./personutils');

var api = {
  log: bows('Api')
};

api.init = function(cb) {
  var tidepoolLog = bows('Tidepool');

  // Metrics init
  api.metrics.track('setDocumentTitle', constants[config.BRANDING].name);
  api.metrics.track('trackPageView');
  api.metrics.track('setConsentGiven');

  tidepool = createTidepoolClient({
    host: config.API_HOST,
    dataHost: config.API_HOST + '/dataservices',
    uploadApi: config.UPLOAD_API,
    log: {
      warn: tidepoolLog,
      info: tidepoolLog,
      debug: tidepoolLog
    },
    localStore: window.sessionStorage,
    metricsSource: 'blip',
    metricsVersion: config.VERSION
  });

  api.tidepool = tidepool;

  tidepool.initialize(function() {
    api.log('Initialized');
    if (_.isFunction(cb)) {
      cb();
    }
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

// ----- User -----
api.user = {};

api.user.setToken = function(token) {
  if (typeof token === 'string') {
    tidepool.syncToken(token);
  } else {
    tidepool.syncToken(null);
  }
};

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
      api.metrics.track('api', 'Login failed');
      return cb(err);
    }

    let userProfile = 'patient';
    if (typeof data.user === 'object' && Array.isArray(data.user.roles) && data.user.roles.includes('clinic')) {
      userProfile = 'clinical';
    }

    api.metrics.track('api', ['Login succeed', userProfile], cb);
  });
};

api.user.oauthLogin = function(accessToken, cb) {
  api.log('GET /user/oauthLogin');

  tidepool.oauthLogin(accessToken, function(err, data) {
    if (err) {
      api.metrics.track('api', 'OAuth login failed');
      return cb(err);
    }
    api.metrics.track('api', 'OAuth login succeed', null, () => {
      cb(null, data);
    });
  });
};

api.user.signup = function(user, cb) {
  api.log('POST /user');

  var newAccount = accountFromUser(user);
  var newProfile = profileFromUser(user);

  // First, create user account
  tidepool.signup(newAccount, function(err, account) {
    if (err) {
      api.metrics.track('api', 'Signup failed');
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
    if (account.code && account.code === 409) {
      api.metrics.track('api', ['Signup failed', account.reason]);
      return cb({
        status: account.code,
        error: account.reason
      });
    }

    const userId = account.userid;

    tidepool.signupStart(userId, i18n.language, (err) => {
      if (err) {
        api.log('signup process error', err);
      }
      api.log('signup process started');
    });

    // Then, add additional user info (full name, etc.) to profile
    if (newProfile) {
      tidepool.addOrUpdateProfile(userId, newProfile, function(err, results) {
        if (err) {
          api.metrics.track('api', 'Signup failed');
          return cb(err);
        }

        api.log('added profile info to signup', results);
        api.metrics.track('api', 'Signup succeed');
        cb(null, userFromAccountAndProfile({
          account: account,
          profile: results
        }));
      });
    } else {
      api.metrics.track('api', 'Signup succeed');
      cb(null, userFromAccountAndProfile({
        account: account,
      }));
    }
  });
};

api.user.logout = function(cb) {
  api.log('POST /user/logout');

  api.metrics.track('resetUserId');
  api.metrics.track('setConsentGiven');

  if (!api.user.isAuthenticated()) {
    api.log('not authenticated but still destroySession');
    tidepool.destroySession();
    if (_.isFunction(cb)) {
      cb();
    }
    return;
  }

  tidepool.logout(function(err) {
    if (err) {
      api.log('error logging out but still destroySession');
      tidepool.destroySession();
    }
    if (_.isFunction(cb)) {
      cb();
    }
  });
};

api.user.acceptTerms = function(termsData, cb) {
  api.log('PUT /user');
  api.log('terms accepted on', termsData.termsAccepted);
  return tidepool.updateCurrentUser(termsData, cb);
};

api.user.destroySession = function() {
  tidepool.destroySession();
};

api.user.get = (cb) => {
  api.log('GET /user');

  const userId = tidepool.getUserId();

  // Fetch user account data (username, etc.)...
  const getAccount = tidepool.getCurrentUser.bind(tidepool);

  // ...and user profile information (full name, etc.)
  const getProfile = (cb) => {
    tidepool.findProfile(userId, (err, profile) => {
      // We don't want to fire an error if the patient has no profile saved yet,
      // so we check if the error status is not 404 first.
      if (err && err.status !== 404) {
        return cb(err);
      }

      const migration = migrations.profileFullName;
      if (migration.isRequired(profile)) {
        api.log(`Migrating and saving user [${userId}] profile with "fullName"`);
        profile = migration.migrate(profile);
        return tidepool.addOrUpdateProfile(userId, profile, cb);
      }

      return cb(null, profile);
    });
  };

  const getPreferences = (cb) => {
    api.metadata.preferences.get(userId, cb);
  };

  const getSettings = (cb) => {
    api.metadata.settings.get(userId, (err, settings) => {
      if (!_.isEmpty(err) && err.status !== 404) {
        return cb(err);
      }
      if (migrations.country.isRequired(settings)) {
        api.log(`Migrating and saving user [${userId}] settings with default country`);
        const updatedSettings = migrations.country.migrate(settings);
        return api.metadata.settings.put(userId, updatedSettings, cb);
      }
      return cb(null, settings);
    });
  };

  const getConsents = (cb) => {
    api.metadata.consents.get(userId, cb);
  };

  async.series({
    account: getAccount,
    profile: getProfile,
    preferences: getPreferences,
    settings: getSettings,
    consents: getConsents,
  }, (err, results) => {
      if (err) {
        return cb(err);
      }

      const user = userFromAccountAndProfile(results);
      // Set permissions for patient profiles
      if (_.get(user, 'profile.patient')) {
        // The logged-in user's permissions are always root
        user.permissions = { root: {} };
      }

      api.log('api.user.get', user);

      if (userAcceptMetrics(user)) {
        api.metrics.track('setConsentGiven');
        api.metrics.track('setUserId', userId);
      } else {
        api.metrics.track('forgetConsentGiven');
      }

      cb(null, user);
    });
};

api.user.put = function(user, cb) {
  api.log('PUT /user');

  const account = accountFromUser(user);
  const profile = profileFromUser(user);
  const preferences = preferencesFromUser(user);

  async.series({
    account: tidepool.updateCurrentUser.bind(tidepool, account),
    profile: tidepool.addOrUpdateProfile.bind(tidepool, user.userid, profile),
    preferences: tidepool.addOrUpdatePreferences.bind(tidepool, user.userid, preferences)
  },
    function(err, results) {
      if (err) {
        return cb(err);
      }

      const updatedUser = userFromAccountAndProfile(results);
      api.log.debug('Updated user:', updatedUser);
      cb(null, updatedUser);
    });
};

function userAcceptMetrics(/** @type{object} */ user) {
  let accept = config.METRICS_FORCED;
  accept = accept || personUtils.isClinic(user);
  accept = accept || _.get(user, 'consents.yourLoopsData.value', false);
  api.log.debug('User accept metrics:', accept);
  return accept;
}

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
  // Missing information in the result will be kept
  // if previously present
  // See redux / reducer: app/redux/reducers/misc.js:241
  // Event: UPDATE_USER_SUCCESS

  const user = _.get(results, 'account', {});

  const profile = _.get(results, 'profile', null);
  if (!_.isEmpty(profile)) {
    user.profile = profile;
  }

  const preferences = _.get(results, 'preferences', null);
  if (!_.isEmpty(preferences)) {
    user.preferences = preferences;
  }

  const settings = _.get(results, 'settings', null);
  if (!_.isEmpty(settings)) {
    user.settings = settings;
  }

  const consents = _.get(results, 'consents', null);
  if (!_.isEmpty(consents)) {
    user.consents = consents;
  }

  return user;
}

api.user.resendEmailVerification = function(email, callback) {
  api.log('POST /confirm/resend/signup/' + email);
  return tidepool.signupResend(email, i18n.language, callback);
};

api.user.requestPasswordReset = function(email, callback) {
  api.log('POST /confirm/send/forgot/' + email);
  return tidepool.requestPasswordReset(email, true, i18n.language, callback);
};

api.user.confirmPasswordReset = function(payload, callback) {
  api.log('PUT /confirm/accept/forgot');
  return tidepool.confirmPasswordReset(payload, callback);
};

api.user.confirmSignUp = function(key, callback) {
  api.log('PUT /confirm/accept/signup/' + key);
  return tidepool.signupConfirm(key, callback);
};

api.user.custodialConfirmSignUp = function(key, birthday, password, callback) {
  api.log('PUT /confirm/accept/signup/' + key, 'custodial');
  return tidepool.custodialSignupConfirm(key, birthday, password, callback);
};

api.user.getDataSources = function(cb) {
  api.log('GET /v1/users/:userId/data_sources');

  tidepool.getDataSourcesForUser(tidepool.getUserId(), cb);
};

api.user.createRestrictedToken = function(request, cb) {
  api.log('POST /v1/users/:userId/restricted_tokens');

  tidepool.createRestrictedTokenForUser(tidepool.getUserId(), request, cb);
};

api.user.createOAuthProviderAuthorization = function(provider, restrictedToken, cb) {
  tidepool.createOAuthProviderAuthorization(provider, restrictedToken, cb);
};

api.user.deleteOAuthProviderAuthorization = function(provider, cb) {
  tidepool.deleteOAuthProviderAuthorization(provider, cb);
};

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

    _.forEach(users, function(user) {
      if (personUtils.isDataDonationAccount(user)) {
        dataDonationAccounts.push({
          userid: user.userid,
          email: user.username,
          status: 'confirmed',
        });
      } else if (!_.isEmpty(user.trustorPermissions)) {
        // These are the accounts that have shared their data
        // with a given set of permissions.
        user.permissions = user.trustorPermissions;
        delete user.trustorPermissions;
        viewableUsers.push(user);
      } else if (!_.isEmpty(user.trusteePermissions)) {
        // These are accounts with which the user has shared access to their data, exluding the
        // data donation accounts
        user.permissions = user.trusteePermissions;
        delete user.trusteePermissions;
        careTeam.push(user);
      }
    });

    return cb(null, {
      patients: viewableUsers,
      dataDonationAccounts,
      careTeam
    });
  });
};

api.user.getPatientsMetrics = function(accounts, cb) {
  api.log('GET /aggregates/tir');

  var userIds = accounts.patients.map(user => user.userid);
  tidepool.getUsersTir(userIds, function(err, tirs) {
    if (err) {
      return cb(err);
    }
    cb(null, { metrics: tirs });
  });
};
// ----- Patient -----

api.patient = {};

// Get a user's public info
function getPerson(userId, cb) {
  var person = { userid: userId };

  tidepool.findProfile(userId, function(err, profile) {
    if (err) {
      // Due to existing account creation anti-patterns, coupled with automatically sharing our demo
      // account with new VCAs, we can end up with 404s that break login of our demo user when any
      // VCA account has not completed their profile setup. Until this is addressed on the backend,
      // we can't callback an error for 404s.
      if (err.status === 404) {
        person.profile = null;
        return cb(null, person);
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

  var profile = patient.profile;
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

api.patient.get = function(patientId, cb) {
  api.log('GET /patients/' + patientId);

  getPatient(patientId, function(err, patient) {
    if (err) {
      return cb(err);
    }

    if (!patient) {
      // No patient profile for this user yet, return "not found"
      return cb({ status: 404, response: 'Not found' });
    }

    return cb(null, patient);
  });
};

api.patient.post = function(patient, cb) {
  api.log('POST /patients');
  var userId = tidepool.getUserId();
  patient = _.assign({}, patient, { userid: userId });

  return updatePatient(patient, cb);
};

api.patient.put = function(patient, cb) {
  api.log('PUT /patients/' + patient.userid);

  return updatePatient(patient, cb);
};

// ----- Metadata -----

api.metadata = {
  consents: {
    get: (userId, cb) => {
      api.log(`GET /metadata/${userId}/consents`);
      tidepool.findConsents(userId, (err, payload) => {
        // We don't want to fire an error if the patient has no preferences saved yet,
        // so we check if the error status is not 404 first.
        if (err && err.status !== 404) {
          return cb(err);
        }
        cb(null, payload || {});
      });
    },
  }
};

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

  tidepool.addOrUpdatePreferences(patientId, preferences, function(err) {
    if (err) {
      return cb(err);
    }

    return cb(null, preferences);
  });
};

api.metadata.settings = {};

api.metadata.settings.get = function(userId, cb) {
  api.log(`GET /metadata/${userId}/settings`);

  // We don't want to fire an error if the patient has no settings saved yet,
  // so we check if the error status is not 404 first.
  tidepool.findSettings(userId, (err, payload) => {
    if (err && err.status !== 404) {
      return cb(err);
    }

    return cb(null, payload || {});
  });
};

api.metadata.settings.put = function(userId, settings, cb) {
  api.log(`PUT /metadata/${userId}/settings`);

  tidepool.addOrUpdateSettings(userId, settings, (err) => {
    if (err) {
      return cb(err);
    }

    return cb(null, settings);
  });
};

api.metadata.profile = {};
api.metadata.profile.put = function(userId, profile, cb) {
  api.log(`PUT /metadata/${userId}/profile`);

  tidepool.addOrUpdateProfile(userId, profile, (err) => {
    if (err) {
      return cb(err);
    }

    return cb(null, profile);
  });
};

// ----- Team data -----
api.team = {};

//Get all messages for the given thread
api.team.getMessageThread = function(messageId, cb) {
  api.log('GET /message/thread/' + messageId);

  tidepool.getMessageThread(messageId, function(error, messages) {
    if (error) {
      return cb(error);
    }

    //the `note` is always first and then just order the comments on that note
    messages = _.sortBy(messages, function(message) {
      return _.isEmpty(message.parentmessage) || new Date(message.timestamp);
    });

    return cb(null, messages);
  });
};

//Get all notes (parent messages) for the given team
api.team.getNotes = function(userId, options = {}, cb) {
  api.log('GET /message/notes/' + userId);

  tidepool.getNotesForUser(userId, options, function(error, messages) {
    if (error) {
      return cb(error);
    }

    return cb(null, messages);
  });
};

//Add a comment
api.team.replyToMessageThread = function(message, cb) {
  api.log('POST /message/reply/' + message.parentmessage);

  tidepool.replyToMessageThread(message, function(error, replyId) {
    if (error) {
      return cb(error);
    }
    if (cb) {
      cb(null, replyId);
    }
  });
};

//New message
api.team.startMessageThread = function(message, cb) {
  api.log('POST /message/send/' + message.groupid);

  tidepool.startMessageThread(message, function(error, messageId) {
    if (error) {
      return cb(error);
    }
    if (cb) {
      cb(null, messageId);
    }
  });
};

api.team.editMessage = function(message, cb) {
  api.log('PUT /message/edit/' + message.id);

  tidepool.editMessage(message, function(error, details) {
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
  tidepool.getDeviceDataForUser(patientId, options, function(err, data) {
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
  return tidepool.invitesReceived(tidepool.getUserId(), callback);
};

api.invitation.accept = function(key, fromUserId, callback) {
  var loggedInUser = tidepool.getUserId();
  api.log('POST /confirm/accept/invite/' + loggedInUser + '/' + fromUserId);
  return tidepool.acceptInvite(key, loggedInUser, fromUserId, callback);
};

api.invitation.dismiss = function(key, fromUserId, callback) {
  var loggedInUser = tidepool.getUserId();
  api.log('POST /confirm/dismiss/invite/' + loggedInUser + '/' + fromUserId);
  return tidepool.dismissInvite(key, loggedInUser, fromUserId, callback);
};

api.invitation.getSent = function(callback) {
  var loggedInUser = tidepool.getUserId();
  api.log('GET /confirm/invite/' + loggedInUser);
  return tidepool.invitesSent(loggedInUser, callback);
};

api.invitation.cancel = function(emailAddress, callback) {
  var loggedInUser = tidepool.getUserId();
  api.log('DELETE /confirm/' + loggedInUser + '/invited/' + emailAddress);
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

api.metrics = {
  /**
   * boolean used to avoid the metrics service still records the metrics
   * and send the replay on logout
   */
  consentGiven: true,
};

api.metrics.track = function(eventName, properties, cb) {
  if (eventName === 'setConsentGiven') {
    api.metrics.consentGiven = true;
  }

  const metricsService = api.metrics.consentGiven ? config.METRICS_SERVICE : 'disabled';
  const eventParam = _.isEmpty(properties) ? 'n/a' : JSON.stringify(properties);

  if (eventName === 'forgetConsentGiven') {
    api.metrics.consentGiven = false;
  }

  switch (metricsService) {
  case 'matomo':
    if (typeof window._paq !== 'undefined') {
      // Using Matomo Tracker
      api.log.info('Matomo', `"${eventName}" => ${eventParam}`);
      if (eventName === 'setCustomUrl') {
        window._paq.push(['setCustomUrl', properties]);
      } else if (eventName === 'setConsentGiven') {
        window._paq.push(['setConsentGiven']);
        // Do it another time, since only one time seems to not be always enough:
        window._paq.push(['setConsentGiven']);
      } else if (eventName === 'forgetConsentGiven') {
        window._paq.push(['forgetConsentGiven']);
      } else if (eventName === 'setUserId') {
        window._paq.push(['setUserId', properties]);
      } else if (eventName === 'resetUserId') {
        window._paq.push(['resetUserId']);
      } else if (eventName === 'setDocumentTitle' && typeof properties === 'string') {
        window._paq.push(['setDocumentTitle', properties]);
      } else {
        window._paq.push(['trackEvent', eventName, eventParam]);
      }
    } else {
      api.log.error('Matomo tracker is not well configured', eventName, properties);
    }
    break;
  case 'highwater':
    api.log.info('Highwater', `"${eventName}" => ${eventParam}`);
    if (api.metrics.consentGiven) {
      tidepool.trackMetric(eventName, properties);
    }
    break;
  case 'disabled':
    api.log.info('Metrics', `"${eventName}" => ${eventParam}`);
    break;
  default:
    api.log.error('Metrics', `"${eventName}" => ${eventParam}`);
  }

  if (_.isFunction(cb)) {
    cb();
  }
};

// ----- Errors -----

api.errors = {};

api.errors.log = function(error, message, properties, cb) {
  const metricsService = _.get(config, 'METRICS_SERVICE', 'disabled');

  if (metricsService === 'highwater') {
    api.log('POST /errors');
    tidepool.logAppError(error, message, properties, cb);
  } else {
    api.metrics.track('error', { error, message, properties }, cb);
  }
};

module.exports = api;
