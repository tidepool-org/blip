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
      console.time('Process All Data');
      const allData = _.cloneDeep(state.data.all) || {}

      const current = _.get(action.payload, 'result.data.current', {});
      const currentData = current.data || {};

      const next = _.get(action.payload, 'result.data.next', {});
      const nextData = next.data || {};

      const prev = _.get(action.payload, 'result.data.prev', {});
      const prevData = prev.data || {};

      _.each([currentData, nextData, prevData], dataSet => {
        _.forOwn(dataSet, (value, key) => {
          if (!allData[key]) allData[key] = [];
          allData[key].push.apply(allData[key], value);
        });
      });

      _.forOwn(allData, (value, key) => {
        allData[key] = _.sortBy(_.uniqBy(value, 'id'), d => -d.normalTime);
      });
      console.timeEnd('Process All Data');

      return update(state, {
        data: {
          all: { $set: allData },
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
