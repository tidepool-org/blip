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

    var mockToken = '123';
    var mockUsername = 'demo';
    var mockPassword = 'demo';

    var getDelayFor = function(name) {
      return (getParam('delay') || getParam(name + '.delay') || 0);
    };

    api.token = null;

    api.init = function(callback) {
      loadSession(function() {
        api.log('[mock] Initialized');
        callback();
      });
    };

    // ----- User -----

    function loadSession(callback) {
      var token;
      var localStorage = window.localStorage;

      if (getParam('auth.skip')) {
        api.log('[mock] Skipping auth');
        saveSession(mockToken);
        setTimeout(callback, getDelayFor('auth.loadsession'));
        return;
      }

      if (localStorage && localStorage.getItem) {
        token = localStorage.getItem('mockAuthToken');
        if (token) {
          saveSession(token);
        }
        setTimeout(callback, getDelayFor('auth.loadsession'));
      }
      else {
        setTimeout(callback, getDelayFor('auth.loadsession'));
      }
      api.log('[mock] Session loaded');
    }

    function saveSession(token, options) {
      options = options || {};

      api.token = token;
      if (options.remember) {
        var localStorage = window.localStorage;
        if (localStorage && localStorage.setItem) {
          localStorage.setItem('mockAuthToken', token);
        }
      }
    }

    function destroySession() {
      api.token = null;
      var localStorage = window.localStorage;
      if (localStorage && localStorage.removeItem) {
        localStorage.removeItem('mockAuthToken');
      }
    }
    api.user.destroySession = destroySession;

    api.user.isAuthenticated = function() {
      return Boolean(api.token);
    };

    api.user.login = function(user, options, callback) {
      var username = user.username;
      var password = user.password;

      // Allow to not pass options object
      options = options || {};
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      setTimeout(function() {
        var err;
        if (username !== mockUsername || password !== mockPassword) {
          err = {status: 401, response: 'Wrong username or password.'};
        }
        if (!err) {
          saveSession(mockToken, options);
          api.log('[mock] Login success');
        }
        else {
          api.log('[mock] Login failed');
        }
        callback(err);
      }, getDelayFor('api.user.login'));
    };

    api.user.logout = function(callback) {
      setTimeout(function() {
        var err;
        if (getParam('auth.logout.error')) {
          err = {status: 500, response: 'Logout failed, please try again.'};
        }
        if (!err) {
          destroySession();
          api.log('[mock] Logout success');
        }
        else {
          api.log('[mock] Logout failed');
        }
        callback(err);
      }, getDelayFor('api.user.logout'));
    };

    api.user.signup = function(user, callback) {
      user = _.clone(user);
      user.userid = '1';
      delete user.password;

      setTimeout(function() {
        var err;
        if (user.username === mockUsername) {
          err = {
            status: 400,
            response: 'An account already exists for that username.'
          };
        }
        if (!err) {
          saveSession(mockToken);
          api.log('[mock] Signup success');
        }
        else {
          api.log('[mock] Signup failed');
        }
        callback(err, user);
      }, getDelayFor('api.user.signup'));
    };

    api.user.get = function(callback) {
      api.log('[mock] GET /user');

      var user = _.cloneDeep(data.user);
      if (getParam('api.user.get.nopatient')) {
        user.profile = _.omit(user.profile, 'patient');
      }
      if (getParam('api.user.get.onlycaregiver')) {
        user.profile = _.omit(user.profile, 'patient');
        user.profile.isOnlyCareGiver = true;
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
          err = {status: 500};
        }
        user = _.assign({}, data.user, user);
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
        var userId = data.user.userid;
        patients = _.filter(patients, function(patient) {
          return patient.userid !== userId;
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
        err = {status: 404, response: 'Not found'};
      }

      if (getParam('api.patient.get.emptyteam')) {
        patient.team = [];
      }

      setTimeout(function() {
        callback(err, patient);
      }, getDelayFor('api.patient.get'));
    };

    api.patient.post = function(patient, callback) {
      api.log('[mock] POST /patients');
      var userId = data.user.userid;
      patient = _.cloneDeep(patient);
      patient.userid = userId;
      data.patients[userId] = patient;
      setTimeout(function() {
        callback(null, patient);
      }, getDelayFor('api.patient.post'));
    };

    api.patient.put = function(patient, callback) {
      var patientId = patient.userid;
      api.log('[mock] PUT /patients/' + patientId);
      var updatedPatient;
      var err;
      if (!data.patients[patientId]) {
        err = {status: 404, response: 'Not found'};
      }
      else {
        updatedPatient = _.assign({}, data.patients[patientId], patient);
        data.patients[patientId] = updatedPatient;
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

      var filterTypes = getParam('api.patientdata.get.filter');
      if (filterTypes) {
        filterTypes = filterTypes.split(',');
        patientData = _.filter(patientData, function(d) {
          return _.contains(filterTypes, d.type);
        });
      }

      setTimeout(function() {
        callback(null, patientData);
      }, getDelayFor('api.patientdata.get'));
    };

    // ----- Team Data -----

    api.team.getMessageThread = function(messageId,callback){
      api.log('[mock] GET /message/thread/' + messageId);

      var thread = data.messagethread[101];
      setTimeout(function() {
        callback(null, thread);
      }, getDelayFor('api.team.getMessageThread'));
    };

    api.team.getNotes = function(userId,callback){
      api.log('[mock] GET /message/notes/' + userId);

      var messages = data.messagenotes[userId] || [];

      messages = _.map(messages, function(message) {
        return {
          utcTime : message.timestamp,
          messageText : message.messagetext,
          parentMessage : message.parentmessage,
          type: 'message',
          _id: message.id
        };
      });

      if (getParam('api.team.getNotes.empty')) {
        messages = [];
      }

      setTimeout(function() {
        callback(null, messages);
      }, getDelayFor('api.team.getNotes'));
    };

    api.team.replyToMessageThread = function(message,cb){
      api.log('[mock] POST /message/reply ',message);

      var fakeId = _.random(0,999);

      setTimeout(function() {
        cb(null, fakeId);
      }, getDelayFor('api.team.replyToMessageThread'));

    };

    api.team.startMessageThread = function(message,cb){
      api.log('[mock] POST /message/send');

      var fakeId = _.random(1000,1999);

      setTimeout(function() {
        cb(null, fakeId);
      }, getDelayFor('api.team.startMessageThread'));

    };

    // ----- Upload -----

    api.getUploadUrl = function() {
      return 'about:blank';
    };

    // ----- Metrics -----

    api.metrics.track = function(eventName, properties, cb) {
      api.log('[mock] GET /metrics/' + window.encodeURIComponent(eventName));

      if (typeof cb === 'function') {
        cb();
      }
    };

    // ----- Errors -----

    api.errors.log = function(error, message, properties) {
      api.log('[mock] POST /errors');
    };

    return api;
  };

  return patch;
};

module.exports = createPatch;
