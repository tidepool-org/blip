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
  // TODO: this is a bug here that's causing basics timezone to creep forward
  // if the utc passed in *is* a local midnight/start-of-day value, adding 1 is unnecessary
  return moment.utc(utc)
    .tz(timezone)
    .startOf('day')
    .add(1, 'day')
    .toDate();
}

export function formatDurationHours(duration) {
  return moment(String(moment.duration(duration).hours()), 'H').format('h,a');
}

export function formatDurationMinutes(duration) {
  return moment(String(moment.duration(duration).minutes()), 'm').format('mm');
}

export function formatDurationToClocktime(duration) {
  const hoursPlus = formatDurationHours(duration).split(',');
  return {
    hours: hoursPlus[0],
    minutes: formatDurationMinutes(duration),
    timeOfDay: hoursPlus[1],
  };
}
