import update from 'react-addons-update';
import _ from 'lodash';

import * as actionTypes from '../constants/actionTypes';
import initialState from './initialState';

const data = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.DATA_WORKER_ADD_DATA_SUCCESS:
      return update(state, {
        metaData: { $merge: action.payload.result.metaData || {} },
      });

    case actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS:
      return update(state, { $set: initialState.data });

    case actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS:
      console.time('Process Combined Data');
      const combined = [];

      const current = _.get(action.payload, 'result.data.current', {});
      const currentData = current.data || {};

      const next = _.get(action.payload, 'result.data.next', {});
      const nextData = next.data || {};

      const prev = _.get(action.payload, 'result.data.prev', {});
      const prevData = prev.data || {};

      _.each([prevData, currentData, nextData], (dataSet = {}) => {
        _.forOwn(dataSet, datums => {
          combined.push.apply(combined, datums);
        });
      });

      if (combined.length === 0) combined.push.apply(combined, state.data.combined);

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
