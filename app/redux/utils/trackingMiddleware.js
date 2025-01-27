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

import { isClinicianAccount } from '../../core/personutils';
import utils from '../../core/utils';
import * as ActionTypes from '../constants/actionTypes';

const trackMetricMap = {
  UPDATE_PATIENT_SUCCESS: 'Updated Profile',
  UPDATE_USER_SUCCESS: 'Updated Account',
  LOGOUT_REQUEST: 'Logged Out',
  VERIFY_CUSTODIAL_SUCCESS: 'VCA Home Verification - Verified',
};

const interpretMetricMap = {
  LOGIN_SUCCESS: function(action) {
    const user = _.get(action, 'payload.user');

    const clinician = isClinicianAccount(user);
    const mobile = utils.isMobile();

    let eventMetadata = { clinician, mobile };

    // Empty values should be omitted from the metadata object to prevent sending blank query params
    const filteredEventMetadata = _.omitBy(eventMetadata, _.isNil);

    return { eventName: 'Logged In', properties: filteredEventMetadata };
  },
  SETUP_DATA_STORAGE_SUCCESS: function(action) {
    const diagnosisType = _.get(action, 'payload.patient.profile.patient.diagnosisType');
    return { eventName: 'Created Profile', properties: diagnosisType ? { 'Diabetes Type': diagnosisType } : null };
  },
  SIGNUP_SUCCESS: function(action) {
    const user = _.get(action, 'payload.user');
    const roles = _.get(user, 'roles');
    const type = isClinicianAccount(user) ? 'Clinician' : 'Personal';
    return [
      { eventName: 'Signed Up', properties: roles ? { roles: roles } : null },
      { eventName: `Web - ${type} Account Created` },
    ];
  },
  TURN_ON_CBG_RANGE: function(action) {
    return { eventName: `Turn on ${action.payload.range}${!_.isNaN(parseInt(action.payload.range, 10)) ? encodeURIComponent('%') : ''}` };
  },
  TURN_OFF_CBG_RANGE: function(action) {
    return { eventName: `Turn off ${action.payload.range}${!_.isNaN(parseInt(action.payload.range, 10)) ? encodeURIComponent('%') : ''}` };
  }
}

export default (api) => {
  return ({ getState }) => (next) => (action) => {
    if (trackMetricMap[action.type]) {
      api.metrics.track(trackMetricMap[action.type]);
    }
    if (interpretMetricMap[action.type]) {
      let metrics = interpretMetricMap[action.type](action);
      if (!_.isArray(metrics)) {
        metrics = [metrics];
      }
      _.forEach(metrics, ({ eventName, properties }) => {
        api.metrics.track(eventName, properties);
      });
    }
    return next(action);
  };
}
