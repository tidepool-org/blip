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

const working = {
  inProgress: false,
  notification: null
};

export default { 
  passwordResetConfirmed: false,
  signupConfirmed: false,
  isLoggedIn: false,
  sentEmailVerification: false,
  resentEmailVerification: false,
  loggedInUserId: null,
  targetUserId: null,
  currentPatientInViewId: null,
  membersOfTargetCareTeam: [],
  memberInOtherCareTeams: [],
  permissionsOfMembersInTargetCareTeam: {},
  membershipPermissionsInOtherCareTeams: {},
  allUsersMap: {},
  patientDataMap: {},
  patientNotesMap: {},
  pendingReceivedInvites: [],
  pendingSentInvites: [],
  messageThread: null,
  working: {
    acceptingReceivedInvite: Object.assign({}, working),
    acceptingTerms: Object.assign({}, working),
    cancellingSentInvite: Object.assign({}, working),
    confirmingPasswordReset: Object.assign({}, working),
    confirmingSignup: Object.assign({}, working),
    creatingPatient: Object.assign({}, working),
    rejectingReceivedInvite: Object.assign({}, working),
    fetchingMessageThread: Object.assign({}, working),
    fetchingPatient: Object.assign({}, working),
    fetchingPatientData: Object.assign({}, working),
    fetchingPatients: Object.assign({}, working),
    fetchingPendingReceivedInvites: Object.assign({}, working),
    fetchingPendingSentInvites: Object.assign({}, working),
    fetchingUser: Object.assign({}, working),
    loggingIn: Object.assign({}, working),
    loggingOut: Object.assign({}, working),
    removingPatient: Object.assign({}, working),
    removingMember: Object.assign({}, working),
    requestingPasswordReset: Object.assign({}, working),
    resendingEmailVerification: Object.assign({}, working),
    sendingInvite: Object.assign({}, working),
    settingMemberPermissions: Object.assign({}, working),
    updatingPatient: Object.assign({}, working),
    updatingUser: Object.assign({}, working),  
    signingUp: Object.assign({}, working),
  },
  notification: null,
  timePrefs: {
    timezoneAware: false,
    timezoneName: null
  }, 
  bgPrefs: {
    bgUnits: 'mg/dL'
  }
};