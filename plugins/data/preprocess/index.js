/* 
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */

var _ = window._;

var tideline = window.tideline;
var watson = window.tideline.watson;
var TidelineData = tideline.TidelineData;
var SegmentUtil = tideline.data.SegmentUtil;

var log = window.bows('Preprocess');

module.exports = {
  processData: function(data) {
    if (!(data && data.length)) {
      return data;
    }

    var TYPES_TO_INCLUDE = ['basal-rate-segment', 'bolus', 'carbs', 'cbg', 'message', 'smbg', 'settings'];

    var excluded = [];

    var groupedData = _.groupBy(data, function(d) {
      if (_.contains(TYPES_TO_INCLUDE, d.type)) {
        // exclude value = 0.0 if not basal-rate-segment
        if (d.value === 0) {
          if (d.type === 'basal-rate-segment') {
            return true;
          }
          else {
            return false;
          }
        }
        else {
          return true;
        }
      }
      else {
        return false;
      }
    });

    log('Excluded:', _.countBy(groupedData[false], function(d) { return d.type; }));
    log('# of data points', groupedData[true].length);
    log('Data types:', _.countBy(groupedData[true], function(d) { return d.type; }));

    // Munge basal segments
    var segments = new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'}));
    data = _.reject(data, function(d) {
      return d.type === 'basal-rate-segment';
    });
    data = data.concat(segments.actual.concat(segments.getUndelivered('scheduled')));
    // Watson the data
    data = watson.normalizeAll(data);
    // Ensure the data is properly sorted
    data = _.sortBy(data, function(d) {
      return new Date(d.normalTime).valueOf();
    });

    var tidelineData = new TidelineData(data);

    return tidelineData;
  }
};