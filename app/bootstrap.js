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

import blipCreateStore from './redux/store';
import AppRoot from './redux/containers/Root';

import { getRoutes } from './routes';

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

appContext.init = callback => {

  function beginInit() {
    initNoTouch();
  }

  function initNoTouch() {
    detectTouchScreen();
    initApi();
  }

  function initApi() {
    appContext.api.init(callback);
  }

  beginInit();
};

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

    const store = blipCreateStore(appContext.api);

    appContext.component = render(
      <AppRoot store={store} routing={getRoutes(appContext, store)} />,
      document.getElementById('app')
    );

    appContext.log('App started');
  });
};

module.exports = appContext;
