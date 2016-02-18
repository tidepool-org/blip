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

import DevTools from '../containers/devTools';

import blipState from '../reducers/initialState';
import reducers from '../reducers';

function getDebugSessionKey() {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}

const reduxRouterMiddleware = syncHistory(browserHistory);

const reducer = combineReducers({
  blip: reducers,
  routing: routeReducer
});

const loggerMiddleware = createLogger({
  level: 'info',
  collapsed: true,
});

const enhancer = compose(
  applyMiddleware(
    thunkMiddleware, 
    //loggerMiddleware,
    reduxRouterMiddleware
  ),
  // DevTools.instrument(),
  // // We can persist debug sessions this way
  // persistState(getDebugSessionKey())
);

let initialState = { blip: blipState };

let store = createStore(reducer, initialState, enhancer);

if (module.hot) {
  module.hot.accept('../reducers', () =>
    store.replaceReducer(require('../reducers'))
  );
};

export default store;