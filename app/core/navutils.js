import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import _ from 'lodash';
import personUtils from './personutils';
import { useLocation } from 'react-router-dom';
import launchCustomProtocol from 'custom-protocol-detection';
import * as actions from '../redux/actions';

import {
  selectPatient,
  selectClinicFlowActive,
  selectSelectedClinicId,
  selectPermsOfLoggedInUser,
  selectClinicPatient,
  selectUser,
} from './selectors';

export const getPermissions = (patient, permsOfLoggedInUser) => {
  const permissions = patient?.permissions || {};

  const canUpload = _.isEmpty(permissions) === false && permissions.root || _.has(permsOfLoggedInUser, 'upload');
  const canShare = _.isEmpty(permissions) === false && permissions.root;

  return { canUpload, canShare };
};

export const getPatientListLink = (clinicFlowActive, selectedClinicId, query, patientId) => {
  let patientListLink = clinicFlowActive && selectedClinicId ? '/clinic-workspace/patients' : '/patients';
  
  if (query?.dashboard) {
    patientListLink = `/dashboard/${query.dashboard}`;

    if (patientId) {
      patientListLink += `?drawerPatientId=${patientId}`;
    }
  };

  return { patientListLink };
};

export const getDemographicInfo = (patient, clinicPatient) => {
  const combinedPatient = personUtils.combinedAccountAndClinicPatient(patient, clinicPatient);

  const patientName = personUtils.patientFullName(combinedPatient);
  const patientBirthday = combinedPatient?.profile?.patient?.birthday;
  const patientMrn = clinicPatient?.mrn;

  return { patientName, patientBirthday, patientMrn };
};

export const useNavbar = (api, trackMetric) => {
  const { query } = useLocation();
  const dispatch = useDispatch();

  const clinicFlowActive = useSelector(selectClinicFlowActive);
  const clinicPatient = useSelector(selectClinicPatient);
  const patient = useSelector(selectPatient);
  const permsOfLoggedInUser = useSelector(selectPermsOfLoggedInUser);
  const selectedClinicId = useSelector(selectSelectedClinicId);
  const user = useSelector(selectUser);

  const { patientListLink } = getPatientListLink(clinicFlowActive, selectedClinicId, query, patient?.userid);
  const { canUpload, canShare } = getPermissions(patient, permsOfLoggedInUser);
  const { patientMrn, patientBirthday, patientName } = getDemographicInfo(patient, clinicPatient);

  const handleBack = () => {
    trackMetric('Clinic - View patient list', { clinicId: selectedClinicId, source: 'Patient data' });
    dispatch(push(patientListLink));
  };

  const handleLaunchUploader = () => {
    trackMetric('Clicked Navbar Upload Data');
    launchCustomProtocol('tidepoolupload://open');
  };

  const handleViewData = () => {    
    trackMetric('Clicked Navbar View Data');
    dispatch(push(`/patients/${patient?.userid}/data`));
  };

  const handleViewProfile = () => {    
    trackMetric('Clicked Navbar Name');
    dispatch(push(`/patients/${patient?.userid}/profile`));
  };

  const handleViewSettingsChart = () => {
    dispatch(push(`/patients/${patient?.userid}/data?chart=settings`));
  };

  const handleShare = () => {    
    trackMetric('Clicked Navbar Share Data');
    dispatch(push(`/patients/${patient?.userid}/share`));
  };

  const handleSelectWorkspace = (clinicId) => {
    dispatch(actions.sync.setPatientListSearchTextInput(''));
    dispatch(actions.sync.setIsPatientListVisible(false));
    dispatch(actions.async.selectClinic(api, clinicId));
    dispatch(push(clinicId ? '/clinic-workspace' : '/patients', { selectedClinicId: clinicId }));
  };

  const handleViewAccountSettings = () => dispatch(push('/profile'));

  const handleLogout = () => dispatch(actions.async.logout(api));

  return {
    patientBirthday,
    patientMrn,
    patientName,
    patient,
    user,

    canUpload,
    canShare,

    handleBack,
    handleViewSettingsChart,
    handleLaunchUploader,
    handleSelectWorkspace,
    handleViewAccountSettings,
    handleLogout,

    handleViewData: patient ? handleViewData : _.noop,
    handleViewProfile: patient ? handleViewProfile : _.noop,
    handleShare: patient ? handleShare : _.noop,
  };
};