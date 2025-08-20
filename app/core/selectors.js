
import { filter, forEach, get, has, isEmpty, map, reject, values } from 'lodash';
import personUtils from './personutils';
import { createSelector } from 'reselect';
import { DATA_DONATION_CONSENT_TYPE, NONPROFIT_CODES_TO_SUPPORTED_ORGANIZATIONS_NAMES, TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL } from './constants';
import utils from './utils';

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

export const selectDataDonationConsent = (state) => {
  const currentConsent = state.blip.consentRecords[DATA_DONATION_CONSENT_TYPE];
  if (currentConsent) return currentConsent;

  const legacyDataDonationAccounts = state.blip.dataDonationAccounts;
  if (isEmpty(legacyDataDonationAccounts)) return null;

  const nonprofitAccounts = reject(legacyDataDonationAccounts, { email: TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL });
  const supportedOrganizations = [];

  // Extract nonprofit account identifiers from email addresses,
  // and format as comma-separated string for the multi-select input
  if (nonprofitAccounts.length) {
    forEach(nonprofitAccounts, account => {
      const code = utils.getDonationAccountCodeFromEmail(account.email);
      const organizationName = NONPROFIT_CODES_TO_SUPPORTED_ORGANIZATIONS_NAMES[code];
      organizationName && supportedOrganizations.push(organizationName);
    });
  }

  const legacyConsent = {
    type: DATA_DONATION_CONSENT_TYPE,
    status: 'active',
    version: 0,
    metadata: { supportedOrganizations },
  }

  return legacyConsent;
};

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
