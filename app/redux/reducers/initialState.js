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
  loggedInUser: null,
  currentPatientInView: null,
  patientsMap: {},
  patientDataMap: {},
  patientNotesMap: {},
  pendingInvites: [],
  pendingMemberships: [],
  messageThread: null,
  working: {
    acceptingMembership: Object.assign({}, working),
    acceptingTerms: Object.assign({}, working),
    cancellingInvitation: Object.assign({}, working),
    confirmingPasswordReset: Object.assign({}, working),
    confirmingSignup: Object.assign({}, working),
    creatingPatient: Object.assign({}, working),
    dismissingMembership: Object.assign({}, working),
    fetchingMessageThread: Object.assign({}, working),
    fetchingPatient: Object.assign({}, working),
    fetchingPatientData: Object.assign({}, working),
    fetchingPatients: Object.assign({}, working),
    fetchingPendingInvites: Object.assign({}, working),
    fetchingPendingMemberships: Object.assign({}, working),
    fetchingUser: Object.assign({}, working),
    loggingIn: Object.assign({}, working),
    loggingOut: Object.assign({}, working),
    removingPatient: Object.assign({}, working),
    removingMember: Object.assign({}, working),
    requestingPasswordReset: Object.assign({}, working),
    resendingEmailVerification: Object.assign({}, working),
    sendingInvitation: Object.assign({}, working),
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

// let iteration = {
//   error: null,
//   notification: null,
//   users: {
//     isFetching: false
//     loggedInUser: null,
//     memberships: [], // jury is still out best names for memberships/careteam
//     pendingMemberships: [],
//     careteam: [],
//     pendingCareteam: [],
//     collection: {
//       // id : {
//       //   isFetching: false
//       //   user_id
//       //   profile: { //might not to have profile could just promote these props to user
//       //     fullName
//       //     patient?: {
//       //       birthday
//       //       diagnosisDate
//       //     }
//       //   }
//       //   tidelineData: {
//       //     ...
//       //   }
//       //   currentMessageThread:  // either id or thread
//       //   
//       //   loggedInUserPermissions: { ? //if this user is not logged in user and is a PWD
//       //     view - boolean
//       //     upload - boolean
//       //     might be a 3rd property - admin
//       //   }
//       //  }
//     }
//   },

// }

// users reducer