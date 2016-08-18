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

import { permissionsOfMembersInTargetCareTeam as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { notification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('permissionsOfMembersInTargetCareTeam', () => {
  describe('setupDataStorageSuccess', () => {
    it('should set root perms for newly create target patient', () => {
      const userid = 'a1b2c3';
      const patient = {};

      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.setupDataStorageSuccess(userid, patient);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(Object.keys(state['a1b2c3']).length).to.equal(1);
      expect(state['a1b2c3'].root).to.exist;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchPatientSuccess', () => {
    it('should set state to a hash map representing the team of a patient', () => {
      let patient = {
        team: [
          { userid: 'a1b2c3', permissions: { view: {} } },
          { userid: 'd4e5f6', permissions: { view: {}, note: {} } }
        ]
      };

      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);
      
      let action = actions.sync.fetchPatientSuccess(patient);
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(Object.keys(state['a1b2c3']).length).to.equal(1);
      expect(state['a1b2c3'].view).to.exist;
      expect(state['a1b2c3'].note).not.to.exist;
      expect(Object.keys(state['d4e5f6']).length).to.equal(2);
      expect(state['d4e5f6'].view).to.exist;
      expect(state['d4e5f6'].note).to.exist;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('ditto, logged-in user already had perms on self set', () => {
      let patient = {
        team: [
          { userid: 'd4e5f6', permissions: { view: {}, note: {} } }
        ]
      };

      let initialStateForTest = {'a1b2c3': {root: {}}};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.fetchPatientSuccess(patient);
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(Object.keys(state['a1b2c3']).length).to.equal(1);
      expect(state['a1b2c3'].root).to.exist;
      expect(Object.keys(state['d4e5f6']).length).to.equal(2);
      expect(state['d4e5f6'].view).to.exist;
      expect(state['d4e5f6'].note).to.exist;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchUserSuccess', () => {
    describe('logged-in user ID is targetUserId', () => {
      it('should set the perms for the logged-in user on targetUserId/"self"', () => {
        const user = {
          userid: 'd4e5f6',
          permissions: {root: {}}
        };

        let initialStateForTest = {};
        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchUserSuccess(user);

        let state = reducer(initialStateForTest, action);

        expect(Object.keys(state).length).to.equal(1);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('logged-in user ID is NOT targetUserId', () => {
      it('should do nothing', () => {
        const user = {
          userid: 'd4e5f6'
        };

        let initialStateForTest = {};
        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchUserSuccess(user);

        let state = reducer(initialStateForTest, action);

        expect(Object.keys(state).length).to.equal(0);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('loginSuccess', () => {
    describe('logged-in user ID is targetUserId', () => {
      it('should set the perms for the logged-in user on targetUserId/"self"', () => {
        const user = {
          userid: 'd4e5f6',
          permissions: {root: {}}
        };

        let initialStateForTest = {};
        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.loginSuccess(user);

        let state = reducer(initialStateForTest, action);

        expect(Object.keys(state).length).to.equal(1);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('logged-in user ID is NOT targetUserId', () => {
      it('should do nothing', () => {
        const user = {
          userid: 'd4e5f6'
        };

        let initialStateForTest = {};
        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.loginSuccess(user);

        let state = reducer(initialStateForTest, action);

        expect(Object.keys(state).length).to.equal(0);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('removeMemberFromTargetCareTeamSuccess', () => {
    it('should remove member from hash map', () => {
      let patientId = 'a1b2c3';

      let initialStateForTest = {
        'a1b2c3': { foo: 'bar' },
        'd4e5f6': { a: 1 }
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);
      
      let action = actions.sync.removeMemberFromTargetCareTeamSuccess(patientId);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state['a1b2c3']).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to null', () => {
      let initialStateForTest = {
        'a1b2c3': { view: {}, note: {} },
        'd4e5f6': { view: {}, note: {} }
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);
      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});