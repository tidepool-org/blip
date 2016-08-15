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

export function getTime(data, startTime) {
  const millis = data.filter(s => s.start === startTime).map(s => s.start)[0];
  return datetime.millisecondsAsTimeOfDay(millis);
}

export function getRate(data, startTime) {
  const rate = data.filter(s => s.start === startTime).map(s => s.rate)[0];
  if (rate === null || (typeof rate === 'undefined')) {
    return '';
  }
  return format.displayDecimal(rate, DISPLAY_PRESCION_PLACES);
}

export function getValue(data, fieldName, startTime) {
  const val = data.filter(s => s.start === startTime).map(s => s[fieldName])[0];
  if (val === null || (typeof val === 'undefined')) {
    return '';
  }
  return val;
}

export function getBloodGlucoseValue(data, fieldName, startTime, units) {
  const value = getValue(data, fieldName, startTime);
  if (value === null || (typeof value === 'undefined')) {
    return '';
  }
  return format.displayBgValue(value, units);
}

export function getScheduleNames(data) {
  return _.keysIn(data);
}

export function getDeviceMeta(data) {
  return {
    name: data.deviceId || 'unknown',
    schedule: data.activeSchedule || 'unknown',
    uploaded: datetime.formatDisplayDate(data.deviceTime) || 'unknown',
  };
}

