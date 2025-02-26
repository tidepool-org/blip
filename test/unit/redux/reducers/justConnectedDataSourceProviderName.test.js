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

import { justConnectedDataSourceProviderName as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('justConnectedDataSourceProviderName', () => {
  describe('selectClinic', () => {
    it('should set state to providerName', () => {
      let initialStateForTest = null;

      let action = actions.sync.setJustConnectedDataSourceProviderName('providerName123');

      let state = reducer(initialStateForTest, action);

      expect(state).to.equal('providerName123');
    });
  });

  describe('clearPatientInView', () => {
    it('should set state to null', () => {
      let initialStateForTest = 'providerName123';

      let action = actions.sync.clearPatientInView();

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to null', () => {
      let initialStateForTest = 'providerName123';

      let action = actions.sync.logoutRequest();

      let state = reducer(initialStateForTest, action);

      expect(state).to.be.null;
    });
  });
});
