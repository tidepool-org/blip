/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import { ONE_HR } from './datetime';

/**
* getBasalSequences
* @param {Array} basals - Array of preprocessed Tidepool basal objects
*
* @return {Array} Array of Arrays where each component Array is a sequence of basals
*                 of the same subType to be rendered as a unit
*/
export function getBasalSequences(basals) {
  const basalSequences = [];
  let currentBasal = basals[0];
  let seq = [basals[0]];

  let idx = 1;
  while (idx <= basals.length - 1) {
    const nextBasal = basals[idx];
    const basalTypeChange = nextBasal.subType !== currentBasal.subType;

    if (basalTypeChange || currentBasal.discontinuousEnd || nextBasal.rate === 0) {
      basalSequences.push(seq);
      seq = [];
    }

    seq.push(nextBasal);
    currentBasal = nextBasal;
    ++idx;
  }
  basalSequences.push(seq);

  return basalSequences;
}

/**
 * getTotalBasal
 * @param {Array} basals - Array of preprocessed Tidepool basal objects
 *                         trimmed to fit within the timespan the total basal
 *                         is being calculated over
 *
 * @return {Number} total basal insulin in units
 */
export function getTotalBasal(basals) {
  return _.reduce(basals, (result, basal) => (
    result + basal.rate * (basal.duration / ONE_HR)
  ), 0);
}
