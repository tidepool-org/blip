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

const getSmartOnFhirProperties = (getState) => {
  const state = getState();
  const isSmartOnFhir = !!state?.blip?.smartOnFhirData;
  // Only include isSmartOnFhir when it's true to avoid cluttering analytics
  return isSmartOnFhir ? { isSmartOnFhir: true } : undefined;
};

const trackMetricMap = {
  UPDATE_PATIENT_SUCCESS: 'Updated Profile',
  UPDATE_USER_SUCCESS: 'Updated Account',
  LOGOUT_REQUEST: 'Logged Out',
  VERIFY_CUSTODIAL_SUCCESS: 'VCA Home Verification - Verified',
};

const interpretMetricMap = {
  LOGIN_SUCCESS: function(action, getState) {
    const user = _.get(action, 'payload.user');

    const clinician = isClinicianAccount(user);
    const mobile = utils.isMobile();
    const smartProperties = getSmartOnFhirProperties(getState);

    let eventMetadata = { clinician, mobile };
    if (smartProperties) {
      eventMetadata = { ...eventMetadata, ...smartProperties };
    }

    // Empty values should be omitted from the metadata object to prevent sending blank query params
    const filteredEventMetadata = _.omitBy(eventMetadata, _.isNil);

    return { eventName: 'Logged In', properties: filteredEventMetadata };
  },
  SETUP_DATA_STORAGE_SUCCESS: function(action, getState) {
    const diagnosisType = _.get(action, 'payload.patient.profile.patient.diagnosisType');
    const smartProperties = getSmartOnFhirProperties(getState);
    let properties = diagnosisType ? { 'Diabetes Type': diagnosisType } : undefined;
    if (smartProperties) {
      properties = properties ? { ...properties, ...smartProperties } : smartProperties;
    }
    return { eventName: 'Created Profile', properties };
  },
  SIGNUP_SUCCESS: function(action, getState) {
    const user = _.get(action, 'payload.user');
    const roles = _.get(user, 'roles');
    const type = isClinicianAccount(user) ? 'Clinician' : 'Personal';
    const smartProperties = getSmartOnFhirProperties(getState);

    let signupProperties = roles ? { roles: roles } : undefined;
    if (smartProperties) {
      signupProperties = signupProperties ? { ...signupProperties, ...smartProperties } : smartProperties;
    }

    let accountCreatedProperties = smartProperties;

    return [
      { eventName: 'Signed Up', properties: signupProperties },
      { eventName: `Web - ${type} Account Created`, properties: accountCreatedProperties },
    ];
  },
  TURN_ON_CBG_RANGE: function(action, getState) {
    const smartProperties = getSmartOnFhirProperties(getState);
    return { eventName: `Turn on ${action.payload.range}${!_.isNaN(parseInt(action.payload.range, 10)) ? encodeURIComponent('%') : ''}`, properties: smartProperties };
  },
  TURN_OFF_CBG_RANGE: function(action, getState) {
    const smartProperties = getSmartOnFhirProperties(getState);
    return { eventName: `Turn off ${action.payload.range}${!_.isNaN(parseInt(action.payload.range, 10)) ? encodeURIComponent('%') : ''}`, properties: smartProperties };
  }
}

export default (api) => {
  return ({ getState }) => (next) => (action) => {
    if (trackMetricMap[action.type]) {
      const smartProperties = getSmartOnFhirProperties(getState);
      if (smartProperties) {
        api.metrics.track(trackMetricMap[action.type], smartProperties);
      } else {
        api.metrics.track(trackMetricMap[action.type]);
      }
    }
    if (interpretMetricMap[action.type]) {
      let metrics = interpretMetricMap[action.type](action, getState);
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
