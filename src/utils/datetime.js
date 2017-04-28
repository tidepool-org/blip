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
import moment from 'moment-timezone';

export const THIRTY_MINS = 1800000;
export const THREE_HRS = 10800000;
export const TWENTY_FOUR_HRS = 86400000;

/**
 * getTimezoneFromTimePrefs
 * @param {Object} timePrefs - object containing timezoneAware Boolean and timezoneName String
 *
 * @return {String} timezoneName
 */
export function getTimezoneFromTimePrefs(timePrefs) {
  const { timezoneAware, timezoneName } = timePrefs;
  let timezone = 'UTC';
  if (timezoneAware) {
    timezone = timezoneName || 'UTC';
  }
  return timezone;
}

/**
 * getTimezoneAwareCeiling
 * @param {String} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {Object} timePrefs - object containing timezoneAware Boolean and timezoneName String
 *
 * @return {JavaScript Date} the closest (future) midnight according to timePrefs;
 *                           if utc is already local midnight, returns utc
 */
export function getTimezoneAwareCeiling(utc, timePrefs) {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  const timezone = getTimezoneFromTimePrefs(timePrefs);
  const startOfDay = moment.utc(utc)
    .tz(timezone)
    .startOf('day');

  const utcHammertime = (typeof utc === 'string') ? Date.parse(utc) : utc;
  if (startOfDay.valueOf() === utcHammertime) {
    return startOfDay.toDate();
  }
  return startOfDay.add(1, 'day').toDate();
}

/**
 * timezoneAwareOffset
 * @param {String} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {String} timezone - named timezone
 * @param {Object} offset - { amount: integer (+/-), units: 'hour', 'day', &c }
 *
 * @return {JavaScript Date} datetime
 */
export function timezoneAwareOffset(utc, timezone, offset) {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  return moment.utc(utc)
    .tz(timezone)
    .add(offset.amount, offset.units)
    .toDate();
}

/**
 * localNoonBeforeTimestamp
 * @param {String} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {String} timezone - named timezone
 *
 * @return {JavaScript Date} datetime
 */
export function localNoonBeforeTimestamp(utc, timePrefs) {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  const timezone = getTimezoneFromTimePrefs(timePrefs);
  const ceil = getTimezoneAwareCeiling(utc, timePrefs);
  return moment.utc(ceil.valueOf())
    .tz(timezone)
    .subtract(1, 'day')
    .hours(12)
    .toDate();
}

/**
 * millisecondsAsTimeOfDay
 * @param {Number} duration - positive integer representing a time of day
 *                            in milliseconds within a 24-hr day
 * @param {String} [format] - optional moment display format string; default is 'h:mm a'
 *
 * @return {String} formatted clocktime
 */
export function millisecondsAsTimeOfDay(milliseconds, format = 'h:mm a') {
  if (_.isNull(milliseconds) || _.isUndefined(milliseconds) ||
    milliseconds < 0 || milliseconds > TWENTY_FOUR_HRS || milliseconds instanceof Date) {
    throw new Error('First argument must be a value in milliseconds per twenty-four hour day!');
  }
  return moment.utc(milliseconds).format(format);
}

/**
 * formatDisplayDate
 * @param  {(string|number)} utc Zulu timestamp (Integer hammertime also OK)
 * @param  {Object} (optional) timePrefs object containing timezone preferences
 * @param  {boolean} timePrefs.timezoneAware boolean to indicate timezone awareness
 * @param  {(string|null)} timePrefs.timezoneName name of timezone or null
 * @param  {string} [format] optional moment display format string; default is 'MMM D, YYYY'
 *
 * @return {string}           formatted timezoneAware date string
 */
export function formatDisplayDate(utc, timePrefs, format = 'dddd, MMMM D') {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  return moment.utc(utc).tz(getTimezoneFromTimePrefs(timePrefs || {})).format(format);
}

/**
 * Parse time for a datum based on timezone awareness
 * @param  {Object} data            data point to parse a time for
 * @param  {string} data.time       utc Zulu timestamp
 * @param  {string} data.deviceTime utc Zulu timestamp
 * @param  {Object} timePrefs       object containing timezone preferences
 * @param  {boolean} timePrefs.timezoneAware boolean to indicate timezone awareness
 *
 * @return {number|false}           hammertime or Bool false for missing properties
 */
export function getParsedTime(data, timePrefs) {
  let parsedTime;
  if (timePrefs.timezoneAware) {
    if (!_.isUndefined(data.time)) {
      parsedTime = Date.parse(data.time);
    } else {
      parsedTime = false;
    }
  } else {
    if (!_.isUndefined(data.deviceTime)) {
      parsedTime = Date.parse(data.deviceTime);
    } else {
      parsedTime = false;
    }
  }
  if (_.isNaN(parsedTime)) {
    throw new Error('time and deviceTime must be a ISO-formatted String timestamp');
  }
  return parsedTime;
}

/**
 * Get an ISO formatted string representing noon for a given (pre-TZ adjusted) date
 * @param  {String} localDate date already adjusted for timeZone
 * @param  {Object} timePrefs object containing timezone preferences
 * @param  {boolean} timePrefs.timezoneAware boolean to indicate timezone awareness
 * @param  {(string|null)} timePrefs.timezoneName name of timezone or null
 * @return {String}           ISO-formatted string
 */
export function midDayForDate(localDate, timePrefs) {
  return moment.tz(localDate, getTimezoneFromTimePrefs(timePrefs))
    .startOf('day')
    .add(12, 'hours')
    .toISOString();
}
