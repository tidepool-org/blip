/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with appContext program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import React from 'react';
import { render } from 'react-dom';
import bows from 'bows';
import _ from 'lodash';

import { Router, browserHistory } from 'react-router';
import { syncHistory, routeReducer } from 'redux-simple-router';

import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';

import { getRoutes } from './routes';


import blipState from './redux/reducers/initialState';
import reducers from './redux/reducers';

import config from './config';
import api from './core/api';
import personUtils from './core/personutils';
import queryString from './core/querystring';
import detectTouchScreen from './core/notouch';

// For React developer tools
window.React = React;

var appContext = {
  log: bows('App'),
  api: api,
  personUtils: personUtils,
  DEBUG: !!(window.localStorage && window.localStorage.debug),
  config: config
};

// This anonymous function must remain in ES5 format because 
// the argument parameter used is not bound when using arrow functions
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
appContext.trackMetric = function() { 
  var args = Array.prototype.slice.call(arguments);
  return appContext.api.metrics.track.apply(appContext.api.metrics, args);
};

appContext.props = {
  log: appContext.log,
  api: appContext.api,
  personUtils: appContext.personUtils,
  trackMetric: appContext.trackMetric,
  DEBUG: appContext.DEBUG,
  config: appContext.config
};

appContext.useMock = mock => {
  appContext.mock = mock;
  appContext.api = mock.patchApi(appContext.api);
};

appContext.init = callback => {

  function beginInit() {
    initNoTouch();
  }

  function initNoTouch() {
    detectTouchScreen();
    initMock();
  }

  function initMock() {
    if (appContext.mock) {
      // Load mock params from config variables
      // and URL query string (before hash)
      var paramsConfig = queryString.parseTypes(config.MOCK_PARAMS);
      var paramsUrl = queryString.parseTypes(window.location.search);
      var params = _.assign(paramsConfig, paramsUrl);

      appContext.mock.init(params);
      appContext.log('Mock services initialized with params', params);
    }
    initApi();
  }

  function initApi() {
    appContext.api.init(callback);
  }

  beginInit();
};

const routing = (
  <Router history={browserHistory}>
    {getRoutes(appContext)}
  </Router>
);

/**
 * Application start function. This is what should be called
 * by anything wanting to start Blip and bootstrap to the DOM
 *
 * This renders the AppComponent into the DOM providing appContext
 * as the context for AppComponent so that the required dependencies
 * are passed in!
 * 
 */
appContext.start = () => {

  appContext.init(() => {
    appContext.log('Starting app...');

    const loggerMiddleware = createLogger({
      level: 'info',
      collapsed: true,
    });

    const reduxRouterMiddleware = syncHistory(browserHistory);

    const reducer = combineReducers({
      blip: reducers,
      routing: routeReducer
    });

    const createStoreWithMiddleware = applyMiddleware(
      thunkMiddleware, 
      loggerMiddleware,
      reduxRouterMiddleware
    )(createStore);

    let initialState = { blip: blipState };

    const store = createStoreWithMiddleware(reducer, initialState);

    appContext.component = render(
      <div>
        <Provider store={store}>
          {routing}
        </Provider>
      </div>,
      document.getElementById('app')
    );

    appContext.log('App started');

    if (appContext.mock) {
      appContext.log('App running with mock services');
    }
  });
};

module.exports = appContext;
