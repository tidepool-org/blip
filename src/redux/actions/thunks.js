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

import { focusTrendsCbgSlice, showCbgDateTraces } from './trends';

export function delayShowCbgTracesOnFocus(userId, sliceData, slicePosition, focusedKeys) {
  return (dispatch, getState) => {
    dispatch(focusTrendsCbgSlice(userId, sliceData, slicePosition, focusedKeys));
    setTimeout(() => {
      const currentTrendsStateForUser = _.get(getState(), ['viz', 'trends', userId], {});
      const {
        focusedCbgSlice: currentFocusedSlice, focusedCbgSliceKeys: currentFocusedKeys,
      } = currentTrendsStateForUser;
      const { id: sliceId } = sliceData;
      if (sliceId === _.get(currentFocusedSlice, ['data', 'id']) &&
          _.isEqual(focusedKeys, currentFocusedKeys)) {
        dispatch(showCbgDateTraces(userId));
      }
    }, 250);
  };
}
