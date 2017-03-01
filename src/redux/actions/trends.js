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

import * as actionTypes from '../constants/actionTypes';

export function focusTrendsCbgDateTrace(userId, cbgDatum, cbgPosition) {
  return {
    type: actionTypes.FOCUS_TRENDS_CBG_DATE_TRACE,
    payload: { userId, cbgDatum, cbgPosition },
  };
}

export function focusTrendsCbgSlice(userId, sliceData, slicePosition, focusedKeys) {
  return {
    type: actionTypes.FOCUS_TRENDS_CBG_SLICE,
    payload: { focusedKeys, sliceData, slicePosition, userId },
  };
}

export function focusTrendsSmbg(
  userId, smbgDatum, smbgPosition, allSmbgsOnDate, allPositions, date
) {
  return {
    type: actionTypes.FOCUS_TRENDS_SMBG,
    payload: { userId, smbgDatum, smbgPosition, allSmbgsOnDate, allPositions, date },
  };
}

export function focusTrendsSmbgRangeAvg(userId, rangeAvgData, rangeAvgPosition) {
  return {
    type: actionTypes.FOCUS_TRENDS_SMBG_RANGE_AVG,
    payload: { rangeAvgData, rangeAvgPosition, userId },
  };
}

export function markTrendsViewed(userId) {
  return {
    type: actionTypes.MARK_TRENDS_VIEWED,
    payload: { userId },
  };
}

export function showCbgDateTraces(userId) {
  return {
    type: actionTypes.SHOW_CBG_DATE_TRACES,
    payload: { userId },
  };
}

export function turnOffCbgRange(userId, range) {
  return {
    type: actionTypes.TURN_OFF_CBG_RANGE,
    payload: { userId, range },
  };
}

export function turnOnCbgRange(userId, range) {
  return {
    type: actionTypes.TURN_ON_CBG_RANGE,
    payload: { userId, range },
  };
}

export function unfocusTrendsCbgDateTrace(userId) {
  return {
    type: actionTypes.UNFOCUS_TRENDS_CBG_DATE_TRACE,
    payload: { userId },
  };
}

export function unfocusTrendsCbgSlice(userId) {
  return {
    type: actionTypes.UNFOCUS_TRENDS_CBG_SLICE,
    payload: { userId },
  };
}

export function unfocusTrendsSmbg(userId) {
  return {
    type: actionTypes.UNFOCUS_TRENDS_SMBG,
    payload: { userId },
  };
}

export function unfocusTrendsSmbgRangeAvg(userId) {
  return {
    type: actionTypes.UNFOCUS_TRENDS_SMBG_RANGE_AVG,
    payload: { userId },
  };
}
