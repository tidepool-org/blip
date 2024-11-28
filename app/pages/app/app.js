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
import DonateBanner from '../../components/donatebanner';
import DexcomBanner from '../../components/dexcombanner';
import AddEmailBanner from '../../components/addemailbanner';
import SendVerificationBanner from '../../components/sendverificationbanner';
import LogoutOverlay from '../../components/logoutoverlay';
import ShareDataBanner from '../../components/sharedatabanner';
import TidepoolNotification from '../../components/notification';
import UpdateTypeBanner from '../../components/updatetypebanner';
import UploaderBanner from '../../components/uploaderbanner';
import Banner from '../../components/elements/Banner';

import FooterLinks from '../../components/footerlinks';
import Version from '../../components/version';

import { DATA_DONATION_NONPROFITS, URL_TIDEPOOL_PLUS_CONTACT_SALES } from '../../core/constants';
import NavPatientHeader from '../../components/navpatientheader';
import getPatientListLink from './getPatientListLink';

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
      uploaderBanner: { priority: 1, metricTrackedForPatient: {} },
      shareDataBanner: { priority: 2, metricTrackedForPatient: {} },
      donateBanner: { priority: 3, metricTrackedForPatient: {} },
      dexcomConnectBanner: { priority: 4, metricTrackedForPatient: {} },
      updateTypeBanner: { priority: 5, metricTrackedForPatient: {} },
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
      clinics,
      selectedClinicId,
      showingDonateBanner,
      showingDexcomConnectBanner,
      showingPatientLimitBanner,
      showingShareDataBanner,
      updateShareDataBannerSeen,
      seenShareDataBannerMax,
      showingUpdateTypeBanner,
      showingUploaderBanner,
      location,
      userHasData,
      userHasPumpData,
      userHasConnectedDataSources,
      userDexcomDataSource,
      patientDexcomDataSource,
      userHasSharedDataWithClinician,
      userHasDiabetesType,
      userIsCurrentPatient,
      userIsSupportingNonprofit,
      authenticated,
      currentPatientInViewId,
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

    const isBannerRoute = /^\/patients\/\S+\/data/.test(location);

    if (showingUploaderBanner !== false) {
      const showUploaderBanner = isBannerRoute && userIsCurrentPatient && !!userDexcomDataSource && !userHasPumpData;
      if (showUploaderBanner) {
        this.props.showBanner('uploader');
      } else if (showingUploaderBanner) {
        this.props.hideBanner('uploader');
      }
    }

    if (showingShareDataBanner !== false) {
      const showShareDataBanner = isBannerRoute && userIsCurrentPatient && userHasData && !userHasSharedDataWithClinician && !seenShareDataBannerMax;

      if (showShareDataBanner) {
        this.props.showBanner('sharedata');
        updateShareDataBannerSeen(currentPatientInViewId);
      } else if (showingShareDataBanner) {
        this.props.hideBanner('sharedata');
      }
    }

    if (showingDonateBanner !== false) {
      const showDonateBanner = isBannerRoute && userIsCurrentPatient && userHasData && !userIsSupportingNonprofit;

      if (showDonateBanner) {
        this.props.showBanner('donate');
      } else if (showingDonateBanner) {
        this.props.hideBanner('donate');
      }
    }

    const dexcomDataSource = userDexcomDataSource || patientDexcomDataSource;

    if (showingDexcomConnectBanner !== false) {
      let showDexcomBanner;
      let dexcomBannerWasAcknowledged;

      if (userIsCurrentPatient) {
        // Hide the Dexcom banner if the currently logged-in patient has already interacted with the
        // banner and there hasn't been a Dexcom data source update since
        const dexcomDataSourceModifiedTime = dexcomDataSource?.modifiedTime || '';
        const dismissedBannerTime = _.get(nextProps, 'user.preferences.dismissedDexcomConnectBannerTime', '');
        const clickedBannerTime = _.get(nextProps, 'user.preferences.clickedDexcomConnectBannerTime', '');
        const latestBannerInteractionTime = _.max([dismissedBannerTime, clickedBannerTime]);

        dexcomBannerWasAcknowledged = !_.isEmpty(dexcomDataSourceModifiedTime)
         ? latestBannerInteractionTime > dexcomDataSourceModifiedTime
         : !_.isEmpty(latestBannerInteractionTime);
      }

      const isDexcomErrorState = dexcomDataSource?.state === 'error';
      const bannerStateUpdates = { display: true };

      // Give the Dexcom banner highest priority if the connection state is 'error'
      if (isDexcomErrorState) bannerStateUpdates.priority = 0;

      if (isBannerRoute && !dexcomBannerWasAcknowledged) {
        showDexcomBanner = isDexcomErrorState || (userIsCurrentPatient && !userHasConnectedDataSources);
      }

      if (showDexcomBanner) {
        this.props.showBanner('dexcom');
        this.setState({ dexcomConnectBanner: { ...this.state.dexcomConnectBanner, ...bannerStateUpdates } });
      } else if (showingDexcomConnectBanner) {
        this.props.hideBanner('dexcom');
      }
    }

    if (showingUpdateTypeBanner !== false) {
      const showUpdateTypeBanner = isBannerRoute && userIsCurrentPatient && !userHasDiabetesType;

      if (showUpdateTypeBanner) {
        this.props.showBanner('updatetype');
      } else if (showingUpdateTypeBanner) {
        this.props.hideBanner('updatetype');
      }
    }

    if (showingPatientLimitBanner !== false) {
      const isClinicWorkspaceRoute = /^\/clinic-workspace/.test(location);
      const clinic = clinics?.[selectedClinicId];
      const showPatientLimitBanner = isClinicWorkspaceRoute && clinic?.patientLimitEnforced && !!clinic?.ui?.warnings?.limitReached;

      if (showPatientLimitBanner) {
        this.props.showBanner('patientLimit');
      } else if (showingPatientLimitBanner) {
        this.props.hideBanner('patientLimit');
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
      user,
      permsOfLoggedInUser,
      context: { trackMetric },
      clinicFlowActive,
      selectedClinicId,
      location: currentPage,
      query,
    } = this.props;

    if (!this.isPatientVisibleInNavbar()) return null; // only show on pages with a patient of focus

    const { 
      showPatientListLink, 
      patientListLink,
    } = getPatientListLink(clinicFlowActive, selectedClinicId, currentPage, user, query);
    
    return (
      <NavPatientHeader 
        patient={patient} 
        user={user} 
        trackMetric={trackMetric} 
        permsOfLoggedInUser={permsOfLoggedInUser}
        backLink={showPatientListLink ? patientListLink : null}
      />
    );
  }

  renderBanner() {
    const banners = [
      'uploaderBanner',
      'shareDataBanner',
      'donateBanner',
      'dexcomConnectBanner',
      'updateTypeBanner',
    ];

    const prioritizedBanners = _.orderBy(
      _.filter(
        _.map(banners, name => {
          const capitalizedName = _.upperFirst(name);
          const renderMethodKey = `render${capitalizedName}`;
          const displayStateKey = `showing${capitalizedName}`;

          return {
            name,
            ...this.state[name],
            render: this[renderMethodKey].bind(this),
            display: this.props[displayStateKey],
          };
        }),
        { display: true }
      ),
      ['priority']
    );

    let prioritizedBanner;

    if (prioritizedBanners.length > 0) {
      prioritizedBanner = prioritizedBanners[0];
      const dexcomDataSource = this.props.userDexcomDataSource || this.props.patientDexcomDataSource;

      // Track metric for displaying the prioritized banner, but only once per patient ID per session
      if (
        this.props.context.trackMetric &&
        this.props.currentPatientInViewId &&
        !this.state[prioritizedBanner.name]?.metricTrackedForPatient[this.props.currentPatientInViewId]
      ) {
        const newBannerState = { ...this.state[prioritizedBanner.name] };
        newBannerState.metricTrackedForPatient[this.props.currentPatientInViewId] = true;
        this.setState({ [prioritizedBanner.name]: newBannerState });

        const bannerMetricsArgs = {
          uploaderBanner: ['Uploader banner displayed'],
          shareDataBanner: ['Share Data banner displayed'],
          donateBanner: ['Big Data banner displayed'],
          dexcomConnectBanner: ['Dexcom OAuth banner displayed', { clinicId: this.props.selectedClinicId, dexcomConnectState: dexcomDataSource?.state }],
          updateTypeBanner: ['Update Type banner displayed'],
        };

        this.props.context.trackMetric(...bannerMetricsArgs[prioritizedBanner.name]);
      }
    }

    return prioritizedBanner?.render() || null;
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

    if (this.props.showingDexcomConnectBanner) {
      return (
        <div className="App-dexcombanner">
          <DexcomBanner
            api={this.props.context.api}
            clinicPatient={this.props.clinicPatient}
            onClick={this.props.userIsCurrentPatient ? this.props.onClickDexcomConnectBanner : _.noop}
            onClose={this.props.userIsCurrentPatient ? this.props.onDismissDexcomConnectBanner : _.noop}
            trackMetric={this.props.context.trackMetric}
            patient={this.props.patient}
            dataSourceState={this.props.userDexcomDataSource?.state || this.props.patientDexcomDataSource?.state}
            userIsCurrentPatient={this.props.userIsCurrentPatient}
            isClinicPatient={this.props.clinicFlowActive && this.props.selectedClinicId && !this.props.userIsCurrentPatient}
            selectedClinicId={this.props.selectedClinicId}
          />
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

  renderPatientLimitBanner() {
    const {
      clinics,
      dismissBanner,
      selectedClinicId,
      showingPatientLimitBanner,
      t,
    } = this.props;

    if (showingPatientLimitBanner) {
        const clinic = clinics?.[selectedClinicId];
        this.props.context.trackMetric('Patient limit banner: displayed');

        return (
          <Banner
            id="patientLimitBanner"
            variant="warning"
            label={t('Patient limit banner')}
            actionText={t('Contact us to unlock plans')}
            onAction={() => {
              this.props.context.trackMetric('Patient limit banner: contact sales clicked');
              dismissBanner('patientLimit');
              window.open(URL_TIDEPOOL_PLUS_CONTACT_SALES, '_blank')
            }}
            onDismiss={() => {
              this.props.context.trackMetric('Patient limit banner: dismissed');
              dismissBanner('patientLimit');
            }}
            message={t('{{clinic.name}} has reached the maximum number of patient accounts.', { clinic })}
          />
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
    var banner = this.renderBanner();
    var emailbanner = this.renderAddEmailBanner();
    var patientLimitBanner = this.renderPatientLimitBanner();
    var footer = this.renderFooter();

    return (
      <div className="app">
        {overlay}
        {emailbanner}
        {patientLimitBanner}
        {navbar}
        {navHeader}
        {notification}
        {banner}
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
  let userHasData = false;
  let userHasPumpData = false;
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
      userHasPumpData = _.filter(_.get(state, 'blip.data.metaData.devices', []), { pump: true }).length > 0;

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
    showingDonateBanner: state.blip.showingDonateBanner,
    showingDexcomConnectBanner: state.blip.showingDexcomConnectBanner,
    showingPatientLimitBanner: state.blip.showingPatientLimitBanner,
    showingShareDataBanner: state.blip.showingShareDataBanner,
    seenShareDataBannerMax: state.blip.seenShareDataBannerMax,
    showingUpdateTypeBanner: state.blip.showingUpdateTypeBanner,
    showingUploaderBanner: state.blip.showingUploaderBanner,
    userIsCurrentPatient,
    userHasData,
    userHasPumpData,
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
  dismissBanner: actions.sync.dismissBanner,
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
    dismissBanner: dispatchProps.dismissBanner,
    onResendEmailVerification: dispatchProps.resendEmailVerification.bind(null, api),
    onLogout: dispatchProps.logout.bind(null, api),
  });
};

export default withLDConsumer()(connect(mapStateToProps, mapDispatchToProps, mergeProps)(withTranslation()(props => <AppComponent {...props}/>)));
