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

import _ from 'lodash';

import * as ActionTypes from '../constants/actionTypes';

export function showWelcomeMessage() {
  return {
    type: ActionTypes.SHOW_WELCOME_MESSAGE
  };
}

export function hideWelcomeMessage() {
  return {
    type: ActionTypes.HIDE_WELCOME_MESSAGE
  };
}

export function showNotification(notification) {
  return {
    type: ActionTypes.SHOW_NOTIFICATION,
    payload: {
      notification: notification
    }
  };
}

export function closeNotification() {
  return {
    type: ActionTypes.CLOSE_NOTIFICATION
  };
}

export function loginRequest() {
  return {
    type: ActionTypes.LOGIN_REQUEST
  };
}

export function loginSuccess(user) {
  return {
    type: ActionTypes.LOGIN_SUCCESS,
    payload: {
      user: user
    }
  };
}

export function loginFailure(error) {
  return {
    type: ActionTypes.LOGIN_FAILURE,
    error: error
  };
}

export function logoutRequest() {
  return {
    type: ActionTypes.LOGOUT_REQUEST
  };
}

export function logoutSuccess() {
  return {
    type: ActionTypes.LOGOUT_SUCCESS,
  };
} 

export function logoutFailure(error) {
  return {
    type: ActionTypes.LOGOUT_FAILURE,
    error: error
  };
}

export function signupRequest() {
  return {
    type: ActionTypes.SIGNUP_REQUEST
  };
}

export function signupSuccess(user) {
  return {
    type: ActionTypes.SIGNUP_SUCCESS,
    payload: {
      user: user
    }
  };
}

export function signupFailure(error) {
  return {
    type: ActionTypes.SIGNUP_FAILURE,
    error: error
  };
}

export function confirmSignupRequest() {
  return {
    type: ActionTypes.CONFIRM_SIGNUP_REQUEST
  };
}

export function confirmSignupSuccess() {
  return {
    type: ActionTypes.CONFIRM_SIGNUP_SUCCESS
  };
}

export function confirmSignupFailure(error) {
  return {
    type: ActionTypes.CONFIRM_SIGNUP_FAILURE,
    error: error
  };
}

export function logErrorRequest() {
  return {
    type: ActionTypes.LOG_ERROR_REQUEST
  };
}

export function logErrorSuccess() {
  return {
    type: ActionTypes.LOG_ERROR_SUCCESS
  };
}

export function logErrorFailure(error) {
  return {
    type: ActionTypes.LOG_ERROR_FAILURE,
    error: error
  };
}

// TODO: Need to confirm these functions and whether we are happy with these in principle

export function fetchUserRequest() {
  return {
    type: ActionTypes.FETCH_USER_REQUEST
  };
}

export function fetchUserSuccess(user) {
  return {
    type: ActionTypes.FETCH_USER_SUCCESS,
    payload: {
      user: user
    }
  };
}

export function fetchUserFailure(error) {
  return {
    type: ActionTypes.FETCH_USER_FAILURE,
    error: error
  };
}

export function fetchPendingMembershipsRequest() {
  return {
    type: ActionTypes.FETCH_PENDING_MEMBERSHIPS_REQUEST
  };
}

export function fetchPendingMembershipsSuccess(pendingMemberships) {
  return {
    type: ActionTypes.FETCH_PENDING_MEMBERSHIPS_SUCCESS,
    payload: {
      pendingMemberships: pendingMemberships
    }
  };
}

export function fetchPendingMembershipsFailure(error) {
  return {
    type: ActionTypes.FETCH_PENDING_MEMBERSHIPS_FAILURE,
    error: error
  };
}

export function fetchPendingInvitesRequest() {
  return {
    type: ActionTypes.FETCH_PENDING_INVITES_REQUEST
  };
}

export function fetchPendingInvitesSuccess(pendingInvites) {
  return {
    type: ActionTypes.FETCH_PENDING_INVITES_SUCCESS,
    payload: {
      pendingInvites: pendingInvites
    }
  };
}

export function fetchPendingInvitesFailure(error) {
  return {
    type: ActionTypes.FETCH_PENDING_INVITES_FAILURE,
    error: error
  };
}

export function fetchPatientsRequest() {
  return {
    type: ActionTypes.FETCH_PATIENTS_REQUEST
  };
}

export function fetchPatientsSuccess(patients) {
  return {
    type: ActionTypes.FETCH_PATIENTS_SUCCESS,
    payload: {
      patients: patients
    }
  };
}

export function fetchPatientsFailure(error) {
  return {
    type: ActionTypes.FETCH_PATIENTS_FAILURE,
    error: error
  };
}

export function fetchPatientRequest() {
  return {
    type: ActionTypes.FETCH_PATIENT_REQUEST
  };
}

export function fetchPatientSuccess(patient) {
  return {
    type: ActionTypes.FETCH_PATIENT_SUCCESS,
    payload: {
      patient: patient
    }
  };
}

export function fetchPatientFailure(error) {
  return {
    type: ActionTypes.FETCH_PATIENT_FAILURE,
    error: error
  };
}

export function fetchPatientDataRequest() {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_REQUEST
  };
}

export function fetchPatientDataSuccess(patientData) {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_SUCCESS,
    payload: {
      patientData: patientData
    }
  };
}

export function fetchPatientDataFailure(error) {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_FAILURE,
    error: error
  };
}

export function fetchTeamNotesRequest() {
  return {
    type: ActionTypes.FETCH_TEAM_NOTES_REQUEST
  };
}

export function fetchTeamNotesSuccess(teamNotes) {
  return {
    type: ActionTypes.FETCH_TEAM_NOTES_SUCCESS,
    payload: {
      teamNotes: teamNotes
    }
  };
}

export function fetchTeamNotesFailure(error) {
  return {
    type: ActionTypes.FETCH_TEAM_NOTES_FAILURE,
    error: error
  };
}

export function fetchMessageThreadRequest() {
  return {
    type: ActionTypes.FETCH_MESSAGE_THREAD_REQUEST
  };
}

export function fetchMessageThreadSuccess(messageThread) {
  return {
    type: ActionTypes.FETCH_MESSAGE_THREAD_SUCCESS,
    payload: {
      messageThread: messageThread
    }
  };
}

export function fetchMessageThreadFailure(error) {
  return {
    type: ActionTypes.FETCH_MESSAGE_THREAD_FAILURE,
    error: error
  };
}