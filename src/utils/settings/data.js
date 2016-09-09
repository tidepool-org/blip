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

function noData(val) {
  return val === null || (typeof val === 'undefined');
}

function getBasalRate(scheduleData, startTime) {
  const rate = _.find(scheduleData, function (schedule) {
    return schedule.start === startTime
  }).rate;

  if (noData(rate)) {
    return '';
  }
  return format.displayDecimal(rate, DISPLAY_PRECISION_PLACES);
}

function getValue(scheduleData, fieldName, startTime) {
  const val = _.find(scheduleData, function (schedule) {
    return schedule.start === startTime
  })[fieldName];

  if (noData(val)) {
    return '';
  }
  return val;
}

function getBloodGlucoseValue(scheduleData, fieldName, startTime, units) {
  const bgValue = getValue(scheduleData, fieldName, startTime);
  if (noData(bgValue)) {
    return '';
  }
  return format.displayBgValue(bgValue, units);
}

function getStarts(timedData){
  return _.map(timedData, 'start');
}

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
    total += (scheduleData[i].rate * hrs);
  }
  return format.displayDecimal(total, DISPLAY_PRECISION_PLACES);
}

export function getScheduleLabel(scheduleName, activeName) {
  if (scheduleName === activeName) {
    return `${scheduleName} (Active at upload)`;
  }
  return scheduleName;
}

export function getScheduleNames(settingsData) {
  return _.keysIn(settingsData);
}

export function getTimedSchedules(settingsData) {
  const names = _.map(settingsData, 'name');
  const schedules = [];
  for (let i = names.length - 1; i >= 0; i--) {
    schedules.push({ name: names[i], position: i });
  }
  return schedules;
}

export function getDeviceMeta(settingsData) {
  return {
    name: settingsData.deviceId || 'unknown',
    schedule: settingsData.activeSchedule || 'unknown',
    uploaded: datetime.formatDisplayDate(settingsData.deviceTime) || 'unknown',
    serial: settingsData.deviceSerialNumber || 'unknown',
  };
}

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

  const data =  _.map(starts, (startTime) => ({
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

