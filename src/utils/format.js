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

/*
 * Guidelines for these utilities:
 *
 * 1. Only "workhorse" functions used in 2+ places should be here.
 * 1a. A function used in multiple components for one view should live
 * in view-specific utils: src/utils/[view]/format.js
 * 1b. A function used in only one component should just be part of that component,
 * potentially as a named export if tests are deemed important to have.
 * 1c. This set of utilities is ONLY for NON-datetime related formatting. Any functions
 * used for formatting dates and/or times should go in src/utils/datetime.js
 *
 * 2. Function naming scheme: the main verb here is `format`. Start all function names with that.
 *
 * 3. Function organizational scheme in this file and tests file: alphabetical plz
 *
 * 4. Try to be consistent in how params are used:
 * (e.g., always pass in `bgPrefs`) rather than some (subset) of bgUnits and/or bgBounds
 * and try to copy & paste JSDoc @param descriptions for common params.
 *
 */

import _ from 'lodash';
import { format } from 'd3-format';
import { convertToMmolL } from './bloodglucose';
import { BG_HIGH, BG_LOW, MMOLL_UNITS } from './constants';

/**
 * formatBgValue
 * @param {Number} val - integer or float blood glucose value in either mg/dL or mmol/L
 * @param {Object} bgPrefs - object containing bgUnits String and bgBounds Object
 * @param {Object} [outOfRangeThresholds] - optional thresholds for `low` and `high` values;
 *                                          derived from annotations in PwD's data, so may not exist
 *
 * @return {String} formatted blood glucose value
 */
export function formatBgValue(val, bgPrefs, outOfRangeThresholds) {
  const units = _.get(bgPrefs, 'bgUnits', '');
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
 * formatDecimalNumber
 * @param {Number} val - numeric value to format
 * @param {Number} [places] - optional number of decimal places to display;
 *                            if not provided, will display as integer (0 decimal places)
 *
 * @return {String} numeric value rounded to the desired number of decimal places
 */
export function formatDecimalNumber(val, places) {
  if (places === null || places === undefined) {
    return format('d')(val);
  }
  return format(`.${places}f`)(val);
}


/**
 * formatInsulin
 *
 * @export
 * @param {Number} val - numeric value to format
 * @returns {String} numeric value formatted for the precision of insulin dosing
 */
export function formatInsulin(val) {
  let decimalLength = 1;
  const qtyString = val.toString();
  if (qtyString.indexOf('.') !== -1) {
    const length = qtyString.split('.')[1].length;
    decimalLength = _.min([length, 3]);
  }
  return formatDecimalNumber(val, decimalLength);
}

/**
 * formatPercentage
 * @param {Number} val - raw decimal proportion, range of 0.0 to 1.0
 *
 * @return {String} percentage
 */
export function formatPercentage(val, precision = 0) {
  if (Number.isNaN(val)) {
    return '--%';
  }
  return format(`.${precision}%`)(val);
}

/**
 * removeTrailingZeroes
 * @param {String} - formatted decimal value, may have trailing zeroes
 *
 * @return {String} - formatted decimal value w/o trailing zero-indexes
 */
export function removeTrailingZeroes(val) {
  return val.replace(/\.0+$/, '');
}
