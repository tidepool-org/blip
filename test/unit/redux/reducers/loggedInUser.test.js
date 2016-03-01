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

import { loggedInUser as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { notification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('loggedInUser', () => {
  describe('fetchUserSuccess', () => {
    it('should set state to user', () => {
      let initialStateForTest = null;
      let name = 'Abbie Roads';
      let user = { name : name };

      let action = actions.sync.fetchUserSuccess(user)

      let state = reducer(initialStateForTest, action);

      expect(state.name).to.equal(name);
    });
  });

  describe('loginSuccess', () => {
    it('should set state to user', () => {
      let initialStateForTest = null;
      let name = 'Jamie Foxx';
      let user = { name : name };

      let action = actions.sync.loginSuccess(user)

      let state = reducer(initialStateForTest, action);

      expect(state.name).to.equal(name);
    });
  });

  describe('acceptTermsSuccess', () => {
    it('should set state.termsAccepted to acceptedDate', () => {
      let name = 'Jamie Foxx';
      let user = { name : name };
      let acceptedDate = '2016-01-01';
      let initialStateForTest = user;
      

      let action = actions.sync.acceptTermsSuccess(acceptedDate)

      let state = reducer(initialStateForTest, action);

      expect(state.termsAccepted).to.equal(acceptedDate);
    });
  });

  describe('createPatientSuccess', () => {
    it('should set state.profile to patient.profile', () => {
      let profile = { name: 'Frank', diagnosisDate: '02/04/1996' };
      let patient = { profile };
      let user = { id: 500 };
      let initialStateForTest = user;
      

      let action = actions.sync.createPatientSuccess(patient)

      let state = reducer(initialStateForTest, action);

      expect(state.profile.name).to.equal(profile.name);
      expect(state.profile.diagnosisDate).to.equal(profile.diagnosisDate);
    });
  });

  describe('updateUserRequest', () => {
    it('should set state to updatingUser', () => {
      let name = 'Jamie Foxx';
      let user = { name : name };
      let initialStateForTest = user;
      let updatingUser = { diagnosisDate: '01/01/2001' };


      let action = actions.sync.updateUserRequest(updatingUser);

      expect(initialStateForTest.name).to.equal(name);

      let state = reducer(initialStateForTest, action);

      expect(state.name).to.equal(name);
      expect(state.diagnosisDate).to.equal(updatingUser.diagnosisDate);
    });
  });

  describe('updateUserSuccess', () => {
    it('should set state to updatedUser', () => {
      let name = 'Jamie Foxx';
      let user = { name : name };
      let initialStateForTest = user;
      let updatedUser = { name: name, diagnosisDate: '01/01/2001' };


      let action = actions.sync.updateUserSuccess(updatedUser);

      expect(initialStateForTest.name).to.equal(name);

      let state = reducer(initialStateForTest, action);

      expect(state.name).to.equal(name);
      expect(state.diagnosisDate).to.equal(updatedUser.diagnosisDate);
    });
  });

  describe('logoutSuccess', () => {
    it('should set state to null', () => {
      let name = 'Jamie Foxx';
      let user = { name : name };
      let initialStateForTest = user;
      

      let action = actions.sync.logoutSuccess()

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });
});