import map from 'lodash/map';

import { MS_IN_MIN, MS_IN_HOUR } from './constants';

export const convertMsPer24ToTimeString = msPer24 => {
  const hours = `0${new Date(msPer24).getUTCHours()}`.slice(-2);
  const minutes = `0${new Date(msPer24).getUTCMinutes()}`.slice(-2);
  return `${hours}:${minutes}`;
};

export const convertTimeStringToMsPer24 = timeString => {
  const [hours, minutes] = map(timeString.split(':'), val => parseInt(val, 10));
  return (hours * MS_IN_HOUR) + (minutes * MS_IN_MIN);
}
