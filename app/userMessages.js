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
	ERR_ACCEPTING_INVITE : 'Something went wrong while dismissing the invitation.',
	ERR_CHANGING_PERMS : 'Something went wrong while changing member perimissions.',
	ERR_REMOVING_MEMBER : 'Something went wrong while removing member from group.',
	ERR_INVITING_MEMBER : 'Something went wrong while inviting member.',
	ERR_CANCELING_INVITE : 'Something went wrong while canceling the invitation.',
	ERR_ON_LOGOUT : 'An error occured while logging out',
	ERR_FETCHING_USER :'An error occured while fetching user',
	ERR_FETCHING_PENDING_INVITES : 'Something went wrong while fetching pending invites',
	ERR_FETCHING_INVITES : 'Something went wrong while fetching invitations',
	ERR_FETCHING_TEAMS : 'Something went wrong while fetching care teams',
	ERR_FETCHING_PATIENT : 'Error fetching patient with id ',
	ERR_FETCHING_PATIENT_DATA : 'Error fetching data for patient with id ',
	ERR_FETCHING_MESSAGE_DATA : 'Error fetching data for message thread with id ',
	ERR_UPDATING_ACCOUNT : 'An error occured while updating user account',
	ERR_UPDATING_PATIENT : 'An error occured while saving patient',
	STUFF: getStuff()
};

function getStuff() {
  return 'Stuff';
}