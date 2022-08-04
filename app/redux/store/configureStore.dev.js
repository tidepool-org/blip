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

/* global __DEV_TOOLS__ */

import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistState } from 'redux-devtools';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import mutationTracker from 'redux-immutable-state-invariant';
import qhistory from 'qhistory';
import assign from 'lodash/assign';
import throttle from 'lodash/throttle';
import { stringify, parse } from 'qs';

import Worker from 'worker-loader?inline!./../../worker/index';

import blipState from '../reducers/initialState';
import reducers from '../reducers';
import { loadLocalState, saveLocalState } from './localStorage';

import createErrorLogger from '../utils/logErrorMiddleware';
import trackingMiddleware from '../utils/trackingMiddleware';
import createWorkerMiddleware from '../utils/workerMiddleware';
import pendoMiddleware from '../utils/pendoMiddleware';
import { keycloakMiddleware } from '../../keycloak';

function getDebugSessionKey() {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}

export const history = qhistory(createBrowserHistory(), stringify, parse);

const reducer = combineReducers({
  blip: reducers,
  router: connectRouter(history),
});

const loggerMiddleware = createLogger({
  level: 'info',
  collapsed: true,
});

const worker = new Worker;
const workerMiddleware = createWorkerMiddleware(worker);

let enhancer;
if (!__DEV_TOOLS__) {
  enhancer = (api) => {
    const middlewares = [
      workerMiddleware,
      thunkMiddleware,
      routerMiddleware(history),
      createErrorLogger(api),
      trackingMiddleware(api),
      pendoMiddleware(api),
      keycloakMiddleware(api),
    ];
    return compose(
      applyMiddleware(...middlewares),
      persistState(getDebugSessionKey()),
    );
  }
} else {
  enhancer = (api) => {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const middlewares = [
      workerMiddleware,
      thunkMiddleware,
      loggerMiddleware,
      routerMiddleware(history),
      createErrorLogger(api),
      trackingMiddleware(api),
      pendoMiddleware(api),
      mutationTracker(),
      keycloakMiddleware(api),
    ];
    return composeEnhancers(
      applyMiddleware(...middlewares),
      // We can persist debug sessions this way
      persistState(getDebugSessionKey()),
    );
  }
}

function _createStore(api) {
  const initialState = { blip: assign(blipState, loadLocalState()) };
  const store = createStore(reducer, initialState, enhancer(api));

  store.subscribe(throttle(() => {
    saveLocalState({
      selectedClinicId: store.getState().blip?.selectedClinicId,
    });
  }, 1000));

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(combineReducers({
        blip: require('../reducers'),
        router: connectRouter(history),
      }))
    );
  };

  return store;
}

export default (api) => {
  return _createStore(api);
}
