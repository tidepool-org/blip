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

import { MGDL_PER_MMOLL, MS_IN_MIN } from './constants';

import { formatBgValue } from './format.js';

import i18next from 'i18next';
const t = i18next.t.bind(i18next);

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
 * classifyCvValue
 * @param {number} value - integer or float coefficient of variation (CV) value
 * @return {String} cvClassification - target, high
 */
export function classifyCvValue(value) {
  if (value <= 36) {
    return 'target';
  } else {
    return 'high';
  }
}

/**
 * convertToMmolL
 * @param {Number} bgVal - blood glucose value in mg/dL
 *
 * @return {Number} convertedBgVal - blood glucose value in mmol/L, unrounded
 */
export function convertToMmolL(val) {
  return (val / MGDL_PER_MMOLL);
}

/**
 * reshapeBgClassesToBgBounds
 * @param {Object} bgPrefs - bgPrefs object from blip containing tideline-style bgClasses
 *
 * @return {Object} bgBounds - tidepool-viz-style bgBounds
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

/**
 * Generate BG Range Labels for a given set of bg prefs
 *
 * @export
 * @param {Object} bgPrefs - bgPrefs object containing viz-style bgBounds and the bgUnits
 * @returns {Object} bgRangeLabels - map of labels keyed by bgClassification
 */
export function generateBgRangeLabels(bgPrefs, opts = {}) {
  const { bgBounds, bgUnits } = bgPrefs;
  const thresholds = _.mapValues(bgBounds, threshold => formatBgValue(threshold, bgPrefs));

  if (opts.condensed) {
    return {
      veryLow: `<${thresholds.veryLowThreshold}`,
      low: `${thresholds.veryLowThreshold}-${thresholds.targetLowerBound}`,
      target: `${thresholds.targetLowerBound}-${thresholds.targetUpperBound}`,
      high: `${thresholds.targetUpperBound}-${thresholds.veryHighThreshold}`,
      veryHigh: `>${thresholds.veryHighThreshold}`,
    };
  }

  return {
    veryLow: t('below {{value}} {{- units}}', { value: thresholds.veryLowThreshold, units: bgUnits }),
    low: t('between {{low}} - {{high}} {{- units}}', { low: thresholds.veryLowThreshold, high: thresholds.targetLowerBound, units: bgUnits }),
    target: t('between {{low}} - {{high}} {{- units}}', { low: thresholds.targetLowerBound, high: thresholds.targetUpperBound, units: bgUnits }),
    high: t('between {{low}} - {{high}} {{- units}}', { low: thresholds.targetUpperBound, high: thresholds.veryHighThreshold, units: bgUnits }),
    veryHigh: t('above {{value}} {{- units}}', { value: thresholds.veryHighThreshold, units: bgUnits }),
  };
}

/**
 * getOutOfRangeThreshold
 * @param {Object} bgDatum
 * @return Object containing out of range threshold or null
 */
export function getOutOfRangeThreshold(bgDatum) {
  const outOfRangeAnnotation = _.find(
    bgDatum.annotations || [], (annotation) => (annotation.code === 'bg/out-of-range')
  );
  return outOfRangeAnnotation ?
    { [outOfRangeAnnotation.value]: outOfRangeAnnotation.threshold } : null;
}

/**
 * Get the adjusted count of expected CGM data points for devices that do not sample at the default
 * 5 minute interval, such as the Abbot FreeStyle Libre, which samples every 15 mins
 *
 * @param {Array} data - cgm data
 * @return {Integer} count - the weighted count
 */
export function weightedCGMCount(data) {
  return _.reduce(data, (total, datum) => {
    let datumWeight = 1;
    const deviceId = _.get(datum, 'deviceId', '');

    // Because our decision as to whether or not there's enough cgm data to warrant using
    // it to calculate average BGs is based on the expected number of readings in a day,
    // we need to adjust the weight of a for the Freestyle Libre datum, as it only
    // collects BG samples every 15 minutes as opposed the default 5 minutes from dexcom.
    if (datum.type === 'cbg' && deviceId.indexOf('AbbottFreeStyleLibre') === 0) {
      datumWeight = 3;
    }

    return total + datumWeight;
  }, 0);
}

/**
 * Get the CGM sample frequency in milliseconds from a CGM data point. Most devices default at a
 * 5 minute interval, but others, such as the Abbot FreeStyle Libre, sample every 15 mins
 *
 * @param {Array} datum - a cgm data point
 */
export function cgmSampleFrequency(datum) {
  const deviceId = _.get(datum, 'deviceId', '');
  return deviceId.indexOf('AbbottFreeStyleLibre') === 0 ? 15 * MS_IN_MIN : 5 * MS_IN_MIN;
}
