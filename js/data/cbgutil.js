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

var _ = require('../lib/')._;
var datetime = require('./util/datetime');
var log = require('../lib/').bows('CBGUtil');

function CBGUtil(data) {

  var PERCENT_FOR_COMPLETE = 0.75;
  var MAX_CBG_READINGS_PER_24 = 288;
  var MS_IN_24 = 86400000;
  var currentIndex = 0;

  var categories = {
    'low': 80,
    'target': 180
  };

  var defaults = {
    'low': 0,
    'target': 0,
    'high': 0,
    'total': 0
  };

  var breakdownNaN = {
    'low': NaN,
    'target': NaN,
    'high': NaN,
    'total': NaN
  };

  function getCategory (n) {
    if (n <= categories.low) {
      return 'low';
    }
    else if ((n > categories.low) && (n <= categories.target)) {
      return 'target';
    }
    else {
      return 'high';
    }
  }

  this.filtered = function(s, e) {
    var start = new Date(s).valueOf(), end = new Date(e).valueOf();
     // TODO: optimize speed (for loop with break?)
    var data = this.data.slice(currentIndex);
    var filteredObj = {
      'data': [],
      'excluded': []
    };
    var filtered = filteredObj.data;
    _.forEach(data, function(d, i) {
      var dTime = new Date(d.normalTime).valueOf();
      if ((dTime >= start) && (dTime < end)) {
        filtered.push(d);
      }
      else if (dTime >= end) {
        currentIndex += i;
        return false;
      }
      else {
        currentIndex += i;
        return false;
      }
    });
    if (filtered.length < this.threshold(s, e)) {
      filteredObj.excluded.push(new Date(s).toISOString());
      filteredObj.data = [];
      return filteredObj;
    }
    else {
      return filteredObj;
    }
  };

  this.filter = function(s, e, exclusionThreshold) {
    if (datetime.verifyEndpoints(s, e, this.endpoints)) {
      if (datetime.isTwentyFourHours(s, e)) {
        // TODO: factor this out as an updateCurrentIndex hidden function
        currentIndex = _.findIndex(this.data, function(d) {
          return new Date(d.normalTime).valueOf() >= new Date(s).valueOf();
        });
        return this.filtered(s, e);
      }
      else if (datetime.isLessThanTwentyFourHours(s, e)) {
        log('Data domain less than twenty-four hours; cannot calculate bolus total.');
        return {'data': [], 'excluded': []};
      }
      else {
        currentIndex = _.findIndex(this.data, function(d) {
          return new Date(d.normalTime).valueOf() >= new Date(s).valueOf();
        });
        var time = new Date(s).valueOf(), end = new Date(e).valueOf();
        var result = [], excluded = [], next;
        while (time < end) {
          next = new Date(datetime.addDays(time, 1)).valueOf();
          if (datetime.isTwentyFourHours(time, next)) {
            var filtered = this.filtered(time, next);
            result = result.concat(filtered.data);
            excluded = excluded.concat(filtered.excluded);
          }
          time = new Date(next).valueOf();
        }
        if (excluded.length > exclusionThreshold) {
          log(excluded.length, 'days excluded. Not enough CGM data in some days to calculate stats.')
          return {'data': [], 'excluded': excluded};
        }
        else {
          return {'data': result, 'excluded': excluded};
        }
      }
    }
    else {
      return {'data': [], 'excluded': []};
    }
  };

  this.rangeBreakdown = function(filtered) {
    if (filtered.length > 0) {
      var groups = _.countBy(filtered, function(d) {
        return getCategory(d.value);
      });
      var breakdown = _.defaults(groups, defaults);
      breakdown.total = breakdown.low + breakdown.target + breakdown.high;
      return breakdown;
    }
    else {
      return breakdownNaN;
    }
  };

  this.average = function(filtered) {
    if (filtered.length > 0) {
      var sum = _.reduce(filtered, function(memo, d) {
        return memo + d.value;
      }, 0);
      var average = parseInt((sum/filtered.length).toFixed(0), 10);
      return {'value': average, 'category': getCategory(average)};
    }
    else {
      return {'value': NaN, 'category': '', 'excluded': filtered.excluded};
    }
  };

  this.threshold = function(s, e) {
    var difference = new Date(e) - new Date(s);
    return Math.floor(PERCENT_FOR_COMPLETE * (MAX_CBG_READINGS_PER_24 * (difference/MS_IN_24)));
  };

  this.getStats = function(s, e, opts) {
    opts = opts || {};
    currentIndex = 0;
    var filtered = this.filter(s, e, opts.exclusionThreshold);
    var average = this.average(filtered.data);
    average.excluded = filtered.excluded;
    var breakdown = this.rangeBreakdown(filtered.data);
    breakdown.excluded = filtered.excluded;
    return {
      'average': average,
      'breakdown': breakdown
    };
  };

  this.data = data;
  if (this.data.length > 0) {
    this.endpoints = [this.data[0].normalTime, this.data[this.data.length - 1].normalTime];
  }
}

module.exports = CBGUtil;