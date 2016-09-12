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

import { format } from 'd3-format';

export function displayDecimal(val, places) {
  if (places === null || places === undefined) {
    return format('d')(val);
  }
  return format(`.${places}f`)(val);
}

import { MMOLL_UNITS } from './constants';

/**
 * displayBgValue
 * @param {Number} val - integer or float blood glucose value in either mg/dL or mmol/L
 * @param {String} units - 'mg/dL' or 'mmol/L'
 *
 * @return {String} stringBgValue
 */
export function displayBgValue(val, units) {
  if (units === MMOLL_UNITS) {
    return format('.1f')(val);
  }
  return displayDecimal(val);
}
