import update from 'immutability-helper';
import { generateCacheTTL } from 'redux-cache';
import _ from 'lodash';

import * as actionTypes from '../constants/actionTypes';
import initialState from './initialState';

const data = (state = initialState.data, action) => {
  let combined;

  switch (action.type) {
    case actionTypes.DATA_WORKER_ADD_DATA_REQUEST:
      const {
        fetchedUntil = state.fetchedUntil,
      } = action.payload;

      return update(state, {
        fetchedUntil: { $set: fetchedUntil ? fetchedUntil : state.fetchedUntil },
        cacheUntil: { $set: generateCacheTTL(36e5) },
        metaData: { $merge: { size: _.get(state, 'metaData.size', 0) + action.payload.fetchedCount } },
      });

    case actionTypes.DATA_WORKER_ADD_DATA_SUCCESS:
      return update(state, {
        data: {
          aggregationsByDate: { $set: state.data.aggregationsByDate },
          combined: { $push: action.payload.result.data || [] },
          current: { $set: state.data.current },
          next: { $set: state.data.next },
          prev: { $set: state.data.prev },
        },
        metaData: { $merge: action.payload.result.metaData || {} },
      });

    case actionTypes.DATA_WORKER_UPDATE_DATUM_SUCCESS:
      const datum = action.payload.result.datum;
      const existingDatumIndex = _.findIndex(state.data.combined, { id: datum.id });

      return update(state, {
        data: {
          aggregationsByDate: { $set: state.data.aggregationsByDate },
          combined: { $splice: [[existingDatumIndex, 1, datum]] },
          current: { $set: state.data.current },
          next: { $set: state.data.next },
          prev: { $set: state.data.prev },
        },
      });

    case actionTypes.DATA_WORKER_REMOVE_DATA_REQUEST:
    case actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS:
    case actionTypes.LOGOUT_REQUEST:
    case actionTypes.FETCH_PATIENT_DATA_FAILURE:
      return update(state, { $set: {
        ...initialState.data,
        cacheUntil: _.get(action.payload, 'preserveCache') ? state.cacheUntil : null,
        fetchedUntil: _.get(action.payload, 'preserveCache') ? state.fetchedUntil : null,
        metaData: _.get(action.payload, 'preserveCache') ? { ...state.metaData, queryDataCount: 0 } : {},
      } });

    case actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS:
      const { destination = 'redux', result = {} } = action.payload

      if (destination !== 'redux') {
        if (destination === 'window') window.patientData = result;
        if (destination === 'download') console.save(result, result?.query?.raw ? 'rawData.json' : 'patientData.json');
        return state;
      }

      const current = _.get(result, 'data.current', {});
      const next = _.get(result, 'data.next', {});
      const prev = _.get(result, 'data.prev', {});

      // We only want to replace the combined data when data types are queried.
      // This is to allow us to retain the combined data when, for instance, only querying for stats
      const typesQueried = result.query.types;
      combined = typesQueried ? [] : state.data.combined;

      if (typesQueried) {
        console.time('Process Combined Data');
        const currentData = current.data || {};
        const nextData = next.data || {};
        const prevData = prev.data || {};

        _.each([prevData, currentData, nextData], (dataSet = {}) => {
          _.forOwn(dataSet, datums => {
            combined.push.apply(combined, datums);
          });
        });

        combined = _.uniqBy(combined, 'id');
        console.timeEnd('Process Combined Data');
      }

      return update(state, {
        data: {
          aggregationsByDate: { $set: current.aggregationsByDate || state.data.aggregationsByDate },
          combined: { $set: combined },
          current: { $set: current },
          next: { $set: next },
          prev: { $set: prev },
        },
        timePrefs: { $merge: result.timePrefs || {} },
        bgPrefs: { $merge: result.bgPrefs || {} },
        metaData: { $merge: result.metaData || {} },
        query: { $set: result.query || {} }
      });

    default:
      return state;
  }
};

export default data;
