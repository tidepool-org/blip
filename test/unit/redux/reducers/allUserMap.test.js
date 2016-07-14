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

import * as actions from '../../../../app/redux/actions/index';

import { allUsersMap as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('allUsersMap', () => {
  describe('fetchUserSuccess', () => {
    it('should add fetched user to state without team or permissions attributes present', () => {
      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let user = {
        userid: 'a1b2c3',
        name: 'Jenny',
        permissions: {
          a1b2c3: { root: {} }
        },
        team: [
          { userid: 'd4e5f6' }
        ]
      };

      let action = actions.sync.fetchUserSuccess(user);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);

      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('loginSuccess', () => {
    it('should add logged in user to state without team or permissions attributes present', () => {
      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let user = {
        userid: 'a1b2c3',
        name: 'Jenny',
        permissions: {
          a1b2c3: { root: {} }
        },
        team: [
          { userid: 'd4e5f6' }
        ]
      };

      let action = actions.sync.loginSuccess(user);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);

      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchPatientSuccess', () => {
    it('should add fetched patient to state when it does not currently exist in state', () => {
      let initialStateForTest = {};

      let user = {
        userid: 500,
        name: 'Jenny'
      };

      let action = actions.sync.fetchPatientSuccess(user);
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
    });

    it('should merged fetched patient & team into state when it does not currently exist in state', () => {
      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let user = {
        userid: 'a1b2c3',
        name: 'Jenny',
        team: [
          { userid: 'd4e5f6', name: 'Frank' }
        ]
      };

      let action = actions.sync.fetchPatientSuccess(user)
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(state[user.userid].name).to.equal(user.name);
      expect(state[user.userid].team).to.be.undefined;
      expect(state[user.team[0].userid].name).to.equal(user.team[0].name);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchPatientsSuccess', () => {
    it('should add fetched patients to state when they do not currently exist in state', () => {
      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patients = [
        {userid: 'a1b2c3'},
        {userid: 'd4e5f6'}
      ];

      let action = actions.sync.fetchPatientsSuccess(patients);
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(state[patients[0].userid]).to.exist;
      expect(state[patients[1].userid]).to.exist;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('acceptReceivedInviteSuccess', () => {
    it('should add the invite creator when it does not currently exist in state', () => {
      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let acceptedReceivedInvite = {
        key: 'xyz987zyx',
        creator: {
          userid: 'a1b2c3',
          profile: {fullName: 'Jenny'}
        }
      };

      let action = actions.sync.acceptReceivedInviteSuccess(acceptedReceivedInvite);
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[acceptedReceivedInvite.creator.userid]).to.exist;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('acceptTermsSuccess', () => {
    it('should update the termsAccepted date for the user', () => {
      let initialStateForTest = {
        a1b2c3: { userid: 'a1b2c3', name: 'Xavier', termsAccepted: '' }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);

      let acceptedDate = new Date();

      let action = actions.sync.acceptTermsSuccess('a1b2c3', acceptedDate);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(Object.keys(initialStateForTest).length);
      expect(state['a1b2c3'].termsAccepted).to.equal(acceptedDate);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('setupDataStorageSuccess', () => {
    it('should update the profile with patient info for the user', () => {
      let initialStateForTest = {
        a1b2c3:  { userid: 'a1b2c3' }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patient = { userid: 'a1b2c3', name: 'Xavier', profile: { foo: 'bar' } };

      let action = actions.sync.setupDataStorageSuccess('a1b2c3', patient)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[patient.userid].profile).to.equal(patient.profile);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('updateUserSuccess', () => {
    it('should update the user', () => {
      let initialStateForTest = {
        a1b2c3:  { userid: 'a1b2c3' }
      };
      
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let user = { userid: 'a1b2c3', name: 'Xavier', profile: { foo: 'bar' } };

      let action = actions.sync.updateUserSuccess('a1b2c3', user)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);

      expect(state[user.userid].profile).to.equal(user.profile);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('updatePatientSuccess', () => {
    it('should update the patient info for the user, excluding permissions and team', () => {
      let initialStateForTest = {
        a1b2c3:  { userid: 'a1b2c3' }
      };

      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patient = { userid: 'a1b2c3', name: 'Xavier', profile: { patient: { birthday: '1980-01-01'} }, permissions: 'all', team: [] };

      let action = actions.sync.updatePatientSuccess(patient);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);

      expect(state[patient.userid].profile).to.equal(patient.profile);
      expect(state[patient.userid].permissions).to.be.undefined;
      expect(state[patient.userid].team).to.be.undefined;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = {
        a1b2c3:  {userid: 'a1b2c3' }
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