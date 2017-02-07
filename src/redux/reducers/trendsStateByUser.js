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
import update from 'react-addons-update';

import * as actionTypes from '../constants/actionTypes';

const CBG_FLAGS = 'cbgFlags';
const CBG_100_ENABLED = 'cbg100Enabled';
const CBG_80_ENABLED = 'cbg80Enabled';
const CBG_50_ENABLED = 'cbg50Enabled';
const CBG_MEDIAN_ENABLED = 'cbgMedianEnabled';
const FOCUSED_CBG_DATE_TRACE = 'focusedCbgDateTrace';
const FOCUSED_CBG_SLICE = 'focusedCbgSlice';
const FOCUSED_CBG_KEYS = 'focusedCbgSliceKeys';
const FOCUSED_SMBG = 'focusedSmbg';
const FOCUSED_SMBG_RANGE_AVG = 'focusedSmbgRangeAvg';
const SHOW_CBG_DATE_TRACES = 'showingCbgDateTraces';
const TOUCHED = 'touched';

const CBG_FLAG_MAP = {
  100: CBG_100_ENABLED,
  80: CBG_80_ENABLED,
  50: CBG_50_ENABLED,
  median: CBG_MEDIAN_ENABLED,
};

const initialState = {
  [CBG_FLAGS]: {
    [CBG_100_ENABLED]: true,
    [CBG_80_ENABLED]: true,
    [CBG_50_ENABLED]: true,
    [CBG_MEDIAN_ENABLED]: true,
  },
  [FOCUSED_CBG_DATE_TRACE]: null,
  [FOCUSED_CBG_SLICE]: null,
  [FOCUSED_CBG_KEYS]: null,
  [FOCUSED_SMBG]: null,
  [FOCUSED_SMBG_RANGE_AVG]: null,
  [SHOW_CBG_DATE_TRACES]: false,
  [TOUCHED]: false,
};

const trendsStateByUser = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.FETCH_PATIENT_DATA_SUCCESS: {
      const { patientId: userId } = action.payload;
      if (state[userId]) {
        return state;
      }
      return update(
        state,
        { [userId]: { $set: _.assign({}, initialState) } }
      );
    }
    case actionTypes.FOCUS_TRENDS_CBG_DATE_TRACE: {
      const { userId, cbgDatum: data, cbgPosition: position } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_CBG_DATE_TRACE]: { $set: { data, position } },
        } }
      );
    }
    case actionTypes.FOCUS_TRENDS_CBG_SLICE: {
      const { focusedKeys, sliceData: data, slicePosition: position, userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_CBG_SLICE]: { $set: { data, position } },
          [FOCUSED_CBG_KEYS]: { $set: focusedKeys },
        } }
      );
    }
    case actionTypes.FOCUS_TRENDS_SMBG: {
      const {
        smbgDatum: datum,
        smbgPosition: position,
        userId,
        allSmbgsOnDate,
        allPositions,
        date,
      } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_SMBG]: { $set: { datum, position, allSmbgsOnDate, allPositions, date } },
        } }
      );
    }
    case actionTypes.FOCUS_TRENDS_SMBG_RANGE_AVG: {
      const { rangeAvgData: data, rangeAvgPosition: position, userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_SMBG_RANGE_AVG]: { $set: { data, position } },
        } }
      );
    }
    case actionTypes.LOGOUT_REQUEST:
      return {};
    case actionTypes.MARK_TRENDS_VIEWED: {
      const { userId } = action.payload;
      return update(
        state,
        { [userId]: { [TOUCHED]: { $set: true } } }
      );
    }
    case actionTypes.SHOW_CBG_DATE_TRACES: {
      const { userId } = action.payload;
      return update(
        state,
        { [userId]: { [SHOW_CBG_DATE_TRACES]: { $set: true } } }
      );
    }
    case actionTypes.TURN_OFF_CBG_RANGE: {
      const { userId, range } = action.payload;
      const key = _.get(CBG_FLAG_MAP, range);
      if (!key) {
        return state;
      }
      return update(
        state,
        { [userId]: {
          [CBG_FLAGS]: { [key]: { $set: false } },
        } }
      );
    }
    case actionTypes.TURN_ON_CBG_RANGE: {
      const { userId, range } = action.payload;
      const key = _.get(CBG_FLAG_MAP, range);
      if (!key) {
        return state;
      }
      return update(
        state,
        { [userId]: {
          [CBG_FLAGS]: { [key]: { $set: true } },
        } }
      );
    }
    case actionTypes.UNFOCUS_TRENDS_CBG_DATE_TRACE: {
      const { userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_CBG_DATE_TRACE]: { $set: null },
        } }
      );
    }
    case actionTypes.UNFOCUS_TRENDS_CBG_SLICE: {
      const { userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_CBG_DATE_TRACE]: { $set: null },
          [FOCUSED_CBG_SLICE]: { $set: null },
          [FOCUSED_CBG_KEYS]: { $set: null },
          [SHOW_CBG_DATE_TRACES]: { $set: false },
        } }
      );
    }
    case actionTypes.UNFOCUS_TRENDS_SMBG: {
      const { userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_SMBG]: { $set: null },
        } }
      );
    }
    case actionTypes.UNFOCUS_TRENDS_SMBG_RANGE_AVG: {
      const { userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_SMBG_RANGE_AVG]: { $set: null },
        } }
      );
    }
    default:
      return state;
  }
};

export default trendsStateByUser;
