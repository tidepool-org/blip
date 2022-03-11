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
 * @typedef {{ type: string, id: string; time?: string, normalTime: string, normalEnd?: string, subType?: string, epoch: number, epochEnd?: number, guessedTimezone?: boolean, timezone: string, displayOffset: number;localDate?:string;isoWeekday?:string;}} Datum
 * @typedef {{ cbg:Datum[]; basal:Datum[]; bolus:Datum[]; deviceEvent: Datum[] }} Grouped
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
const INVALID_TIMEZONES = ["UTC", "GMT", "Etc/GMT"];
const REQUIRED_TYPES = ["basal", "bolus", "wizard", "cbg", "message", "smbg", "pumpSettings", "physicalActivity", "deviceEvent", "upload", "food", "physicalActivity"];
const DIABETES_DATA_TYPES = ["basal", "bolus", "cbg", "smbg", "wizard"];
const BASICS_TYPE = ["deviceEvent"];
const DAILY_TYPES = ["basal", "bolus", "cbg", "food", "message", "smbg", "physicalActivity", "deviceEvent", "wizard"];

const defaults = {
  YLP820_BASAL_TIME: 5000,
  CBG_PERCENT_FOR_ENOUGH: 0.75,
  CBG_MAX_DAILY: 288,
  SMBG_DAILY_MIN: 4,
  basicsTypes: BASICS_TYPE,
  bgUnits: MGDL_UNITS,
  bgClasses: {
    "very-low": { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryLow },
    "low": { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetLower },
    "target": { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetUpper },
    "high": { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryHigh },
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
  },
  defaultSource: "Diabeloop",
  defaultPumpManufacturer: "default",
  /** @type {{start: moment.Moment, end: moment.Moment}} */
  dateRange: null,
};

/**
 * TidelineData constructor
 * @param {typeof defaults} opts Options
 */
function TidelineData(opts = defaults) {
  _.defaultsDeep(opts, defaults);

  /** @type {Console} */
  this.log = bows("TidelineData");
  this.opts = _.cloneDeep(opts);

  if (opts.bgUnits !== defaults.bgUnits) {
    const { bgUnits } = opts;
    this.opts.bgClasses = {
      "very-low": { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryLow },
      "low": { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetLower },
      "target": { boundary: DEFAULT_BG_BOUNDS[bgUnits].targetUpper },
      "high": { boundary: DEFAULT_BG_BOUNDS[bgUnits].veryHigh },
      "very-high": { boundary: BG_CLAMP_THRESHOLD[bgUnits] },
    };
    this.log.info(`Using units ${bgUnits}: Updating bgClasses`, { bgClasses: this.opts.bgClasses });
  }

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
  /** @type {Datum[]} */
  this.warmUpEvents = null;
  /** @type {string} */
  this.latestPumpManufacturer = null;
  /** @type {[string, string]} */
  this.endpoints = null;
  /** @type {BasicsData} */
  this.basicsData = null;

  // Crossfilters
  /** @type {crossfilter.Crossfilter<Datum>} */
  this.filterData = null;
  /** @type {crossfilter.Dimension<Datum, string>} */
  this.dataByDate = null;

  // Utils
  /** @type {BasalUtil} */
  this.basalUtil = null;
  /** @type {BolusUtil} */
  this.bolusUtil = null;
  /** @type {BGUtil} */
  this.cbgUtil = null;
  /** @type {BGUtil} */
  this.smbgUtil = null;

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
  if (this.opts.bgUnits === MGDL_UNITS) {
    const roundingAllowance = 0.0001;
    this.opts.bgClasses["very-low"].boundary -= roundingAllowance;
    this.opts.bgClasses.low.boundary -= roundingAllowance;
    this.opts.bgClasses.target.boundary += roundingAllowance;
    this.opts.bgClasses.high.boundary += roundingAllowance;
  }

  this.log.info("Initialized", this);
}

/**
 * @param {Datun} d a datum which we may not want anymore
 */
const isWanted = (d) => {
  if (!_.isObject(d)) {
    return false;
  }
  if (_.isEmpty(d)) {
    d.unwanted = "empty";
    return false;
  }
  if (!_.isString(d.type)) {
    d.unwanted = "no type";
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
    if (d.type === "message" && !_.isEmpty(d.parentMessage)) {
      return false; // We display only the parent message, we do not care for the others
    }
    if (!_.isString(d.time)) {
      d.unwanted = "time: not a string";
      return false;
    }
    if (!RE_ISO_TIME.test(d.time)) {
      d.unwanted = "time: not valid";
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
  // To be able to enable it when needed:
  if (false) { // eslint-disable-line no-constant-condition
    const startTimer = _.get(window, "config.DEV", false) ? (name) => console.time(name) : _.noop;
    const endTimer = _.get(window, "config.DEV", false) ? (name) => console.timeEnd(name) : _.noop;
    return { startTimer, endTimer };
  }
  return { startTimer: _.noop, endTimer: _.noop };
}

function isObjectWithStandardDuration(d) {
  switch (d.type) {
  case "physicalActivity":
    return true;
  case "deviceEvent":
    switch (d.subType) {
    case "confidential":
    case "zen":
    case "warmup":
      return true;
    }
  }
  return false;
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
  } else if (isObjectWithStandardDuration(d)) {
    const mEnd = moment.utc(mTime);
    const duration = _.get(d, "duration.value", 0);
    const units = _.get(d, "duration.units", "hours");
    mEnd.add(duration, units);
    d.normalEnd = mEnd.toISOString();
    d.epochEnd = mEnd.valueOf();
    this.maxDuration = Math.max(this.maxDuration, d.epochEnd - d.epoch);
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
  if (!["upload", "pumpSettings"].includes(d.type)) {
    delete d.deviceTime;
    delete d.deviceId;
    delete d.deviceSerialNumber;
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
  // Be sure to have a source (use in lots of places)
  if (typeof d.source !== "string") {
    d.source = this.opts.defaultSource;
  }

  if (d.type === "basal" && d.subType !== d.deliveryType) {
    // For some reason the transition to subType was partially done
    d.subType = d.deliveryType;
  }
};

TidelineData.prototype.joinWizardsAndBoluses = function joinWizardsAndBoluses() {
  const wizards = this.data.filter((v) => v.type === "wizard" && typeof v.bolus === "string");
  const boluses = this.data.filter((v) => v.type === "bolus");
  const nWizards = wizards.length;
  for (let i = 0; i < nWizards; i++) {
    const wizard = wizards[i];
    delete wizard.errorMessage;
    const bolus = boluses.find((v) => v.id === wizard.bolus);
    if (bolus) {
      wizard.bolus = bolus;
      bolus.wizard = wizard;
    }
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
    source: this.opts.defaultSource,
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
    const mTime = moment.tz(d.epoch, timezone);
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
        this.log.warn("Ignoring timechange", { timeChange, d, startPoint, lastPoint, first: this.data[0], last: this.data[nData - 1] });
      }
      displayOffset = d.displayOffset;
    }

    // Other infos:
    if (d.type === "cbg") {
      // Used for trends view
      d.localDate = mTime.format("YYYY-MM-DD");
      d.isoWeekday = dt.isoWeekdayToString(mTime.isoWeekday());
      d.msPer24 = dt.getMsFromMidnight(mTime);
    }
  }

  if (timezoneChanges.length > 0) {
    this.log.info("Guessed timezone changes (some may be stripped away)", timezoneChanges);
    // Concat the timezone change events:
    const isChartType = (d) => DAILY_TYPES.includes(d.type);
    const startDatum = _.find(this.data, isChartType) ?? false;
    const lastDatum = _.findLast(this.data, isChartType) ?? false;
    if (startDatum && lastDatum && startDatum.id !== lastDatum.id) {
      for (const timezoneChange of timezoneChanges) {
        if (timezoneChange.epoch >= startDatum.epoch && timezoneChange.epoch < lastDatum.epoch) {
          this.data.push(timezoneChange);
        }
      }
    } else {
      Array.prototype.push.apply(this.data, timezoneChanges);
    }

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
 * @param {string | number | moment.Moment | Date} date The date to test
 */
TidelineData.prototype.getTimezoneAt = function getTimezoneAt(date) {
  if (this.timezonesList === null) {
    return this.opts.timePrefs.timezoneName;
  }

  const time = typeof date === "number" ? date : moment.utc(date).valueOf();
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

/**
 * Set the endpoints, using only data we can see in the daily view
 *
 * *TODO: Use numbers (ms since epoch) instead of strings*
 */
TidelineData.prototype.setEndPoints = function setEndPoints() {
  const isChartType = (d) => DAILY_TYPES.includes(d.type);
  let chartData = _.filter(this.data, isChartType);
  chartData = _.sortBy(chartData, (d) => (typeof d.epochEnd === "number" ? d.epochEnd : d.epoch));
  const first = _.head(chartData);
  const last = _.last(chartData);

  /** @type {moment.Moment} */
  let start = null;
  /** @type {moment.Moment} */
  let end = null;
  if (_.isObject(first) && _.isObject(last)) {
    const lastTime = typeof last.epochEnd === "number" ? last.epochEnd : last.epoch;
    // FIXME moment startOf/endOf works only with current browser timezone -> it use the Date() object
    start = moment.tz(first.epoch, first.timezone).startOf("day");
    end = moment.tz(lastTime, last.timezone).endOf("day").add(1, "millisecond");
  } else {
    // Be sure to have something, we do not want to crash
    // in some other code, and do not want to check this
    // every times too.
    this.log.warn("No char type data found !");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start = moment.tz(today.valueOf() - MS_IN_DAY, this.opts.timePrefs.timezoneName);
    end = moment.tz(today.valueOf() + MS_IN_DAY, this.opts.timePrefs.timezoneName);
  }

  if (this.opts.dateRange) {
    // Take the longest range if possible
    if (this.opts.dateRange.start.isBefore(start)) {
      const ms = this.opts.dateRange.start.valueOf();
      start = moment.tz(ms, this.getTimezoneAt(ms)).startOf("day");
    }
  }

  this.endpoints = [start.toISOString(), end.toISOString()];
};

/**
 *
 * @returns Start / End date for the calendar
 */
TidelineData.prototype.getLocaleTimeEndpoints = function getLocaleTimeEndpoints(endInclusive = true) {
  let timezone = this.getTimezoneAt(this.endpoints[0]);
  const startDate = moment.tz(this.endpoints[0], timezone);

  timezone = this.getTimezoneAt(this.endpoints[1]);
  let endDate = moment.tz(this.endpoints[1], timezone);
  if (endInclusive) {
    // endpoints end date is exclusive, but the DatePicker is inclusive
    // remove 1ms to the endDate
    endDate.subtract(1, "millisecond");
  }

  return { startDate, endDate };
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
      timezone: this.getTimezoneAt(first.epoch),
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
            timezone: this.getTimezoneAt(item.epoch),
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

TidelineData.prototype.deduplicateBoluses = function deduplicateBoluses() {
  if (!Array.isArray(this.data)) {
    return;
  }

  // group by time
  const grpByTime = _.groupBy(
    _.filter(this.data, { type: "bolus" }),
    "normalTime"
  );
  const toBeRemoved = [];
  _.forEach(grpByTime, (value) => {
    if (value.length > 1) {
      let goodBolus = null;
      // Search the bolus we want to keep
      for (const bolus of value) {
        if (goodBolus === null) goodBolus = bolus;
        else if (goodBolus.normal < bolus.normal) goodBolus = bolus;
      }
      // Add the ids we no longer want
      for (const bolus of value) {
        if (bolus.id !== goodBolus.id) {
          toBeRemoved.push(bolus.id);
        }
      }
    }
  });
  this.data = this.data.filter((d) => !toBeRemoved.includes(d.id));
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
  this.physicalActivities = _.filter(this.physicalActivities, (pa) => pa.duration.value > 0);
};

/**
 * YLP-820 Adjust the display of temporary basal to workaround handset issue #220
 *
 * - A temp basal and an automated basal occurs at the same time (+ or - 2/3 seconds),
 *   the 2/3 seconds offset has to be adjusted according to existing database data, or maybe set as a variable
 * - The duration of the automated basal is exactly 1 minute
 * - The temp basal and automated basal have the same rate value
 * - The temp basal and automated basal may not have the same created date (to be confirmed)
 */
TidelineData.prototype.deduplicateTempBasal = function deduplicateTempBasal() {
  const tempBasalMaxOffset = this.opts.YLP820_BASAL_TIME ?? 5000;
  const basals = _.get(this.grouped, "basal", []);
  const automatedBasal = _.filter(basals, { subType: "automated", duration: 60000 });
  const nAutomatedBasal = automatedBasal.length;
  const tempBasals = _.filter(basals, { subType: "temp" });
  let nTempBasalReplaced = 0;

  for (let i=0; i<nAutomatedBasal; i++) {
    const basal = automatedBasal[i];
    if (typeof basal.replace === "string" || typeof basal.replacedBy === "string") {
      continue;
    }
    // Search for it's corresponding temp basal
    const tempBasalFound = _.find(tempBasals, (tempBasal) =>
      Math.abs(tempBasal.epoch - basal.epoch) < tempBasalMaxOffset
      && tempBasal.rate === basal.rate
    );
    if (tempBasalFound) {
      tempBasalFound.subType = "automated";
      tempBasalFound.deliveryType = "automated";
      tempBasalFound.replace = basal.id;
      basal.duration = 0;
      basal.replacedBy = tempBasalFound.id;
      nTempBasalReplaced++;
    }
  }
  this.log.info(`${nTempBasalReplaced} temp basal replaced by automated`);
};

TidelineData.prototype.setDiabetesData = function setDiabetesData() {
  const diabetesDataTypes = this.opts.diabetesDataTypes ?? DIABETES_DATA_TYPES;
  this.diabetesData = this.data.filter((d) => diabetesDataTypes.indexOf(d.type) > -1);
  this.diabetesData = _.sortBy(this.diabetesData, "epoch");
};

/**
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

TidelineData.prototype.getLatestManufacturer = function getLatestManufacturer() {
  const defaultPumpManufacturer = {
    payload: { pump: { manufacturer: this.opts.defaultPumpManufacturer } },
  };

  this.checkRequired(["pumpSettings"]);

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
  this.filterData = crossfilter(this.data);
  this.dataByDate = this.filterData.dimension((d) => d.normalTime);
  return this;
};
TidelineData.prototype.setUtilities = function setUtilities() {
  this.basalUtil = new BasalUtil(this.grouped.basal);
  this.bolusUtil = new BolusUtil(this.grouped.bolus);
  this.cbgUtil = new BGUtil(this.grouped.cbg, {
    bgUnits: this.opts.bgUnits,
    bgClasses: this.opts.bgClasses,
    DAILY_MIN: this.opts.CBG_PERCENT_FOR_ENOUGH * this.opts.CBG_MAX_DAILY,
  });
  this.smbgUtil = new BGUtil(this.grouped.smbg, {
    bgUnits: this.opts.bgUnits,
    bgClasses: this.opts.bgClasses,
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
  const firstTimezone = this.getTimezoneAt(this.endpoints[0]);
  const lastTimezone = this.getTimezoneAt(this.endpoints[1]);
  const fillDateTime = moment.utc(this.endpoints[0]).tz(firstTimezone).subtract(3, "hour");
  const lastDateTime = moment.utc(this.endpoints[1]).tz(lastTimezone);

  const fillData = [];
  let timezone = firstTimezone;
  let prevFill = null;
  while (fillDateTime.isBefore(lastDateTime)) {
    const epoch = fillDateTime.valueOf();
    const timezoneAt = this.getTimezoneAt(epoch);
    if (timezone !== timezoneAt) {
      timezone = timezoneAt;
      fillDateTime.tz(timezone);
    }

    const hour = fillDateTime.hours();
    if (_.has(classes, hour)) {
      const isoStr = fillDateTime.toISOString();
      // Update the previous entry normalEnd value
      if (prevFill !== null) {
        prevFill.normalEnd = isoStr;
        prevFill.epochEnd = epoch;
        this.maxDuration = Math.max(this.maxDuration, epoch - prevFill.epoch);
      }
      const currentFill = {
        type: "fill",
        fillColor: classes[hour],
        id: `fill-${isoStr.replace(/[^\w\s]|_/g, "")}`,
        epoch,
        epochEnd: epoch, // Updated in the next loop run
        normalEnd: isoStr,
        startsAtMidnight: hour === 0,
        normalTime: isoStr,
        timezone,
        displayOffset: fillDateTime.utcOffset(),
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
    this.maxDuration = Math.max(this.maxDuration, prevFill.epochEnd - prevFill.epoch);
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

/**
 * Generate basics data
 * @param {string | null | undefined} startDate
 * @param {string | null | undefined} endDate
 * @returns {null|object}
 */
TidelineData.prototype.generateBasicsData = function generateBasicsData(startDate = null, endDate = null) {
  const start = startDate ?? this.endpoints[0];
  const end = endDate ?? this.endpoints[1];
  let startEpoch = new Date(start).valueOf();
  let endEpoch = new Date(end).valueOf();
  if (!endDate) {
    endEpoch = endEpoch - 1;
  }

  const { basicsTypes } = this.opts;
  this.checkRequired(basicsTypes);

  const endTimezone = this.getTimezoneAt(endEpoch);
  const mEnd = moment.tz(endEpoch, endTimezone);
  let mStart;
  let startTimezone;
  if (startDate) {
    startTimezone = this.getTimezoneAt(startDate);
    mStart = moment.tz(startDate, startTimezone);
  } else {
    const twoWeeksAgo = mEnd.clone().startOf("week").subtract(2, "weeks").valueOf();
    startTimezone = this.getTimezoneAt(twoWeeksAgo);
    mStart = moment.tz(twoWeeksAgo, startTimezone);
  }

  if (mStart.isAfter(mEnd)) {
    this.log.warn("Invalid date range", { mStart: mStart.toISOString(), mEnd: mEnd.toISOString() });
    return null;
  }

  // Get the UTC values with exclusive range:
  startEpoch = mStart.valueOf() - 1;
  endEpoch = mEnd.valueOf() + 1;
  const days = dt.findBasicsDays(mStart, mEnd, startDate === null);
  const dateRange = [mStart.toISOString(), mEnd.toISOString()];

  const selectData = (/** @type {Datum[]} */group, /** @type {string|null} */ subType) => group.filter((d) => {
    if (subType && d.subType !== subType) {
      return false;
    }
    return startEpoch < d.epoch && d.epoch < endEpoch;
  });

  const basicsData = {
    timezone: endTimezone,
    dateRange,
    days,
    nData: 0,
    data: {
      reservoirChange: {
        data: selectData(this.grouped.deviceEvent, "reservoirChange"),
      },
      deviceParameter: {
        data: selectData(this.grouped.deviceEvent, "deviceParameter"),
      },
      // Types below are needed for PDF
      upload: {
        data: _.clone(this.grouped.upload),
      },
      cbg: {
        data: selectData(this.grouped.cbg),
      },
      smbg: {
        data: selectData(this.grouped.smbg),
      },
      basal: {
        data: selectData(this.grouped.basal),
      },
      bolus: {
        data: selectData(this.grouped.bolus),
      },
      wizard: {
        data: selectData(this.grouped.wizard),
      },
    },
  };

  _.forOwn(basicsData.data, (v) => {
    basicsData.nData += v.data.length;
  });

  return basicsData;
};

/**
 * Add data to tideline
 * @param {Datum[]} newData
 * @returns The number of added data
 */
TidelineData.prototype.addData = async function addData(newData) {
  this.log.debug("addData", newData);
  if (!Array.isArray(newData)) {
    this.log.error("Invalid parameter", { newData });
    throw new Error("Invalid parameter: newData");
  }

  const nDataBefore = this.data.length;
  const { startTimer, endTimer } = getTimerFuncs();

  startTimer("addData");

  startTimer("filterUnwanted");
  // Remove all unwanted data
  // From our new data
  if (_.get(window, "config.DEV", false)) {
    // Dev only: display unwanted data received to the console
    const unwantedData = newData.filter(d => !isWanted(d));
    if (unwantedData.length > 0) {
      this.log.warn("Unwanted data:", unwantedData);
    }
  }
  newData = newData.filter(isWanted);
  if (newData.length < 1) {
    this.log.info("Nothing interested in theses new data");
    endTimer("filterUnwanted");
    endTimer("addData");
    return 0;
  }

  // Clean-up ourselve
  this.grouped = null;
  this.diabetesData = null;
  this.deviceParameters = null;
  this.physicalActivities = null;
  this.zenEvents = null;
  this.confidentialEvents = null;
  this.warmUpEvents = null;
  this.latestPumpManufacturer = null;
  this.endpoints = null;
  this.basicsData = null;

  this.filterData = null;
  this.dataByDate = null;
  this.basalUtil = null;
  this.bolusUtil = null;
  this.cbgUtil = null;
  this.smbgUtil = null;

  this.maxDuration = 0;
  this.timezonesList = null;

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

  startTimer("deduplicateBoluses");
  this.deduplicateBoluses();
  endTimer("deduplicateBoluses");

  // Initial sort
  this.data.sort((a, b) => a.epoch - b.epoch);
  endTimer("Concatenate & uniq & sort");

  startTimer("joinWizardsAndBoluses");
  this.joinWizardsAndBoluses();
  endTimer("joinWizardsAndBoluses");

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
  this.latestPumpManufacturer = this.getLatestManufacturer();
  endTimer("latestPumpManufacturer");

  startTimer("setEvents");
  this.zenEvents = this.setEvents({ type: "deviceEvent", subType: "zen" }, ["inputTime"]);
  this.confidentialEvents = this.setEvents({ type: "deviceEvent", subType: "confidential" }, ["inputTime"]);
  this.warmUpEvents = this.setEvents({ type: "deviceEvent", subType: "warmup" }, ["inputTime"]);
  endTimer("setEvents");

  startTimer("deduplicatePhysicalActivities");
  this.deduplicatePhysicalActivities();
  endTimer("deduplicatePhysicalActivities");

  startTimer("deduplicateTempBasal");
  this.deduplicateTempBasal();
  endTimer("deduplicateTempBasal");

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
  this.basicsData = this.generateBasicsData();
  endTimer("setBasicsData");

  endTimer("addData");

  this.log.info(`${this.data.length - nDataBefore} data added, ${this.data.length} total`);
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
      this.log.warn("editMessage: Message not found", editedMessage);
    }

  } else {
    this.log.warn("editMessage: Unwanted message:", editedMessage);
  }

  endTimer("editMessage");
  return message;
};

export { DAILY_TYPES, genRandomId };
export default TidelineData;
