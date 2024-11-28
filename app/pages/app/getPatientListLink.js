import personUtils from '../../core/personutils';

export const getPatientListLink = (clinicFlowActive, selectedClinicId, currentPage, user, query) => {
  let patientListLink = clinicFlowActive && selectedClinicId ? '/clinic-workspace/patients' : '/patients';
  if (query?.dashboard) patientListLink = `/dashboard/${query.dashboard}`;

  const isDashboardView = /^\/dashboard\//.test(currentPage);

  const showPatientListLink = personUtils.isClinicianAccount(user) && (
    /^\/patients\/.*\/(profile|data)/.test(currentPage) ||
    isDashboardView
  );

  return { showPatientListLink, patientListLink }
}

export default getPatientListLink;