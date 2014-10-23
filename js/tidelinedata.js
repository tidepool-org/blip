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

var _ = require('lodash');
var crossfilter = require('crossfilter');
var d3 = require('d3');

var validate = require('./validation/validate');

var BasalUtil = require('./data/basalutil');
var BolusUtil = require('./data/bolusutil');
var BGUtil = require('./data/bgutil');
var dt = require('./data/util/datetime');

// var log = require('bows')('TidelineData');

function TidelineData(data, opts) {

  var REQUIRED_TYPES = ['basal', 'bolus', 'wizard', 'cbg', 'message', 'smbg', 'settings'];

  opts = opts || {};

  var defaults = {
    CBG_PERCENT_FOR_ENOUGH: 0.75,
    CBG_MAX_DAILY: 288,
    SMBG_DAILY_MIN: 4,
    bgClasses: {
      'very-low': {boundary: 60},
      low: {boundary: 80},
      target: {boundary: 180},
      high: {boundary: 200},
      'very-high': {boundary: 300}
    },
    bgUnits: 'mg/dL',
    fillOpts: {
      classes: {
        0: 'darkest',
        3: 'dark',
        6: 'lighter',
        9: 'light',
        12: 'lightest',
        15: 'lighter',
        18: 'dark',
        21: 'darker'
      },
      duration: 3
    },
    diabetesDataTypes: [
      'basal',
      'bolus',
      'cbg',
      'settings',
      'smbg',
      'wizard'
    ],
    timePrefs: {
      timezoneAware: false,
      timezoneName: 'US/Pacific'
    }
  };

  _.defaults(opts, defaults);
  var that = this;

  var MS_IN_MIN = 60000;

  function checkRequired() {
    // console.time('checkRequired');
    _.each(REQUIRED_TYPES, function(type) {
      if (!that.grouped[type]) {
        // log('No', type, 'data! Replaced with empty array.');
        that.grouped[type] = [];
      }
    });
    // console.timeEnd('checkRequired');

    return that;
  }

  function addAndResort(datum, a) {
    return _.sortBy((function() {
      a.push(datum);
      return a;
    }()), function(d) { return d.normalTime; });
  }

  function updateCrossFilters(data) {
    // console.time('crossfilter');
    that.filterData = crossfilter(data);
    // console.timeEnd('crossfilter');
    that.dataByDay = that.createCrossFilter('date');
    that.dataByDate = that.createCrossFilter('datetime');
    that.dataById = that.createCrossFilter('id');
    that.dataByType = that.createCrossFilter('datatype');
  }

  this.createCrossFilter = function(dim) {
    var newDim;
    switch(dim) {
      case 'date':
        // console.time('Day Dimension');
        newDim = this.filterData.dimension(function(d) { return d.normalTime.slice(0,10); });
        // console.timeEnd('Day Dimension');
        break;
      case 'datetime':
        // console.time('Datetime Dimension');
        newDim = this.filterData.dimension(function(d) { return d.normalTime; });
        // console.timeEnd('Datetime Dimension');
        break;
      case 'datatype':
        // console.time('Type Dimension');
        newDim = this.filterData.dimension(function(d) { return d.type; });
        // console.timeEnd('Type Dimension');
        break;
      case 'id':
        // console.time('ID Dimension');
        newDim = this.filterData.dimension(function(d) { return d.id; });
        // console.timeEnd('ID Dimension');
        break;
    }
    return newDim;
  };

  this.addDatum = function(datum) {
    this.grouped[datum.type] = addAndResort(datum, this.grouped[datum.type]);
    this.data = addAndResort(datum, this.data);
    updateCrossFilters(this.data);
    return this;
  };

  this.editDatum = function(datum, timeKey) {
    var newDatum = this.dataById.filter(datum.id).top(Infinity);
    // because some timestamps are deviceTime, some are utcTime
    newDatum[timeKey] = datum[timeKey];
    // everything has normalTime
    newDatum.normalTime = datum.normalTime;
    // remove pre-updated datum and add updated
    this.filterData.remove();
    this.filterData.add(newDatum);
    // clear filters
    this.dataById.filter(null);
    this.dataByDate.filter(null);
    return this;
  };

  function fixGapsAndOverlaps(fillData) {
    var lastFill = null;
    for (var i = 0; i < fillData.length; ++i) {
      var fill = fillData[i];
      if (lastFill && fill.normalTime !== lastFill.normalEnd) {
        // catch Fall Back gap
        if (fill.normalTime > lastFill.normalEnd) {
          lastFill.normalEnd = fill.normalTime;
        }
        else if (fill.normalTime < lastFill.normalEnd) {
          lastFill.normalEnd = fill.normalTime;
        }
      }
      lastFill = fill;
    }
  }

  function fillDataFromInterval(first, last) {
    // console.time('fillDataFromInterval');
    var fillData = [], points = d3.time.hour.utc.range(first, last);
    for (var i = 0; i < points.length; ++i) {
      var point = points[i], offset = null;
      var hoursClassifier, localTime;
      if (opts.timePrefs.timezoneAware) {
        offset = -dt.getOffset(point, opts.timePrefs.timezoneName);
        localTime = dt.applyOffset(point, offset);
        hoursClassifier = new Date(localTime).getUTCHours();
      }
      else {
        hoursClassifier = point.getUTCHours();
      }
      if (opts.fillOpts.classes[hoursClassifier] != null) {
        fillData.push({
          fillColor: opts.fillOpts.classes[hoursClassifier],
          fillDate: localTime ? localTime.slice(0,10) : points[i].toISOString().slice(0,10),
          id: 'fill_' + points[i].toISOString().replace(/[^\w\s]|_/g, ''),
          normalEnd: d3.time.hour.utc.offset(point, 3).toISOString(),
          normalTime: points[i].toISOString(),
          type: 'fill',
          displayOffset: offset,
          twoWeekX: hoursClassifier * 864e5/24
        });
      }
    }
    fixGapsAndOverlaps(fillData);
    // console.timeEnd('fillDataFromInterval');
    return fillData;
  }

  function getTwoWeekFillEndpoints() {
    // console.time('getTwoWeekFillEndpoints');
    var data;
    if (that.grouped.smbg && that.grouped.smbg.length !== 0) {
      data = that.grouped.smbg;
    }
    else {
      data = that.diabetesData;
    }
    var first = data[0].normalTime, last = data[data.length - 1].normalTime;
    if (dt.getNumDays(first, last) < 14) {
      first = dt.addDays(last, -13);
    }
    var endpoints;
    if (opts.timePrefs.timezoneAware) {
      first = dt.applyOffset(dt.getMidnight(first), dt.getOffset(first, opts.timePrefs.timezoneName));
      var lastOffset = dt.getOffset(last, opts.timePrefs.timezoneName);
      last = dt.applyOffset(dt.getMidnight(last, true), lastOffset);
      // TODO: possibly remove this
      // it is intended to catch timezones on the other side of the dateline
      // I think that makes sense to fix the issue found here
      // (not generating fill for the last day of data when choosing e.g., New Zealand time)
      // but I haven't fully convinced myself...
      if (Math.abs(lastOffset) >= 720) {
        last = dt.addDays(last, 1);
      }
      endpoints = [first, last];
    }
    else {
      endpoints = [dt.getMidnight(first), dt.getMidnight(last, true)];
    }
    // console.timeEnd('getTwoWeekFillEndpoints');
    return endpoints;
  }

  this.generateFillData = function() {
    // console.time('generateFillData');
    var lastDatum = data[data.length - 1];
    // the fill should extend past the *end* of a segment (i.e. of basal data)
    // if that's the last datum in the data
    var lastTimestamp = lastDatum.normalEnd || lastDatum.normalTime;
    var first = new Date(data[0].normalTime), last = new Date(lastTimestamp);
    // make sure we encapsulate the domain completely
    first = d3.time.hour.utc.offset(first, -6);
    last = d3.time.hour.utc.offset(last, 6);
    this.grouped.fill = fillDataFromInterval(first, last);
    // console.timeEnd('generateFillData');
    return this;
  };

  // two-week view requires background fill rectangles from midnight to midnight
  // for each day from the first through last days where smbg exists at all
  // and for at least 14 days
  this.adjustFillsForTwoWeekView = function() {
    // console.time('adjustFillsForTwoWeekView');
    var fillData = this.grouped.fill;
    var endpoints = getTwoWeekFillEndpoints();
    this.twoWeekData = this.grouped.smbg || [];
    var twoWeekFills = fillDataFromInterval(new Date(endpoints[0]), new Date(endpoints[1]));

    this.twoWeekData = _.sortBy(this.twoWeekData.concat(twoWeekFills), function(d) {
      return d.normalTime;
    });
    // console.timeEnd('adjustFillsForTwoWeekView');
  };

  this.setBGPrefs = function() {
    // console.time('setBGPrefs');
    this.bgClasses = opts.bgClasses;
    var bgData;
    if (!(this.grouped.smbg || this.grouped.cbg)) {
      this.bgUnits = opts.bgUnits;
      return;
    }
    else {
      if (!this.grouped.smbg) {
        bgData = this.grouped.cbg;
      }
      else if (!this.grouped.cbg) {
        bgData = this.grouped.smbg;
      }
      else {
        bgData = this.grouped.smbg.concat(this.grouped.cbg);
      }
    }
    var units = _.uniq(_.pluck(bgData, 'units'));
    if (units.length > 1) {
      // log(new Error('Your BG data is of mixed units; I have no idea how to display it :('));
      this.bgUnits = 'mixed';
    }
    else {
      this.bgUnits = units[0];
    }

    if (this.bgUnits === 'mmol/L') { 
      var GLUCOSE_MM = 18.01559;
      for (var key in opts.bgClasses) {
        opts.bgClasses[key].boundary = opts.bgClasses[key].boundary/GLUCOSE_MM;
      } 
    }
    // console.timeEnd('setBGPrefs');
  };

  function makeWatsonFn() {
    var MS_IN_MIN = 60000, watson;
    if (opts.timePrefs.timezoneAware) {
      watson = function(d) {
        d.normalTime = d.time;
        d.displayOffset = -dt.getOffset(d.time, opts.timePrefs.timezoneName);
        if (d.type === 'basal') {
          d.normalEnd = dt.addDuration(d.time, d.duration);
        }
      };
    }
    else {
      watson = function(d) {
        if (d.timezoneOffset) {
          d.normalTime = dt.addDuration(d.time, d.timezoneOffset * MS_IN_MIN); 
        }
        else if (d.type === 'message') {
          var datumDt = new Date(d.time);
          var offsetMinutes = datumDt.getTimezoneOffset();
          datumDt.setUTCMinutes(datumDt.getUTCMinutes() - offsetMinutes);
          d.normalTime = datumDt.toISOString();
        }
        if (d.deviceTime && d.normalTime.slice(0, -5) !== d.deviceTime) {
          var err = new Error('Combining `time` and `timezoneOffset` does not yield `deviceTime`.');
          // log(err);
          d.errorMessage = err.message;
        }
        if (d.type === 'basal') {
          d.normalEnd = dt.addDuration(d.normalTime, d.duration);
        }
      };
    }
    function applyWatson(d) {
      watson(d);
      if (d.suppressed) {
        applyWatson(d.suppressed);
      }
    }
    return applyWatson;
  }

  var watson = makeWatsonFn();

  // console.time('Watson');
  // first thing to do is Watson the data
  // because validation requires Watson'd data
  for (var i = 0; i < data.length; ++i) {
    var d = data[i];
    watson(d);
  }
  // console.timeEnd('Watson');

  // log('Items to validate:', data.length);

  var res;
  // console.time('Validation');
  res = validate.validateAll(data);
  // console.timeEnd('Validation');

  // log('Valid items:', res.valid.length);
  // log('Invalid items:', res.invalid.length);

  data = res.valid;

  // console.time('group');
  this.grouped = _.groupBy(data, function(d) { return d.type; });
  // console.timeEnd('group');

  // console.time('diabetesData');
  this.diabetesData = _.sortBy(_.flatten([].concat(_.map(opts.diabetesDataTypes, function(type) {
    return this.grouped[type] || [];
  }, this))), function(d) {
    return d.normalTime;
  });
  // console.timeEnd('diabetesData');

  this.setBGPrefs();

  // console.time('setUtilities');
  this.basalUtil = new BasalUtil(this.grouped.basal);
  this.bolusUtil = new BolusUtil(this.grouped.bolus);
  this.cbgUtil = new BGUtil(this.grouped.cbg, {
    bgUnits: this.bgUnits,
    bgClasses: this.bgClasses,
    DAILY_MIN: (opts.CBG_PERCENT_FOR_ENOUGH * opts.CBG_MAX_DAILY)
  });
  this.smbgUtil = new BGUtil(this.grouped.smbg, {
    bgUnits: this.bgUnits,
    bgClasses: this.bgClasses,
    DAILY_MIN: opts.SMBG_DAILY_MIN
  });
  
  if (data.length > 0 && !_.isEmpty(this.diabetesData)) {
    this.data = data;
    this.generateFillData().adjustFillsForTwoWeekView();
    this.data = _.sortBy(this.data.concat(this.grouped.fill), function(d) { return d.normalTime; });
  }
  else {
    this.data = [];
  }
  // console.timeEnd('setUtilities');
  
  updateCrossFilters(this.data);

  return checkRequired(this);
}

module.exports = TidelineData;
