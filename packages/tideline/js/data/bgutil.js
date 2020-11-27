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

/* jshint esversion:6 */

var _ = require('lodash');
var crossfilter = require('crossfilter2');

var datetime = require('./util/datetime');
var categorizer = require('./util/categorize');

var { MGDL_UNITS, MMOLL_UNITS, DEFAULT_BG_BOUNDS } = require('../data/util/constants');

function BGUtil(data, opts) {

  opts = opts || {};
  var defaults = {
    bgClasses: {
      'very-low': { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryLow },
      low: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetLower },
      target: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetUpper },
      high: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryHigh },
    },
    bgUnits: MGDL_UNITS
  };
  _.defaults(opts, defaults);

  if (opts.DAILY_MIN == null) {
    throw new Error('BGUtil needs a daily minimum readings (`opts.DAILY_MIN`) in order to calculate a statistic.');
  }

  var MS_IN_24 = 86400000;
  var currentIndex = 0, currentData;

  var defaultResult = {
    low: 0,
    target: 0,
    high: 0,
    total: 0
  };

  var breakdownNaN = {
    low: NaN,
    target: NaN,
    high: NaN,
    total: NaN
  };

  var categorize = categorizer(opts.bgClasses, opts.bgUnits);

  function getCategory (n) {
    var datum = {value:n};
    var category = categorize(datum);
    if (category === "verylow" || category === "low") {
      return 'low';
    }
    else if (category === "target") {
      return 'target';
    }
    else {
      return 'high';
    }
  }

  this.weightedCGMCount = function(data) {
    return _.reduce(data, (total, datum) => {
      let datumWeight = 1;
      const deviceId = _.get(datum, 'deviceId', '');

      // Because our decision as to whether or not there's enough cgm data to warrant using
      // it to calculate average BGs is based on the expected number of readings in a day,
      // we need to adjust the weight of a for the Freestyle Libre datum, as it only
      // collects BG samples every 15 minutes as opposed the default 5 minutes from dexcom.
      if (datum.type === 'cbg' && deviceId.indexOf('AbbottFreeStyleLibre') === 0) {
        datumWeight = 3;
      }

      return total + datumWeight;
    }, 0);
  };

  this.filtered = function(s, e) {
    if (!currentData) {
      currentData = dataByDate.top(Infinity).reverse();
    }
    var start, end;
    if (typeof(s) === 'number') {
      start = new Date(s).toISOString();
      end = new Date(e).toISOString();
    }
    else {
      start = s;
      end = e;
    }
    dataByDate.filter([start, end]);
    var filteredObj = {
      data: dataByDate.top(Infinity).reverse(),
      excluded: []
    };
    var filtered = filteredObj.data;

    var weightedCGMCount = this.weightedCGMCount(filtered);

    if (weightedCGMCount < this.threshold(start, end)) {
      filteredObj.excluded.push(s);
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
        return this.filtered(s, e);
      }
      else if (datetime.isLessThanTwentyFourHours(s, e)) {
        return {data: [], excluded: []};
      }
      else {
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
          return {data: [], excluded: excluded};
        }
        else {
          return {data: result, excluded: excluded};
        }
      }
    }
    else {
      return {data: [], excluded: []};
    }
  };

  this.rangeBreakdown = function(filtered) {
    if (!this.data[0]) {
      return breakdownNaN;
    }
    var breakdown = {type: this.data[0].type};
    if (filtered.length > 0) {
      var groups = _.countBy(filtered, function(d) {
        return getCategory(d.value);
      });
      breakdown = _.defaults(breakdown, groups, defaultResult);
      breakdown.total = breakdown.low + breakdown.target + breakdown.high;
    }
    return _.defaults(breakdown, breakdownNaN);
  };

  this.average = function(filtered) {
    if (filtered.length > 0) {
      var sum = _.reduce(filtered, function(memo, d) {
        return memo + d.value;
      }, 0);
      var average;
      if (opts.bgUnits === MMOLL_UNITS) {
        average = parseFloat((sum/filtered.length)).toFixed(1);
      }
      else {
        average = parseInt((sum/filtered.length).toFixed(0), 10);
      }

      return {value: average, category: getCategory(average)};
    }
    else {
      return {value: NaN, category: '', excluded: filtered.excluded};
    }
  };

  this.threshold = function(s, e) {
    var difference = new Date(e) - new Date(s);
    return Math.floor(opts.DAILY_MIN * (difference/MS_IN_24));
  };

  this.getStats = function(s, e, opts) {
    opts = opts || {};
    var start = new Date(s).toISOString(), end = new Date(e).toISOString();
    dataByDate.filter([start, end]);
    currentData = dataByDate.top(Infinity).reverse();
    var filtered = this.filter(s, e, opts.exclusionThreshold);
    var average = this.average(filtered.data);
    average.excluded = filtered.excluded;
    var breakdown = this.rangeBreakdown(filtered.data);
    breakdown.excluded = filtered.excluded;
    return {
      average: average,
      breakdown: breakdown
    };
  };

  this.data = data || [];
  var filterData = crossfilter(this.data);
  var dataByDate = filterData.dimension(function(d) { return d.normalTime; });
  if (this.data.length > 0) {
    this.endpoints = [this.data[0].normalTime, this.data[data.length - 1].normalTime];
  }
}

module.exports = BGUtil;
