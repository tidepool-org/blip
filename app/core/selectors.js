import _ from 'lodash';

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

  return patient ? { permissions, ...patient } : null;
};

export const selectClinicPatient = (state) => {
  let clinicPatient;

  if (state.blip.allUsersMap) {
    if (state.blip.currentPatientInViewId) {
      clinicPatient = _.get(state.blip.clinics, [state.blip.selectedClinicId, 'patients', state.blip.currentPatientInViewId]);
    }
  }

  return clinicPatient;
};

export const selectPermsOfLoggedInUser = (state) => {
  let permsOfLoggedInUser = null;

  if (state.blip.allUsersMap) {
    if (state.blip.currentPatientInViewId) {
      permsOfLoggedInUser = state.blip.selectedClinicId
        ? _.get(
          state.blip.clinics,
          [
            state.blip.selectedClinicId,
            'patients',
            state.blip.currentPatientInViewId,
            'permissions',
          ],
          {}
        ) : _.get(
          state.blip.membershipPermissionsInOtherCareTeams,
          state.blip.currentPatientInViewId,
          {}
        );
    }
  }

  return permsOfLoggedInUser;
};
