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
import { max, mean, median, min, quantile } from 'd3-array';

import { TWENTY_FOUR_HRS } from '../datetime';

/**
 * findBinForTimeOfDay
 * @param {Number} binSize - natural number duration in milliseconds
 * @param {Number} msPer24 - natural number milliseconds into a twenty-four hour day
 *
 * @return {Number} bin
 */
export function findBinForTimeOfDay(binSize, msPer24) {
  if (msPer24 < 0 || msPer24 >= TWENTY_FOUR_HRS) {
    throw new Error('`msPer24` < 0 or >= 86400000 is invalid!');
  }

  return Math.floor(msPer24 / binSize) * binSize + (binSize / 2);
}

/**
 * calculateCbgStatsForBin
 * @param {String} binKey - String of natural number milliseconds bin
 * @param {Number} binSize - natural number duration in milliseconds
 * @param {Array} data - Array of cbg values in mg/dL or mmol/L
 *
 * @return {Object} calculatedCbgStats
 */
export function calculateCbgStatsForBin(binKey, binSize, data) {
  const sorted = _.sortBy(data, d => d);
  const centerOfBinMs = parseInt(binKey, 10);
  return {
    id: binKey,
    min: min(sorted),
    tenthQuantile: quantile(sorted, 0.1),
    firstQuartile: quantile(sorted, 0.25),
    median: median(sorted),
    thirdQuartile: quantile(sorted, 0.75),
    ninetiethQuantile: quantile(sorted, 0.9),
    max: max(sorted),
    msX: centerOfBinMs,
    msFrom: centerOfBinMs - (binSize / 2),
    msTo: centerOfBinMs + (binSize / 2),
  };
}

/**
 * calculateSmbgStatsForBin
 * @param {String} binKey - String of natural number milliseconds bin
 * @param {Number} binSize - natural number duration in milliseconds
 * @param {Array} data - Array of smbg values in mg/dL or mmol/L
 *
 * @return {Object} calculatedSmbgStats
 */
export function calculateSmbgStatsForBin(binKey, binSize, data) {
  const centerOfBinMs = parseInt(binKey, 10);
  return {
    id: binKey,
    min: min(data),
    mean: mean(data),
    max: max(data),
    msX: centerOfBinMs,
    msFrom: centerOfBinMs - (binSize / 2),
    msTo: centerOfBinMs + (binSize / 2),
  };
}

/**
 * Returns a category based on SMBG subType
 * @param  {Object} data smbg
 * @return {String}      category name for subType
 */
export function categorizeSmbgSubtype(data) {
  let category;
  if (data.subType && data.subType === 'manual') {
    category = data.subType;
  } else {
    category = 'meter';
  }
  return category;
}
