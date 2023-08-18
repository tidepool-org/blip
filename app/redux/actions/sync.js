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

export function bannerCount(count) {
  return {
    type: ActionTypes.SHOW_BANNER,
    payload: { count },
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

export function sendClinicInviteRequest() {
  return {
    type: ActionTypes.SEND_CLINIC_INVITE_REQUEST,
  };
}

export function sendClinicInviteSuccess(invite) {
  return {
    type: ActionTypes.SEND_CLINIC_INVITE_SUCCESS,
    payload: {
      invite: invite,
    },
  };
}

export function sendClinicInviteFailure(error, apiError) {
  return {
    type: ActionTypes.SEND_CLINIC_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function resendInviteRequest() {
  return {
    type: ActionTypes.RESEND_INVITE_REQUEST,
  };
}

export function resendInviteSuccess(invite, removedInviteId) {
  return {
    type: ActionTypes.RESEND_INVITE_SUCCESS,
    payload: {
      invite: invite,
      removedInviteId: removedInviteId,
    },
  };
}

export function resendInviteFailure(error, apiError) {
  return {
    type: ActionTypes.RESEND_INVITE_FAILURE,
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

export function fetchAssociatedAccountsRequest() {
  return {
    type: ActionTypes.FETCH_ASSOCIATED_ACCOUNTS_REQUEST,
  };
}

export function fetchAssociatedAccountsSuccess(accounts) {
  return {
    type: ActionTypes.FETCH_ASSOCIATED_ACCOUNTS_SUCCESS,
    payload: accounts,
  };
}

export function fetchAssociatedAccountsFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_ASSOCIATED_ACCOUNTS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null
    },
  };
}

export function fetchPatientDataRequest(patientId) {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_REQUEST,
    payload: {
      patientId,
    },
  };
}

export function fetchPatientDataSuccess(patientId) {
  return {
    type: ActionTypes.FETCH_PATIENT_DATA_SUCCESS,
    payload: {
      patientId,
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

export function fetchClinicPrescriptionsRequest() {
  return {
    type: ActionTypes.FETCH_CLINIC_PRESCRIPTIONS_REQUEST,
  };
}

export function fetchClinicPrescriptionsSuccess(prescriptions) {
  return {
    type: ActionTypes.FETCH_CLINIC_PRESCRIPTIONS_SUCCESS,
    payload: {
      prescriptions: prescriptions,
    },
  };
}

export function fetchClinicPrescriptionsFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINIC_PRESCRIPTIONS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function createPrescriptionRequest() {
  return {
    type: ActionTypes.CREATE_PRESCRIPTION_REQUEST,
  };
}

export function createPrescriptionSuccess(prescription) {
  return {
    type: ActionTypes.CREATE_PRESCRIPTION_SUCCESS,
    payload: {
      prescription: prescription,
    },
  };
}

export function createPrescriptionFailure(error, apiError) {
  return {
    type: ActionTypes.CREATE_PRESCRIPTION_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function createPrescriptionRevisionRequest() {
  return {
    type: ActionTypes.CREATE_PRESCRIPTION_REVISION_REQUEST,
  };
}

export function createPrescriptionRevisionSuccess(prescription) {
  return {
    type: ActionTypes.CREATE_PRESCRIPTION_REVISION_SUCCESS,
    payload: {
      prescription: prescription,
    },
  };
}

export function createPrescriptionRevisionFailure(error, apiError) {
  return {
    type: ActionTypes.CREATE_PRESCRIPTION_REVISION_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function deletePrescriptionRequest(prescriptionId) {
  return {
    type: ActionTypes.DELETE_PRESCRIPTION_REQUEST,
    payload: {
      prescriptionId: prescriptionId,
    },
  };
}

export function deletePrescriptionSuccess(prescriptionId) {
  return {
    type: ActionTypes.DELETE_PRESCRIPTION_SUCCESS,
    payload: {
      prescriptionId: prescriptionId,
    },
  };
}

export function deletePrescriptionFailure(error, apiError) {
  return {
    type: ActionTypes.DELETE_PRESCRIPTION_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchDevicesRequest() {
  return {
    type: ActionTypes.FETCH_DEVICES_REQUEST,
  };
}

export function fetchDevicesSuccess(devices) {
  return {
    type: ActionTypes.FETCH_DEVICES_SUCCESS,
    payload: {
      devices: devices,
    },
  };
}

export function fetchDevicesFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_DEVICES_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
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

export function createMessageThreadRequest() {
  return {
    type: ActionTypes.CREATE_MESSAGE_THREAD_REQUEST,
  };
}

export function createMessageThreadSuccess(message) {
  return {
    type: ActionTypes.CREATE_MESSAGE_THREAD_SUCCESS,
    payload: {
      message: message,
    },
  };
}

export function createMessageThreadFailure(error, apiError) {
  return {
    type: ActionTypes.CREATE_MESSAGE_THREAD_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function editMessageThreadRequest() {
  return {
    type: ActionTypes.EDIT_MESSAGE_THREAD_REQUEST,
  };
}

export function editMessageThreadSuccess(message) {
  return {
    type: ActionTypes.EDIT_MESSAGE_THREAD_SUCCESS,
    payload: {
      message: message,
    },
  };
}

export function editMessageThreadFailure(error, apiError) {
  return {
    type: ActionTypes.EDIT_MESSAGE_THREAD_FAILURE,
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

export function updateDataDonationAccountsSuccess(dataDonationAccounts) {
  return {
    type: ActionTypes.UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS,
    payload: {
      dataDonationAccounts,
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

export function getClinicsRequest() {
  return {
    type: ActionTypes.GET_CLINICS_REQUEST,
  };
}

export function getClinicsSuccess(clinics, options) {
  return {
    type: ActionTypes.GET_CLINICS_SUCCESS,
    payload: {
      clinics,
      options
    },
  };
}

export function getClinicsFailure(error, apiError) {
  return {
    type: ActionTypes.GET_CLINICS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function createClinicRequest() {
  return {
    type: ActionTypes.CREATE_CLINIC_REQUEST,
  };
}

export function createClinicSuccess(clinic) {
  return {
    type: ActionTypes.CREATE_CLINIC_SUCCESS,
    payload: {
      clinic: clinic,
    },
  };
}

export function createClinicFailure(error, apiError) {
  return {
    type: ActionTypes.CREATE_CLINIC_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchClinicRequest() {
  return {
    type: ActionTypes.FETCH_CLINIC_REQUEST,
  };
}

export function fetchClinicSuccess(clinic) {
  return {
    type: ActionTypes.FETCH_CLINIC_SUCCESS,
    payload: {
      clinic: clinic,
    },
  };
}

export function fetchClinicFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINIC_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchClinicsByIdsRequest() {
  return {
    type: ActionTypes.FETCH_CLINICS_BY_IDS_REQUEST,
  };
}

export function fetchClinicsByIdsSuccess(clinics) {
  return {
    type: ActionTypes.FETCH_CLINICS_BY_IDS_SUCCESS,
    payload: {
      clinics: clinics,
    },
  };
}

export function fetchClinicsByIdsFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINICS_BY_IDS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updateClinicRequest() {
  return {
    type: ActionTypes.UPDATE_CLINIC_REQUEST,
  };
}

export function updateClinicSuccess(clinicId, clinic) {
  return {
    type: ActionTypes.UPDATE_CLINIC_SUCCESS,
    payload: {
      clinicId,
      clinic
    },
  };
}

export function updateClinicFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_CLINIC_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchCliniciansFromClinicRequest() {
  return {
    type: ActionTypes.FETCH_CLINICIANS_FROM_CLINIC_REQUEST,
  };
}

export function fetchCliniciansFromClinicSuccess(results) {
  return {
    type: ActionTypes.FETCH_CLINICIANS_FROM_CLINIC_SUCCESS,
    payload: {
      results: results,
    },
  };
}

export function fetchCliniciansFromClinicFailure(error, apiError, clinicId) {
  return {
    type: ActionTypes.FETCH_CLINICIANS_FROM_CLINIC_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
    payload: {
      clinicId
    }
  };
}

export function fetchClinicianRequest() {
  return {
    type: ActionTypes.FETCH_CLINICIAN_REQUEST,
  };
}

export function fetchClinicianSuccess(clinician, clinicId) {
  return {
    type: ActionTypes.FETCH_CLINICIAN_SUCCESS,
    payload: {
      clinician,
      clinicId
    },
  };
}

export function fetchClinicianFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINICIAN_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updateClinicianRequest() {
  return {
    type: ActionTypes.UPDATE_CLINICIAN_REQUEST,
  };
}

export function updateClinicianSuccess(clinicId, clinicianId, clinician) {
  return {
    type: ActionTypes.UPDATE_CLINICIAN_SUCCESS,
    payload: {
      clinicId,
      clinicianId,
      clinician,
    },
  };
}

export function updateClinicianFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_CLINICIAN_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function deleteClinicianFromClinicRequest() {
  return {
    type: ActionTypes.DELETE_CLINICIAN_FROM_CLINIC_REQUEST,
  };
}

export function deleteClinicianFromClinicSuccess(clinicId, clinicianId) {
  return {
    type: ActionTypes.DELETE_CLINICIAN_FROM_CLINIC_SUCCESS,
    payload: {
      clinicId,
      clinicianId,
    },
  };
}

export function deleteClinicianFromClinicFailure(error, apiError) {
  return {
    type: ActionTypes.DELETE_CLINICIAN_FROM_CLINIC_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function deletePatientFromClinicRequest() {
  return {
    type: ActionTypes.DELETE_PATIENT_FROM_CLINIC_REQUEST,
  };
}

export function deletePatientFromClinicSuccess(clinicId, patientId) {
  return {
    type: ActionTypes.DELETE_PATIENT_FROM_CLINIC_SUCCESS,
    payload: {
      clinicId,
      patientId,
    },
  };
}

export function deletePatientFromClinicFailure(error, apiError) {
  return {
    type: ActionTypes.DELETE_PATIENT_FROM_CLINIC_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchPatientsForClinicRequest() {
  return {
    type: ActionTypes.FETCH_PATIENTS_FOR_CLINIC_REQUEST,
  };
}

export function fetchPatientsForClinicSuccess(clinicId, patients, count) {
  return {
    type: ActionTypes.FETCH_PATIENTS_FOR_CLINIC_SUCCESS,
    payload: {
      count: count,
      patients: patients,
      clinicId: clinicId,
    },
  };
}

export function fetchPatientsForClinicFailure(error, apiError, clinicId) {
  return {
    type: ActionTypes.FETCH_PATIENTS_FOR_CLINIC_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
    payload: {
      clinicId
    }
  };
}

export function fetchPatientFromClinicRequest() {
  return {
    type: ActionTypes.FETCH_PATIENT_FROM_CLINIC_REQUEST,
  };
}

export function fetchPatientFromClinicSuccess(clinicId, patient) {
  return {
    type: ActionTypes.FETCH_PATIENT_FROM_CLINIC_SUCCESS,
    payload: {
      clinicId: clinicId,
      patient: patient,
    },
  };
}

export function fetchPatientFromClinicFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_PATIENT_FROM_CLINIC_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function createClinicCustodialAccountRequest() {
  return {
    type: ActionTypes.CREATE_CLINIC_CUSTODIAL_ACCOUNT_REQUEST,
  };
}

export function createClinicCustodialAccountSuccess(clinicId, patientId, patient) {
  return {
    type: ActionTypes.CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS,
    payload: {
      clinicId,
      patient,
      patientId,
    },
  };
}

export function createClinicCustodialAccountFailure(error, apiError) {
  return {
    type: ActionTypes.CREATE_CLINIC_CUSTODIAL_ACCOUNT_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function createVCACustodialAccountRequest() {
  return {
    type: ActionTypes.CREATE_VCA_CUSTODIAL_ACCOUNT_REQUEST,
  };
}

export function createVCACustodialAccountSuccess(patientId, patient) {
  return {
    type: ActionTypes.CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS,
    payload: {
      patient,
      patientId,
    },
  };
}

export function createVCACustodialAccountFailure(error, apiError) {
  return {
    type: ActionTypes.CREATE_VCA_CUSTODIAL_ACCOUNT_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updateClinicPatientRequest() {
  return {
    type: ActionTypes.UPDATE_CLINIC_PATIENT_REQUEST,
  };
}

export function updateClinicPatientSuccess(clinicId, patientId, patient) {
  return {
    type: ActionTypes.UPDATE_CLINIC_PATIENT_SUCCESS,
    payload: {
      patientId,
      clinicId,
      patient
    },
  };
}

export function updateClinicPatientFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_CLINIC_PATIENT_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchClinicianInviteRequest() {
  return {
    type: ActionTypes.FETCH_CLINICIAN_INVITE_REQUEST,
  };
}

export function fetchClinicianInviteSuccess(invite, clinicId) {
  return {
    type: ActionTypes.FETCH_CLINICIAN_INVITE_SUCCESS,
    payload: {
      invite,
      clinicId
    },
  };
}

export function fetchClinicianInviteFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINICIAN_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function sendClinicianInviteRequest() {
  return {
    type: ActionTypes.SEND_CLINICIAN_INVITE_REQUEST,
  };
}

export function sendClinicianInviteSuccess(clinician, clinicId) {
  return {
    type: ActionTypes.SEND_CLINICIAN_INVITE_SUCCESS,
    payload: {
      clinician,
      clinicId
    },
  };
}

export function sendClinicianInviteFailure(error, apiError) {
  return {
    type: ActionTypes.SEND_CLINICIAN_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function resendClinicianInviteRequest() {
  return {
    type: ActionTypes.RESEND_CLINICIAN_INVITE_REQUEST,
  };
}

export function resendClinicianInviteSuccess(invite) {
  return {
    type: ActionTypes.RESEND_CLINICIAN_INVITE_SUCCESS,
    payload: {
      invite,
    },
  };
}

export function resendClinicianInviteFailure(error, apiError) {
  return {
    type: ActionTypes.RESEND_CLINICIAN_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function deleteClinicianInviteRequest() {
  return {
    type: ActionTypes.DELETE_CLINICIAN_INVITE_REQUEST,
  };
}

export function deleteClinicianInviteSuccess(clinicId, inviteId, result) {
  return {
    type: ActionTypes.DELETE_CLINICIAN_INVITE_SUCCESS,
    payload: {
      clinicId,
      inviteId,
      result,
    },
  };
}

export function deleteClinicianInviteFailure(error, apiError) {
  return {
    type: ActionTypes.DELETE_CLINICIAN_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchPatientInvitesRequest() {
  return {
    type: ActionTypes.FETCH_PATIENT_INVITES_REQUEST,
  };
}

export function fetchPatientInvitesSuccess(clinicId, invites) {
  return {
    type: ActionTypes.FETCH_PATIENT_INVITES_SUCCESS,
    payload: {
      clinicId: clinicId,
      invites: invites,
    },
  };
}

export function fetchPatientInvitesFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_PATIENT_INVITES_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function acceptPatientInvitationRequest() {
  return {
    type: ActionTypes.ACCEPT_PATIENT_INVITATION_REQUEST,
  };
}

export function acceptPatientInvitationSuccess(clinicId, inviteId) {
  return {
    type: ActionTypes.ACCEPT_PATIENT_INVITATION_SUCCESS,
    payload: {
      inviteId: inviteId,
      clinicId: clinicId,
    },
  };
}

export function acceptPatientInvitationFailure(error, apiError) {
  return {
    type: ActionTypes.ACCEPT_PATIENT_INVITATION_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function deletePatientInvitationRequest() {
  return {
    type: ActionTypes.DELETE_PATIENT_INVITATION_REQUEST,
  };
}

export function deletePatientInvitationSuccess(clinicId, inviteId) {
  return {
    type: ActionTypes.DELETE_PATIENT_INVITATION_SUCCESS,
    payload: {
      inviteId: inviteId,
      clinicId: clinicId,
    },
  };
}

export function deletePatientInvitationFailure(error, apiError) {
  return {
    type: ActionTypes.DELETE_PATIENT_INVITATION_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updatePatientPermissionsRequest() {
  return {
    type: ActionTypes.UPDATE_PATIENT_PERMISSIONS_REQUEST,
  };
}

export function updatePatientPermissionsSuccess(clinicId, patientId, permissions) {
  return {
    type: ActionTypes.UPDATE_PATIENT_PERMISSIONS_SUCCESS,
    payload: {
      clinicId: clinicId,
      patientId: patientId,
      permissions: permissions,
    },
  };
}

export function updatePatientPermissionsFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_PATIENT_PERMISSIONS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchClinicMRNSettingsRequest() {
  return {
    type: ActionTypes.FETCH_CLINIC_MRN_SETTINGS_REQUEST,
  };
}

export function fetchClinicMRNSettingsSuccess(clinicId, settings) {
  return {
    type: ActionTypes.FETCH_CLINIC_MRN_SETTINGS_SUCCESS,
    payload: {
      clinicId,
      settings,
    },
  };
}

export function fetchClinicMRNSettingsFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINIC_MRN_SETTINGS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchClinicEHRSettingsRequest() {
  return {
    type: ActionTypes.FETCH_CLINIC_EHR_SETTINGS_REQUEST,
  };
}

export function fetchClinicEHRSettingsSuccess(clinicId, settings) {
  return {
    type: ActionTypes.FETCH_CLINIC_EHR_SETTINGS_SUCCESS,
    payload: {
      clinicId,
      settings,
    },
  };
}

export function fetchClinicEHRSettingsFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINIC_EHR_SETTINGS_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchClinicsForPatientRequest() {
  return {
    type: ActionTypes.FETCH_CLINICS_FOR_PATIENT_REQUEST,
  };
}

export function fetchClinicsForPatientSuccess(clinics) {
  return {
    type: ActionTypes.FETCH_CLINICS_FOR_PATIENT_SUCCESS,
    payload: {
      clinics: clinics,
    },
  };
}

export function fetchClinicsForPatientFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINICS_FOR_PATIENT_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function fetchClinicianInvitesRequest() {
  return {
    type: ActionTypes.FETCH_CLINICIAN_INVITES_REQUEST,
  };
}

export function fetchClinicianInvitesSuccess(invites) {
  return {
    type: ActionTypes.FETCH_CLINICIAN_INVITES_SUCCESS,
    payload: {
      invites: invites,
    },
  };
}

export function fetchClinicianInvitesFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_CLINICIAN_INVITES_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function acceptClinicianInviteRequest() {
  return {
    type: ActionTypes.ACCEPT_CLINICIAN_INVITE_REQUEST,
  };
}

export function acceptClinicianInviteSuccess(inviteId) {
  return {
    type: ActionTypes.ACCEPT_CLINICIAN_INVITE_SUCCESS,
    payload: {
      inviteId,
    },
  };
}

export function acceptClinicianInviteFailure(error, apiError) {
  return {
    type: ActionTypes.ACCEPT_CLINICIAN_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function dismissClinicianInviteRequest() {
  return {
    type: ActionTypes.DISMISS_CLINICIAN_INVITE_REQUEST,
  };
}

export function dismissClinicianInviteSuccess(inviteId) {
  return {
    type: ActionTypes.DISMISS_CLINICIAN_INVITE_SUCCESS,
    payload: {
      inviteId,
    },
  };
}

export function dismissClinicianInviteFailure(error, apiError) {
  return {
    type: ActionTypes.DISMISS_CLINICIAN_INVITE_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function getClinicsForClinicianRequest() {
  return {
    type: ActionTypes.GET_CLINICS_FOR_CLINICIAN_REQUEST,
  };
}

export function getClinicsForClinicianSuccess(clinics, clinicianId) {
  return {
    type: ActionTypes.GET_CLINICS_FOR_CLINICIAN_SUCCESS,
    payload: {
      clinics: clinics,
      clinicianId: clinicianId,
    },
  };
}

export function getClinicsForClinicianFailure(error, apiError) {
  return {
    type: ActionTypes.GET_CLINICS_FOR_CLINICIAN_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function selectClinic(clinicId) {
  return {
    type: ActionTypes.SELECT_CLINIC,
    payload: {
      clinicId
    },
  };
}

export function triggerInitialClinicMigrationRequest() {
  return {
    type: ActionTypes.TRIGGER_INITIAL_CLINIC_MIGRATION_REQUEST,
  };
}

export function triggerInitialClinicMigrationSuccess(clinicId) {
  return {
    type: ActionTypes.TRIGGER_INITIAL_CLINIC_MIGRATION_SUCCESS,
    payload: {
      clinicId: clinicId,
    },
  };
}

export function triggerInitialClinicMigrationFailure(error, apiError) {
  return {
    type: ActionTypes.TRIGGER_INITIAL_CLINIC_MIGRATION_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function sendPatientUploadReminderRequest() {
  return {
    type: ActionTypes.SEND_PATIENT_UPLOAD_REMINDER_REQUEST,
  };
}

export function sendPatientUploadReminderSuccess(clinicId, patientId, lastUploadReminderTime) {
  return {
    type: ActionTypes.SEND_PATIENT_UPLOAD_REMINDER_SUCCESS,
    payload: {
      clinicId: clinicId,
      patientId: patientId,
      lastUploadReminderTime: lastUploadReminderTime,
    },
  };
}

export function sendPatientUploadReminderFailure(error, apiError) {
  return {
    type: ActionTypes.SEND_PATIENT_UPLOAD_REMINDER_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function sendPatientDexcomConnectRequestRequest() {
  return {
    type: ActionTypes.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_REQUEST,
  };
}

export function sendPatientDexcomConnectRequestSuccess(clinicId, patientId, lastRequestedDexcomConnectTime) {
  return {
    type: ActionTypes.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_SUCCESS,
    payload: {
      clinicId: clinicId,
      patientId: patientId,
      lastRequestedDexcomConnectTime: lastRequestedDexcomConnectTime,
    },
  };
}

export function sendPatientDexcomConnectRequestFailure(error, apiError) {
  return {
    type: ActionTypes.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function createClinicPatientTagRequest() {
  return {
    type: ActionTypes.CREATE_CLINIC_PATIENT_TAG_REQUEST,
  };
}

export function createClinicPatientTagSuccess(clinicId, patientTags) {
  return {
    type: ActionTypes.CREATE_CLINIC_PATIENT_TAG_SUCCESS,
    payload: {
      clinicId: clinicId,
      patientTags: patientTags,
    },
  };
}

export function createClinicPatientTagFailure(error, apiError) {
  return {
    type: ActionTypes.CREATE_CLINIC_PATIENT_TAG_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function updateClinicPatientTagRequest() {
  return {
    type: ActionTypes.UPDATE_CLINIC_PATIENT_TAG_REQUEST,
  };
}

export function updateClinicPatientTagSuccess(clinicId, patientTags) {
  return {
    type: ActionTypes.UPDATE_CLINIC_PATIENT_TAG_SUCCESS,
    payload: {
      clinicId: clinicId,
      patientTags: patientTags,
    },
  };
}

export function updateClinicPatientTagFailure(error, apiError) {
  return {
    type: ActionTypes.UPDATE_CLINIC_PATIENT_TAG_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function deleteClinicPatientTagRequest() {
  return {
    type: ActionTypes.DELETE_CLINIC_PATIENT_TAG_REQUEST,
  };
}

export function deleteClinicPatientTagSuccess(clinicId, patientTags) {
  return {
    type: ActionTypes.DELETE_CLINIC_PATIENT_TAG_SUCCESS,
    payload: {
      clinicId: clinicId,
      patientTags: patientTags,
    },
  };
}

export function deleteClinicPatientTagFailure(error, apiError) {
  return {
    type: ActionTypes.DELETE_CLINIC_PATIENT_TAG_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function keycloakReady(event, error, logoutUrl){
  return {
    type: ActionTypes.KEYCLOAK_READY,
    payload: { error, event, logoutUrl },
  };
}

export function keycloakInitError(event, error){
  return {
    type: ActionTypes.KEYCLOAK_INIT_ERROR,
    error: error,
    payload: { error, event },
  };
}

export function keycloakAuthSuccess(event, error) {
  return {
    type: ActionTypes.KEYCLOAK_AUTH_SUCCESS,
    payload: { error, event },
  };
}

export function keycloakAuthError(event, error){
  return {
    type: ActionTypes.KEYCLOAK_AUTH_ERROR,
    error: error,
    payload: { error, event },
  };
}

export function keycloakAuthRefreshSuccess(event, error) {
  return {
    type: ActionTypes.KEYCLOAK_AUTH_REFRESH_SUCCESS,
    payload: { event, error }
  };
}

export function keycloakAuthRefreshError(event, error) {
  return {
    type: ActionTypes.KEYCLOAK_AUTH_REFRESH_ERROR,
    error: error,
    payload: { error, event },
  };
}

export function keycloakTokenExpired(event, error) {
  return {
    type: ActionTypes.KEYCLOAK_TOKEN_EXPIRED,
    payload: { error, event },
  };
}

export function keycloakAuthLogout(event, error) {
  return {
    type: ActionTypes.KEYCLOAK_AUTH_LOGOUT,
    payload: { error, event },
  };
}

export function keycloakTokensReceived(tokens) {
  return {
    type: ActionTypes.KEYCLOAK_TOKENS_RECEIVED,
    payload: { tokens },
  };
}

export function fetchInfoRequest() {
  return {
    type: ActionTypes.FETCH_INFO_REQUEST,
  };
}

export function fetchInfoSuccess(info) {
  return {
    type: ActionTypes.FETCH_INFO_SUCCESS,
    payload: {
      info
    },
  };
}

export function fetchInfoFailure(error, apiError) {
  return {
    type: ActionTypes.FETCH_INFO_FAILURE,
    error: error,
    meta: {
      apiError: apiError || null,
    },
  };
}

export function generateAGPImagesRequest(data, opts, queries) {
  return {
    type: ActionTypes.GENERATE_AGP_IMAGES_REQUEST,
    payload: {
      data,
      opts,
      queries,
    },
  };
}

export function generateAGPImagesSuccess(images) {
  return {
    type: ActionTypes.GENERATE_AGP_IMAGES_SUCCESS,
    payload: { images },
  };
}

export function generateAGPImagesFailure(error) {
  return {
    type: ActionTypes.GENERATE_AGP_IMAGES_FAILURE,
    error,
  };
}

export function setSSOEnabledDisplay(value) {
  return {
    type: ActionTypes.SET_SSO_ENABLED_DISPLAY,
    payload: { value },
  };
}
