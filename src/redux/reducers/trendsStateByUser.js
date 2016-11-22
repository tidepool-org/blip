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

const FOCUSED_SLICE = 'focusedCbgSlice';
const FOCUSED_KEYS = 'focusedCbgSliceKeys';
const TOUCHED = 'touched';
const CBG_FLAGS = 'cbgFlags';
const CBG_100_ENABLED = 'cbg100Enabled';
const CBG_80_ENABLED = 'cbg80Enabled';
const CBG_50_ENABLED = 'cbg50Enabled';
const CBG_MEDIAN_ENABLED = 'cbgMedianEnabled';

const CBG_FLAG_MAP = {
  100: CBG_100_ENABLED,
  80: CBG_80_ENABLED,
  50: CBG_50_ENABLED,
  median: CBG_MEDIAN_ENABLED,
};

const initialState = {
  [FOCUSED_SLICE]: null,
  [FOCUSED_KEYS]: null,
  [TOUCHED]: false,
  [CBG_FLAGS]: {
    [CBG_100_ENABLED]: false,
    [CBG_80_ENABLED]: true,
    [CBG_50_ENABLED]: true,
    [CBG_MEDIAN_ENABLED]: true,
  },
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
    case actionTypes.FOCUS_TRENDS_CBG_SLICE: {
      const { focusedKeys, sliceData: slice, slicePosition: position, userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_SLICE]: { $set: { slice, position } },
          [FOCUSED_KEYS]: { $set: focusedKeys },
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
    case actionTypes.UNFOCUS_TRENDS_CBG_SLICE: {
      const { userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_SLICE]: { $set: null },
          [FOCUSED_KEYS]: { $set: null },
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
    default:
      return state;
  }
};

export default trendsStateByUser;
