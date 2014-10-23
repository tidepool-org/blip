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
	STUFF: getStuff()
};



function getStuff() {
  return 'Stuff';
}