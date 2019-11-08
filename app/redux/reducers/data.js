import update from 'react-addons-update';
import { generateCacheTTL } from 'redux-cache';
import _ from 'lodash';

import * as actionTypes from '../constants/actionTypes';
import initialState from './initialState';

const data = (state = {}, action) => {
  let combined;

  switch (action.type) {
    case actionTypes.DATA_WORKER_ADD_DATA_REQUEST:
      const {
        patientId = state.patientId,
        fetchedUntil = state.fetchedUntil,
      } = action.payload;

      return update(state, {
        patientId: { $set: patientId },
        fetchedUntil: { $set: fetchedUntil ? fetchedUntil : 'start' },
        cacheUntil: { $set: generateCacheTTL(36e5) },
        metaData: { $merge: { size: state.metaData.size + action.payload.fetchedCount } },
      });

    case actionTypes.DATA_WORKER_ADD_DATA_SUCCESS:
      return update(state, {
        data: {
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
          combined: { $splice: [[existingDatumIndex, 1, datum]] },
          current: { $set: state.data.current },
          next: { $set: state.data.next },
          prev: { $set: state.data.prev },
        },
        metaData: { $merge: action.payload.result.metaData || {} },
      });

    case actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS:
    case actionTypes.LOGOUT_REQUEST:
    case actionTypes.FETCH_PATIENT_DATA_FAILURE:
      return update(state, { $set: initialState.data });

    case actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS:
      const current = _.get(action.payload, 'result.data.current', {});
      const next = _.get(action.payload, 'result.data.next', {});
      const prev = _.get(action.payload, 'result.data.prev', {});

      // We only want to replace the combined data when data types are queried.
      // This is to allow us to retain the combined data when, for instance, only querying for stats
      const typesQueried = action.payload.result.query.types;
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
          combined: { $set: combined },
          current: { $set: current },
          next: { $set: next },
          prev: { $set: prev },
        },
        timePrefs: { $merge: action.payload.result.timePrefs || {} },
        bgPrefs: { $merge: action.payload.result.bgPrefs || {} },
        metaData: { $merge: action.payload.result.metaData || {} },
      });

    default:
      return state;
  }
};

export default data;
