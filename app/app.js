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

var React = window.React;
var bows = window.bows;
var _ = window._;
var config = window.config;

var router = require('./router');
var auth = require('./core/auth');
var api = require('./core/api');
var user = require('./core/user');

var detectTouchScreen = require('./core/notouch');

var Navbar = require('./components/navbar');
var LogoutOverlay = require('./components/logoutoverlay');
var Notification = require('./components/notification');

var Login = require('./pages/login');
var Signup = require('./pages/signup');
var Profile = require('./pages/profile');
var Patients = require('./pages/patients');

var app = {
  log: bows('App'),
  auth: auth,
  api: api,
  user: user,
  router: router
};

window.app = app;

var routes = {
  '/': 'redirectToDefaultRoute',
  '/login': 'showLogin',
  '/signup': 'showSignup',
  '/profile': 'showProfile',
  '/patients': 'showPatients'
};

var noAuthRoutes = ['/login', '/signup'];

var defaultNotAuthenticatedRoute = '/login';
var defaultAuthenticatedRoute = '/patients';

var AppComponent = React.createClass({
  getInitialState: function() {
    return {
      authenticated: app.auth.isAuthenticated(),
      notification: null,
      page: null,
      user: null,
      loggingOut: false,
      patients: null,
      fetchingPatients: false
    };
  },

  componentDidMount: function() {
    if (this.state.authenticated) {
      this.fetchUser();
    }

    this.setupAndStartRouter();
  },

  setupAndStartRouter: function() {
    var self = this;

    var routingTable = {};
    _.forEach(routes, function(handlerName, route) {
      routingTable[route] = self[handlerName];
    });

    var isAuthenticated = function() {
      return self.state.authenticated;
    };

    app.router.setup(routingTable, {
      isAuthenticated: isAuthenticated,
      noAuthRoutes: noAuthRoutes,
      defaultNotAuthenticatedRoute: defaultNotAuthenticatedRoute,
      defaultAuthenticatedRoute: defaultAuthenticatedRoute
    });
    app.router.start();
  },

  render: function() {
    var overlay = this.renderOverlay();
    var navbar = this.renderNavbar();
    var notification = this.renderNotification();
    var page = this.renderPage();

    return (
      /* jshint ignore:start */
      <div className="app">
        {overlay}
        {navbar}
        {notification}
        {page}
      </div>
      /* jshint ignore:end */
    );
  },

  renderOverlay: function() {
    if (this.state.loggingOut) {
      return (
        /* jshint ignore:start */
        <LogoutOverlay ref="logoutOverlay" />
        /* jshint ignore:end */
      );
    }

    return null;
  },

  renderNavbar: function() {
    if (this.state.authenticated) {
      return (
        /* jshint ignore:start */
        <Navbar
          version={config.VERSION}
          user={this.state.user}
          onLogout={this.logout}
          imagesEndpoint={config.IMAGES_ENDPOINT + '/navbar'} />
        /* jshint ignore:end */
      );
    }

    return null;
  },

  renderNotification: function() {
    if (this.state.notification) {
      return (
        /* jshint ignore:start */
        <Notification 
          message={this.state.notification}
          onClose={this.closeNotification} />
        /* jshint ignore:end */
      );
    }

    return null;
  },

  // Override on route change
  renderPage: function() {
    return null;
  },

  redirectToDefaultRoute: function() {
    app.router.setRoute(defaultAuthenticatedRoute);
  },

  showLogin: function() {
    this.renderPage = this.renderLogin;
    this.setState({page: 'login'});
  },

  renderLogin: function() {
    return (
      /* jshint ignore:start */
      <Login 
        onValidate={this.validateUser}
        onSubmit={app.auth.login.bind(app.auth)}
        onSubmitSuccess={this.handleLoginSuccess} />
      /* jshint ignore:end */
    );
  },

  showSignup: function() {
    this.renderPage = this.renderSignup;
    this.setState({page: 'signup'});
  },

  renderSignup: function() {
    return (
      /* jshint ignore:start */
      <Signup  
        onValidate={this.validateUser}
        onSubmit={app.auth.signup.bind(app.auth)}
        onSubmitSuccess={this.handleSignupSuccess} />
      /* jshint ignore:end */
    );
  },

  showProfile: function() {
    this.renderPage = this.renderProfile;
    this.setState({page: 'profile'});
  },

  renderProfile: function() {
    return (
      /* jshint ignore:start */
      <Profile 
          user={this.state.user}
          onValidate={this.validateUser}
          onSubmit={this.updateUser}/>
      /* jshint ignore:end */
    );
  },

  showPatients: function() {
    this.renderPage = this.renderPatients;
    this.setState({page: 'patients'});
    this.fetchPatients();
  },

  renderPatients: function() {
    /* jshint ignore:start */
    return (
      <Patients 
          user={this.state.user}
          fetchingUser={_.isEmpty(this.state.user)}
          patients={this.state.patients}
          fetchingPatients={this.state.fetchingPatients}/>
    );
    /* jshint ignore:end */
  },

  handleLoginSuccess: function() {
    this.setState({authenticated: true});
    this.fetchUser();
    this.redirectToDefaultRoute();
  },

  handleSignupSuccess: function(user) {
    this.setState({
      authenticated: true,
      user: user
    });
    this.redirectToDefaultRoute();
  },

  logout: function() {
    var self = this;

    if (this.state.loggingOut) {
      return;
    }

    this.setState({loggingOut: true});

    app.auth.logout(function(err) {
      if (err) {
        self.setState({
          loggingOut: false,
          notification: err.message || 'An error occured while logging out.'
        });
        return;
      }
      self.refs.logoutOverlay.fadeOut(function() {
        self.setState({loggingOut: false});
      });
      self.handleLogoutSuccess();
    });
  },

  handleLogoutSuccess: function() {
    this.setState({authenticated: false});
    this.clearUserData();
    router.setRoute('/login');
  },

  closeNotification: function() {
    this.setState({notification: null});
  },

  fetchUser: function() {
    var self = this;

    app.api.user.get(function(err, user) {
      self.setState({user: user});
    });
  },

  fetchPatients: function() {
    var self = this;

    self.setState({fetchingPatients: true});

    app.api.patients.get(function(err, patients) {
      self.setState({
        patients: patients,
        fetchingPatients: false
      });
    });
  },

  clearUserData: function() {
    this.setState({
      user: null,
      patients: null
    });
  },

  validateUser: function(user) {
    return app.user.validate(user);
  },

  updateUser: function(user) {
    var self = this;
    var previousUser = this.state.user;

    // Optimistic update
    self.setState({user: user});

    app.api.user.put(user, function(err, user) {
      if (err) {
        self.setState({
          notification: err.message || 'An error occured while saving user.'
        });
        // Rollback
        self.setState({user: previousUser});
        return;
      }
      self.setState({user: user});
    });
  }
});

app.start = function() {
  var self = this;

  this.init(function() {
    self.component = React.renderComponent(
      /* jshint ignore:start */
      <AppComponent />,
      /* jshint ignore:end */
      document.getElementById('app')
    );

    self.log('App started');
  });
};

app.init = function(callback) {
  var self = this;

  function beginInit() {
    initNoTouch();
  }

  function initNoTouch() {
    detectTouchScreen();
    initApi();
  }

  function initApi() {
    self.api.init();
    initAuth();
  }

  function initAuth() {
    self.auth.init(callback);
  }

  beginInit();
};

module.exports = app;