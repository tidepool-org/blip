
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

import { Router, IndexRoute, Route, Link } from 'react-router';

import AppComponent from './components/app';
import Patients from './pages/patients';
import Login from './pages/login';
import Signup from './pages/signup';
import Profile from './pages/profile';
import Patient from './pages/patient';
import PatientNew from './pages/patientnew';
import PatientData from './pages/patientdata';
import RequestPasswordReset from './pages/passwordreset/request';
import ConfirmPasswordReset from './pages/passwordreset/confirm';
import EmailVerification from './pages/emailverification';

import config from './config';
import api from './core/api';
import personUtils from './core/personutils';
import queryString from './core/querystring';
import detectTouchScreen from './core/notouch';

// For React developer tools
window.React = React;

// Push state to be able to always go back in browser history within the appContext
//var path = window.location.hash;
//window.history.pushState(null, null, '#/patients');
//window.history.pushState(null, null, path);

var appContext = {
  log: bows('App'),
  api: api,
  personUtils: personUtils,
  DEBUG: !!(window.localStorage && window.localStorage.debug)
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
  DEBUG: appContext.DEBUG
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

const requireAuth = (nextState, replaceState) => {
  console.log(' [-] Require auth for', nextState.location.pathname);
  console.log(' [-] Is authenticated?', api.user.isAuthenticated());
  if(!api.user.isAuthenticated()) {
    replaceState({ nextPathname: nextState.location.pathname }, '/login');
  }
}

const requireNoAuth = (nextState, replaceState) => {
  console.log(' [-] Require non-auth for', nextState.location.pathname);
  console.log(' [-] Is authenticated?', api.user.isAuthenticated());
  if(api.user.isAuthenticated()) {
    replaceState({ nextPathname: nextState.location.pathname }, '/patients');
  }
}

const routing = (
  <Router>
    <Route path='/' component={AppComponent} {...appContext.props}>
      <IndexRoute components={{login:Login}} onEnter={requireNoAuth} />
      <Route path='login' components={{login:Login}} onEnter={requireNoAuth} />
      <Route path='signup' components={{signup: Signup}} onEnter={requireNoAuth} />
      <Route path='email-verification' components={{emailVerification: EmailVerification}} onEnter={requireNoAuth} />
      <Route path='profile' components={{profile: Profile}} onEnter={requireAuth} />
      <Route path='patients' components={{patients: Patients}} onEnter={requireAuth} />
      <Route path='patients/new' components={{patientNew: PatientNew}} onEnter={requireAuth} />
      <Route path='patients/:id/profile' components={{patient: Patient}} onEnter={requireAuth} />
      <Route path='patients/:id/share' components={{patientShare: Patient}} onEnter={requireAuth} />
      <Route path='patients/:id/data' components={{patientData: PatientData}} onEnter={requireAuth} />
      <Route path='request-password-reset' components={{requestPasswordReset: RequestPasswordReset}} onEnter={requireNoAuth} />
      <Route path='confirm-password-reset' components={{ confirmPasswordReset: ConfirmPasswordReset}} onEnter={requireNoAuth} />
      <Route path='request-password-from-uploader' components={{ requestPasswordReset: RequestPasswordReset}} onEnter={requireNoAuth} />
    </Route>
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
    appContext.component = render(
      routing,
      document.getElementById('app')
    );

    appContext.log('App started');

    if (appContext.mock) {
      appContext.log('App running with mock services');
    }
  });
};

module.exports = appContext;
