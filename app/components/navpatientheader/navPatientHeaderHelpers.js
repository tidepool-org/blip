import personUtils from '../../core/personutils';
import _ from 'lodash';

export const getPermissions = (patient, permsOfLoggedInUser) => {
  const permissions = patient.permissions;

  const canUpload = _.isEmpty(permissions) === false && permissions.root || _.has(permsOfLoggedInUser, 'upload');
  const canShare = _.isEmpty(permissions) === false && permissions.root;

  return { canUpload, canShare };
};

export const getPatientListLink = (clinicFlowActive, selectedClinicId, initialSearchParams, patientId) => {
  let patientListLink = clinicFlowActive && selectedClinicId ? '/clinic-workspace/patients' : '/patients';

  const originDashboard = initialSearchParams.get('dashboard');
  
  if (originDashboard) {
    patientListLink = `/dashboard/${originDashboard}?drawerPatientId=${patientId}`;
  };

  return { patientListLink };
};