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

var tideline = window.tideline;
var watson = require('../../bower_components/tideline/example/watson');

var SegmentUtil = tideline.data.SegmentUtil;
var BasalUtil = tideline.data.BasalUtil;

var util = {};

// Prepare raw data coming from Tidepool API
util.processData = function(data) {
  if (!(data && data.length)) {
    return data;
  }

  // Munge basal segments
  var segments = new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'}));
  data = _.reject(data, function(d) {
    return d.type === 'basal-rate-segment';
  });
  data = data.concat(segments.actual.concat(segments.undelivered));
  // Watson the data
  data = watson.normalize(data);
  // Ensure the data is properly sorted
  data = _.sortBy(data, function(d) {
    return new Date(d.normalTime).valueOf();
  });

  return data;
};

module.exports = util;