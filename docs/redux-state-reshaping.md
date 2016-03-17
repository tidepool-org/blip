export default { 
  passwordResetConfirmed: false,
  signupConfirmed: false,
  isLoggedIn: false,
  sentEmailVerification: false,
  resentEmailVerification: false,
  // rename to `loggedInUserId` becomes just a userid
  loggedInUser: null,
  // add new field `targerUserId` for storing userid of "true" child account (future-proofing)
  // rename to `currentPatientInViewId`
  currentPatientInView: null,
  // equivalent to `allUsers` in uploader
  // maybe `allUsersMap` and include `loggedInUser`
  // and move user & profile info from `loggedInUser`
  patientsMap: {},
  patientDataMap: {},
  patientNotesMap: {},
  // new fields reorganizing info that currently exists in loggedInUser and patientsMap relating to memberships and permissions
  // arrays of IDs only = `membersOfTargetCareTeam` and `memberInOtherCareTeams`

  // option 1
  // a map `membershipPermissions`
  // keys are userids
  // and each user object has potentially two keys: `trustorPermissionsForTarget` (target has a membership in other care team) and `trusteePermissionsFromTarget` (permissions given by target to members of own care team)
  // ~#*~* option 2 *~*#~
  // two maps = `permissionsOfMembersInTargetCareTeam` and `membershipPermissionsInOtherCareTeams`
  // option 3
  // a map `membershipsPermission` keys are the concatenation of the two involved userIds, where left is trustor and right is trustee by convention
  
  // rename to `pendingSentInvitations` but doesn't need to be normalized b/c single-use
  pendingInvites: [],
  // rename to `pendingReceivedInvitations` but doesn't need to be normalized b/c single-use
  pendingMemberships: [],
  messageThread: null,
  working: {
    // rename to `acceptingReceivedInvitation`
    acceptingMembership: Object.assign({}, working),
    acceptingTerms: Object.assign({}, working),
    // rename to either `cancellingSentInvitation`
    cancellingInvitation: Object.assign({}, working),
    confirmingPasswordReset: Object.assign({}, working),
    confirmingSignup: Object.assign({}, working),
    creatingPatient: Object.assign({}, working),
    // rename to `rejectingReceivedInvitation`
    dismissingMembership: Object.assign({}, working),
    fetchingMessageThread: Object.assign({}, working),
    fetchingPatient: Object.assign({}, working),
    fetchingPatientData: Object.assign({}, working),
    fetchingPatients: Object.assign({}, working),
    // rename to `fetchingPendingSentInvitations`
    fetchingPendingInvites: Object.assign({}, working),
    // rename to `fetchingPendingReceivedInvitations`
    fetchingPendingMemberships: Object.assign({}, working),
    fetchingUser: Object.assign({}, working),
    loggingIn: Object.assign({}, working),
    loggingOut: Object.assign({}, working),
    removingPatient: Object.assign({}, working),
    // rename to `removingMemberFromOwnCareTeam` or `removingMemberFromTargetCareTeam`
    removingMember: Object.assign({}, working),
    requestingPasswordReset: Object.assign({}, working),
    resendingEmailVerification: Object.assign({}, working),
    // rename to `sending
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