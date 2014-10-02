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
var d3 = require('d3');

var validate = require('./validation/validate');

var TidelineCrossFilter = require('./data/util/tidelinecrossfilter');
var BasalUtil = require('./data/basalutil');
var BolusUtil = require('./data/bolusutil');
var BGUtil = require('./data/bgutil');
var SettingsUtil = require('./data/settingsutil');
var dt = require('./data/util/datetime');

var log = require('bows')('TidelineData');

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
    ]
  };

  _.defaults(opts, defaults);
  var that = this;

  function checkRequired() {
    _.each(REQUIRED_TYPES, function(type) {
      if (!that.grouped[type]) {
        log('No', type, 'data! Replaced with empty array.');
        that.grouped[type] = [];
      }
    });

    return that;
  }

  function addAndResort(datum, a) {
    return _.sortBy((function() {
      a.push(datum);
      return a;
    }()), function(d) { return d.normalTime; });
  }

  function updateCrossFilters(data) {
    that.filterData = new TidelineCrossFilter(data);
    that.dataByDate = that.createCrossFilter('date');
    that.dataById = that.createCrossFilter('id');
    that.dataByType = that.createCrossFilter('datatype');
  }

  this.createCrossFilter = function(dim) {
    return this.filterData.addDimension(dim);
  };

  this.addDatum = function(datum) {
    this.grouped[datum.type] = addAndResort(datum, this.grouped[datum.type]);
    this.data = addAndResort(datum, this.data);
    updateCrossFilters(this.data);
    return this;
  };

  this.editDatum = function(datum, timeKey) {
    this.dataById.filter(datum.id);
    var newDatum = this.filterData.getOne(this.dataById);
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

  function fillDataFromInterval(first, last) {
    var data = [];
    var points = d3.time.hour.utc.range(first, last, opts.fillOpts.duration);
    for (var i = 0; i < points.length; ++i) {
      if (i !== points.length - 1) {
        data.push({
          fillColor: opts.fillOpts.classes[points[i].getUTCHours()],
          id: 'fill_' + points[i].toISOString().replace(/[^\w\s]|_/g, ''),
          normalEnd: points[i + 1].toISOString(),
          normalTime: points[i].toISOString(),
          type: 'fill'
        });
      }
    }
    return data;
  }

  function getTwoWeekFillEndpoints() {
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
    return [dt.getMidnight(first), dt.getMidnight(last, true)];
  }

  this.generateFillData = function() {
    var lastDatum = data[data.length - 1];
    // the fill should extend past the *end* of a segment (i.e. of basal data)
    // if that's the last datum in the data
    var lastTimestamp = lastDatum.normalEnd || lastDatum.normalTime;
    var first = new Date(data[0].normalTime), last = new Date(lastTimestamp);
    // make sure we encapsulate the domain completely by padding the start and end with twice the duration
    first.setUTCHours(first.getUTCHours() - first.getUTCHours() % opts.fillOpts.duration - (opts.fillOpts.duration * 2));
    last.setUTCHours(last.getUTCHours() + last.getUTCHours() % opts.fillOpts.duration + (opts.fillOpts.duration * 2));
    this.grouped.fill = fillDataFromInterval(first, last);
    return this;
  };

  // two-week view requires background fill rectangles from midnight to midnight
  // for each day from the first through last days where smbg exists at all
  // and for at least 14 days
  this.adjustFillsForTwoWeekView = function() {
    var fillData = this.grouped.fill;
    var endpoints = getTwoWeekFillEndpoints();
    var startOfTwoWeekFill = endpoints[0], endOfTwoWeekFill = endpoints[1];
    var startOfFill = fillData[0].normalEnd, endOfFill = fillData[fillData.length - 1].normalEnd;
    this.twoWeekData = this.grouped.smbg || [];
    var twoWeekFills = [];
    for (var i = 0; i < this.grouped.fill.length; ++i) {
      var d = this.grouped.fill[i];
      if (d.normalTime >= startOfFill || d.normalTime <= endOfFill) {
        twoWeekFills.push(d);
      }
    }

    // first, fill in two week fills where potentially missing at the end of data domain
    if (endOfTwoWeekFill > endOfFill) {
      var end = new Date(endOfTwoWeekFill);
      // intervals are exclusive of endpoint, so
      // to get last segment, need to extend endpoint out +1
      end.setUTCHours(end.getUTCHours() + 3);
      twoWeekFills = twoWeekFills.concat(
        fillDataFromInterval(new Date(endOfFill),end)
      );
    }
    else {
      // filter out any fills from two week fills that go beyond extent of smbg data
      twoWeekFills = _.reject(twoWeekFills, function(d) {
        return d.normalTime >= endOfTwoWeekFill;
      });
    }

    // similarly, fill in two week fills where potentially missing at the beginning of data domain
    if (startOfTwoWeekFill < startOfFill) {
      twoWeekFills = twoWeekFills.concat(
        fillDataFromInterval(new Date(startOfTwoWeekFill), new Date(startOfFill))
      );
    }
    else {
      // filter out any fills from two week fills that go beyond extent of smbg data
      twoWeekFills = _.reject(twoWeekFills, function(d) {
        return d.normalTime < startOfTwoWeekFill;
      });
    }

    this.twoWeekData = _.sortBy(this.twoWeekData.concat(twoWeekFills), function(d) {
      return d.normalTime;
    });
  };

  this.setBGCategories = function() {
    this.bgClasses = opts.bgClasses;
    var bgData;
    if (!(this.grouped.smbg || this.grouped.cbg)) {
      this.bgUnits = null;
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
      log(new Error('Your BG data is of mixed units; I have no idea how to display it :('));
      this.bgUnits = null;
    }
    else {
      this.bgUnits = units[0];
    }

    if (this.bgUnits === 'mmol/L') { 
      var GLUCOSE_MM = 18.01559;
      for (var key in opts.bgClasses) {
        if (key === 'units') {
          opts.bgClasses[key] = 'mmol/L';
        }
        else {
          opts.bgClasses[key].boundary = opts.bgClasses[key].boundary/GLUCOSE_MM;
        }
      } 
    }
  };

  log('Items to validate:', data.length);

  var res;
  if (typeof window !== 'undefined') {
    console.time('Validation');
    res = validate.validateAll(data);
    console.timeEnd('Validation');
  }
  else {
    res = validate.validateAll(data);
  }


  log('Valid items:', res.valid.length);
  log('Invalid items:', res.invalid.length);

  data = res.valid;

  this.grouped = _.groupBy(data, function(d) { return d.type; });

  this.diabetesData = _.sortBy(_.flatten([].concat(_.map(opts.diabetesDataTypes, function(type) {
    return this.grouped[type] || [];
  }, this))), function(d) {
    return d.normalTime;
  });

  this.setBGCategories();

  this.basalUtil = new BasalUtil(this.grouped.basal);
  this.bolusUtil = new BolusUtil(this.grouped.bolus);
  this.cbgUtil = new BGUtil(this.grouped.cbg, {
    bgUnits: this.bgUnits,
    categories: this.bgClasses,
    DAILY_MIN: (opts.CBG_PERCENT_FOR_ENOUGH * opts.CBG_MAX_DAILY)
  });
  this.smbgUtil = new BGUtil(this.grouped.smbg, {
    bgUnits: this.bgUnits,
    categories: this.bgClasses,
    DAILY_MIN: opts.SMBG_DAILY_MIN
  });
  
  if (data.length > 0 && !_.isEmpty(this.diabetesData)) {
    this.settingsUtil = new SettingsUtil(this.grouped.settings || [], [this.diabetesData[0].normalTime, this.diabetesData[this.diabetesData.length - 1].normalTime]);
    this.settingsUtil.getAllSchedules(this.settingsUtil.endpoints[0], this.settingsUtil.endpoints[1]);
    var segmentsBySchedule = this.settingsUtil.annotateBasalSettings(this.basalUtil.actual);
    this.grouped['basal-settings-segment'] = [];
    for (var key in segmentsBySchedule) {
      this.grouped['basal-settings-segment'] = this.grouped['basal-settings-segment'].concat(segmentsBySchedule[key]);
    }
    this.data = _.sortBy(data.concat(this.grouped['basal-settings-segment']), function(d) {
      return d.normalTime;
    });

    this.generateFillData().adjustFillsForTwoWeekView();
    this.data = _.sortBy(this.data.concat(this.grouped.fill), function(d) { return d.normalTime; });
  }
  else {
    this.data = [];
  }
  
  updateCrossFilters(this.data);

  return checkRequired(this);
}

module.exports = TidelineData;
