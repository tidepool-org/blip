/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import _ from 'lodash';

import { MGDL_UNITS } from '../../core/constants';

const working = {
  inProgress: false,
  notification: null,
  completed: null,
};

const initialState = {
  passwordResetConfirmed: false,
  showingWelcomeMessage: null,
  showingDonateBanner: null,
  showingDexcomConnectBanner: null,
  showingShareDataBanner: null,
  seenShareDataBannerMax: false,
  showingUpdateTypeBanner: null,
  showingUploaderBanner: null,
  signupKey: null,
  isLoggedIn: false,
  sentEmailVerification: false,
  resentEmailVerification: false,
  loggedInUserId: null,
  targetUserId: null,
  currentPatientInViewId: null,
  membersOfTargetCareTeam: [],
  membershipInOtherCareTeams: [],
  permissionsOfMembersInTargetCareTeam: {},
  membershipPermissionsInOtherCareTeams: {},
  allUsersMap: {},
  pdf: {},
  data: {
    data: {
      aggregationsByDate: {},
      combined: [],
      current: {},
      next: {},
      prev: {},
    },
    timePrefs: {},
    bgPrefs: {},
    metaData: {},
    query: {},
    fetchedUntil: null,
    cacheUntil: null,
  },
  pendingReceivedInvites: [],
  pendingSentInvites: [],
  pendingSentClinicianInvites: {},
  prescriptions: [],
  devices: {},
  messageThread: null,
  working: {
    acceptingReceivedInvite: Object.assign({}, working),
    acceptingTerms: Object.assign({}, working),
    cancellingSentInvite: Object.assign({}, working),
    confirmingPasswordReset: Object.assign({}, working),
    confirmingSignup: Object.assign({}, working),
    connectingDataSource: Object.assign({}, working),
    disconnectingDataSource: Object.assign({}, working),
    settingUpDataStorage: Object.assign({}, working),
    rejectingReceivedInvite: Object.assign({}, working),
    fetchingDataDonationAccounts: Object.assign({}, working),
    fetchingDataSources: Object.assign({}, working),
    fetchingServerTime: Object.assign({}, working),
    fetchingClinicPrescriptions: Object.assign({}, working),
    creatingPrescription: Object.assign({}, working),
    creatingPrescriptionRevision: Object.assign({}, working),
    deletingPrescription: Object.assign({}, working),
    fetchingDevices: Object.assign({}, working),
    fetchingMessageThread: Object.assign({}, working),
    creatingMessageThread: Object.assign({}, working),
    editingMessageThread: Object.assign({}, working),
    fetchingPatient: Object.assign({}, working),
    fetchingPatientData: Object.assign({}, working),
    fetchingAssociatedAccounts: Object.assign({}, working),
    fetchingPendingReceivedInvites: Object.assign({}, working),
    fetchingPendingSentInvites: Object.assign({}, working),
    fetchingUser: Object.assign({}, working),
    generatingPDF: Object.assign({}, working),
    addingData: Object.assign({}, working),
    removingData: Object.assign({}, working),
    updatingDatum: Object.assign({}, working),
    queryingData: Object.assign({}, working),
    loggingIn: Object.assign({}, working),
    loggingOut: Object.assign({}, working),
    removingMembershipInOtherCareTeam: Object.assign({}, working),
    removingMemberFromTargetCareTeam: Object.assign({}, working),
    requestingPasswordReset: Object.assign({}, working),
    resendingEmailVerification: Object.assign({}, working),
    sendingInvite: Object.assign({}, working),
    sendingClinicInvite: Object.assign({}, working),
    resendingInvite: Object.assign({}, working),
    settingMemberPermissions: Object.assign({}, working),
    updatingDataDonationAccounts: Object.assign({}, working),
    updatingPatient: Object.assign({}, working),
    updatingPatientBgUnits: Object.assign({}, working),
    updatingUser: Object.assign({}, working),
    verifyingCustodial: Object.assign({}, working),
    signingUp: Object.assign({}, working),
    fetchingClinics: Object.assign({}, working),
    creatingClinic: Object.assign({}, working),
    fetchingClinic: Object.assign({}, working),
    fetchingClinicsByIds: Object.assign({}, working),
    updatingClinic: Object.assign({}, working),
    fetchingCliniciansFromClinic: Object.assign({}, working),
    fetchingClinician: Object.assign({}, working),
    updatingClinician: Object.assign({}, working),
    deletingClinicianFromClinic: Object.assign({}, working),
    deletingPatientFromClinic: Object.assign({}, working),
    fetchingPatientsForClinic: Object.assign({}, working),
    fetchingPatientFromClinic: Object.assign({}, working),
    creatingClinicCustodialAccount: Object.assign({}, working),
    creatingVCACustodialAccount: Object.assign({}, working),
    updatingClinicPatient: Object.assign({}, working),
    sendingClinicianInvite: Object.assign({}, working),
    fetchingClinicianInvite: Object.assign({}, working),
    resendingClinicianInvite: Object.assign({}, working),
    deletingClinicianInvite: Object.assign({}, working),
    fetchingPatientInvites: Object.assign({}, working),
    acceptingPatientInvitation: Object.assign({}, working),
    deletingPatientInvitation: Object.assign({}, working),
    updatingPatientPermissions: Object.assign({}, working),
    fetchingClinicMRNSettings: Object.assign({}, working),
    fetchingClinicEHRSettings: Object.assign({}, working),
    fetchingClinicsForPatient: Object.assign({}, working),
    fetchingClinicianInvites: Object.assign({}, working),
    acceptingClinicianInvite: Object.assign({}, working),
    dismissingClinicianInvite: Object.assign({}, working),
    fetchingClinicsForClinician: Object.assign({}, working),
    triggeringInitialClinicMigration: Object.assign({}, working),
    sendingPatientUploadReminder: Object.assign({}, working),
    sendingPatientDexcomConnectRequest: Object.assign({}, working),
    creatingClinicPatientTag: Object.assign({}, working),
    updatingClinicPatientTag: Object.assign({}, working),
    deletingClinicPatientTag: Object.assign({}, working),
    fetchingInfo: Object.assign({}, working),
  },
  notification: null,
  timePrefs: {
    timezoneAware: false,
    timezoneName: null
  },
  bgPrefs: {
    bgUnits: MGDL_UNITS
  },
  dataDonationAccounts: [],
  dataSources: [],
  authorizedDataSource: null,
  clinics: {},
  selectedClinicId: null,
  pendingReceivedClinicianInvites: [],
  clinicFlowActive: false,
  keycloakConfig: {},
  ssoEnabledDisplay: false,
};

export default initialState;
