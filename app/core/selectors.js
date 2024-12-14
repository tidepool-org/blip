export const selectClinicPatient = (state) => {
  let clinicPatient;

  if (state.blip.allUsersMap) {
    if (state.blip.currentPatientInViewId) {
      clinicPatient = _.get(state.blip.clinics, [state.blip.selectedClinicId, 'patients', state.blip.currentPatientInViewId]);
    }
  }

  return clinicPatient;
}