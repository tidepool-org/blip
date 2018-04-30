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
/* jshint esversion:6 */

var _ = require('lodash');
var crossfilter = require('crossfilter');
var d3 = require('d3');

var validate = require('./validation/validate');

var BasalUtil = require('./data/basalutil');
var BolusUtil = require('./data/bolusutil');
var BGUtil = require('./data/bgutil');
var dt = require('./data/util/datetime');
var { MGDL_PER_MMOLL, MGDL_UNITS, MMOLL_UNITS, AUTOMATED_BASAL_LABELS } = require('./data/util/constants');

var log = __DEV__ ? require('bows')('TidelineData') : _.noop;
var startTimer = __DEV__ ? function(name) { console.time(name); } : _.noop;
var endTimer = __DEV__ ? function(name) { console.timeEnd(name); } : _.noop;

function TidelineData(data, opts) {
  var REQUIRED_TYPES = ['basal', 'bolus', 'wizard', 'cbg', 'message', 'smbg', 'pumpSettings'];

  opts = opts || {};

  var defaults = {
    CBG_PERCENT_FOR_ENOUGH: 0.75,
    CBG_MAX_DAILY: 288,
    SMBG_DAILY_MIN: 4,
    basicsTypes: ['basal', 'bolus', 'cbg', 'smbg', 'deviceEvent', 'wizard', 'upload'],
    bgClasses: {
      'very-low': { boundary: 55 },
      low: { boundary: 70 },
      target: { boundary: 180 },
      high: { boundary: 300 },
      'very-high': { boundary: 600 }
    },
    bgUnits: MGDL_UNITS,
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
      timezoneName: dt.getBrowserTimezone(),
    }
  };

  if (opts.bgUnits === MMOLL_UNITS) {
    _.forOwn(defaults.bgClasses, function(value, key) {
      defaults.bgClasses[key].boundary = value.boundary/MGDL_PER_MMOLL;
    });
  }

  _.defaultsDeep(opts, defaults);
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

  this.updateCrossFilters = function() {
    startTimer('crossfilter');
    this.filterData = crossfilter(this.data);
    this.smbgData = crossfilter(this.grouped.smbg || []);
    this.cbgData = crossfilter(this.grouped.cbg || []);
    endTimer('crossfilter');
    this.dataByDate = this.createCrossFilter('datetime');
    this.dataById = this.createCrossFilter('id');
    this.smbgByDate = this.createCrossFilter('smbgByDatetime');
    this.smbgByDayOfWeek = this.createCrossFilter('smbgByDayOfWeek');
    this.cbgByDate = this.createCrossFilter('cbgByDatetime');
    this.cbgByDayOfWeek = this.createCrossFilter('cbgByDayOfWeek');

    return this;
  };

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
      case 'cbgByDatetime':
        startTimer(dim + ' dimension');
        newDim = this.cbgData.dimension(function(d) { return d.normalTime; });
        endTimer(dim + ' dimension');
        break;
      case 'cbgByDayOfWeek':
        startTimer(dim + ' dimension');
        newDim = this.cbgData.dimension(function(d) { return d.localDayOfWeek; });
        endTimer(dim + ' dimension');
        break;
    }
    return newDim;
  };

  this.setUtilities = function () {
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
  };

  this.filterDataArray = function() {
    var dData = _.sortBy(this.diabetesData, 'normalTime');
    this.data = _.reject(this.data, function(d) {
      if (d.type === 'message' && d.normalTime < dData[0].normalTime) {
        return true;
      }
      if (d.type === 'pumpSettings' && (d.normalTime < dData[0].normalTime || d.normalTime > dData[dData.length - 1].normalTime)) {
        return true;
      }
      if (d.type === 'upload') {
        return true;
      }
    });
    return this;
  };

  this.deduplicateDataArrays = function() {
    this.data = _.uniq(this.data, 'id');
    this.diabetesData = _.uniq(this.diabetesData, 'id');
    _.each(this.grouped, (val, key) => {
      this.grouped[key] = _.uniq(val, 'id');
    });
    return this;
  };

  this.addData = function(data = []) {
    // Validate all new data received
    startTimer('Validation');
    const validatedData = validate.validateAll(data.map(datum => {
      this.watson(datum);
      return datum;
    }));
    endTimer('Validation');

    // Add all valid new datums to the top of appropriate collections in descending order
    _.eachRight(_.sortBy(validatedData.valid, 'normalTime'), datum => {
      if (! _.isArray(this.grouped[datum.type])) {
        this.grouped[datum.type] = [];
      }

      if (_.includes(opts.diabetesDataTypes, datum.type)) {
        this.diabetesData.unshift(datum);
      }

      this.grouped[datum.type].unshift(datum);
      this.data.unshift(datum);
    });

    // Filter unwanted types from the data array
    this.filterDataArray();

    // generate the fill data for chart BGs
    this.generateFillData().adjustFillsForTwoWeekView();

    // Concatenate the newly generated fill data and sort the resulting array
    this.data = _.sortBy(this.data.concat(this.grouped.fill), 'normalTime');

    // Deduplicate the data
    this.deduplicateDataArrays();

    startTimer('setUtilities');
    this.setUtilities();
    endTimer('setUtilities');

    // Update the crossfilters
    this.updateCrossFilters();

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
    this.updateCrossFilters();
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

  function fillDataFromInterval(first, last, fixGaps = true) {
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
    if (fixGaps) {
      fixGapsAndOverlaps(fillData);
    }
    endTimer('fillDataFromInterval');
    return fillData;
  }

  function getTwoWeekFillEndpoints() {
    startTimer('getTwoWeekFillEndpoints');
    var data = that.diabetesData;

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
    var twoWeekFills = fillDataFromInterval(new Date(endpoints[0]), new Date(endpoints[1]), false);
    this.twoWeekData = _.sortBy(this.twoWeekData.concat(twoWeekFills), function(d) {
      return d.normalTime;
    });
    endTimer('adjustFillsForTwoWeekView');
  };

  this.setBGPrefs = function() {
    startTimer('setBGPrefs');
    this.bgClasses = opts.bgClasses;
    this.bgUnits = opts.bgUnits;
    endTimer('setBGPrefs');
  };

  this.setLastManualBasalSchedule = function() {
    startTimer('setLastManualBasalSchedule');
    var lastManualBasalSchedule = _.findLast(this.grouped.basal, { deliveryType: 'scheduled' });
    if (lastManualBasalSchedule) {
      _.last(this.grouped.pumpSettings).lastManualBasalSchedule = _.get(lastManualBasalSchedule, 'scheduleName');
    }
    endTimer('setLastManualBasalSchedule');
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
        if (d.type === 'smbg' || d.type === 'cbg') {
          var date = new Date(d.time);
          d.localDayOfWeek = dt.getLocalDayOfWeek(date, opts.timePrefs.timezoneName);
          d.localDate = dt.getLocalDate(date, opts.timePrefs.timezoneName);
          d.msPer24 = dt.getMsPer24(d.normalTime, opts.timePrefs.timezoneName);
        }
      };
    }
    else {
      watson = function(d) {
        if (d.type !== 'fill') {
          if (d.timezoneOffset != null && d.conversionOffset != null) {
            d.normalTime = dt.addDuration(d.time, d.timezoneOffset * MS_IN_MIN + d.conversionOffset);
          }
          else if (d.type === 'message') {
            if (dt.isATimestamp(d.time)) {
              var datumDt = new Date(d.time);
              var offsetMinutes = datumDt.getTimezoneOffset();
              datumDt.setUTCMinutes(datumDt.getUTCMinutes() - offsetMinutes);
              d.normalTime = datumDt.toISOString();
            }
          }
          // timezoneOffset is an optional attribute according to the Tidepool data model
          else {
            if (_.isEmpty(d.deviceTime)) {
               d.normalTime = d.time;
            }
            else {
               d.normalTime = d.deviceTime + '.000Z';
            }
          }
          // displayOffset always 0 when not timezoneAware
          d.displayOffset = 0 ;
          if (d.deviceTime && d.normalTime.slice(0, -5) !== d.deviceTime) {
            d.warning = 'Combining `time` and `timezoneOffset` does not yield `deviceTime`.';
          }
          if (d.type === 'basal') {
            d.normalEnd = dt.addDuration(d.normalTime, d.duration);
          }
        }
        // for now only adding local features to smbg & cbg (for modal day)
        if (d.type === 'smbg' || d.type === 'cbg') {
          var date = new Date(d.normalTime);
          d.localDayOfWeek = dt.getLocalDayOfWeek(date);
          d.localDate = d.normalTime.slice(0,10);
          d.msPer24 = dt.getMsPer24(d.normalTime, opts.timePrefs.timezoneName);
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

  this.activeScheduleIsAutomated = function() {
    var latestPumpSettings = _.last(this.grouped.pumpSettings);
    var automatedDeliverySchedule = _.get(AUTOMATED_BASAL_LABELS, _.get(latestPumpSettings, 'source'));
    var activeSchedule = _.get(latestPumpSettings, 'activeSchedule');
    return automatedDeliverySchedule && (automatedDeliverySchedule === activeSchedule);
  };

  if (this.activeScheduleIsAutomated()) {
    this.setLastManualBasalSchedule();
  }

  startTimer('setUtilities');
  this.setUtilities();

  if (data.length > 0 && !_.isEmpty(this.diabetesData)) {
    var dData = this.diabetesData;
    this.data = _.sortBy(data, function(d) { return d.normalTime; });
    this.filterDataArray().generateFillData().adjustFillsForTwoWeekView();
    this.data = _.sortBy(this.data.concat(this.grouped.fill), function(d) { return d.normalTime; });
  }
  else {
    this.data = [];
  }
  endTimer('setUtilities');

  this.updateCrossFilters();

  startTimer('basicsData');
  this.basicsData = {};
  this.findBasicsData = function() {
    var last = _.findLast(this.data, function(d) {
      switch (d.type) {
        case 'basal':
        case 'wizard':
        case 'bolus':
        case 'cbg':
        case 'smbg':
        case 'upload':
          return true;
        case 'deviceEvent':
          var includedSubtypes = [
            'reservoirChange',
            'prime',
            'calibration',
          ];
          if (_.includes(includedSubtypes, d.subType)) {
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
        return d.normalTime <= end;
      });
    }
    // wrapping in an if-clause here because of the no-data
    // or CGM-only data cases
    if (last) {
      this.basicsData.timezone = opts.timePrefs.timezoneAware ?
        opts.timePrefs.timezoneName : 'UTC';
      this.basicsData.dateRange = [last.normalTime];
      this.basicsData.dateRange.unshift(
        opts.timePrefs.timezoneAware ?
          dt.findBasicsStart(last.normalTime, opts.timePrefs.timezoneName) :
          dt.findBasicsStart(last.normalTime)
      );
      this.basicsData.days =  opts.timePrefs.timezoneAware ?
        dt.findBasicsDays(this.basicsData.dateRange, opts.timePrefs.timezoneName) :
        dt.findBasicsDays(this.basicsData.dateRange);
      this.basicsData.data = {};

      for (var i = 0; i < opts.basicsTypes.length; ++i) {
        var aType = opts.basicsTypes[i];
        var typeObj;
        if (aType === 'deviceEvent') {
          this.basicsData.data.reservoirChange = {data: _.filter(
            this.grouped[aType] || [],
            function(d) {
              return d.subType === 'reservoirChange';
            }
          )};
          this.basicsData.data.cannulaPrime = {data: _.filter(
            this.grouped[aType] || [],
            function(d) {
              return (d.subType === 'prime') && (d.primeTarget === 'cannula');
            }
          )};
          this.basicsData.data.tubingPrime = {data: _.filter(
            this.grouped[aType] || [],
            function(d) {
              return (d.subType === 'prime') && (d.primeTarget === 'tubing');
            }
          )};
          this.basicsData.data.calibration = {data: _.filter(
            skimOffTop(
              skimOffBottom(this.grouped[aType] || [], this.basicsData.dateRange[0]),
              this.basicsData.dateRange[1]
            ),
            function(d) {
              return d.subType === 'calibration';
            }
          )};
        }
        else if (aType === 'upload') {
          this.basicsData.data.upload = {
            data: this.grouped.upload,
          };
        }
        else {
          this.basicsData.data[aType] = {};
          typeObj = this.basicsData.data[aType];
          typeObj.data = skimOffTop(
            skimOffBottom(this.grouped[aType] || [], this.basicsData.dateRange[0]),
            this.basicsData.dateRange[1]
          );
        }
      }
    }
  };
  this.findBasicsData();
  endTimer('basicsData');

  return checkRequired(this);
}

module.exports = TidelineData;
