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

import mutationTracker from 'object-invariant-test-helper';

import { pendingReceivedClinicianInvites as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { pendingReceivedClinicianInvites as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('pendingReceivedClinicianInvites', () => {
  describe('fetchClinicianInvitesSuccess', () => {
    it('should set state to an array of pending invites', () => {
      let initialStateForTest = [];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let pendingReceivedClinicianInvites = [
        { key: 'xyz123zyx' },
        { key: 'abc987cba' }
      ];

      let action = actions.sync.fetchClinicianInvitesSuccess(pendingReceivedClinicianInvites);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(pendingReceivedClinicianInvites.length);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('acceptClinicianInviteSuccess', () => {
    it('should remove accepted membership from state array', () => {
      let initialStateForTest = [
        { key: 'xyz123zyx' },
        { key: 'abc987cba' }
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let membership = { key: 'abc987cba' };

      let action = actions.sync.acceptClinicianInviteSuccess(membership.key);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length - 1);
      expect(_.find(state, membership)).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('dismissClinicianInviteSuccess', () => {
    it('should remove rejected invite from state array', () => {
      let initialStateForTest = [
        { key: 'xyz123zyx', email: 'g@g.com' },
        { key: 'abc987cba', email: 'a@a.com' }
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let membership = { key: 'xyz123zyx' };

      let action = actions.sync.dismissClinicianInviteSuccess(membership.key);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length - 1);
      expect(_.find(state, membership)).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set to an empty array', () => {
      let initialStateForTest = [
        { key: 'xyz123zyx' },
        { key: 'abc987cba' }
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});
