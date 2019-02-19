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

import mutationTracker from 'object-invariant-test-helper';

import { dataDonationAccounts as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { dataDonationAccounts as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('dataDonationAccounts', () => {
  describe('fetchDataDonationAccountsSuccess', () => {
    it('should set state to an array of confirmed data donation accounts', () => {
      let initialStateForTest = [];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let dataDonationAccounts = [
        { email: 'bigdata@tidepool.org', status: 'confirmed' },
        { email: 'bigdata+NSF@tidepool.org', status: 'confirmed' },
      ];

      let action = actions.sync.fetchDataDonationAccountsSuccess(dataDonationAccounts);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(dataDonationAccounts.length);
      expect(state[0].status).to.equal('confirmed');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should filter out any duplicate values', () => {
      let initialStateForTest = [];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let dataDonationAccounts = [
        { email: 'bigdata@tidepool.org' },
        { email: 'bigdata@tidepool.org' },
        { email: 'bigdata+NSF@tidepool.org' },
        { email: 'bigdata+NSF@tidepool.org' },
      ];

      let action = actions.sync.fetchDataDonationAccountsSuccess(dataDonationAccounts);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(2);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchPendingSentInvitesSuccess', () => {
    it('should push any pending data donation account invites to state', () => {
      let initialStateForTest = [];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let pendingSentInvites = [
        { email: 'jill.jellyfish@gmail.com' },
        { email: 'bigdata@tidepool.org' },
        { email: 'bigdata+NSF@tidepool.org' },
      ];

      let action = actions.sync.fetchPendingSentInvitesSuccess(pendingSentInvites);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(2);
      expect(state[0].status).to.equal('pending');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('cancelSentInviteSuccess', () => {
    it('should remove data donation account invitation from state array', () => {
      let initialStateForTest = [
        { email: 'bigdata+NSF@tidepool.org', status: 'pending' },
        { email: 'bigdata@tidepool.org', status: 'pending' },
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let removedEmail = 'bigdata+NSF@tidepool.org';

      let action = actions.sync.cancelSentInviteSuccess(removedEmail);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length - 1);
      expect(_.find(state, {email: removedEmail})).to.be.undefined;
      expect(state[0].email).to.equal('bigdata@tidepool.org');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('removeMemberFromTargetCareTeamSuccess', () => {
    it('should remove data donation account invitation from state array', () => {
      let initialStateForTest = [
        { userid: '123abc456', email: 'bigdata+NSF@tidepool.org', status: 'confirmed' },
        { userid: '456abc123', email: 'bigdata@tidepool.org', status: 'confirmed' },
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let removedMemberId = '123abc456';

      let action = actions.sync.removeMemberFromTargetCareTeamSuccess(removedMemberId);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(initialStateForTest.length - 1);
      expect(_.find(state, {id: removedMemberId})).to.be.undefined;
      expect(state[0].userid).to.equal('456abc123');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to empty array', () => {
      let initialStateForTest = [
        { email: 'bigdata+NSF@tidepool.org', status: 'pending' },
        { email: 'bigdata@tidepool.org', status: 'confirmed' },
      ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});
