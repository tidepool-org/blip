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

var personUtils = require('../app/core/personutils');

var userIdLocalKey = 'mockUserId';
var tokenLocalKey = 'mockAuthToken';

var userIdSize = 10;
var tokenIdSize = 16;

// http://pragmatic-coding.blogspot.ca/2012/01/javascript-pseudo-random-id-generator.html
function generateRandomId(length) {
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", returnValue = "", x, i;

  for (x = 0; x < length; x += 1) {
    i = Math.floor(Math.random() * 62);
    returnValue += chars.charAt(i);
  }

  return returnValue;
}

function generateUserId() {
  return generateRandomId(userIdSize);
}

function generateTokenId() {
  return generateRandomId(tokenIdSize);
}

var createPatch = function(options) {
  var patch = function(api) {
    var getParam = options.getParam || {};
    var data = options.data || {};

    var getDelayFor = function(name) {
      return (getParam('delay') || getParam(name + '.delay') || 0);
    };

    api.token = null;
    api.userId = null;

    api.init = function(callback) {
      loadSession(function() {
        api.log('[mock] Initialized');
        callback();
      });
    };

    // ----- User -----

    function isMatchedTokenPair(userId, token, pair) {
      return pair.userid === userId && pair.token === token;
    }

    function isValidToken(userId, token) {
      var result = _.find(data.tokens,
        isMatchedTokenPair.bind(null, userId, token));
      return Boolean(result);
    }

    function addToken(userId, token) {
      data.tokens.push({
        userid: userId,
        token: token
      });
    }

    function destroyToken(userId, token) {
      data.tokens = _.reject(data.tokens,
        isMatchedTokenPair.bind(null, userId, token));
    }

    function getUserWithCredentials(username, password) {
      return _.find(data.users, function(user) {
        return user.username === username && user.password === password;
      });
    }

    function usernameAlreadyExists(username) {
      var result = _.find(data.users, {username: username});
      return Boolean(result);
    }

    function addUser(user) {
      data.users[user.userid] = user;
    }

    function loadSession(callback) {
      var userId;
      var token;
      var localStorage = window.localStorage;

      if (getParam('auth.skip')) {
        api.log('[mock] Skipping auth');
        userId = data.defaultUserId;
        token = generateTokenId();
        addToken(userId, token);
        saveSession(userId, token);
        setTimeout(callback, getDelayFor('auth.loadsession'));
        return;
      }

      if (localStorage && localStorage.getItem) {
        userId = localStorage.getItem(userIdLocalKey);
        token = localStorage.getItem(tokenLocalKey);
        if (userId && token && isValidToken(userId, token)) {
          saveSession(userId, token);
        }
        setTimeout(callback, getDelayFor('auth.loadsession'));
      }
      else {
        setTimeout(callback, getDelayFor('auth.loadsession'));
      }
      api.log('[mock] Session loaded');
    }

    function saveSession(userId, token, options) {
      options = options || {};

      api.userId = userId;
      api.token = token;
      if (options.remember) {
        var localStorage = window.localStorage;
        if (localStorage && localStorage.setItem) {
          localStorage.setItem(userIdLocalKey, userId);
          localStorage.setItem(tokenLocalKey, token);
        }
      }
    }

    function destroySession() {
      api.userId = null;
      api.token = null;
      var localStorage = window.localStorage;
      if (localStorage && localStorage.removeItem) {
        localStorage.removeItem(userIdLocalKey);
        localStorage.removeItem(tokenLocalKey);
      }
    }
    api.user.destroySession = destroySession;

    api.user.isAuthenticated = function() {
      return Boolean(api.userId && api.token);
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
        var user = getUserWithCredentials(username, password);
        if (!user) {
          err = {status: 401, response: 'Wrong username or password.'};
        }
        if (!err) {
          var userId = user.userid;
          var token = generateTokenId();
          addToken(userId, token);
          saveSession(userId, token, options);
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
          destroyToken(api.userId, api.token);
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
      user = _.cloneDeep(user);

      setTimeout(function() {
        var err;
        if (usernameAlreadyExists(user.username)) {
          err = {
            status: 400,
            response: 'An account already exists for that username.'
          };
        }
        if (!err) {
          user.userid = generateUserId();
          addUser(user);

          var token = generateTokenId();
          addToken(user.userid, token);
          saveSession(user.userid, token);
          api.log('[mock] Signup success');
        }
        else {
          api.log('[mock] Signup failed');
        }

        user = _.omit(user, 'password');
        callback(err, user);
      }, getDelayFor('api.user.signup'));
    };

    api.user.get = function(callback) {
      api.log('[mock] GET /user');

      var user = data.users[api.userId];
      user = _.cloneDeep(user);
      user = _.omit(user, 'password');

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

        var savedUser = data.users[api.userId];
        user = _.assign({}, savedUser, user);
        data.users[api.userId] = user;

        user = _.omit(user, 'password');
        callback(err, user);
      }, getDelayFor('api.user.put'));
    };

    // ----- Patient -----

    function publicPersonInfo(person) {
      return _.omit(person, 'password', 'username', 'emails');
    }

    function updatePatient(patient) {
      var patientId = patient.userid;
      var patientInfo = personUtils.patientInfo(patient);

      var profile = data.users[patientId].profile;
      data.users[patientId].profile = _.assign(profile, {
        patient: patientInfo
      });
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
          patient.team = _.reduce(data.groups,
          function(result, memberGroups, memberId) {
            if (memberId === patientId) {
              return result;
            }

            var permissions = memberGroups[patientId];
            if (!permissions) {
              return result;
            }

            var member = data.users[memberId];
            member = publicPersonInfo(member);
            member.permissions = permissions;
            result.push(member);
            return result;
          }, []);
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

      var thread = data.messagethread.tbd;

      var theNote = _.find(data.messagenotes[11], function(note) {
        return note.id === messageId;
      });

      thread = _.map(thread, function(message) {
        return {
          timestamp: message.timestamp,
          messagetext: message.messagetext,
          userid: message.userid,
          user: message.user,
          parentmessage : messageId,
          groupid : message.groupid,
          id : message.id
        };
      });

      thread.unshift(theNote);

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
          id: message.id
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
      api.log('[mock] POST /message/send ',message);

      var fakeId = _.random(1000,1999);

      setTimeout(function() {
        cb(null, fakeId);
      }, getDelayFor('api.team.startMessageThread'));

    };

    api.team.editMessage = function(message,cb){
      api.log('[mock]  /message/edit');

      setTimeout(function() {
        cb(null, null);
      }, getDelayFor('api.team.editMessage'));
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
