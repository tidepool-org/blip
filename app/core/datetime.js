import moment from 'moment-timezone';
import map from 'lodash/map';
import { utils as vizUtils } from '@tidepool/viz';

import { MS_IN_MIN, MS_IN_HOUR } from './constants';

const { getLocalizedCeiling } = vizUtils.datetime;

export const convertMsPer24ToTimeString = msPer24 => {
  const hours = `0${new Date(msPer24).getUTCHours()}`.slice(-2);
  const minutes = `0${new Date(msPer24).getUTCMinutes()}`.slice(-2);
  return `${hours}:${minutes}`;
};

export const convertTimeStringToMsPer24 = timeString => {
  const [hours, minutes] = map(timeString.split(':'), val => parseInt(val, 10));
  return (hours * MS_IN_HOUR) + (minutes * MS_IN_MIN);
};

/**
 * getLastN24HourPeriods
 *
 * Returns the bounds for the last N 24-hour periods based on the most recent datum. The window
 * ends at the start of the hour after the most recent datum. For example, if the latest datum was
 * Oct 20 @ 15:23, the 14-day window will be Oct 6 @ 16:00 - Oct 20 @ 16:00. Without a most recent
 * datum, the window covers the last N calendar days through the end of today.
 *
 * @param {Number} numOfPeriods - number of 24-hour periods the window spans
 * @param {Object} timePrefs - object containing timezoneAware Boolean and timezoneName String
 * @param {Number|String} [mostRecentDatumDate] - hammertime or ISO timestamp of the most recent datum
 *
 * @return {{ startDate: Object, endDate: Object }} moments in the timePrefs timezone. The end bound
 * is exclusive.
 */
export const getLastN24HourPeriods = (numOfPeriods, timePrefs = {}, mostRecentDatumDate = null) => {
  const { timezoneName = 'UTC' } = timePrefs;

  const endDate = mostRecentDatumDate
    ? moment.utc(mostRecentDatumDate)
    : moment.utc().tz(timezoneName).endOf('day');

  const endHourCeiling = getLocalizedCeiling(endDate.valueOf(), timePrefs, 'hour');

  const startDate = moment.utc(endDate).tz(timezoneName).subtract(numOfPeriods, 'days');
  const startHourCeiling = getLocalizedCeiling(startDate.valueOf(), timePrefs, 'hour');

  return {
    startDate: moment.utc(startHourCeiling).tz(timezoneName),
    endDate: moment.utc(endHourCeiling).tz(timezoneName),
  };
};
