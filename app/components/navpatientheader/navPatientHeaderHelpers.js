import personUtils from '../../core/personutils';
import _ from 'lodash';

export const getPermissions = (patient, permsOfLoggedInUser) => {
  const permissions = patient.permissions;

  const canUpload = _.isEmpty(permissions) === false && permissions.root || _.has(permsOfLoggedInUser, 'upload');
  const canShare = _.isEmpty(permissions) === false && permissions.root;

  return { canUpload, canShare };
}

export const getPatientListLink = (clinicFlowActive, selectedClinicId, user, query, currentPage) => {
  let patientListLink = clinicFlowActive && selectedClinicId ? '/clinic-workspace/patients' : '/patients';
  if (query?.dashboard) patientListLink = `/dashboard/${query.dashboard}`;

  const isDashboardView = /^\/dashboard\//.test(currentPage);

  const showPatientListLink = personUtils.isClinicianAccount(user) && (
    /^\/patients\/.*\/(profile|data)/.test(currentPage) ||
    isDashboardView
  );

  return { showPatientListLink, patientListLink, isDashboardView }
}