import update from 'react-addons-update';

import * as actionTypes from '../constants/actionTypes';

const data = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.DATA_WORKER_QUERY_DATA_SUCCESS:
      return update(state, { $merge: action.payload.data });

    case actionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS:
      return update(state, { $set: {} });

    default:
      return state;
  }
};

export default data;
