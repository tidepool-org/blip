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
var crossfilter = require('crossfilter2');
var d3 = require('d3');
var moment = require('moment-timezone');
var bows = require('bows');

var validate = require('./validation/validate');

var BasalUtil = require('./data/basalutil');
var BolusUtil = require('./data/bolusutil');
var BGUtil = require('./data/bgutil');
var dt = require('./data/util/datetime');
var { MGDL_UNITS, DEFAULT_BG_BOUNDS, BG_CLAMP_THRESHOLD, AUTOMATED_BASAL_LABELS, DEVICE_PARAMS_OFFSET } = require('./data/util/constants');

var log = bows('TidelineData');
var startTimer = _.get(window, 'config.DEV', false) ? function(name) { console.time(name); } : _.noop;
var endTimer = _.get(window, 'config.DEV', false) ? function(name) { console.timeEnd(name); } : _.noop;

function TidelineData(data, opts) {
  var REQUIRED_TYPES = ['basal', 'bolus', 'wizard', 'cbg', 'message', 'smbg', 'pumpSettings', 'physicalActivity', 'deviceEvent'];

  opts = opts || {};
  var bgUnits = opts.bgUnits || MGDL_UNITS;
  var defaults = {
    CBG_PERCENT_FOR_ENOUGH: 0.75,
    CBG_MAX_DAILY: 288,
    SMBG_DAILY_MIN: 4,
    basicsTypes: ['basal', 'bolus', 'cbg', 'smbg', 'deviceEvent', 'wizard', 'upload'],
    bgUnits,
    bgClasses: {
      'very-low': { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryLow },
      low: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetLower },
      target: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetUpper },
      high: { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryHigh },
      'very-high': { boundary: BG_CLAMP_THRESHOLD[bgUnits] },
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
      'smbg',
      'wizard'
    ],
    timePrefs: {
      timezoneAware: false,
      timezoneName: 'UTC',
      timezoneOffset: 0,
    },
    latestPumpManufacturer: 'default',
  };

  _.defaultsDeep(opts, defaults);
  this.opts = opts;
  var that = this;

  const MS_IN_DAY = 864e5;

  function genRandomId() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const hexID = new Array(16);
    for (let i = 0; i < array.length; i++) {
      const b = array[i];
      const hex = (b + 0x100).toString(16).substr(1);
      hexID[i] = hex;
    }
    return hexID.join('');
  }

  function checkRequired() {
    startTimer('checkRequired');
    _.forEach(REQUIRED_TYPES, function(type) {
      if (!that.grouped[type]) {
        log('No', type, 'data! Replaced with empty array.');
        that.grouped[type] = [];
      }
    });
    endTimer('checkRequired');

    return that;
  }

  function filterValidTimezoneDatum(datum) {
    if (typeof datum.timezone !== 'string' || moment.tz.zone(datum.timezone) === null) {
      // No valid timezone found, ignore this entry
      return false;
    }
    // Portal-api data loaded through V1 route force an UTC timezone
    // Portal-api data are:
    //      - pumpSettings/upload type
    //      - deviceEvent type + deviceParameter subType
    if (['UTC', 'Etc/GMT', 'GMT'].indexOf(datum.timezone) > -1) {
      if (['pumpSettings', 'upload'].indexOf(datum.type) > -1) {
        return false;
      }
      if (datum.type === 'deviceEvent' && datum.subType === 'deviceParameter') {
        return false;
      }
    }
    return true;
  }

  function sortPumpSettingsParameters(/** @type{{payload: { parameters: {name: string}[]}}[]} */ pumpSettings) {
    const settingsOrder = [
      'MEDIUM_MEAL_BREAKFAST',
      'MEDIUM_MEAL_LUNCH',
      'MEDIUM_MEAL_DINNER',
      'TOTAL_INSULIN_FOR_24H',
      'WEIGHT',
      'PATIENT_GLY_HYPER_LIMIT',
      'PATIENT_GLY_HYPO_LIMIT',
      'PATIENT_GLYCEMIA_TARGET',
      'PATIENT_BASAL_AGGRESSIVENESS_FACTOR_LEVEL_IN_EUGLYCAEMIA',
      'BOLUS_AGGRESSIVENESS_FACTOR',
      'MEAL_RATIO_BREAKFAST_FACTOR',
      'MEAL_RATIO_LUNCH_FACTOR',
      'MEAL_RATIO_DINNER_FACTOR',
      'SMALL_MEAL_BREAKFAST',
      'LARGE_MEAL_BREAKFAST',
      'SMALL_MEAL_LUNCH',
      'LARGE_MEAL_LUNCH',
      'SMALL_MEAL_DINNER',
      'LARGE_MEAL_DINNER',
    ];
    if (!Array.isArray(pumpSettings)) {
      return;
    }
    startTimer('sortPumpSettingsParameters');
    pumpSettings.forEach((ps) => {
      /** @type {{name: string, value: string, level: number|string, unit: string}[]} */
      const p = _.get(ps, 'payload.parameters', []);
      p.sort((a, b) => {
        const aIdx = settingsOrder.indexOf(a.name);
        const bIdx = settingsOrder.indexOf(b.name);
        if (aIdx < 0) {
          return 1;
        }
        if (bIdx < 0) {
          return -1;
        }
        return aIdx - bIdx;
      });
    });
    endTimer('sortPumpSettingsParameters');
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
    switch (dim) {
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

  this.setDeviceParameters = function (data = []) {
    var parameters = _.filter(data, { type: 'deviceEvent', subType: 'deviceParameter' });
    var sortedParameters = _.orderBy(parameters, ['normaltime'], ['desc']);

    this.deviceParameters = [];
    if (sortedParameters.length > 0) {
      var first = sortedParameters[0];
      var group = {
        normalTime: first.normalTime,
        id: first.id,
        params: [first]
      };
      if (sortedParameters.length > 1) {
        for (let i = 1; i < sortedParameters.length; ++i) {
          const item = sortedParameters[i];
          if (dt.difference(item.normalTime, group.normalTime) < DEVICE_PARAMS_OFFSET) {
            // add to current group
            group.params.push(item);
          } else {
            this.deviceParameters.push(group);
            group = {
              normalTime: item.normalTime,
              id: item.id,
              params: [item]
            };
          }
        }
      }
      this.deviceParameters.push(group);
    }
  };

  this.deduplicatePhysicalActivities = function (data = []) {
    // normalize eventId and inputTime
    _.filter(data, { type: 'physicalActivity' }).forEach(
      pa => {
        if (!_.isString(pa.eventId) || _.isEmpty(pa.eventId)) {
          pa.eventId = pa.id;
        }
        if (!_.isString(pa.inputTime) || _.isEmpty(pa.inputTime)) {
          pa.inputTime = pa.normalTime;
        }
        return pa;
      });
    // get all PAs grouped by eventID
    var physicalActivity = _.groupBy(_.filter(data, { type: 'physicalActivity' }), 'eventId');
    // For each eventID sort by inputTime
    _.forEach(physicalActivity, (value, key) => {
      physicalActivity[key] = _.orderBy(value, ['inputTime'], ['desc']);
    });
    // For each eventID take the most recent item
    this.physicalActivities = _.map(physicalActivity, (value) => value[0]);
  };

  this.setEvents = function (data = [], filter = {}, order = ['inputTime']) {
    const sourceEvents = _.groupBy(_.filter(data, filter), 'eventId');
    const events = {};
    _.forEach(sourceEvents, function(value, key) {
      events[key] = _.orderBy(value, order, ['desc']);
    });
    const res = _.map(events, function(value) {
      return value[0];
    });
    return res;
  };

  this.addManufacturer = function(grouped = {}) {
    // get latest pump manufacturer
    const lastPump = _.maxBy(grouped.pumpSettings, 'normalTime');
    const defaultPumpManufacturer = {
      payload: { pump: { manufacturer: 'default' } }
    };
    const pump = _.get(_.merge({}, defaultPumpManufacturer, lastPump), 'payload.pump');
    // make sure to use the correct format
    _.update(pump, 'manufacturer', (o) => _.capitalize(o));
    // inject the manufacturer in the deviceEvents
    _.forEach(grouped.deviceEvent, (val, key) => {
      _.assign(grouped.deviceEvent[key], { pump });
    });
    return pump.manufacturer;
  };

  this.checkTimezone = function() {
    if (!Array.isArray(this.grouped.upload)) {
      return;
    }
    startTimer('checkTimezone');
    const uploadIdFilter = crossfilter(this.grouped.upload).dimension((d) => d.id);
    const nData = this.data.length;
    let nUpdate = 0;
    let timezone = null;
    let timezoneOffset = 0;

    if (opts.timePrefs.timezoneAware) {
      timezone = opts.timePrefs.timezoneName;
    }

    for (let i = 0; i < nData; i++) {
      const datum = this.data[i];
      // We need the source info for the tooltips (only diabeloop source may have this information):
      if (datum.type !== 'upload' && typeof datum.source !== 'string') {
        const uploadDatum = uploadIdFilter.filterExact(datum.uploadId).top(1);
        if (uploadDatum.length > 0) {
          datum.source = uploadDatum[0].source;
          nUpdate++;
        } else {
          // Use another upload
          datum.source = this.grouped.upload[0].source;
          nUpdate++;
        }
      }
      // deviceEvent / timeChange datum:
      if (!filterValidTimezoneDatum(datum)) {
        // No valid timezone found, ignore this entry
        continue;
      }
      if (timezone === null || (timezone !== 'UTC' && timezoneOffset === 0)) {
        const mTime = moment.tz(datum.normalTime, datum.timezone);
        if (mTime.isValid()) {
          timezoneOffset = mTime.utcOffset();
          timezone = datum.timezone;
        }
      } else if (timezone !== null && timezone !== 'UTC' && datum.timezone !== 'UTC' && timezone !== datum.timezone) {
        // Create timezone change datum
        const prevTime = moment.tz(datum.normalTime, timezone).format('YYYY-MM-DDTHH:mm:ss');
        const mTime = moment.tz(datum.normalTime, datum.timezone);
        const newTime = mTime.format('YYYY-MM-DDTHH:mm:ss');
        timezone = datum.timezone;
        timezoneOffset = mTime.utcOffset();
        const datumTimezoneChange = {
          id: genRandomId(),
          time: datum.normalTime,
          normalTime: datum.normalTime,
          timezone: datum.timezone,
          timezoneOffset,
          type: 'deviceEvent',
          subType: 'timeChange',
          source: 'Diabeloop',
          from: {
            time: prevTime,
            timeZoneName: timezone,
          },
          to: {
            time: newTime,
            timeZoneName: datum.timezone,
          },
          method: 'guessed',
        };
        this.data.push(datumTimezoneChange);
        log('Timezone change', datumTimezoneChange);
      } else if (timezone !== null && datum.timezone === timezone) {
        // Offset change in the same timezone (daily saving time)
        const mTime = moment.tz(datum.normalTime, datum.timezone);
        const newOffset = mTime.utcOffset();
        if (newOffset !== timezoneOffset) {
          const zone = moment.tz.zone(timezone);
          // Get the closest timechange
          const utcDatumTime = mTime.valueOf();
          let utcTimeChange = 0;
          for (let u = 0; u < zone.untils.length; u++) {
            if (zone.untils[u] > utcDatumTime && u > 0) {
              utcTimeChange = zone.untils[u - 1];
              break;
            }
          }
          const prevMoment = moment.tz(utcTimeChange - 1, timezone);
          const newMoment = moment.tz(utcTimeChange, timezone);
          const normalTime = newMoment.toISOString();
          timezoneOffset = newOffset;

          const datumOffsetChange = {
            id: genRandomId(),
            time: normalTime,
            normalTime,
            timezone,
            timezoneOffset,
            type: 'deviceEvent',
            subType: 'timeChange',
            source: 'Diabeloop',
            from: {
              time: prevMoment.toISOString(),
              timeZoneName: timezone,
            },
            to: {
              time: normalTime,
              timeZoneName: timezone,
            },
            method: 'guessed',
          };
          this.data.push(datumOffsetChange);
          log('Offset change', datumOffsetChange);
        }
      }
    }

    // Keep last offset
    opts.timePrefs.timezoneOffset = timezoneOffset;
    log('Number of datum source updated:', nUpdate);
    endTimer('checkTimezone');
  };

  this.filterTempBasal = (data) => _.reject(data, (d) => (d.type === 'basal' && d.deliveryType === 'temp'));

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
    this.data = _.uniqBy(this.data, 'id');
    this.diabetesData = _.uniqBy(this.diabetesData, 'id');
    _.forEach(this.grouped, (val, key) => {
      this.grouped[key] = _.uniqBy(val, 'id');
    });
    return this;
  };

  this.addData = function(data = []) {
    // Validate all new data received
    data = this.filterTempBasal(data);
    startTimer('Validation');
    const validatedData = validate.validateAll(data.map(datum => {
      this.watson(datum);
      return datum;
    }));
    endTimer('Validation');

    // Remove generated timezone event
    this.data = _.reject(this.data, (d) => d.type === 'deviceEvent' && d.subType === 'timeChange' && d.method === 'guessed');
    if (Array.isArray(this.grouped.deviceEvent)) {
      this.grouped.deviceEvent = _.reject(this.grouped.deviceEvent, (d) => d.type === 'deviceEvent' && d.subType === 'timeChange' && d.method === 'guessed');
    }

    // Add all valid new datums to the top of appropriate collections in descending order
    _.forEachRight(_.sortBy(validatedData.valid, 'normalTime'), datum => {
      if (!_.isArray(this.grouped[datum.type])) {
        this.grouped[datum.type] = [];
      }

      if (_.includes(opts.diabetesDataTypes, datum.type)) {
        this.diabetesData.unshift(datum);
      }

      this.grouped[datum.type].unshift(datum);
      this.data.unshift(datum);
    });

    sortPumpSettingsParameters(this.grouped.pumpSettings);

    // Filter unwanted types from the data array
    this.filterDataArray();

    // generate the fill data for chart BGs
    this.generateFillData().adjustFillsForTwoWeekView();

    // Concatenate the newly generated fill data and sort the resulting array
    this.data = _.sortBy(this.data.concat(this.grouped.fill), 'normalTime');

    // Deduplicate the data
    this.deduplicateDataArrays();

    // get DeviceParameters
    this.setDeviceParameters(this.data);

    this.zenEvents = this.setEvents(
      this.data,
      { type: 'deviceEvent', subType: 'zen' },
      ['inputTime']
    );
    this.confidentialEvents = this.setEvents(
      this.data,
      { type: 'deviceEvent', subType: 'confidential' },
      ['inputTime']
    );

    // get PhysicalActivities
    this.deduplicatePhysicalActivities(this.data);

    // Timezone change events (for tooltips)
    this.checkTimezone();

    startTimer('setUtilities');
    this.setUtilities();
    endTimer('setUtilities');

    this.latestPumpManufacturer = this.addManufacturer(this.grouped);

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
          fillDate: localTime ? localTime.slice(0, 10) : points[i].toISOString().slice(0, 10),
          id: 'fill_' + points[i].toISOString().replace(/[^\w\s]|_/g, ''),
          normalEnd: d3.time.hour.utc.offset(point, 3).toISOString(),
          startsAtMidnight: (hoursClassifier === 0),
          normalTime: point.toISOString(),
          type: 'fill',
          displayOffset: offset,
          twoWeekX: hoursClassifier * MS_IN_DAY / 24
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

    // mg/dL values are converted to mmol/L and rounded to 5 decimal places on platform.
    // This can cause some discrepancies when converting back to mg/dL, and throw off the
    // categorization.
    // i.e. A 'target' value 180 gets stored as 9.99135, which gets converted back to 180.0000651465
    // which causes it to be classified as 'high'
    // Thus, we need to allow for our thresholds accordingly.
    if (this.bgUnits === MGDL_UNITS) {
      var roundingAllowance = 0.0001;
      this.bgClasses['very-low'].boundary -= roundingAllowance;
      this.bgClasses.low.boundary -= roundingAllowance;
      this.bgClasses.target.boundary += roundingAllowance;
      this.bgClasses.high.boundary += roundingAllowance;
    }
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
          d.normalTime = (new Date(d.time)).toISOString();
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
        if (d.type === 'deviceEvent' && d.subType === 'confidential') {
          const m = moment.utc(d.time);
          m.add(_.get(d, 'duration.value', 0), _.get(d, 'duration.units', 'hours'));
          d.normalEnd = m.toISOString();
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
          d.displayOffset = 0;
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
          d.localDate = d.normalTime.slice(0, 10);
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

  data = this.filterTempBasal(data);

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
  sortPumpSettingsParameters(this.grouped.pumpSettings);
  endTimer('sort groupings');

  startTimer('diabetesData');
  this.diabetesData = _.sortBy(_.flatten([].concat(_.map(opts.diabetesDataTypes, _.bind(function(type) {
    return this.grouped[type] || [];
  }, this)))), function(d) {
    return d.normalTime;
  });
  endTimer('diabetesData');

  startTimer('deviceEvents');

  this.setDeviceParameters(data);

  endTimer('deviceEvents');

  startTimer('deduplicatePhysicalActivities');

  this.deduplicatePhysicalActivities(data);

  endTimer('deduplicatePhysicalActivities');

  this.zenEvents = this.setEvents(
    data,
    { type: 'deviceEvent', subType: 'zen' },
    ['inputTime']
  );
  this.confidentialEvents = this.setEvents(
    data,
    { type: 'deviceEvent', subType: 'confidential' },
    ['inputTime']
  );

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

  this.latestPumpManufacturer = this.addManufacturer(this.grouped);

  startTimer('setUtilities');
  this.setUtilities();

  if (data.length > 0 && !_.isEmpty(this.diabetesData)) {
    this.data = _.sortBy(data, function(d) { return d.normalTime; });
    this.filterDataArray().generateFillData().adjustFillsForTwoWeekView();
    this.data = _.sortBy(this.data.concat(this.grouped.fill), function(d) { return d.normalTime; });
    this.checkTimezone();
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
        case 'physicalActivity':
        case 'upload':
          return true;
        case 'deviceEvent':
          var includedSubtypes = [
            'reservoirChange',
            'prime',
            'calibration',
            'deviceParameter',
            'zen'
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
      this.basicsData.days = opts.timePrefs.timezoneAware ?
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
