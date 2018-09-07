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
 * getBasalPathGroupType
 * @param {Object} basal - single basal datum
 * @return {String} the path group type
 */
export function getBasalPathGroupType(datum = {}) {
  const deliveryType = _.get(datum, 'subType', datum.deliveryType);
  const suppressedDeliveryType = _.get(
    datum.suppressed,
    'subType',
    _.get(datum.suppressed, 'deliveryType')
  );
  return _.includes([deliveryType, suppressedDeliveryType], 'automated') ? 'automated' : 'manual';
}

/**
 * getBasalPathGroups
 * @param {Array} basals - Array of preprocessed Tidepool basal objects
 * @return {Array} groups of alternating 'automated' and 'manual' datums
 */
export function getBasalPathGroups(basals) {
  const basalPathGroups = [];
  let currentPathType;
  _.each(basals, datum => {
    const pathType = getBasalPathGroupType(datum);
    if (pathType !== currentPathType) {
      currentPathType = pathType;
      basalPathGroups.push([]);
    }
    _.last(basalPathGroups).push(datum);
  });

  return basalPathGroups;
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

/**
 * Get the start and end indexes and datetimes of basal datums within a given time range
 * @param {Array} data Array of Tidepool basal data
 * @param {String} s ISO date string for the start of the range
 * @param {String} e ISO date string for the end of the range
 * @param {Boolean} optionalExtents If true, allow basal gaps at start and end extents of the range.
 * @returns {Object} The start and end datetimes and indexes
 */
export function getEndpoints(data, s, e, optionalExtents = false) {
  const start = new Date(s);
  const end = new Date(e);

  const startIndex = _.findIndex(
    data,
    segment => (optionalExtents || new Date(segment.normalTime).valueOf() <= start)
      && (start <= new Date(segment.normalEnd).valueOf())
  );

  const endIndex = _.findLastIndex(
    data,
    segment => (new Date(segment.normalTime).valueOf() <= end)
      && (optionalExtents || end <= new Date(segment.normalEnd).valueOf())
  );

  return {
    start: {
      datetime: start.toISOString(),
      index: startIndex,
    },
    end: {
      datetime: end.toISOString(),
      index: endIndex,
    },
  };
}

/**
 * Get durations of basal groups within a given span of time
 * @param {Array} data Array of Tidepool basal data
 * @param {String} s ISO date string for the start of the range
 * @param {String} e ISO date string for the end of the range
 * @returns {Object} The durations (in ms) keyed by basal group type
 */
export function getGroupDurations(data, s, e) {
  const endpoints = getEndpoints(data, s, e, true);

  const durations = {
    automated: 0,
    manual: 0,
  };

  if ((endpoints.start.index >= 0) && (endpoints.end.index >= 0)) {
    const start = new Date(endpoints.start.datetime);
    const end = new Date(endpoints.end.datetime);

    // handle first segment, which may have started before the start endpoint
    let segment = data[endpoints.start.index];
    const initialSegmentDuration = _.min([new Date(segment.normalEnd) - start, segment.duration]);
    durations[getBasalPathGroupType(segment)] = initialSegmentDuration;

    // add the durations of all subsequent basals, minus the last
    let i = endpoints.start.index + 1;
    while (i < endpoints.end.index) {
      segment = data[i];
      durations[getBasalPathGroupType(segment)] += segment.duration;
      i++;
    }

    // handle last segment, which may go past the end endpoint
    segment = data[endpoints.end.index];
    durations[getBasalPathGroupType(segment)] += _.min([
      end - new Date(segment.normalTime),
      segment.duration,
    ]);
  }

  return durations;
}
