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
var config = window.config;

var patch = function(auth, options) {
  auth.mockToken = '123';
  auth.mockUsername = 'demo';
  auth.mockPassword = 'demo';

  auth.init = function(callback) {
    var self = this;

    this.loadSession(function() {
      self.log('[demo] Auth initialized');
      callback();
    });
  };

  auth.loadSession = function(callback) {
    var token;
    var localStorage = window.localStorage;
    if (localStorage && localStorage.getItem) {
      token = localStorage.getItem('demoAuthToken');
      if (token) {
        this.saveSession(token);
      }
      setTimeout(callback, config.MOCK_DELAY);
    }
    else {
      setTimeout(callback, config.MOCK_DELAY);
    }
    this.log('[demo] Session loaded');
  };

  auth.saveSession = function(token, options) {
    options = options || {};
    
    this.token = token;
    if (options.remember) {
      var localStorage = window.localStorage;
      if (localStorage && localStorage.setItem) {
        localStorage.setItem('demoAuthToken', token);
      }
    }
  };

  auth.destroySession = function() {
    this.token = null;
    var localStorage = window.localStorage;
    if (localStorage && localStorage.removeItem) {
      localStorage.removeItem('demoAuthToken');
    }
  };

  auth.login = function(user, options, callback) {
    var self = this;
    var username = user.username;
    var password = user.password;

    // Allow to not pass options object
    if (typeof options === 'function') {
      callback = options;
    }

    setTimeout(function() {
      var err;
      if (username !== self.mockUsername || password !== self.mockPassword) {
        err = {message: 'Wrong username or password.'};
      }
      if (!err) {
        self.saveSession(self.mockToken, options);
        self.log('[demo] Login success');
      }
      else {
        self.log('[demo] Login failed');
      }
      callback(err);
    }, config.MOCK_DELAY);
  };

  auth.logout = function(callback) {
    var self = this;
    setTimeout(function() {
      var err;
      if (config.MOCK_VARIANT === 'auth.logout.error') {
        err = {message: 'Logout failed, please try again.'};
      }
      if (!err) {
        self.destroySession();
        self.log('[demo] Logout success');
      }
      else {
        self.log('[demo] Logout failed');
      }
      callback(err);
    }, config.MOCK_DELAY);
  };

  auth.signup = function(user, callback) {
    var self = this;

    user = _.clone(user);
    user.id = '1';
    delete user.password;

    setTimeout(function() {
      var err;
      if (user.username === self.mockUsername) {
        err = {message: 'An account already exists for that username.'};
      }
      if (!err) {
        self.saveSession(self.mockToken);
        self.log('[demo] Signup success');
      }
      else {
        self.log('[demo] Signup failed');
      }
      callback(err, user);
    }, config.MOCK_DELAY);
  };

  return auth;
};

module.exports = patch;