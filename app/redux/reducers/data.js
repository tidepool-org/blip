import update from 'react-addons-update';

import * as actionTypes from '../constants/actionTypes';

const data = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.DATA_WORKER_ADD_DATA_SUCCESS:
      return update(state, {
        metaData: { $merge: action.payload.result.metaData || {} },
      });

    case actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS:
      return update(state, { $set: {} });

    case actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS:
      return update(state, {
        data: { $merge: action.payload.result.data || {} },
        timePrefs: { $merge: action.payload.result.timePrefs || {} },
        bgPrefs: { $merge: action.payload.result.bgPrefs || {} },
        metaData: { $merge: action.payload.result.metaData || {} },
      });

    default:
      return state;
  }
};

export default data;
