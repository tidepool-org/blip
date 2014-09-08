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

var patch = function(mock, api) {
  var patchUser = require('./user').bind(null, mock);
  var patchPatient = require('./patient').bind(null, mock);
  var patchPatientData = require('./patientdata').bind(null, mock);
  var patchTeam = require('./team').bind(null, mock);
  var patchInvitation = require('./invitation').bind(null, mock);
  var patchAccess = require('./access').bind(null, mock);
  var patchMetrics = require('./metrics').bind(null, mock);
  var patchErrors = require('./errors').bind(null, mock);

  api.token = null;
  api.userId = null;

  api = patchUser(api);
  api = patchPatient(api);
  api = patchPatientData(api);
  api = patchTeam(api);
  api = patchInvitation(api);
  api = patchAccess(api);
  api = patchMetrics(api);
  api = patchErrors(api);

  api.getUploadUrl = function() {
    return 'about:blank';
  };

  api.init = function(callback) {
    api.user.loadSession(function() {
      api.log('[mock] Initialized');
      callback();
    });
  };

  return api;
};

module.exports = patch;
