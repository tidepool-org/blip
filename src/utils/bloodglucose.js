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

/**
 * classifyBgValue
 * @param {Object} bgBounds - object describing boundaries for blood glucose categories
 * @param {Number} bgValue - integer or float blood glucose value in either mg/dL or mmol/L
 * @param {String} classificationType - 'threeWay' or 'fiveWay'
 *
 * @return {String} bgClassification - low, target, high
 */
export function classifyBgValue(bgBounds, bgValue, classificationType = 'threeWay') {
  if (_.isEmpty(bgBounds) ||
    !_.isNumber(_.get(bgBounds, 'targetLowerBound')) ||
    !_.isNumber(_.get(bgBounds, 'targetUpperBound'))) {
    throw new Error(
      'You must provide a `bgBounds` object with a `targetLowerBound` and a `targetUpperBound`!'
    );
  }
  if (!_.isNumber(bgValue) || !_.gt(bgValue, 0)) {
    throw new Error('You must provide a positive, numerical blood glucose value to categorize!');
  }
  const { veryLowThreshold, targetLowerBound, targetUpperBound, veryHighThreshold } = bgBounds;
  if (classificationType === 'fiveWay') {
    if (bgValue < veryLowThreshold) {
      return 'veryLow';
    } else if (bgValue >= veryLowThreshold && bgValue < targetLowerBound) {
      return 'low';
    } else if (bgValue > targetUpperBound && bgValue <= veryHighThreshold) {
      return 'high';
    } else if (bgValue > veryHighThreshold) {
      return 'veryHigh';
    }
    return 'target';
  }
  if (bgValue < targetLowerBound) {
    return 'low';
  } else if (bgValue > targetUpperBound) {
    return 'high';
  }
  return 'target';
}

/**
 * convertToMmolL
 * @param {Number} bgVal - blood glucose value in mg/dL
 *
 * @return {Number} convertedBgVal - blood glucose value in mmol/L, unrounded
 */
export function convertToMmolL(val) {
  return (val / 18.01559);
}

/**
 * reshapeBgClassesToBgBounds
 * @param {Object} bgPrefs - bgPrefs object from blip containing tideline-style bgClasses
 *
 * @return {Object} bgBounds - @tidepool/viz-style bgBounds
 */
export function reshapeBgClassesToBgBounds(bgPrefs) {
  const { bgClasses } = bgPrefs;
  const bgBounds = {
    veryHighThreshold: bgClasses.high.boundary,
    targetUpperBound: bgClasses.target.boundary,
    targetLowerBound: bgClasses.low.boundary,
    veryLowThreshold: bgClasses['very-low'].boundary,
  };

  return bgBounds;
}
