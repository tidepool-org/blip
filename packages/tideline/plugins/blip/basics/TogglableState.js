/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016 Tidepool Project
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


/* We have three allowable states
 *
 * `open`: toggle will default to an open state
 * `closed`: toggle will default to a closed state
 * `off`: section is NOT togglable and will always remain open
 *
 * NOTE: the `open` and `closed` are bool values as this is what is expected by the Toggle component
 */
var TogglableState = {
  open: true,
  closed: false,
  off: 'off'
};

module.exports = TogglableState;
