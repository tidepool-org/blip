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

import { patientNotesMap as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { patientNotesMap as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('patientNotesMap', () => {
  describe('fetchPatientDataSuccess', () => {
    it('should set state to a hash map of patientNotes', () => {
      let initialStateForTest = {};

      let patientId = 505;
      let patientNotes = [
        { message: 'Hello there' },
        { message: 'This is fun!' }
      ];

      let action = actions.sync.fetchPatientDataSuccess(patientId, null, patientNotes)

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[patientId].length).to.equal(patientNotes.length);
    });
  });


  describe('clearPatientData', () => {
    it('should set clear key in state', () => {
      let initialStateForTest = {
        50 : [
          { message: 'Hello there' },
          { message: 'This is fun!' }
        ],
        100: [
          { message: 'Awesome sauce!' }
        ]
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patientId = 100;

      let action = actions.sync.clearPatientData(patientId)

      expect(Object.keys(initialStateForTest).length).to.equal(2);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(state[patientId]).to.be.null;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutSuccess', () => {
    it('should set state to empty hash map', () => {
      let initialStateForTest = {
        50 : [
          { message: 'Hello there' },
          { message: 'This is fun!' }
        ],
        100: [
          { message: 'Awesome sauce!' }
        ]
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.logoutSuccess()
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(0);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});