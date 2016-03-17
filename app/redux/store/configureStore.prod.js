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

import blipState from '../reducers/initialState';
import reducers from '../reducers';

const reduxRouterMiddleware = syncHistory(browserHistory);

const reducer = combineReducers({
  blip: reducers,
  routing: routeReducer
});

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware, 
  reduxRouterMiddleware
)(createStore);

let initialState = { blip: blipState };

export default createStoreWithMiddleware(reducer, initialState);