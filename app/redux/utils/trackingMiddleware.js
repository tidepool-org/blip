/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import * as ActionTypes from '../constants/actionTypes';

const trackMetricMap = {
  SIGNUP_SUCCESS: 'Signed Up',
  LOGIN_SUCCESS: 'Logged In',
  SETUP_DATA_STORAGE_SUCCESS: 'Created Profile',
  UPDATE_PATIENT_SUCCESS: 'Updated Profile',
  UPDATE_USER_SUCCESS: 'Updated Account',
  LOGOUT_REQUEST: 'Logged Out',
  VERIFY_CUSTODIAL_SUCCESS: 'VCA Home Verification - Verified',
};

const interpretMetricMap = {
  TURN_ON_CBG_RANGE: function(action) {
    return `Turn on ${action.payload.range}${!_.isNaN(parseInt(action.payload.range, 10)) ? encodeURIComponent('%') : ''}`;
  },
  TURN_OFF_CBG_RANGE: function(action) {
    return `Turn off ${action.payload.range}${!_.isNaN(parseInt(action.payload.range, 10)) ? encodeURIComponent('%') : ''}`;
  }
}

export default (api) => {
  return ({ getState }) => (next) => (action) => {
    if (trackMetricMap[action.type]) {
      api.metrics.track(trackMetricMap[action.type]);
    }
    if (interpretMetricMap[action.type]) {
      api.metrics.track(interpretMetricMap[action.type](action));
    }
    return next(action);
  };
}
