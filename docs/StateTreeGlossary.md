## Glossary of terms in blip's state tree

> **PWD**: Person With Diabetes (or, conveniently enough for us at Tidepool, Person With Data). Used as a shorthand for a user that has a Tidepool account *with* data storage, as opposed to a Tidepool user (such as a clinic worker, diabetes educator, endocrinologist etc.) whose account is not set up for data storage.

blip's state tree forks into three branches from the outset: `routing` for routing-related state, `viz` for data visualization-related state, and `blip` for everything else. You shouldn't (need to) manipulate the `routing` branch of the state tree directly; this is handled by React Router and `react-router-redux`. Likewise, code manipulating the `viz` branch of the state tree is handled inside the `vizReducer` included in blip's redux store but imported from the [@tidepool/viz](https://www.npmjs.com/package/@tidepool/viz '@tidepool/viz on npm') dependency.

The document gives more information on what you'll find in the `blip` branch of the state tree, in four sections:

- [actions and working](#actions-and-working)
- [notification](#notification)
- [user-related state](#userrelated-state)
- [patient data & notes](#patient-data--notes)

* * * * *

### actions and working

There are several top-level properties within the `blip` branch of the state tree that are simple Booleans recording whether or not an action has taken place during the active session. Their names are, for the most part, self-explanatory:

- `isLoggedIn`
- `passwordResetConfirmed`
- `resentEmailVerification`
- `sentEmailVerification`

The `showingWelcomeMessage` is similar but can be a Boolean or `null` (the default). The "welcome message" is a prompt to set up data storage for users who log in and don't have access to view anyone's data (including their own) and don't have any pending invitations; in this case, the value of `showingWelcomeMessage` is set to true. The message is dismiss-able, whereupon this property is set to `false` to avoid re-prompting in the same session.

The `working` sub-branch within `blip` records asynchronous actions in progress (for the purposes of rendering loading indicators, etc.) and their status as succeeded or failed once concluded. Each leaf on the branch takes the form:

```js
{
  inProgress: true || false,
  notification: null || {
    type: 'error',
    message: 'Error message'
  }
}
```

The various `working` leaves are fairly self-explanatory, but just in case (and with the route where the action takes place noted, where relevant):

- `acceptingReceivedInvite` occurs when a logged-in user clicks "Join the Team!" in response to an incoming care team invitation (`/patients`)

- `acceptingTerms` occurs on acceptance of the Terms of Service and Privacy Policy (`/terms`)

- `cancellingSentInvite` occurs when a logged-in user decides to revoke a still-pending, outgoing invitation to the target care team (`/patients/:id/share`)

- `confirmingPasswordReset` occurs when a user submits a new password during the password reset process (`/confirm-password-reset`)

- `confirmingSignup` occurs on verification of a signing-up user's e-mail address (by clicking a link sent in an e-mail after submission of initial sign-up form) (`/login`)

- `fetchingMessageThread` occurs during the fetch of a message thread (after clicking on a yellow sticky note in the message "pool" of the Daily data view) (`/patients/:id/data`)

- `fetchingPatient` occurs when fetching a PWD's profile (various)

- `fetchingPatientData` occurs when fetching a PWD's diabetes device data (`/patients/:id/data`)

- `fetchingPatients` occurs when fetching the profiles of the PWDs whose data the logged-in user has access to (`/patients`)

- `fetchingPendingReceivedInvites` occurs when fetching the incoming care team invitations for the logged-in user (`/patients`)

- `fetchingPendingSentInvites` occurs when fetching the outgoing but still pending invitations to the target care team sent by the logged-in user (`/patients/:id/share`)

- `fetchingUser` occurs when fetching the logged-in user's info (various)

- `loggingIn` occurs when logging in, duh (`/login`)

- `loggingOut` occurs when logging out, double duh (anywhere)

- `rejectingReceivedInvite` occurs when a logged-in user clicks "Ignore" in response to an incoming care team invitation (`/patients`)

- `removingMemberFromTargetCareTeam` occurs when a logged-in user revokes access to the target user's data for an individual that had accepted an invitation to the target user's care team sometime in the past (`/patients/:id/share`)

- `removingMembershipInOtherCareTeam` occurs when a logged-in user decides to leave another user's care team (`/patients`)

- `requestingPasswordReset` occurs when a user requests a password reset (`/request-password-reset`)

- `resendingEmailVerification` occurs when a user requests an additional verification e-mail (`/email-verification`)

- `sendingInvite` occurs when a logged-in user issues an invitation to the target care team (`/patients/:id/share`)

- `settingMemberPermissions` occurs when a logged-in user changes the permissions granted to a member of the target care team (`/patients/:id/share`)

- `settingUpDataStorage` occurs when a logged-in user sets up data storage for himself or herself or for a target PWD under his or her care (`/patients/new`)

- `signingUp` occurs when a user submits the initial sign-up form

- `updatingPatient` occurs when updating the profile info for a PWD (`/patients/:id/profile`)

- `updatingUser` occurs when updating the user info for the logged-in user (`/profile`)

### notification

The `notification` branch of the state tree is often `null`. The action `type`s that result in a non-`null` notification are easily found by looking at [the `notification` reducer](https://github.com/tidepool-org/blip/blob/master/app/redux/reducers/misc.js#L24 'GitHub: blip app/redux/reducers/misc.js notification'). When it has a value, the value will have the following properties:

- `key`: one of the keys listed above under the `working` branch of the state tree
- `isDismissable`: Boolean indicating whether or not the notification should be user-dismiss-able; presently `true` for all notifications
- `link`: an optional link that may be included in the `payload` of an action triggering a notification
- `status`: an optional HTTP status code retrieved when present from an `error` object in the action payload

When `notification` is non-null, a modal will appear to notify the user of the error that has occurred.

### user-related state

When a user logs into blip, many sub-branches of the state tree are populated starting with the logged-in user's ID in `loggedInUserId`. If the logged-in user is a PWD[^a], then the `targetUserId` is also populated with the same user ID. However, if the logged-in user is **not** a PWD but rather a clinician or other care team member, then `targetUserId` remains `null`.

For all logged-in user's, regardless of whether the logged-in user is a PWD or not, we populate several other branches of the state tree with information about the logged-in user's memberships in *other PWD's* care teams, if any:

- `membershipInOtherCareTeams` is an array of user IDs identifying the other PWDs whose data account the logged-in user can view, comment on, and/or upload to.
- `membershipPermissionsInOtherCareTeams` is an object containing the user IDs from `membershipInOtherCareTeams` as its keys; the value for each key in an object with one of more possible keys: `note`, `root`, `upload`, `view`—an empty object as the value for any of these keys means that the user identified *has* that permission on the target PWD's data.
- `pendingReceivedInvites` is an array of objects representing incoming invitations to other PWDs' care team(s) that have been received but not yet accepted (by the logged-in user).

When the logged-in user is a PWD, we also populate several other branches of the state tree with information about the PWD's care team:

- `membersOfTargetCareTeam` is an array of user IDs identifying the members of the target PWD's care team.
- `pendingSentInvites` is an array of objects representing invitations to the target PWD's care team that have been sent but not yet accepted.
- `permissionsOfMembersInTargetCareTeam` is an object with the `membersOfTargetCareTeam` *plus* the `targetUserId` as keys; the value for each key in an object with one of more possible keys: `note`, `root`, `upload`, `view`—an empty object as the value for any of these keys means that the user identified *has* that permission on the target PWD's data.

Many of these state tree branches are simple arrays of user IDs or hash maps with user IDs as keys, but of course we often need to display not the user ID associated with a user but rather their name (or other information) in the UI. So we store any and all user metadata in an `allUsersMap` branch of the state tree: this branch is an object with user IDs as its keys, and the value for each key is an object representing all the available (to the logged-in user) profile information, metadata, etc. for the keyed user. Storing all additional user information aside from the user IDs in one place is important for maintaining a single source of truth for user-related information in blip's application state, and that single source of truth is the `allUsersMap`.

### patient data & notes

When any logged-in user—whether a PWD or not—navigates to view a particular PWD's data, we fetch the diabetes device data and notes for that PWD and store each of these under the PWD's user ID as a key in the state tree objects `patientDataMap` and `patientNotesMap`. Presently we do *not* use these branches of the state tree to perform any client-side caching of patient data and notes: whenever the logged-in user navigates away from `/patients/:id/data`, we immediately clear the data stored under the PWD's ID in `patientDataMap` and `patientNotesMap`. (See also: [the brief discussion of data caching](./Architecture.md#data-caching) on the "Architecture" page.)

[^a]: Or is a caregiver of a PWD who set up data storage using the radio choice "This is for someone I care for who has type 1 diabetes"—what we call a ["fake child account"](./FakeChildAccounts.md).
