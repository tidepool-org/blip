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

import _ from 'lodash';
import React from 'react';
import async from 'async';
import sundial from 'sundial';

import nurseShark from 'tideline/plugins/nurseshark/';
import TidelineData from 'tideline/js/tidelinedata';

import personUtils from '../../core/personutils';
import queryString from '../../core/querystring';
import utils from '../../core/utils';
import Fetcher from '../../core/fetcher';
import ActionHandlers from '../../core/actionhandlers';

import usrMessages from '../../userMessages';

// Components
import Navbar from '../navbar';
import LogoutOverlay from '../logoutoverlay';
import BrowserWarningOverlay from '../browserwarningoverlay';
import TidepoolNotification from '../notification';
import TermsOverlay from '../termsoverlay';
import MailTo from '../mailto';

// Pages
import Login from '../../pages/login';
import Signup from '../../pages/signup';
import Profile from '../../pages/profile';
import Patients from '../../pages/patients';
import Patient from '../../pages/patient';
import PatientNew from '../../pages/patientnew';
import PatientData from '../../pages/patientdata';
import RequestPasswordReset from '../../pages/passwordreset/request';
import ConfirmPasswordReset from '../../pages/passwordreset/confirm';
import EmailVerification from '../../pages/emailverification';


// Styles
require('tideline/css/tideline.less');
require('../../core/less/fonts.less');
require('../../style.less');

// Blip favicon
require('../../../favicon.ico');

export default class AppComponent extends React.Component {
  static propTypes = {
    route: React.PropTypes.shape({
      log: React.PropTypes.func.isRequired,
      api: React.PropTypes.object.isRequired,
      personUtils: React.PropTypes.object.isRequired,
      trackMetric: React.PropTypes.func.isRequired,
      DEBUG: React.PropTypes.bool.isRequired
    }).isRequired
  }

  constructor(props) {
    super(props);
    var queryParams = (props.location && props.location.query) ? props.location.query : {};
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
        this.props.route.log('Viewing data in timezone-aware mode with', queryTimezone, 'as the selected timezone.');
      }
      catch(err) {
        this.props.route.log(new Error('Invalid timezone name in query parameter. (Try capitalizing properly.)'));
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

    this.fetcher = new Fetcher(this);
    this.actionHandlers = new ActionHandlers(this, this.fetcher);
    this.state = {
      authenticated: this.props.route.api.user.isAuthenticated(),
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
      termsAccepted: null,
      showingWelcomeTitle: false,
      showingWelcomeSetup: false,
      showPatientData: false,
      verificationEmailSent: false,
      finalizingVerification: false,
      queryParams: queryParams
    };
  }

  componentWillUpdate(nextProps, nextState) {
    // Called on props or state changes
    // Since app main component has no props,
    // this will be called on a state change
    if (this.props.route.DEBUG) {
      var stateDiff = utils.objectDifference(nextState, this.state);
      this.props.route.log('State changed', stateDiff);
    }
  }

  hideNavbarDropdown() {
    var navbar = this.refs.navbar;

    if (navbar) {
      navbar.hideDropdown();
    }
  }

  isDoneFetchingAndNotFoundPatient() {
    // Wait for patient object to come back from server
    if (this.state.fetchingPatient) {
      return false;
    }

    return !this.state.patient;
  }

  isPatientVisibleInNavbar() {
    // Only show patient name in navbar on certain pages
    var page = this.state.page;
    var result = page && page.match(/^patients\//);
    return Boolean(result);
  }

  isDoneFetchingAndUserHasPatient() {
    // Wait to have user object back from server
    if (this.state.fetchingUser) {
      return false;
    }

    return personUtils.isPatient(this.state.user);
  }

  isSamePersonUserAndPatient() {
    return personUtils.isSame(this.state.user, this.state.patient);
  }

  logSupportContact(){
    this.props.route.trackMetric('Clicked Give Feedback');
  }

  getSignupEmail() {
    if (this.props.location && this.props.location.query) {
      let { signupEmail } = this.props.location.query;
      if (!_.isEmpty(signupEmail) && utils.validateEmail(signupEmail)){
        return signupEmail;
      }
    }
    return null;
  }

  getInviteEmail() {
    if (this.props.location && this.props.location.query) {
      let { inviteEmail } = this.props.location.query;
      if(!_.isEmpty(inviteEmail) && utils.validateEmail(inviteEmail)){
        return inviteEmail;
      }
    }
    return null;
  }

  getInviteKey() {
    if (this.props.location && this.props.location.query) {
      let { inviteKey } = this.props.location.query;

      if(!_.isEmpty(inviteKey)){
        return inviteKey;
      }
    }
    return '';
  }

  closeNotification() {
    this.setState({notification: null});
  }

  processPatientData(data) {
    if (!(data && data.length >= 0)) {
      return null;
    }

    var mostRecentUpload = _.sortBy(_.where(data, {type: 'upload'}), (d) => Date.parse(d.time) ).reverse()[0];
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
        this.props.route.log(err);
        this.props.route.log('Upload metadata lacking a valid timezone!', mostRecentUpload);
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
      this.props.route.log('Defaulting to display in timezone of most recent upload at', mostRecentUpload.time, mostRecentUpload.timezone);
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
  }

  clearUserData() {
    this.setState({
      authenticated: false,
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
      showPatientData: false,
      loggingOut: false
    });
  }

  redirectToDefaultRoute() {
    this.props.history.pushState(null, 'patients');
  }

  doFetching(nextProps) {
    if (this.state.authenticated) {
        this.fetcher.fetchUser();
    }

    if (nextProps.login) {
      this.actionHandlers.handleFinalizeSignup();
    } else if (nextProps.patients) {
      this.setState({showPatientData: true});
      this.fetcher.fetchInvites();
      this.fetcher.fetchPatients();
      this.props.route.trackMetric('Viewed Care Team List');
    } else if (nextProps.patient) {
      this.fetcher.fetchPatient(nextProps.params.id);
      this.props.route.trackMetric('Viewed Profile');
    } else if(nextProps.patientData) {
      this.fetcher.fetchPatient(nextProps.params.id, (err, patient) => {
        this.fetcher.fetchPatientData(patient);
      });
      this.props.route.trackMetric('Viewed Data');
    } else if (nextProps.patientNew) {
      this.props.route.trackMetric('Viewed Profile Create');
    } else if (nextProps.patientShare) {
      this.fetcher.fetchPatient(nextProps.params.id);
      this.fetcher.fetchPendingInvites();
      this.props.route.trackMetric('Viewed Share');
    } else if (nextProps.profile) {
      this.props.route.trackMetric('Viewed Account Edit');
    }
  }

  /**
   * Before rendering for first time
   * begin fetching any required data
   */
  componentWillMount() {
    this.doFetching(this.props);
  }

  /**
   * Before any subsequent re-rendering 
   * begin fetching any required data
   */
  componentWillReceiveProps(nextProps) {
    this.doFetching(nextProps);
  }

  /**
   * Render Functions
   */

  renderOverlay() {
    this.props.route.log('Rendering overlay');
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

    if (!this.state.fetchingUser){
      return this.renderTermsOverlay();
    }

    return null;
  }

  renderTermsOverlay(){
    if (this.state.authenticated && _.isEmpty(this.state.termsAccepted)){
      return (
        <TermsOverlay
          onSubmit={this.actionHandlers.handleAcceptedTerms.bind(this.actionHandlers)}
          trackMetric={this.props.route.trackMetric} />
      );
    }
    return null;
  }

  renderNavbar() {
    this.props.route.log('Rendering navbar');
    if (this.state.authenticated) {
      var patient;
      var getUploadUrl;

      if (this.isPatientVisibleInNavbar()) {
        patient = this.state.patient;
        getUploadUrl = this.props.route.api.getUploadUrl.bind(this.props.route.api);
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
            onLogout={this.actionHandlers.handleLogout.bind(this.actionHandlers)}
            trackMetric={this.props.route.trackMetric}
            ref="navbar"/>
        </div>

      );
    }

    return null;
  }

  renderNotification() {
    this.props.route.log('Rendering notification');
    var notification = this.state.notification;
    var handleClose;

    if (notification) {
      if (notification.isDismissable) {
        handleClose = this.closeNotification.bind(this);
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
  }

  renderFooter() {
    var title ='Send us feedback';
    var subject = 'Feedback on Blip';

    return (
      <div className='container-small-outer footer'>
        <div className='container-small-inner'>
          <MailTo
            linkTitle={title}
            emailAddress={'support@tidepool.org'}
            emailSubject={subject}
            onLinkClicked={this.logSupportContact.bind(this)} />
        </div>
        {this.renderVersion()}
      </div>

    );
  }

  renderVersion() {

    var version = this.props.route.config.VERSION;
    if (version) {
      version = 'v' + version + ' beta';
      return (
        <div className="Navbar-version" ref="version">{version}</div>
      );
    }
    return null;
  }

  renderLogin() {
    var email = this.getInviteEmail() || this.getSignupEmail();
    var showAsInvite = !_.isEmpty(this.getInviteEmail());

    return React.cloneElement(this.props.login, {
      onSubmit: this.actionHandlers.handleLogin.bind(this.actionHandlers),
      seedEmail: email, 
      isInvite: showAsInvite,
      onSubmitSuccess: this.actionHandlers.handleLoginSuccess.bind(this.actionHandlers),
      onSubmitNotAuthorized: this.actionHandlers.handleNotAuthorized.bind(this.actionHandlers),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderSignup() {
    let config = this.props.route.config;
    var checkKey = (key, cb) => {
      if (_.isEmpty(config.INVITE_KEY) || key === config.INVITE_KEY){
        return cb(true);
      }
      return cb(false);
    };

    return React.cloneElement(this.props.signup, {
      onSubmit: this.actionHandlers.handleSignup.bind(this.actionHandlers),
      inviteEmail: this.getInviteEmail(),
      inviteKey: this.getInviteKey(),
      checkKey: checkKey,
      onSubmitSuccess: this.actionHandlers.handleSignupSuccess.bind(this.actionHandlers),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderEmailVerification() {
    return React.cloneElement(this.props.emailVerification,{
      sent: this.state.verificationEmailSent,
      onSubmitResend: this.props.route.api.user.resendEmailVerification.bind(this.props.route.api),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderProfile() {
    this.props.route.trackMetric('Viewed Account Edit');
    return React.cloneElement(this.props.profile, {
      user: this.state.user,
      fetchingUser: this.state.fetchingUser,
      onSubmit: this.actionHandlers.handleUpdateUser.bind(this.actionHandlers),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderPatients(showPatientData) {
    var patients = React.cloneElement(this.props.patients, {
      user: this.state.user,
      fetchingUser: this.state.fetchingUser,
      patients: this.state.patients,
      fetchingPatients: this.state.fetchingPatients,
      invites: this.state.invites,
      uploadUrl: this.props.route.api.getUploadUrl(),
      fetchingInvites: this.state.fetchingInvites,
      showingWelcomeTitle: this.state.showingWelcomeTitle,
      showingWelcomeSetup: this.state.showingWelcomeSetup,
      onHideWelcomeSetup: this.actionHandlers.handleHideWelcomeSetup.bind(this.actionHandlers),
      trackMetric: this.props.route.trackMetric,
      onAcceptInvitation: this.actionHandlers.handleAcceptInvitation.bind(this.actionHandlers),
      onDismissInvitation: this.actionHandlers.handleDismissInvitation.bind(this.actionHandlers),
      onRemovePatient: this.actionHandlers.handleRemovePatient.bind(this.actionHandlers)
    });

    return (patients);
  }

  renderPatient() {
    // On each state change check if patient object was returned from server
    if (this.isDoneFetchingAndNotFoundPatient()) {
      this.props.route.log('Patient not found');
      this.redirectToDefaultRoute();
      return;
    }
    return React.cloneElement(this.props.patient, {
      user: this.state.user, 
      fetchingUser: this.state.fetchingUser, 
      patient: this.state.patient, 
      fetchingPatient: this.state.fetchingPatient, 
      onUpdatePatient: this.actionHandlers.handleUpdatePatient.bind(this.actionHandlers), 
      pendingInvites: this.state.pendingInvites, 
      onChangeMemberPermissions: this.actionHandlers.handleChangeMemberPermissions.bind(this.actionHandlers), 
      onRemoveMember: this.actionHandlers.handleRemoveMember.bind(this.actionHandlers), 
      onInviteMember: this.actionHandlers.handleInviteMember.bind(this.actionHandlers), 
      onCancelInvite: this.actionHandlers.handleCancelInvite.bind(this.actionHandlers), 
      trackMetric: this.props.route.trackMetric
    });
  }

  renderPatientShare() {
    // On each state change check if patient object was returned from server
    if (this.isDoneFetchingAndNotFoundPatient()) {
      this.props.route.log('Patient not found');
      this.redirectToDefaultRoute();
      return;
    }
    return React.cloneElement(this.props.patientShare, {
      user: this.state.user,
      shareOnly: true,
      fetchingUser: this.state.fetchingUser,
      patient: this.state.patient,
      fetchingPatient: this.state.fetchingPatient,
      onUpdatePatient: this.actionHandlers.handleUpdatePatient.bind(this.actionHandlers),
      pendingInvites: this.state.pendingInvites,
      onChangeMemberPermissions: this.actionHandlers.handleChangeMemberPermissions.bind(this.actionHandlers),
      onRemoveMember: this.actionHandlers.handleRemoveMember.bind(this.actionHandlers),
      onInviteMember: this.actionHandlers.handleInviteMember.bind(this.actionHandlers),
      onCancelInvite: this.actionHandlers.handleCancelInvite.bind(this.actionHandlers),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderPatientNew() {
    this.setState({
      patient: null,
      fetchingPatient: false
    });
    this.props.route.trackMetric('Viewed Profile Create');

    // Make sure user doesn't already have a patient
    if (this.isDoneFetchingAndUserHasPatient()) {
      var patientId = this.state.user.userid;
      var route = '/patients/' + patientId;
      this.props.route.log('User already has patient');
      this.props.history.pushState(null, route);
      return;
    }
    return React.cloneElement(this.props.patientNew, {
      user: this.state.user,
      fetchingUser: this.state.fetchingUser,
      onSubmit: this.actionHandlers.handleCreatePatient.bind(this.actionHandlers),
      onSubmitSuccess: this.actionHandlers.handlePatientCreationSuccess.bind(this.actionHandlers),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderPatientData() {
    // On each state change check if patient object was returned from server
    if (this.isDoneFetchingAndNotFoundPatient()) {
      this.props.route.log('Patient not found');
      this.redirectToDefaultRoute();
      return;
    }
    return React.cloneElement(this.props.patientData, {
      user: this.state.user,
      patient: this.state.patient,
      bgPrefs: this.state.bgPrefs,
      timePrefs: this.state.timePrefs,
      patientData: this.state.patientData,
      fetchingPatient: this.state.fetchingPatient,
      fetchingPatientData: this.state.fetchingPatientData,
      isUserPatient: this.isSamePersonUserAndPatient(),
      queryParams: this.state.queryParams,
      uploadUrl: this.props.route.api.getUploadUrl(),
      onRefresh: this.fetcher.fetchCurrentPatientData.bind(this.fetcher),
      onFetchMessageThread: this.fetcher.fetchMessageThread.bind(this.fetcher),
      onSaveComment: this.props.route.api.team.replyToMessageThread.bind(this.props.route.api.team),
      onCreateMessage: this.props.route.api.team.startMessageThread.bind(this.props.route.api.team),
      onEditMessage: this.props.route.api.team.editMessage.bind(this.props.route.api.team),
      onUpdatePatientData: this.actionHandlers.handleUpdatePatientData.bind(this.actionHandlers),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderRequestPasswordReset() {
    return React.cloneElement(this.props.requestPasswordReset, {
      onSubmit: this.props.route.api.user.requestPasswordReset.bind(this.props.route.api),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderConfirmPasswordReset() {
    let {query} = this.props.location;

    return React.cloneElement(this.props.confirmPasswordReset, {
      resetKey: query.resetKey,
      onSubmit: this.props.route.api.user.confirmPasswordReset.bind(this.props.route.api),
      trackMetric: this.props.route.trackMetric
    });
  }

  renderPage() {
    // Right now because we are not using Redux we are using a slightly
    // hacky way of passing props to our route components by cloning them 
    // here, and setting the props we know each component needs
    // See: https://github.com/rackt/react-router/blob/master/examples/passing-props-to-children/app.js
    if (this.props.login) {
      return this.renderLogin();
    } else if (this.props.signup) {
      return this.renderSignup();
    } else if (this.props.emailVerification) {
      return this.renderEmailVerification();
    } else if (this.props.profile) {
      return this.renderProfile();
    } else if (this.props.patients) {
      return this.renderPatients();
    } else if (this.props.patientNew) {
      return this.renderPatientNew();
    } else if (this.props.patient) {
      return this.renderPatient();
    } else if (this.props.patientShare) {
      return this.renderPatientShare();
    } else if (this.props.patientData) {
      return this.renderPatientData();
    } else if (this.props.requestPasswordReset) {
      return this.renderRequestPasswordReset();
    } else if (this.props.confirmPasswordReset) {
      return this.renderConfirmPasswordReset();
    }

    return (
      <div>
        There no are no children
      </div>
    );
  }

  render() {
    this.props.route.log('Rendering AppComponent');
    var overlay = this.renderOverlay();
    var navbar = this.renderNavbar();
    var notification = this.renderNotification();
    var page = this.renderPage();
    var footer = this.renderFooter();

    return (
      <div className="app" onClick={this.hideNavbarDropdown.bind(this)}>
        {overlay}
        {navbar}
        {notification}
        {page}
        {footer}
      </div>
    );
  }
}