/** @jsx React.DOM */
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
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */
'use strict';

var React = require('react');
var bows = require('bows');
var _ = require('lodash');

var config = require('./config');
var router = require('./router');
var api = require('./core/api');
var personUtils = require('./core/personutils');
var queryString = require('./core/querystring');
var detectTouchScreen = require('./core/notouch');

var AppComponent = require('./components/app');

// For React developer tools
window.React = React;

// Push state to be able to always go back in browser history within the appContext
var path = window.location.hash;
window.history.pushState(null, null, '#/patients');
window.history.pushState(null, null, path);

var appContext = {
  log: bows('App'),
  api: api,
  personUtils: personUtils,
  router: router,
  DEBUG: !!(window.localStorage && window.localStorage.debug)
};

appContext.trackMetric = function() {
  var args = Array.prototype.slice.call(arguments);
  return appContext.api.metrics.track.apply(appContext.api.metrics, args);
};

appContext.useMock = function(mock) {
  this.mock = mock;
  this.api = mock.patchApi(this.api);
};

appContext.init = function(callback) {
  var self = this;

  function beginInit() {
    initNoTouch();
  }

  function initNoTouch() {
    detectTouchScreen();
    initMock();
  }

  function initMock() {
    if (self.mock) {
      // Load mock params from config variables
      // and URL query string (before hash)
      var paramsConfig = queryString.parseTypes(config.MOCK_PARAMS);
      var paramsUrl = queryString.parseTypes(window.location.search);
      var params = _.assign(paramsConfig, paramsUrl);

      self.mock.init(params);
      self.log('Mock services initialized with params', params);
    }
    initApi();
  }

  function initApi() {
    self.api.init(callback);
  }

  beginInit();
};

var Bootstrap = React.createClass({
  childContextTypes: {
    log: React.PropTypes.func.isRequired,
    api: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
    personUtils: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    DEBUG: React.PropTypes.bool.isRequired
  },
  getChildContext: function() {
    return {
      log: appContext.log,
      api: appContext.api,
      router: appContext.router,
      personUtils: appContext.personUtils,
      trackMetric: appContext.trackMetric,
      DEBUG: appContext.DEBUG
    };
  },
  render: function() {
    return <AppComponent />;
  }
});

/**
 * Application start function. This is what should be called
 * by anything wanting to start Blip and bootstrap to the DOM
 *
 * This renders the AppComponent into the DOM providing appContext
 * as the context for AppComponent so that the required dependencies
 * are passed in!
 * 
 */
appContext.start = function() {
  var self = this;

  this.init(function() {
    self.log('Starting app...');
    self.component = React.render(
      /* jshint ignore:start */
      <Bootstrap />,
      /* jshint ignore:end */
      document.getElementById('app')
    );

    self.log('App started');

    if (self.mock) {
      self.log('App running with mock services');
    }
  });
};

module.exports = appContext;