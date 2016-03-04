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

export function acknowledgeNotification(acknowledgedNotification) {
  return {
    type: ActionTypes.ACKNOWLEDGE_NOTIFICATION,
    payload: {
      acknowledgedNotification: acknowledgedNotification
    }
  };
}

export function closeMessageThread() {
  return {
    type: ActionTypes.CLOSE_MESSAGE_THREAD,
  };
}

export function clearPatientData(patientId) {
  return {
    type: ActionTypes.CLEAR_PATIENT_DATA,
    payload: {
      patientId: patientId
    }
  };
}

export function clearPatientInView() {
  return {
    type: ActionTypes.CLEAR_PATIENT_IN_VIEW
  };
}

export function setTimePreferences(timePrefs) {
  return {
    type: ActionTypes.SET_TIME_PREFERENCES,
    payload: {
      timePrefs: timePrefs
    }
  }
};

export function setBloodGlucosePreferences(bgPrefs) {
  return {
    type: ActionTypes.SET_BLOOD_GLUCOSE_PREFERENCES,
    payload: {
      bgPrefs: bgPrefs
    }
  }
};

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

export function loginFailure(error, payload) {
  return {
    type: ActionTypes.LOGIN_FAILURE,
    error: error,
    payload: payload || null
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

export function confirmPasswordResetRequest() {
  return {
    type: ActionTypes.CONFIRM_PASSWORD_RESET_REQUEST
  };
}

export function confirmPasswordResetSuccess() {
  return {
    type: ActionTypes.CONFIRM_PASSWORD_RESET_SUCCESS
  };
}

export function confirmPasswordResetFailure(error) {
  return {
    type: ActionTypes.CONFIRM_PASSWORD_RESET_FAILURE,
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

export function resendEmailVerificationRequest() {
  return {
    type: ActionTypes.RESEND_EMAIL_VERIFICATION_REQUEST
  };
}

export function resendEmailVerificationSuccess() {
  return {
    type: ActionTypes.RESEND_EMAIL_VERIFICATION_SUCCESS
  };
}

export function resendEmailVerificationFailure(error) {
  return {
    type: ActionTypes.RESEND_EMAIL_VERIFICATION_FAILURE,
    error: error
  };
}

export function acceptTermsRequest() {
  return {
    type: ActionTypes.ACCEPT_TERMS_REQUEST
  };
}

export function acceptTermsSuccess(userId, acceptedDate) {
  return {
    type: ActionTypes.ACCEPT_TERMS_SUCCESS,
    payload: {
      userId,
      acceptedDate
    }
  };
}

export function acceptTermsFailure(error) {
  return {
    type: ActionTypes.ACCEPT_TERMS_FAILURE,
    error: error
  };
}

export function createPatientRequest() {
  return {
    type: ActionTypes.CREATE_PATIENT_REQUEST
  };
}

export function createPatientSuccess(userId, patient) {
  return {
    type: ActionTypes.CREATE_PATIENT_SUCCESS,
    payload: {
      userId,
      patient
    }
  };
}

export function createPatientFailure(error) {
  return {
    type: ActionTypes.CREATE_PATIENT_FAILURE,
    error: error
  };
}

export function removePatientRequest() {
  return {
    type: ActionTypes.REMOVE_PATIENT_REQUEST
  };
}

export function removePatientSuccess(removedPatientId) {
  return {
    type: ActionTypes.REMOVE_PATIENT_SUCCESS,
    payload: {
      removedPatientId: removedPatientId
    }
  };
}

export function removePatientFailure(error) {
  return {
    type: ActionTypes.REMOVE_PATIENT_FAILURE,
    error: error
  };
}

export function removeMemberRequest() {
  return {
    type: ActionTypes.REMOVE_MEMBER_REQUEST
  };
}

export function removeMemberSuccess(removedMemberId) {
  return {
    type: ActionTypes.REMOVE_MEMBER_SUCCESS,
    payload: {
      removedMemberId: removedMemberId
    }
  };
}

export function removeMemberFailure(error) {
  return {
    type: ActionTypes.REMOVE_MEMBER_FAILURE,
    error: error
  };
}

export function requestPasswordResetRequest() {
  return {
    type: ActionTypes.REQUEST_PASSWORD_RESET_REQUEST
  };
}

export function requestPasswordResetSuccess() {
  return {
    type: ActionTypes.REQUEST_PASSWORD_RESET_SUCCESS
  };
}

export function requestPasswordResetFailure(error) {
  return {
    type: ActionTypes.REQUEST_PASSWORD_RESET_FAILURE,
    error: error
  };
}

export function sendInviteRequest() {
  return {
    type: ActionTypes.SEND_INVITE_REQUEST
  };
}

export function sendInviteSuccess(invite) {
  return {
    type: ActionTypes.SEND_INVITE_SUCCESS,
    payload: {
      invite: invite
    }
  };
}

export function sendInviteFailure(error) {
  return {
    type: ActionTypes.SEND_INVITE_FAILURE,
    error: error
  };
}

export function cancelSentInviteRequest() {
  return {
    type: ActionTypes.CANCEL_SENT_INVITE_REQUEST
  };
}

export function cancelSentInviteSuccess(removedEmail) {
  return {
    type: ActionTypes.CANCEL_SENT_INVITE_SUCCESS,
    payload: {
      removedEmail: removedEmail
    }
  };
}

export function cancelSentInviteFailure(error) {
  return {
    type: ActionTypes.CANCEL_SENT_INVITE_FAILURE,
    error: error
  };
}

export function acceptReceivedInviteRequest(acceptedReceivedInvite) {
  return {
    type: ActionTypes.ACCEPT_RECEIVED_INVITE_REQUEST,
    payload: {
      acceptedReceivedInvite: acceptedReceivedInvite
    }
  };
}

export function acceptReceivedInviteSuccess(acceptedReceivedInvite) {
  return {
    type: ActionTypes.ACCEPT_RECEIVED_INVITE_SUCCESS,
    payload: {
      acceptedReceivedInvite: acceptedReceivedInvite
    }
  };
}

export function acceptReceivedInviteFailure(error) {
  return {
    type: ActionTypes.ACCEPT_RECEIVED_INVITE_FAILURE,
    error: error
  };
}

export function rejectReceivedInviteRequest(rejectedReceivedInvite) {
  return {
    type: ActionTypes.REJECT_RECEIVED_INVITE_REQUEST,
    payload: {
      rejectedReceivedInvite: rejectedReceivedInvite
    }
  };
}

export function rejectReceivedInviteSuccess(rejectedReceivedInvite) {
  return {
    type: ActionTypes.REJECT_RECEIVED_INVITE_SUCCESS,
    payload: {
      rejectedReceivedInvite: rejectedReceivedInvite
    }
  };
}

export function rejectReceivedInviteFailure(error) {
  return {
    type: ActionTypes.REJECT_RECEIVED_INVITE_FAILURE,
    error: error
  };
}

export function setMemberPermissionsRequest() {
  return {
    type: ActionTypes.SET_MEMBER_PERMISSIONS_REQUEST
  };
}

export function setMemberPermissionsSuccess(memberId, permissions) {
  return {
    type: ActionTypes.SET_MEMBER_PERMISSIONS_SUCCESS,
    payload: {
      memberId: memberId,
      permissions: permissions
    }
  };
}

export function setMemberPermissionsFailure(error) {
  return {
    type: ActionTypes.SET_MEMBER_PERMISSIONS_FAILURE,
    error: error
  };
}

export function updatePatientRequest() {
  return {
    type: ActionTypes.UPDATE_PATIENT_REQUEST
  };
}

export function updatePatientSuccess(patient) {
  return {
    type: ActionTypes.UPDATE_PATIENT_SUCCESS,
    payload: {
      updatedPatient: patient
    }
  };
}

export function updatePatientFailure(error) {
  return {
    type: ActionTypes.UPDATE_PATIENT_FAILURE,
    error: error
  };
}

export function updateUserRequest(userId, user) {
  return {
    type: ActionTypes.UPDATE_USER_REQUEST,
    payload: {
      userId: userId,
      updatingUser: user
    }
  };
}

export function updateUserSuccess(userId, user) {
  return {
    type: ActionTypes.UPDATE_USER_SUCCESS,
    payload: {
      userId: userId,
      updatedUser: user
    }
  };
}

export function updateUserFailure(error) {
  return {
    type: ActionTypes.UPDATE_USER_FAILURE,
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

/**
 * Synchronous Action Handlers for Fetching
 */

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

export function fetchPendingReceivedInvitesRequest() {
  return {
    type: ActionTypes.FETCH_PENDING_RECEIVED_INVITES_REQUEST
  };
}

export function fetchPendingReceivedInvitesSuccess(pendingReceivedInvites) {
  return {
    type: ActionTypes.FETCH_PENDING_RECEIVED_INVITES_SUCCESS,
    payload: {
      pendingReceivedInvites: pendingReceivedInvites
    }
  };
}

export function fetchPendingReceivedInvitesFailure(error) {
  return {
    type: ActionTypes.FETCH_PENDING_RECEIVED_INVITES_FAILURE,
    error: error
  };
}

export function fetchPendingSentInvitesRequest() {
  return {
    type: ActionTypes.FETCH_PENDING_SENT_INVITES_REQUEST
  };
}

export function fetchPendingSentInvitesSuccess(pendingSentInvites) {
  return {
    type: ActionTypes.FETCH_PENDING_SENT_INVITES_SUCCESS,
    payload: {
      pendingSentInvites: pendingSentInvites
    }
  };
}

export function fetchPendingSentInvitesFailure(error) {
  return {
    type: ActionTypes.FETCH_PENDING_SENT_INVITES_FAILURE,
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

export function fetchPatientDataSuccess(patientId, patientData, patientNotes) {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_SUCCESS,
    payload: {
      patientId: patientId,
      patientData: patientData,
      patientNotes: patientNotes
    }
  };
}

export function fetchPatientDataFailure(error) {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_FAILURE,
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