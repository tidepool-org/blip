/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import _ from 'lodash';

import * as datetime from '../datetime';
import * as format from '../format';

const DISPLAY_PRECISION_PLACES = 3;

/**
 * noData
 * @private
 * @param  {ANY} val value to check
 *
 * @return {Boolean}     true if value is defined and not null, false otherwise
 */
function noData(val) {
  return val === null || (typeof val === 'undefined');
}

/**
 * getBasalRate
 * @private
 * @param  {Array} scheduleData  basal schedule
 * @param  {Number} startTime    milliseconds from start of day
 * @return {String}              formatted basal rate
 */
function getBasalRate(scheduleData, startTime) {
  const rate = _.find(scheduleData, (schedule) =>
    schedule.start === startTime
  ).rate;

  if (noData(rate)) {
    return '';
  }
  return format.displayDecimal(rate, DISPLAY_PRECISION_PLACES);
}

/**
 * getValue
 * @private
 * @param  {Array} scheduleData  scheduleData
 * @param  {String} fieldName    field to search for
 * @param  {Number} startTime    milliseconds from start of day
 *
 * @return {String}              value of field for startTime
 */
function getValue(scheduleData, fieldName, startTime) {
  const val = _.find(scheduleData, (schedule) =>
    schedule.start === startTime
  )[fieldName];

  if (noData(val)) {
    return '';
  }
  return val;
}

/**
 * getBloodGlucoseValue
 * @private
 * @param  {Array} scheduleData  scheduleData
 * @param  {String} fieldName    field to search format
 * @param  {Number} startTime    milliseconds from start of day
 * @param  {String} units        MGDL_UNITS or MMOLL_UNITS
 *
 * @return {String}              formatted blood glucose value
 */
function getBloodGlucoseValue(scheduleData, fieldName, startTime, units) {
  const bgValue = getValue(scheduleData, fieldName, startTime);
  if (noData(bgValue)) {
    return '';
  }
  return format.displayBgValue(bgValue, units);
}

/**
 * getStarts
 * @private
 * @param  {Array} timedData array with time based data
 *
 * @return {Array}           array of start times in milliseconds
 */
function getStarts(timedData) {
  return _.map(timedData, 'start');
}

/**
 * getTotalBasalRates
 * @param  {Array} scheduleData  basal schedule data
 *
 * @return {String}              formatted total of basal rates
 */
export function getTotalBasalRates(scheduleData) {
  const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
  const DAY_IN_MILLISECONDS = 86400000;

  let total = 0;
  for (let i = scheduleData.length - 1; i >= 0; i--) {
    const start = scheduleData[i].start;
    let finish = DAY_IN_MILLISECONDS;
    const next = i + 1;
    if (next < scheduleData.length) {
      finish = scheduleData[next].start;
    }
    const hrs = (finish - start) / HOUR_IN_MILLISECONDS;
    const amount = parseFloat(scheduleData[i].rate.toFixed(DISPLAY_PRECISION_PLACES)) * hrs;
    total += parseFloat(amount.toFixed(DISPLAY_PRECISION_PLACES));
  }
  return format.displayDecimal(total, DISPLAY_PRECISION_PLACES);
}

/**
 * getScheduleLabel
 * @param  {String} scheduleName basal schedule name
 * @param  {String} activeName   basal name active at upload timestamp
 *
 * @return {String}              object representing basal schedule label
 */
export function getScheduleLabel(scheduleName, activeName, noUnits) {
  return {
    main: scheduleName,
    secondary: scheduleName === activeName ? 'Active at upload' : '',
    units: noUnits ? '' : 'U/hr',
  };
}

/**
 * getScheduleNames
 * @param  {Object} settingsData object with basal schedule properties
 *
 * @return {Array}               array of basal schedule names
 */
export function getScheduleNames(settingsData) {
  return _.keysIn(settingsData);
}

/**
 * getTimedSchedules
 * @param  {Array} settingsData array of basal schedules
 *
 * @return {Array}              array of {name, position} basal objects
 */
export function getTimedSchedules(settingsData) {
  const names = _.map(settingsData, 'name');
  const schedules = [];
  for (let i = names.length - 1; i >= 0; i--) {
    schedules.push({ name: names[i], position: i });
  }
  return schedules;
}

/**
 * getDeviceMeta
 * @param  {Object} settingsData all settings data
 * @param  {Object} timePrefs    timezone preferences object
 *
 * @return {Object}              filtered meta data
 */
export function getDeviceMeta(settingsData, timePrefs) {
  let uploadedTime;
  if (timePrefs.timezoneAware) {
    if (settingsData.time) {
      uploadedTime = datetime.formatDisplayDate(Date.parse(settingsData.time), timePrefs);
    }
  } else {
    if (settingsData.deviceTime) {
      uploadedTime = datetime.formatDisplayDate(Date.parse(settingsData.deviceTime), timePrefs);
    }
  }
  return {
    schedule: settingsData.activeSchedule || 'unknown',
    uploaded: uploadedTime || 'unknown',
    serial: settingsData.deviceSerialNumber || 'unknown',
  };
}

/**
 * processBasalRateData
 * @param  {Object} scheduleData basal schedule object
 *
 * @return {Array}               array of formatted schedule entries
 */
export function processBasalRateData(scheduleData) {
  const starts = getStarts(scheduleData.value);
  const noRateData = [{ start: '-', rate: '-' }];

  if (starts.length === 0) {
    return noRateData;
  } else if (starts.length === 1) {
    if (Number(getBasalRate(scheduleData.value, starts[0])) === 0) {
      return noRateData;
    }
  }

  const data = _.map(starts, (startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime
    ),
    rate: getBasalRate(
      scheduleData.value,
      startTime
    ),
  }));

  data.push({
    start: 'Total',
    rate: getTotalBasalRates(scheduleData.value),
  });
  return data;
}

/**
 * processBgTargetData
 * @param  {Array} targetsData  array of blood glucose targets
 * @param  {String} bgUnits     MGDL_UNITS or MMOLL_UNITS
 * @param  {Object} keys        key names as {columnTwo, columnThree}
 *
 * @return {Array}              formatted bloog glucose target data
 */
export function processBgTargetData(targetsData, bgUnits, keys) {
  return _.map(getStarts(targetsData), (startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime
    ),
    columnTwo: getBloodGlucoseValue(
      targetsData,
      keys.columnTwo,
      startTime,
      bgUnits
    ),
    columnThree: getBloodGlucoseValue(
      targetsData,
      keys.columnThree,
      startTime,
      bgUnits
    ),
  }));
}

/**
 * processCarbRatioData
 * @param  {Array} carbRatioData  array of carb ratio data
 *
 * @return {Array}                array of formatted carb ratio objects
 */
export function processCarbRatioData(carbRatioData) {
  return _.map(getStarts(carbRatioData), (startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime
    ),
    amount: getValue(
      carbRatioData,
      'amount',
      startTime
    ),
  }));
}

/**
 * processSensitivityData
 * @param  {Array} sensitivityData  array of sensitivity data
 * @param  {String} bgUnits         MGDL_UNITS or MMOLL_UNITS
 *
 * @return {Array}                  array of formatted sensitivity objects
 */
export function processSensitivityData(sensitivityData, bgUnits) {
  return _.map(getStarts(sensitivityData), (startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime
    ),
    amount: getBloodGlucoseValue(
      sensitivityData,
      'amount',
      startTime,
      bgUnits
    ),
  }));
}

/**
 * processTimedSettings
 * @param  {Object} pumpSettings entire pump settings object
 * @param  {Object} schedule     {name, position} schedule object
 * @param  {String} bgUnits      MGDL_UNITS or MMOLL_UNITS
 *
 * @return {Array}               array of formatted objects with
 *                                 {start, rate, bgTarget, carbRatio, insulinSensitivity}
 */
export function processTimedSettings(pumpSettings, schedule, bgUnits) {
  const data = _.map(getStarts(pumpSettings.bgTargets[schedule.name]), (startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime,
    ),
    rate: getBasalRate(
      pumpSettings.basalSchedules[schedule.position].value,
      startTime,
    ),
    bgTarget: getBloodGlucoseValue(
      pumpSettings.bgTargets[schedule.name],
      'target',
      startTime,
      bgUnits,
    ),
    carbRatio: getValue(
      pumpSettings.carbRatios[schedule.name],
      'amount',
      startTime,
    ),
    insulinSensitivity: getBloodGlucoseValue(
      pumpSettings.insulinSensitivities[schedule.name],
      'amount',
      startTime,
      bgUnits,
    ),
  }));

  data.push({
    start: 'Total',
    rate: getTotalBasalRates(
      pumpSettings.basalSchedules[schedule.position].value,
    ),
    bgTarget: '',
    carbRatio: '',
    insulinSensitivity: '',
  });
  return data;
}

/**
 * startTimeAndValue
 * @param {TYPE} accessor key for value displayed in this column
 *
 * @return {Array} array of objects describing table columns
 */
export function startTimeAndValue(valueKey) {
  return [
    { key: 'start', label: 'Start time' },
    { key: valueKey, label: 'Value' },
  ];
}
