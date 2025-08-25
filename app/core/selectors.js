
import { filter, get, has, isEmpty, map, reject, values } from 'lodash';
import personUtils from './personutils';
import { createSelector } from 'reselect';

export const selectPatientSharedAccounts = createSelector([state => state.blip], state => {
  const {
    allUsersMap,
    clinics,
    loggedInUserId,
    membersOfTargetCareTeam,
    pendingSentInvites,
    permissionsOfMembersInTargetCareTeam,
  } = state;

  const pendingInvites = reject(pendingSentInvites, personUtils.isDataDonationAccount);
  const pendingMemberInvites = filter(pendingInvites, ({ email }) => !isEmpty(email));
  const patientClinics = filter(values(clinics), ({ patients }) => has(patients, loggedInUserId));
  const clinicInvites = filter(pendingInvites, ({ clinicId }) => !isEmpty(clinicId));

  const accounts = [
    ...(map(patientClinics, clinic => ({
      id: clinic.id,
      name: clinic.name,
      nameOrderable: clinic.name.toLowerCase(),
      permissions: get(clinic, ['patients', loggedInUserId, 'permissions']),
      role: 'clinic',
      type: 'clinic',
      uploadPermission: !!get(clinic, ['patients', loggedInUserId, 'permissions', 'upload']),
    }))),
    ...(map(membersOfTargetCareTeam, memberId => ({
      email: get(allUsersMap, [memberId, 'emails', '0']),
      id: get(allUsersMap, [memberId, 'userid']),
      name: personUtils.fullName(allUsersMap[memberId]),
      nameOrderable: (personUtils.fullName(allUsersMap[memberId]) || '').toLowerCase(),
      permissions: get(permissionsOfMembersInTargetCareTeam, [memberId]),
      role: personUtils.hasClinicRole(allUsersMap[memberId]) ? 'clinician' : 'member',
      type: 'account',
      uploadPermission: !!get(permissionsOfMembersInTargetCareTeam, [memberId, 'upload']),
    }))),
    ...(map(pendingMemberInvites, invite => ({
      email: invite.email,
      key: invite.key,
      nameOrderable: invite.email,
      permissions: invite.context,
      role: 'member',
      status: invite.status,
      type: invite.type,
      uploadPermission: !!get(invite, ['context', 'upload']),
      created: invite.created,
    }))),
    ...(map(clinicInvites, invite => ({
      id: invite.clinicId,
      key: invite.key,
      name: get(clinics, [invite.clinicId, 'name'], ''),
      nameOrderable: get(clinics, [invite.clinicId, 'name'], '').toLowerCase(),
      permissions: invite.context,
      role: 'clinic',
      status: invite.status,
      type: invite.type,
      uploadPermission: !!get(invite, ['context', 'upload']),
    }))),
  ];

  return accounts;
});

export const selectPatient = (state) => {
  let patient = null;
  let permissions = null;

  if (state.blip.allUsersMap) {
    if (state.blip.currentPatientInViewId) {
      patient = get(
        state.blip.allUsersMap,
        state.blip.currentPatientInViewId,
        null
      );

      permissions = get(
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
      clinicPatient = get(state.blip.clinics, [state.blip.selectedClinicId, 'patients', state.blip.currentPatientInViewId]);
    }
  }

  return clinicPatient;
};

export const selectPermsOfLoggedInUser = (state) => {
  let permsOfLoggedInUser = null;

  if (state.blip.allUsersMap) {
    if (state.blip.currentPatientInViewId) {
      permsOfLoggedInUser = state.blip.selectedClinicId
        ? get(
          state.blip.clinics,
          [
            state.blip.selectedClinicId,
            'patients',
            state.blip.currentPatientInViewId,
            'permissions',
          ],
          {}
        ) : get(
          state.blip.membershipPermissionsInOtherCareTeams,
          state.blip.currentPatientInViewId,
          {}
        );
    }
  }

  return permsOfLoggedInUser;
};

export const selectUser = (state) => {
  let user = null;

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }
  }

  return user;
};
