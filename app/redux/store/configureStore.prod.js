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
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import qhistory from 'qhistory';
import { stringify, parse } from 'qs';
import assign from 'lodash/assign';
import throttle from 'lodash/throttle';

import Worker from 'worker-loader?inline!./../../worker/index';

import blipState from '../reducers/initialState';
import reducers from '../reducers';
import { loadLocalState, saveLocalState } from './localStorage';

import createErrorLogger from '../utils/logErrorMiddleware';
import trackingMiddleware from '../utils/trackingMiddleware';
import createWorkerMiddleware from '../utils/workerMiddleware';

export const history = qhistory(createBrowserHistory(), stringify, parse);

const reducer = combineReducers({
  blip: reducers,
  router: connectRouter(history),
});

const worker = new Worker;
const workerMiddleware = createWorkerMiddleware(worker);

function _createStore(api) {
  const createStoreWithMiddleware = applyMiddleware(
    workerMiddleware,
    thunkMiddleware,
    routerMiddleware(history),
    createErrorLogger(api),
    trackingMiddleware(api)
  )(createStore);

  const initialState = { blip: assign(blipState, loadLocalState()) };
  const store = createStoreWithMiddleware(reducer, initialState);

  store.subscribe(throttle(() => {
    saveLocalState({
      selectedClinicId: store.getState().blip?.selectedClinicId,
    });
  }, 1000));

  return store;
}

export default (api) => {
  return _createStore(api);
}
