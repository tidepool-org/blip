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

var router = new Router();

router.log = bows('Router');

var configuration = {
  before: function() {
    var routeBase = router.getRoute(0);
    var isAuthenticated = router.isAuthenticated();
    var isNoAuthRoute = _.contains(router.noAuthRoutes, routeBase);

    if (!isAuthenticated && !isNoAuthRoute) {
      router.log('Not logged in, redirecting');
      router.setRoute('login');
      // Stop current routing and let new routing take over
      return false;
    }

    if (isAuthenticated && isNoAuthRoute) {
      router.log('Already logged in, redirecting');
      router.setRoute('profile');
      return false;
    }
  },

  on: function() {
    var route = router.getRoute();
    router.log('Route /' + route);
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

router.start = function() {
  this.init('/');
  this.log('Router started');
};

module.exports = router;