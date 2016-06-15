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

import * as ErrorMessages from '../../redux/constants/errorMessages';
import * as UserMessages from '../../redux/constants/usrMessages';

// Components
import Navbar from '../../components/navbar';
import LogoutOverlay from '../../components/logoutoverlay';
import TidepoolNotification from '../../components/notification';
import MailTo from '../../components/mailto';

// Styles
require('tideline/css/tideline.less');
require('../../style.less');

// Blip favicon
require('../../../favicon.ico');

export class AppComponent extends React.Component {
  static propTypes = {
    authenticated: React.PropTypes.bool.isRequired,
    children: React.PropTypes.object.isRequired,
    fetchers: React.PropTypes.array.isRequired,
    fetchingPatient: React.PropTypes.bool.isRequired,
    fetchingUser: React.PropTypes.bool.isRequired,
    location: React.PropTypes.string.isRequired,
    loggingOut: React.PropTypes.bool.isRequired,
    notification: React.PropTypes.object,
    onAcceptTerms: React.PropTypes.func.isRequired,
    onCloseNotification: React.PropTypes.func.isRequired,
    onLogout: React.PropTypes.func.isRequired,
    patient: React.PropTypes.object,
    context: React.PropTypes.shape({
      DEBUG: React.PropTypes.bool.isRequired,
      api: React.PropTypes.object.isRequired,
      config: React.PropTypes.object.isRequired,
      log: React.PropTypes.func.isRequired,
      personUtils: React.PropTypes.object.isRequired,
      trackMetric: React.PropTypes.func.isRequired,
    }).isRequired,
    termsAccepted: React.PropTypes.string,
    user: React.PropTypes.object
  };

  constructor(props) {
    super(props);
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
    return /^\/patients\/\S+/.test(this.props.location);
  }

  logSupportContact() {
    this.props.context.trackMetric('Clicked Give Feedback');
  }

  closeNotification() {
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
    this.props.context.log('Rendering overlay');
    if (this.props.loggingOut) {
      return (
        <LogoutOverlay ref="logoutOverlay" />
      );
    }
  }

  renderNavbar() {
    this.props.context.log('Rendering navbar');
    // at some point we should refactor so that LoginNav and NavBar
    // have a common parent that can decide what to render
    // but for now we just make sure we don't render the NavBar on a NoAuth route
    // such routes are where the LoginNav appears instead
    var LOGIN_NAV_ROUTES = [
      '/',
      '/confirm-password-reset',
      '/email-verification',
      '/login',
      '/request-password-reset',
      '/request-password-from-uploader',
      '/signup',
      '/terms'
    ];
    if (!_.includes(LOGIN_NAV_ROUTES, this.props.location)) {
      if (this.props.authenticated ||
        (this.props.fetchingUser || this.props.fetchingPatient)) {
        var patient, getUploadUrl;
        if (this.isPatientVisibleInNavbar()) {
          patient = this.props.patient;
          getUploadUrl = this.props.context.api.getUploadUrl.bind(this.props.context.api);
        }

        return (
          <div className="App-navbar">
            <Navbar
              user={this.props.user}
              fetchingUser={this.props.fetchingUser}
              patient={patient}
              fetchingPatient={this.props.fetchingPatient}
              currentPage={this.props.location}
              getUploadUrl={getUploadUrl}
              onLogout={this.props.onLogout}
              trackMetric={this.props.context.trackMetric}
              ref="navbar"/>
          </div>
        );
      }
    }

    return null;
  }

  renderNotification() {
    var notification = this.props.notification;
    var handleClose;

    var shouldDisplayNotification = !_.includes(
      ['/login', '/email-verification', '/signup'],
      this.props.location
    );

    if (notification && shouldDisplayNotification) {
      this.props.context.log('Rendering notification');
      if (notification.isDismissible) {
        handleClose = this.props.onCloseNotification.bind(this);
      }

      return (
        <TidepoolNotification
          type={notification.type}
          contents={notification.body}
          link={notification.link}
          onClose={handleClose}>
        </TidepoolNotification>
      );
    }

    return null;
  }

  renderFooter() {
    var title ='Send us feedback';
    var subject = 'Feedback on Blip';

    return (
      <div className='container-nav-outer footer'>
        <div className='container-nav-inner'>
          <div className='footer-section footer-section-top'>
            <div className='footer-link'>
              <a href="http://tidepool.org/notes" target="_blank">Get Blip Notes App</a>
            </div>
            <div className='footer-link'>
              <a href="http://support.tidepool.org" target="_blank">Get Support</a>
            </div>
            <div className='footer-link'>
              <a href='https://tidepool.org/terms-of-use' target='_blank'>Privacy and Terms of Use</a>
            </div>
          </div>
          <div className='footer-section'>
            {this.renderVersion()}
          </div>
        </div>
      </div>

    );
  }

  renderVersion() {
    var version = this.props.context.config.VERSION;
    if (version) {
      version = 'v' + version + ' beta';
      return (
        <div className="Navbar-version" ref="version">{version}</div>
      );
    }
    return null;
  }

  render() {
    this.props.context.log('Rendering AppComponent');
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

let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchUser.bind(null, api)
  ];
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  let user = null;
  let patient = null;

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }

    if (state.blip.currentPatientInViewId) {
      patient = state.blip.allUsersMap[state.blip.currentPatientInViewId];
      if (state.blip.targetUserId && state.blip.currentPatientInViewId === state.blip.targetUserId) {
        const permsOfTargetOnTarget = _.get(
          state.blip.permissionsOfMembersInTargetCareTeam,
          state.blip.currentPatientInViewId,
          null
        );
        if (permsOfTargetOnTarget) {
          patient.permissions = permsOfTargetOnTarget;
        }
      }
    }
  }

  let displayNotification = null;

  if (state.blip.notification !== null) {
    const utcTime = UserMessages.MSG_UTC + new Date().toISOString();
    const notificationFromWorking = _.get(
      state.blip.working[_.get(state.blip.notification, 'key')],
      'notification'
    );
    let displayMessage = _.get(
      notificationFromWorking, 'message', ErrorMessages.ERR_GENERIC
    );

    const status = _.get(state.blip.notification, 'status');
    if (status !== null) {
      switch (status) {
        case 401:
          if (state.blip.isLoggedIn) {
            displayMessage = ErrorMessages.ERR_AUTHORIZATION;
          } else {
            displayMessage = null;
          }
          break;
        case 500:
          displayMessage = ErrorMessages.ERR_SERVICE_DOWN;
          break;
        case 503: 
          displayMessage = ErrorMessages.ERR_OFFLINE;
          break;
      }
    }
    if (displayMessage) {
      displayNotification = _.assign(
        _.omit(state.blip.notification, 'key'),
        {
          type: _.get(notificationFromWorking, 'type'),
          body: { message: displayMessage, utc: utcTime }
        }
      );
    }
  }

  return {
    authenticated: state.blip.isLoggedIn,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    loggingOut: state.blip.working.loggingOut.inProgress,
    notification: displayNotification,
    termsAccepted: _.get(user, 'termsAccepted', null),
    user: user,
    patient: patient
  };

};

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchUser: actions.async.fetchUser,
  acceptTerms: actions.async.acceptTerms,
  logout: actions.async.logout,
  onCloseNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, _.pick(ownProps, ['children']), stateProps, {
    context: ownProps.route,
    fetchers: getFetchers(dispatchProps, ownProps, api),
    location: ownProps.location.pathname,
    onAcceptTerms: dispatchProps.acceptTerms.bind(null, api),
    onCloseNotification: dispatchProps.onCloseNotification,
    onLogout: dispatchProps.logout.bind(null, api)
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AppComponent);
