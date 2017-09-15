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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';

import * as ErrorMessages from '../../redux/constants/errorMessages';
import * as UserMessages from '../../redux/constants/usrMessages';

// Components
import Navbar from '../../components/navbar';
import DonateBanner from '../../components/donatebanner';
import LogoutOverlay from '../../components/logoutoverlay';
import TidepoolNotification from '../../components/notification';

import FooterLinks from '../../components/footerlinks';
import Version from '../../components/version';

import { DATA_DONATION_NONPROFITS } from '../../core/constants';

// Styles
require('react-select/less/default.less');
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
    fetchingPendingSentInvites: React.PropTypes.bool.isRequired,
    fetchingUser: React.PropTypes.bool.isRequired,
    location: React.PropTypes.string.isRequired,
    loggingOut: React.PropTypes.bool.isRequired,
    updatingDataDonationAccounts: React.PropTypes.bool.isRequired,
    notification: React.PropTypes.object,
    onAcceptTerms: React.PropTypes.func.isRequired,
    onCloseNotification: React.PropTypes.func.isRequired,
    onDismissDonateBanner: React.PropTypes.func.isRequired,
    onUpdateDataDonationAccounts: React.PropTypes.func.isRequired,
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
    showingDonateBanner: React.PropTypes.bool,
    showDonateBanner: React.PropTypes.func.isRequired,
    hideDonateBanner: React.PropTypes.func.isRequired,
    termsAccepted: React.PropTypes.string,
    user: React.PropTypes.object,
    userHasData: React.PropTypes.bool.isRequired,
    userIsCurrentPatient: React.PropTypes.bool.isRequired,
    userIsDonor: React.PropTypes.bool.isRequired,
    userIsSupportingNonprofit: React.PropTypes.bool.isRequired,
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
    const {
      showingDonateBanner,
      location,
      userHasData,
      userIsCurrentPatient,
      userIsSupportingNonprofit
    } = nextProps;

    if (!utils.isOnSamePage(this.props, nextProps)) {
      this.doFetching(nextProps);
    }

    // Determine whether or not to show the donate banner.
    // If showingDonateBanner is false, it means it was dismissed and we do not show it again.
    if (showingDonateBanner !== false) {
      const isBannerRoute = /^\/patients\/\S+\/data/.test(location);
      const showBanner = isBannerRoute && userIsCurrentPatient && userHasData && !userIsSupportingNonprofit;

      if (showBanner) {
        this.props.showDonateBanner();
      } else if (showingDonateBanner) {
        this.props.hideDonateBanner();
      }
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
      '/signup/personal',
      '/signup/clinician',
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

  renderDonateBanner() {
    this.props.context.log('Rendering donation banner');

    const {
      showingDonateBanner,
      onDismissDonateBanner,
      onUpdateDataDonationAccounts,
      patient,
      userIsDonor,
    } = this.props;

    if (showingDonateBanner) {
      return (
        <div className="App-donatebanner">
          <DonateBanner
            onClose={onDismissDonateBanner}
            onConfirm={onUpdateDataDonationAccounts}
            processingDonation={this.props.updatingDataDonationAccounts || this.props.fetchingPendingSentInvites}
            trackMetric={this.props.context.trackMetric}
            patient={patient}
            userIsDonor={userIsDonor} />
        </div>
      );
    }

    return null;
  }

  renderNotification() {
    var notification = this.props.notification;
    var handleClose;

    // On these paths, we only display the notifications inline under the forms,
    // rather than in a modal that requires the user to dismiss it.
    var shouldDisplayNotification = !_.includes(
      ['/login', '/email-verification', '/signup', '/signup/personal', '/signup/clinician'],
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
    var shouldDisplayFooterLinks = !_.includes(
      ['/signup', '/signup/personal', '/signup/clinician', '/email-verification', '/terms', '/patients/new'],
      this.props.location
    );

    return (
      <div className='container-nav-outer footer'>
        <div className='container-nav-inner'>
          {shouldDisplayFooterLinks ?
              <FooterLinks trackMetric={this.props.context.trackMetric} /> : null}
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
      return (
        <Version version={version} />
      );
    }
    return null;
  }

  render() {
    this.props.context.log('Rendering AppComponent');
    var overlay = this.renderOverlay();
    var navbar = this.renderNavbar();
    var notification = this.renderNotification();
    var donatebanner = this.renderDonateBanner();
    var footer = this.renderFooter();

    return (
      <div className="app" onClick={this.hideNavbarDropdown.bind(this)}>
        {overlay}
        {navbar}
        {notification}
        {donatebanner}
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
  let permissions = null;
  let userIsDonor = _.get(state, 'blip.dataDonationAccounts', []).length > 0;
  let userIsSupportingNonprofit = false;
  let userIsCurrentPatient = false;
  let userHasData = false;

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];

      let data = _.get(state.blip.patientDataMap, state.blip.loggedInUserId, null);
      userHasData = !!(data && !!data.length); // convert null or empty array val to boolean

      if (state.blip.loggedInUserId === state.blip.currentPatientInViewId) {
        userIsCurrentPatient = true;
      }
    }

    if (state.blip.currentPatientInViewId) {
      patient = _.get(
        state.blip.allUsersMap,
        state.blip.currentPatientInViewId,
        null
      );
      permissions = _.get(
        state.blip.permissionsOfMembersInTargetCareTeam,
        state.blip.currentPatientInViewId,
        {}
      );
    }

    // Check to see if a data-donating patient has selected a nonprofit to support
    if (userIsDonor) {
      let allDonationAccountEmails = _.map(DATA_DONATION_NONPROFITS, nonprofit => `bigdata+${nonprofit.value}@tidepool.org`);
      let userDonationAccountEmails = _.pluck(state.blip.dataDonationAccounts, 'email');
      userIsSupportingNonprofit = _.intersection(allDonationAccountEmails, userDonationAccountEmails).length > 0;
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
    fetchingPendingSentInvites: state.blip.working.fetchingPendingSentInvites.inProgress,
    loggingOut: state.blip.working.loggingOut.inProgress,
    updatingDataDonationAccounts: state.blip.working.updatingDataDonationAccounts.inProgress,
    notification: displayNotification,
    termsAccepted: _.get(user, 'termsAccepted', null),
    user: user,
    patient: patient ? { permissions, ...patient } : null,
    showingDonateBanner: state.blip.showingDonateBanner,
    userIsCurrentPatient,
    userHasData,
    userIsDonor,
    userIsSupportingNonprofit,
  };
};

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchUser: actions.async.fetchUser,
  acceptTerms: actions.async.acceptTerms,
  logout: actions.async.logout,
  onCloseNotification: actions.sync.acknowledgeNotification,
  onDismissDonateBanner: actions.async.dismissDonateBanner,
  updateDataDonationAccounts: actions.async.updateDataDonationAccounts,
  showDonateBanner: actions.sync.showDonateBanner,
  hideDonateBanner: actions.sync.hideDonateBanner,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, _.pick(ownProps, ['children']), stateProps, {
    context: ownProps.route,
    fetchers: getFetchers(dispatchProps, ownProps, api),
    location: ownProps.location.pathname,
    onAcceptTerms: dispatchProps.acceptTerms.bind(null, api),
    onCloseNotification: dispatchProps.onCloseNotification,
    onDismissDonateBanner: dispatchProps.onDismissDonateBanner.bind(null, api),
    onUpdateDataDonationAccounts: dispatchProps.updateDataDonationAccounts.bind(null, api),
    showDonateBanner: dispatchProps.showDonateBanner,
    hideDonateBanner: dispatchProps.hideDonateBanner,
    onLogout: dispatchProps.logout.bind(null, api)
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AppComponent);
