/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */

import mutationTracker from 'object-invariant-test-helper';
import _ from 'lodash';

import * as actionTypes from '../../../../app/redux/constants/actionTypes';
import reducer from '../../../../app/redux/reducers/data';
import initialState from '../../../../app/redux/reducers/initialState';

describe('data reducer', () => {
  let initialStateForTest;
  let tracked;

  beforeEach(() => {
    initialStateForTest = _.cloneDeep(initialState.data);
    tracked = mutationTracker.trackObj(initialStateForTest);
  });

  afterEach(() => {
    expect(mutationTracker.hasMutated(tracked)).to.be.false;
  });

  it('should return the initial state if no matching action type specified', () => {
    expect(reducer(undefined, { type: 'foo' })).to.eql({
      data: {
        aggregationsByDate: {},
        combined: [],
        current: {},
        next: {},
        prev: {},
      },
      timePrefs: {},
      bgPrefs: {},
      metaData: {},
      query: {},
      fetchedUntil: null,
      cacheUntil: null,
    });
  });

  describe('DATA_WORKER_ADD_DATA_REQUEST', () => {
    it('should set the `fetchedUntil` state as provided', () => {
      const fetchedUntil = '2019-11-27T00:00:00.000Z';

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_ADD_DATA_REQUEST,
        payload: {
          fetchedUntil,
        },
      });

      expect(state.fetchedUntil).to.equal(fetchedUntil);
    });

    it('should fall back to the stored `fetchedUntil` state', () => {
      initialStateForTest.fetchedUntil = '2019-11-27T00:00:00.000Z';

      tracked = mutationTracker.trackObj(initialStateForTest);

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_ADD_DATA_REQUEST,
        payload: {
          fetchedUntil: undefined,
        },
      });

      expect(state.fetchedUntil).to.equal('2019-11-27T00:00:00.000Z');
    });

    it('should set the `cacheUntil` state', () => {
      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_ADD_DATA_REQUEST,
        payload: {},
      });

      expect(state.cacheUntil).to.be.a('number');
    });

    it('should set the `metaData.size` state', () => {
      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_ADD_DATA_REQUEST,
        payload: {
          fetchedCount: 2,
        },
      });

      expect(state.metaData.size).to.equal(2);
    });

    it('should add the provided `fetchedCount` to the existing `metaData.size` state', () => {
      initialStateForTest.metaData.size = 400;
      tracked = mutationTracker.trackObj(initialStateForTest);

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_ADD_DATA_REQUEST,
        payload: {
          fetchedCount: 200,
        },
      });

      expect(state.metaData.size).to.equal(600);
    });
  });

  describe('DATA_WORKER_ADD_DATA_SUCCESS', () => {
    it('should push the resulting data to `combined` state, merge `metaData`, and preserve other necessary `data` state', () => {
      initialStateForTest.data.combined = [ 1 ];
      initialStateForTest.data.aggregationsByDate = { foo: 'bar' };
      initialStateForTest.data.current = 'current state';
      initialStateForTest.data.next = 'next state';
      initialStateForTest.data.prev = 'prev state';
      initialStateForTest.metaData.foo = 'foo';
      tracked = mutationTracker.trackObj(initialStateForTest);

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_ADD_DATA_SUCCESS,
        payload: {
          result: {
            data: [2, 3],
            metaData: { bar: 'bar' },
          },
        },
      });

      expect(state.data.aggregationsByDate).to.eql({ foo: 'bar' });
      expect(state.data.combined).to.eql([1, 2, 3]);
      expect(state.data.current).to.equal('current state');
      expect(state.data.next).to.equal('next state');
      expect(state.data.prev).to.equal('prev state');
      expect(state.metaData.foo).to.equal('foo');
      expect(state.metaData.bar).to.equal('bar');
    });
  });

  describe('DATA_WORKER_UPDATE_DATUM_SUCCESS', () => {
    it('should splice the updated datum into the `combined` state and preserve other necessary `data` state', () => {
      initialStateForTest.data.combined = [
        { id: 1, value: 'foo'},
        { id: 2, value: 'bar'},
        { id: 3, value: 'baz'},
      ];
      initialStateForTest.data.aggregationsByDate = { foo: 'bar' };
      initialStateForTest.data.current = 'current state';
      initialStateForTest.data.next = 'next state';
      initialStateForTest.data.prev = 'prev state';
      tracked = mutationTracker.trackObj(initialStateForTest);

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_UPDATE_DATUM_SUCCESS,
        payload: {
          result: {
            datum: { id: 2, value: 'bar updated' },
          },
        },
      });

      expect(state.data.aggregationsByDate).to.eql({ foo: 'bar' });
      expect(state.data.combined[0].value).to.equal('foo');
      expect(state.data.combined[1].value).to.equal('bar updated');
      expect(state.data.combined[2].value).to.equal('baz');
      expect(state.data.current).to.equal('current state');
      expect(state.data.next).to.equal('next state');
      expect(state.data.prev).to.equal('prev state');
    });
  });

  describe('DATA_WORKER_REMOVE_DATA_SUCCESS, LOGOUT_REQUEST, FETCH_PATIENT_DATA_FAILURE', () => {
    it('should reset back to the initial state', () => {
      initialStateForTest.data.combined = [ 1 ];
      initialStateForTest.data.aggregationsByDate = { foo: 'bar' };
      initialStateForTest.data.current = 'current state';
      initialStateForTest.data.next = 'next state';
      initialStateForTest.data.prev = 'prev state';

      initialStateForTest.cacheUntil = 12345;
      initialStateForTest.fetchedUntil = '2019-11-27T00:00:00.000Z';

      initialStateForTest.metaData.patientId = 'abc123';
      tracked = mutationTracker.trackObj(initialStateForTest);

      const actions = [
        actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS,
        actionTypes.LOGOUT_REQUEST,
        actionTypes.FETCH_PATIENT_DATA_FAILURE,
      ];

      _.each(actions, type => {
        const state = reducer(initialStateForTest, {
          type,
          payload: {},
        });

        expect(state).to.deep.equal(initialState.data);
      });
    });

    it('should reset back to the initial state, but preserve some fields for caching purposes', () => {
      initialStateForTest.data.combined = [ 1 ];
      initialStateForTest.data.aggregationsByDate = { foo: 'bar' };
      initialStateForTest.data.current = 'current state';
      initialStateForTest.data.next = 'next state';
      initialStateForTest.data.prev = 'prev state';

      initialStateForTest.cacheUntil = 12345;
      initialStateForTest.fetchedUntil = '2019-11-27T00:00:00.000Z';

      initialStateForTest.metaData = {
        patientId: 'abc123',
        foo: 'bar',
      };

      tracked = mutationTracker.trackObj(initialStateForTest);

      const actions = [
        actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS,
        actionTypes.LOGOUT_REQUEST,
        actionTypes.FETCH_PATIENT_DATA_FAILURE,
      ];

      _.each(actions, type => {
        const state = reducer(initialStateForTest, {
          type,
          payload: {
            preserveCache: true,
          },
        });

        expect(state).to.deep.equal({
          ...initialState.data,
          cacheUntil: 12345,
          fetchedUntil: '2019-11-27T00:00:00.000Z',
          metaData: {
            patientId: 'abc123',
          },
        });
      });
    });
  });

  describe('DATA_WORKER_QUERY_DATA_SUCCESS', () => {
    it('should not update state if `payload.destination` is not `redux`', () => {
      tracked = mutationTracker.trackObj(initialStateForTest);

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
        payload: {
          destination: 'foo',
          result: {
            data: {
              current: {
                data: { smbg: [{ id: 2, value: 'current datum' }] },
                aggregationsByDate: { foo: 'bar' },
              },
              next: {
                data: { smbg: [{ id: 3, value: 'next datum' }] },
              },
              prev: {
                data: { smbg: [{ id: 1, value: 'prev datum' }] },
              },
            },
            timePrefs: { time: 'prefs' },
            bgPrefs: { bg: 'prefs' },
            metaData: { bar: 'baz' },
            query: { types: 'smbg' },
          },
        },
      });

      expect(state).to.eql(initialStateForTest);
    });

    it('should save result to `window.patientData` if `destination` is `window`', () => {
      reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
        payload: {
          destination: 'window',
          result: 'my data',
        },
      });
      expect(window.patientData).to.equal('my data');
    });

    it('should trigger a download of result to `patientData.json` if `destination` is `download`', () => {
      sinon.spy(console, 'save');
      reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
        payload: {
          destination: 'download',
          result: 'my data',
        },
      });
      sinon.assert.calledWith(console.save, 'my data', 'patientData.json');
      console.save.restore();
    });

    it('should set all resulting data and metaData to state, and set combined data with deduplicated ids', () => {
      initialStateForTest.data.combined = [ { id: 2, value: 'current datum' } ];
      tracked = mutationTracker.trackObj(initialStateForTest);

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
        payload: {
          result: {
            data: {
              current: {
                data: { smbg: [{ id: 2, value: 'current datum' }] },
                aggregationsByDate: { foo: 'bar' },
              },
              next: {
                data: { smbg: [{ id: 3, value: 'next datum' }] },
              },
              prev: {
                data: { smbg: [{ id: 1, value: 'prev datum' }] },
              },
            },
            timePrefs: { time: 'prefs' },
            bgPrefs: { bg: 'prefs' },
            metaData: { bar: 'baz' },
            query: { types: 'smbg' },
          },
        },
      });

      expect(state.data.aggregationsByDate).to.eql({ foo: 'bar' });

      expect(state.data.combined).to.eql([
        { id: 1, value: 'prev datum' },
        { id: 2, value: 'current datum' },
        { id: 3, value: 'next datum' },
      ]);

      expect(state.data.current).to.eql({
        data: { smbg: [{ id: 2, value: 'current datum' }] },
        aggregationsByDate: { foo: 'bar' },
      });

      expect(state.data.next).to.eql({
        data: { smbg: [{ id: 3, value: 'next datum' }] },
      });

      expect(state.data.prev).to.eql({
        data: { smbg: [{ id: 1, value: 'prev datum' }] },
      });

      expect(state.timePrefs).to.eql({ time: 'prefs' });
      expect(state.bgPrefs).to.eql({ bg: 'prefs' });
      expect(state.metaData).to.eql({ bar: 'baz' });
      expect(state.query).to.eql({ types: 'smbg' });
    });

    it('should not update combined state if the query did not request data by types', () => {
      initialStateForTest.data.combined = [ { id: 2, value: 'current datum' } ];
      tracked = mutationTracker.trackObj(initialStateForTest);

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
        payload: {
          result: {
            data: {
              current: {
                stats: { readingsInRange: 'lots' },
              },
            },
            timePrefs: { time: 'prefs' },
            bgPrefs: { bg: 'prefs' },
            metaData: { bar: 'baz' },
            query: { stats: 'readingsInRange' },
          },
        },
      });

      expect(state.data.combined).to.eql([
        { id: 2, value: 'current datum' },
      ]);
    });

    it('should not update aggregationsByDate state if the result did not contain new aggregations', () => {
      initialStateForTest.data.aggregationsByDate = { foo: 'bar' };
      tracked = mutationTracker.trackObj(initialStateForTest);

      const state = reducer(initialStateForTest, {
        type: actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
        payload: {
          result: {
            data: {},
            timePrefs: { time: 'prefs' },
            bgPrefs: { bg: 'prefs' },
            metaData: { bar: 'baz' },
            query: { metaData: 'bar' },
          },
        },
      });

      expect(state.data.aggregationsByDate).to.eql({ foo: 'bar' });
    });
  });
});


