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

var bows = window.bows;
var config = window.config;
var request = window.superagent;

var api = {
  log: bows('Api'),

  init: function() {
    if (config.DEMO) {
      addDemoOverrides(this);
    }
  },

  user: {},
  patients: {},
  patient: {}
};

// ---------- BEGIN DEMO OVERRIDES ----------
function addDemoOverrides(api) {
  api.demoEndpoint = config.DEMO_ENDPOINT;

  // ----- User -----

  api.user.get = function(callback) {
    var uri = '/user.json';
    api.log('[demo] GET ' + uri);
    setTimeout(function() {
      api._get(uri, callback);
    }, config.DEMO_DELAY);
  };

  api.user.put = function(user, callback) {
    var uri = '/user.json';
    api.log('[demo] PUT ' + uri);
    setTimeout(function() {
      var err;
      if (config.DEMO_VARIANT === 'api.user.put.error') {
        err = true;
      }
      delete user.password;
      delete user.passwordConfirm;
      callback(err, user);
    }, config.DEMO_DELAY);
  };

  // ----- Patients -----

  api.patients.get = function(callback) {
    var uri = '/patients.json';
    api.log('[demo] GET ' + uri);
    setTimeout(function() {
      api._get(uri, callback);
    }, config.DEMO_DELAY);
  };

  // ----- Patient -----

  api.patient.get = function(patientId, callback) {
    var uri = '/patients/' + patientId + '.json';
    api.log('[demo] GET ' + uri);
    setTimeout(function() {
      api._get(uri, callback);
    }, config.DEMO_DELAY);
  };

  api.patient.put = function(patientId, patient, callback) {
    var uri = '/patients/' + patientId + '.json';
    api.log('[demo] PUT ' + uri);
    setTimeout(function() {
      var err;
      if (config.DEMO_VARIANT === 'api.patient.put.error') {
        err = true;
      }
      callback(err, patient);
    }, config.DEMO_DELAY);
  };

  // ----- Private methods -----

  api._url = function(uri) {
    var url = this.demoEndpoint + (uri || '');
    return url;
  };

  api._get = function(uri, callback) {
    var url = this._url(uri);

    request
      .get(url)
      .end(function(err, res) {
        if (err) {
          return callback(err);
        }

        var data = res.body;
        callback(null, data);
      });
  };

  return api;
}
// ---------- END DEMO OVERRIDES ----------

module.exports = api;