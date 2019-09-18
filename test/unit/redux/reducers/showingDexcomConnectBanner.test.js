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

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { showingDexcomConnectBanner as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { showingDexcomConnectBanner as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('showingDexcomConnectBanner', () => {
  describe('showBanner', () => {
    it('should set state to true', () => {
      let initialStateForTest = null;

      let action = actions.sync.showBanner('dexcom');

      let nextState = reducer(initialStateForTest, action);

      expect(nextState).to.be.true;
    });

    it('should not set state to true if banner was already dismissed', () => {
      let initialStateForTest = false; // signifies dismissal, as opposed to null, which is the default state

      let action = actions.sync.showBanner('dexcom');

      let nextState = reducer(initialStateForTest, action);

      expect(nextState).to.be.false;
    });
  });

  describe('hideBanner', () => {
    it('should set state to null, but only if type matches', () => {
      let initialStateForTest = true;

      let typeMismatchAction = actions.sync.hideBanner('donate');
      let action = actions.sync.hideBanner('dexcom');

      let intermediate = reducer(initialStateForTest, typeMismatchAction);

      expect(intermediate).to.be.true;

      let nextState = reducer(initialStateForTest, action);

      expect(nextState).to.be.null;
    });
  });

  describe('logoutReqest', () => {
    it('should set state to null', () => {
      let initialStateForTest = true;

      let action = actions.sync.logoutRequest();

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.null;

      let nextState = reducer(null, action);

      expect(nextState).to.be.null;
    });
  });

  describe('dismissBanner', () => {
    it('should set state to false', () => {
      let initialStateForTest = true;

      let action = actions.sync.dismissBanner('dexcom');

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.false;

      let nextState = reducer(null, action);

      expect(nextState).to.be.false;
    });
  });

  describe('fetchUserSuccess', () => {
    it('should set state to false if user clicked the banner', () => {
      let initialStateForTest = true;

      const user = {
        preferences: {
          clickedDexcomConnectBannerTime: 'today',
        },
      };

      let action = actions.sync.fetchUserSuccess(user);

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.false;

      let nextState = reducer(null, action);

      expect(nextState).to.be.false;
    });

    it('should set state to false if user dismissed the banner', () => {
      let initialStateForTest = true;

      const user = {
        preferences: {
          dismissedDexcomConnectBannerTime: 'today',
        },
      };

      let action = actions.sync.fetchUserSuccess(user);

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.false;

      let nextState = reducer(null, action);

      expect(nextState).to.be.false;
    });
  });
});
