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
import createSagaMiddleware from 'redux-saga';

import { rootSaga, vizReducer } from '@tidepool/viz';

import blipState from '../reducers/initialState';
import reducers from '../reducers';

import createErrorLogger from '../utils/logErrorMiddleware';
import trackingMiddleware from '../utils/trackingMiddleware';

const reduxRouterMiddleware = syncHistory(browserHistory);

const sagaMiddleware = createSagaMiddleware();

const reducer = combineReducers({
  blip: reducers,
  routing: routeReducer,
  viz: vizReducer,
});

let initialState = { blip: blipState };

function _createStore(api) {
  let store = createStore(reducer, initialState, applyMiddleware(
    thunkMiddleware,
    sagaMiddleware,
    reduxRouterMiddleware,
    createErrorLogger(api),
    trackingMiddleware(api),
  ));
  sagaMiddleware.run(rootSaga);

  return store;
}

export default (api) => {
  return _createStore(api);
}
