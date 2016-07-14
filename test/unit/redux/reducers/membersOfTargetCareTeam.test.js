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

import { membersOfTargetCareTeam as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { membersOfTargetCareTeam as initialState } from '../../../../app/redux/reducers/initialState';
let tracked = mutationTracker.trackObj(initialState);

var expect = chai.expect;

describe('membersOfTargetCareTeam', () => {
  describe('fetchPatientSuccess', () => {
    it('should populate an array of members ids from user\'s team', () => {
      let patient = {
        name: 'Frank Jones',
        team: [
          { userid: 'a1b2c3' },
          { userid: 'd4e5f6' },
          { userid: 'x1y2z3' }
        ]
      };

      let action = actions.sync.fetchPatientSuccess(patient);
      let state = reducer(initialState, action);

      expect(state.length).to.equal(3);
      expect(state[0]).to.equal(patient.team[0].userid);
      expect(state[1]).to.equal(patient.team[1].userid);
      expect(state[2]).to.equal(patient.team[2].userid);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('removeMemberFromTargetCareTeamSuccess', () => {
    it('should remove member from array', () => {
      let patientId = 'x1y2z3';

      let initialStateForTest = [ 'a1b2c3', 'd4e5f6', 'x1y2z3' ];
      let tracked = mutationTracker.trackObj(initialStateForTest);
      
      let action = actions.sync.removeMemberFromTargetCareTeamSuccess(patientId);

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(2);
      expect(state[2]).to.be.undefined;
      expect(_.includes(state, patientId)).to.be.false;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to an empty array', () => {
      let initialStateForTest = [ 'a1b2c3', 'd4e5f6', 'x1y2z3' ];
      let tracked = mutationTracker.trackObj(initialStateForTest);
      
      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});
