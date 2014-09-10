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

var _ = require('lodash');
var mockData = require('blip-mock-data');

var mock = {};

mock.params = {};
mock.data = mockData;

mock.setParams = function(newParams) {
  this.params = _.assign(this.params, newParams);
  return this.params;
};

mock.getParam = function(name) {
  return mock.params[name];
};

mock.getDelayFor = function(name) {
  return (mock.getParam('delay') || mock.getParam(name + '.delay') || 0);
};

mock.init = function(params) {
  this.setParams(params);
};

mock.patchApi = require('./api').bind(null, {
  data: mock.data,
  getParam: mock.getParam,
  getDelayFor: mock.getDelayFor
});

module.exports = mock;
