import personUtils from '../../core/personutils';
import _ from 'lodash';

export const getPermissions = (patient, permsOfLoggedInUser) => {
  const permissions = patient.permissions;

  const canUpload = _.isEmpty(permissions) === false && permissions.root || _.has(permsOfLoggedInUser, 'upload');
  const canShare = _.isEmpty(permissions) === false && permissions.root;

  return { canUpload, canShare };
};

export const getPatientListLink = (clinicFlowActive, selectedClinicId, initialSearchParams, patientId) => {
  const originDashboard = initialSearchParams.get('dashboard');

  if (originDashboard) {
    return `/dashboard/${originDashboard}?drawerPatientId=${patientId}`;
  };
  
  if (clinicFlowActive && selectedClinicId) {
    return '/clinic-workspace/patients';
  }

  return '/patients';
};