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

import * as actions from '../../../../app/redux/actions/index';

import { patientNotesMap as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('patientNotesMap', () => {
  describe('fetchPatientDataSuccess', () => {
    it('should set state to a hash map of patientNotes', () => {
      let initialStateForTest = {};
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patientId = 'a1b2c3';
      let patientNotes = [
        { message: 'Hello there' },
        { message: 'This is fun!' }
      ];

      let action = actions.sync.fetchPatientDataSuccess(patientId, null, patientNotes);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[patientId].length).to.equal(patientNotes.length);
      expect(state[patientId]).to.deep.equal(patientNotes);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should add new notes to state', () => {
      const patientId = 'a1b2c3';
      const existingPatientNotes = [
        { message: 'Hello there' },
        { message: 'This is fun!' },
      ];

      const initialStateForTest = {
        [patientId]: existingPatientNotes,
      };

      const newPatientNotes = [
        { message: 'Hi Again!' },
      ];

      const tracked = mutationTracker.trackObj(initialStateForTest);
      const action = actions.sync.fetchPatientDataSuccess(patientId, null, newPatientNotes);

      const state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[patientId].length).to.equal(3);
      expect(state[patientId]).to.deep.equal([
        ...existingPatientNotes,
        ...newPatientNotes,
      ]);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('clearPatientData', () => {
    it('should set clear key in state', () => {
      let initialStateForTest = {
        a1b2c3: [
          { message: 'Hello there' },
          { message: 'This is fun!' }
        ],
        d4e5f6: [
          { message: 'Awesome sauce!' }
        ]
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patientId = 'd4e5f6';

      let action = actions.sync.clearPatientData(patientId);

      expect(Object.keys(initialStateForTest).length).to.equal(2);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(2);
      expect(state[patientId]).to.be.null;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchPatientDataFailure', () => {
    it('should set state to empty hash map', () => {
      let initialStateForTest = {
        a1b2c3: [
          { message: 'Hello there' },
          { message: 'This is fun!' }
        ],
        d4e5f6: [
          { message: 'Awesome sauce!' }
        ]
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.fetchPatientDataFailure();
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(0);
      expect(state).to.deep.equal({});
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('addPatientNote', () => {
    it('should add a new note to the hash map', () => {
      const patientId = 'a1b2c3';
      const existingPatientNotes = [
        { message: 'Hello there' },
        { message: 'This is fun!' },
      ];

      const initialStateForTest = {
        [patientId]: existingPatientNotes,
      };
      const tracked = mutationTracker.trackObj(initialStateForTest);

      const newPatientNote = {
        message: 'Hi Again!',
        groupid: patientId,
      };

      const action = actions.sync.addPatientNote(newPatientNote);
      const state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[patientId].length).to.equal(3);
      expect(state[patientId]).to.deep.equal([
        ...existingPatientNotes,
        newPatientNote,
      ]);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('updatePatientNote', () => {
    it('should update a note in the hash map', () => {
      const patientId = 'a1b2c3';
      const existingPatientNotes = [
        { message: 'Hello there', id: 1 },
        { message: 'This is fun!', id: 2 },
      ];

      const initialStateForTest = {
        [patientId]: existingPatientNotes,
      };
      const tracked = mutationTracker.trackObj(initialStateForTest);

      const updatedPatientNote = {
        message: 'This is great!',
        groupid: patientId,
        id: 2,
      };

      const action = actions.sync.updatePatientNote(updatedPatientNote);
      const state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(1);
      expect(state[patientId].length).to.equal(2);
      expect(state[patientId]).to.deep.equal([
        existingPatientNotes[0],
        updatedPatientNote,
      ]);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('logoutRequest', () => {
    it('should set state to empty hash map', () => {
      let initialStateForTest = {
        a1b2c3: [
          { message: 'Hello there' },
          { message: 'This is fun!' }
        ],
        d4e5f6: [
          { message: 'Awesome sauce!' }
        ]
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.logoutRequest();
      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(0);
      expect(state).to.deep.equal({});
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});
