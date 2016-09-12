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

import mutationTracker from 'object-invariant-test-helper';

import * as actionTypes from '../../../src/redux/actions/constants';
import * as reducers from '../../../src/redux/reducers/trends';

describe('focusedCbgSlice', () => {
  const slice = { median: 100 };
  const position = { median: 10 };

  it('should return an initial state of `null`', () => {
    expect(reducers.focusedCbgSlice(undefined, {})).to.be.null;
  });

  describe('FOCUS_TRENDS_CBG_SLICE', () => {
    it('should store focused slice and slice\'s position', () => {
      expect(reducers.focusedCbgSlice(undefined, {
        type: actionTypes.FOCUS_TRENDS_CBG_SLICE,
        payload: { sliceData: slice, slicePosition: position },
      })).to.deep.equal({ slice, position });
    });

    it('should replace existing focused slice w/new w/o mutating state object', () => {
      const newSlice = { median: 95 };
      const newSlicePos = { median: 9.5 };
      const initialState = { slice, position };
      const tracked = mutationTracker.trackObj(initialState);
      expect(reducers.focusedCbgSlice(initialState, {
        type: actionTypes.FOCUS_TRENDS_CBG_SLICE,
        payload: { sliceData: newSlice, slicePosition: newSlicePos },
      })).to.deep.equal({ slice: newSlice, position: newSlicePos });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('UNFOCUS_TRENDS_CBG_SLICE', () => {
    it('should store `null` for the branch of state tree', () => {
      const initialState = { slice, position };
      expect(reducers.focusedCbgSlice(initialState, {
        type: actionTypes.UNFOCUS_TRENDS_CBG_SLICE,
      })).to.be.null;
    });
  });
});

describe('focusedCbgSliceKeys', () => {
  const focusedKeys = ['min', 'max'];
  it('should return an initial state of `null`', () => {
    expect(reducers.focusedCbgSliceKeys(undefined, {})).to.be.null;
  });

  describe('FOCUS_TRENDS_CBG_SLICE', () => {
    it('should store focused slice keys', () => {
      expect(reducers.focusedCbgSliceKeys(undefined, {
        type: actionTypes.FOCUS_TRENDS_CBG_SLICE,
        payload: { focusedKeys },
      })).to.deep.equal(focusedKeys);
    });

    it('should replace existing focused slice keys w/new w/o mutating array', () => {
      const newKeys = ['median'];
      const tracked = mutationTracker.trackObj(focusedKeys);
      expect(reducers.focusedCbgSliceKeys(focusedKeys, {
        type: actionTypes.FOCUS_TRENDS_CBG_SLICE,
        payload: { focusedKeys: newKeys },
      })).to.deep.equal(newKeys);
      expect(mutationTracker.hasMutated(tracked));
    });
  });

  describe('UNFOCUS_TRENDS_CBG_SLICE', () => {
    it('should store `null` for the branch of state tree', () => {
      expect(reducers.focusedCbgSliceKeys(focusedKeys, {
        type: actionTypes.UNFOCUS_TRENDS_CBG_SLICE,
      })).to.be.null;
    });
  });
});

describe('touched', () => {
  it('should return an initial state of `false`', () => {
    expect(reducers.touched(undefined, {})).to.be.false;
  });

  describe('MARK_TRENDS_VIEWED', () => {
    it('should change the state to `true`', () => {
      expect(reducers.touched(undefined, {
        type: actionTypes.MARK_TRENDS_VIEWED,
      })).to.be.true;
    });
  });
});
