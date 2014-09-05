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

var patch = function(mock, api) {
  var data = mock.data;
  var getParam = mock.getParam;
  var getDelayFor = mock.getDelayFor;

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

  return api;
};

module.exports = patch;
