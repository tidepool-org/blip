import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import _ from 'lodash';
import personUtils from './personutils';
import { useLocation } from 'react-router-dom';
import launchCustomProtocol from 'custom-protocol-detection';
import * as actions from '../redux/actions';

/**
 * Returns the final slug of the specified url path
 *
 * @param {String} pathname the current url path from the window.location object
 */
export const getFinalSlug = (pathname) => {
  return pathname.slice(pathname.lastIndexOf('/'), pathname.length);
};

/**
 * Get permissions for uploading and sharing as booleans based on permsOfLoggedInUser
 *
 * @param {Object} patient
 * @param {Object} permsOfLoggedInUser
 */
export const getPermissions = (patient, permsOfLoggedInUser) => {
  const permissions = patient?.permissions || {};

  const canUpload = _.isEmpty(permissions) === false && permissions.root || _.has(permsOfLoggedInUser, 'upload');
  const canShare = _.isEmpty(permissions) === false && permissions.root;

  return { canUpload, canShare };
};

/**
 * Returns the link path back to get back to the patient list based on the user's current workflow
 *
 * @param {boolean} clinicFlowActive
 * @param {String} selectedClinicId
 * @param {Object} query 'query' object of the window 'location' object
 * @param {String} patientId
 */
export const getPatientListLink = (clinicFlowActive, selectedClinicId, query, patientId) => {
  const dashboard = query?.dashboard;

  if (dashboard && patientId) {
    return `/dashboard/${dashboard}?drawerPatientId=${patientId}`;
  }

  if (dashboard) {
    return `/dashboard/${dashboard}`;
  }

  if (clinicFlowActive && selectedClinicId) {
    return '/clinic-workspace/patients';
  }

  return '/patients';
};
/**
 * Returns the name, birthday, and mrn based on combining the relevant data from patient and clinicPatient
 *
 * @param {Object} patient
 * @param {Object} clinicPatient
 */
export const getDemographicInfo = (patient, clinicPatient) => {
  const combinedPatient = personUtils.combinedAccountAndClinicPatient(patient, clinicPatient);

  const name = personUtils.patientFullName(combinedPatient);
  const birthday = combinedPatient?.profile?.patient?.birthday;
  const mrn = clinicPatient?.mrn;

  return { name, birthday, mrn };
};

// For ease of testing
export const uploadUtils = { launchCustomProtocol };

/**
 * Returns event handlers for use in any navbar
 *
 * @param {Object} api
 * @param {Function} trackMetric
 */
export const useNavigation = (api, trackMetric) => {
  const { query } = useLocation();
  const dispatch = useDispatch();
  const [initialQuery] = useState(query || {}); // keep a copy of the original value

  const clinicFlowActive = useSelector(state => state.blip.clinicFlowActive);
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);

  const handleBack = () => {
    const patientListLink = getPatientListLink(clinicFlowActive, selectedClinicId, initialQuery, currentPatientInViewId);
    trackMetric('Clinic - View patient list', { clinicId: selectedClinicId, source: 'Patient data' });
    dispatch(push(patientListLink));
  };

  const handleLaunchUploader = () => {
    trackMetric('Clicked Navbar Upload Data');
    uploadUtils.launchCustomProtocol('tidepoolupload://open');
  };

  const handleViewData = () => {
    trackMetric('Clicked Navbar View Data');
    dispatch(push(`/patients/${currentPatientInViewId}/data`));
  };

  const handleViewProfile = () => {
    trackMetric('Clicked Navbar Name');
    dispatch(push(`/patients/${currentPatientInViewId}/profile`));
  };

  const handleViewSettingsChart = () => {
    trackMetric('Clicked Navbar View Devices');
    dispatch(push(`/patients/${currentPatientInViewId}/data/settings`));
  };

  const handleShare = () => {
    trackMetric('Clicked Navbar Share Data');
    dispatch(push(`/patients/${currentPatientInViewId}/share`));
  };

  const handleSelectWorkspace = (clinicId) => {
    const isPrivateWorkspace = !clinicId;

    if (isPrivateWorkspace) {
      trackMetric('Clinic - Menu - Go to private workspace');
    } else {
      trackMetric('Clinic - Menu - Go to clinic workspace', { clinicId });
    }

    dispatch(actions.sync.setPatientListSearchTextInput(''));
    dispatch(actions.sync.setIsPatientListVisible(false));
    dispatch(actions.async.selectClinic(api, clinicId));
    dispatch(push(isPrivateWorkspace ? '/patients' : '/clinic-workspace', { selectedClinicId: clinicId }));
  };

  const handleViewManageWorkspaces = () => {
    trackMetric('Clinic - Menu - Manage workspaces');
    dispatch(push('/workspaces'));
  };

  const handleViewAccountSettings = () => {
    dispatch(push('/profile'));
  };

  const handleLogout = () => {
    dispatch(actions.async.logout(api));
  };

  return {
    handleBack,
    handleLaunchUploader,
    handleSelectWorkspace,
    handleViewManageWorkspaces,
    handleViewAccountSettings,
    handleLogout,

    handleViewSettingsChart: currentPatientInViewId ? handleViewSettingsChart : _.noop,
    handleViewData: currentPatientInViewId ? handleViewData : _.noop,
    handleViewProfile: currentPatientInViewId ? handleViewProfile : _.noop,
    handleShare: currentPatientInViewId ? handleShare : _.noop,
  };
};
