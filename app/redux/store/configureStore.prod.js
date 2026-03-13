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

import { createBrowserHistory } from 'history';
import { legacy_createStore as createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import qhistory from 'qhistory';
import { stringify, parse } from 'qs';
import assign from 'lodash/assign';
import throttle from 'lodash/throttle';

import blipState from '../reducers/initialState';
import reducers from '../reducers';
import { loadLocalState, saveLocalState } from './localStorage';

import createErrorLogger from '../utils/logErrorMiddleware';
import trackingMiddleware from '../utils/trackingMiddleware';
import createWorkerMiddleware from '../utils/workerMiddleware';
import pendoMiddleware from '../utils/pendoMiddleware';
import launchDarklyMiddleware from '../utils/launchDarklyMiddleware';
import { keycloak, keycloakMiddleware } from '../../keycloak';
import config from '../../config';
import { RTKQueryApi } from '../api/baseApi';

export const history = qhistory(createBrowserHistory(), stringify, parse);

const reducer = combineReducers({
  blip: reducers,
  router: connectRouter(history),
  [RTKQueryApi.reducerPath]: RTKQueryApi.reducer,
});

const worker = new Worker(new URL('./../../worker/index', import.meta.url));
const workerMiddleware = createWorkerMiddleware(worker);

function _createStore(api) {
  const middlewares = [
    workerMiddleware,
    thunkMiddleware,
    RTKQueryApi.middleware,
    routerMiddleware(history),
    createErrorLogger(api),
    trackingMiddleware(api),
    pendoMiddleware(api),
    launchDarklyMiddleware(api),
    keycloakMiddleware(api),
  ];
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);

  const initialState = { blip: assign(blipState, loadLocalState()) };
  const store = createStoreWithMiddleware(reducer, initialState);

  // tideDashboardFilters: store.getState().blip?.tideDashboardFilters,

  store.subscribe(throttle(() => {
    const selectedClinicId = store.getState().blip?.selectedClinicId;
    const loggedInUserId = store.getState().blip?.loggedInUserId;

    saveLocalState({ selectedClinicId });

    if (loggedInUserId && selectedClinicId) {
      saveLocalState(store.getState().blip?.deviceIssuesFilters, `deviceIssuesFilters/${loggedInUserId}/${selectedClinicId}`);
    }
  }, 1000));

  return store;
}

export default (api) => {
  return _createStore(api);
}
