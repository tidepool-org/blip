/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import { showingDonateBanner as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { showingDonateBanner as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('showingDonateBanner', () => {
  describe('showDonateBanner', () => {
    it('should set state to true', () => {
      let initialStateForTest = false;

      let action = actions.sync.showDonateBanner();

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.true;

      let nextState = reducer(null, action);

      expect(nextState).to.be.true;
    });
  });

  describe('hideDonateBanner', () => {
    it('should set state to null', () => {
      let initialStateForTest = true;

      let action = actions.sync.hideDonateBanner();

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.null;

      let nextState = reducer(null, action);

      expect(nextState).to.be.null;
    });
  });

  describe('dismissDonateBanner', () => {
    it('should set state to false', () => {
      let initialStateForTest = true;

      let action = actions.sync.dismissDonateBanner();

      let intermediate = reducer(initialStateForTest, action);

      expect(intermediate).to.be.false;

      let nextState = reducer(null, action);

      expect(nextState).to.be.false;
    });
  });
});
