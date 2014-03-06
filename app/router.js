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

var Router = window.Router;
var bows = window.bows;
var _ = window._;

var queryString = require('./core/querystring');

var router = new Router();

router.log = bows('Router');

var configuration = {
  before: function() {
    var redirectRoute;
    var routeBase = router.getRoute(0);
    var isAuthenticated = router.isAuthenticated();
    // Strip potential query string before checking if route requires auth
    routeBase = routeBase.replace(/(\?.*)/, '');
    var isNoAuthRoute = _.contains(router.noAuthRoutes, routeBase);

    if (!isAuthenticated && !isNoAuthRoute) {
      router.log('Not logged in, redirecting');
      redirectRoute = router.defaultNotAuthenticatedRoute;
      router.setRoute(redirectRoute);
      // Stop current routing and let new routing take over
      return false;
    }

    if (isAuthenticated && isNoAuthRoute) {
      router.log('Already logged in, redirecting');
      redirectRoute = router.defaultAuthenticatedRoute;
      router.setRoute(redirectRoute);
      return false;
    }
  },

  on: function() {
    var route = router.getRoute();
    router.log('Route /' + route.join('/'));
    router.onRouteChange();
  }
};

router.configure(configuration);

router.setup = function(routes, options) {
  var self = this;
  options = options || {};

  this.isAuthenticated = options.isAuthenticated ||
                         function() { return true; };

  this.noAuthRoutes = options.noAuthRoutes || [];
  this.noAuthRoutes = this._parseNoAuthRoutes(this.noAuthRoutes);

  this.defaultNotAuthenticatedRoute =
    options.defaultNotAuthenticatedRoute || '/';
  this.defaultAuthenticatedRoute =
    options.defaultAuthenticatedRoute || '/';

  this.onRouteChange = options.onRouteChange || function() {};

  routes = this._addRoutesWithQueryStrings(routes);
  
  _.forEach(routes, function(handler, route) {
    self.on(route, handler);
  });

  return this;
};

router._parseNoAuthRoutes = function(routes) {
  return _.map(routes, this._getRouteFirstFragment);
};

// Return first fragment of route
// '/foo/bar' => 'foo'
router._getRouteFirstFragment = function(route) {
  var result = route.split('/');
  // Get first fragment after leading '/'
  if (result.length >= 2) {
    return result[1];
  }
  return '';
};

// Register query string fragments
router.param('qs', /(\?.*)/);
router.param('idAndQs', /([._a-zA-Z0-9-]+)(\?.*)/);

// Duplicate routes in routing table:
// For each route, add the same route with an appended query string pattern
// and make both '/patients/11' and '/patients/11?foo=bar'
// map to the same handler
router._addRoutesWithQueryStrings = function(routingTable) {
  var self = this;
  var newRoutingTable = {};
  _.forEach(routingTable, function(handler, route) {
    var routeWithQueryString = self._addQueryStringFragmentToRoute(route);
    newRoutingTable[route] = handler;
    newRoutingTable[routeWithQueryString] = handler;
  });
  return newRoutingTable;
};

router._addQueryStringFragmentToRoute = function(route) {
  // Case: '/patients/:id'
  var endingId = /:\w+$/;
  if (route.match(endingId)) {
    return route.replace(endingId, ':idAndQs');
  }

  // Case: '/patients', '/'
  return route + ':qs';
};

// Implement some convenience functions to grab info from the URL
// Inspired by AngularJS' `$location` service
// http://docs.angularjs.org/guide/dev_guide.services.$location
router.url = function() {
  var url = window.location.hash;
  url = url || '';
  url = url.replace(/^#/, '');
  return url;
};

router.path = function() {
  var url = this.url();
  // Strip potential query string
  var path = url.replace(/(\?.*)/, '');
  return path;
};

router.qs = function() {
  var qs = '';
  var url = this.url();
  var match = url.match(/(\?.*)/);
  if (match) {
    qs = match[0];
  }
  return qs;
};

router.search = function(newSearch) {
  var qs = this.qs();
  var search = queryString.parseTypes(qs);
  return search;
};

router.start = function() {
  this.init('/');
  this.log('Router started');
};

module.exports = router;