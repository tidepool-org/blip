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
 * @param {Object} timePrefs - object containing timezoneAware Boolean, timezoneName String or null
 *
 * @return {String} named timezone
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
 * timezoneAwareCeiling
 * @param {String|Number} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {String} timezone - named timezone
 *
 * @return {JavaScript Date} datetime
 */
export function timezoneAwareCeiling(utc, timezone) {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  const startOfDay = moment.utc(utc)
    .tz(timezone)
    .startOf('day');

  const utcHammertime = typeof utc === 'string' ? Date.parse(utc) : utc;
  if (startOfDay.valueOf() === utcHammertime) {
    return startOfDay.toDate();
  }
  return startOfDay.add(1, 'day').toDate();
}

/**
 * formatDisplayDate
 * @param {String|Number} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {Object} timePrefs - object containing timezoneAware Boolean, timezoneName String or null
 * @param {String} [format] - optional moment display format string; default is 'Sunday, January 1'
 *
 * @return {String} formatted datetime string
 */
export function formatDisplayDate(utc, timePrefs, format = 'dddd, MMMM D') {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  return moment.utc(utc).tz(getTimezoneFromTimePrefs(timePrefs || {})).format(format);
}

/**
 * formatDuration
 * @param {Number} duration - Integer duration in milliseconds
 *
 * @return {String} formatted duration
 */
export function formatDuration(duration) {
  const momentDuration = moment.duration(duration);
  const QUARTER = '¼';
  const THIRD = '⅓';
  const HALF = '½';
  const TWO_THIRDS = '⅔';
  const THREE_QUARTERS = '¾';
  const hours = momentDuration.hours();
  const minutes = momentDuration.minutes();

  if (hours !== 0) {
    const suffix = (hours === 1) ? 'hr' : 'hrs';
    switch (minutes) {
      case 0:
        return `${hours} ${suffix}`;
      case 15:
        return `${hours}${QUARTER} ${suffix}`;
      case 20:
        return `${hours}${THIRD} ${suffix}`;
      case 30:
        return `${hours}${HALF} ${suffix}`;
      case 40:
        return `${hours}${TWO_THIRDS} ${suffix}`;
      case 45:
        return `${hours}${THREE_QUARTERS} ${suffix}`;
      default:
        return `${hours} ${suffix} ${minutes} min`;
    }
  } else {
    return `${minutes} min`;
  }
}

/**
 * getAllDatesInRange
 * @param {String|Number} start - Zulu timestamp (Integer hammertime also OK)
 * @param {String|Number} end - Zulu timestamp (Integer hammertime also OK)
 * @param {String} timezone - named timezone
 *
 * @return {Array} array of YYYY-MM-DD String dates
 */
export function getAllDatesInRange(start, end, timezoneName) {
  const dates = [];
  const current = moment.utc(start)
    .tz(timezoneName);
  const excludedBoundary = moment.utc(end);
  while (current.isBefore(excludedBoundary)) {
    dates.push(current.format('YYYY-MM-DD'));
    current.add(1, 'day');
  }
  return dates;
}

/**
 * localNoonBeforeTimestamp
 * @param {String|Number} utc - Zulu timestamp (Integer hammertime also OK)
 * @param {String} timezone - named timezone
 *
 * @return {JavaScript Date} datetime
 */
export function localNoonBeforeTimestamp(utc, timezone) {
  if (utc instanceof Date) {
    throw new Error('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
  }
  const ceil = timezoneAwareCeiling(utc, timezone);
  return moment.utc(ceil.valueOf())
    .tz(timezone)
    .subtract(1, 'day')
    .hours(12)
    .toDate();
}

/**
 * midDayForDate
 * @param {String} localDate - a timezone-localized date
 * @param {Object} timePrefs - object containing timezoneAware Boolean, timezoneName String or null
 *
 * @return {String} Zulu timestamp
 */
export function midDayForDate(localDate, timePrefs) {
  return moment.tz(localDate, getTimezoneFromTimePrefs(timePrefs))
    .startOf('day')
    .add(12, 'hours')
    .toISOString();
}

/**
 * millisecondsAsTimeOfDay
 * @param {Number} duration - positive integer representing a time of day
 *                            in milliseconds within a 24-hr day
 * @param {String} [format] - optional moment display format string; default is '12:05 am'
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
 * timezoneAwareOffset
 * @param {String|Number} utc - Zulu timestamp (Integer hammertime also OK)
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
