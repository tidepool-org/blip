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

import moment from 'moment-timezone';

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
 * timezoneAwareCeiling
 * @param {String} utc - Zulu timestamp (Integer hammertime also OK)
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
 * formatDurationHours
 * @param {Number} duration - positive integer representing a time of day
 *                            in milliseconds within a 24-hr day
 *
 * @return {String} '[hours on 12-hr clock],[am or pm]'
 */
export function formatDurationHours(duration) {
  return moment(String(moment.duration(duration).hours()), 'H').format('h,a');
}

/**
 * formatDurationMinutes
 * @param {Number} duration - positive integer representing a time of day
 *                            in milliseconds within a 24-hr day
 *
 * @return {String} '[zero-padded mins]'
 */
export function formatDurationMinutes(duration) {
  return moment(String(moment.duration(duration).minutes()), 'm').format('mm');
}

/**
 * formatDurationToClocktime
 * @param {Number} duration - positive integer representing a time of day
 *                            in milliseconds within a 24-hr day
 *
 * @return {Object} { hours: 'hours on 12-hr clock',
 *                    minutes: 'zero-padded mins',
 *                    timeOfDay: 'am or pm' }
 */
export function formatDurationToClocktime(duration) {
  const hoursPlus = formatDurationHours(duration).split(',');
  return {
    hours: hoursPlus[0],
    minutes: formatDurationMinutes(duration),
    timeOfDay: hoursPlus[1],
  };
}
