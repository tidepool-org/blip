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

var common = require('./common');

var userIdLocalKey = 'mockUserId';
var tokenLocalKey = 'mockAuthToken';

var userIdSize = 10;
var tokenIdSize = 16;
var confirmationKeySize = 6;

function generateUserId() {
  return common.generateRandomId(userIdSize);
}

function generateTokenId() {
  return common.generateRandomId(tokenIdSize);
}

function generateConfirmationKey() {
  return common.generateRandomId(confirmationKeySize);
}

var patch = function(mock, api) {
  var data = mock.data;
  var getParam = mock.getParam;
  var getDelayFor = mock.getDelayFor;

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

  function matchInvitationsToUser(user) {
    var userId = user.userid;
    var emails = user.emails;
    _.forEach(data.confirmations, function(confirmation) {
      var match = (
        confirmation.type === 'group_invitation' &&
        _.contains(emails, confirmation.email)
      );

      if (match) {
        // Mutate confirmation object in mock data
        confirmation.userid = userId;
      }
    });
  }

  function getPendingPasswordReset(options) {
    return _.find(data.confirmations, function(confirmation) {
      return (
        confirmation.type === 'password_reset' &&
        confirmation.key === options.key &&
        confirmation.email === options.email &&
        confirmation.status === 'pending'
      );
    });
  }

  api.user.loadSession = function(callback) {
    var userId;
    var token;
    var localStorage = window.localStorage;

    var skipWithUserId = getParam('auth.skip');
    if (_.isNumber(skipWithUserId)) {
      skipWithUserId = '' + skipWithUserId;
    }
    if (skipWithUserId && skipWithUserId.length) {
      api.log('[mock] Skipping auth');
      userId = skipWithUserId;
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
  };

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

        matchInvitationsToUser(user);

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

  api.user.requestPasswordReset = function(email, callback) {
    api.log('[mock] POST /user/requestpasswordreset/' + email);

    setTimeout(function() {
      var confirmation = {
        key: generateConfirmationKey(),
        type: 'password_reset',
        status: 'pending',
        email: email
      };

      var user = common.getUserWithEmail(data, email);
      if (user) {
        confirmation.userid = user.userid;
      }

      data.confirmations.push(confirmation);

      callback();
    }, getDelayFor('api.user.requestPasswordReset'));
  };

  api.user.confirmPasswordReset = function(payload, callback) {
    api.log('[mock] POST /user/resetpassword');

    setTimeout(function() {
      var err = {status: 404, response: 'Not found'};
      var confirmation = getPendingPasswordReset(payload);
      if (!confirmation) {
        return callback(err);
      }

      var user = common.getUserWithEmail(data, payload.email);
      if (!user) {
        return callback(err);
      }

      // Note: we are mutating the object in the mock data here
      user.password = payload.password;
      confirmation.status = 'completed';

      callback();
    }, getDelayFor('api.user.confirmPasswordReset'));
  };

  return api;
};

module.exports = patch;
