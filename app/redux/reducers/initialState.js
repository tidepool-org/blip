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
  patients: {},
  patientData: {},
  pendingInvites: [],
  pendingMemberships: [],
  messageThread: null,
  working: {
    acceptingMembership: false,
    acceptingTerms: false,
    cancellingInvitation: Object.assign({}, working),
    confirmingPasswordReset: false,
    confirmingSignup: false,
    creatingPatient: Object.assign({}, working),
    dismissingMembership: false,
    fetchingMessageThread: false,
    fetchingPatient: false,
    fetchingPatientData: false,
    fetchingPatients: false,
    fetchingPendingInvites: false,
    fetchingPendingMemberships: false,
    fetchingUser: false,
    loggingIn: false,
    loggingOut: false,
    removingPatient: false,
    removingMember: Object.assign({}, working),
    requestingPasswordReset: false,
    resendingEmailVerification: false,
    sendingInvitation: Object.assign({}, working),
    settingMemberPermissions: Object.assign({}, working),
    updatingPatient: false,
    updatingUser: false,  
    signingUp: false,
  },
  error: null,
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