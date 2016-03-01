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
import update from 'react-addons-update';

import initialState from './initialState';
import * as types from '../constants/actionTypes';

export const notification = (state = initialState.notification, action) => {
  switch (action.type) {
    case types.ACKNOWLEDGE_NOTIFICATION:
      if (!action.payload.acknowledgedNotification) {
        return update(state, { $set: null });
      }
    default:
      return state;
  }
};

export const passwordResetConfirmed = (state = initialState.passwordResetConfirmed, action) => {
  switch(action.type) {
    case types.CONFIRM_PASSWORD_RESET_SUCCESS:
      return update(state, { $set: true });
    default:
      return state;
  }
};

export const signupConfirmed = (state = initialState.signupConfirmed, action) => {
  switch(action.type) {
    case types.CONFIRM_SIGNUP_SUCCESS:
      return update(state, { $set: true });
    default:
      return state;
  }
};

export const isLoggedIn = (state = initialState.isLoggedIn, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      return update(state, { $set: true });
    case types.LOGOUT_SUCCESS:
      return update(state, { $set: false });
    default:
      return state;
  }
};

export const sentEmailVerification = (state = initialState.sentEmailVerification, action) => {
  switch(action.type) {
    case types.SIGNUP_SUCCESS:
      return update(state, { $set: false });
    default:
      return state;
  }
};

export const resentEmailVerification = (state = initialState.resentEmailVerification, action) => {
  switch(action.type) {
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
      return update(state, { $set: false });
    default:
      return state;
  }
};

export const loggedInUser = (state = initialState.loggedInUser, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      return update(state, { $set: action.payload.user });
    case types.ACCEPT_TERMS_SUCCESS:
      return update(state, { termsAccepted: { $set: action.payload.acceptedDate }});
    case types.CREATE_PATIENT_SUCCESS:
      return update(state, { profile: { $set: action.payload.patient.profile }});
    case types.UPDATE_USER_REQUEST:
      return update(state, { $merge: action.payload.updatingUser });
    case types.UPDATE_USER_SUCCESS:
      return update(state, { $merge: action.payload.updatedUser });
    case types.LOGOUT_SUCCESS:
      return update(state, { $set: null });
    default:
      return state;
  }
};

export const currentPatientInView = (state = initialState.currentPatientInView, action) => {
  switch(action.type) {
    case types.CREATE_PATIENT_SUCCESS:
    case types.FETCH_PATIENT_SUCCESS:
      return update(state, { $set:action.payload.patient });
    case types.UPDATE_PATIENT_SUCCESS:
      return update(state, { $set: action.payload.updatedPatient });
    case types.LOGOUT_SUCCESS:
    case types.CLEAR_PATIENT_IN_VIEW:
      return update(state, { $set: null });
    default:
      return state;
  }
};

export const timePrefs = (state = initialState.timePrefs, action) => {
  switch(action.type) {
    case types.SET_TIME_PREFERENCES:
      return update(state, { $set: action.payload.timePrefs });
    default:
      return state;
  }
};

export const bgPrefs = (state = initialState.bgPrefs, action) => {
  switch(action.type) {
    case types.SET_BLOOD_GLUCOSE_PREFERENCES:
      return update(state, { $set: action.payload.bgPrefs });
    default:
      return state;
  }
};

export const messageThread = (state = initialState.messageThread, action) => {
  switch(action.type) {
    case types.FETCH_MESSAGE_THREAD_SUCCESS:
      return update(state, { $set: action.payload.messageThread });
    case types.CLOSE_MESSAGE_THREAD:
    case types.LOGOUT_SUCCESS:
      return update(state, { $set: null });
    default:
      return state;
  }
};

export const patientsMap = (state = initialState.patientsMap, action) => {
  switch(action.type) {
    case types.FETCH_PATIENTS_SUCCESS:
      let patientMap = {};
      action.payload.patients.forEach((p) => patientMap[p.userid] = p);

      return update(state, { $set: patientMap });
    case types.ACCEPT_MEMBERSHIP_SUCCESS:
      let { creator } = action.payload.acceptedMembership;
      return update(state, { $merge: { [creator.userid]: creator } });
    case types.LOGOUT_SUCCESS:
      return update(state, { $set: {} });
    default:
      return state;
  }
};

export const patientDataMap = (state = initialState.patientDataMap, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_DATA_SUCCESS:
    case types.UPDATE_LOCAL_PATIENT_DATA:
      return update(state, {
        [action.payload.patientId]: { $set: action.payload.patientData }
      });
    case types.CLEAR_PATIENT_DATA:
      return update(state, {
        [action.payload.patientId]: { $set: null }
      });
    case types.LOGOUT_SUCCESS:
      return update(state, { $set: {} });
    default:
      return state;
  }
};

export const patientNotesMap = (state = initialState.patientNotesMap, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_DATA_SUCCESS:
      return update(state, {
        [action.payload.patientId]: { $set: action.payload.patientNotes }
      });
    case types.CLEAR_PATIENT_DATA:
      return update(state, {
        [action.payload.patientId]: { $set: null }
      });
    case types.LOGOUT_SUCCESS:
      return update(state, { $set: {} });
    default:
      return state;
  }
};

export const pendingInvites = (state = initialState.pendingInvites, action) => {
  switch(action.type) {
    case types.FETCH_PENDING_INVITES_SUCCESS:
      return update(state, { $set: action.payload.pendingInvites });
    case types.SEND_INVITATION_SUCCESS:
      return update(state, { $push: action.payload.invitation });
    case types.CANCEL_INVITATION_SUCCESS:
      return update(state, { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.email !== action.payload.removedEmail )
        }
      });
    case types.LOGOUT_SUCCESS:
      return update(state, { $set: [] });
    default:
      return state;
  }
};

export const pendingMemberships = (state = initialState.pendingMemberships, action) => {
  switch(action.type) {
    case types.FETCH_PENDING_MEMBERSHIPS_SUCCESS:
      return update(state, { $set: action.payload.pendingMemberships });
    case types.ACCEPT_MEMBERSHIP_SUCCESS:
      return update(state, { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.key !== action.payload.acceptedMembership.key );
        }
      });
    case types.DISMISS_MEMBERSHIP_SUCCESS:
      return update(state, { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.key !== action.payload.dismissedMembership.key );
        }
      });
    default:
      return state;
  }
};