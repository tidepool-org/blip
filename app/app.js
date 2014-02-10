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
var patient = require('./core/patient');

var detectTouchScreen = require('./core/notouch');

var Navbar = require('./components/navbar');
var LogoutOverlay = require('./components/logoutoverlay');
var Notification = require('./components/notification');

var Login = require('./pages/login');
var Signup = require('./pages/signup');
var Profile = require('./pages/profile');
var Patients = require('./pages/patients');
var Patient = require('./pages/patient');
var PatientEdit = require('./pages/patientedit');

var DEBUG = window.localStorage && window.localStorage.debug;

// Override with mock services if necessary
if (config.MOCK) {
  var mock = window.mock;
  var mockData = window.data || {};
  api = mock.api(api, {data: mockData});
  auth = mock.auth(auth);
}

var app = {
  log: bows('App'),
  auth: auth,
  api: api,
  user: user,
  patient: patient,
  router: router
};

window.app = app;

var routes = {
  '/': 'redirectToDefaultRoute',
  '/login': 'showLogin',
  '/signup': 'showSignup',
  '/profile': 'showProfile',
  '/patients': 'showPatients',
  '/patients/:id': 'showPatient',
  '/patients/:id/edit': 'showPatientEdit'
};

var noAuthRoutes = ['/login', '/signup'];

var defaultNotAuthenticatedRoute = '/login';
var defaultAuthenticatedRoute = '/patients';

// Shallow difference of two objects
// Returns all attributes and their values in `destination`
// that have different values from `source`
function objectDifference(destination, source) {
  var result = {};

  _.forEach(source, function(sourceValue, key) {
    var destinactionValue = destination[key];
    if (!_.isEqual(sourceValue, destinactionValue)) {
      result[key] = destinactionValue;
    }
  });

  return result;
}

var AppComponent = React.createClass({
  getInitialState: function() {
    return {
      authenticated: app.auth.isAuthenticated(),
      notification: null,
      page: null,
      user: null,
      fetchingUser: true,
      loggingOut: false,
      patients: null,
      fetchingPatients: true,
      patient: null,
      fetchingPatient: true
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

  componentWillUpdate: function(nextProps, nextState) {
    // Called on props or state changes
    // Since app main component has no props,
    // this will be called on a state change
    app.log('State changed');
    if (DEBUG) {
      var stateDiff = objectDifference(nextState, this.state);
      app.log(stateDiff);
    }
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
      var patient;

      if (this.isPatientVisibleInNavbar()) {
        patient = this.state.patient;
      }

      return (
        /* jshint ignore:start */
        <Navbar
          version={config.VERSION}
          user={this.state.user}
          fetchingUser={this.state.fetchingUser}
          patient={patient}
          fetchingPatient={this.state.fetchingPatient}
          onLogout={this.logout}
          imagesEndpoint={config.IMAGES_ENDPOINT + '/navbar'} />
        /* jshint ignore:end */
      );
    }

    return null;
  },

  isPatientVisibleInNavbar: function() {
    // Only show patient name in navbar on certain pages
    var page = this.state.page;
    var result = page && page.match(/^patients\//);
    return Boolean(result);
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
          fetchingUser={this.state.fetchingUser}
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
          fetchingUser={this.state.fetchingUser}
          patients={this.state.patients}
          fetchingPatients={this.state.fetchingPatients}/>
    );
    /* jshint ignore:end */
  },

  showPatient: function(patientId) {
    this.renderPage = this.renderPatient;
    this.setState({
      page: 'patients/' + patientId,
      // Reset patient object to avoid showing previous one
      patient: null,
      // Indicate renderPatient() that we are fetching the patient
      // (important to have this on next render)
      fetchingPatient: true
    });
    this.fetchPatient(patientId);
  },

  renderPatient: function() {
    // On each state change check if patient object was returned from server
    if (this.isDoneFetchingAndNotFoundPatient()) {
      app.log('Patient not found');
      this.redirectToDefaultRoute();
      return;
    }

    /* jshint ignore:start */
    return (
      <Patient
          user={this.state.user}
          fetchingUser={this.state.fetchingUser}
          patient={this.state.patient}
          fetchingPatient={this.state.fetchingPatient}/>
    );
    /* jshint ignore:end */
  },

  isDoneFetchingAndNotFoundPatient: function() {
    // Wait for patient object to come back from server
    if (this.state.fetchingPatient) {
      return false;
    }

    return !this.state.patient;
  },

  showPatientEdit: function(patientId) {
    this.renderPage = this.renderPatientEdit;
    this.setState({
      page: 'patients/' + patientId + '/edit',
      // Reset patient object to avoid showing previous one
      patient: null,
      // Indicate renderPatientEdit() that we are fetching the patient
      // (important to have this on next render)
      fetchingPatient: true
    });
    this.fetchPatient(patientId);
  },

  renderPatientEdit: function() {
    // On each state change check if user can edit this patient
    if (this.isDoneFetchingAndNotUserPatient()) {
      var patientId = this.state.patient && this.state.patient.id;
      var route = '/patients';
      if (patientId) {
        route = route + '/' + patientId;
      }
      app.log('Not allowed to edit patient with id ' + patientId);
      app.router.setRoute(route);
      return;
    }

    /* jshint ignore:start */
    return (
      <PatientEdit
          user={this.state.user}
          fetchingUser={this.state.fetchingUser}
          patient={this.state.patient}
          fetchingPatient={this.state.fetchingPatient}
          onValidate={this.validatePatient}
          onSubmit={this.updatePatient}/>
    );
    /* jshint ignore:end */
  },

  isDoneFetchingAndNotUserPatient: function(patientId) {
    // Wait to have both user and patient objects back from server
    if (this.state.fetchingUser || this.state.fetchingPatient) {
      return false;
    }

    return !user.isUserPatient(this.state.user, this.state.patient);
  },

  handleLoginSuccess: function() {
    this.fetchUser();
    this.setState({authenticated: true});
    this.redirectToDefaultRoute();
  },

  handleSignupSuccess: function(user) {
    this.setState({
      authenticated: true,
      user: user,
      fetchingUser: false
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

    self.setState({fetchingUser: true});

    app.api.user.get(function(err, user) {
      self.setState({
        user: user,
        fetchingUser: false
      });
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

  fetchPatient: function(patientId) {
    var self = this;

    self.setState({fetchingPatient: true});

    app.api.patient.get(patientId, function(err, patient) {
      if (err) {
        // Unauthorized, or not found
        app.log('Error fetching patient with id ' + patientId);
        self.setState({fetchingPatient: false});
        return;
      }

      self.setState({
        patient: patient,
        fetchingPatient: false
      });
    });
  },

  clearUserData: function() {
    this.setState({
      user: null,
      patients: null,
      patient: null
    });
  },

  validateUser: function(user) {
    return app.user.validate(user);
  },

  updateUser: function(user) {
    var self = this;
    var previousUser = this.state.user;

    user = _.assign(_.cloneDeep(this.state.user), user);

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
  },

  validatePatient: function(patient) {
    return app.patient.validate(patient);
  },

  updatePatient: function(patient) {
    var self = this;
    var previousPatient = this.state.patient;

    patient = _.assign(_.cloneDeep(this.state.patient), patient);

    // Optimistic update
    self.setState({patient: patient});

    app.api.patient.put(patient.id, patient, function(err, patient) {
      if (err) {
        self.setState({
          notification: err.message || 'An error occured while saving patient.'
        });
        // Rollback
        self.setState({patient: previousPatient});
        return;
      }
      self.setState({patient: patient});
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

    if (config.MOCK) {
      self.log('App running with mock services');
    }
  });
};

app.init = function(callback) {
  var self = this;

  function beginInit() {
    initNoTouch();
  }

  function initNoTouch() {
    detectTouchScreen();
    initAuth();
  }

  function initAuth() {
    self.auth.init(callback);
  }

  beginInit();
};

module.exports = app;