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

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);

import * as actionTypes from '../../../src/redux/constants/actionTypes';
import { delayShowCbgTracesOnFocus } from '../../../src/redux/actions/thunks';

describe('thunk action creators', () => {
  const userId = 'a1b2c3';

  describe('delayShowCbgTracesOnFocus', () => {
    let clock;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    describe('when same cbg slice segment is focused after delay', () => {
      it('should fire FOCUS_TRENDS_CBG_SLICE then SHOW_CBG_DATE_TRACES after a delay', () => {
        const sliceData = { id: 'foo' };
        const slicePosition = {};
        const focusedKeys = ['bar', 'baz'];
        const store = mockStore({
          viz: {
            trends: {
              [userId]: { focusedCbgSlice: { data: sliceData }, focusedCbgSliceKeys: focusedKeys },
            },
          },
        });
        store.dispatch(delayShowCbgTracesOnFocus(userId, sliceData, slicePosition, focusedKeys));
        clock.tick(500);
        const actions = store.getActions();
        expect(actions).to.deep.equal([{
          type: actionTypes.FOCUS_TRENDS_CBG_SLICE,
          payload: {
            userId, sliceData, slicePosition, focusedKeys,
          },
        }, {
          type: actionTypes.SHOW_CBG_DATE_TRACES,
          payload: { userId },
        }]);
      });
    });

    describe('when original focused cbg slice segment no longer focused after delay', () => {
      it('should fire FOCUS_TRENDS_CBG_SLICE then SHOW_CBG_DATE_TRACES after a delay', () => {
        const sliceData = { data: { id: 'foo' } };
        const slicePosition = {};
        const focusedKeys = ['bar', 'baz'];
        const store = mockStore({
          viz: {
            trends: {
              [userId]: { focusedCbgSlice: sliceData, focusedCbgSliceKeys: ['one', 'two'] },
            },
          },
        });
        store.dispatch(delayShowCbgTracesOnFocus(userId, sliceData, slicePosition, focusedKeys));
        clock.tick(500);
        const actions = store.getActions();
        expect(actions).to.deep.equal([{
          type: actionTypes.FOCUS_TRENDS_CBG_SLICE,
          payload: {
            userId, sliceData, slicePosition, focusedKeys,
          },
        }]);
      });
    });
  });
});
