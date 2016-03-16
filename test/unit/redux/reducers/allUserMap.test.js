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

import { allUsersMap as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { allUsersMap as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('allUsersMap', () => {
  describe('fetchUserSuccess', () => {
    it('should add user fetch to state without team attribute present', () => {
      let initialStateForTest = {};

      let user = {
        userid: 500,
        name: 'Jenny',
        team: [
          { userid: 400 }
        ]
      }

      let action = actions.sync.fetchUserSuccess(user)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);

      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
    });
  });

  describe('loginSuccess', () => {
    it('should add logged in user to state without team attribute present', () => {
      let initialStateForTest = {};

      let user = {
        userid: 500,
        name: 'Jenny',
        team: [
          { userid: 400 }
        ]
      }

      let action = actions.sync.loginSuccess(user)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);

      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
    });
  });

  describe('fetchPatient', () => {
    it('should add fetched patient to state when it does not currently exist in state', () => {
      let initialStateForTest = {};

      let user = {
        userid: 500,
        name: 'Jenny'
      }

      let action = actions.sync.fetchPatientSuccess(user)
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
    });

    it('should add fetched patient and its team members to state when they do not currently exist in state', () => {
      let initialStateForTest = {};

      let user = {
        userid: 500,
        name: 'Jenny',
        team: [
          { userid: 400, name: 'Frank' }
        ]
      };

      let action = actions.sync.fetchPatientSuccess(user)
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
      expect(state[user.team[0].userid].name).to.equal(user.team[0].name);
    });

    it('should merged fetched patient into state when it does not currently exist in state', () => {
      let initialStateForTest = {};

      let user = {
        userid: 500,
        name: 'Jenny',
        team: [
          { userid: 400, name: 'Frank' }
        ]
      };

      let action = actions.sync.fetchPatientSuccess(user)
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
      expect(state[user.team[0].userid].name).to.equal(user.team[0].name);
    });
  });

  describe('acceptTermsSuccess', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = {
        500: { userid: 500, name: 'Xavier' }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);

      let acceptedDate = new Date();

      let action = actions.sync.acceptTermsSuccess(500, acceptedDate)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(Object.keys(initialStateForTest).length);

      expect(state[500].termsAccepted).to.equal(acceptedDate);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('createPatientSuccess', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = {
        500:  {userid: 500 }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patient = { userid: 500, name: 'Xavier', profile: { foo: 'bar' } };

      let action = actions.sync.createPatientSuccess(500, patient)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[patient.userid].profile).to.equal(patient.profile);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('updateUserRequest', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = {
        505:  {userid: 505 }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patient = { userid: 505, name: 'Xavier', profile: { foo: 'sweet' }, permissions: { foo: 'bar'} };

      let action = actions.sync.updateUserRequest(505, patient)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[patient.userid].profile).to.equal(patient.profile);
      expect(state[patient.userid].permissions).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('updateUserSuccess', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = {
        500:  {userid: 500 }
      };
      
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patient = { userid: 500, name: 'Xavier', profile: { foo: 'bar' }, permissions: { foo: 'bar'} };

      let action = actions.sync.updateUserSuccess(500, patient)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);

      expect(state[patient.userid].profile).to.equal(patient.profile);
      expect(state[patient.userid].permissions).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('updateUserSuccess', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = {
        500:  {userid: 500 }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patient = { userid: 500, name: 'Xavier', profile: { foo: 'bar' }, permissions: { foo: 'bar'} };

      let action = actions.sync.updatePatientSuccess(patient)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);

      expect(state[patient.userid].profile).to.equal(patient.profile);
      expect(state[patient.userid].permissions).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = {
        500:  {userid: 500 }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.logoutRequest()

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});