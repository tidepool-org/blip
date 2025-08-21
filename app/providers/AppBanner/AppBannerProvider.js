import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import utils from '../../core/utils';
import moment from 'moment';

import {
  each,
  filter,
  find,
  first,
  has,
  includes,
  intersection,
  isFinite,
  keys,
  map,
  max,
  some,
  compact,
  mapValues,
  values,
} from 'lodash';

import { appBanners } from './appBanners';
import { providers } from '../../components/datasources/DataConnections';
import { selectPatientSharedAccounts } from '../../core/selectors';
import { DATA_DONATION_NONPROFITS } from '../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';
const { GLYCEMIC_RANGE } = vizUtils.constants;

export const CLICKED_BANNER_ACTION = 'clicked';
export const DISMISSED_BANNER_ACTION = 'dismissed';
export const SEEN_BANNER_ACTION = 'seen';

// Create a context
const AppBannerContext = createContext();

// Create a provider component
const AppBannerProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [formikContext, setFormikContext] = useState({});
  const isMobile = useMemo(() => utils.isMobile(), []);

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinics = useSelector(state => state.blip.clinics);
  const clinic = clinics?.[selectedClinicId];

  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const loggedInUser = useSelector(state => state.blip.allUsersMap[loggedInUserId]);

  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const sharedAccounts = useSelector(state => selectPatientSharedAccounts(state));
  const clinicPatient = clinic?.patients?.[currentPatientInViewId];
  const userIsCurrentPatient = loggedInUserId === currentPatientInViewId;
  const isCustodialPatient = has(clinicPatient?.permissions, 'custodian');
  const userHasDiabetesType = !!loggedInUser?.profile?.patient?.diagnosisType;

  const hasAltGlycemicRangeUpdate = (() => {
    const clinicRanges = mapValues(clinics, clinic => clinic.patients?.[currentPatientInViewId]?.glycemicRanges);

    let hasRangeUpdate = false;
    Object.keys(clinicRanges).forEach(clinicId => {
      const currentValue = clinicRanges[clinicId];

      const lastDismissedValue = loggedInUser?.preferences
                                             ?.alternateGlycemicRangeNotification
                                             ?.[clinicId]
                                             ?.glycemicRanges;

      if (!lastDismissedValue || lastDismissedValue !== currentValue) {
        hasRangeUpdate = true;
      }
    });

    return hasRangeUpdate;
  })();

  // TODO: attempt to replace this using a latestValueOnDismissal var in the top level of preferences object

  const latestAltGlycemicRangeUpdateTime = hasAltGlycemicRangeUpdate
    ? max(values(mapValues(loggedInUser?.preferences?.alternateGlycemicRangeNotification, 'dismissedAt')))
    : null;

  const patientMetaData = useSelector(state => state.blip.data.metaData);
  const patientDevices = patientMetaData?.devices;
  const userHasData = userIsCurrentPatient && patientMetaData?.size > 0;
  const userHasPumpData = filter(patientDevices, { pump: true }).length > 0;
  const patientDataFetched = isFinite(patientMetaData?.size);
  const dataSources = useSelector(state => state.blip.dataSources);
  const justConnectedDataSourceProviderName = useSelector(state => state.blip.justConnectedDataSourceProviderName);
  const justConnectedDataSourceProvider = providers[justConnectedDataSourceProviderName];
  const isInitialProcessing = !patientDataFetched || (userHasData && !patientDevices);

  const erroredDataSource = find(
    userIsCurrentPatient ? dataSources : clinic?.patients?.[currentPatientInViewId]?.dataSources,
    { state: 'error' },
  );

  const justConnectedDataSource = find(
    userIsCurrentPatient ? dataSources : clinic?.patients?.[currentPatientInViewId]?.dataSources,
    ({providerName}) => !!justConnectedDataSourceProviderName && providerName === justConnectedDataSourceProviderName,
  );

  const [currentBanner, setCurrentBanner] = useState(null);
  const [bannerShownForPatient, setBannerShownForPatient] = useState({});
  const [bannerInteractedForPatient, setBannerInteractedForPatient] = useState({});

  const userIsDonor = useSelector(state => state.blip.dataDonationAccounts?.length > 0);

  // Check to see if a data-donating patient has selected a nonprofit to support
  const userIsSupportingNonprofit = useSelector(state => {
    const allDonationAccountEmails = map(DATA_DONATION_NONPROFITS(), nonprofit => `bigdata+${nonprofit.value}@tidepool.org`); // eslint-disable-line new-cap
    const userDonationAccountEmails = map(state.blip.dataDonationAccounts, 'email');
    return intersection(allDonationAccountEmails, userDonationAccountEmails).length > 0;
  });

  // Because the original donate banner has been split into two separate banners, we need to check if the user has interacted with the original donate banner
  // and not show the new support proceeds banner unless they just interacted with the donate banner during this session
  const previouslyInteractedWithDonateBanner = loggedInUser?.preferences?.clickedDonateBannerTime || loggedInUser?.preferences?.dismissedDonateBannerTime;
  const thisSessionInteractedWithDonateBanner = bannerInteractedForPatient?.donate?.[currentPatientInViewId];
  const canShowShareProceedsBanner = !previouslyInteractedWithDonateBanner || thisSessionInteractedWithDonateBanner;

  const processedBanners = useMemo(() => ({
    dataSourceJustConnected: {
      show: !!justConnectedDataSource,
      bannerArgs: [justConnectedDataSourceProvider, justConnectedDataSource],
    },

    dataSourceReconnect: {
      show: !!erroredDataSource?.providerName,
      bannerArgs: [dispatch, providers[erroredDataSource?.providerName], erroredDataSource],
    },

    uploader: { // Temporary: hide on mobile until we have a mobile-friendly profile page
      show: !isMobile && userIsCurrentPatient && dataSources?.length && !isInitialProcessing && !userHasPumpData,
      bannerArgs: [],
    },

    shareData: {
      show: userIsCurrentPatient && userHasData && !sharedAccounts.length,
      bannerArgs: [dispatch, loggedInUserId],
    },

    donateYourData: { // Temporary: hide on mobile until we have a mobile-friendly profile page
      show: !isMobile && userIsCurrentPatient && userHasData && !userIsDonor,
      bannerArgs: [dispatch],
    },

    shareProceeds: {
      show: canShowShareProceedsBanner && userIsCurrentPatient && userHasData && userIsDonor && !userIsSupportingNonprofit,
      bannerArgs: [dispatch, loggedInUserId],
    },

    updateType: { // Temporary: hide on mobile until we have a mobile-friendly profile page
      show: !isMobile && userIsCurrentPatient && userHasData && !userHasDiabetesType,
      bannerArgs: [dispatch, loggedInUserId],
    },

    patientLimit: {
      show: clinic?.patientLimitEnforced && !!clinic?.ui?.warnings?.limitReached,
      bannerArgs: [clinic],
    },

    dataSourceReconnectInvite: {
      show: !!erroredDataSource?.providerName,
      bannerArgs: [dispatch, selectedClinicId, clinicPatient, providers[erroredDataSource?.providerName]],
    },

    addEmail: {
      show: isCustodialPatient && !!clinicPatient && !clinicPatient?.email,
      bannerArgs: [formikContext, clinicPatient],
    },

    sendVerification: {
      show: !bannerInteractedForPatient?.addEmail?.[currentPatientInViewId] && isCustodialPatient && !!clinicPatient?.email,
      bannerArgs: [dispatch, clinicPatient],
    },

    clinicUsingAltRange: {
      show: userIsCurrentPatient && hasAltGlycemicRangeUpdate,
      bannerArgs: [dispatch, loggedInUserId, latestAltGlycemicRangeUpdateTime],
    },
  }), [
    bannerInteractedForPatient?.addEmail,
    canShowShareProceedsBanner,
    clinic,
    clinicPatient,
    currentPatientInViewId,
    dataSources?.length,
    dispatch,
    erroredDataSource,
    formikContext,
    isCustodialPatient,
    isInitialProcessing,
    justConnectedDataSource,
    justConnectedDataSourceProvider,
    loggedInUserId,
    selectedClinicId,
    sharedAccounts,
    userHasData,
    userHasDiabetesType,
    userHasPumpData,
    userIsCurrentPatient,
    userIsDonor,
    userIsSupportingNonprofit,
    isMobile,
  ]);

  useEffect(() => {
    setCurrentBanner(null);
    const context = userIsCurrentPatient ? 'patient' : 'clinic';
    const bannerInteractionKeys = banner => map([CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION], action => `${action}${banner.interactionId}BannerTime`);

    const filteredBanners = [];

    each(appBanners, banner => {
      // Filter out if data conditions are not met for showing the banner
      if (!processedBanners[banner.id]?.show) return;

      // Filter out if banner path or context conditions are not met
      if (!some(banner.paths, path => path.test(pathname)) || !includes(banner.context, context)) return;

      // Process the banner props. Important to do this before filtering by previous banner interactions
      // since we need the sometimes-dynamic banner.interactionId to generate the keys
      const processedBanner = {
        ...banner,
        ...banner.getProps(...processedBanners[banner.id]?.bannerArgs),
      };

      // Filter further by previous banner interactions
      let latestBannerInteractionTime = max(map(
        intersection(keys(loggedInUser?.preferences), bannerInteractionKeys(processedBanner)),
        key => loggedInUser?.preferences[key]
      ));

      const bannerCountKey = `seen${processedBanner.interactionId}BannerCount`;
      const countExceeded = processedBanner.maxUniqueDaysShown && loggedInUser?.preferences?.[bannerCountKey] > processedBanner.maxUniqueDaysShown;
      const sessionInteraction = bannerInteractedForPatient[processedBanner.interactionId]?.[currentPatientInViewId];

      // Handle any banners with outdate previous interactions that may be candidates for display again
      if (processedBanner?.ignoreBannerInteractionsBeforeTime) {
        // Ignore the previous banner interactions if they are older than the ignoreBannerInteractionsBeforeTime
        const ignorePreviousBannerInteractions = moment(latestBannerInteractionTime).isBefore(processedBanner.ignoreBannerInteractionsBeforeTime);
        if (ignorePreviousBannerInteractions) latestBannerInteractionTime = null;
      }

      // Filter out based on previous view counts or interactions
      if (countExceeded || sessionInteraction || latestBannerInteractionTime) {
        return;
      }

      // No filters were applicable. Banner is a candidtate to be shown
      filteredBanners.push(processedBanner);
    });

    // Sort banners based on priority (lower values mean higher priority)
    const sortedBanners = filteredBanners.sort((a, b) => a.priority - b.priority);

    // Set the first available banner to display, else null
    setCurrentBanner(first(sortedBanners) || null);
  }, [
    bannerInteractedForPatient,
    currentPatientInViewId,
    erroredDataSource,
    justConnectedDataSource,
    loggedInUser?.preferences,
    pathname,
    processedBanners,
    selectedClinicId,
    userIsCurrentPatient,
  ]);

  const bannerContext = {
    banner: currentBanner,
    bannerInteractedForPatient,
    bannerShownForPatient,
    processedBanners,
    setBannerInteractedForPatient,
    setBannerShownForPatient,
    setFormikContext,
  };

  return (
    <AppBannerContext.Provider value={bannerContext}>
      {children}
    </AppBannerContext.Provider>
  );
};

export { AppBannerContext, AppBannerProvider };
