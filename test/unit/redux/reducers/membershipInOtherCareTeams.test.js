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

import { membershipInOtherCareTeams as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { membershipInOtherCareTeams as initialState } from '../../../../app/redux/reducers/initialState';
let tracked = mutationTracker.trackObj(initialState);

var expect = chai.expect;

describe('memberInOtherCareTeams', () => {
  describe('fetchAssociatedAccountsSuccess', () => {
    it('should populate an array of patient ids', () => {
      let accounts = {
        patients: [
          { userid: 'a1b2c3', name: 'Frank Jones' },
          { userid: 'd4e5f6', name: 'Jenny Jones' },
        ],
      };

      let action = actions.sync.fetchAssociatedAccountsSuccess(accounts);
      let state = reducer(initialState, action);

      expect(state.length).to.equal(2);
      expect(state[0]).to.equal(accounts.patients[0].userid);
      expect(state[1]).to.equal(accounts.patients[1].userid);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('removeMembershipInOtherCareTeamSuccess', () => {
    it('should remove member from hash map', () => {
      let patientId = 'x1y2z3';

      let initialStateForTest = [ 'a1b2c3', 'd4e5f6', 'x1y2z3' ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.removeMembershipInOtherCareTeamSuccess(patientId);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(2);
      expect(state[2]).to.be.undefined;
      expect(_.includes(state, patientId)).to.be.false;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('createVCACustodialAccountSuccess', () => {
    it('should add the new account ID', () => {
      let patientId = 'x1y2z3';

      let initialStateForTest = [ 'a1b2c3', 'd4e5f6' ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.createVCACustodialAccountSuccess(patientId);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(3);
      expect(_.includes(state, patientId)).to.be.true;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to null', () => {
      let initialStateForTest = [ 'a1b2c3', 'd4e5f6', 'x1y2z3' ];
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});
