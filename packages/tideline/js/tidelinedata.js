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
/* eslint-disable lodash/prefer-matches */
/**
 * @typedef {'basal'|'bolus'|'cbg'|'smbg'|'deviceEvent'|'wizard'|'upload'|'pumpSettings'|'physicalActivity'|'message'|'fill'} DatumType
 * @typedef {{ type: string, time?: string, normalTime: string, normalEnd?: string, subType?: string, epoch: number, epochEnd?: number, guessedTimezone?: boolean, timezone: string, displayOffset: number }} Datum
 * @typedef {{ [x: string]: Datum[] }} Grouped
 * @typedef {{ payload: { parameters: {name: string}[]} } | Datum} PumpSettings
 * @typedef {{ timezone: string, dateRange: string[], nData: number, days: {date:string,type:string}[], data:{[x:string]: {data: Datum[]}} }} BasicsData
 * @typedef {{ time: number, timezone: string}[]} TimezoneList
 */

import _ from "lodash";
import crossfilter from "crossfilter2";
import moment from "moment-timezone";
import bows from "bows";

import { MS_IN_DAY, MGDL_UNITS, DEFAULT_BG_BOUNDS, BG_CLAMP_THRESHOLD, DEVICE_PARAMS_OFFSET } from "./data/util/constants";
import { validateAll } from "./validation/validate";

import BasalUtil from "./data/basalutil";
import BolusUtil from "./data/bolusutil";
import BGUtil from "./data/bgutil";
import dt from "./data/util/datetime";

const RE_ISO_TIME = /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+|.{0})(?:Z|[+-][01]\d:[0-5]\d)$/;
const INVALID_TIMEZONES = ['UTC', 'GMT', 'Etc/GMT'];
const REQUIRED_TYPES = ["basal", "bolus", "wizard", "cbg", "message", "smbg", "pumpSettings", "physicalActivity", "deviceEvent", "upload"];
const DIABETES_DATA_TYPES = ["basal", "bolus", "cbg", "smbg", "wizard"];
const BASICS_TYPE = ["basal", "bolus", "cbg", "smbg", "deviceEvent", "wizard", "upload"];
const DAILY_TYPES = ["basal", "bolus", "cbg", "message", "smbg", "physicalActivity", "deviceEvent", "wizard"];
const defaults = {
  CBG_PERCENT_FOR_ENOUGH: 0.75,
  CBG_MAX_DAILY: 288,
  SMBG_DAILY_MIN: 4,
  basicsTypes: BASICS_TYPE,
  bgUnits: MGDL_UNITS,
  bgClasses: {
    "very-low": { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryLow },
    low: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetLower },
    target: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetUpper },
    high: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryHigh },
    "very-high": { boundary: BG_CLAMP_THRESHOLD[MGDL_UNITS] },
  },
  fillOpts: {
    classes: {
      0: "darkest",
      3: "dark",
      6: "lighter",
      9: "light",
      12: "lightest",
      15: "lighter",
      18: "dark",
      21: "darker",
    },
    duration: 3,
  },
  diabetesDataTypes: DIABETES_DATA_TYPES,
  timePrefs: {
    timezoneAware: true,
    timezoneName: "UTC",
    timezoneOffset: 0,
  },
  latestPumpManufacturer: "default",
};

/**
 * TidelineData constructor
 * @param {typeof defaults} opts Options
 */
function TidelineData(opts = defaults) {
  _.defaultsDeep(opts, defaults);
  if (opts.bgUnits !== defaults.bgUnits) {
    const { bgUnits } = opts;
    opts.bgClasses = {
      "very-low": { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryLow },
      low: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetLower },
      target: { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetUpper },
      high: { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryHigh },
      "very-high": { boundary: BG_CLAMP_THRESHOLD[bgUnits] },
    };
  }

  /** @type {Console} */
  this.log = bows("TidelineData");
  this.opts = _.cloneDeep(opts);

  /** @type {Datum[]} */
  this.data = [];
  /** @type {Grouped} */
  this.grouped = null;
  /** @type {Datum[]} */
  this.diabetesData = null;
  /** @type {Datum[]} */
  this.deviceParameters = null;
  /** @type {Datum[]} */
  this.physicalActivities = null;
  /** @type {Datum[]} */
  this.zenEvents = null;
  /** @type {Datum[]} */
  this.confidentialEvents = null;
  /** @type {string} */
  this.latestPumpManufacturer = null;
  /** @type {[string, string]} */
  this.endpoints = null;
  /** @type {BasicsData} */
  this.basicsData = null;

  // Crossfilters
  /** @type {crossfilter.Crossfilter<Datum>} */
  this.filterData = null;
  /** @type {crossfilter.Crossfilter<Datum>} */
  this.smbgData = null;
  /** @type {crossfilter.Crossfilter<Datum>} */
  this.cbgData = null;
  /** @type {crossfilter.Dimension<Datum, string>} */
  this.dataByDate = null;
  /** @type {crossfilter.Dimension<Datum, string>} */
  this.smbgByDate = null;
  /** @type {crossfilter.Dimension<Datum, string>} */
  this.smbgByDayOfWeek = null;
  /** @type {crossfilter.Dimension<Datum, string>} */
  this.cbgByDate = null;
  /** @type {crossfilter.Dimension<Datum, string>} */
  this.cbgByDayOfWeek = null;

  // Utils
  /** @type {BasalUtil} */
  this.basalUtil = null;
  /** @type {BolusUtil} */
  this.bolusUtil = null;
  /** @type {BGUtil} */
  this.cbgUtil = null;
  /** @type {BGUtil} */
  this.smbgUtil = null;

  // Other stuffs
  /** @type {"mg/dL" | "mmol/L"} */
  this.bgUnits = this.opts.bgUnits;
  /** @type {typeof opts.bgClasses} */
  this.bgClasses = _.cloneDeep(opts.bgClasses);

  /**
   * Maximum datum duration in milliseconds (normalEnd - normalTime)
   *
   * Used in oneday, to be sure to render long object like confidential mode.
   */
  this.maxDuration = 0;

  /** @type {TimezoneList} */
  this.timezonesList = null;

  // mg/dL values are converted to mmol/L and rounded to 5 decimal places on platform.
  // This can cause some discrepancies when converting back to mg/dL, and throw off the
  // categorization.
  // i.e. A 'target' value 180 gets stored as 9.99135, which gets converted back to 180.0000651465
  // which causes it to be classified as 'high'
  // Thus, we need to allow for our thresholds accordingly.
  if (this.bgUnits === MGDL_UNITS) {
    const roundingAllowance = 0.0001;
    this.bgClasses["very-low"].boundary -= roundingAllowance;
    this.bgClasses.low.boundary -= roundingAllowance;
    this.bgClasses.target.boundary += roundingAllowance;
    this.bgClasses.high.boundary += roundingAllowance;
  }
}


/**
 * @param {Datun} d a datum which we may not want anymore
 */
const isWanted = (d) => {
  if (!_.isObject(d)) {
    return false;
  }
  if (_.isEmpty(d)) {
    d.unwanted = 'empty';
    return false;
  }
  if (!_.isString(d.type)) {
    d.unwanted = 'no type';
    return false;
  }
  if (typeof d.epoch === "number") {
    // Assume our data
    if (d.type === "fill") {
      return false;
    }
    if (d.method === "guessed" && d.subType === "timeChange" && d.type === "deviceEvent") {
      return false;
    }
  } else {
    // Assume new data
    if (d.type === "basal" && d.deliveryType === "temp") {
      d.unwanted = 'temp basal';
      return false; // temp basal
    }
    if (d.type === "message" && !_.isEmpty(d.parentMessage)) {
      return false; // We display only the parent message, we do not care for the others
    }
    if (!_.isString(d.time)) {
      d.unwanted = 'time: not a string';
      return false;
    }
    if (!RE_ISO_TIME.test(d.time)) {
      d.unwanted = 'time: not valid';
      return false;
    }
  }
  return true;
};

function genRandomId() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const hexID = new Array(16);
  for (let i = 0; i < array.length; i++) {
    const b = array[i];
    const hex = (b + 0x100).toString(16).substr(1);
    hexID[i] = hex;
  }
  return hexID.join("");
}

function getTimerFuncs() {
  const startTimer = _.get(window, "config.DEV", false) ? (name) => console.time(name) : _.noop;
  const endTimer = _.get(window, "config.DEV", false) ? (name) => console.timeEnd(name) : _.noop;
  return { startTimer, endTimer };
}

/**
 * Normalize the time: normalTime & normalEnd
 * @param {Datum} d The datum
 */
TidelineData.prototype.normalizeTime = function normalizeTime(d) {
  const mTime = moment.parseZone(d.time);
  d.normalTime = mTime.toISOString();
  d.epoch = mTime.valueOf();

  if (d.type === "basal") {
    const duration = d.duration ?? 0;
    d.normalEnd = moment.utc(mTime).add(duration, "milliseconds").toISOString();
    d.epochEnd = d.epoch + duration;
    this.maxDuration = Math.max(this.maxDuration, duration);
  } else if (d.type === "deviceEvent" && (d.subType === "confidential" || d.subType === "zen")) {
    const mEnd = moment.utc(mTime);
    const duration = _.get(d, "duration.value", 0);
    const units = _.get(d, "duration.units", "hours");
    mEnd.add(duration, units);
    d.normalEnd = mEnd.toISOString();
    d.epochEnd = mEnd.valueOf();
    this.maxDuration = Math.max(this.maxDuration, mEnd.diff(mTime, "milliseconds"));
  }

  // Do we have this data: "suppressed" ?
  if (isWanted(d.suppressed)) {
    this.normalizeTime(d.suppressed);
  } else {
    delete d.suppressed;
  }
};

/**
 * Remove unneeded fields from a datum
 * @param {Datum} d The datum to clean
 */
TidelineData.prototype.cleanDatum = function cleanDatum(d) {
  // Remove unneeded fields:
  if (["upload", "pumpSettings"].includes(d.type)) {
    if (typeof d.source !== "string") {
      d.source = "Diabeloop";
    }
  } else {
    delete d.deviceTime;
    delete d.deviceId;
    delete d.deviceSerialNumber;
    delete d.source;
  }

  delete d.time;
  delete d.timezoneOffset;
  delete d.clockDriftOffset;
  delete d.conversionOffset;
  delete d.createdTime;

  /* eslint-disable no-underscore-dangle */
  delete d._id;
  delete d._userId;
  delete d._schemaVersion;
  delete d._dataState;
  delete d._state;
  delete d._deduplicator;
  delete d.timeProcessing;
  /* eslint-enable no-underscore-dangle */

  // Be sure we have an id
  if (typeof d.id !== "string") {
    d.id = genRandomId();
  }
};

/**
 * Timezone change events (for daily timeline view -> poolMessages)
 * @param {string} prevTimezone The previous timezone name
 * @param {string} newTimezone The new timezone name
 * @param {number} epoch The time of the change
 * @returns {Datum} The datum of the timezone change.
 */
TidelineData.prototype.createTimezoneChange = function createTimezoneChange(prevTimezone, newTimezone, epoch) {
  let epochFrom = epoch;
  let epochTo = epoch;
  if (prevTimezone === newTimezone) {
    // winter/summer time shift: get the date/time of this change
    const zone = moment.tz.zone(prevTimezone);
    if (zone !== null && zone.untils.length > 0) {
      let z = 0;
      while (z < zone.untils.length && epoch >= zone.untils[z]) z++;
      if (z > 0) {
        epochTo = zone.untils[z - 1];
        epochFrom = epochTo - 1;
      }
    }
  }

  const mFrom = moment.utc(epochFrom).tz(prevTimezone);
  const mTo = moment.utc(epochTo).tz(newTimezone);
  const normalTime = mTo.toISOString();
  const displayOffset = -mTo.utcOffset();

  /** @type {Datum} */
  const timezoneChange = {
    id: genRandomId(),
    epoch: epochTo,
    normalTime,
    timezone: newTimezone,
    displayOffset,
    type: "deviceEvent",
    subType: "timeChange",
    source: "Diabeloop",
    from: {
      time: mFrom.toISOString(),
      timeZoneName: prevTimezone,
    },
    to: {
      time: normalTime,
      timeZoneName: newTimezone,
    },
    method: "guessed",
  };

  return timezoneChange;
};

/**
 * Set all related timezone data
 *
 * *this.data* must be sorted by time at this point.
 */
TidelineData.prototype.setTimezones = function setTimezones() {
  const nData = this.data.length;
  if (nData < 1) {
    throw new Error("setTimezones: No data");
  }
  const timezones = moment.tz.names().filter((tz) => !INVALID_TIMEZONES.includes(tz));
  let timezone = null;
  // Find the first valid timezone
  for (let i = 0; i < nData; i++) {
    const d = this.data[i];
    if (d.guessedTimezone !== true && typeof d.timezone === "string" && timezones.includes(d.timezone)) {
      timezone = d.timezone;
      break;
    }
    delete d.timezone;
  }
  // Safeguard
  if (timezone === null) {
    timezone = this.opts.timePrefs.timezoneName;
  }

  const timezoneChanges = [];
  /** @type {TimezoneList} */
  const timezonesList = [{ time: 0, timezone }];
  const startPoint = this.data[0].epoch;
  const lastPoint = _.isNumber(this.data[nData - 1].epochEnd) ? this.data[nData - 1].epochEnd : this.data[nData - 1].epoch;
  let displayOffset = Number.NaN;

  for (let i = 0; i < nData; i++) {
    const d = this.data[i];
    if (typeof d.timezone !== "string" || !timezones.includes(d.timezone)) {
      d.timezone = timezone;
      d.guessedTimezone = true; // Used to know if we have guessed it, see above
    } else if (timezone !== d.timezone && moment.tz.zone(d.timezone).utcOffset(d.epoch) !== moment.tz.zone(timezone).utcOffset(d.epoch)) {
      // Timezone change
      const timezoneChange = this.createTimezoneChange(timezone, d.timezone, d.epoch);
      timezoneChanges.push(timezoneChange);
      timezone = d.timezone;
      // Update our displayOffset to not generate another timeChange datum below
      displayOffset = timezoneChange.displayOffset;
      timezonesList.push({ time: d.epoch, timezone });
    }

    // Display offset (for the daily timeline)
    const mTime = moment.utc(d.epoch).tz(timezone);
    d.displayOffset = -mTime.utcOffset();
    if (Number.isNaN(displayOffset)) {
      displayOffset = d.displayOffset;
    } else if (displayOffset !== d.displayOffset) {
      // Time change from winter time to summer time (or vice-versa)
      // Only created if we can display them in the timeline
      const timeChange = this.createTimezoneChange(timezone, timezone, d.epoch);
      if (startPoint < timeChange.epoch && timeChange.epoch < lastPoint) {
        timezoneChanges.push(timeChange);
      } else {
        this.log.warn('Ignoring timechange', { timeChange, d, startPoint, lastPoint, first: this.data[0], last: this.data[nData - 1] });
      }
      displayOffset = d.displayOffset;
    }

    // Other infos:
    if (d.type === "smbg" || d.type === "cbg") {
      d.localDate = mTime.format("YYYY-MM-DD"); // Has to be translated ?
      d.msPer24 = dt.getMsFromMidnight(mTime);
    }
  }

  if (timezoneChanges.length > 0) {
    this.log.info('Guessed timezone changes', timezoneChanges);
    // Concat the timezone change events:
    Array.prototype.push.apply(this.data, timezoneChanges);
    // And re-sort it...
    this.data.sort((a, b) => a.epoch - b.epoch);
  }

  // Update our timePrefs:
  this.opts.timePrefs.timezoneAware = true;
  // Use the most recent timezone:
  this.opts.timePrefs.timezoneName = timezone;
  this.opts.timePrefs.timezoneOffset = -displayOffset;
  // Set our timezone list for some helper functions
  this.timezonesList = timezonesList;
};

/**
 * Return the closest oldest timezone of this date
 * @param {string | Moment.moment | Date} date The date to test
 */
TidelineData.prototype.getTimezoneAt = function getTimezoneAt(date) {
  if (this.timezonesList === null) {
    return this.opts.timePrefs.timezoneName;
  }

  const time = moment.utc(date).valueOf();
  let c = 0;
  while (c < this.timezonesList.length && time >= this.timezonesList[c].time) c++;
  return this.timezonesList[c - 1].timezone;
};

/**
 * @param {string | null} defaultTimezone
 */
TidelineData.prototype.getFirstTimezone = function getFirstTimezone(defaultTimezone = null) {
  if (Array.isArray(this.timezonesList)) {
    return this.timezonesList[0].timezone;
  } else if (defaultTimezone !== null) {
    return defaultTimezone;
  }
  return this.opts.timePrefs.timezoneName;
};

/**
 * @param {string | null} defaultTimezone
 */
TidelineData.prototype.getLastTimezone = function getLastTimezone(defaultTimezone = null) {
  if (Array.isArray(this.timezonesList)) {
    return this.timezonesList[this.timezonesList.length - 1].timezone;
  } else if (defaultTimezone !== null) {
    return defaultTimezone;
  }
  return this.opts.timePrefs.timezoneName;
};

TidelineData.prototype.setEndPoints = function setEndPoints() {
  const isChartType = (d) => DAILY_TYPES.includes(d.type);
  let chartData = _.filter(this.data, isChartType);
  chartData = _.sortBy(chartData, (d) => (typeof d.epochEnd === "number" ? d.epochEnd : d.epoch));
  const first = _.head(chartData);
  const last = _.last(chartData);

  if (_.isObject(first) && _.isObject(last)) {
    const lastTime = typeof last.epochEnd === "number" ? last.epochEnd : last.epoch;
    const mFirst = moment.utc(first.epoch).tz(first.timezone);
    const mLast = moment.utc(lastTime).tz(last.timezone);
    const start = mFirst.startOf("day").toISOString();
    const end = mLast.endOf("day").toISOString();
    this.endpoints = [start, end];
    return;
  }
  this.log.warn("No char type data found !");
  const now = new Date();
  const yesterfay = new Date(now.valueOf() - MS_IN_DAY);
  this.endpoints = [yesterfay.toISOString(), now.toISOString()];
};

TidelineData.prototype.setDeviceParameters = function setDeviceParameters() {
  this.deviceParameters = [];

  if (!Array.isArray(this.grouped.deviceEvent)) {
    return;
  }

  let parameters = _.filter(this.grouped.deviceEvent, { subType: "deviceParameter" });
  parameters = _.orderBy(parameters, ["normaltime"], ["desc"]);

  if (parameters.length > 0) {
    const first = parameters[0];
    let group = {
      epoch: first.epoch,
      normalTime: first.normalTime,
      id: first.id,
      params: [first],
    };
    if (parameters.length > 1) {
      for (let i = 1; i < parameters.length; ++i) {
        const item = parameters[i];
        if (dt.difference(item.normalTime, group.normalTime) < DEVICE_PARAMS_OFFSET) {
          // add to current group
          group.params.push(item);
        } else {
          this.deviceParameters.push(group);
          group = {
            epoch: item.epoch,
            normalTime: item.normalTime,
            id: item.id,
            params: [item],
          };
        }
      }
    }
    this.deviceParameters.push(group);
  }
};

/**
 * Sort the parameters of the pump settings
 * @param {PumpSettings[]} pumpSettings
 */
TidelineData.prototype.sortPumpSettingsParameters = function sortPumpSettingsParameters() {
  const settingsOrder = [
    "MEDIUM_MEAL_BREAKFAST",
    "MEDIUM_MEAL_LUNCH",
    "MEDIUM_MEAL_DINNER",
    "TOTAL_INSULIN_FOR_24H",
    "WEIGHT",
    "PATIENT_GLY_HYPER_LIMIT",
    "PATIENT_GLY_HYPO_LIMIT",
    "PATIENT_GLYCEMIA_TARGET",
    "PATIENT_BASAL_AGGRESSIVENESS_FACTOR_LEVEL_IN_EUGLYCAEMIA",
    "BOLUS_AGGRESSIVENESS_FACTOR",
    "MEAL_RATIO_BREAKFAST_FACTOR",
    "MEAL_RATIO_LUNCH_FACTOR",
    "MEAL_RATIO_DINNER_FACTOR",
    "SMALL_MEAL_BREAKFAST",
    "LARGE_MEAL_BREAKFAST",
    "SMALL_MEAL_LUNCH",
    "LARGE_MEAL_LUNCH",
    "SMALL_MEAL_DINNER",
    "LARGE_MEAL_DINNER",
  ];
  if (!Array.isArray(this.grouped.pumpSettings)) {
    return;
  }
  this.grouped.pumpSettings.forEach((ps) => {
    /** @type {{name: string, value: string, level: number|string, unit: string}[]} */
    const p = _.get(ps, "payload.parameters", []);
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
};

TidelineData.prototype.deduplicatePhysicalActivities = function deduplicatePhysicalActivities() {
  const physicalActivity = this.grouped.physicalActivity;
  if (!Array.isArray(physicalActivity)) {
    return;
  }

  // normalize eventId and inputTime
  physicalActivity.forEach((pa) => {
    if (!_.isString(pa.eventId) || _.isEmpty(pa.eventId)) {
      pa.eventId = pa.id;
    }
    if (!_.isString(pa.inputTime) || _.isEmpty(pa.inputTime)) {
      pa.inputTime = pa.normalTime;
    }
  });

  // get all PAs grouped by eventID
  const physicalActivities = _.groupBy(physicalActivity, "eventId");
  // For each eventID sort by inputTime
  _.forEach(physicalActivities, (value, key) => {
    physicalActivities[key] = _.orderBy(value, ["inputTime"], ["desc"]);
  });
  // For each eventID take the most recent item
  this.physicalActivities = _.map(physicalActivities, _.head);
};

TidelineData.prototype.setDiabetesData = function setDiabetesData() {
  const diabetesDataTypes = this.opts.diabetesDataTypes ?? DIABETES_DATA_TYPES;
  this.diabetesData = this.data.filter((d) => diabetesDataTypes.indexOf(d.type) > -1);
  this.diabetesData = _.sortBy(this.diabetesData, "normalTime");
};

/**
 *
 * @param {Datum[]} data The data
 * @param {object} filter The filter
 * @param {string[]} order field to order the result
 */
TidelineData.prototype.setEvents = function setEvents(filter = {}, order = ["inputTime"]) {
  const sourceEvents = _.groupBy(_.filter(this.data, filter), "eventId");
  const events = {};
  _.forEach(sourceEvents, function (value, key) {
    events[key] = _.orderBy(value, order, ["desc"]);
  });
  // eslint-disable-next-line lodash/prop-shorthand
  return _.map(events, (v) => v[0]);
};

TidelineData.prototype.getLastestManufacturer = function getLastestManufacturer() {
  const defaultPumpManufacturer = {
    payload: { pump: { manufacturer: "default" } },
  };

  if (!Array.isArray(this.grouped.pumpSettings)) {
    return defaultPumpManufacturer;
  }
  // get latest pump manufacturer
  const lastPump = _.maxBy(this.grouped.pumpSettings, "epoch");
  const pump = _.get(_.merge({}, defaultPumpManufacturer, lastPump), "payload.pump");
  // make sure to use the correct format
  _.update(pump, "manufacturer", (o) => _.capitalize(o));

  if (Array.isArray(this.grouped.deviceEvent)) {
    // inject the manufacturer in the deviceEvents
    _.forEach(this.grouped.deviceEvent, (val, key) => {
      _.assign(this.grouped.deviceEvent[key], { pump });
    });
  }
  return pump.manufacturer;
};

TidelineData.prototype.updateCrossFilters = function updateCrossFilters() {
  const createCrossFilter = (dim) => {
    let newDim = null;
    switch (dim) {
      case "datetime":
        newDim = this.filterData.dimension((d) => d.normalTime);
        break;
      case "smbgByDatetime":
        newDim = this.smbgData.dimension((d) => d.normalTime);
        break;
      case "smbgByDayOfWeek":
        newDim = this.smbgData.dimension((d) => dt.weekdayLookup(moment.utc(d.epoch).tz(d.timezone).day()));
        break;
      case "cbgByDatetime":
        newDim = this.cbgData.dimension((d) => d.normalTime);
        break;
      case "cbgByDayOfWeek":
        newDim = this.cbgData.dimension((d) => dt.weekdayLookup(moment.utc(d.epoch).tz(d.timezone).day()));
        break;
    }
    return newDim;
  };

  this.filterData = crossfilter(this.data);
  this.smbgData = crossfilter(this.grouped.smbg ?? []);
  this.cbgData = crossfilter(this.grouped.cbg ?? []);
  this.dataByDate = createCrossFilter("datetime");
  this.smbgByDate = createCrossFilter("smbgByDatetime");
  this.smbgByDayOfWeek = createCrossFilter("smbgByDayOfWeek");
  this.cbgByDate = createCrossFilter("cbgByDatetime");
  this.cbgByDayOfWeek = createCrossFilter("cbgByDayOfWeek");

  return this;
};

TidelineData.prototype.setUtilities = function setUtilities() {
  this.basalUtil = new BasalUtil(this.grouped.basal);
  this.bolusUtil = new BolusUtil(this.grouped.bolus);
  this.cbgUtil = new BGUtil(this.grouped.cbg, {
    bgUnits: this.bgUnits,
    bgClasses: this.bgClasses,
    DAILY_MIN: this.opts.CBG_PERCENT_FOR_ENOUGH * this.opts.CBG_MAX_DAILY,
  });
  this.smbgUtil = new BGUtil(this.grouped.smbg, {
    bgUnits: this.bgUnits,
    bgClasses: this.bgClasses,
    DAILY_MIN: this.opts.SMBG_DAILY_MIN,
  });
};

/**
 * Check this.grouped required type, if missing, create an empty array.
 */
TidelineData.prototype.checkRequired = function checkRequired(types = REQUIRED_TYPES) {
  _.forEach(types, (type) => {
    if (!this.grouped[type]) {
      this.log.warn("No", type, "data! Replaced with empty array.");
      this.grouped[type] = [];
    }
  });
};

TidelineData.prototype.generateFillData = function generateFillData() {
  if (this.endpoints === null) {
    this.setEndPoints();
  }

  const { classes } = this.opts.fillOpts;
  const { timezoneName: timezone } = this.opts.timePrefs;
  const fillDateTime = moment.utc(this.endpoints[0]).tz(timezone).subtract(3, "hour");
  const lastDateTime = moment.utc(this.endpoints[1]).tz(timezone);

  const fillData = [];

  let prevFill = null;
  while (fillDateTime.isBefore(lastDateTime)) {
    const hour = fillDateTime.hours();
    if (_.has(classes, hour)) {
      const isoStr = fillDateTime.toISOString();
      // Update the previous entry normalEnd value
      if (prevFill !== null) {
        prevFill.normalEnd = isoStr;
        prevFill.epochEnd = fillDateTime.valueOf();
      }
      const currentFill = {
        type: "fill",
        fillColor: classes[hour],
        fillDate: isoStr.slice(0, 10),
        id: `fill_${isoStr.replace(/[^\w\s]|_/g, "")}`,
        epoch: fillDateTime.valueOf(),
        epochEnd: fillDateTime.valueOf(),
        normalEnd: isoStr,
        startsAtMidnight: hour === 0,
        normalTime: isoStr,
        timezone,
        displayOffset: fillDateTime.utcOffset(),
        twoWeekX: (hour * MS_IN_DAY) / 24,
      };
      fillData.push(currentFill);
      prevFill = currentFill;
    }
    fillDateTime.add(1, "hour");
  }

  // Last data
  if (prevFill !== null) {
    prevFill.normalEnd = lastDateTime.toISOString();
    prevFill.epochEnd = lastDateTime.valueOf();
  }

  const haveFillData = Array.isArray(this.grouped.fill);
  this.grouped.fill = fillData;
  if (haveFillData) {
    this.data = this.data.filter((d) => d.type !== "fill").concat(fillData);
  } else {
    this.data = this.data.concat(fillData);
  }
  this.data.sort((a, b) => a.epoch - b.epoch);
};

TidelineData.prototype.setBasicsData = function setBasicsData() {
  const last = _.findLast(this.data, (d) => {
    switch (d.type) {
      case "basal":
      case "wizard":
      case "bolus":
      case "cbg":
      case "smbg":
      case "physicalActivity":
        return true;
      case "deviceEvent":
        var includedSubtypes = ["reservoirChange", "prime", "calibration", "deviceParameter", "zen"];
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
  const skimOffBottom = (groupData, start) => {
    return _.takeRightWhile(groupData, (d) => {
      if (d.type === "basal") {
        return d.normalEnd >= start;
      }
      return d.normalTime >= start;
    });
  };

  // filters out any data that *follows* basics date range
  // which is determined from available pump data types
  // (data that follows basics date range is possible when a CGM
  // is uploaded more recently (by a couple days, say) than a pump)
  const skimOffTop = (groupData, end) => _.takeWhile(groupData, (d) => d.normalTime <= end);

  const skimOfTopBottom = (groupData, start, end) => {
    const bottom = skimOffBottom(groupData, start);
    return skimOffTop(bottom, end);
  };

  // wrapping in an if-clause here because of the no-data
  // or CGM-only data cases
  if (!_.isEmpty(last)) {
    const dateRange = [dt.findBasicsStart(last.normalTime, this.opts.timePrefs.timezoneName), last.normalTime];
    const basicsData = {
      timezone: this.opts.timePrefs.timezoneName ?? "UTC",
      dateRange,
      days: dt.findBasicsDays(dateRange, this.opts.timePrefs.timezoneName),
      nData: 0,
      data: {
        reservoirChange: null,
        cannulaPrime: null,
        tubingPrime: null,
        calibration: null,
        upload: null,
        basal: null,
        bolus: null,
        cbg: null,
        smbg: null,
        wizard: null,
      },
    };

    const { basicsTypes } = this.opts;
    this.checkRequired(basicsTypes);
    for (let i = 0; i < basicsTypes.length; ++i) {
      const aType = basicsTypes[i];

      if (aType === "deviceEvent") {
        basicsData.data.reservoirChange = {
          data: _.filter(this.grouped.deviceEvent, { subType: "reservoirChange" }),
        };
        basicsData.data.cannulaPrime = {
          data: _.filter(this.grouped.deviceEvent, { subType: "prime", primeTarget: "cannula" }),
        };
        basicsData.data.tubingPrime = {
          data: _.filter(this.grouped.deviceEvent, { subType: "prime", primeTarget: "tubing" }),
        };
        const calibrations = skimOfTopBottom(this.grouped.deviceEvent, dateRange[0], dateRange[1]);
        basicsData.data.calibration = {
          data: _.filter(calibrations, { subType: "calibration" }),
        };
        basicsData.nData +=
          basicsData.data.reservoirChange.data.length +
          basicsData.data.cannulaPrime.data.length +
          basicsData.data.tubingPrime.data.length +
          basicsData.data.calibration.data.length;
      } else if (aType === "upload") {
        basicsData.data.upload = {
          data: this.grouped.upload,
        };
        basicsData.nData += this.grouped.upload.length;
      } else if (Array.isArray(this.grouped[aType])) {
        const typeObj = { data: [] };
        typeObj.data = skimOfTopBottom(this.grouped[aType], dateRange[0], dateRange[1]);
        basicsData.data[aType] = typeObj;
        basicsData.nData += typeObj.data.length;
      } else {
        this.log.warn("Missing basics type", aType);
        basicsData.data[aType] = { data: [] };
        basicsData.nData += basicsData.data[aType].data.length;
      }
    }
    this.basicsData = basicsData;
  }
};

/**
 * Add data to tideline
 * @param {Datum[]} newData
 * @returns The number of added data
 */
TidelineData.prototype.addData = async function addData(newData) {
  this.log.debug("Init", this);
  if (!Array.isArray(newData)) {
    this.log.error("Invalid parameter", { newData });
    throw new Error("Invalid parameter: newData");
  }

  const nDataBefore = this.data.length;
  const { startTimer, endTimer } = getTimerFuncs();

  startTimer("addData");
  this.grouped = null;
  this.diabetesData = null;
  this.deviceParameters = null;
  this.physicalActivities = null;
  this.zenEvents = null;
  this.confidentialEvents = null;
  this.latestPumpManufacturer = null;
  this.endpoints = null;
  this.basicsData = null;

  this.filterData = null;
  this.smbgData = null;
  this.cbgData = null;
  this.dataByDate = null;
  this.smbgByDate = null;
  this.smbgByDayOfWeek = null;
  this.cbgByDate = null;
  this.cbgByDayOfWeek = null;

  this.basalUtil = null;
  this.bolusUtil = null;
  this.cbgUtil = null;
  this.smbgUtil = null;

  this.maxDuration = 0;
  this.timezonesList = null;

  startTimer("filterUnwanted");
  // Remove all unwanted data
  // From our new data
  if (_.get(window, "config.DEV", false)) {
    // Dev only: display unwanted data received to the console
    const unwantedData = newData.filter(d => !isWanted(d));
    if (unwantedData.length > 0) {
      this.log.warn('Unwanted data:', unwantedData);
    }
  }
  newData = newData.filter(isWanted);
  if (newData.length < 1) {
    this.log.info('Nothing interested in theses new data');
    endTimer("filterUnwanted");
    return 0;
  }
  // And our current ones too
  this.data = this.data.filter(isWanted);
  endTimer("filterUnwanted");

  await dt.waitTimeout(1); // Allow JS main loop to recover

  startTimer("normalizeTime");
  newData.forEach(this.normalizeTime.bind(this));
  endTimer("normalizeTime");

  startTimer("cleanData");
  newData.forEach(this.cleanDatum.bind(this));
  endTimer("cleanData");

  await dt.waitTimeout(1); // Allow JS main loop to recover

  startTimer("Concatenate & uniq & sort");
  // Concat our data and the new ones
  this.data = newData.concat(this.data);
  const nDateBeforeRemoveDuplicates = this.data.length;
  // Remove duplicates if any
  this.data = _.uniqBy(this.data, "id");
  if (this.data.length < nDateBeforeRemoveDuplicates) {
    this.log.info(`${nDateBeforeRemoveDuplicates - this.data.length} duplicates data removed`);
  }
  // Initial sort
  this.data.sort((a, b) => a.epoch - b.epoch);
  endTimer("Concatenate & uniq & sort");

  startTimer("setTimezones");
  this.setTimezones(this.data);
  endTimer("setTimezones");

  startTimer("validatedData");
  const validatedData = validateAll(this.data);
  this.log.info(`${validatedData.valid.length} valid items`);
  if (validatedData.invalid.length > 0) {
    this.log.warn("Invalid items:", validatedData.invalid.length, validatedData.invalid);
  }
  endTimer("validatedData");

  await dt.waitTimeout(1); // Allow JS main loop to recover

  startTimer("setDiabetesData");
  this.setDiabetesData();
  endTimer("setDiabetesData");

  startTimer("setEndPoints");
  this.setEndPoints();
  endTimer("setEndPoints");

  // ** Grouped utilities **
  startTimer("group");
  this.grouped = _.groupBy(this.data, "type");
  _.forEach(this.grouped, (group, key) => {
    this.grouped[key] = _.sortBy(group, "normalTime");
  });
  endTimer("group");

  // generate the fill data for chart BGs
  startTimer("generateFillData");
  this.generateFillData();
  endTimer("generateFillData");

  startTimer("setDeviceParameters");
  this.setDeviceParameters();
  endTimer("setDeviceParameters");

  startTimer("sortPumpSettingsParameters");
  this.sortPumpSettingsParameters();
  endTimer("sortPumpSettingsParameters");

  startTimer("latestPumpManufacturer");
  this.latestPumpManufacturer = this.getLastestManufacturer();
  endTimer("latestPumpManufacturer");

  startTimer("setEvents");
  this.zenEvents = this.setEvents({ type: "deviceEvent", subType: "zen" }, ["inputTime"]);
  this.confidentialEvents = this.setEvents({ type: "deviceEvent", subType: "confidential" }, ["inputTime"]);
  endTimer("setEvents");

  startTimer("deduplicatePhysicalActivities");
  this.deduplicatePhysicalActivities();
  endTimer("deduplicatePhysicalActivities");

  // Filter unwanted types from the data array
  // this.filterDataArray();

  startTimer("updateCrossFilters");
  this.updateCrossFilters();
  endTimer("updateCrossFilters");

  startTimer("setUtilities");
  this.setUtilities();
  endTimer("setUtilities");

  startTimer("checkRequired");
  this.checkRequired();
  endTimer("checkRequired");

  startTimer("setBasicsData");
  this.setBasicsData();
  endTimer("setBasicsData");

  endTimer("addData");

  this.log.info(`${this.data.length - nDataBefore} data added`);
  return this.data.length - nDataBefore;
};

/**
 * Update a message
 * @param {Datum} editedMessage The edited datum (a message)
 * @return {Datum | null} Null if an error occurred
 */
TidelineData.prototype.editMessage = function editMessage(editedMessage) {
  const { startTimer, endTimer } = getTimerFuncs();
  startTimer("editMessage");

  /** @type {Datum} */
  let message = null;
  if (isWanted(editedMessage)) {
    message = this.grouped.message.find((d) => d.id === editedMessage.id);
    if (typeof message === "object") {
      this.normalizeTime(editedMessage);
      message.messageText = editedMessage.messageText;
      message.normalTime = editedMessage.normalTime;
      message.epoch = editedMessage.epoch;
      message.timezone = this.getTimezoneAt(message.epoch);
      message.displayOffset = -moment.utc(message.epoch).tz(message.timezone).utcOffset();

      this.data.sort((a, b) => a.epoch - b.epoch);
      this.grouped.message.sort((a, b) => a.epoch - b.epoch);

      this.updateCrossFilters();
    } else {
      this.log.warn('editMessage: Message not found', editedMessage);
    }

  } else {
    this.log.warn('editMessage: Unwanted message:', editedMessage);
  }

  endTimer("editMessage");
  return message;
};

export default TidelineData;
