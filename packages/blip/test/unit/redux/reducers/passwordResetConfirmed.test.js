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

import { passwordResetConfirmed as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { passwordResetConfirmed as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('passwordResetConfirmed', () => {
  describe('confirmPasswordResetSuccess', () => {
    it('should set state to true', () => {
      let initialStateForTest = false;

      let action = actions.sync.confirmPasswordResetSuccess();

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.true;
    });
  });
});
