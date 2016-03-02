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

import { bgPrefs as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { notification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('bgPrefs', () => {
  describe('setBloodGlucosePreferences', () => {
    it('should set state to new bg prefs', () => {
      let initialStateForTest = null;

      let bgPrefs = {
        units: 'mmol/g'
      };

      let action = actions.sync.setBloodGlucosePreferences(bgPrefs)
      let state = reducer(initialStateForTest, action);

      expect(state.units).to.equal(bgPrefs.units);
    });

    it('should change state to new bg prefs', () => {
      let initialStateForTest = {
        units: 'mmol/g'
      };

      let bgPrefs = {
        units: 'mg'
      };

      let action = actions.sync.setBloodGlucosePreferences(bgPrefs)
      let state = reducer(initialStateForTest, action);

      expect(state.units).to.equal(bgPrefs.units);
    });
  });
});