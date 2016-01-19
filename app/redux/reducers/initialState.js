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

export default {
  signupConfirmed: false,
  isLoggedIn: false,
  user: null,
  patients: {},
  patientsData: {},
  invites: {},
  currentPatient: null,
  working: {
    confirmingSignup: false,
    fetchingInvites: false,
    fetchingPendingInvites: false,
    fetchingMessages: false,
    fetchingPatients: false,
    fetchingPatient: false,
    fetchingPatientData: false,
    signingUp: false,
    loggingOut: false,
    loggingIn: false
  },
  error: null
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