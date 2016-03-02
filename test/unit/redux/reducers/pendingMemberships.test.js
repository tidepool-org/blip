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

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { pendingMemberships as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { pendingMemberships as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('pendingMemberships', () => {
  describe('fetchPendingMembershipsSuccess', () => {
    it('should set state to an array of pendingMemberships', () => {
      let initialStateForTest = [];

      let pendingMemberships = [
        { key: 30 },
        { key: 50 }
      ];

      let action = actions.sync.fetchPendingMembershipsSuccess(pendingMemberships)

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(pendingMemberships.length);
    });
  });

  describe('acceptMembershipSuccess', () => {
    it('should remove accepted membership to state', () => {
      let initialStateForTest = [
        { key: 30 },
        { key: 50 }
      ];

      let membership = { key: 50 };

      let action = actions.sync.acceptMembershipSuccess(membership)

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length - 1);
    });
  });

  describe('dismissMembershipSuccess', () => {
    it('should remove invitation from state array', () => {
      let initialStateForTest = [
        { key: 30, email: 'g@g.com' },
        { key: 50, email: 'a@a.com' }
      ];

      let membership = { key: 30 };

      let action = actions.sync.dismissMembershipSuccess(membership)

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length - 1);
    });
  });

  describe('logoutSuccess', () => {
    it('should remove invitation from state array', () => {
      let initialStateForTest = [
        { key: 30 },
        { key: 50 }
      ];

      let action = actions.sync.logoutSuccess()

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
    });
  });
});