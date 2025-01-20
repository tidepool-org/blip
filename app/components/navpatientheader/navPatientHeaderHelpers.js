import personUtils from '../../core/personutils';
import _ from 'lodash';

export const getPermissions = (patient, permsOfLoggedInUser) => {
  const permissions = patient.permissions;

  const canUpload = _.isEmpty(permissions) === false && permissions.root || _.has(permsOfLoggedInUser, 'upload');
  const canShare = _.isEmpty(permissions) === false && permissions.root;

  return { canUpload, canShare };
};

export const getPatientListLink = (clinicFlowActive, selectedClinicId, initialSearchParams, patientId) => {
  const dashboard = initialSearchParams.get('dashboard');

  if (dashboard) {
    return `/dashboard/${dashboard}?drawerPatientId=${patientId}`;
  };
  
  if (clinicFlowActive && selectedClinicId) {
    return '/clinic-workspace/patients';
  }

  return '/patients';
};

export const getDemographicInfo = (patient, clinicPatient) => {
  const combinedPatient = personUtils.combinedAccountAndClinicPatient(patient, clinicPatient);

  const name = personUtils.patientFullName(combinedPatient);
  const birthday = combinedPatient?.profile?.patient?.birthday;
  const mrn = clinicPatient?.mrn;

  return { name, birthday, mrn };
};
