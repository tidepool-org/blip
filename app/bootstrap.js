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

import './core/language'; // Set the language before loading components
import blipCreateStore from './redux/store';

import { getRoutes } from './routes';

import config from './config';
import api from './core/api';
import personUtils from './core/personutils';
import detectTouchScreen from './core/notouch';

/* global __DEV_TOOLS__ */

// For React developer tools
window.React = React;

export let appContext = {
  log: __DEV_TOOLS__ ? bows('App') : _.noop,
  api: api,
  personUtils: personUtils,
  DEBUG: !!(window.localStorage && window.localStorage.debug),
  config: config
};

// This anonymous function must remain in ES5 format because
// the argument parameter used is not bound when using arrow functions
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
appContext.trackMetric = function() {
  const args = Array.prototype.slice.call(arguments);
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

appContext.render = Component => {
  render(
    <Component store={appContext.store} routing={appContext.routing} />,
    document.getElementById('app'),
  );
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
appContext.start = (Component) => {
  appContext.init(() => {
    appContext.log('Starting app...');

    appContext.store = blipCreateStore(appContext.api);
    appContext.routing = getRoutes(appContext, appContext.store);

    appContext.render(Component)

    appContext.log('App started');
  });
};

export default appContext;
