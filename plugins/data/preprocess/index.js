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

var tideline = window.tideline;
var watson = tideline.watson;
var _ = tideline.lib._;
var TidelineData = tideline.TidelineData;
var SegmentUtil = tideline.data.SegmentUtil;

var log = tideline.lib.bows('Preprocess');

var Preprocess = {

  TYPES_TO_INCLUDE: ['basal-rate-segment', 'bolus', 'carbs', 'cbg', 'message', 'smbg', 'settings'],

  REQUIRED_TYPES: ['basal-rate-segment', 'bolus', 'carbs', 'cbg', 'message', 'smbg', 'settings'],

  OPTIONAL_TYPES: [],

  MMOL_STRING: 'mmol/L',

  MGDL_STRING: 'mg/dL',

  MMOL_TO_MGDL: 18,

  mungeBasals: function(data) {
    var segments = new SegmentUtil(_.where(data, {'type': 'basal-rate-segment'}));
    data = _.reject(data, function(d) {
      return d.type === 'basal-rate-segment';
    });
    data = data.concat(segments.actual.concat(segments.getUndelivered('scheduled')));
    return data;
  },

  filterData: function(data) {
    // filter out types we aren't using for visualization
    //  ~and~
    // because of how the Tidepool back end parses some data sources
    // we're creating things like carb events with values of 0, which
    // we don't want to visualize
    //
    // this function also removes all data with value 0 except for basals, since
    // we do want to visualize basals (e.g., temps) with value 0.0
    var nonZeroData = _.groupBy(data, function(d, i) {
      if (_.contains(this.TYPES_TO_INCLUDE, d.type)) {
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
    }, this);
    if (!nonZeroData[true]) {
      nonZeroData[true] = [];
    }
    var includedByType = _.countBy(nonZeroData[true], function(d) { return d.type; });
    log('Excluded:', _.countBy(nonZeroData[false], function(d) { return d.type; }));
    log('# of data points', nonZeroData[true].length);
    log('Data types:', includedByType);

    return nonZeroData[true];
  },

  runWatson: function(data) {
    data = watson.normalizeAll(data);
    // Ensure the data is properly sorted
    data = _.sortBy(data, function(d) {
      return new Date(d.normalTime).valueOf();
    });
    return data;
  },

  checkRequired: function(tidelineData) {
    _.forEach(this.REQUIRED_TYPES, function(type) {
      if (!tidelineData.grouped[type]) {
        tidelineData.grouped[type] = [];
      }
    });

    return tidelineData;
  },

  translateMmol: function(data) {
    var groupByBGUnits = _.groupBy(data, function(d) {
      if (d.units === this.MMOL_STRING) {
        return true;
      }
      else {
        return false;
      }
    }, this);
    if (!groupByBGUnits[false]) {
      groupByBGUnits[false] = [];
    }
    if (!groupByBGUnits[true]) {
      groupByBGUnits[true] = [];
    }
    return groupByBGUnits[false].concat(_.map(groupByBGUnits[true], function(d) {
      d.units = this.MGDL_STRING;
      d.value = parseInt(Math.round(d.value * this.MMOL_TO_MGDL, 10));
      return d;
    }, this));
  },

  processData: function(data) {
    if (!(data && data.length)) {
      return data;
    }

    data = this.filterData(data);
    data = this.mungeBasals(data);
    data = this.runWatson(data);
    data = this.translateMmol(data);

    var tidelineData = this.checkRequired(new TidelineData(data));

    return tidelineData;
  }
};

module.exports = Preprocess;
