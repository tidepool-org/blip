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

/* global __DEV__ */

var _ = require('lodash');
var crossfilter = require('crossfilter');
var d3 = require('d3');

var validate = require('./validation/validate');

var BasalUtil = require('./data/basalutil');
var BolusUtil = require('./data/bolusutil');
var BGUtil = require('./data/bgutil');
var dt = require('./data/util/datetime');
var constants = require('./data/util/constants');

var log;
if (typeof window !== 'undefined') {
  log = require('bows')('TidelineData');
}
else {
  log = function() { return; };
}

var startTimer, endTimer;
if (typeof window !== 'undefined' && __DEV__ === true) {
  startTimer = function(name) { console.time(name); };
  endTimer = function(name) { console.timeEnd(name); };
}
else {
  startTimer = function() { return; };
  endTimer = function() { return; };
}

function TidelineData(data, opts) {

  var REQUIRED_TYPES = ['basal', 'bolus', 'wizard', 'cbg', 'message', 'smbg', 'pumpSettings'];

  opts = opts || {};

  var defaults = {
    CBG_PERCENT_FOR_ENOUGH: 0.75,
    CBG_MAX_DAILY: 288,
    SMBG_DAILY_MIN: 4,
    basicsTypes: ['basal', 'bolus', 'cbg', 'smbg', 'deviceEvent'],
    bgClasses: {
      'very-low': {boundary: 60},
      low: {boundary: 80},
      target: {boundary: 180},
      high: {boundary: 300},
      'very-high': {boundary: 600}
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

  var MS_IN_MIN = 60000, MS_IN_DAY = 864e5;

  function checkRequired() {
    startTimer('checkRequired');
    _.each(REQUIRED_TYPES, function(type) {
      if (!that.grouped[type]) {
        log('No', type, 'data! Replaced with empty array.');
        that.grouped[type] = [];
      }
    });
    endTimer('checkRequired');

    return that;
  }

  function addAndResort(datum, a) {
    return _.sortBy((function() {
      a.push(datum);
      return a;
    }()), function(d) { return d.normalTime; });
  }

  function updateCrossFilters(data) {
    startTimer('crossfilter');
    that.filterData = crossfilter(data);
    that.smbgData = crossfilter(that.grouped.smbg || []);
    endTimer('crossfilter');
    that.dataByDate = that.createCrossFilter('datetime');
    that.dataById = that.createCrossFilter('id');
    that.smbgByDate = that.createCrossFilter('smbgByDatetime');
    that.smbgByDayOfWeek = that.createCrossFilter('smbgByDayOfWeek');
  }

  this.createCrossFilter = function(dim) {
    var newDim;
    switch(dim) {
      case 'datetime':
        startTimer(dim + ' dimenstion');
        newDim = this.filterData.dimension(function(d) { return d.normalTime; });
        endTimer(dim + ' dimenstion');
        break;
      case 'id':
        startTimer(dim + ' dimenstion');
        newDim = this.filterData.dimension(function(d) { return d.id; });
        endTimer(dim + ' dimenstion');
        break;
      case 'smbgByDatetime':
        startTimer(dim + ' dimension');
        newDim = this.smbgData.dimension(function(d) { return d.normalTime; });
        endTimer(dim + ' dimension');
        break;
      case 'smbgByDayOfWeek':
        startTimer(dim + ' dimension');
        newDim = this.smbgData.dimension(function(d) { return d.localDayOfWeek; });
        endTimer(dim + ' dimension');
        break;
    }
    return newDim;
  };

  this.addDatum = function(datum) {
    this.watson(datum);
    this.grouped[datum.type] = addAndResort(datum, this.grouped[datum.type]);
    this.data = addAndResort(datum, this.data);
    updateCrossFilters(this.data);
    if (_.includes(opts.diabetesDataTypes, datum.type)) {
      this.diabetesData = addAndResort(datum, this.diabetesData);
    }
    this.generateFillData().adjustFillsForTwoWeekView();
    return this;
  };

  this.editDatum = function(editedDatum, timeKey) {
    var self = this;
    var sortByNormalTime = function(d) { return d.normalTime; };
    this.watson(editedDatum);
    var origDatum = this.dataById.filter(editedDatum.id).top(Infinity)[0];
    origDatum[timeKey] = editedDatum[timeKey];
    // everything has normalTime
    origDatum.normalTime = editedDatum.normalTime;
    if (editedDatum.type === 'message') {
      origDatum.messageText = editedDatum.messageText;
    }
    this.grouped[editedDatum.type] = _.sortBy(self.grouped[editedDatum.type], sortByNormalTime);
    this.data = _.sortBy(self.data, sortByNormalTime);
    if (_.includes(opts.diabetesDataTypes, editedDatum)) {
      this.diabetesData = _.sortBy(self.diabetesData, sortByNormalTime);
    }
    this.generateFillData().adjustFillsForTwoWeekView();
    updateCrossFilters(this.data);
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
    startTimer('fillDataFromInterval');
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
          startsAtMidnight: (hoursClassifier === 0),
          normalTime: point.toISOString(),
          type: 'fill',
          displayOffset: offset,
          twoWeekX: hoursClassifier * MS_IN_DAY/24
        });
      }
    }
    fixGapsAndOverlaps(fillData);
    endTimer('fillDataFromInterval');
    return fillData;
  }

  function getTwoWeekFillEndpoints() {
    startTimer('getTwoWeekFillEndpoints');
    var data;
    if (that.grouped.smbg && that.grouped.smbg.length !== 0) {
      data = that.grouped.smbg;
    } else {
      data = that.diabetesData;
    }

    var first = data[0].normalTime, last = data[data.length - 1].normalTime;
    if (dt.getNumDays(first, last) < 14) {
      first = dt.addDays(last, -13);
    }
    var endpoints;
    if (opts.timePrefs.timezoneAware) {
      var tz = opts.timePrefs.timezoneName;
      endpoints = [
        dt.getUTCOfLocalPriorMidnight(first, tz),
        dt.getUTCOfLocalNextMidnight(last, tz)
      ];
    }
    else {
      endpoints = [dt.getMidnight(first), dt.getMidnight(last, true)];
    }
    endTimer('getTwoWeekFillEndpoints');
    return endpoints;
  }

  this.generateFillData = function() {
    startTimer('generateFillData');
    var lastDatum = this.data[this.data.length - 1];
    // the fill should extend past the *end* of a segment (i.e. of basal data)
    // if that's the last datum in the data
    var lastTimestamp = lastDatum.normalEnd || lastDatum.normalTime;
    var first = new Date(this.data[0].normalTime), last = new Date(lastTimestamp);
    // make sure we encapsulate the domain completely
    if (last - first < MS_IN_DAY) {
      first = d3.time.hour.utc.offset(first, -12);
      last = d3.time.hour.utc.offset(last, 12);
    }
    else {
      first = d3.time.hour.utc.offset(first, -6);
      last = d3.time.hour.utc.offset(last, 6);
    }
    this.grouped.fill = fillDataFromInterval(first, last);
    endTimer('generateFillData');
    return this;
  };

  // two-week view requires background fill rectangles from midnight to midnight
  // for each day from the first through last days where smbg exists at all
  // and for at least 14 days
  this.adjustFillsForTwoWeekView = function() {
    startTimer('adjustFillsForTwoWeekView');
    var fillData = this.grouped.fill;
    var endpoints = getTwoWeekFillEndpoints();
    this.twoWeekData = this.grouped.smbg || [];
    var twoWeekFills = fillDataFromInterval(new Date(endpoints[0]), new Date(endpoints[1]));
    this.twoWeekData = _.sortBy(this.twoWeekData.concat(twoWeekFills), function(d) {
      return d.normalTime;
    });
    endTimer('adjustFillsForTwoWeekView');
  };

  this.setBGPrefs = function() {
    startTimer('setBGPrefs');
    this.bgClasses = opts.bgClasses;
    this.bgUnits = opts.bgUnits;
    if (this.bgUnits === 'mmol/L') { 
      for (var key in opts.bgClasses) {
        opts.bgClasses[key].boundary = opts.bgClasses[key].boundary/constants.GLUCOSE_MM;
      } 
    }
    endTimer('setBGPrefs');
  };

  function makeWatsonFn() {
    var MS_IN_MIN = 60000, watson;
    if (opts.timePrefs.timezoneAware) {
      watson = function(d) {
        if (d.type !== 'fill') {
          d.normalTime = d.time;
          d.displayOffset = -dt.getOffset(d.time, opts.timePrefs.timezoneName);
          if (d.type === 'basal') {
            d.normalEnd = dt.addDuration(d.time, d.duration);
          }
        }
        // for now only adding local features to smbg (for modal day)
        if (d.type === 'smbg') {
          var date = new Date(d.time);
          d.localDayOfWeek = dt.getLocalDayOfWeek(date, opts.timePrefs.timezoneName);
          d.localDate = dt.getLocalDate(date, opts.timePrefs.timezoneName);
        }
      };
    }
    else {
      watson = function(d) {
        if (d.type !== 'fill') {
          if (d.timezoneOffset != null && d.conversionOffset != null) {
            d.normalTime = dt.addDuration(d.time, d.timezoneOffset * MS_IN_MIN + d.conversionOffset);
            d.displayOffset = 0;
          }
          else if (d.type === 'message') {
            if (dt.isATimestamp(d.time)) {
              var datumDt = new Date(d.time);
              var offsetMinutes = datumDt.getTimezoneOffset();
              datumDt.setUTCMinutes(datumDt.getUTCMinutes() - offsetMinutes);
              d.normalTime = datumDt.toISOString();
              d.displayOffset = 0;
            }
          }
          // timezoneOffset is an optional attribute according to the Tidepool data model
          else {
            d.normalTime = d.deviceTime + '.000Z';
            d.displayOffset = 0;
          }
          if (d.deviceTime && d.normalTime.slice(0, -5) !== d.deviceTime) {
            d.warning = 'Combining `time` and `timezoneOffset` does not yield `deviceTime`.';
          }
          if (d.type === 'basal') {
            d.normalEnd = dt.addDuration(d.normalTime, d.duration);
          }
        }
        // for now only adding local features to smbg (for modal day)
        if (d.type === 'smbg') {
          var date = new Date(d.normalTime);
          d.localDayOfWeek = dt.getLocalDayOfWeek(date);
          d.localDate = d.normalTime.slice(0,10);
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

  this.applyNewTimePrefs = function(timePrefs) {
    opts.timePrefs = _.defaults(timePrefs, opts.timePrefs);
    this.createNormalTime().generateFillData().adjustFillsForTwoWeekView();
  };

  this.createNormalTime = function(data) {
    data = data || this.data;
    this.watson = makeWatsonFn();
    for (var i = 0; i < data.length; ++i) {
      this.watson(data[i]);
    }

    return this;
  };

  function hasAWarning(d) {
    if (d.suppressed) {
      return hasAWarning(d.suppressed);
    }
    return d.warning != null;
  }

  startTimer('Watson');
  // first thing to do is Watson the data
  // because validation requires Watson'd data
  this.createNormalTime(data);
  log('Items with deviceTime mismatch warning:', _.filter(data, function(d) {
    return hasAWarning(d);
  }).length);
  endTimer('Watson');

  log('Items to validate:', data.length);

  var res;
  startTimer('Validation');
  res = validate.validateAll(data);
  endTimer('Validation');

  log('Valid items:', res.valid.length);
  log('Invalid items:', res.invalid.length);

  data = res.valid;

  startTimer('group');
  this.grouped = _.groupBy(data, function(d) { return d.type; });
  endTimer('group');

  startTimer('sort groupings');
  _.forEach(this.grouped, function(group, key) {
     that.grouped[key] = _.sortBy(group, 'normalTime');
  });
  endTimer('sort groupings');

  startTimer('diabetesData');
  this.diabetesData = _.sortBy(_.flatten([].concat(_.map(opts.diabetesDataTypes, function(type) {
    return this.grouped[type] || [];
  }, this))), function(d) {
    return d.normalTime;
  });
  endTimer('diabetesData');

  this.setBGPrefs();

  startTimer('setUtilities');
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
    var dData = this.diabetesData;
    this.data = _.sortBy(_.reject(data, function(d) {
      if (d.type === 'message' && d.normalTime < dData[0].normalTime) {
        return true;
      }
      if (d.type === 'settings' && (d.normalTime < dData[0].normalTime || d.normalTime > dData[dData.length - 1].normalTime)) {
        return true;
      }
      if (d.type === 'upload') {
        return true;
      }
    }), function(d) { return d.normalTime; });
    this.generateFillData().adjustFillsForTwoWeekView();
    this.data = _.sortBy(this.data.concat(this.grouped.fill), function(d) { return d.normalTime; });
  }
  else {
    this.data = [];
  }
  endTimer('setUtilities');
  
  updateCrossFilters(this.data);

  startTimer('basicsData');
  this.basicsData = {};
  this.findBasicsData = function() {
    var last = _.findLast(this.data, function(d) {
      switch (d.type) {
        case 'basal':
          return true;
        case 'bolus':
          return true;
        case 'deviceEvent':
          if (d.subType === 'reservoirChange') {
            return true;
          }
          return false;
        default:
          return false;
      }
    });

    // filters out any data that *precedes* basics date range
    // which is determined from available pump data types
    function skimOffBottom(groupData, start) {
      return _.takeRightWhile(groupData, function(d) {
        if (d.type === 'basal') {
          return d.normalEnd >= start;
        }
        return d.normalTime >= start;
      });
    }

    // filters out any data that *follows* basics date range
    // which is determined from available pump data types
    // (data that follows basics date range is possible when a CGM
    // is uploaded more recently (by a couple days, say) than a pump)
    function skimOffTop(groupData, end) {
      return _.takeWhile(groupData, function(d) {
        return d.normalTime < end;
      });
    }
    // wrapping in an if-clause here because of the no-data
    // or CGM-only data cases
    if (last) {
      this.basicsData.timezone = opts.timePrefs.timezoneAware ?
        opts.timePrefs.timezoneName : 'UTC';
      this.basicsData.dateRange = [last.time];
      this.basicsData.dateRange.unshift(
        opts.timePrefs.timezoneAware ?
          dt.findBasicsStart(last.time, opts.timePrefs.timezoneName) :
          dt.findBasicsStart(last.time)
      );
      this.basicsData.days =  opts.timePrefs.timezoneAware ?
        dt.findBasicsDays(this.basicsData.dateRange, opts.timePrefs.timezoneName) :
        dt.findBasicsDays(this.basicsData.dateRange);
      this.basicsData.data = {};

      for (var i = 0; i < opts.basicsTypes.length; ++i) {
        var aType = opts.basicsTypes[i];
        if (!_.isEmpty(this.grouped[aType])) {
          var typeObj;
          if (aType === 'deviceEvent') {
            this.basicsData.data.reservoirChange = {data: _.filter(
              this.grouped[aType],
              function(d) {
                return d.subType === 'reservoirChange';
              }
            )};
            this.basicsData.data.calibration = {data: _.filter(
              skimOffTop(
                skimOffBottom(this.grouped[aType], this.basicsData.dateRange[0]),
                this.basicsData.dateRange[1]
              ),
              function(d) {
                return d.subType === 'calibration';
              }
            )};
          }
          else {
            this.basicsData.data[aType] = {};
            typeObj = this.basicsData.data[aType];
            typeObj.data = skimOffTop(
              skimOffBottom(this.grouped[aType],this.basicsData.dateRange[0]),
              this.basicsData.dateRange[1]
            );
          }
        }
      }
    }
  };
  this.findBasicsData();
  endTimer('basicsData');

  return checkRequired(this);
}

module.exports = TidelineData;
