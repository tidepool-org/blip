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

import { combineReducers } from 'redux';

import * as actionTypes from '../../actions/constants';

export const focusedCbgSlice = (state = null, action) => {
  switch (action.type) {
    case actionTypes.FOCUS_TRENDS_CBG_SLICE:
      return {
        slice: action.payload.sliceData,
        position: action.payload.slicePosition,
      };
    case actionTypes.UNFOCUS_TRENDS_CBG_SLICE:
      return null;
    default:
      return state;
  }
};

export const focusedCbgSliceKeys = (state = null, action) => {
  switch (action.type) {
    case actionTypes.FOCUS_TRENDS_CBG_SLICE:
      return action.payload.focusedKeys;
    case actionTypes.UNFOCUS_TRENDS_CBG_SLICE:
      return null;
    default:
      return state;
  }
};

export default combineReducers({ focusedCbgSlice, focusedCbgSliceKeys });
