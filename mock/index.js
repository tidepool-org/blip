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

// Bundle that provides mock services
// Packaged separately and included only if needed
// Exposes all mocks on the global `window.mock` object

var _ = window._;

var mock = {};
window.mock = mock;

mock.params = {};
mock.data = window.data || {};

mock.setParams = function(newParams) {
  this.params = _.assign(this.params, newParams);
  return this.params;
};

mock.getParam = function(name) {
  return mock.params[name];
};

mock.init = function(params) {
  this.setParams(params);
};

mock.patchApi = require('./api')({
  getParam: mock.getParam,
  data: mock.data
});

mock.patchAuth = require('./auth')({
  getParam: mock.getParam
});

module.exports = mock;