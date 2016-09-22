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

const FOCUSED_CBG_SLICE = 'focusedCbgSlice';
const FOCUSED_CBG_KEYS = 'focusedCbgSliceKeys';
const FOCUSED_SMBG = 'focusedSmbg';
const FOCUSED_SMBG_RANGE_AVG = 'focusedSmbgRangeAvg';
const TOUCHED = 'touched';

const initialState = {
  [FOCUSED_CBG_SLICE]: null,
  [FOCUSED_CBG_KEYS]: null,
  [FOCUSED_SMBG]: null,
  [FOCUSED_SMBG_RANGE_AVG]: null,
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
    case actionTypes.FOCUS_TRENDS_SMBG_RANGE_AVG: {
      const { rangeAvgData: data, rangeAvgPosition: position, userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_SMBG_RANGE_AVG]: { $set: { data, position } },
        } }
      );
    }
    case actionTypes.FOCUS_TRENDS_SMBG: {
      const { smbgData: data, smbgPosition: position, userId } = action.payload;
      return update(
        state,
        { [userId]: {
          [FOCUSED_SMBG]: { $set: { data, position } },
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
          [FOCUSED_CBG_SLICE]: { $set: null },
          [FOCUSED_CBG_KEYS]: { $set: null },
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
