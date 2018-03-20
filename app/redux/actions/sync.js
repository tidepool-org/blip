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
import * as UserMessages from '../constants/usrMessages';

export function showWelcomeMessage() {
  return {
    type: ActionTypes.SHOW_WELCOME_MESSAGE,
  };
}

export function hideWelcomeMessage() {
  return {
    type: ActionTypes.HIDE_WELCOME_MESSAGE,
  };
}

export function showBanner(type) {
  return {
    type: ActionTypes.SHOW_BANNER,
    payload: { type },
  };
}

export function hideBanner(type) {
  return {
    type: ActionTypes.HIDE_BANNER,
    payload: { type },
  };
}

export function dismissBanner(type) {
  return {
    type: ActionTypes.DISMISS_BANNER,
    payload: { type },
  };
}

export function acknowledgeNotification(acknowledgedNotification) {
  return {
    type: ActionTypes.ACKNOWLEDGE_NOTIFICATION,
    payload: {
      acknowledgedNotification: acknowledgedNotification,
    },
  };
}

export function closeMessageThread() {
  return {
    type: ActionTypes.CLOSE_MESSAGE_THREAD,
  };
}

export function addPatientNote(note) {
  return {
    type: ActionTypes.ADD_PATIENT_NOTE,
    payload: {
      note: note,
      patientId: note.groupid,
    }
  };
}

export function updatePatientNote(note) {
  return {
    type: ActionTypes.UPDATE_PATIENT_NOTE,
    payload: {
      note: note,
      patientId: note.groupid,
    }
  };
}

export function clearPatientData(patientId) {
  return {
    type: ActionTypes.CLEAR_PATIENT_DATA,
    payload: {
      patientId: patientId,
    },
  };
}

export function clearPatientInView() {
  return {
    type: ActionTypes.CLEAR_PATIENT_IN_VIEW,
  };
}

export function loginRequest() {
  return {
    type: ActionTypes.LOGIN_REQUEST,
  };
}

export function loginSuccess(user) {
  return {
    type: ActionTypes.LOGIN_SUCCESS,
    payload: {
      user: user,
    },
  };
}

export function loginFailure(error, apiError, payload) {
  return {
    type: ActionTypes.LOGIN_FAILURE,
    error: error,
    payload: payload || null,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function logoutRequest() {
  return {
    type: ActionTypes.LOGOUT_REQUEST,
  };
}

export function logoutSuccess() {
  return {
    type: ActionTypes.LOGOUT_SUCCESS,
  };
}

export function signupRequest() {
  return {
    type: ActionTypes.SIGNUP_REQUEST,
  };
}

export function signupSuccess(user) {
  return {
    type: ActionTypes.SIGNUP_SUCCESS,
    payload: {
      user: user,
    },
  };
}

export function signupFailure(error, apiError) {
  return {
    type: ActionTypes.SIGNUP_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function confirmPasswordResetRequest() {
  return {
    type: ActionTypes.CONFIRM_PASSWORD_RESET_REQUEST,
  };
}

export function confirmPasswordResetSuccess() {
  return {
    type: ActionTypes.CONFIRM_PASSWORD_RESET_SUCCESS,
  };
}

export function confirmPasswordResetFailure(error, apiError) {
  return {
    type: ActionTypes.CONFIRM_PASSWORD_RESET_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function confirmSignupRequest() {
  return {
    type: ActionTypes.CONFIRM_SIGNUP_REQUEST,
  };
}

export function confirmSignupSuccess() {
  return {
    type: ActionTypes.CONFIRM_SIGNUP_SUCCESS,
  };
}

export function confirmSignupFailure(error, apiError, signupKey) {
  return {
    type: ActionTypes.CONFIRM_SIGNUP_FAILURE,
    error: error,
    payload: {
      signupKey
    },
    meta: {
      apiError: apiError || null,
    },
  };
}

export function verifyCustodialRequest() {
  return {
    type: ActionTypes.VERIFY_CUSTODIAL_REQUEST,
  };
}

export function verifyCustodialSuccess() {
  return {
    type: ActionTypes.VERIFY_CUSTODIAL_SUCCESS,
  };
}

export function verifyCustodialFailure(error, apiError, signupKey) {
  return {
    type: ActionTypes.VERIFY_CUSTODIAL_FAILURE,
    error: error,
    payload: {
      signupKey
    },
    meta: {
      apiError: apiError || null,
    },
  };
}

export function resendEmailVerificationRequest() {
  return {
    type: ActionTypes.RESEND_EMAIL_VERIFICATION_REQUEST,
  };
}

export function resendEmailVerificationSuccess() {
  return {
    type: ActionTypes.RESEND_EMAIL_VERIFICATION_SUCCESS,
    payload: {
      notification: {
        type: 'alert',
        message: UserMessages.EMAIL_SENT,
      },
    },
  };
}

export function resendEmailVerificationFailure(error, apiError) {
  return {
    type: ActionTypes.RESEND_EMAIL_VERIFICATION_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function acceptTermsRequest() {
  return {
    type: ActionTypes.ACCEPT_TERMS_REQUEST,
  };
}

export function acceptTermsSuccess(userId, acceptedDate) {
  return {
    type: ActionTypes.ACCEPT_TERMS_SUCCESS,
    payload: {
      userId,
      acceptedDate,
    },
  };
}

export function acceptTermsFailure(error, apiError) {
  return {
    type: ActionTypes.ACCEPT_TERMS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function setupDataStorageRequest() {
  return {
    type: ActionTypes.SETUP_DATA_STORAGE_REQUEST,
  };
}

export function setupDataStorageSuccess(userId, patient) {
  return {
    type: ActionTypes.SETUP_DATA_STORAGE_SUCCESS,
    payload: {
      userId,
      patient,
    },
  };
}

export function setupDataStorageFailure(error, apiError) {
  return {
    type: ActionTypes.SETUP_DATA_STORAGE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function removeMembershipInOtherCareTeamRequest() {
  return {
    type: ActionTypes.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST,
  };
}

export function removeMembershipInOtherCareTeamSuccess(removedPatientId) {
  return {
    type: ActionTypes.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS,
    payload: {
      removedPatientId: removedPatientId,
    },
  };
}

export function removeMembershipInOtherCareTeamFailure(error, apiError) {
  return {
    type: ActionTypes.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function removeMemberFromTargetCareTeamRequest() {
  return {
    type: ActionTypes.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST,
  };
}

export function removeMemberFromTargetCareTeamSuccess(removedMemberId) {
  return {
    type: ActionTypes.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS,
    payload: {
      removedMemberId: removedMemberId,
    },
  };
}

export function removeMemberFromTargetCareTeamFailure(error, apiError) {
  return {
    type: ActionTypes.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function requestPasswordResetRequest() {
  return {
    type: ActionTypes.REQUEST_PASSWORD_RESET_REQUEST,
  };
}

export function requestPasswordResetSuccess() {
  return {
    type: ActionTypes.REQUEST_PASSWORD_RESET_SUCCESS,
  };
}

export function requestPasswordResetFailure(error, apiError) {
  return {
    type: ActionTypes.REQUEST_PASSWORD_RESET_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function sendInviteRequest() {
  return {
    type: ActionTypes.SEND_INVITE_REQUEST,
  };
}

export function sendInviteSuccess(invite) {
  return {
    type: ActionTypes.SEND_INVITE_SUCCESS,
    payload: {
      invite: invite,
    },
  };
}

export function sendInviteFailure(error, apiError) {
  return {
    type: ActionTypes.SEND_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function cancelSentInviteRequest() {
  return {
    type: ActionTypes.CANCEL_SENT_INVITE_REQUEST,
  };
}

export function cancelSentInviteSuccess(removedEmail) {
  return {
    type: ActionTypes.CANCEL_SENT_INVITE_SUCCESS,
    payload: {
      removedEmail: removedEmail,
    },
  };
}

export function cancelSentInviteFailure(error, apiError) {
  return {
    type: ActionTypes.CANCEL_SENT_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function acceptReceivedInviteRequest(acceptedReceivedInvite) {
  return {
    type: ActionTypes.ACCEPT_RECEIVED_INVITE_REQUEST,
    payload: {
      acceptedReceivedInvite: acceptedReceivedInvite,
    },
  };
}

export function acceptReceivedInviteSuccess(acceptedReceivedInvite) {
  return {
    type: ActionTypes.ACCEPT_RECEIVED_INVITE_SUCCESS,
    payload: {
      acceptedReceivedInvite: acceptedReceivedInvite,
    },
  };
}

export function acceptReceivedInviteFailure(error, apiError) {
  return {
    type: ActionTypes.ACCEPT_RECEIVED_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function rejectReceivedInviteRequest(rejectedReceivedInvite) {
  return {
    type: ActionTypes.REJECT_RECEIVED_INVITE_REQUEST,
    payload: {
      rejectedReceivedInvite: rejectedReceivedInvite,
    },
  };
}

export function rejectReceivedInviteSuccess(rejectedReceivedInvite) {
  return {
    type: ActionTypes.REJECT_RECEIVED_INVITE_SUCCESS,
    payload: {
      rejectedReceivedInvite: rejectedReceivedInvite,
    },
  };
}

export function rejectReceivedInviteFailure(error, apiError) {
  return {
    type: ActionTypes.REJECT_RECEIVED_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function setMemberPermissionsRequest() {
  return {
    type: ActionTypes.SET_MEMBER_PERMISSIONS_REQUEST,
  };
}

export function setMemberPermissionsSuccess(memberId, permissions) {
  return {
    type: ActionTypes.SET_MEMBER_PERMISSIONS_SUCCESS,
    payload: {
      memberId: memberId,
      permissions: permissions,
    },
  };
}

export function setMemberPermissionsFailure(error, apiError) {
  return {
    type: ActionTypes.SET_MEMBER_PERMISSIONS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updatePatientRequest() {
  return {
    type: ActionTypes.UPDATE_PATIENT_REQUEST,
  };
}

export function updatePatientSuccess(patient) {
  return {
    type: ActionTypes.UPDATE_PATIENT_SUCCESS,
    payload: {
      updatedPatient: patient,
    },
  };
}

export function updatePatientFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_PATIENT_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updatePreferencesRequest() {
  return {
    type: ActionTypes.UPDATE_PREFERENCES_REQUEST,
  };
}

export function updatePreferencesSuccess(preferences) {
  return {
    type: ActionTypes.UPDATE_PREFERENCES_SUCCESS,
    payload: {
      updatedPreferences: preferences,
    },
  };
}

export function updatePreferencesFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_PREFERENCES_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchSettingsRequest() {
  return {
    type: ActionTypes.FETCH_SETTINGS_REQUEST,
  };
}

export function fetchSettingsSuccess(settings) {
  return {
    type: ActionTypes.FETCH_SETTINGS_SUCCESS,
    payload: {
      settings: settings,
    },
  };
}

export function fetchSettingsFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_SETTINGS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updateSettingsRequest() {
  return {
    type: ActionTypes.UPDATE_SETTINGS_REQUEST,
  };
}

export function updateSettingsSuccess(userId, settings) {
  return {
    type: ActionTypes.UPDATE_SETTINGS_SUCCESS,
    payload: {
      userId: userId,
      updatedSettings: settings,
    },
  };
}

export function updateSettingsFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_SETTINGS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updatePatientBgUnitsRequest() {
  return {
    type: ActionTypes.UPDATE_PATIENT_BG_UNITS_REQUEST,
  };
}

export function updatePatientBgUnitsSuccess(userId, settings) {
  return {
    type: ActionTypes.UPDATE_PATIENT_BG_UNITS_SUCCESS,
    payload: {
      userId: userId,
      updatedSettings: _.pick(settings, ['bgTarget', 'units']),
    },
  };
}

export function updatePatientBgUnitsFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_PATIENT_BG_UNITS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updateUserRequest(userId, user) {
  return {
    type: ActionTypes.UPDATE_USER_REQUEST,
    payload: {
      userId: userId,
      updatingUser: user,
    },
  };
}

export function updateUserSuccess(userId, user) {
  return {
    type: ActionTypes.UPDATE_USER_SUCCESS,
    payload: {
      userId: userId,
      updatedUser: user,
    },
  };
}

export function updateUserFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_USER_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function logErrorRequest() {
  return {
    type: ActionTypes.LOG_ERROR_REQUEST,
  };
}

export function logErrorSuccess() {
  return {
    type: ActionTypes.LOG_ERROR_SUCCESS,
  };
}

/**
 * Synchronous Action Handlers for Fetching
 */

export function fetchUserRequest() {
  return {
    type: ActionTypes.FETCH_USER_REQUEST,
  };
}

export function fetchUserSuccess(user) {
  return {
    type: ActionTypes.FETCH_USER_SUCCESS,
    payload: {
      user: user,
    },
  };
}

export function fetchUserFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_USER_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchPendingSentInvitesRequest() {
  return {
    type: ActionTypes.FETCH_PENDING_SENT_INVITES_REQUEST,
  };
}

export function fetchPendingSentInvitesSuccess(pendingSentInvites) {
  return {
    type: ActionTypes.FETCH_PENDING_SENT_INVITES_SUCCESS,
    payload: {
      pendingSentInvites: pendingSentInvites,
    },
  };
}

export function fetchPendingSentInvitesFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_PENDING_SENT_INVITES_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchPendingReceivedInvitesRequest() {
  return {
    type: ActionTypes.FETCH_PENDING_RECEIVED_INVITES_REQUEST,
  };
}

export function fetchPendingReceivedInvitesSuccess(pendingReceivedInvites) {
  return {
    type: ActionTypes.FETCH_PENDING_RECEIVED_INVITES_SUCCESS,
    payload: {
      pendingReceivedInvites: pendingReceivedInvites,
    },
  };
}

export function fetchPendingReceivedInvitesFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_PENDING_RECEIVED_INVITES_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchPatientRequest() {
  return {
    type: ActionTypes.FETCH_PATIENT_REQUEST,
  };
}

export function fetchPatientSuccess(patient) {
  return {
    type: ActionTypes.FETCH_PATIENT_SUCCESS,
    payload: {
      patient: patient,
    },
  };
}

export function fetchPatientFailure(error, apiError, link) {
  return {
    type: ActionTypes.FETCH_PATIENT_FAILURE,
    error: error,
    payload: { link },
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchPatientsRequest() {
  return {
    type: ActionTypes.FETCH_PATIENTS_REQUEST,
  };
}

export function fetchPatientsSuccess(patients) {
  return {
    type: ActionTypes.FETCH_PATIENTS_SUCCESS,
    payload: {
      patients: patients,
    },
  };
}

export function fetchPatientsFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_PATIENTS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null
    },
  };
}

export function fetchPatientDataRequest() {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_REQUEST,
  };
}

export function fetchPatientDataSuccess(patientId, patientData, patientNotes, fetchedUntil) {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_SUCCESS,
    payload: {
      patientId,
      patientData,
      patientNotes,
      fetchedUntil,
    },
  };
}

export function fetchPatientDataFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null
    },
  };
}

export function fetchMessageThreadRequest() {
  return {
    type: ActionTypes.FETCH_MESSAGE_THREAD_REQUEST,
  };
}

export function fetchMessageThreadSuccess(messageThread) {
  return {
    type: ActionTypes.FETCH_MESSAGE_THREAD_SUCCESS,
    payload: {
      messageThread: messageThread,
    },
  };
}

export function fetchMessageThreadFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_MESSAGE_THREAD_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchDataDonationAccountsRequest() {
  return {
    type: ActionTypes.FETCH_DATA_DONATION_ACCOUNTS_REQUEST,
  };
}

export function fetchDataDonationAccountsSuccess(accounts) {
  return {
    type: ActionTypes.FETCH_DATA_DONATION_ACCOUNTS_SUCCESS,
    payload: {
      accounts,
    },
  };
}

export function fetchDataDonationAccountsFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_DATA_DONATION_ACCOUNTS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updateDataDonationAccountsRequest() {
  return {
    type: ActionTypes.UPDATE_DATA_DONATION_ACCOUNTS_REQUEST,
  };
}

export function updateDataDonationAccountsSuccess(accounts) {
  return {
    type: ActionTypes.UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS,
    payload: {
      accounts,
    },
  };
}

export function updateDataDonationAccountsFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_DATA_DONATION_ACCOUNTS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchDataSourcesRequest() {
  return {
    type: ActionTypes.FETCH_DATA_SOURCES_REQUEST,
  };
}

export function fetchDataSourcesSuccess(dataSources) {
  return {
    type: ActionTypes.FETCH_DATA_SOURCES_SUCCESS,
    payload: {
      dataSources,
    },
  };
}

export function fetchDataSourcesFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_DATA_SOURCES_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchServerTimeRequest() {
  return {
    type: ActionTypes.FETCH_SERVER_TIME_REQUEST,
  };
}

export function fetchServerTimeSuccess(serverTime) {
  return {
    type: ActionTypes.FETCH_SERVER_TIME_SUCCESS,
    payload: {
      serverTime,
    },
  };
}

export function fetchServerTimeFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_SERVER_TIME_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function connectDataSourceRequest() {
  return {
    type: ActionTypes.CONNECT_DATA_SOURCE_REQUEST,
  };
}

export function connectDataSourceSuccess(id, url) {
  return {
    type: ActionTypes.CONNECT_DATA_SOURCE_SUCCESS,
    payload: {
      authorizedDataSource: {
        id,
        url,
      }
    },
  };
}

export function connectDataSourceFailure(error, apiError) {
  return {
    type: ActionTypes.CONNECT_DATA_SOURCE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function disconnectDataSourceRequest() {
  return {
    type: ActionTypes.DISCONNECT_DATA_SOURCE_REQUEST,
  };
}

export function disconnectDataSourceSuccess() {
  return {
    type: ActionTypes.DISCONNECT_DATA_SOURCE_SUCCESS,
    payload: {},
  };
}

export function disconnectDataSourceFailure(error, apiError) {
  return {
    type: ActionTypes.DISCONNECT_DATA_SOURCE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}
