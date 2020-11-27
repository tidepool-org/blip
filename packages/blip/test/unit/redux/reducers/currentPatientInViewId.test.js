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

import { currentPatientInViewId as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { currentPatientInViewId as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('currentPatientInViewId', () => {
  describe('setupDataStorageSuccess', () => {
    it('should set state to created patient', () => {
      let initialStateForTest = null;
      let userId = 'a1b2c3';
      let patient = { userid: userId, name: 'Jess' };

      let action = actions.sync.setupDataStorageSuccess(userId, patient);

      let state = reducer(initialStateForTest, action);
      
      expect(state).to.equal(userId);
    });
  });

  describe('fetchPatientSuccess', () => {
    it('should set state to fetched patient', () => {
      let initialStateForTest = null;
      let patient = { userid: 'a1b2c3', name: 'Jess' };

      let action = actions.sync.fetchPatientSuccess(patient);

      let state = reducer(initialStateForTest, action);

      expect(state).to.equal(patient.userid);
    });
  });

  describe('updatePatientSuccess', () => {
    it('should set state to fetched patient', () => {
      let initialStateForTest = 'a1b2c3';
      let updatedPatient = { userid: 'd4e5f6', name: 'Jessica', diagnosisDate: '01/01/2013' };
      
      let action = actions.sync.updatePatientSuccess(updatedPatient);
      let state = reducer(initialStateForTest, action);

      expect(state).to.equal(updatedPatient.userid);
    });
  });

  describe('logoutRequest', () => {
    it('should set state to null', () => {
      let initialStateForTest = 'a1b2c3';

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });

  describe('clearPatientInView', () => {
    it('should set state to null', () => {
      let initialStateForTest = 'a1b2c3';

      let action = actions.sync.clearPatientInView();

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });
});
