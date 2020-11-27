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

import { targetUserId as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { targetUserId as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('targetUserId', () => {
  describe('fetchUserSuccess', () => {
    it('should set state to user', () => {
      let initialStateForTest = null;
      let user = { userid: 203, profile: { patient: true } };

      let action = actions.sync.fetchUserSuccess(user);

      let state = reducer(initialStateForTest, action);

      expect(state).to.equal(user.userid);
    });

    it('should clear state if fetched user does not have patient object', () => {
      let initialStateForTest = 'a1b2c3';
      let user = { userid: 'd4e5f6', profile: null };

      let action = actions.sync.fetchUserSuccess(user);

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });

  describe('loginSuccess', () => {
    it('should set state to user', () => {
      let initialStateForTest = null;
      let user = { userid: 203, profile: { patient: true } };

      let action = actions.sync.loginSuccess(user);

      let state = reducer(initialStateForTest, action);

      expect(state).to.equal(user.userid);
    });

    it('should clear state if logged in user does not have patient object', () => {
      let initialStateForTest = 'a1b2c3';
      let user = { userid: 'd4e5f6', profile: null };

      let action = actions.sync.fetchUserSuccess(user);

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });

  describe('setupDataStorageSuccess', () => {
    it('should set state to newly created patient', () => {
      let initialStateForTest = null;
      const userid = 'a1b2c3';
      const patient = {
        profile: {
          fullName: 'Jane Doe',
          patient: {birthday: '1980-01-01', diagnosisDate: '1999-12-31'}
        },
        team: [],
        userid
      };

      let action = actions.sync.setupDataStorageSuccess(userid, patient);

      let state = reducer(initialStateForTest, action);

      expect(state).to.equal(userid);
    });
  });

  describe('logoutRequest', () => {
    it('should set state to null', () => {
      let user = { userid: 'a1b2c3', profile: { patient: true } };
      let initialStateForTest = user.userid;
      
      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });
});
