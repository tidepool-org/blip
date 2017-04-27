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
import { format } from 'd3-format';
import { convertToMmolL } from './bloodglucose';
import { BG_HIGH, BG_LOW, MMOLL_UNITS } from './constants';
import { formatDisplayDate } from './datetime';

/**
 * displayDecimal
 * @param  {Number} val    numeric value to format
 * @param  {Number} places number of decimal places to displayDecimal
 * @return {String}        val formatted to places decimal places
 */
export function displayDecimal(val, places) {
  if (places === null || places === undefined) {
    return format('d')(val);
  }
  return format(`.${places}f`)(val);
}

/**
 * displayBgValue
 * @param {Number} val - integer or float blood glucose value in either mg/dL or mmol/L
 * @param {String} units - 'mg/dL' or 'mmol/L'
 * @param {Object} outOfRangeThresholds - specifies thresholds for `low` and `high` values
 *
 * @return {String} stringBgValue
 */
export function displayBgValue(val, units, outOfRangeThresholds) {
  if (!_.isEmpty(outOfRangeThresholds)) {
    let lowThreshold = outOfRangeThresholds.low;
    let highThreshold = outOfRangeThresholds.high;
    if (units === MMOLL_UNITS) {
      if (lowThreshold) {
        lowThreshold = convertToMmolL(lowThreshold);
      }
      if (highThreshold) {
        highThreshold = convertToMmolL(highThreshold);
      }
    }
    if (lowThreshold && val < lowThreshold) {
      return BG_LOW;
    }
    if (highThreshold && val > highThreshold) {
      return BG_HIGH;
    }
  }
  if (units === MMOLL_UNITS) {
    return format('.1f')(val);
  }
  return format('d')(val);
}

/**
 * patientFullName
 * @param  {Object} patient   the patient object that contains the profile
 * @return {String}           fullName of patient or empty if there is none
 */
export function patientFullName(patient) {
  const profile = _.get(patient, ['profile'], {});
  const patientInfo = profile.patient || {};

  if (patientInfo.isOtherPerson) {
    return patientInfo.fullName;
  }
  return profile.fullName;
}

/**
 * birthday
 * @param  {Object} patient   the patient object that contains the profile
 * @return {String}           MMM D, YYYY formated birthday or empty if none
 */
export function birthday(patient) {
  const bday = _.get(patient, ['profile', 'patient', 'birthday'], '');
  if (bday) {
    return formatDisplayDate(bday, {}, 'MMM D, YYYY');
  }
  return '';
}

/**
 * diagnosisDate
 * @param  {Object} patient   the patient object that contains the profile
 * @return {String}           MMM D, YYYY formated diagnosisDate or empty if none
 */
export function diagnosisDate(patient) {
  const diagnosis = _.get(patient, ['profile', 'patient', 'diagnosisDate'], '');
  if (diagnosis) {
    return formatDisplayDate(diagnosis, {}, 'MMM D, YYYY');
  }
  return '';
}
