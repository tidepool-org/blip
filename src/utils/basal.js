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
    if (nextBasal.subType !== currentBasal.subType || currentBasal.discontinuousEnd) {
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
