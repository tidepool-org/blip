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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';

import usrMessages from '../../userMessages';

// Components
import Navbar from '../navbar';
import LogoutOverlay from '../logoutoverlay';
import BrowserWarningOverlay from '../browserwarningoverlay';
import TidepoolNotification from '../notification';
import TermsOverlay from '../termsoverlay';
import MailTo from '../mailto';

// Styles
require('tideline/css/tideline.less');
require('../../style.less');

// Blip favicon
require('../../../favicon.ico');

export class AppComponent extends React.Component {
  static propTypes = {
    route: React.PropTypes.shape({
      log: React.PropTypes.func.isRequired,
      api: React.PropTypes.object.isRequired,
      personUtils: React.PropTypes.object.isRequired,
      trackMetric: React.PropTypes.func.isRequired,
      DEBUG: React.PropTypes.bool.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      notification: null
    };
  }

  hideNavbarDropdown() {
    var navbar = this.refs.navbar;

    if (navbar) {
      navbar.hideDropdown();
    }
  }

  /**
   * Only show patient name in navbar on certain pages
   *  - patients/:id/data
   *  - patients/:id/share
   *  - patients/:id/profile
   *  
   * @return {Boolean}
   */
  isPatientVisibleInNavbar() {
    return /^\/patients\/\S+/.test(this.props.location.pathname);
  }

  logSupportContact() {
    this.props.route.trackMetric('Clicked Give Feedback');
  }

  closeNotification() {
    this.setState({
      notitication: null
    });
    this.props.acknowledgeNotification();
  }

  doFetching(nextProps) {
    if (!nextProps.fetchers) {
      return
    }

    nextProps.fetchers.forEach(fetcher => { 
      fetcher();
    });
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
    if (!utils.isOnSamePage(this.props, nextProps)) {
      this.doFetching(nextProps);
    }
  }

  /**
   * Render Functions
   */

  renderOverlay() {
    this.props.route.log('Rendering overlay');
    if (this.props.loggingOut) {
      return (
        <LogoutOverlay ref="logoutOverlay" />
      );
    }

    if (!utils.isChrome()) {
      return (
        <BrowserWarningOverlay />
      );
    }

    if (!this.props.fetchingUser){
      return this.renderTermsOverlay();
    }

    return null;
  }

  renderTermsOverlay() {
    if (this.props.authenticated && _.isEmpty(this.props.termsAccepted)){
      return (
        <TermsOverlay
          onSubmit={this.props.onAcceptTerms}
          trackMetric={this.props.route.trackMetric} />
      );
    }
    return null;
  }

  renderNavbar() {
    this.props.route.log('Rendering navbar');
    if (this.props.authenticated) {
      var patient;
      var getUploadUrl;

      if (this.isPatientVisibleInNavbar()) {
        patient = this.props.patient;
        getUploadUrl = this.props.route.api.getUploadUrl.bind(this.props.route.api);
      }

      return (

        <div className="App-navbar">
          <Navbar
            user={this.props.user}
            fetchingUser={this.props.fetchingUser}
            patient={patient}
            fetchingPatient={this.props.fetchingPatient}
            currentPage={this.props.route.pathname}
            getUploadUrl={getUploadUrl}
            onLogout={this.props.onLogout}
            trackMetric={this.props.route.trackMetric}
            ref="navbar"/>
        </div>

      );
    }

    return null;
  }

  // TODO: find out wtf this is and what it does - theory: error messages
  renderNotification() {
    this.props.route.log('Rendering notification');
    var notification = this.state.notification || this.props.notification;
    var handleClose;

    if (notification) {
      if (notification.isDismissable) {
        handleClose = this.closeNotification.bind(this);
      }

      return (

        <TidepoolNotification
          type={notification.type}
          onClose={handleClose}>
          {notification.message}
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

  render() {
    this.props.route.log('Rendering AppComponent');
    var overlay = this.renderOverlay();
    var navbar = this.renderNavbar();
    var notification = this.renderNotification();
    var footer = this.renderFooter();

    return (
      <div className="app" onClick={this.hideNavbarDropdown.bind(this)}>
        {overlay}
        {navbar}
        {notification}
        {this.props.children}
        {footer}
      </div>
    );
  }
}

let setBgPrefs = (dispatchProps, ownProps) => () => {
  let queryParams = (ownProps.location && ownProps.location.query) ? ownProps.location.query : {};

  var bgPrefs = {
    bgUnits: 'mg/dL'
  };

  if (!_.isEmpty(queryParams.units)) {
    var queryUnits = queryParams.units.toLowerCase();
    if (queryUnits === 'mmoll') {
      bgPrefs.bgUnits = 'mmol/L';
    }
  }

  dispatchProps.setBloodGlucosePreferences(bgPrefs);
};

let setTimePrefs = (dispatchProps, ownProps) => () => {
  let queryParams = (ownProps.location && ownProps.location.query) ? ownProps.location.query : {};

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
      ownProps.route.log('Viewing data in timezone-aware mode with', queryTimezone, 'as the selected timezone.');
    }
    catch(err) {
      ownProps.route.log(new Error('Invalid timezone name in query parameter. (Try capitalizing properly.)'));
    }
  }

  dispatchProps.setTimePreferences(timePrefs);
};

let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    setBgPrefs(dispatchProps, ownProps),
    setTimePrefs(dispatchProps, ownProps),
    dispatchProps.fetchUser.bind(null, api)
  ];
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let mapStateToProps = state => {
  var user = null;
  var patient = null;
  if (state.blip.allUsersMap){
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }

    if (state.blip.currentPatientInViewId){
      patient = state.blip.allUsersMap[state.blip.currentPatientInViewId];
    }
  }

  return {
    authenticated: state.blip.isLoggedIn,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    loggingOut: state.blip.working.loggingOut.inProgress,
    termsAccepted: _.get(user, 'termsAccepted', null),
    user: user,
    patient: patient
  };

};

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchUser: actions.async.fetchUser,
  acceptTerms: actions.async.acceptTerms,
  logout: actions.async.logout,
  setBloodGlucosePreferences: actions.sync.setBloodGlucosePreferences,
  setTimePreferences: actions.sync.setTimePreferences,
  onCloseNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, ownProps, stateProps, dispatchProps, {
    fetchers: getFetchers(dispatchProps, ownProps, api),
    fetchUser: dispatchProps.fetchUser.bind(null, api),
    onLogout: dispatchProps.logout.bind(null, api),
    onAcceptTerms: dispatchProps.acceptTerms.bind(null, api),
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AppComponent);