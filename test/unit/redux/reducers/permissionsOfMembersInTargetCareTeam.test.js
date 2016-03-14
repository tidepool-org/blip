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

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { notification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('permissionsOfMembersInTargetCareTeam', () => {
  describe('fetchPatientSuccess', () => {
    it('should set state to a hash map representing the team of a patient', () => {
      let patient = {
        team: [
          { userid: 3434, permissions: { view: {} } },
          { userid: 250, permissions: { view: {}, notes: {} } }
        ]
      }

      let initialStateForTest = {};
      
      let action = actions.sync.fetchPatientSuccess(patient)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(Object.keys(state[3434]).length).to.equal(1);
      expect(Object.keys(state[250]).length).to.equal(2);
    });
  });

  describe('logoutSuccess', () => {
    it('should set state to null', () => {
      let initialStateForTest = {
        3434: { view: {}, notes: {} },
        250: { view: {}, notes: {} }
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);
      let action = actions.sync.logoutSuccess()

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});