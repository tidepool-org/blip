import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { filter, find, includes, intersection, keys, map, some, upperFirst } from 'lodash';

import { appBanners } from './appBanners';
import { providers } from '../../components/datasources/DataConnections';

export const CLICKED_BANNER_ACTION = 'clicked';
export const DISMISSED_BANNER_ACTION = 'dismissed';

// Create a context
const AppBannerContext = createContext();

// Create a provider component
const AppBannerProvider = ({ children }) => {
  // State to hold the currently displayed banner
  const dispatch = useDispatch();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics[selectedClinicId]);
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const user = useSelector(state => state.blip.allUsersMap[loggedInUserId]);
  const dataSources = useSelector(state => state.blip.dataSources);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const userIsCurrentPatient = loggedInUserId === currentPatientInViewId;
  const patientDevices = useSelector(state => state.blip.data.metaData.devices);
  const userHasPumpData = filter(patientDevices, { pump: true }).length > 0;
  const { pathname } = useLocation();

  const erroredDataSource = find(
    userIsCurrentPatient ? dataSources : clinic?.patients[currentPatientInViewId]?.dataSources,
    { state: 'error' },
  );

  const justConnectedDataSource = find(
    userIsCurrentPatient ? dataSources : clinic?.patients[currentPatientInViewId]?.dataSources,
    ({state, lastImportTime}) => state === 'connected' && !lastImportTime,
  );

  const [currentBanner, setCurrentBanner] = useState(null);
  const [bannerShownMetricsForPatient, setBannerShownMetricsForPatient] = useState({});

  const bannerInteractionKeys = banner => map([CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION], action => `${action}${upperFirst(banner.id)}BannerTime`);

  const processBanner = useCallback(() => ({
    dataSourceReconnect: {
      show: !!erroredDataSource?.providerName,
      bannerArgs: [dispatch, providers[erroredDataSource?.providerName]]
    },

    dataSourceJustConnected: {
      show: !!justConnectedDataSource?.providerName,
      bannerArgs: [providers[justConnectedDataSource?.providerName]]
    },

    uploader: {
      show: userIsCurrentPatient && dataSources.length && !userHasPumpData,
      bannerArgs: [],
    },
  }), [
    dataSources.length,
    dispatch,
    erroredDataSource?.providerName,
    justConnectedDataSource?.providerName,
    userIsCurrentPatient,
    userHasPumpData,
  ]);

  useEffect(() => {
    setCurrentBanner(null)
    const context = userIsCurrentPatient ? 'patient' : 'clinic';

    const filteredBanners = filter(appBanners, banner => {
      const previousInteractions = intersection(keys(user?.preferences), bannerInteractionKeys(banner));
      const matchesContext = includes(banner.context, context);
      const matchesPath = some(banner.paths, path => path.test(pathname));
      return !previousInteractions.length && matchesContext && matchesPath;
    });

    // Sort banners based on priority (lower values mean higher priority)
    const sortedBanners = filteredBanners.sort((a, b) => a.priority - b.priority);

    // Find and display the first available banner
    for (const banner of sortedBanners) {
      const processedBanner = processBanner()[banner.id];
      if (processedBanner?.show) {
        setCurrentBanner({ ...banner, ...banner.getProps(...processedBanner.bannerArgs) });
        break;
      }
    }
  }, [pathname, selectedClinicId, userIsCurrentPatient, processBanner, user?.preferences]);

  const bannerContext = {
    banner: currentBanner,
    bannerShownMetricsForPatient,
    setBannerShownMetricsForPatient,
  };

  return (
    <AppBannerContext.Provider value={bannerContext}>
      {children}
    </AppBannerContext.Provider>
  );
};

export { AppBannerContext, AppBannerProvider };
