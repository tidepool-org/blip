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

import { patientsMap as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { patientsMap as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('patientsMap', () => {
  describe('fetchPatientsSuccess', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = null;

      let patients = [
        { userid: 50, name: 'Xavier' },
        { userid: 100, name: 'Fred' }
      ];

      let action = actions.sync.fetchPatientsSuccess(patients)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(patients.length);

      expect(state[patients[0].userid].name).to.equal(patients[0].name);
    });
  });

  describe('acceptReceivedInviteSuccess', () => {
    it('should set add acceptedReceivedInvite patient to patientsMap state', () => {
      let initialStateForTest = {
        50 :{ userid: 50, name: 'Xavier' },
        100: { userid: 100, name: 'Fred' }
      };

      let name = 'Zoe';
      let userid = 200;
      let acceptedReceivedInvite = {
        creator: { userid: userid, name: name }
      };

      let action = actions.sync.acceptReceivedInviteSuccess(acceptedReceivedInvite)

      expect(Object.keys(initialStateForTest).length).to.equal(2);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(3);
      expect(state[userid].name).to.equal(name);
    });
  });

  describe('logoutSuccess', () => {
    it('should set state to a hash map of patients', () => {
      let initialStateForTest = {
        50 :{ userid: 50, name: 'Xavier' },
        100: { userid: 100, name: 'Fred' }
      };

      let action = actions.sync.logoutSuccess()
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(0);
    });
  });
});