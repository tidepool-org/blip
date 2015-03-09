/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
*/

'use strict';

module.exports = {
  ERR_DISMISSING_INVITE : 'Something went wrong while dismissing the invitation.',
  ERR_ACCEPTING_INVITE : 'Something went wrong while accepting the invitation.',
  ERR_CHANGING_PERMS : 'Something went wrong while changing member perimissions.',
  ERR_REMOVING_MEMBER : 'Something went wrong while removing member from group.',
  ERR_INVITING_MEMBER : 'Something went wrong while inviting member.',
  ERR_CANCELING_INVITE : 'Something went wrong while canceling the invitation.',
  ERR_ON_LOGOUT : 'Something went wrong while logging out',
  ERR_FETCHING_USER :'Something went wrong while fetching user',
  ERR_FETCHING_PENDING_INVITES : 'Something went wrong while fetching pending invitations.',
  ERR_FETCHING_INVITES : 'Something went wrong while fetching invitations.',
  ERR_FETCHING_TEAMS : 'Something went wrong while fetching care teams.',
  ERR_FETCHING_PATIENT : 'Something went wrong while fetching patient with id ',
  ERR_FETCHING_PATIENT_DATA : 'Something went wrong while fetching data for patient with id ',
  ERR_FETCHING_MESSAGE_DATA : 'Something went wrong while fetching data for message thread with id ',
  ERR_UPDATING_ACCOUNT : 'Something went wrong while updating user account',
  ERR_UPDATING_PATIENT : 'Something went wrong while saving patient',
  ERR_GENERIC : 'Sorry! Something went wrong. It\'s our fault, not yours. We\'re going to investigate.',
  ERR_SERVICE_DOWN : 'Sorry! Something went wrong. It\'s our fault, not yours. We\'re going to go investigate. Please try again in a few moments.',
  ERR_OFFLINE : 'Sorry but it appears that you are offline. Blip requires that you be connected to the internet.',
  ERR_ACCOUNT_NOT_CONFIGURED : 'Sorry! It appears that this account hasn\'t been fully set up. Please notify the account owner that the storage may not be set up for the account.',
  ERR_YOUR_ACCOUNT_NOT_CONFIGURED : 'Sorry! It appears that this account hasn\'t been fully set up.',
  YOUR_ACCOUNT_DATA_SETUP : 'Click here to complete the "Set up data storage" step.',
  MSG_UTC : 'UTC time: ',
  STUFF: getStuff()
};

function getStuff() {
  return 'Stuff';
}
