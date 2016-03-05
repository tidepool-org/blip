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

import { membersOfTargetCareTeam as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { notification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('membersOfTargetCareTeam', () => {
  describe('fetchPatientSuccess', () => {
    it('should set state to user', () => {
      let initialStateForTest = null;
      let patient = {
        name: 'Frank Jones',
        team: [
          { userid: 200 },
          { userid: 400 },
          { userid: 567 }
        ]
      };

      let action = actions.sync.fetchPatientSuccess(patient)
      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(3);
      expect(state[0]).to.equal(patient.team[0].userid);
      expect(state[1]).to.equal(patient.team[1].userid);
      expect(state[2]).to.equal(patient.team[2].userid);
    });
  });

  describe('logoutSuccess', () => {
    it('should set state to null', () => {
      let initialStateForTest = [1, 2 ,3];
      
      let action = actions.sync.logoutSuccess()

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
    });
  });
});