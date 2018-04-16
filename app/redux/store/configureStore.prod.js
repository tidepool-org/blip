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

import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router';
import { syncHistory, routeReducer } from 'react-router-redux';

import { reducers as vizReducers } from '@tidepool/viz';

// eslint-disable-next-line import/no-unresolved
import Worker from 'worker-loader?inline!./../../worker/index';

import blipState from '../reducers/initialState';
import reducers from '../reducers';

import createErrorLogger from '../utils/logErrorMiddleware';
import trackingMiddleware from '../utils/trackingMiddleware';
import createWorkerMiddleware from '../utils/workerMiddleware';

const reduxRouterMiddleware = syncHistory(browserHistory);

const reducer = combineReducers({
  blip: reducers,
  routing: routeReducer,
  viz: vizReducers,
});

const worker = new Worker;
const workerMiddleware = createWorkerMiddleware(worker);

let initialState = { blip: blipState };

function _createStore(api) {
  const createStoreWithMiddleware = applyMiddleware(
    workerMiddleware,
    thunkMiddleware,
    reduxRouterMiddleware,
    createErrorLogger(api),
    trackingMiddleware(api)
  )(createStore);

  return createStoreWithMiddleware(reducer, initialState);
}

export default (api) => {
  return _createStore(api);
}
