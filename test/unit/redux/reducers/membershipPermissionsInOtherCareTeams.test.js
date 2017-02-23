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

import { membershipPermissionsInOtherCareTeams as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { membershipPermissionsInOtherCareTeams as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('membershipPermissionsInOtherCareTeams', () => {
  describe('acceptReceivedInviteSuccess', () => {
    it('should add membership to the hash map', () => {
      let acceptedReceivedInvite = {
        creatorId: 'a1b2c3',
        context: {
          view: {},
          note: {}
        }
      };

      let initialStateForTest = {};

      let tracked = mutationTracker.trackObj(initialStateForTest);
      
      let action = actions.sync.acceptReceivedInviteSuccess(acceptedReceivedInvite);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(Object.keys(state.a1b2c3).length).to.equal(2);
      expect(state.a1b2c3.view).to.exist;
      expect(state.a1b2c3.note).to.exist;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchPatientSuccess', () => {
    it('should set the permissions of logged-in user wrt patient', () => {
      const patient = {
        userid: 'a1b2c3',
        permissions: {
          custodian: {},
          view: {},
          upload: {},
        },
      };

      const initialStateForTest = {};

      const tracked = mutationTracker.trackObj(initialStateForTest);
      const action = actions.sync.fetchPatientSuccess(patient);

      const state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(Object.keys(state.a1b2c3).length).to.equal(3);
      expect(state.a1b2c3.custodian).to.exist;
      expect(state.a1b2c3.view).to.exist;
      expect(state.a1b2c3.upload).to.exist;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchPatientsSuccess', () => {
    it('should set state to a hash map of permissions in other care teams', () => {
      let patients = [
        { userid: 'a1b2c3', permissions: { view: {} } },
        { userid: 'd4e5f6', permissions: { view: {}, note: {} } }
      ];

      let initialStateForTest = {};

      let tracked = mutationTracker.trackObj(initialStateForTest);
      
      let action = actions.sync.fetchPatientsSuccess(patients);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(Object.keys(state.a1b2c3).length).to.equal(1);
      expect(state.a1b2c3.view).to.exist;
      expect(state.a1b2c3.note).to.not.exist;
      expect(Object.keys(state.d4e5f6).length).to.equal(2);
      expect(state.d4e5f6.view).to.exist;
      expect(state.d4e5f6.note).to.exist;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('removeMembershipInOtherCareTeamSuccess', () => {
    it('should remove membership from hash map', () => {
      let patientId = 'a1b2c3';

      let initialStateForTest = {
        a1b2c3: { foo: 'bar' },
        d4e5f6: { a: 1 },
        x1y2z3: { a: 1 }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);
      
      let action = actions.sync.removeMembershipInOtherCareTeamSuccess(patientId);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(state.a1b2c3).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to empty object', () => {
      let initialStateForTest = {
        a1b2c3: { view: {}, note: {} },
        d4e5f6: { view: {}, note: {} }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);
      
      let action = actions.sync.logoutRequest()

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(0);
      expect(state).to.deep.equal({});
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});
