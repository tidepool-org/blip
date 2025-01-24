import React from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import personUtils from './personutils';
import { useHistory, useLocation } from 'react-router-dom';
import launchCustomProtocol from 'custom-protocol-detection';

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

  const name = personUtils.patientFullName(combinedPatient);
  const birthday = combinedPatient?.profile?.patient?.birthday;
  const mrn = clinicPatient?.mrn;

  return { name, birthday, mrn };
};

export const useNavbar = (trackMetric) => {
  const history = useHistory();
  const { query } = useLocation();

  const clinicFlowActive = useSelector(selectClinicFlowActive);
  const clinicPatient = useSelector(selectClinicPatient);
  const patient = useSelector(selectPatient);
  const permsOfLoggedInUser = useSelector(selectPermsOfLoggedInUser);
  const selectedClinicId = useSelector(selectSelectedClinicId);
  const user = useSelector(selectUser);

  const { patientListLink } = getPatientListLink(clinicFlowActive, selectedClinicId, query, patient?.userid);
  const { canUpload, canShare } = getPermissions(patient, permsOfLoggedInUser);
  const { mrn, birthday, name } = getDemographicInfo(patient, clinicPatient);

  const handleBack = () => {
    trackMetric('Clinic - View patient list', { clinicId: selectedClinicId, source: 'Patient data' });
    history.push(patientListLink);
  };

  const handleLaunchUploader = () => {
    trackMetric('Clicked Navbar Upload Data');
    launchCustomProtocol('tidepoolupload://open');
  };

  const handleViewData = () => {    
    trackMetric('Clicked Navbar View Data');
    history.push(`/patients/${patient?.userid}/data`);
  };

  const handleViewProfile = () => {    
    trackMetric('Clicked Navbar Name');
    history.push(`/patients/${patient?.userid}/profile`);
  };

  const handleShare = () => {    
    trackMetric('Clicked Navbar Share Data');
    history.push(`/patients/${patient?.userid}/share`);
  };

  return {
    birthday,
    mrn,
    name,
    patient,
    user,

    canUpload,
    canShare,

    handleBack,
    handleLaunchUploader,

    handleViewData: patient ? handleViewData : _.noop,
    handleViewProfile: patient ? handleViewProfile : _.noop,
    handleShare: patient ? handleShare : _.noop,
  };
};