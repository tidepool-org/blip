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

import isTSA from '../../helpers/tidepoolStandardAction';

import * as actionTypes from '../../../src/redux/constants/actionTypes';
import * as actions from '../../../src/redux/actions/';

describe('trends action creators', () => {
  const userId = 'a1b2c3';

  describe('focusTrendsCbgDateTrace', () => {
    const cbgDatum = {};
    const cbgPosition = {};
    const action = actions.focusTrendsCbgDateTrace(userId, cbgDatum, cbgPosition);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to focus a cbg date trace', () => {
      expect(action).to.deep.equal({
        type: actionTypes.FOCUS_TRENDS_CBG_DATE_TRACE,
        payload: { cbgDatum, cbgPosition, userId },
      });
    });
  });

  describe('focusTrendsCbgSlice', () => {
    const sliceData = {};
    const slicePosition = {};
    const focusedKeys = [];
    const action = actions.focusTrendsCbgSlice(userId, sliceData, slicePosition, focusedKeys);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to focus a trends cbg slice', () => {
      expect(action).to.deep.equal({
        type: actionTypes.FOCUS_TRENDS_CBG_SLICE,
        payload: { sliceData, slicePosition, focusedKeys, userId },
      });
    });
  });

  describe('focusTrendsSmbg', () => {
    const smbgDatum = {};
    const smbgPosition = {};
    const allPositions = [];
    const allSmbgsOnDate = [];
    const date = {};
    const action = actions.focusTrendsSmbg(
      userId,
      smbgDatum,
      smbgPosition,
      allSmbgsOnDate,
      allPositions,
      date,
    );

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to focus a trends smbg', () => {
      expect(action).to.deep.equal({
        type: actionTypes.FOCUS_TRENDS_SMBG,
        payload: { smbgDatum, smbgPosition, allSmbgsOnDate, allPositions, userId, date },
      });
    });
  });

  describe('focusTrendsSmbgRangeAvg', () => {
    const rangeAvgData = {};
    const rangeAvgPosition = {};
    const action = actions.focusTrendsSmbgRangeAvg(userId, rangeAvgData, rangeAvgPosition);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to focus a trends smbg range average', () => {
      expect(action).to.deep.equal({
        type: actionTypes.FOCUS_TRENDS_SMBG_RANGE_AVG,
        payload: { rangeAvgData, rangeAvgPosition, userId },
      });
    });
  });

  describe('markTrendsViewed', () => {
    const action = actions.markTrendsViewed(userId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to marks trends viewed', () => {
      expect(action).to.deep.equal({
        type: actionTypes.MARK_TRENDS_VIEWED,
        payload: { userId },
      });
    });
  });

  describe('showCbgDateTraces', () => {
    const action = actions.showCbgDateTraces(userId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to toggle cbg traces on for the user', () => {
      expect(action).to.deep.equal({
        type: actionTypes.SHOW_CBG_DATE_TRACES,
        payload: { userId },
      });
    });
  });

  describe('turnOffCbgRange', () => {
    const range = '100';
    const action = actions.turnOffCbgRange(userId, range);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to turn off cbg range', () => {
      expect(action).to.deep.equal({
        type: actionTypes.TURN_OFF_CBG_RANGE,
        payload: { userId, range },
      });
    });
  });

  describe('turnOnCbgRange', () => {
    const range = '100';
    const action = actions.turnOnCbgRange(userId, range);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to turn on cbg range', () => {
      expect(action).to.deep.equal({
        type: actionTypes.TURN_ON_CBG_RANGE,
        payload: { userId, range },
      });
    });
  });

  describe('unfocusTrendsCbgDateTrace', () => {
    const action = actions.unfocusTrendsCbgDateTrace(userId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to unfocus a cbg date trace', () => {
      expect(action).to.deep.equal({
        type: actionTypes.UNFOCUS_TRENDS_CBG_DATE_TRACE,
        payload: { userId },
      });
    });
  });

  describe('unfocusTrendsCbgSlice', () => {
    const action = actions.unfocusTrendsCbgSlice(userId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to unfocus (all) trends cbg slices', () => {
      expect(action).to.deep.equal({
        type: actionTypes.UNFOCUS_TRENDS_CBG_SLICE,
        payload: { userId },
      });
    });
  });

  describe('unfocusTrendsSmbg', () => {
    const action = actions.unfocusTrendsSmbg(userId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to unfocus trends smbg', () => {
      expect(action).to.deep.equal({
        type: actionTypes.UNFOCUS_TRENDS_SMBG,
        payload: { userId },
      });
    });
  });

  describe('unfocusTrendsSmbgRangeAvg', () => {
    const action = actions.unfocusTrendsSmbgRangeAvg(userId);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to unfocus (all) trends smbg range averages', () => {
      expect(action).to.deep.equal({
        type: actionTypes.UNFOCUS_TRENDS_SMBG_RANGE_AVG,
        payload: { userId },
      });
    });
  });
});
