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

import { patientDataMap as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

import { patientDataMap as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('patientDataMap', () => {
  describe('fetchPatientDataSuccess', () => {
    it('should set state to a hash map of patientData sorted by time in descending order', () => {
      const initialStateForTest = {};
      const tracked = mutationTracker.trackObj(initialStateForTest);

      const patientId = 'a1b2c3';
      const patientData = [
        { value: 100, time: '2018-01-01:00:00:00.000Z' },
        { value: 20 , time: '2018-01-02:00:00:00.000Z' },
      ];

      const fetchedUntil = '2017-11-27:00:00:00.000Z';

      const action = actions.sync.fetchPatientDataSuccess(patientId, patientData, [], fetchedUntil);

      const state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(3);
      expect(state[patientId]).to.be.an('array');
      expect(state[`${patientId}_fetchedUntil`]).to.equal(fetchedUntil);
      expect(state[patientId].length).to.equal(patientData.length);
      expect(state[patientId]).to.deep.equal([
        { value: 20 , time: '2018-01-02:00:00:00.000Z' },
        { value: 100, time: '2018-01-01:00:00:00.000Z' },
      ]);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should should exclude diabetes data that\'s prior to the `fetchedUtil` time', () => {
      const initialStateForTest = {};
      const tracked = mutationTracker.trackObj(initialStateForTest);

      const patientId = 'a1b2c3';
      const patientData = [
        { value: 120, time: '2017-11-26:00:00:00.000Z', type: 'cbg' }, // should be excluded
        { value: 100, time: '2018-01-01:00:00:00.000Z', type: 'cbg' },
        { value: 20 , time: '2018-01-02:00:00:00.000Z', type: 'cbg' },
      ];

      const fetchedUntil = '2017-11-27:00:00:00.000Z';

      const action = actions.sync.fetchPatientDataSuccess(patientId, patientData, [], fetchedUntil);

      const state = reducer(initialStateForTest, action);

      expect(state[patientId]).to.deep.equal([
        { value: 20 , time: '2018-01-02:00:00:00.000Z', type: 'cbg' },
        { value: 100, time: '2018-01-01:00:00:00.000Z', type: 'cbg' },
      ]);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should should include pumpSettings and upload data that\'s prior to the `fetchedUtil` time', () => {
      const initialStateForTest = {};
      const tracked = mutationTracker.trackObj(initialStateForTest);

      const patientId = 'a1b2c3';
      const patientData = [
        { time: '2017-11-26:00:00:00.000Z', type: 'pumpSettings' }, // should be included
        { time: '2017-11-26:01:00:00.000Z', type: 'upload' }, // should be included
        { value: 120, time: '2017-11-26:00:00:00.000Z', type: 'cbg' }, // should be excluded
        { value: 100, time: '2018-01-01:00:00:00.000Z', type: 'cbg' },
        { value: 20 , time: '2018-01-02:00:00:00.000Z', type: 'cbg' },
      ];

      const fetchedUntil = '2017-11-27:00:00:00.000Z';

      const action = actions.sync.fetchPatientDataSuccess(patientId, patientData, [], fetchedUntil);

      const state = reducer(initialStateForTest, action);

      expect(state[patientId]).to.deep.equal([
        { value: 20 , time: '2018-01-02:00:00:00.000Z', type: 'cbg' },
        { value: 100, time: '2018-01-01:00:00:00.000Z', type: 'cbg' },
        { time: '2017-11-26:01:00:00.000Z', type: 'upload' },
        { time: '2017-11-26:00:00:00.000Z', type: 'pumpSettings' },
      ]);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should set a cache key for fetched data', () => {
      const initialStateForTest = {};
      const tracked = mutationTracker.trackObj(initialStateForTest);

      const patientId = 'a1b2c3';
      const patientData = [
        { value: 100, time: '2018-01-01:00:00:00.000Z' },
        { value: 20 , time: '2018-01-02:00:00:00.000Z' },
      ];

      const action = actions.sync.fetchPatientDataSuccess(patientId, patientData);

      const state = reducer(initialStateForTest, action);

      expect(state[`${patientId}_cacheUntil`]).to.be.a('number');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should add new data to an existing data array', () => {
      const patientId = 'a1b2c3';

      const existingData = [
        { value: 20 , time: '2018-01-02:00:00:00.000Z' },
        { value: 100, time: '2018-01-01:00:00:00.000Z' },
      ];

      const fetchedUntil = '2017-11-27:00:00:00.000Z';

      const initialStateForTest = {
        [patientId]: existingData,
        [`${patientId}_fetchedUntil`]: fetchedUntil,
      };

      const tracked = mutationTracker.trackObj(initialStateForTest);

      const newData = [
        { value: 30, time: '2017-12-24:00:00:00.000Z' },
      ];
      const newFetchedUntil = '2017-09-27:00:00:00.000Z';

      const action = actions.sync.fetchPatientDataSuccess(patientId, newData, [], newFetchedUntil);

      const state = reducer(initialStateForTest, action);

      expect(state[patientId]).to.deep.equal([
        { value: 20, time: '2018-01-02:00:00:00.000Z' },
        { value: 100, time: '2018-01-01:00:00:00.000Z' },
        { value: 30, time: '2017-12-24:00:00:00.000Z' },
      ]);

      expect(state[`${patientId}_fetchedUntil`]).to.equal(newFetchedUntil);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should set `fetchedUntil` to `start` when not provided in payload', () => {
      const patientId = 'a1b2c3';

      const existingData = [
        { value: 20 , time: '2018-01-02:00:00:00.000Z' },
        { value: 100, time: '2018-01-01:00:00:00.000Z' },
      ];

      const fetchedUntil = '2017-11-27:00:00:00.000Z';

      const initialStateForTest = {
        [patientId]: existingData,
        [`${patientId}_fetchedUntil`]: fetchedUntil,
      };

      const tracked = mutationTracker.trackObj(initialStateForTest);

      const newData = [
        { value: 30, time: '2017-12-24:00:00:00.000Z' },
      ];

      const action = actions.sync.fetchPatientDataSuccess(patientId, newData,);

      const state = reducer(initialStateForTest, action);

      expect(state[`${patientId}_fetchedUntil`]).to.equal('start');
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('clearPatientData', () => {
    it('should set state data value and cache keys to null for patientId key', () => {
      let initialStateForTest = {
        a1b2c3: [
          { value: 100 },
          { value: 20 }
        ],
        'a1b2c3_fetchedUntil': '2018-02-01T00:00:00.000Z',
        'a1b2c3_cacheUntil': 12345678910,
        d4e5f6: [
          { value: 34 }
        ],
        'd4e5f6_fetchedUntil': '2018-02-01T00:00:00.000Z',
        'd4e5f6_cacheUntil': 12345678910,
      };
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let patientId = 'd4e5f6';

      let action = actions.sync.clearPatientData(patientId);

      expect(Object.keys(initialStateForTest).length).to.equal(6);

      let state = reducer(initialStateForTest, action);

      expect(Object.keys(state).length).to.equal(6);
      expect(state[patientId]).to.be.null;
      expect(state[`${patientId}_cacheUntil`]).to.be.null;
      expect(state[`${patientId}_fetchedUntil`]).to.be.null;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('fetchPatientDataFailure', () => {
    it('should set state to empty hash map', () => {
      let initialStateForTest = {
        a1b2c3: [
          { value: 100 },
          { value: 20 }
        ],
        d4e5f6: [
          { value: 34 }
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

  describe('logoutRequest', () => {
    it('should set state to empty hash map', () => {
      let initialStateForTest = {
        a1b2c3: [
          { value: 100 },
          { value: 20 }
        ],
        d4e5f6: [
          { value: 34 }
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
