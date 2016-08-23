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

import * as datetime from '../../utils/datetime';
import * as format from '../../utils/format';

export const DISPLAY_PRESCION_PLACES = 3;
export const MGDL_UNITS = 'mg/dL';
export const MMOLL_UNITS = 'mmol/L';

export function getTime(scheduleData, startTime) {
  const millis = scheduleData.filter(s => s.start === startTime).map(s => s.start)[0];
  return datetime.millisecondsAsTimeOfDay(millis);
}

export function getBasalRate(scheduleData, startTime) {
  const rate = scheduleData.filter(s => s.start === startTime).map(s => s.rate)[0];
  if (rate === null || (typeof rate === 'undefined')) {
    return '';
  }
  return format.displayDecimal(rate, DISPLAY_PRESCION_PLACES);
}

export function getBasalRateT(ratesData, name, startTime) {
  const ratesForSchedule = ratesData
    .filter(r => r.name === name)[0].value;

  const rate = ratesForSchedule
    .filter(s => s.start === startTime)
    .map(s => s.rate)[0];

  if (rate === null || (typeof rate === 'undefined')) {
    return '';
  }
  return format.displayDecimal(rate, DISPLAY_PRESCION_PLACES);
}

export function getValue(scheduleData, fieldName, startTime) {
  const val = scheduleData.filter(s => s.start === startTime).map(s => s[fieldName])[0];
  if (val === null || (typeof val === 'undefined')) {
    return '';
  }
  return val;
}

export function getBloodGlucoseValue(scheduleData, fieldName, startTime, units) {
  const value = getValue(scheduleData, fieldName, startTime);
  if (value === null || (typeof value === 'undefined')) {
    return '';
  }
  return format.displayBgValue(value, units);
}

export function getTotalBasalRates(scheduleData) {
  let total = 0;
  for (let i = scheduleData.length - 1; i >= 0; i--) {
    const start = scheduleData[i].start;
    let finish = 86400000;
    const next = i + 1;
    if (next < scheduleData.length) {
      finish = scheduleData[next].start;
    }
    const hrs = (finish - start) / (60 * 60 * 1000);
    total += (scheduleData[i].rate * hrs);
  }
  return format.displayDecimal(total, DISPLAY_PRESCION_PLACES);
}

export function getTotalBasalRatesT(ratesData, name) {
  let ratesForSchedule = ratesData
    .filter(r => r.name === name)[0];

  if (ratesForSchedule === null || (typeof ratesForSchedule === 'undefined')) {
    return '';
  }
  ratesForSchedule = ratesForSchedule.value;
  let total = 0;
  for (let i = ratesForSchedule.length - 1; i >= 0; i--) {
    const start = ratesForSchedule[i].start;
    let finish = 86400000;
    const next = i + 1;
    if (next < ratesForSchedule.length) {
      finish = ratesForSchedule[next].start;
    }
    const hrs = (finish - start) / (60 * 60 * 1000);

    total += (ratesForSchedule[i].rate * hrs);
  }
  return format.displayDecimal(total, DISPLAY_PRESCION_PLACES);
}

export function getScheduleNames(settingsData) {
  return _.keysIn(settingsData);
}

export function getDeviceMeta(settingsData) {
  return {
    name: settingsData.deviceId || 'unknown',
    schedule: settingsData.activeSchedule || 'unknown',
    uploaded: datetime.formatDisplayDate(settingsData.deviceTime) || 'unknown',
  };
}
