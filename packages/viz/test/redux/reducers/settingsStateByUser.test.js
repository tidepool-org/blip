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

import * as actionTypes from '../../../src/redux/constants/actionTypes';
import settingsStateByUser from '../../../src/redux/reducers/settingsStateByUser';

describe('settingsStateByUser', () => {
  const USER_1 = 'a1b2c3';
  const USER_2 = 'd4e5f6';

  const deviceKey = 'acme';
  const scheduleKey = 'weekday';

  it('should return the initial state of {}', () => {
    expect(settingsStateByUser(undefined, {})).to.deep.equal({});
  });

  describe('FETCH_PATIENT_DATA_SUCCESS', () => {
    it('should set up an empty object for settings state for the user if not in tree', () => {
      const initialState = { [USER_1]: { [deviceKey]: { illness: false } } };
      const tracked = mutationTracker.trackObj(initialState);
      expect(settingsStateByUser(initialState, {
        type: actionTypes.FETCH_PATIENT_DATA_SUCCESS,
        payload: { patientId: USER_2 },
      })).to.deep.equal({
        [USER_1]: { [deviceKey]: { illness: false } },
        [USER_2]: {},
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should do nothing if user already in tree', () => {
      const initialState = { [USER_1]: { [deviceKey]: { illness: false } } };
      const tracked = mutationTracker.trackObj(initialState);
      expect(settingsStateByUser(initialState, {
        type: actionTypes.FETCH_PATIENT_DATA_SUCCESS,
        payload: { patientId: USER_1 },
      })).to.deep.equal({
        [USER_1]: { [deviceKey]: { illness: false } },
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('LOGOUT_REQUEST', () => {
    it('should reset to the initial state of {}', () => {
      const initialState = { [USER_1]: { [deviceKey]: { illness: false } } };
      const tracked = mutationTracker.trackObj(initialState);
      expect(settingsStateByUser(initialState, {
        type: actionTypes.LOGOUT_REQUEST,
      })).to.deep.equal({});
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('MARK_SETTINGS_VIEWED', () => {
    it('should flip `touched` to true for the given user', () => {
      const initialState = { [USER_1]: {} };
      const tracked = mutationTracker.trackObj(initialState);
      expect(settingsStateByUser(initialState, {
        type: actionTypes.MARK_SETTINGS_VIEWED,
        payload: { userId: USER_1 },
      })).to.deep.equal({ [USER_1]: { touched: true } });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('TOGGLE_SETTINGS_SECTION', () => {
    it('should add a key that wasn\'t previously in state', () => {
      const initialState = { [USER_1]: { [deviceKey]: { illness: false } } };
      const tracked = mutationTracker.trackObj(initialState);
      expect(settingsStateByUser(initialState, {
        type: actionTypes.TOGGLE_SETTINGS_SECTION,
        payload: { userId: USER_1, deviceKey, scheduleOrProfileKey: scheduleKey },
      })).to.deep.equal({
        [USER_1]: { [deviceKey]: {
          illness: false,
          [scheduleKey]: true,
        } },
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should flip state for a key that was already in state', () => {
      const initialState = { [USER_1]: { [deviceKey]: { illness: false } } };
      const tracked = mutationTracker.trackObj(initialState);
      expect(settingsStateByUser(initialState, {
        type: actionTypes.TOGGLE_SETTINGS_SECTION,
        payload: { userId: USER_1, deviceKey, scheduleOrProfileKey: 'illness' },
      })).to.deep.equal({
        [USER_1]: { [deviceKey]: {
          illness: true,
        } },
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should add a subtree for a new device without wiping other devices', () => {
      const initialState = { [USER_1]: { [deviceKey]: { illness: false } } };
      const tracked = mutationTracker.trackObj(initialState);
      expect(settingsStateByUser(initialState, {
        type: actionTypes.TOGGLE_SETTINGS_SECTION,
        payload: { userId: USER_1, deviceKey: 'alphabet', scheduleOrProfileKey: scheduleKey },
      })).to.deep.equal({
        [USER_1]: { [deviceKey]: {
          illness: false,
        }, alphabet: {
          [scheduleKey]: true,
        } },
      });
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});
