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

import { memberInOtherCareTeams as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { notification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('memberInOtherCareTeams', () => {
  describe('fetchPatientsSuccess', () => {
    it('should set state to list of ids', () => {
      let initialStateForTest = null;
      let patients = [
        { userid: 111, name: 'Frank Jones' },
        { userid: 112, name: 'Jenny Jones' },
      ]

      let action = actions.sync.fetchPatientsSuccess(patients)
      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(2);
      expect(state[0]).to.equal(patients[0].userid);
      expect(state[1]).to.equal(patients[1].userid);
    });
  });

  describe('logoutRequest', () => {
    it('should set state to null', () => {
      let initialStateForTest = [1, 2 ,3];
      
      let action = actions.sync.logoutRequest()

      let state = reducer(initialStateForTest, action);

      expect(state.length).to.equal(0);
    });
  });
});