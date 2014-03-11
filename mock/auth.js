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
  var patch = function(auth) {
    var getParam = options.getParam || {};

    auth.mockToken = '123';
    auth.mockUsername = 'demo';
    auth.mockPassword = 'demo';

    var getDelayFor = function(name) {
      return (getParam('delay') || getParam(name + '.delay') || 0);
    };

    auth.init = function(callback) {
      var self = this;

      this.loadSession(function() {
        self.log('[mock] Auth initialized');
        callback();
      });
    };

    auth.loadSession = function(callback) {
      var token;
      var localStorage = window.localStorage;

      if (getParam('auth.skip')) {
        this.log('[mock] Skipping auth');
        this.saveSession(this.mockToken);
        setTimeout(callback, getDelayFor('auth.loadsession'));
        return;
      }

      if (localStorage && localStorage.getItem) {
        token = localStorage.getItem('mockAuthToken');
        if (token) {
          this.saveSession(token);
        }
        setTimeout(callback, getDelayFor('auth.loadsession'));
      }
      else {
        setTimeout(callback, getDelayFor('auth.loadsession'));
      }
      this.log('[mock] Session loaded');
    };

    auth.saveSession = function(token, options) {
      options = options || {};
      
      this.token = token;
      if (options.remember) {
        var localStorage = window.localStorage;
        if (localStorage && localStorage.setItem) {
          localStorage.setItem('mockAuthToken', token);
        }
      }
    };

    auth.destroySession = function() {
      this.token = null;
      var localStorage = window.localStorage;
      if (localStorage && localStorage.removeItem) {
        localStorage.removeItem('mockAuthToken');
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
          err = {status: 401, response: 'Wrong username or password.'};
        }
        if (!err) {
          self.saveSession(self.mockToken, options);
          self.log('[mock] Login success');
        }
        else {
          self.log('[mock] Login failed');
        }
        callback(err);
      }, getDelayFor('auth.login'));
    };

    auth.logout = function(callback) {
      var self = this;
      setTimeout(function() {
        var err;
        if (getParam('auth.logout.error')) {
          err = {status: 500, response: 'Logout failed, please try again.'};
        }
        if (!err) {
          self.destroySession();
          self.log('[mock] Logout success');
        }
        else {
          self.log('[mock] Logout failed');
        }
        callback(err);
      }, getDelayFor('auth.logout'));
    };

    auth.signup = function(user, callback) {
      var self = this;

      user = _.clone(user);
      user.id = '1';
      delete user.password;

      setTimeout(function() {
        var err;
        if (user.username === self.mockUsername) {
          err = {
            status: 400,
            response: 'An account already exists for that username.'
          };
        }
        if (!err) {
          self.saveSession(self.mockToken);
          self.log('[mock] Signup success');
        }
        else {
          self.log('[mock] Signup failed');
        }
        callback(err, user);
      }, getDelayFor('auth.signup'));
    };

    return auth;
  };

  return patch;
};

module.exports = createPatch;