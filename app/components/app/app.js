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

var _ = require('lodash');
var React = require('react');
var async = require('async');
var sundial = require('sundial');

var nurseShark = require('tideline/plugins/nurseshark/');
var TidelineData = require('tideline/js/tidelinedata');

var config = require('../../config');
var router = require('../../router');
var routeMap = require('../../routemap');
var personUtils = require('../../core/personutils');
var queryString = require('../../core/querystring');
var utils = require('../../core/utils');

var usrMessages = require('../../userMessages');

// Components
var Navbar = require('../navbar');
var LogoutOverlay = require('../logoutoverlay');
var BrowserWarningOverlay = require('../browserwarningoverlay');
var TidepoolNotification = require('../notification');
var TermsOverlay = require('../termsoverlay');
var MailTo = require('../mailto');

// Pages
var Login = require('../../pages/login');
var Signup = require('../../pages/signup');
var Profile = require('../../pages/profile');
var Patients = require('../../pages/patients');
var Patient = require('../../pages/patient');
var PatientNew = require('../../pages/patientnew');
var PatientData = require('../../pages/patientdata');
var RequestPasswordReset = require('../../pages/passwordreset/request');
var ConfirmPasswordReset = require('../../pages/passwordreset/confirm');
var EmailVerification = require('../../pages/emailverification');


// Styles
require('tideline/css/tideline.less');
require('../../core/less/fonts.less');
require('../../style.less');

// Blip favicon
require('../../../favicon.ico');

var AppComponent = React.createClass({
  propTypes: {
    log: React.PropTypes.func.isRequired,
    api: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
    personUtils: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    DEBUG: React.PropTypes.bool.isRequired
  },

  getInitialState: function() {
    var queryParams = queryString.parseTypes(window.location.search);
    var timePrefs = {
      timezoneAware: false,
      timezoneName: null
    };
    if (!_.isEmpty(queryParams.timezone)) {
      var queryTimezone = queryParams.timezone.replace('-', '/');
      try {
        sundial.checkTimezoneName(queryTimezone);
        timePrefs.timezoneAware = true;
        timePrefs.timezoneName = queryTimezone;
        this.props.log('Viewing data in timezone-aware mode with', queryTimezone, 'as the selected timezone.');
      }
      catch(err) {
        this.props.log(new Error('Invalid timezone name in query parameter. (Try capitalizing properly.)'));
      }
    }
    var bgPrefs = {
      bgUnits: 'mg/dL'
    };
    if (!_.isEmpty(queryParams.units)) {
      var queryUnits = queryParams.units.toLowerCase();
      if (queryUnits === 'mmoll') {
        bgPrefs.bgUnits = 'mmol/L';
      }
    }
    return {
      authenticated: this.props.api.user.isAuthenticated(),
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
      bgPrefs: bgPrefs,
      timePrefs: timePrefs,
      patientData: null,
      fetchingPatientData: true,
      fetchingMessageData: true,
      showingAcceptTerms: false,
      showingWelcomeTitle: false,
      showingWelcomeSetup: false,
      showPatientData: false,
      verificationEmailSent: false,
      finalizingVerification: false,
      queryParams: queryParams
    };
  },

  doOauthLogin:function(accessToken){
    var self = this;
    self.props.api.user.oauthLogin(accessToken, function(err, data){
      if(_.isEmpty(err)){
        self.props.log('Logged in via OAuth');
        self.fetchUser();
        self.setState({authenticated: true});
        self.props.trackMetric('Logged In with OAuth');
        //go to the specified patient if there is one
        if(_.isEmpty(data.target)){
          self.props.log('No targeted OAuth user so defaulting');
          self.redirectToDefaultRoute();
        }else{
          self.props.log('Using the targeted OAuth user');
          self.props.router.setRoute('/patients/' + data.target + '/data');
        }
      }else{
        self.props.log('Login via OAuth failed ', err);
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
    _.forEach(routeMap.routes, function(handlerName, route) {
      routingTable[route] = self[handlerName];
    });

    var isAuthenticated = function() {
      return self.state.authenticated;
    };

    // Currently no-op
    var onRouteChange = function() {};

    self.props.router.setup(routingTable, {
      isAuthenticated: isAuthenticated,
      noAuthRoutes: routeMap.noAuthRoutes,
      externalAppRoutes: routeMap.externalAppRoutes,
      defaultNotAuthenticatedRoute: routeMap.defaultNotAuthenticatedRoute,
      defaultAuthenticatedRoute: routeMap.defaultAuthenticatedRoute,
      onRouteChange: onRouteChange
    });
    self.props.router.start();
  },

  componentWillUpdate: function(nextProps, nextState) {
    // Called on props or state changes
    // Since app main component has no props,
    // this will be called on a state change
    if (this.props.DEBUG) {
      var stateDiff = utils.objectDifference(nextState, this.state);
      this.props.log('State changed', stateDiff);
    }
  },

  render: function() {
    this.props.log('Rendering AppComponent');
    var overlay = this.renderOverlay();
    var navbar = this.renderNavbar();
    var notification = this.renderNotification();
    var page = this.renderPage();
    var footer = this.renderFooter();

    return (
      <div className="app" onClick={this.hideNavbarDropdown}>
        {overlay}
        {navbar}
        {notification}
        {page}
        {footer}
      </div>
    );
  },

  renderOverlay: function() {
    this.props.log('Rendering overlay');
    if (this.state.loggingOut) {
      return (
        <LogoutOverlay ref="logoutOverlay" />
      );

    }

    if (!utils.isChrome()) {
      return (
        <BrowserWarningOverlay />
      );

    }

    if (this.state.showingAcceptTerms) {
      return (
        <TermsOverlay
          onSubmit={this.handleAcceptedTerms}
          trackMetric={this.props.trackMetric} />
      );

    }

    return null;
  },

  renderNavbar: function() {
    this.props.log('Rendering navbar');
    if (this.state.authenticated) {
      var patient;
      var getUploadUrl;

      if (this.isPatientVisibleInNavbar()) {
        patient = this.state.patient;
        getUploadUrl = this.props.api.getUploadUrl.bind(this.props.api);
      }

      return (

        <div className="App-navbar">
          <Navbar
            user={this.state.user}
            fetchingUser={this.state.fetchingUser}
            patient={patient}
            fetchingPatient={this.state.fetchingPatient}
            currentPage={this.state.page}
            getUploadUrl={getUploadUrl}
            onLogout={this.logout}
            trackMetric={this.props.trackMetric}
            ref="navbar"/>
        </div>

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
    this.props.log('Rendering notification');
    var notification = this.state.notification;
    var handleClose;

    if (notification) {
      if (notification.isDismissable) {
        handleClose = this.closeNotification;
      }

      return (

        <TidepoolNotification
          type={notification.type}
          onClose={handleClose}>
          {notification.body}
        </TidepoolNotification>

      );
    }

    return null;
  },

  logSupportContact: function(){
    this.props.trackMetric('Clicked Give Feedback');
  },

  renderFooter: function() {
    var title ='Send us feedback';
    var subject = 'Feedback on Blip';

    return (
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

    );
  },

  renderVersion: function() {
    var version = config.VERSION;
    if (version) {
      version = 'v' + version + ' beta';
      return (

        <div className="Navbar-version" ref="version">{version}</div>

      );
    }
    return null;
  },

  // Override on route change
  renderPage: function() {
    return null;
  },

  showLogin: function() {
    var hashQueryParams = this.props.router.getQueryParams();
    if (!_.isEmpty(hashQueryParams.accessToken)) {
      this.props.log('logging in via OAuth ...');
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
      <Login
        onSubmit={this.login}
        seedEmail={email}
        isInvite={showAsInvite}
        onSubmitSuccess={this.handleLoginSuccess}
        onSubmitNotAuthorized={this.handleNotAuthorized}
        trackMetric={this.props.trackMetric} />

    );
  },

  getSignupEmail: function() {
    var hashQueryParams = this.props.router.getQueryParams();
    var email = hashQueryParams.signupEmail;
    if (!_.isEmpty(email) && utils.validateEmail(email)){
      return email;
    }
    return null;
  },

  getInviteKey: function() {
    var hashQueryParams = this.props.router.getQueryParams();
    var key = hashQueryParams.inviteKey;

    if(!_.isEmpty(key)){
      return key;
    }
    return '';
  },

  getInviteEmail: function() {
    var hashQueryParams = this.props.router.getQueryParams();
    var email = hashQueryParams.inviteEmail;
    if(!_.isEmpty(email) && utils.validateEmail(email)){
      return email;
    }
    return null;
  },

  finializeSignup: function() {
    var self = this;

    var hashQueryParams = self.props.router.getQueryParams();
    if(!_.isEmpty(hashQueryParams.signupKey) && !self.state.finalizingVerification){
      self.props.api.user.confirmSignUp(hashQueryParams.signupKey, function(err){
        if(err){
          self.props.log('finializeSignup err ',err);
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
    var checkKey = function(key, cb) {
      if (_.isEmpty(config.INVITE_KEY) || key === config.INVITE_KEY){
        return cb(true);
      }
      return cb(false);
    };

    return (
      <Signup
        onSubmit={this.signup}
        inviteEmail={this.getInviteEmail()}
        inviteKey={this.getInviteKey()}
        checkInviteKey={checkKey}
        onSubmitSuccess={this.handleSignupSuccess}
        trackMetric={this.props.trackMetric} />

    );
  },

  renderEmailVerification: function() {
    return (
      <EmailVerification
        sent={this.state.verificationEmailSent}
        onSubmitResend={this.props.api.user.resendEmailVerification.bind(this.props.api)}
        trackMetric={this.props.trackMetric}/>

    );
  },

  showProfile: function() {
    this.renderPage = this.renderProfile;
    this.setState({page: 'profile'});
    this.props.trackMetric('Viewed Account Edit');
  },

  renderProfile: function() {
    return (
      <Profile
          user={this.state.user}
          fetchingUser={this.state.fetchingUser}
          onSubmit={this.updateUser}
          trackMetric={this.props.trackMetric}/>

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
    this.props.trackMetric('Viewed Care Team List');
  },
  renderPatients: function() {
    var patients = <Patients
        user={this.state.user}
        fetchingUser={this.state.fetchingUser}
        patients={this.state.patients}
        fetchingPatients={this.state.fetchingPatients}
        invites={this.state.invites}
        uploadUrl={this.props.api.getUploadUrl()}
        fetchingInvites={this.state.fetchingInvites}
        showingWelcomeTitle={this.state.showingWelcomeTitle}
        showingWelcomeSetup={this.state.showingWelcomeSetup}
        onHideWelcomeSetup={this.handleHideWelcomeSetup}
        trackMetric={this.props.trackMetric}
        onAcceptInvitation={this.handleAcceptInvitation}
        onDismissInvitation={this.handleDismissInvitation}
        onRemovePatient={this.handleRemovePatient}/>;

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
            this.props.router.setRoute('/patients');
            return;
          } else {
            this.props.router.setRoute('/patients/' + viewerUserId + '/data');
            return;
          }
        }

        this.props.router.setRoute('/patients');
      }

      return;
    }

    return (patients);
  },
  handleHideWelcomeSetup: function(options) {
    if (options && options.route) {
      this.props.router.setRoute(options.route);
    }
    this.setState({showingWelcomeSetup: false});
  },
  handleDismissInvitation: function(invitation) {
    var self = this;

    self.setState({
      showingWelcomeSetup: false,
      invites: _.filter(self.state.invites, function(e){
        return e.key !== invitation.key;
      })
    });

    self.props.api.invitation.dismiss(invitation.key, invitation.creator.userid, function(err) {
      if(err) {
        self.setState({
          invites: self.state.invites.concat(invitation)
        });
       return self.handleApiError(err, usrMessages.ERR_DISMISSING_INVITE, utils.buildExceptionDetails());
      }
    });
  },
  handleAcceptInvitation: function(invitation) {
    var invites = _.cloneDeep(this.state.invites);
    var self = this;

    self.setState({
      showingWelcomeSetup: false,
      invites: _.map(invites, function(invite) {
        if (invite.key === invitation.key) {
          invite.accepting = true;
        }
        return invite;
      })
    });

    self.props.api.invitation.accept(invitation.key, invitation.creator.userid, function(err) {

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
        return self.handleApiError(err, usrMessages.ERR_ACCEPTING_INVITE, utils.buildExceptionDetails());
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

    self.props.api.access.setMemberPermissions(memberId, permissions, function(err) {
      if(err) {
        cb(err);
        return self.handleApiError(err, usrMessages.ERR_CHANGING_PERMS, utils.buildExceptionDetails());
      }

      self.fetchPatient(patientId, cb);
    });
  },
  handleRemovePatient: function(patientId,cb) {
    var self = this;

    self.props.api.access.leaveGroup(patientId, function(err) {
      if(err) {

        return self.handleApiError(err, usrMessages.ERR_REMOVING_MEMBER, utils.buildExceptionDetails());

      }

      self.fetchPatients();
    });
  },
  handleRemoveMember: function(patientId, memberId, cb) {
    var self = this;

    self.props.api.access.removeMember(memberId, function(err) {
      if(err) {
        cb(err);
        return self.handleApiError(err, usrMessages.ERR_REMOVING_MEMBER ,utils.buildExceptionDetails());
      }

      self.fetchPatient(patientId, cb);
    });
  },
  handleInviteMember: function(email, permissions, cb) {
    var self = this;

    self.props.api.invitation.send(email, permissions, function(err, invitation) {
      if(err) {
        if (cb) {
          cb(err);
        }
        if (err.status === 500) {
          return self.handleApiError(err, usrMessages.ERR_INVITING_MEMBER, utils.buildExceptionDetails());
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

    self.props.api.invitation.cancel(email, function(err) {
      if(err) {
        if (cb) {
          cb(err);
        }
        return self.handleApiError(err, usrMessages.ERR_CANCELING_INVITE, utils.buildExceptionDetails());
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
    this.props.trackMetric('Viewed Profile');
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
    this.props.trackMetric('Viewed Share');
  },
  renderPatient: function() {
    // On each state change check if patient object was returned from server
    if (this.isDoneFetchingAndNotFoundPatient()) {
      this.props.log('Patient not found');
      this.redirectToDefaultRoute();
      return;
    }
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
        trackMetric={this.props.trackMetric}/>
    );
  },
  renderPatientShare: function() {
    // On each state change check if patient object was returned from server
    if (this.isDoneFetchingAndNotFoundPatient()) {
      this.props.log('Patient not found');
      this.redirectToDefaultRoute();
      return;
    }
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
        trackMetric={this.props.trackMetric}/>
    );
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
    this.props.trackMetric('Viewed Profile Create');
  },
  renderPatientNew: function() {
    // Make sure user doesn't already have a patient
    if (this.isDoneFetchingAndUserHasPatient()) {
      var patientId = this.state.user.userid;
      var route = '/patients/' + patientId;
      this.props.log('User already has patient');
      this.props.router.setRoute(route);
      return;
    }
    return (
      <PatientNew
          user={this.state.user}
          fetchingUser={this.state.fetchingUser}
          onSubmit={this.createPatient}
          onSubmitSuccess={this.handlePatientCreationSuccess}
          trackMetric={this.props.trackMetric}/>
    );
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
    var self = this;

    self.renderPage = self.renderPatientData;
    self.setState({
      page: 'patients/' + patientId + '/data',
      patient: null,
      fetchingPatient: true,
      patientData: null,
      fetchingPatientData: true
    });


    self.fetchPatient(patientId, function(err, patient) {
      self.fetchPatientData(patient);
    });

    self.props.trackMetric('Viewed Data');
  },
  renderPatientData: function() {
    // On each state change check if patient object was returned from server
    if (this.isDoneFetchingAndNotFoundPatient()) {
      this.props.log('Patient not found');
      this.redirectToDefaultRoute();
      return;
    }
    return (
      <PatientData
        user={this.state.user}
        patient={this.state.patient}
        bgPrefs={this.state.bgPrefs}
        timePrefs={this.state.timePrefs}
        patientData={this.state.patientData}
        fetchingPatient={this.state.fetchingPatient}
        fetchingPatientData={this.state.fetchingPatientData}
        isUserPatient={this.isSamePersonUserAndPatient()}
        queryParams={this.state.queryParams}
        uploadUrl={this.props.api.getUploadUrl()}
        onRefresh={this.fetchCurrentPatientData}
        onFetchMessageThread={this.fetchMessageThread}
        onSaveComment={this.props.api.team.replyToMessageThread.bind(this.props.api.team)}
        onCreateMessage={this.props.api.team.startMessageThread.bind(this.props.api.team)}
        onEditMessage={this.props.api.team.editMessage.bind(this.props.api.team)}
        onUpdatePatientData={this.handleUpdatePatientData}
        trackMetric={this.props.trackMetric}/>
    );
  },
  handleUpdatePatientData: function(userid, data) {
    // NOTE: intentional use of _.clone instead of _.cloneDeep
    // we only need a shallow clone at the top level of the patientId keys
    // and the _.cloneDeep I had originally would hang the browser for *seconds*
    // when there was actually something in this.state.patientData
    var patientData = _.clone(this.state.patientData);
    if (patientData != null) {
      patientData[userid] = data;
      this.setState({
        patientData: patientData
      });
    }
  },
  login: function(formValues, cb) {
    var user = formValues.user;
    var options = formValues.options;

    this.props.api.user.login(user, options, cb);
  },

  handleLoginSuccess: function() {

    this.fetchUser();
    if( this.state.finalizingVerification ){
      this.setState({
        showingAcceptTerms: config.SHOW_ACCEPT_TERMS ? true : false,
        showingWelcomeTitle: true,
        showingWelcomeSetup: true
      });
      this.props.trackMetric('Finalized Signup');
    }
    this.setState({authenticated: true});
    this.redirectToDefaultRoute();
    this.props.trackMetric('Logged In');
  },

  handleNotAuthorized:function(){
     this.setState({authenticated: false,  verificationEmailSent: false});
     this.showEmailVerification();
  },

  signup: function(formValues, cb) {
    var user = formValues;
    this.props.api.user.signup(user, cb);
  },

  handleSignupSuccess: function(user) {
    //once signed up we need to authenicate the email which is done via the email we have sent them
    this.setState({
      fetchingUser: false,
      verificationEmailSent: true
    });

    this.showEmailVerification();

    this.props.trackMetric('Signed Up');
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
    this.props.trackMetric('Signup Verified');
  },

  handleAcceptedTerms: function() {
    this.setState({
      showingAcceptTerms: false
    });
  },

  logout: function() {
    var self = this;

    if (self.state.loggingOut) {
      return;
    }

    self.setState({
      loggingOut: true
    });

    // Need to track this before expiring auth token
    self.props.trackMetric('Logged Out');

    //Logout but don't wait for details
    self.props.api.user.logout();

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

    self.props.api.user.get(function(err, user) {
      if (err) {
        self.setState({fetchingUser: false});
        return self.handleApiError(err, usrMessages.ERR_FETCHING_USER, utils.buildExceptionDetails());
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

    self.props.api.invitation.getSent(function(err, invites) {
      if (err) {
        self.setState({
          fetchingPendingInvites: false
        });

        if (cb) {
          cb(err);
        }

        return self.handleApiError(err, usrMessages.ERR_FETCHING_PENDING_INVITES, utils.buildExceptionDetails());
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

    self.props.api.invitation.getReceived(function(err, invites) {
      if (err) {

        self.setState({
          fetchingInvites: false
        });

        return self.handleApiError(err, usrMessages.ERR_FETCHING_INVITES, utils.buildExceptionDetails());
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

    self.props.api.patient.getAll(function(err, patients) {
      if (err) {
        self.setState({fetchingPatients: false});
        return self.handleApiError(err, usrMessages.ERR_FETCHING_TEAMS, utils.buildExceptionDetails());
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

    self.props.api.patient.get(patientId, function(err, patient) {
      if (err) {
        if (err.status === 404) {
          self.props.log('Patient not found with id '+patientId);
          var setupMsg = (patientId === self.state.user.userid) ? usrMessages.ERR_YOUR_ACCOUNT_NOT_CONFIGURED : usrMessages.ERR_ACCOUNT_NOT_CONFIGURED;
          var dataStoreLink = (<a href="#/patients/new" onClick={self.closeNotification}>{usrMessages.YOUR_ACCOUNT_DATA_SETUP}</a>);
          return self.handleActionableError(err, setupMsg, dataStoreLink);
        }
        // we can't deal with it so just show error handler
        return self.handleApiError(err, usrMessages.ERR_FETCHING_PATIENT+patientId, utils.buildExceptionDetails());
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
      self.props.api.patientData.get(patientId, cb);
    };

    var loadTeamNotes = function(cb) {
      self.props.api.team.getNotes(patientId, cb);
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
          self.props.log('No data found for patient '+patientId);
          return;
        }

        return self.handleApiError(err, usrMessages.ERR_FETCHING_PATIENT_DATA+patientId, utils.buildExceptionDetails());
      }

      var patientData = results.patientData || [];
      var notes = results.teamNotes || [];

      self.props.log('Patient device data count', patientData.length);
      self.props.log('Team notes count', notes.length);

      var combinedData = patientData.concat(notes);
      window.downloadInputData = function() {
        console.save(combinedData, 'blip-input.json');
      };
      patientData = self.processPatientData(combinedData);

      // NOTE: intentional use of _.clone instead of _.cloneDeep
      // we only need a shallow clone at the top level of the patientId keys
      // and the _.cloneDeep I had originally would hang the browser for *seconds*
      // when there was actually something in this.state.patientData
      var allPatientsData = _.clone(self.state.patientData) || {};
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
    var self = this;

    self.props.log('fetching messages for ' + messageId);

    self.setState({fetchingMessageData: true});

    self.props.api.team.getMessageThread(messageId,function(err, thread){
      self.setState({fetchingMessageData: false});

      if (err) {
        self.handleApiError(err, usrMessages.ERR_FETCHING_MESSAGE_DATA+messageId, utils.buildExceptionDetails());
        return callback(null);
      }

      self.props.log('Fetched message thread with '+thread.length+' messages');
      return callback(thread);
    });
  },

  processPatientData: function(data) {
    if (!(data && data.length >= 0)) {
      return null;
    }

    var mostRecentUpload = _.sortBy(_.where(data, {type: 'upload'}), function(d) {
      return Date.parse(d.time);
    }).reverse()[0];
    var timePrefsForTideline;
    if (!_.isEmpty(mostRecentUpload) && !_.isEmpty(mostRecentUpload.timezone)) {
      try {
        sundial.checkTimezoneName(mostRecentUpload.timezone);
        timePrefsForTideline = {
          timezoneAware: true,
          timezoneName: mostRecentUpload.timezone
        };
      }
      catch(err) {
        this.props.log(err);
        this.props.log('Upload metadata lacking a valid timezone!', mostRecentUpload);
      }
    }
    var queryParams = this.state.queryParams;
    // if the user has put a timezone in the query params
    // it'll be stored already in the state, and we just keep using it
    if (!_.isEmpty(queryParams.timezone) || _.isEmpty(timePrefsForTideline)) {
      timePrefsForTideline = this.state.timePrefs;
    }
    // but otherwise we use the timezone from the most recent upload metadata obj
    else {
      this.setState({
        timePrefs: timePrefsForTideline
      });
      this.props.log('Defaulting to display in timezone of most recent upload at', mostRecentUpload.time, mostRecentUpload.timezone);
    }

    console.time('Nurseshark Total');
    var res = nurseShark.processData(data, this.state.bgPrefs.bgUnits);
    console.timeEnd('Nurseshark Total');
    console.time('TidelineData Total');
    var tidelineData = new TidelineData(res.processedData, {
      timePrefs: this.state.timePrefs,
      bgUnits: this.state.bgPrefs.bgUnits
    });
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

    self.props.api.user.put(userUpdates, function(err, user) {
      if (err) {
        // Rollback
        self.setState({user: previousUser});
        return self.handleApiError(err, usrMessages.ERR_UPDATING_ACCOUNT, utils.buildExceptionDetails());
      }

      user = _.assign(newUser, user);
      self.setState({user: user});
      self.props.trackMetric('Updated Account');
    });
  },

  createPatient: function(patient, cb) {
    this.props.api.patient.post(patient, cb);
  },

  handlePatientCreationSuccess: function(patient) {
    this.props.trackMetric('Created Profile');
    this.setState({
      user: _.extend({}, this.state.user, {
        profile: _.cloneDeep(patient.profile)
      }),
      patient: patient
    });
    var route = '/patients/' + patient.userid + '/data';
    this.props.router.setRoute(route);
  },

  updatePatient: function(patient) {
    var self = this;
    var previousPatient = this.state.patient;

    // Optimistic update
    self.setState({patient: patient});

    self.props.api.patient.put(patient, function(err, patient) {
      if (err) {
        // Rollback
        self.setState({patient: previousPatient});
        return self.handleApiError(err, usrMessages.ERR_UPDATING_PATIENT, utils.buildExceptionDetails());
      }
      self.setState({
        patient: _.assign({}, previousPatient, {profile: patient.profile})
      });
      self.props.trackMetric('Updated Profile');
    });
  },

  handleApiError: function(error, message, details) {

    var utcTime = usrMessages.MSG_UTC + new Date().toISOString();

    if (message) {
      this.props.log(message);
    }
    //send it quick
    this.props.api.errors.log(this.stringifyErrorData(error), message, this.stringifyErrorData(details));

    if (error.status === 401) {
      //Just log them out
      this.props.log('401 so logged user out');
      this.setState({notification: null});
      this.props.api.user.destroySession();
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
    this.props.api.errors.log(this.stringifyErrorData(error), message, '');

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
        <RequestPasswordReset
          onSubmit={this.props.api.user.requestPasswordReset.bind(this.props.api)}
          trackMetric={this.props.trackMetric} />
      );
    };

    this.setState({ page: 'request-password-reset'});
  },

  showConfirmPasswordReset: function() {

    var givenResetKey = this.getQueryParam('resetKey');

    this.renderPage = function(){
      return(
        <ConfirmPasswordReset
          resetKey={givenResetKey}
          onSubmit={this.props.api.user.confirmPasswordReset.bind(this.props.api)}
          trackMetric={this.props.trackMetric} />
      );
    };

    this.setState({ page: 'confirm-password-reset'});
  },

  // look for the specified key in the attached queryParams and return the value
  //
  // If we don't find what we asked for then log that the value has not been found.
  // NOTE: The caller can decide how they want to deal with the fact there is no value in this instance
  getQueryParam: function(key){
    var params = this.props.router.getQueryParams();
    var val = params[key];
    if(_.isEmpty(val)){
      this.props.log('You asked for ['+key+'] but it was not found in ',params);
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

module.exports = AppComponent;