import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import i18next from '../../core/language';
import moment from 'moment';
import { Box } from 'rebass/styled-components';

import * as actions from '../../redux/actions';

import utils from '../../core/utils';
import personUtils from '../../core/personutils';
import config from '../../config';

import * as ErrorMessages from '../../redux/constants/errorMessages';
import * as UserMessages from '../../redux/constants/usrMessages';

// Components
import Navbar from '../../components/navbar';
import DonateBanner from '../../components/donatebanner';
import DexcomBanner from '../../components/dexcombanner';
import AddEmailBanner from '../../components/addemailbanner';
import SendVerificationBanner from '../../components/sendverificationbanner';
import LogoutOverlay from '../../components/logoutoverlay';
import ShareDataBanner from '../../components/sharedatabanner';
import TidepoolNotification from '../../components/notification';
import UpdateTypeBanner from '../../components/updatetypebanner';
import UploaderBanner from '../../components/uploaderbanner';

import FooterLinks from '../../components/footerlinks';
import Version from '../../components/version';

import { DATA_DONATION_NONPROFITS } from '../../core/constants';

// Styles
require('tideline/css/tideline.less');
require('../../style.less');

export class AppComponent extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    children: PropTypes.object.isRequired,
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
    onDismissDonateBanner: PropTypes.func.isRequired,
    onDismissDexcomConnectBanner: PropTypes.func.isRequired,
    onDismissShareDataBanner: PropTypes.func,
    onDismissUpdateTypeBanner: PropTypes.func,
    onDismissUploaderBanner: PropTypes.func,
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
    showingDonateBanner: PropTypes.bool,
    showingDexcomConnectBanner: PropTypes.bool,
    showingShareDataBanner: PropTypes.bool,
    seenShareDataBannerMax: PropTypes.bool,
    showingUpdateTypeBanner: PropTypes.bool,
    showingUploaderBanner: PropTypes.bool,
    showBanner: PropTypes.func.isRequired,
    hideBanner: PropTypes.func.isRequired,
    termsAccepted: PropTypes.string,
    user: PropTypes.object,
    userHasData: PropTypes.bool.isRequired,
    userIsCurrentPatient: PropTypes.bool.isRequired,
    userIsDonor: PropTypes.bool.isRequired,
    userIsSupportingNonprofit: PropTypes.bool.isRequired,
    permsOfLoggedInUser: PropTypes.object,
    resentEmailVerification: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      dexcomShowBannerMetricTracked: false,
      donateShowBannerMetricTracked: false,
      shareDataBannerMetricTracked: false,
      updateTypeBannerMetricTracked: false,
      uploaderBannerMetricTracked: false,
    }
  }

  hideNavbarDropdown() {
    var navbar = this.refs.navbar;

    if (navbar) {
      navbar.getWrappedInstance().hideDropdown();
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
  UNSAFE_componentWillMount() {
    this.doFetching(this.props);
  }

  /**
   * Before any subsequent re-rendering
   * begin fetching any required data
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      showingDonateBanner,
      showingDexcomConnectBanner,
      showingShareDataBanner,
      updateShareDataBannerSeen,
      seenShareDataBannerMax,
      showingUpdateTypeBanner,
      showingUploaderBanner,
      location,
      userHasData,
      userHasConnectedDataSources,
      userHasSharedDataWithClinician,
      userHasDiabetesType,
      userIsCurrentPatient,
      userIsSupportingNonprofit,
      patient,
      authenticated,
      clinics,
      selectedClinicId,
    } = nextProps;

    if (
      !utils.isOnSamePage(this.props, nextProps) ||
      this.props.authenticated !== authenticated
    ) {
      this.doFetching(nextProps);
    }

    const isBannerRoute = /^\/patients\/\S+\/data/.test(location);

    const showUploaderBanner = authenticated && moment().isBefore('2020-10-01');
    let displayUploaderBanner = false;

    if (showingUploaderBanner !== false) {
      if (showUploaderBanner) {
        this.props.showBanner('uploader');
        displayUploaderBanner = true;

        if (this.props.context.trackMetric && !this.state.uploaderShowBannerMetricTracked) {
          this.props.context.trackMetric('Uploader banner displayed');
          this.setState({ uploaderShowBannerMetricTracked: true });
        }
      } else if (showingUploaderBanner) {
        this.props.hideBanner('uploader');
      }
    }

    let displayShareDataBanner = false;

    if (showingShareDataBanner !== false && !displayUploaderBanner) {
      const showShareDataBanner = isBannerRoute && userIsCurrentPatient && userHasData && !userHasSharedDataWithClinician && !seenShareDataBannerMax;
      if (showShareDataBanner) {
        this.props.showBanner('sharedata');
        displayShareDataBanner = true;
        updateShareDataBannerSeen(patient.userid);

        if (this.props.context.trackMetric && !this.state.shareDataBannerMetricTracked) {
          this.props.context.trackMetric('Share Data banner displayed');
          this.setState({ shareDataBannerMetricTracked: true });
        }
      } else if (showingShareDataBanner) {
        this.props.hideBanner('sharedata');
      }
    }

    let displayDonateBanner = false;

    if (showingDonateBanner !== false && !displayUploaderBanner && !displayShareDataBanner) {
      const showDonateBanner = isBannerRoute && userIsCurrentPatient && userHasData && !userIsSupportingNonprofit;
          if (showDonateBanner) {
            this.props.showBanner('donate');
            displayDonateBanner = true;

            if (this.props.context.trackMetric && !this.state.donateShowBannerMetricTracked) {
              this.props.context.trackMetric('Big Data banner displayed');
              this.setState({ donateShowBannerMetricTracked: true });
            }
          } else if (showingDonateBanner) {
            this.props.hideBanner('donate');
          }
        }

    let displayDexcomConnectBanner = false;

    if (showingDexcomConnectBanner !== false && !displayUploaderBanner && !displayShareDataBanner && !displayDonateBanner) {
      const showDexcomBanner = isBannerRoute && userIsCurrentPatient && userHasData && !userHasConnectedDataSources;
      if (showDexcomBanner) {
        this.props.showBanner('dexcom');
        displayDexcomConnectBanner = true;

        if (this.props.context.trackMetric && !this.state.dexcomShowBannerMetricTracked) {
          this.props.context.trackMetric('Dexcom OAuth banner displayed');
          this.setState({ dexcomShowBannerMetricTracked: true });
        }
      } else if (showingDexcomConnectBanner) {
        this.props.hideBanner('dexcom');
      }
    }

    if (showingUpdateTypeBanner !== false && !displayUploaderBanner && !displayShareDataBanner && !displayDonateBanner && !displayDexcomConnectBanner) {
      const showUpdateTypeBanner = isBannerRoute && userIsCurrentPatient && userHasData && !userHasConnectedDataSources && !userHasDiabetesType;
      if (showUpdateTypeBanner) {
        this.props.showBanner('updatetype');

        if (this.props.context.trackMetric && !this.state.updateTypeShowBannerMetricTracked) {
          this.props.context.trackMetric('Update Type banner displayed');
          this.setState({ updateTypeShowBannerMetricTracked: true });
        }
      } else if (showingUpdateTypeBanner) {
        this.props.hideBanner('updatetype');
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
            clinicFlowActive={this.props.clinicFlowActive}
            clinics={this.props.clinics}
            getUploadUrl={getUploadUrl}
            onLogout={this.props.onLogout}
            trackMetric={this.props.context.trackMetric}
            permsOfLoggedInUser={this.props.permsOfLoggedInUser}
            api={this.props.context.api}
            selectedClinicId={this.props.selectedClinicId}
            ref="navbar"/>
          </Box>
        );
      }
    }
    return null;
  }

  renderShareDataBanner() {
    this.props.context.log('Rendering share data banner');

    const {
      showingShareDataBanner,
      onClickShareDataBanner,
      onDismissShareDataBanner,
      patient,
    } = this.props;

    if (showingShareDataBanner) {
      return (
        <div className="App-sharedatabanner">
          <ShareDataBanner
            onClick={onClickShareDataBanner}
            onClose={onDismissShareDataBanner}
            trackMetric={this.props.context.trackMetric}
            patient={patient}
            history={this.props.history}/>
        </div>
      );
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

  renderDexcomConnectBanner() {
    this.props.context.log('Rendering dexcom connect banner');

    const {
      showingDexcomConnectBanner,
      onClickDexcomConnectBanner,
      onDismissDexcomConnectBanner,
      patient,
    } = this.props;

    if (showingDexcomConnectBanner) {
      return (
        <div className="App-dexcombanner">
          <DexcomBanner
            onClick={onClickDexcomConnectBanner}
            onClose={onDismissDexcomConnectBanner}
            trackMetric={this.props.context.trackMetric}
            patient={patient} />
        </div>
      );
    }

    return null;
  }

  renderUpdateTypeBanner() {
    this.props.context.log('Rendering update type banner');

    const {
      showingUpdateTypeBanner,
      onClickUpdateTypeBanner,
      onDismissUpdateTypeBanner,
      patient,
    } = this.props;

    if (showingUpdateTypeBanner) {
      return (
        <div className="App-updatetypebanner">
          <UpdateTypeBanner
            onClick={onClickUpdateTypeBanner}
            onClose={onDismissUpdateTypeBanner}
            trackMetric={this.props.context.trackMetric}
            patient={patient} />
        </div>
      );
    }

    return null;
  }

  renderUploaderBanner() {
    this.props.context.log('Rendering uploader banner');

    const {
      showingUploaderBanner,
      onClickUploaderBanner,
      onDismissUploaderBanner,
      user,
    } = this.props;

    if (showingUploaderBanner) {
      return (
        <div className="App-uploaderbanner">
          <UploaderBanner
            onClick={onClickUploaderBanner}
            onClose={onDismissUploaderBanner}
            trackMetric={this.props.context.trackMetric}
            user={user} />
        </div>
      );
    }

    return null;
  }

  renderAddEmailBanner() {
    this.props.context.log('Rendering clinician add email banner');

    const {
      patient,
      clinicPatient,
      permsOfLoggedInUser,
      onResendEmailVerification,
      resendEmailVerificationInProgress,
      resentEmailVerification,
    } = this.props;
    if (_.has(permsOfLoggedInUser, 'custodian')) {
      const combinedPatient = personUtils.combinedAccountAndClinicPatient(patient, clinicPatient);
      if (_.isNil(combinedPatient.username)) {
        this.props.context.trackMetric('Banner displayed Add Email');
        return (
          <div className="App-addemailbanner">
            <AddEmailBanner
              trackMetric={this.props.context.trackMetric}
              patient={combinedPatient}
            />
          </div>
        );
      } else {
        this.props.context.trackMetric('Banner displayed Send Verification');
        return (
          <div className="App-sendverificationbanner">
            <SendVerificationBanner
              trackMetric={this.props.context.trackMetric}
              patient={combinedPatient}
              resendVerification={onResendEmailVerification}
              resendEmailVerificationInProgress={resendEmailVerificationInProgress}
              resentEmailVerification={resentEmailVerification}
            />
          </div>
        );
      }
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
    var notification = this.renderNotification();
    var donatebanner = this.renderDonateBanner();
    var dexcombanner = this.renderDexcomConnectBanner();
    var sharedatabanner = this.renderShareDataBanner();
    var updatetypebanner = this.renderUpdateTypeBanner();
    var uploaderbanner = this.renderUploaderBanner();
    var emailbanner = this.renderAddEmailBanner();
    var footer = this.renderFooter();

    return (
      <div className="app" onClick={this.hideNavbarDropdown.bind(this)}>
        {overlay}
        {emailbanner}
        {navbar}
        {notification}
        {donatebanner}
        {dexcombanner}
        {sharedatabanner}
        {updatetypebanner}
        {uploaderbanner}
        {this.props.children}
        {footer}
      </div>
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
  let clinicPatient;
  let permissions = null;
  let permsOfLoggedInUser = null;
  let userIsDonor = _.get(state, 'blip.dataDonationAccounts', []).length > 0;
  let userHasConnectedDataSources = _.get(state, 'blip.dataSources', []).length > 0;
  let userHasSharedData = _.get(state, 'blip.membersOfTargetCareTeam', []).length > 0;
  let userHasSharedDataWithClinician = false;
  let userIsSupportingNonprofit = false;
  let userIsCurrentPatient = false;
  let userHasData = false;
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

      userHasData = _.get(state, 'blip.data.metaData.patientId') === state.blip.loggedInUserId && _.get(state, 'blip.data.metaData.size', 0) > 0;

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
    showingDonateBanner: state.blip.showingDonateBanner,
    showingDexcomConnectBanner: state.blip.showingDexcomConnectBanner,
    showingShareDataBanner: state.blip.showingShareDataBanner,
    seenShareDataBannerMax: state.blip.seenShareDataBannerMax,
    showingUpdateTypeBanner: state.blip.showingUpdateTypeBanner,
    showingUploaderBanner: state.blip.showingUploaderBanner,
    userIsCurrentPatient,
    userHasData,
    userHasDiabetesType,
    userIsDonor,
    userHasConnectedDataSources,
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
  onDismissDonateBanner: actions.async.dismissDonateBanner,
  onDismissDexcomConnectBanner: actions.async.dismissDexcomConnectBanner,
  onDismissShareDataBanner: actions.async.dismissShareDataBanner,
  onDismissUpdateTypeBanner: actions.async.dismissUpdateTypeBanner,
  onDismissUploaderBanner: actions.async.dismissUploaderBanner,
  onClickDexcomConnectBanner: actions.async.clickDexcomConnectBanner,
  onClickShareDataBanner: actions.async.clickShareDataBanner,
  onClickUpdateTypeBanner: actions.async.clickUpdateTypeBanner,
  onClickUploaderBanner: actions.async.clickUploaderBanner,
  updateShareDataBannerSeen: actions.async.updateShareDataBannerSeen,
  updateDataDonationAccounts: actions.async.updateDataDonationAccounts,
  showBanner: actions.sync.showBanner,
  hideBanner: actions.sync.hideBanner,
  resendEmailVerification: actions.async.resendEmailVerification,
  fetchInfo: actions.async.fetchInfo,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;
  return Object.assign({}, _.pick(ownProps, ['children', 'history']), stateProps, {
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
    onAcceptTerms: dispatchProps.acceptTerms.bind(null, api),
    onCloseNotification: dispatchProps.onCloseNotification,
    onDismissDonateBanner: dispatchProps.onDismissDonateBanner.bind(null, api),
    onDismissDexcomConnectBanner: dispatchProps.onDismissDexcomConnectBanner.bind(null, api),
    onDismissShareDataBanner: dispatchProps.onDismissShareDataBanner.bind(null, api),
    onDismissUpdateTypeBanner: dispatchProps.onDismissUpdateTypeBanner.bind(null, api),
    onDismissUploaderBanner: dispatchProps.onDismissUploaderBanner.bind(null, api),
    onClickDexcomConnectBanner: dispatchProps.onClickDexcomConnectBanner.bind(null, api),
    onClickShareDataBanner: dispatchProps.onClickShareDataBanner.bind(null, api),
    onClickUpdateTypeBanner: dispatchProps.onClickUpdateTypeBanner.bind(null, api),
    onClickUploaderBanner: dispatchProps.onClickUploaderBanner.bind(null, api),
    updateShareDataBannerSeen: dispatchProps.updateShareDataBannerSeen.bind(null, api),
    onUpdateDataDonationAccounts: dispatchProps.updateDataDonationAccounts.bind(null, api),
    showBanner: dispatchProps.showBanner,
    hideBanner: dispatchProps.hideBanner,
    onResendEmailVerification: dispatchProps.resendEmailVerification.bind(null, api),
    onLogout: dispatchProps.logout.bind(null, api),
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AppComponent);
