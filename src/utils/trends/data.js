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
 * determineRangeBoundaries
 * @param {Array} outOfRange - Array of out-of-range objects w/threshold and value
 *
 * @return {Object} highAndLowThresholds - Object with high and low keys
 */
export function determineRangeBoundaries(outOfRange) {
  const lowThresholds = _.filter(outOfRange, { value: 'low' });
  const highThresholds = _.filter(outOfRange, { value: 'high' });
  const boundaries = {};
  if (!_.isEmpty(lowThresholds)) {
    // if there is data from multiple devices present with different thresholds
    // we want to use the more conservative (= higher) threshold for lows
    boundaries.low = max(lowThresholds, (d) => (d.threshold));
  }
  if (!_.isEmpty(highThresholds)) {
    // if there is data from multiple devices present with different thresholds
    // we want to use the more conservative (= lower) threshold for highs
    boundaries.high = min(highThresholds, (d) => (d.threshold));
  }
  return boundaries;
}

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
 * findDatesIntersectingWithCbgSliceSegment
 * @param {Array} cbgData - Array of Tidepool cbg events
 * @param {Object} focusedSlice - the current focused cbg slice/segment
 * @param {Array} focusedSliceKeys - Array of 2 keys representing
 *                                   the top & bottom of focused slice segment
 *
 * @return {Array} dates - Array of String dates in YYYY-MM-DD format
 */
export function findDatesIntersectingWithCbgSliceSegment(cbgData, focusedSlice, focusedSliceKeys) {
  const { data } = focusedSlice;
  return _.uniq(
    _.map(
      _.filter(
        cbgData,
        (d) => {
          if (d.msPer24 >= data.msFrom && d.msPer24 < data.msTo) {
            return (d.value >= data[focusedSliceKeys[0]] &&
              d.value <= data[focusedSliceKeys[1]]);
          }
          return false;
        }
      ),
      'localDate',
    )
  ).sort();
}

/**
 * findOutOfRangeAnnotations
 * @param {Array} data - Array of `cbg` or `smbg` events
 *
 * @return {Array} thresholds - Array of objects with unique `threshold`
 *                              (and `value` of 'low' or 'high')
 */
export function findOutOfRangeAnnotations(data) {
  const isOutOfRangeAnnotation = (annotation) => (annotation.code === 'bg/out-of-range');
  const eventsAnnotatedAsOutOfRange = _.filter(
    data,
    (d) => (_.some(d.annotations || [], isOutOfRangeAnnotation))
  );
  const annotations = _.map(eventsAnnotatedAsOutOfRange, (d) => (_.pick(
    _.find(d.annotations || [], isOutOfRangeAnnotation),
    ['threshold', 'value'],
  )));
  // the numerical `threshold` is our determiner of uniqueness
  return _.uniqBy(annotations, (d) => (d.threshold));
}

/**
 * calculateCbgStatsForBin
 * @param {String} binKey - String of natural number milliseconds bin
 * @param {Number} binSize - natural number duration in milliseconds
 * @param {Array} data - Array of cbg values in mg/dL or mmol/L
 * @param {Array} outOfRange - Array of out-of-range objects w/threshold and value
 *
 * @return {Object} calculatedCbgStats
 */
export function calculateCbgStatsForBin(binKey, binSize, data, outOfRange) {
  const sorted = _.sortBy(data, d => d);
  const centerOfBinMs = parseInt(binKey, 10);
  const stats = {
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
  if (!_.isEmpty(outOfRange)) {
    const thresholds = determineRangeBoundaries(outOfRange);
    stats.outOfRangeThresholds = thresholds;
  }
  return stats;
}

/**
 * calculateSmbgStatsForBin
 * @param {String} binKey - String of natural number milliseconds bin
 * @param {Number} binSize - natural number duration in milliseconds
 * @param {Array} data - Array of smbg values in mg/dL or mmol/L
 * @param {Array} outOfRange - Array of out-of-range objects w/threshold and value
 *
 * @return {Object} calculatedSmbgStats
 */
export function calculateSmbgStatsForBin(binKey, binSize, data, outOfRange) {
  const centerOfBinMs = parseInt(binKey, 10);
  const stats = {
    id: binKey,
    min: min(data),
    mean: mean(data),
    max: max(data),
    msX: centerOfBinMs,
    msFrom: centerOfBinMs - (binSize / 2),
    msTo: centerOfBinMs + (binSize / 2),
  };
  if (!_.isEmpty(outOfRange)) {
    const thresholds = determineRangeBoundaries(outOfRange);
    stats.outOfRangeThresholds = thresholds;
  }
  return stats;
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
