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
  notification: null
};

const initialState = {
  passwordResetConfirmed: false,
  showingWelcomeMessage: null,
  showingDonateBanner: null,
  showingDexcomConnectBanner: null,
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
  patientDataMap: {},
  patientNotesMap: {},
  pdf: {},
  pendingReceivedInvites: [],
  pendingSentInvites: [],
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
    fetchingMessageThread: Object.assign({}, working),
    fetchingPatient: Object.assign({}, working),
    fetchingPatientData: Object.assign({}, working),
    fetchingPatients: Object.assign({}, working),
    fetchingPendingReceivedInvites: Object.assign({}, working),
    fetchingPendingSentInvites: Object.assign({}, working),
    fetchingUser: Object.assign({}, working),
    generatingPDF: Object.assign({}, working),
    loggingIn: Object.assign({}, working),
    loggingOut: Object.assign({}, working),
    removingMembershipInOtherCareTeam: Object.assign({}, working),
    removingMemberFromTargetCareTeam: Object.assign({}, working),
    requestingPasswordReset: Object.assign({}, working),
    resendingEmailVerification: Object.assign({}, working),
    sendingInvite: Object.assign({}, working),
    settingMemberPermissions: Object.assign({}, working),
    updatingDataDonationAccounts: Object.assign({}, working),
    updatingPatient: Object.assign({}, working),
    updatingPatientBgUnits: Object.assign({}, working),
    updatingUser: Object.assign({}, working),
    verifyingCustodial: Object.assign({}, working),
    signingUp: Object.assign({}, working),
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
};

export default initialState;
