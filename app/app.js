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
var async = window.async;
var config = window.config;

// These requires will be deprecated when Tidepool Platform Client and Tideline
// have distribution bundles and export on the `window` object
var tidepool = require('./core/tidepool');
var tideline = require('./core/tideline');

var router = require('./router');
var api = require('./core/api');
var user = require('./core/user');
var patient = require('./core/patient');
var queryString = require('./core/querystring');
var chartUtil = require('./core/chartutil');
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
var PatientData = require('./pages/patientdata');

var DEBUG = window.localStorage && window.localStorage.debug;

// Initialize services talking to external APIs
// Override with mock services if necessary
if (config.MOCK) {
  var mock = window.mock;
  api = mock.patchApi(api);
}

var app = {
  log: bows('App'),
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
  '/patients/new': 'showPatientNew',
  '/patients/:id': 'showPatient',
  '/patients/:id/edit': 'showPatientEdit',
  '/patients/:id/data': 'showPatientData'
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
      authenticated: app.api.user.isAuthenticated(),
      notification: null,
      page: null,
      user: null,
      fetchingUser: true,
      loggingOut: false,
      patients: null,
      fetchingPatients: true,
      patient: null,
      fetchingPatient: true,
      patientData: null,
      fetchingPatientData: true,
      fetchingMessageData: true
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

    // Currently no-op
    var onRouteChange = function() {};

    app.router.setup(routingTable, {
      isAuthenticated: isAuthenticated,
      noAuthRoutes: noAuthRoutes,
      defaultNotAuthenticatedRoute: defaultNotAuthenticatedRoute,
      defaultAuthenticatedRoute: defaultAuthenticatedRoute,
      onRouteChange: onRouteChange
    });
    app.router.start();
  },

  componentWillUpdate: function(nextProps, nextState) {
    // Called on props or state changes
    // Since app main component has no props,
    // this will be called on a state change
    if (DEBUG) {
      var stateDiff = objectDifference(nextState, this.state);
      app.log('State changed', stateDiff);
    }
  },

  render: function() {
    var overlay = this.renderOverlay();
    var navbar = this.renderNavbar();
    var notification = this.renderNotification();
    var page = this.renderPage();

    /* jshint ignore:start */
    return (
      <div className="app">
        {overlay}
        {navbar}
        {notification}
        {page}
      </div>
    );
    /* jshint ignore:end */
  },

  renderOverlay: function() {
    if (this.state.loggingOut) {
      /* jshint ignore:start */
      return (
        <LogoutOverlay ref="logoutOverlay" />
      );
      /* jshint ignore:end */
    }

    return null;
  },

  renderNavbar: function() {
    if (this.state.authenticated) {
      var patient;
      var isUserPatient;
      var uploadUrl;

      if (this.isPatientVisibleInNavbar()) {
        patient = this.state.patient;
        isUserPatient = this.isUserPatient();
        uploadUrl = api.getUploadUrl();
      }

      return (
        /* jshint ignore:start */
        <Navbar
          version={config.VERSION}
          user={this.state.user}
          fetchingUser={this.state.fetchingUser}
          patient={patient}
          fetchingPatient={this.state.fetchingPatient}
          isUserPatient={isUserPatient}
          uploadUrl={uploadUrl}
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
        onSubmit={app.api.user.login.bind(app.api.user)}
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
        onSubmit={app.api.user.signup.bind(app.api.user)}
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
    this.fetchPatient(patientId,function(err,patient){
      return;
    });
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

  showPatientNew: function() {
    this.renderPage = this.renderPatientNew;
    this.setState({
      page: 'patients/new',
      patient: null,
      fetchingPatient: false
    });
  },

  renderPatientNew: function() {
    var patient;

    // Make sure user doesn't already have a patient
    if (this.isDoneFetchingAndUserHasPatient()) {
      patient = user.getPatientData(this.state.user);
      var patientId = patient.id;
      var route = '/patients';
      if (patientId) {
        route = route + '/' + patientId;
      }
      app.log('User already has patient');
      app.router.setRoute(route);
      return;
    }

    patient = _.pick(this.state.user, 'firstName', 'lastName');
    var fetchingPatient = this.state.fetchingUser;

    /* jshint ignore:start */
    return (
      <PatientEdit
          patient={patient}
          fetchingPatient={fetchingPatient}
          isNewPatient={true}
          onValidate={this.validatePatient}
          onSubmit={app.api.patient.post.bind(app.api.patient)}
          onSubmitSuccess={this.handlePatientCreationSuccess}/>
    );
    /* jshint ignore:end */
  },

  isDoneFetchingAndUserHasPatient: function() {
    // Wait to have user object back from server
    if (this.state.fetchingUser) {
      return false;
    }

    return !_.isEmpty(user.getPatientData(this.state.user));
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
          patient={this.state.patient}
          fetchingPatient={this.state.fetchingPatient}
          onValidate={this.validatePatient}
          onSubmit={this.updatePatient}/>
    );
    /* jshint ignore:end */
  },

  isDoneFetchingAndNotUserPatient: function() {
    // Wait to have both user and patient objects back from server
    if (this.state.fetchingUser || this.state.fetchingPatient) {
      return false;
    }

    return !this.isUserPatient();
  },

  isUserPatient: function() {
    return user.isUserPatient(this.state.user, this.state.patient);
  },

  showPatientData: function(patientId) {
    this.renderPage = this.renderPatientData;
    this.setState({
      page: 'patients/' + patientId + '/data',
      patient: null,
      fetchingPatient: true,
      patientData: null,
      fetchingPatientData: true
    });

    var self = this;
    this.fetchPatient(patientId, function(err, patient) {
      self.fetchPatientData(patient);
    });

  },

  renderPatientData: function() {
    // On each state change check if patient object was returned from server
    if (this.isDoneFetchingAndNotFoundPatient()) {
      app.log('Patient not found');
      this.redirectToDefaultRoute();
      return;
    }

    /* jshint ignore:start */
    return (
      <PatientData
        user={this.state.user}
        patientData={this.state.patientData}
        fetchingPatientData={this.state.fetchingPatientData}
        isUserPatient={this.isUserPatient()}
        uploadUrl={api.getUploadUrl()}
        onRefresh={this.fetchCurrentPatientData}
        onFetchMessageThread={this.fetchMessageThread}
        onSaveComment={app.api.team.replyToMessageThread.bind(app.api.team)} />
    );
    /* jshint ignore:end */
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

    app.api.user.logout(function(err) {
      if (err) {
        self.setState({
          loggingOut: false,
          notification: 'An error occured while logging out.'
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
    // Nasty race condition between React state change and router it seems,
    // need to call `showLogin()` to make sure we don't try to render something
    // else, although it will get called again after router changes route, but
    // that's ok
    this.showLogin();
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

    app.api.patient.getAll(function(err, patients) {
      self.setState({
        patients: patients,
        fetchingPatients: false
      });
    });
  },

  fetchPatient: function(patientId, callback) {
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

      //so that if the cb is defined we can use the
      //patient to load other information
      if(callback){
        return callback(null,patient);
      }
    });
  },

  fetchPatientData: function(patient) {
    var self = this;

    var patientId = patient.id;
    var teamId = patient.team && patient.team.id;

    self.setState({fetchingPatientData: true});

    var loadPatientData = function(cb) {
      app.api.patientData.get(patientId,cb);
    };

    var loadTeamNotes = function(cb) {
      app.api.team.getNotes(teamId,cb);
    };

    async.parallel({
      patientData: loadPatientData,
      teamNotes: loadTeamNotes
    },
    function(err, results) {
      if (err) {
        app.log('Error fetching data for patient with id ' + patientId, err);
        self.setState({fetchingPatientData: false});
        return;
      }

      var notes = results.teamNotes;
      var patientData = results.patientData;

      if(notes){
        app.log('found notes: ',notes.length);
        patientData = _.union(patientData,notes);
      }

      patientData = self.processPatientData(patientData);
      self.logPatientDataInfo(patientData);

      self.setState({
        patientData: patientData,
        fetchingPatientData: false
      });
    });
  },

  fetchMessageThread: function(messageId,callback) {
    app.log('fetching messages for ' + messageId);

    var self = this;
    self.setState({fetchingMessageData: true});

    app.api.team.getMessageThread(messageId,function(error,thread){
      self.setState({fetchingMessageData: false});
      if (error) {
        app.log('Error fetching data for message thread with id ' + messageId);
        return callback(null);
      }
      app.log('thread pulled back '+thread.length);
      return callback(thread);
    });
  },

  processPatientData: function(data) {
    return chartUtil.processData(data);
  },

  logPatientDataInfo: function(data) {
    data = data || [];
    app.log('Patient data total count', data.length);
    app.log('Patient data count by type', _.countBy(data, 'type'));
  },

  fetchCurrentPatientData: function() {
    var patient = this.state.patient;

    if (!patient) {
      return;
    }

    this.fetchPatientData(patient);
  },

  clearUserData: function() {
    this.setState({
      user: null,
      patients: null,
      patient: null,
      patientData: null
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
          notification: 'An error occured while saving user.'
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

  handlePatientCreationSuccess: function(patient) {
    this.setState({
      user: _.extend({}, this.state.user, {
        patient: {id: patient.id}
      }),
      patient: patient
    });
    var route = '/patients/' + patient.id + '/data';
    app.router.setRoute(route);
  },

  updatePatient: function(patient) {
    var self = this;
    var previousPatient = this.state.patient;

    patient = _.assign(_.cloneDeep(this.state.patient), patient);
    // Don't save info already in user's profile
    patient = _.omit(patient, 'firstName', 'lastName');

    // Optimistic update
    self.setState({patient: patient});

    app.api.patient.put(patient.id, patient, function(err, patient) {
      if (err) {
        self.setState({
          notification: 'An error occured while saving patient.'
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
    initMock();
  }

  function initMock() {
    if (config.MOCK) {
      // Load mock params from config variables
      // and URL query string (before hash)
      var paramsConfig = queryString.parseTypes(config.MOCK_PARAMS);
      var paramsUrl = queryString.parseTypes(window.location.search);
      var params = _.assign(paramsConfig, paramsUrl);

      mock.init(params);
      self.log('Mock services initialized with params', params);
    }
    initApi();
  }

  function initApi() {
    self.api.init(callback);
  }

  beginInit();
};

module.exports = app;
