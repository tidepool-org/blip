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

import { sentEmailVerification as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { sentEmailVerification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('sentEmailVerification', () => {
  describe('signupSuccess', () => {
    it('should set state to the email address of the user', () => {
      const initialStateForTest = false;
      const user = {
        emails: [
          'email@address.com',
        ],
      };

      const action = actions.sync.signupSuccess(user);

      const state = reducer(initialStateForTest, action);

      expect(state).to.equal('email@address.com');
    });
  });
});
