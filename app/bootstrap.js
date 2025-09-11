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

/* global __LAUNCHDARKLY_CLIENT_TOKEN__ */

import React from 'react';
import { render } from 'react-dom';
import bows from 'bows';
import _ from 'lodash';
import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk';

import './core/language'; // Set the language before loading components
import blipCreateStore from './redux/store';
import { ldContext } from './redux/utils/launchDarklyMiddleware';

import { getRoutes } from './routes';

import config from './config';
import api from './core/api';
import personUtils from './core/personutils';
import detectTouchScreen from './core/notouch';
import utils from './core/utils';

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

appContext.trackMetric = (...args) => {
  const state = appContext.store?.getState();

  const selectedClinicId = state?.blip?.selectedClinicId;
  const loggedInUserId = state?.blip?.loggedInUserId;
  const user = state?.blip?.allUsersMap?.[loggedInUserId];

  const clinician = personUtils.isClinicianAccount(user);
  const mobile = utils.isMobile();

  let eventMetadata = {
    selectedClinicId,
    clinician,
    mobile,
  };

  // Empty values should be omitted from the metadata object to prevent sending blank query params
  const filteredEventMetadata = _.omitBy(eventMetadata, _.isNil);

  _.defaultsDeep(args, [, filteredEventMetadata]);

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

const LAUNCHDARKLY_FLAG_DEFAULTS = {
  'showAbbottProvider': false,
  'showExtremeHigh': false,
  'showPrescriptions': false,
  'showRpmReport': false,
  'showSummaryDashboard': false,
  'showSummaryDashboardLastReviewed': false,
  'showTideDashboard': false,
  'showTideDashboardLastReviewed': false,
  'showTideDashboardPatientDrawer': false,
  'tideDashboardCategories': 'UNINITIIALIZED',
};

appContext.render = async Component => {
  const LDProvider = await asyncWithLDProvider({
    clientSideID: __LAUNCHDARKLY_CLIENT_TOKEN__,
    context: ldContext,
    options: {
      streaming: false,
      bootstrap: LAUNCHDARKLY_FLAG_DEFAULTS,
    },
    flags: LAUNCHDARKLY_FLAG_DEFAULTS,
  });

  render(
    <LDProvider>
      <Component store={appContext.store} routing={appContext.routing} />,
    </LDProvider>,
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
