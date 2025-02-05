import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import i18next from '../../core/language';
import { Box } from 'theme-ui';
import { withLDConsumer } from 'launchdarkly-react-client-sdk';
import { withTranslation } from 'react-i18next';

import * as actions from '../../redux/actions';
import { ldContext } from '../../redux/utils/launchDarklyMiddleware';

import utils from '../../core/utils';
import personUtils from '../../core/personutils';
import config from '../../config';

import * as ErrorMessages from '../../redux/constants/errorMessages';
import * as UserMessages from '../../redux/constants/usrMessages';

// Components
import Navbar from '../../components/navbar';
import LogoutOverlay from '../../components/logoutoverlay';
import TidepoolNotification from '../../components/notification';
import FooterLinks from '../../components/footerlinks';
import Version from '../../components/version';

import { DATA_DONATION_NONPROFITS } from '../../core/constants';
import NavPatientHeader from '../../components/navpatientheader';
import AppWrapper from './AppWrapper';

// Styles
require('tideline/css/tideline.less');
require('../../style.less');

export class AppComponent extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired,
    currentPatientInViewId: PropTypes.string,
    fetchers: PropTypes.array.isRequired,
    fetchingPatient: PropTypes.bool.isRequired,
    fetchingPendingSentInvites: PropTypes.bool.isRequired,
    fetchingUser: PropTypes.shape({
      inProgress: PropTypes.bool.isRequired,
      completed: PropTypes.bool,
    }).isRequired,
    fetchingDataSources: PropTypes.shape({
      inProgress: PropTypes.bool.isRequired,
      completed: PropTypes.bool,
    }).isRequired,
    location: PropTypes.string.isRequired,
    loggingOut: PropTypes.bool.isRequired,
    updatingDataDonationAccounts: PropTypes.bool.isRequired,
    notification: PropTypes.object,
    onAcceptTerms: PropTypes.func.isRequired,
    onCloseNotification: PropTypes.func.isRequired,
    onUpdateDataDonationAccounts: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    patient: PropTypes.object,
    context: PropTypes.shape({
      DEBUG: PropTypes.bool.isRequired,
      api: PropTypes.object.isRequired,
      config: PropTypes.object.isRequired,
      log: PropTypes.func.isRequired,
      personUtils: PropTypes.object.isRequired,
      trackMetric: PropTypes.func.isRequired,
    }).isRequired,
    selectedClinicId: PropTypes.string,
    termsAccepted: PropTypes.string,
    user: PropTypes.object,
    userIsCurrentPatient: PropTypes.bool.isRequired,
    userIsDonor: PropTypes.bool.isRequired,
    userIsSupportingNonprofit: PropTypes.bool.isRequired,
    permsOfLoggedInUser: PropTypes.object,
    resentEmailVerification: PropTypes.bool.isRequired,
  };

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
  UNSAFE_componentWillMount() {
    this.doFetching(this.props);
  }

  /**
   * Before any subsequent re-rendering
   * begin fetching any required data
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      authenticated,
    } = nextProps;

    // Send new context to the LaunchDarkly client context whenever the logged-in user ID or
    // selected clinic ID changes
    const ldClientContext = nextProps.ldClient?.getContext();
    if (
      (ldContext?.user?.key !== ldClientContext?.user?.key) ||
      (ldContext?.clinic?.key !== ldClientContext?.clinic?.key)
    ) {
      nextProps.ldClient?.identify(ldContext);
    }

    if (
      !utils.isOnSamePage(this.props, nextProps) ||
      this.props.authenticated !== authenticated
    ) {
      this.doFetching(nextProps);
    }

    // if (showingDonateBanner !== false) {
    //   const showDonateBanner = isBannerRoute && userIsCurrentPatient && userHasData && !userIsSupportingNonprofit;

    //   if (showDonateBanner) {
    //     this.props.showBanner('donate');
    //   } else if (showingDonateBanner) {
    //     this.props.hideBanner('donate');
    //   }
    // }

    // if (showingUpdateTypeBanner !== false) {
    //   const showUpdateTypeBanner = isBannerRoute && userIsCurrentPatient && !userHasDiabetesType;

    //   if (showUpdateTypeBanner) {
    //     this.props.showBanner('updatetype');
    //   } else if (showingUpdateTypeBanner) {
    //     this.props.hideBanner('updatetype');
    //   }
    // }
  }

  /**
   * Render Functions
   */

  renderOverlay() {
    this.props.context.log('Rendering overlay');
    if (this.props.loggingOut) {
      return (
        <LogoutOverlay />
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
        (_.get(this.props.fetchingUser, 'inProgress') || this.props.fetchingPatient)) {
        var patient, getUploadUrl;
        if (this.isPatientVisibleInNavbar()) {
          patient = this.props.patient;
          getUploadUrl = this.props.context.api.getUploadUrl.bind(this.props.context.api);
        }
        return (
          <Box className="App-navbar" variant="containers.large" bg="transparent" mb={0} py={2}>
            <Navbar
              user={this.props.user}
              fetchingUser={_.get(this.props.fetchingUser, 'inProgress')}
              patient={patient}
              fetchingPatient={this.props.fetchingPatient}
              currentPage={this.props.location}
              query={this.props.query}
              clinicFlowActive={this.props.clinicFlowActive}
              clinics={this.props.clinics}
              getUploadUrl={getUploadUrl}
              onLogout={this.props.onLogout}
              trackMetric={this.props.context.trackMetric}
              permsOfLoggedInUser={this.props.permsOfLoggedInUser}
              api={this.props.context.api}
              selectedClinicId={this.props.selectedClinicId}
            />
          </Box>
        );
      }
    }
    return null;
  }

  renderNavPatientHeader() {
    const {
      patient,
      clinicPatient,
      user,
      permsOfLoggedInUser,
      context: { trackMetric },
      clinicFlowActive,
      selectedClinicId,
      query,
    } = this.props;

    if (!this.isPatientVisibleInNavbar()) return null; // only show on pages with a patient of focus

    return (
      <NavPatientHeader
        patient={patient}
        clinicPatient={clinicPatient}
        user={user}
        trackMetric={trackMetric}
        permsOfLoggedInUser={permsOfLoggedInUser}
        clinicFlowActive={clinicFlowActive}
        selectedClinicId={selectedClinicId}
        query={query}
      />
    );
  }

  // renderDonateBanner() {
  //   this.props.context.log('Rendering donation banner');

  //   const {
  //     showingDonateBanner,
  //     onDismissDonateBanner,
  //     onUpdateDataDonationAccounts,
  //     patient,
  //     userIsDonor,
  //   } = this.props;

  //   if (showingDonateBanner) {
  //     return (
  //       <div className="App-donatebanner">
  //         <DonateBanner
  //           onClose={onDismissDonateBanner}
  //           onConfirm={onUpdateDataDonationAccounts}
  //           processingDonation={this.props.updatingDataDonationAccounts || this.props.fetchingPendingSentInvites}
  //           trackMetric={this.props.context.trackMetric}
  //           patient={patient}
  //           userIsDonor={userIsDonor} />
  //       </div>
  //     );
  //   }

  //   return null;
  // }

  // renderUpdateTypeBanner() {
  //   this.props.context.log('Rendering update type banner');

  //   const {
  //     showingUpdateTypeBanner,
  //     onClickUpdateTypeBanner,
  //     onDismissUpdateTypeBanner,
  //     patient,
  //   } = this.props;

  //   if (showingUpdateTypeBanner) {
  //     return (
  //       <div className="App-updatetypebanner">
  //         <UpdateTypeBanner
  //           onClick={onClickUpdateTypeBanner}
  //           onClose={onDismissUpdateTypeBanner}
  //           trackMetric={this.props.context.trackMetric}
  //           patient={patient} />
  //       </div>
  //     );
  //   }

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
      [
        '/signup',
        '/signup/personal',
        '/signup/clinician',
        '/email-verification',
        '/request-password-reset',
        '/terms',
        '/patients/new'
      ],
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
    var version = [this.props.context.config.VERSION];

    // get environment from first subdomain on API_HOST, if present
    var firstSubdomain = /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i
    var environment = this.props.context.config.API_HOST?.match(firstSubdomain)?.[1];

    // don't append hostname or environment for production
    if (environment !== 'app') {
      // get hostname from first segment of window hostname
      var hostname = _.get(window, 'location.hostname', '').split('.')[0];

      // only append hostname if different than environment (i.e. localhost connecting to qa2)
      if (hostname && hostname !== environment) version.push(hostname);

      version.push(environment);
    }

    // strip out any undefined values
    version = _.compact(version);

    if (version.length) {
      return (
        <Version version={version.join('-')} />
      );
    }

    return null;
  }

  render() {
    this.props.context.log('Rendering AppComponent');
    var overlay = this.renderOverlay();
    var navbar = this.renderNavbar();
    var navHeader = this.renderNavPatientHeader();
    var notification = this.renderNotification();
    var footer = this.renderFooter();

    return (
      <AppWrapper trackMetric={this.props.context.trackMetric}>
        {overlay}
        {navbar}
        {navHeader}
        {notification}
        {this.props.children}
        {footer}
      </AppWrapper>
    );
  }
}

export function getFetchers(stateProps, dispatchProps, api) {
  const fetchers = [];

  if (!stateProps.fetchingUser.inProgress && !stateProps.fetchingUser.completed) {
    fetchers.push(dispatchProps.fetchUser.bind(null, api));
  }

  if (stateProps.authenticated && !stateProps.fetchingDataSources.inProgress && !stateProps.fetchingDataSources.completed) {
    fetchers.push(dispatchProps.fetchDataSources.bind(null, api));
  }

  if (!stateProps.fetchingInfo.inProgress && !stateProps.fetchingInfo.completed) {
    fetchers.push(dispatchProps.fetchInfo.bind(null, api));
  }

  return fetchers;
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  let user = null;
  let patient = null;
  let patientDexcomDataSource;
  let clinicPatient;
  let permissions = null;
  let permsOfLoggedInUser = null;
  let userIsDonor = _.get(state, 'blip.dataDonationAccounts', []).length > 0;
  let dataSources = _.get(state, 'blip.dataSources', []);
  let userHasConnectedDataSources = dataSources.length > 0;
  let userDexcomDataSource = _.find(dataSources, { providerName: 'dexcom' });
  let userHasSharedData = _.get(state, 'blip.membersOfTargetCareTeam', []).length > 0;
  let userHasSharedDataWithClinician = false;
  let userIsSupportingNonprofit = false;
  let userIsCurrentPatient = false;
  let userHasDiabetesType = false;

  if (userHasSharedData) {
    let userCareTeam = Object.values(_.get(state, 'blip.allUsersMap'));
    userHasSharedDataWithClinician = userCareTeam.some(user => {
      return personUtils.isClinicianAccount(user);
    });
  }

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];

      if (state.blip.loggedInUserId === state.blip.currentPatientInViewId) {
        userIsCurrentPatient = true;
      }

      if (config.I18N_ENABLED && _.get(user, 'preferences.displayLanguageCode')) {
        i18next.changeLanguage(user.preferences.displayLanguageCode);
      }

      if (_.get(user, 'profile.patient.diagnosisType')) {
          userHasDiabetesType = true;
      }
    }

    if (state.blip.currentPatientInViewId) {
      patient = _.get(
        state.blip.allUsersMap,
        state.blip.currentPatientInViewId,
        null
      );

      clinicPatient = _.get(state.blip.clinics, [state.blip.selectedClinicId, 'patients', state.blip.currentPatientInViewId]);

      permissions = _.get(
        state.blip.permissionsOfMembersInTargetCareTeam,
        state.blip.currentPatientInViewId,
        {}
      );

      permsOfLoggedInUser = state.blip.selectedClinicId
        ? _.get(
          state.blip.clinics,
          [
            state.blip.selectedClinicId,
            'patients',
            state.blip.currentPatientInViewId,
            'permissions',
          ],
          {}
        ) : _.get(
          state.blip.membershipPermissionsInOtherCareTeams,
          state.blip.currentPatientInViewId,
          {}
        );

      if (clinicPatient) {
        patientDexcomDataSource = _.find(clinicPatient.dataSources, { providerName: 'dexcom' });
      }
    }

    // Check to see if a data-donating patient has selected a nonprofit to support
    if (userIsDonor) {
      //eslint-disable-next-line new-cap
      let allDonationAccountEmails = _.map(DATA_DONATION_NONPROFITS(), nonprofit => `bigdata+${nonprofit.value}@tidepool.org`);
      let userDonationAccountEmails = _.map(state.blip.dataDonationAccounts, 'email');
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
    clinics: state.blip.clinics,
    clinicFlowActive: state.blip.clinicFlowActive,
    clinicPatient,
    currentPatientInViewId: state.blip.currentPatientInViewId,
    fetchingUser: state.blip.working.fetchingUser,
    fetchingDataSources: state.blip.working.fetchingDataSources,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    fetchingPendingSentInvites: state.blip.working.fetchingPendingSentInvites.inProgress,
    loggingOut: state.blip.working.loggingOut.inProgress,
    updatingDataDonationAccounts: state.blip.working.updatingDataDonationAccounts.inProgress,
    notification: displayNotification,
    termsAccepted: _.get(user, 'termsAccepted', null),
    user: user,
    patient: patient ? { permissions, ...patient } : null,
    permsOfLoggedInUser: permsOfLoggedInUser,
    selectedClinicId: state.blip.selectedClinicId,
    userIsCurrentPatient,
    userHasDiabetesType,
    userIsDonor,
    userHasConnectedDataSources,
    userDexcomDataSource,
    patientDexcomDataSource,
    userHasSharedDataWithClinician,
    userIsSupportingNonprofit,
    resendEmailVerificationInProgress: state.blip.working.resendingEmailVerification.inProgress,
    resentEmailVerification: state.blip.resentEmailVerification,
    fetchingInfo: state.blip.working.fetchingInfo,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  acceptTerms: actions.async.acceptTerms,
  fetchDataSources: actions.async.fetchDataSources,
  fetchUser: actions.async.fetchUser,
  logout: actions.async.logout,
  onCloseNotification: actions.sync.acknowledgeNotification,
  updateDataDonationAccounts: actions.async.updateDataDonationAccounts,
  resendEmailVerification: actions.async.resendEmailVerification,
  fetchInfo: actions.async.fetchInfo,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;
  return Object.assign({}, _.pick(ownProps, ['children', 'history', 'ldClient']), stateProps, {
    context: {
      DEBUG: ownProps.DEBUG,
      api: ownProps.api,
      config: ownProps.config,
      log: ownProps.log,
      personUtils: ownProps.personUtils,
      trackMetric: ownProps.trackMetric,
    },
    fetchDataSources: dispatchProps.fetchDataSources.bind(null, api),
    fetchers: getFetchers(stateProps, dispatchProps, api),
    location: ownProps.location.pathname,
    query: ownProps.location.query,
    onAcceptTerms: dispatchProps.acceptTerms.bind(null, api),
    onCloseNotification: dispatchProps.onCloseNotification,
    onUpdateDataDonationAccounts: dispatchProps.updateDataDonationAccounts.bind(null, api),
    onResendEmailVerification: dispatchProps.resendEmailVerification.bind(null, api),
    onLogout: dispatchProps.logout.bind(null, api),
  });
};

export default withLDConsumer()(connect(mapStateToProps, mapDispatchToProps, mergeProps)(withTranslation()(props => <AppComponent {...props}/>)));
