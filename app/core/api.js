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

var _ = window._;
var bows = window.bows;
var config = window.config;

// Legacy
var tidepoolPlatform = require('../tidepool/tidepoolplatform');
var tidepoolPlatformApi;
// New
var tidepool = window.tidepool;

var api = {
  log: bows('Api')
};

api.init = function(cb) {
  tidepoolPlatformApi = tidepoolPlatform({
    apiHost: config.API_HOST,
    uploadApi: config.UPLOAD_API
  });

  _.extend(api.user, tidepoolPlatformApi.user);
  _.extend(api.patient, tidepoolPlatformApi.patient);
  _.extend(api.patientData,  tidepoolPlatformApi.patientData);
  api.getUploadUrl = tidepoolPlatformApi.getUploadUrl;

  api.log('Initialized');
  cb();
};

api.user = {};
api.patient = {};
api.patientData = {};
api.getUploadUrl = function() {};

module.exports = api;
