
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

export const selectPatient = createSelector(
  [
    state => state.blip.allUsersMap,
    state => state.blip.currentPatientInViewId,
    state => state.blip.permissionsOfMembersInTargetCareTeam,
  ],
  (allUsersMap, currentPatientInViewId, permissionsOfMembersInTargetCareTeam) => {
    let patient = null;
    let permissions = null;

    if (allUsersMap && currentPatientInViewId) {
      patient = get(allUsersMap, currentPatientInViewId, null);
      permissions = get(permissionsOfMembersInTargetCareTeam, currentPatientInViewId, {});
    }

    return patient ? { permissions, ...patient } : null;
  }
);

export const selectClinicPatient = createSelector(
  [
    state => state.blip.allUsersMap,
    state => state.blip.currentPatientInViewId,
    state => state.blip.clinics,
    state => state.blip.selectedClinicId,
  ],
  (allUsersMap, currentPatientInViewId, clinics, selectedClinicId) => {
    let clinicPatient;

    if (allUsersMap && currentPatientInViewId) {
      clinicPatient = get(clinics, [selectedClinicId, 'patients', currentPatientInViewId]);
    }

    return clinicPatient;
  }
);

export const selectPermsOfLoggedInUser = createSelector(
  [
    state => state.blip.allUsersMap,
    state => state.blip.currentPatientInViewId,
    state => state.blip.selectedClinicId,
    state => state.blip.clinics,
    state => state.blip.membershipPermissionsInOtherCareTeams,
  ],
  (allUsersMap, currentPatientInViewId, selectedClinicId, clinics, membershipPermissionsInOtherCareTeams) => {
    let permsOfLoggedInUser = null;

    if (allUsersMap && currentPatientInViewId) {
      permsOfLoggedInUser = selectedClinicId
        ? get(
          clinics,
          [
            selectedClinicId,
            'patients',
            currentPatientInViewId,
            'permissions',
          ],
          {}
        ) : get(
          membershipPermissionsInOtherCareTeams,
          currentPatientInViewId,
          {}
        );
    }

    return permsOfLoggedInUser;
  }
);

export const selectUser = createSelector(
  [
    state => state.blip.allUsersMap,
    state => state.blip.loggedInUserId,
  ],
  (allUsersMap, loggedInUserId) => {
    let user = null;

    if (allUsersMap && loggedInUserId) {
      user = allUsersMap[loggedInUserId];
    }

    return user;
  }
);

export const selectIsSmartOnFhirMode = createSelector(
  [
    state => state.blip.smartCorrelationId,
  ],
  (smartCorrelationId) => {
    return !!smartCorrelationId;
  }
);
