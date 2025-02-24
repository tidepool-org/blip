import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import {
  each,
  filter,
  find,
  first,
  has,
  includes,
  intersection,
  isEmpty,
  keys,
  map,
  max,
  some
} from 'lodash';

import { appBanners } from './appBanners';
import { providers } from '../../components/datasources/DataConnections';
import { selectPatientSharedAccounts } from '../../core/selectors';
import { DATA_DONATION_NONPROFITS } from '../../core/constants';

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

  const patientMetaData = useSelector(state => state.blip.data.metaData);
  const patientDevices = patientMetaData?.devices;
  const userHasData = userIsCurrentPatient && patientMetaData?.size > 0;
  const userHasPumpData = filter(patientDevices, { pump: true }).length > 0;
  const dataSources = useSelector(state => state.blip.dataSources);

  const erroredDataSource = find(
    userIsCurrentPatient ? dataSources : clinic?.patients?.[currentPatientInViewId]?.dataSources,
    { state: 'error' },
  );

  const justConnectedDataSource = find(
    userIsCurrentPatient ? dataSources : clinic?.patients?.[currentPatientInViewId]?.dataSources,
    ({state, lastImportTime}) => state === 'connected' && !lastImportTime,
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
      show: !!justConnectedDataSource?.providerName,
      bannerArgs: [providers[justConnectedDataSource?.providerName]]
    },

    dataSourceReconnect: {
      show: !!erroredDataSource?.providerName,
      bannerArgs: [dispatch, providers[erroredDataSource?.providerName]]
    },

    uploader: {
      show: userIsCurrentPatient && dataSources?.length && !userHasPumpData,
      bannerArgs: [],
    },

    shareData: {
      show: userIsCurrentPatient && userHasData && !sharedAccounts.length,
      bannerArgs: [dispatch, loggedInUserId],
    },

    donateYourData: {
      show: userIsCurrentPatient && userHasData && !userIsDonor,
      bannerArgs: [dispatch],
    },

    shareProceeds: {
      show: canShowShareProceedsBanner && userIsCurrentPatient && userHasData && userIsDonor && !userIsSupportingNonprofit,
      bannerArgs: [dispatch, loggedInUserId],
    },

    updateType: {
      show: userIsCurrentPatient && userHasData && !userHasDiabetesType,
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
  }), [
    bannerInteractedForPatient?.addEmail,
    canShowShareProceedsBanner,
    clinic,
    clinicPatient,
    currentPatientInViewId,
    dataSources?.length,
    dispatch,
    erroredDataSource?.providerName,
    formikContext,
    isCustodialPatient,
    justConnectedDataSource?.providerName,
    loggedInUserId,
    selectedClinicId,
    sharedAccounts,
    userHasData,
    userHasDiabetesType,
    userHasPumpData,
    userIsCurrentPatient,
    userIsDonor,
    userIsSupportingNonprofit,
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
      const latestBannerInteractionTime = max(map(
        intersection(keys(loggedInUser?.preferences), bannerInteractionKeys(processedBanner)),
        key => loggedInUser?.preferences[key]
      ));

      const bannerCountKey = `seen${processedBanner.interactionId}BannerCount`;
      const countExceeded = processedBanner.maxUniqueDaysShown && loggedInUser?.preferences?.[bannerCountKey] > processedBanner.maxUniqueDaysShown;
      const sessionInteraction = bannerInteractedForPatient[processedBanner.id]?.[currentPatientInViewId];

      console.log('latestBannerInteractionTime', processedBanner.id, latestBannerInteractionTime);


      // Handle any banner-unique filtering conditions here
      if (processedBanner.id === 'dataSourceReconnect') {
        // const dexcomDataSourceModifiedTime = erroredDataSource?.modifiedTime || '';
        // const dataSourceBannerWasAcknowledged = !isEmpty(dexcomDataSourceModifiedTime)
        //   ? latestBannerInteractionTime > dexcomDataSourceModifiedTime
        //   : !isEmpty(latestBannerInteractionTime);
      }

      if (processedBanner.id === 'dataSourceJustConnected') {

        console.log('justConnectedDataSource', justConnectedDataSource);
      }


      // TODO: need to also figure out how to handle:
      // 1. connection error banners that were dismissed/handled, connection was resumed, and fell into error state again
      //   - I think we handled this with the dismissedBannerTime for the dexcom one, but need to confirm


       // Hide the Dexcom banner if the currently logged-in patient has already interacted with the
      // banner and there hasn't been a Dexcom data source update since
      // const dexcomDataSourceModifiedTime = dexcomDataSource?.modifiedTime || '';
      // const dismissedBannerTime = _.get(nextProps, 'user.preferences.dismissedDexcomConnectBannerTime', '');
      // const clickedBannerTime = _.get(nextProps, 'user.preferences.clickedDexcomConnectBannerTime', '');
      // const latestBannerInteractionTime = _.max([dismissedBannerTime, clickedBannerTime]);




      // 2. data just connected banners for patient disconnect, and then reconnect
      //   - do we need to clear the previous banner interation when reconnecting?  Or, again, consider the time.
      //   - how about the within the same session - do we show it?


      if (countExceeded || sessionInteraction ||latestBannerInteractionTime) return;


      // Banner is a candidtate to be shown
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
