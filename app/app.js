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
var async = require('async');
var sundial = require('sundial');

var nurseShark = require('tideline/plugins/nurseshark/');
var TidelineData = require('tideline/js/tidelinedata');

var config = require('./config');
var router = require('./router');
var api = require('./core/api');
var personUtils = require('./core/personutils');
var queryString = require('./core/querystring');
var detectTouchScreen = require('./core/notouch');
var utils = require('./core/utils');

var usrMessages = require('./userMessages');

var Navbar = require('./components/navbar');
var LogoutOverlay = require('./components/logoutoverlay');
var BrowserWarningOverlay = require('./components/browserwarningoverlay');
var TidepoolNotification = require('./components/notification');
var TermsOverlay = require('./components/termsoverlay');
var MailTo = require('./components/mailto');

var Login = require('./pages/login');
var Signup = require('./pages/signup');
var Profile = require('./pages/profile');
var Patients = require('./pages/patients');
var Patient = require('./pages/patient');
var PatientNew = require('./pages/patientnew');
var PatientData = require('./pages/patientdata');
var RequestPasswordReset = require('./pages/passwordreset/request');
var ConfirmPasswordReset = require('./pages/passwordreset/confirm');
var EmailVerification = require('./pages/emailverification');

// Styles
require('tideline/css/tideline.less');
require('./core/less/fonts.less');
require('./style.less');

// Blip favicon
require('../favicon.ico');

// For React developer tools
window.React = React;

// Push state to be able to always go back in browser history within the app
var path = window.location.hash;
window.history.pushState(null, null, '#/patients');
window.history.pushState(null, null, path);

var DEBUG = window.localStorage && window.localStorage.debug;

var app = {
  log: bows('App'),
  api: api,
  personUtils: personUtils,
  router: router
};

// List of routes and associated handlers which display/render the routes
var routes = {
  '/': 'redirectToDefaultRoute',
  '/login': 'showLogin',
  '/signup': 'showSignup',
  '/email-verification' : 'showEmailVerification',
  '/profile': 'showProfile',
  '/patients': 'showPatients',
  '/patients/new': 'showPatientNew',
  '/patients/:id/profile': 'showPatient',
  '/patients/:id/share': 'showPatientShare',
  '/patients/:id/data': 'showPatientData',
  '/request-password-reset': 'showRequestPasswordReset',
  '/confirm-password-reset': 'showConfirmPasswordReset',
  '/request-password-from-uploader': 'handleExternalPasswordUpdate'
};

// List of routes that are accessible to logged-out users
var noAuthRoutes = [
  '/login',
  '/signup',
  '/email-verification',
  '/request-password-reset',
  '/confirm-password-reset'
];

// List of routes that are requested from other apps
// (like the Chrome Uploader, for example)
var externalAppRoutes = [
  '/request-password-from-uploader'
];

var defaultNotAuthenticatedRoute = '/login';
var defaultAuthenticatedRoute = '/patients';

// Shallow difference of two objects
// Returns all attributes and their values in `destination`
// that have different values from `source`
function objectDifference(destination, source) {
  var result = {};

  _.forEach(source, function(sourceValue, key) {
    var destinationValue = destination[key];
    if (!_.isEqual(sourceValue, destinationValue)) {
      result[key] = destinationValue;
    }
  });

  return result;
}

function trackMetric() {
  var args = Array.prototype.slice.call(arguments);
  return app.api.metrics.track.apply(app.api.metrics, args);
}

function buildExceptionDetails(){
  return {
    href: window.location.href,
    stack: console.trace()
  };
}

var AppComponent = React.createClass({
  getInitialState: function() {
    var queryParams = queryString.parseTypes(window.location.search);
    var timePrefs = {
      timezoneAware: false,
      // TODO: remove hardcoding of this in future once we actually introduce arbitrary timezone support
      timezoneName: 'US/Pacific'
    };
    if (!_.isEmpty(queryParams.timezone)) {
      var queryTimezone = queryParams.timezone.replace('-', '/');
      try {
        sundial.checkTimezoneName(queryTimezone);
        timePrefs.timezoneAware = true;
        timePrefs.timezoneName = queryTimezone;
        app.log('Viewing data in timezone-aware mode with', queryTimezone, 'as the selected timezone.');
      }
      catch(err) {
        console.log(new Error('Invalid timezone name in query parameter. (Try capitalizing properly.)'));
      }
    }
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
      invites: null,
      fetchingInvites: true,
      pendingInvites:null,
      fetchingPendingInvites: true,
      bgPrefs: null,
      timePrefs: timePrefs,
      patientData: null,
      fetchingPatientData: true,
      fetchingMessageData: true,
      showingAcceptTerms: false,
      showingWelcomeTitle: false,
      showingWelcomeSetup: false,
      showPatientData: false,
      dismissedBrowserWarning: false,
      verificationEmailSent: false,
      finalizingVerification: false,
      queryParams: queryParams
    };
  },

  doOauthLogin:function(accessToken){

    var self = this;
    app.api.user.oauthLogin(accessToken, function(err, data){
      if(_.isEmpty(err)){
        app.log('Logged in via OAuth');
        self.fetchUser();
        self.setState({authenticated: true});
        trackMetric('Logged In with OAuth');
        //go to the specified patient if there is one
        if(_.isEmpty(data.target)){
          app.log('No targeted OAuth user so defaulting');
          self.redirectToDefaultRoute();
        }else{
          app.log('Using the targeted OAuth user');
          app.router.setRoute('/patients/' + data.target + '/data');
        }
      }else{
        app.log('Login via OAuth failed ', err);
      }
    });
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
      externalAppRoutes: externalAppRoutes,
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
    var footer = this.renderFooter();

    /* jshint ignore:start */
    return (
      <div className="app" onClick={this.hideNavbarDropdown}>
        {overlay}
        {navbar}
        {notification}
        {page}
        {footer}
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

    if (!utils.isChrome() && !this.state.dismissedBrowserWarning) {
      /* jshint ignore:start */
      return (
        <BrowserWarningOverlay onSubmit={this.handleAcceptedBrowserWarning} />
      );
      /* jshint ignore:end */
    }

    if (this.state.showingAcceptTerms) {
      /* jshint ignore:start */
      return (
        <TermsOverlay
          onSubmit={this.handleAcceptedTerms}
          trackMetric={trackMetric} />
      );
      /* jshint ignore:end */
    }

    return null;
  },

  renderNavbar: function() {
    if (this.state.authenticated) {
      var patient;
      var getUploadUrl;

      if (this.isPatientVisibleInNavbar()) {
        patient = this.state.patient;
        getUploadUrl = app.api.getUploadUrl.bind(app.api);
      }

      return (
        /* jshint ignore:start */
        <div className="App-navbar">
          <Navbar
            user={this.state.user}
            fetchingUser={this.state.fetchingUser}
            patient={patient}
            fetchingPatient={this.state.fetchingPatient}
            currentPage={this.state.page}
            getUploadUrl={getUploadUrl}
            onLogout={this.logout}
            trackMetric={trackMetric}
            ref="navbar"/>
        </div>
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
    var notification = this.state.notification;
    var handleClose;

    if (notification) {
      if (notification.isDismissable) {
        handleClose = this.closeNotification;
      }

      return (
        /* jshint ignore:start */
        <TidepoolNotification
          type={notification.type}
          onClose={handleClose}>
          {notification.body}
        </TidepoolNotification>
        /* jshint ignore:end */
      );
    }

    return null;
  },

  logSupportContact: function(){
    trackMetric('Clicked Give Feedback');
  },

  renderFooter: function() {

    var title ='Send us feedback';
    var subject = 'Feedback on Blip';

    return (
      /* jshint ignore:start */
      <div className='container-small-outer footer'>
        <div className='container-small-inner'>
          <MailTo
            linkTitle={title}
            emailAddress={'support@tidepool.org'}
            emailSubject={subject}
            onLinkClicked={this.logSupportContact} />
        </div>
        {this.renderVersion()}
      </div>
      /* jshint ignore:end */
    );
  },

  renderVersion: function() {
    var version = config.VERSION;
    if (version) {
      version = 'v' + version + ' beta';
      return (
        /* jshint ignore:start */
        <div className="Navbar-version" ref="version">{version}</div>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  // Override on route change
  renderPage: function() {
    return null;
  },

  showLogin: function() {
    var hashQueryParams = app.router.getQueryParams();
    if (!_.isEmpty(hashQueryParams.accessToken)) {
      app.log('logging in via OAuth ...');
      this.doOauthLogin(hashQueryParams.accessToken);
    } else {
      this.renderPage = this.renderLogin;
      //always check
      this.finializeSignup();
      this.setState({page: 'login'});
    }
  },

  renderLogin: function() {
    var email = this.getInviteEmail() || this.getSignupEmail();
    var showAsInvite = !_.isEmpty(this.getInviteEmail());
    return (
      /* jshint ignore:start */
      <Login
        onSubmit={this.login}
        seedEmail={email}
        isInvite={showAsInvite}
        onSubmitSuccess={this.handleLoginSuccess}
        onSubmitNotAuthorized={this.handleNotAuthorized}
        trackMetric={trackMetric} />
      /* jshint ignore:end */
    );
  },

  getSignupEmail: function() {
    var hashQueryParams = app.router.getQueryParams();
    var email = hashQueryParams.signupEmail;
    if (!_.isEmpty(email) && utils.validateEmail(email)){
      return email;
    }
    return null;
  },

  getInviteEmail: function() {
    var hashQueryParams = app.router.getQueryParams();
    var email = hashQueryParams.inviteEmail;
    if(!_.isEmpty(email) && utils.validateEmail(email)){
      return email;
    }
    return null;
  },

  finializeSignup: function() {
    var self = this;

    var hashQueryParams = app.router.getQueryParams();
    if(!_.isEmpty(hashQueryParams.signupKey) && !this.state.finalizingVerification){
      app.api.user.confirmSignUp(hashQueryParams.signupKey, function(err){
        if(err){
          app.log('finializeSignup err ',err);
        }
        self.setState({finalizingVerification:true});
      });
    }
    return;
  },

  showSignup: function() {
    this.renderPage = this.renderSignup;
    this.setState({page: 'signup'});
  },

  showEmailVerification: function() {
    this.renderPage = this.renderEmailVerification;
    this.setState({page: 'email-verification'});
  },

  renderSignup: function() {
    return (
      /* jshint ignore:start */
      <Signup
        onSubmit={this.signup}
        inviteEmail={this.getInviteEmail()}
        onSubmitSuccess={this.handleSignupSuccess}
        trackMetric={trackMetric} />
      /* jshint ignore:end */
    );
  },

  renderEmailVerification: function() {
    return (
      /* jshint ignore:start */
      <EmailVerification
        sent={this.state.verificationEmailSent}
        onSubmitResend={api.user.resendEmailVerification.bind(app.api)}
        trackMetric={trackMetric}/>
      /* jshint ignore:end */
    );
  },

  showProfile: function() {
    this.renderPage = this.renderProfile;
    this.setState({page: 'profile'});
    trackMetric('Viewed Account Edit');
  },

  renderProfile: function() {
    return (
      /* jshint ignore:start */
      <Profile
          user={this.state.user}
          fetchingUser={this.state.fetchingUser}
          onSubmit={this.updateUser}
          trackMetric={trackMetric}/>
      /* jshint ignore:end */
    );
  },

  redirectToDefaultRoute: function() {
    this.showPatients(true);
  },
  showPatients: function(showPatientData) {
    this.setState({showPatientData: showPatientData});
    this.renderPage = this.renderPatients;
    this.setState({page: 'patients'});
    this.fetchInvites();
    this.fetchPatients();
    trackMetric('Viewed Care Team List');
  },
  renderPatients: function() {
    var patients;
    /* jshint ignore:start */
    patients = <Patients
        user={this.state.user}
        fetchingUser={this.state.fetchingUser}
        patients={this.state.patients}
        fetchingPatients={this.state.fetchingPatients}
        invites={this.state.invites}
        uploadUrl={app.api.getUploadUrl()}
        fetchingInvites={this.state.fetchingInvites}
        showingWelcomeTitle={this.state.showingWelcomeTitle}
        showingWelcomeSetup={this.state.showingWelcomeSetup}
        onHideWelcomeSetup={this.handleHideWelcomeSetup}
        trackMetric={trackMetric}
        onAcceptInvitation={this.handleAcceptInvitation}
        onDismissInvitation={this.handleDismissInvitation}
        onRemovePatient={this.handleRemovePatient}/>;
    /* jshint ignore:end */

    // Determine whether to skip the Patients page & go directly to Patient data.
    // If there is only one patient you can see data for, go to the patient's data.
    // Otherwise, display the Patients page.
    if (this.state.showPatientData) {

      if (!this.state.fetchingUser && !this.state.fetchingPatients && !this.state.fetchingInvites) {

        var viewerUserId = null;
        var isPatient = personUtils.isPatient(this.state.user);
        var numPatientsUserCanSee = (this.state.patients == null) ? 0 : this.state.patients.length;

        // First check that the user has no pending invites
        if (_.isEmpty(this.state.invites)) {

          // Then determine how many people the user can view
          if (isPatient) {
            if (numPatientsUserCanSee === 0) {
              viewerUserId = this.state.user.userid;
            }
          } else {
            if (numPatientsUserCanSee === 1) {
              viewerUserId = this.state.patients[0].userid;
            }
          }

          // Last, set the appropriate route
          if (viewerUserId === null) {
            app.router.setRoute('/patients');
            return;
          } else {
            app.router.setRoute('/patients/' + viewerUserId + '/data');
            return;
          }
        }

        app.router.setRoute('/patients');
      }

      return;
    }

    return (patients);
  },
  handleHideWelcomeSetup: function(options) {
    if (options && options.route) {
      app.router.setRoute(options.route);
    }
    this.setState({showingWelcomeSetup: false});
  },
  handleDismissInvitation: function(invitation) {
    var self = this;

    this.setState({
      showingWelcomeSetup: false,
      invites: _.filter(this.state.invites, function(e){
        return e.key !== invitation.key;
      })
    });

    app.api.invitation.dismiss(invitation.key, invitation.creator.userid, function(err) {
      if(err) {
        self.setState({
          invites: self.state.invites.concat(invitation)
        });
       return self.handleApiError(err, usrMessages.ERR_DISMISSING_INVITE, buildExceptionDetails());
      }
    });
  },
  handleAcceptInvitation: function(invitation) {
    var invites = _.cloneDeep(this.state.invites);
    var self = this;

    this.setState({
      showingWelcomeSetup: false,
      invites: _.map(invites, function(invite) {
        if (invite.key === invitation.key) {
          invite.accepting = true;
        }
        return invite;
      })
    });

    app.api.invitation.accept(invitation.key, invitation.creator.userid, function(err) {

      var invites = _.cloneDeep(self.state.invites);
      if (err) {
        self.setState({
          invites: _.map(invites, function(invite) {
            if (invite.key === invitation.key) {
              invite.accepting = false;
            }
            return invite;
          })
        });
        return self.handleApiError(err, usrMessages.ERR_ACCEPTING_INVITE, buildExceptionDetails());
      }

      self.setState({
        invites: _.filter(invites, function(e){
          return e.key !== invitation.key;
        }),
        patients: self.state.patients.concat(invitation.creator)
      });
    });
  },
  handleChangeMemberPermissions: function(patientId, memberId, permissions, cb) {
    var self = this;

    api.access.setMemberPermissions(memberId, permissions, function(err) {
      if(err) {
        cb(err);
        return self.handleApiError(err, usrMessages.ERR_CHANGING_PERMS, buildExceptionDetails());
      }

      self.fetchPatient(patientId, cb);
    });
  },
  handleRemovePatient: function(patientId,cb) {
    var self = this;

    api.access.leaveGroup(patientId, function(err) {
      if(err) {

        return self.handleApiError(err, usrMessages.ERR_REMOVING_MEMBER, buildExceptionDetails());

      }

      self.fetchPatients();
    });
  },
  handleRemoveMember: function(patientId, memberId, cb) {
    var self = this;

    api.access.removeMember(memberId, function(err) {
      if(err) {
        cb(err);
        return self.handleApiError(err, usrMessages.ERR_REMOVING_MEMBER ,buildExceptionDetails());
      }

      self.fetchPatient(patientId, cb);
    });
  },
  handleInviteMember: function(email, permissions, cb) {
    var self = this;

    api.invitation.send(email, permissions, function(err, invitation) {
      if(err) {
        if (cb) {
          cb(err);
        }
        if (err.status === 500) {
          return self.handleApiError(err, usrMessages.ERR_INVITING_MEMBER, buildExceptionDetails());
        }
        return;
      }

      self.setState({
        pendingInvites: utils.concat(self.state.pendingInvites || [], invitation)
      });
      if (cb) {
        cb(null, invitation);
      }
      self.fetchPendingInvites();
    });
  },
  handleCancelInvite: function(email, cb) {
    var self = this;

    api.invitation.cancel(email, function(err) {
      if(err) {
        if (cb) {
          cb(err);
        }
        return self.handleApiError(err, usrMessages.ERR_CANCELING_INVITE, buildExceptionDetails());
      }

      self.setState({
        pendingInvites: _.reject(self.state.pendingInvites, function(i) {
          return i.email === email;
        })
      });
      if (cb) {
        cb();
      }
      self.fetchPendingInvites();
    });
  },
  showPatient: function(patientId) {
    this.renderPage = this.renderPatient;
    this.setState({
      page: 'patients/' + patientId + '/profile',
      // Reset patient object to avoid showing previous one
      patient: null,
      // Indicate renderPatient() that we are fetching the patient
      // (important to have this on next render)
      fetchingPatient: true
    });
    this.fetchPendingInvites();
    this.fetchPatient(patientId,function(err,patient){
      return;
    });
    trackMetric('Viewed Profile');
  },
  showPatientShare: function(patientId) {
    this.renderPage = this.renderPatientShare;
    this.setState({
      page: 'patients/' + patientId + '/share',
      // Reset patient object to avoid showing previous one
      patient: null,
      // Indicate renderPatient() that we are fetching the patient
      // (important to have this on next render)
      fetchingPatient: true
    });
    this.fetchPendingInvites();
    this.fetchPatient(patientId,function(err,patient){
      return;
    });
    trackMetric('Viewed Share');
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
        fetchingPatient={this.state.fetchingPatient}
        onUpdatePatient={this.updatePatient}
        pendingInvites={this.state.pendingInvites}
        onChangeMemberPermissions={this.handleChangeMemberPermissions}
        onRemoveMember={this.handleRemoveMember}
        onInviteMember={this.handleInviteMember}
        onCancelInvite={this.handleCancelInvite}
        trackMetric={trackMetric}/>
    );
    /* jshint ignore:end */
  },
  renderPatientShare: function() {
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
        shareOnly={true}
        fetchingUser={this.state.fetchingUser}
        patient={this.state.patient}
        fetchingPatient={this.state.fetchingPatient}
        onUpdatePatient={this.updatePatient}
        pendingInvites={this.state.pendingInvites}
        onChangeMemberPermissions={this.handleChangeMemberPermissions}
        onRemoveMember={this.handleRemoveMember}
        onInviteMember={this.handleInviteMember}
        onCancelInvite={this.handleCancelInvite}
        trackMetric={trackMetric}/>
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
    trackMetric('Viewed Profile Create');
  },
  renderPatientNew: function() {
    // Make sure user doesn't already have a patient
    if (this.isDoneFetchingAndUserHasPatient()) {
      var patientId = this.state.user.userid;
      var route = '/patients/' + patientId;
      app.log('User already has patient');
      app.router.setRoute(route);
      return;
    }

    /* jshint ignore:start */
    return (
      <PatientNew
          user={this.state.user}
          fetchingUser={this.state.fetchingUser}
          onSubmit={this.createPatient}
          onSubmitSuccess={this.handlePatientCreationSuccess}
          trackMetric={trackMetric}/>
    );
    /* jshint ignore:end */
  },
  isDoneFetchingAndUserHasPatient: function() {
    // Wait to have user object back from server
    if (this.state.fetchingUser) {
      return false;
    }

    return personUtils.isPatient(this.state.user);
  },
  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.state.user, this.state.patient);
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

    trackMetric('Viewed Data');
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
        patient={this.state.patient}
        bgPrefs={this.state.bgPrefs}
        timePrefs={this.state.timePrefs}
        patientData={this.state.patientData}
        fetchingPatientData={this.state.fetchingPatientData}
        isUserPatient={this.isSamePersonUserAndPatient()}
        queryParams={this.state.queryParams}
        uploadUrl={app.api.getUploadUrl()}
        onRefresh={this.fetchCurrentPatientData}
        onFetchMessageThread={this.fetchMessageThread}
        onSaveComment={app.api.team.replyToMessageThread.bind(app.api.team)}
        onCreateMessage={app.api.team.startMessageThread.bind(app.api.team)}
        onEditMessage={app.api.team.editMessage.bind(app.api.team)}
        onUpdatePatientData={this.handleUpdatePatientData}
        trackMetric={trackMetric}/>
    );
    /* jshint ignore:end */
  },
  handleUpdatePatientData: function(userid, data) {
    var patientData = _.cloneDeep(this.state.patientData);
    patientData[userid] = data;
    this.setState({
      patientData: patientData
    });
  },
  login: function(formValues, cb) {
    var user = formValues.user;
    var options = formValues.options;

    app.api.user.login(user, options, cb);
  },

  handleLoginSuccess: function() {

    this.fetchUser();
    if( this.state.finalizingVerification ){
      this.setState({
        showingAcceptTerms: config.SHOW_ACCEPT_TERMS ? true : false,
        showingWelcomeTitle: true,
        showingWelcomeSetup: true
      });
      trackMetric('Finalized Signup');
    }
    this.setState({authenticated: true});
    this.redirectToDefaultRoute();
    trackMetric('Logged In');
  },

  handleNotAuthorized:function(){
     this.setState({authenticated: false,  verificationEmailSent: false});
     this.showEmailVerification();
  },

  signup: function(formValues, cb) {
    var user = formValues;
    app.api.user.signup(user, cb);
  },

  handleSignupSuccess: function(user) {
    //once signed up we need to authenicate the email which is done via the email we have sent them
    this.setState({
      fetchingUser: false,
      verificationEmailSent: true
    });

    this.showEmailVerification();

    trackMetric('Signed Up');
  },

  handleSignupVerificationSuccess: function(user) {
    //once signed up we need to authenicate the email which is done via the email we have sent them
    this.setState({
      authenticated: true,
      user: user,
      fetchingUser: false,
      showingAcceptTerms: config.SHOW_ACCEPT_TERMS ? true : false,
      showingWelcomeTitle: true,
      showingWelcomeSetup: true
    });

    this.redirectToDefaultRoute();
    trackMetric('Signup Verified');
  },

  handleAcceptedTerms: function() {
    this.setState({
      showingAcceptTerms: false
    });
  },

  handleAcceptedBrowserWarning: function() {
    this.setState({
      dismissedBrowserWarning: true
    });
  },

  logout: function() {
    var self = this;

    if (this.state.loggingOut) {
      return;
    }

    this.setState({
      loggingOut: true,
      dismissedBrowserWarning: false
    });

    // Need to track this before expiring auth token
    trackMetric('Logged Out');

    //Logout but don't wait for details
    app.api.user.logout();

    self.setState({loggingOut: false});

    self.handleLogoutSuccess();
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
      if (err) {
        self.setState({fetchingUser: false});
        return self.handleApiError(err, usrMessages.ERR_FETCHING_USER, buildExceptionDetails());
      }

      self.setState({
        user: user,
        fetchingUser: false
      });
    });
  },

  fetchPendingInvites: function(cb) {
    var self = this;

    self.setState({fetchingPendingInvites: true});

    api.invitation.getSent(function(err, invites) {
      if (err) {
        self.setState({
          fetchingPendingInvites: false
        });

        if (cb) {
          cb(err);
        }

        return self.handleApiError(err, usrMessages.ERR_FETCHING_PENDING_INVITES, buildExceptionDetails());
      }

      self.setState({
        pendingInvites: invites,
        fetchingPendingInvites: false
      });

      if (cb) {
        cb();
      }
    });
  },

  fetchInvites: function() {
    var self = this;

    self.setState({fetchingInvites: true});

    api.invitation.getReceived(function(err, invites) {
      if (err) {

        self.setState({
          fetchingInvites: false
        });

        return self.handleApiError(err, usrMessages.ERR_FETCHING_INVITES, buildExceptionDetails());
      }

      self.setState({
        invites: invites,
        fetchingInvites: false
      });
    });
  },

  fetchPatients: function(options) {
    var self = this;

    if(options && !options.hideLoading) {
        self.setState({fetchingPatients: true});
    }

    app.api.patient.getAll(function(err, patients) {
      if (err) {
        self.setState({fetchingPatients: false});
        return self.handleApiError(err, usrMessages.ERR_FETCHING_TEAMS, buildExceptionDetails());
      }

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
        if (err.status === 404) {
          app.log('Patient not found with id '+patientId);
          var setupMsg = (patientId === self.state.user.userid) ? usrMessages.ERR_YOUR_ACCOUNT_NOT_CONFIGURED : usrMessages.ERR_ACCOUNT_NOT_CONFIGURED;
          var dataStoreLink = (<a href="#/patients/new" onClick={self.closeNotification}>{usrMessages.YOUR_ACCOUNT_DATA_SETUP}</a>);
          return self.handleActionableError(err, setupMsg, dataStoreLink);
        }
        // we can't deal with it so just show error handler
        return self.handleApiError(err, usrMessages.ERR_FETCHING_PATIENT+patientId, buildExceptionDetails());
      }

      self.setState({
        patient: patient,
        fetchingPatient: false
      });

      if (typeof callback === 'function') {
        callback(null, patient);
      }
    });
  },

  fetchPatientData: function(patient) {
    var self = this;

    var patientId = patient.userid;

    self.setState({fetchingPatientData: true});

    var loadPatientData = function(cb) {
      app.api.patientData.get(patientId, cb);
    };

    var loadTeamNotes = function(cb) {
      app.api.team.getNotes(patientId, cb);
    };

    async.parallel({
      patientData: loadPatientData,
      teamNotes: loadTeamNotes
    },
    function(err, results) {
      if (err) {
        self.setState({fetchingPatientData: false});
        // Patient with id not found, cary on
        if (err.status === 404) {
          app.log('No data found for patient '+patientId);
          return;
        }

        return self.handleApiError(err, usrMessages.ERR_FETCHING_PATIENT_DATA+patientId, buildExceptionDetails());
      }

      var patientData = results.patientData || [];
      var notes = results.teamNotes || [];

      app.log('Patient device data count', patientData.length);
      app.log('Team notes count', notes.length);

      var combinedData = patientData.concat(notes);
      window.downloadInputData = function() {
        console.save(combinedData, 'blip-input.json');
      };
      patientData = self.processPatientData(combinedData);
      var allPatientsData = _.cloneDeep(self.state.patientData) || {};
      allPatientsData[patientId] = patientData;

      self.setState({
        bgPrefs: {
          bgClasses: patientData.bgClasses,
          bgUnits: patientData.bgUnits
        },
        patientData: allPatientsData,
        fetchingPatientData: false
      });
    });
  },

  fetchMessageThread: function(messageId,callback) {
    app.log('fetching messages for ' + messageId);

    var self = this;
    self.setState({fetchingMessageData: true});

    app.api.team.getMessageThread(messageId,function(err, thread){
      self.setState({fetchingMessageData: false});

      if (err) {
        self.handleApiError(err, usrMessages.ERR_FETCHING_MESSAGE_DATA+messageId, buildExceptionDetails());
        return callback(null);
      }

      app.log('Fetched message thread with '+thread.length+' messages');
      return callback(thread);
    });
  },

  processPatientData: function(data) {
    if (!(data && data.length >= 0)) {
      return null;
    }

    console.time('Nurseshark Total');
    var res = nurseShark.processData(data, this.state.timePrefs);
    console.timeEnd('Nurseshark Total');
    console.time('TidelineData Total');
    var tidelineData = new TidelineData(res.processedData, {timePrefs: this.state.timePrefs});
    console.timeEnd('TidelineData Total');

    window.tidelineData = tidelineData;
    window.downloadProcessedData = function() {
      console.save(res.processedData, 'nurseshark-output.json');
    };
    window.downloadErroredData = function() {
      console.save(res.erroredData, 'errored.json');
    };

    return tidelineData;
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
      patientData: null,
      showingAcceptTerms: false,
      showingWelcomeTitle: false,
      finalizingVerification: false,
      fetchingUser: true,
      fetchingPatients: true,
      fetchingInvites: true,
      showingWelcomeSetup: false,
      dismissedBrowserWarning: false,
      showPatientData: false
    });
  },

  updateUser: function(formValues) {
    var self = this;
    var previousUser = this.state.user;

    var newUser = _.assign(
      {},
      _.omit(previousUser, 'profile'),
      _.omit(formValues, 'profile'),
      {profile: _.assign({}, previousUser.profile, formValues.profile)}
    );

    // Optimistic update
    self.setState({user: _.omit(newUser, 'password')});

    var userUpdates = _.cloneDeep(newUser);
    // If username hasn't changed, don't try to update
    // or else backend will respond with "already taken" error
    if (userUpdates.username === previousUser.username) {
      userUpdates = _.omit(userUpdates, 'username', 'emails');
    }

    app.api.user.put(userUpdates, function(err, user) {
      if (err) {
        // Rollback
        self.setState({user: previousUser});
        return self.handleApiError(err, usrMessages.ERR_UPDATING_ACCOUNT, buildExceptionDetails());
      }

      user = _.assign(newUser, user);
      self.setState({user: user});
      trackMetric('Updated Account');
    });
  },

  createPatient: function(patient, cb) {
    app.api.patient.post(patient, cb);
  },

  handlePatientCreationSuccess: function(patient) {
    trackMetric('Created Profile');
    this.setState({
      user: _.extend({}, this.state.user, {
        profile: _.cloneDeep(patient.profile)
      }),
      patient: patient
    });
    var route = '/patients/' + patient.userid + '/data';
    app.router.setRoute(route);
  },

  updatePatient: function(patient) {
    var self = this;
    var previousPatient = this.state.patient;

    // Optimistic update
    self.setState({patient: patient});

    app.api.patient.put(patient, function(err, patient) {
      if (err) {
        // Rollback
        self.setState({patient: previousPatient});
        return self.handleApiError(err, usrMessages.ERR_UPDATING_PATIENT, buildExceptionDetails());
      }
      self.setState({
        patient: _.assign({}, previousPatient, {profile: patient.profile})
      });
      trackMetric('Updated Profile');
    });
  },

  handleApiError: function(error, message, details) {

    var utcTime = usrMessages.MSG_UTC + new Date().toISOString();

    if (message) {
      app.log(message);
    }
    //send it quick
    app.api.errors.log(this.stringifyErrorData(error), message, this.stringifyErrorData(details));

    if (error.status === 401) {
      //Just log them out
      app.log('401 so logged user out');
      this.setState({notification: null});
      app.api.user.destroySession();
      this.handleLogoutSuccess();
      return;
    } else {
      var body;

      if(error.status === 500){
        //somethings down, give a bit of time then they can try again
        body = (
          <div>
            <p> {usrMessages.ERR_SERVICE_DOWN} </p>
            <p> {utcTime} </p>
          </div>
        );
      } else if(error.status === 503){
        //offline nothing is going to work
        body = (
          <div>
            <p> {usrMessages.ERR_OFFLINE} </p>
            <p> {utcTime} </p>
          </div>
        );
      } else {

        var originalErrorMessage = [
          message, this.stringifyErrorData(error)
        ].join(' ');

        body = (
          <div>
            <p>{usrMessages.ERR_GENERIC}</p>
            <p className="notification-body-small">
              <code>{'Original error message: ' + originalErrorMessage}</code>
              <br>{utcTime}</br>
            </p>
          </div>
        );
      }
      this.setState({
        notification: {
          type: 'error',
          body: body,
          isDismissable: true
        }
      });
    }
  },

  handleActionableError: function(error, message, link) {

    var utcTime = usrMessages.MSG_UTC + new Date().toISOString();

    message = message || '';
    //send it quick
    app.api.errors.log(this.stringifyErrorData(error), message, '');

    var body = (
      <div>
        <p>{message}</p>
        {link}
      </div>
    );

    this.setState({
      notification: {
        type: 'alert',
        body: body,
        isDismissable: true
      }
    });
  },

  stringifyErrorData: function(data) {

    if(_.isEmpty(data)){
      return '';
    }

    if (_.isPlainObject(data)) {
      return JSON.stringify(data);
    }
    else {
      return data.toString();
    }
  },

  showRequestPasswordReset: function() {

    this.renderPage = function(){
      return(
        /* jshint ignore:start */
        <RequestPasswordReset
          onSubmit={app.api.user.requestPasswordReset.bind(app.api)}
          trackMetric={trackMetric} />
        /* jshint ignore:end */
      );
    };

    this.setState({ page: 'request-password-reset'});
  },

  showConfirmPasswordReset: function() {

    var givenResetKey = this.getQueryParam('resetKey');

    this.renderPage = function(){
      return(
        /* jshint ignore:start */
        <ConfirmPasswordReset
          resetKey={givenResetKey}
          onSubmit={app.api.user.confirmPasswordReset.bind(app.api)}
          trackMetric={trackMetric} />
        /* jshint ignore:end */
      );
    };

    this.setState({ page: 'confirm-password-reset'});
  },

  // look for the specified key in the attached queryParams and return the value
  //
  // If we don't find what we asked for then log that the value has not been found.
  // NOTE: The caller can decide how they want to deal with the fact there is no value in this instance
  getQueryParam: function(key){
    var params = app.router.getQueryParams();
    var val = params[key];
    if(_.isEmpty(val)){
      app.log('You asked for ['+key+'] but it was not found in ',params);
    }
    return val;
  },

  handleExternalPasswordUpdate: function() {
    // If the user is logged in, go to their profile to update password
    if (this.state.authenticated) {
      this.renderPage = this.renderProfile;
      this.setState({page: 'profile'});
    } else {
      // If the user is not logged in, go to the forgot password page
      this.showRequestPasswordReset();
    }
  },

  hideNavbarDropdown: function() {
  var navbar = this.refs.navbar;

  if (navbar) {
    navbar.hideDropdown();
  }
}
});

app.start = function() {
  var self = this;

  this.init(function() {
    self.component = React.render(
      /* jshint ignore:start */
      <AppComponent />,
      /* jshint ignore:end */
      document.getElementById('app')
    );

    self.log('App started');

    if (self.mock) {
      self.log('App running with mock services');
    }
  });
};

app.useMock = function(mock) {
  this.mock = mock;
  this.api = mock.patchApi(this.api);
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

module.exports = app;
