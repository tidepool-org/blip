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
import { persistState } from 'redux-devtools';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { browserHistory } from 'react-router';
import { syncHistory, routeReducer } from 'react-router-redux';
import mutationTracker from 'redux-immutable-state-invariant';

import { reducers as vizReducers } from '@tidepool/viz/';

import blipState from '../reducers/initialState';
import reducers from '../reducers';

import createErrorLogger from '../utils/logErrorMiddleware';
import trackingMiddleware from '../utils/trackingMiddleware';

function getDebugSessionKey() {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}

const reduxRouterMiddleware = syncHistory(browserHistory);

const reducer = combineReducers({
  blip: reducers,
  routing: routeReducer,
  viz: vizReducers,
});

const loggerMiddleware = createLogger({
  level: 'info',
  collapsed: true,
});

let enhancer = (api) => {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return composeEnhancers(
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware,
      reduxRouterMiddleware,
      createErrorLogger(api),
      trackingMiddleware(api),
      mutationTracker(),
    ),
    // We can persist debug sessions this way
    persistState(getDebugSessionKey()),
  );
};


let initialState = { blip: blipState };

function _createStore(api) {
  let store = createStore(reducer, initialState, enhancer(api));

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers'))
    );
  };

  return store;
}

export default (api) => {
  return _createStore(api);
}
