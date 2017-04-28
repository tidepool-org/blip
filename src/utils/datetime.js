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
 * formatClocktimeFromMsPer24
 * @param {Number} duration - positive integer representing a time of day
 *                            in milliseconds within a 24-hr day
 * @param {String} [format] - optional moment display format string; default is 'h:mm a'
 *
 * @return {String} formatted clocktime, e.g., '12:05 pm'
 */
export function formatClocktimeFromMsPer24(milliseconds, format = 'h:mm a') {
  if (_.isNull(milliseconds) || _.isUndefined(milliseconds) ||
    milliseconds < 0 || milliseconds > TWENTY_FOUR_HRS || milliseconds instanceof Date) {
    throw new Error('First argument must be a value in milliseconds per twenty-four hour day!');
  }
  return moment.utc(milliseconds).format(format);
}

/**
 * formatTimezoneAwareFromUTC
 * @param {String} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {Object} timePrefs - object containing timezoneAware Boolean and timezoneName String
 * @param  {string} [format] - optional moment display format string; default is 'dddd, MMMM D'
 *
 * @return {string} formatted datetime, e.g., 'Sunday, January 1'
 */
export function formatTimezoneAwareFromUTC(utc, timePrefs, format = 'dddd, MMMM D') {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  const timezone = getTimezoneFromTimePrefs(timePrefs);
  return moment.utc(utc).tz(timezone).format(format);
}

/**
 * getHammertimeFromDatumWithTimePrefs
 * @param {Object} datum - a Tidepool datum with a time (required) and deviceTime (optional)
 * @param {Object} timePrefs - object containing timezoneAware Boolean and timezoneName String
 *
 * @return {Number} Integer hammertime (i.e., UTC time in milliseconds)
 */
export function getHammertimeFromDatumWithTimePrefs(datum, timePrefs) {
  let hammertime;
  if (timePrefs.timezoneAware) {
    if (!_.isUndefined(datum.time)) {
      hammertime = Date.parse(datum.time);
    } else {
      hammertime = null;
    }
  } else {
    if (!_.isUndefined(datum.deviceTime)) {
      hammertime = Date.parse(datum.deviceTime);
    } else {
      hammertime = null;
    }
  }
  if (_.isNaN(hammertime)) {
    throw new Error(
      'Check your input datum; could not parse `time` or `deviceTime` with Date.parse.'
    );
  }
  return hammertime;
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
