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

  this.filter = function(s, e) {
    if (datetime.verifyEndpoints(s, e, this.endpoints)) {
      var start = new Date(s).valueOf(), end = new Date(e).valueOf();
      // TODO: optimize speed (for loop with break?)
      return _.filter(this.data, function(d) {
        var dTime = new Date(d.normalTime).valueOf();
        if ((dTime >= start) && (dTime <= end)) {
          return d;
        }
      });
    }
    else {
      return [];
    }
  };

  this.rangeBreakdown = function(s, e) {
    var filtered = this.filter(s, e);
    if (filtered.length < this.threshold(s, e)) {
      return breakdownNaN;
    }
    else {
      var breakdown = _.countBy(filtered, function(d) {
        return getCategory(d.value);
      });
      _.defaults(breakdown, defaults);
      breakdown.total = breakdown.low + breakdown.target + breakdown.high;
      return breakdown;
    }
  };

  this.average = function(s, e) {
    var data = this.filter(s,e);
    var threshold = this.threshold(s, e);
    if ((threshold > 0) && (data.length > threshold)) {
      var sum = _.reduce(data, function(memo, d) {
        return memo + d.value;
      }, 0);
      var average = parseInt((sum/data.length).toFixed(0), 10);
      return {'value': average, 'category': getCategory(average)};
    }
    else {
      return {'value': NaN, 'category': ''};
    }
  };

  this.threshold = function(s, e) {
    var difference = new Date(e) - new Date(s);
    return Math.floor(PERCENT_FOR_COMPLETE * (MAX_CBG_READINGS_PER_24 * (difference/MS_IN_24)));
  };

  this.data = data;
  if (this.data.length > 0) {
    this.endpoints = [this.data[0].normalTime, this.data[this.data.length - 1].normalTime];
  }
}

module.exports = CBGUtil;