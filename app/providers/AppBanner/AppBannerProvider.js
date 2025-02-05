import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { filter, find, has, includes, intersection, keys, map, noop, some, upperFirst } from 'lodash';

import { appBanners } from './appBanners';
import { providers } from '../../components/datasources/DataConnections';
import { selectPatientSharedAccounts } from '../../core/selectors';

export const CLICKED_BANNER_ACTION = 'clicked';
export const DISMISSED_BANNER_ACTION = 'dismissed';

// Create a context
const AppBannerContext = createContext();

// Create a provider component
const AppBannerProvider = ({ children }) => {
  // State to hold the currently displayed banner
  const dispatch = useDispatch();
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

  const patientDevices = useSelector(state => state.blip.data.metaData.devices);
  const userHasPumpData = filter(patientDevices, { pump: true }).length > 0;
  const dataSources = useSelector(state => state.blip.dataSources);
  const { pathname } = useLocation();
  const [trackMetric, setTrackMetric] = useState(noop);
  const [formikContext, setFormikContext] = useState({});

  const erroredDataSource = find(
    userIsCurrentPatient ? dataSources : clinic?.patients?.[currentPatientInViewId]?.dataSources,
    { state: 'error' },
  );

  const justConnectedDataSource = find(
    userIsCurrentPatient ? dataSources : clinic?.patients?.[currentPatientInViewId]?.dataSources,
    ({state, lastImportTime}) => state === 'connected' && !lastImportTime,
  );

  const [currentBanner, setCurrentBanner] = useState(null);
  const [bannerShownMetricsForPatient, setBannerShownMetricsForPatient] = useState({});
  const [bannerInteractedForPatient, setBannerInteractedForPatient] = useState({});

  const bannerInteractionKeys = banner => map([CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION], action => `${action}${upperFirst(banner.id)}BannerTime`);

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
      show: userIsCurrentPatient && !sharedAccounts.length,
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
    userIsCurrentPatient,
    userHasPumpData,
  ]);

  useEffect(() => {
    setCurrentBanner(null);
    const context = userIsCurrentPatient ? 'patient' : 'clinic';

    const filteredBanners = filter(appBanners, banner => {
      const previousPatientInteractions = intersection(keys(loggedInUser?.preferences), bannerInteractionKeys(banner));
      const sessionInteraction = bannerInteractedForPatient[banner.id]?.[currentPatientInViewId];
      const matchesContext = includes(banner.context, context);
      const matchesPath = some(banner.paths, path => path.test(pathname));
      return !sessionInteraction && !previousPatientInteractions.length && matchesContext && matchesPath;
    });

    // Sort banners based on priority (lower values mean higher priority)
    const sortedBanners = filteredBanners.sort((a, b) => a.priority - b.priority);

    // Find and display the first available banner
    for (const banner of sortedBanners) {
      const processedBanner = processedBanners[banner.id];

      if (processedBanner?.show) {
        setCurrentBanner({ ...banner, ...banner.getProps(...processedBanner.bannerArgs) });
        break;
      }
    }
  }, [
    bannerInteractedForPatient,
    currentPatientInViewId,
    loggedInUser?.preferences,
    pathname,
    processedBanners,
    selectedClinicId,
    userIsCurrentPatient,
  ]);

  const bannerContext = {
    banner: currentBanner,
    bannerInteractedForPatient,
    bannerShownMetricsForPatient,
    setBannerInteractedForPatient,
    setBannerShownMetricsForPatient,
    setFormikContext,
    setTrackMetric,
    trackMetric,
  };

  return (
    <AppBannerContext.Provider value={bannerContext}>
      {children}
    </AppBannerContext.Provider>
  );
};

export { AppBannerContext, AppBannerProvider };
