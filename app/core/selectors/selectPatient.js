export const selectPatient = (state) => {
  let patient = null;
  let permissions = null;

  if (state.blip.allUsersMap) {

    if (state.blip.currentPatientInViewId) {
      patient = _.get(
        state.blip.allUsersMap,
        state.blip.currentPatientInViewId,
        null
      );

      permissions = _.get(
        state.blip.permissionsOfMembersInTargetCareTeam,
        state.blip.currentPatientInViewId,
        {}
      );
    }
  }

  return {
    patient: patient ? { permissions, ...patient } : null
  };
}