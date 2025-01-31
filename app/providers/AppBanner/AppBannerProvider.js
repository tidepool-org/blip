import { filter, find, includes, some } from 'lodash';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { appBanners } from './appBanners';
import { providers } from '../../components/datasources/DataConnections';
import api from '../../core/api';

// Create a context
const AppBannerContext = createContext();

// Create a provider component
const AppBannerProvider = ({ children }) => {
  // State to hold the currently displayed banner
  const dispatch = useDispatch();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics[selectedClinicId]);
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
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

  // TODO: implement banner dismiss state, as well as initialize based on previous dismissals in user.preferences
  // this.state = {
  //   uploaderBanner: { priority: 1, metricTrackedForPatient: {} },
  //   shareDataBanner: { priority: 2, metricTrackedForPatient: {} },
  //   donateBanner: { priority: 3, metricTrackedForPatient: {} },
  //   updateTypeBanner: { priority: 5, metricTrackedForPatient: {} },
  // }

  const [currentBanner, setCurrentBanner] = useState(null);

  const processBanner = useCallback(() => ({
    dataSourceReconnectBanner: {
      show: true,
      // show: !!erroredDataSource?.providerName,
      bannerArgs: [dispatch, providers[erroredDataSource?.providerName]]
    },

    uploaderBanner: {
      show: userIsCurrentPatient && dataSources.length && !userHasPumpData,
      bannerArgs: [],
    },
  }), [
    dataSources.length,
    dispatch,
    erroredDataSource?.providerName,
    userIsCurrentPatient,
    userHasPumpData
  ]);

  useEffect(() => {
    const context = userIsCurrentPatient ? 'patient' : 'clinic';

    const filteredBanners = filter(appBanners, banner => {
      return includes(banner.context, context) && some(banner.paths, path => path.test(pathname));
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
  }, [pathname, selectedClinicId, userIsCurrentPatient, processBanner]);

  return (
    <AppBannerContext.Provider value={currentBanner}>
      {children}
    </AppBannerContext.Provider>
  );
};

export { AppBannerContext, AppBannerProvider };
