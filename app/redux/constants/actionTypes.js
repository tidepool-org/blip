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

/**
 * Syncronous action types
 */
export const SHOW_WELCOME_MESSAGE = 'SHOW_WELCOME_MESSAGE';
export const HIDE_WELCOME_MESSAGE = 'HIDE_WELCOME_MESSAGE';

export const SHOW_BANNER = 'SHOW_BANNER';
export const HIDE_BANNER = 'HIDE_BANNER';
export const DISMISS_BANNER = 'DISMISS_BANNER';

export const ACKNOWLEDGE_NOTIFICATION = 'ACKNOWLEDGE_NOTIFICATION';

// these two aren't being used yet!
export const SET_TIME_PREFERENCES = 'SET_TIME_PREFERENCES';
export const SET_BLOOD_GLUCOSE_PREFERENCES = 'SET_BLOOD_GLUCOSE_PREFERENCES';

export const CLEAR_PATIENT_IN_VIEW = 'CLEAR_PATIENT_IN_VIEW';
export const CLOSE_MESSAGE_THREAD = 'CLOSE_MESSAGE_THREAD';

export const ADD_PATIENT_NOTE = 'ADD_PATIENT_NOTE';
export const UPDATE_PATIENT_NOTE = 'UPDATE_PATIENT_NOTE';

export const SELECT_CLINIC_SUCCESS = 'SELECT_CLINIC_SUCCESS';

/*
 * Asyncronous action types
 */

// user.get
export const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

// invitation.getSent
export const FETCH_PENDING_SENT_INVITES_REQUEST = 'FETCH_PENDING_SENT_INVITES_REQUEST';
export const FETCH_PENDING_SENT_INVITES_SUCCESS = 'FETCH_PENDING_SENT_INVITES_SUCCESS';
export const FETCH_PENDING_SENT_INVITES_FAILURE = 'FETCH_PENDING_SENT_INVITES_FAILURE';

// invitation.getReceived
export const FETCH_PENDING_RECEIVED_INVITES_REQUEST = 'FETCH_PENDING_RECEIVED_INVITES_REQUEST';
export const FETCH_PENDING_RECEIVED_INVITES_SUCCESS = 'FETCH_PENDING_RECEIVED_INVITES_SUCCESS';
export const FETCH_PENDING_RECEIVED_INVITES_FAILURE = 'FETCH_PENDING_RECEIVED_INVITES_FAILURE';

// patient.getAll
export const FETCH_ASSOCIATED_ACCOUNTS_REQUEST = 'FETCH_ASSOCIATED_ACCOUNTS_REQUEST';
export const FETCH_ASSOCIATED_ACCOUNTS_SUCCESS = 'FETCH_ASSOCIATED_ACCOUNTS_SUCCESS';
export const FETCH_ASSOCIATED_ACCOUNTS_FAILURE = 'FETCH_ASSOCIATED_ACCOUNTS_FAILURE';

// patient.get and care team
export const FETCH_PATIENT_REQUEST = 'FETCH_PATIENT_REQUEST';
export const FETCH_PATIENT_SUCCESS = 'FETCH_PATIENT_SUCCESS';
export const FETCH_PATIENT_FAILURE = 'FETCH_PATIENT_FAILURE';

// metadata.preferences.get
export const FETCH_PREFERENCES_REQUEST = 'FETCH_PREFERENCES_REQUEST';
export const FETCH_PREFERENCES_SUCCESS = 'FETCH_PREFERENCES_SUCCESS';
export const FETCH_PREFERENCES_FAILURE = 'FETCH_PREFERENCES_FAILURE';

// metadata.settings.get
export const FETCH_SETTINGS_REQUEST = 'FETCH_SETTINGS_REQUEST';
export const FETCH_SETTINGS_SUCCESS = 'FETCH_SETTINGS_SUCCESS';
export const FETCH_SETTINGS_FAILURE = 'FETCH_SETTINGS_FAILURE';

// patientData.get
export const FETCH_PATIENT_DATA_REQUEST = 'FETCH_PATIENT_DATA_REQUEST';
export const FETCH_PATIENT_DATA_SUCCESS = 'FETCH_PATIENT_DATA_SUCCESS';
export const FETCH_PATIENT_DATA_FAILURE = 'FETCH_PATIENT_DATA_FAILURE';

// prescription.getAllForClinic
export const FETCH_CLINIC_PRESCRIPTIONS_REQUEST = 'FETCH_CLINIC_PRESCRIPTIONS_REQUEST';
export const FETCH_CLINIC_PRESCRIPTIONS_SUCCESS = 'FETCH_CLINIC_PRESCRIPTIONS_SUCCESS';
export const FETCH_CLINIC_PRESCRIPTIONS_FAILURE = 'FETCH_CLINIC_PRESCRIPTIONS_FAILURE';

// prescription.create
export const CREATE_PRESCRIPTION_REQUEST = 'CREATE_PRESCRIPTION_REQUEST';
export const CREATE_PRESCRIPTION_SUCCESS = 'CREATE_PRESCRIPTION_SUCCESS';
export const CREATE_PRESCRIPTION_FAILURE = 'CREATE_PRESCRIPTION_FAILURE';

// prescription.createRevision
export const CREATE_PRESCRIPTION_REVISION_REQUEST = 'CREATE_PRESCRIPTION_REVISION_REQUEST';
export const CREATE_PRESCRIPTION_REVISION_SUCCESS = 'CREATE_PRESCRIPTION_REVISION_SUCCESS';
export const CREATE_PRESCRIPTION_REVISION_FAILURE = 'CREATE_PRESCRIPTION_REVISION_FAILURE';

// prescription.delete
export const DELETE_PRESCRIPTION_REQUEST = 'DELETE_PRESCRIPTION_REQUEST';
export const DELETE_PRESCRIPTION_SUCCESS = 'DELETE_PRESCRIPTION_SUCCESS';
export const DELETE_PRESCRIPTION_FAILURE = 'DELETE_PRESCRIPTION_FAILURE';

// devices.getAll
export const FETCH_DEVICES_REQUEST = 'FETCH_DEVICES_REQUEST';
export const FETCH_DEVICES_SUCCESS = 'FETCH_DEVICES_SUCCESS';
export const FETCH_DEVICES_FAILURE = 'FETCH_DEVICES_FAILURE';

// team.getMessageThread
export const FETCH_MESSAGE_THREAD_REQUEST = 'FETCH_MESSAGE_THREAD_REQUEST';
export const FETCH_MESSAGE_THREAD_SUCCESS = 'FETCH_MESSAGE_THREAD_SUCCESS';
export const FETCH_MESSAGE_THREAD_FAILURE = 'FETCH_MESSAGE_THREAD_FAILURE';

// team.startMessageThread
export const CREATE_MESSAGE_THREAD_REQUEST = 'CREATE_MESSAGE_THREAD_REQUEST';
export const CREATE_MESSAGE_THREAD_SUCCESS = 'CREATE_MESSAGE_THREAD_SUCCESS';
export const CREATE_MESSAGE_THREAD_FAILURE = 'CREATE_MESSAGE_THREAD_FAILURE';

// team.editMessage
export const EDIT_MESSAGE_THREAD_REQUEST = 'EDIT_MESSAGE_THREAD_REQUEST';
export const EDIT_MESSAGE_THREAD_SUCCESS = 'EDIT_MESSAGE_THREAD_SUCCESS';
export const EDIT_MESSAGE_THREAD_FAILURE = 'EDIT_MESSAGE_THREAD_FAILURE';

// user.login
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

// user.logout
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

// user.signup
export const SIGNUP_REQUEST = 'SIGNUP_REQUEST';
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE';

// user.confirmSignup
export const CONFIRM_SIGNUP_REQUEST = 'CONFIRM_SIGNUP_REQUEST';
export const CONFIRM_SIGNUP_SUCCESS = 'CONFIRM_SIGNUP_SUCCESS';
export const CONFIRM_SIGNUP_FAILURE = 'CONFIRM_SIGNUP_FAILURE';

// user.custodialConfirmSignup
export const VERIFY_CUSTODIAL_REQUEST = 'VERIFY_CUSTODIAL_REQUEST';
export const VERIFY_CUSTODIAL_SUCCESS = 'VERIFY_CUSTODIAL_SUCCESS';
export const VERIFY_CUSTODIAL_FAILURE = 'VERIFY_CUSTODIAL_FAILURE';

// user.confirmPasswordReset
export const CONFIRM_PASSWORD_RESET_REQUEST = 'CONFIRM_PASSWORD_RESET_REQUEST';
export const CONFIRM_PASSWORD_RESET_SUCCESS = 'CONFIRM_PASSWORD_RESET_SUCCESS';
export const CONFIRM_PASSWORD_RESET_FAILURE = 'CONFIRM_PASSWORD_RESET_FAILURE';

// user.acceptTerms
export const ACCEPT_TERMS_REQUEST = 'ACCEPT_TERMS_REQUEST';
export const ACCEPT_TERMS_SUCCESS = 'ACCEPT_TERMS_SUCCESS';
export const ACCEPT_TERMS_FAILURE = 'ACCEPT_TERMS_FAILURE';

// user.resendEmailVerification
export const RESEND_EMAIL_VERIFICATION_REQUEST = 'RESEND_EMAIL_VERIFICATION_REQUEST';
export const RESEND_EMAIL_VERIFICATION_SUCCESS = 'RESEND_EMAIL_VERIFICATION_SUCCESS';
export const RESEND_EMAIL_VERIFICATION_FAILURE = 'RESEND_EMAIL_VERIFICATION_FAILURE';

// patient.post
export const SETUP_DATA_STORAGE_REQUEST = 'SETUP_DATA_STORAGE_REQUEST';
export const SETUP_DATA_STORAGE_SUCCESS = 'SETUP_DATA_STORAGE_SUCCESS';
export const SETUP_DATA_STORAGE_FAILURE = 'SETUP_DATA_STORAGE_FAILURE';

// access.leaveGroup
export const REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST = 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST';
export const REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS = 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS';
export const REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE = 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE';

// access.removeMember
export const REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST = 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST';
export const REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS = 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS';
export const REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE = 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE';

// user.requestPasswordReset
export const REQUEST_PASSWORD_RESET_REQUEST = 'REQUEST_PASSWORD_RESET_REQUEST';
export const REQUEST_PASSWORD_RESET_SUCCESS = 'REQUEST_PASSWORD_RESET_SUCCESS';
export const REQUEST_PASSWORD_RESET_FAILURE = 'REQUEST_PASSWORD_RESET_FAILURE';

// invitation.send
export const SEND_INVITE_REQUEST = 'SEND_INVITE_REQUEST';
export const SEND_INVITE_SUCCESS = 'SEND_INVITE_SUCCESS';
export const SEND_INVITE_FAILURE = 'SEND_INVITE_FAILURE';

// invitation.send
export const SEND_CLINIC_INVITE_REQUEST = 'SEND_CLINIC_INVITE_REQUEST';
export const SEND_CLINIC_INVITE_SUCCESS = 'SEND_CLINIC_INVITE_SUCCESS';
export const SEND_CLINIC_INVITE_FAILURE = 'SEND_CLINIC_INVITE_FAILURE';

// invitation.resend
export const RESEND_INVITE_REQUEST = 'RESEND_INVITE_REQUEST';
export const RESEND_INVITE_SUCCESS = 'RESEND_INVITE_SUCCESS';
export const RESEND_INVITE_FAILURE = 'RESEND_INVITE_FAILURE';

// invitation.cancel
export const CANCEL_SENT_INVITE_REQUEST = 'CANCEL_SENT_INVITE_REQUEST';
export const CANCEL_SENT_INVITE_SUCCESS = 'CANCEL_SENT_INVITE_SUCCESS';
export const CANCEL_SENT_INVITE_FAILURE = 'CANCEL_SENT_INVITE_FAILURE';

// invitation.accept
export const ACCEPT_RECEIVED_INVITE_REQUEST = 'ACCEPT_RECEIVED_INVITE_REQUEST';
export const ACCEPT_RECEIVED_INVITE_SUCCESS = 'ACCEPT_RECEIVED_INVITE_SUCCESS';
export const ACCEPT_RECEIVED_INVITE_FAILURE = 'ACCEPT_RECEIVED_INVITE_FAILURE';

// invitation.dismiss
export const REJECT_RECEIVED_INVITE_REQUEST = 'REJECT_RECEIVED_INVITE_REQUEST';
export const REJECT_RECEIVED_INVITE_SUCCESS = 'REJECT_RECEIVED_INVITE_SUCCESS';
export const REJECT_RECEIVED_INVITE_FAILURE = 'REJECT_RECEIVED_INVITE_FAILURE';

// access.setMemberPermissions
export const SET_MEMBER_PERMISSIONS_REQUEST = 'SET_MEMBER_PERMISSIONS_REQUEST';
export const SET_MEMBER_PERMISSIONS_SUCCESS = 'SET_MEMBER_PERMISSIONS_SUCCESS';
export const SET_MEMBER_PERMISSIONS_FAILURE = 'SET_MEMBER_PERMISSIONS_FAILURE';

// no api call in handler
export const UPDATE_PATIENT_DATA_REQUEST = 'UPDATE_PATIENT_DATA_REQUEST';
export const UPDATE_PATIENT_DATA_SUCCESS = 'UPDATE_PATIENT_DATA_SUCCESS';
export const UPDATE_PATIENT_DATA_FAILURE = 'UPDATE_PATIENT_DATA_FAILURE';

// patient.put
export const UPDATE_PATIENT_REQUEST = 'UPDATE_PATIENT_REQUEST';
export const UPDATE_PATIENT_SUCCESS = 'UPDATE_PATIENT_SUCCESS';
export const UPDATE_PATIENT_FAILURE = 'UPDATE_PATIENT_FAILURE';

// metadata.settings.put
export const UPDATE_PATIENT_BG_UNITS_REQUEST = 'UPDATE_PATIENT_BG_UNITS_REQUEST';
export const UPDATE_PATIENT_BG_UNITS_SUCCESS = 'UPDATE_PATIENT_BG_UNITS_SUCCESS';
export const UPDATE_PATIENT_BG_UNITS_FAILURE = 'UPDATE_PATIENT_BG_UNITS_FAILURE';

// metadata.preferences.put
export const UPDATE_PREFERENCES_REQUEST = 'UPDATE_PREFERENCES_REQUEST';
export const UPDATE_PREFERENCES_SUCCESS = 'UPDATE_PREFERENCES_SUCCESS';
export const UPDATE_PREFERENCES_FAILURE = 'UPDATE_PREFERENCES_FAILURE';

// metadata.settings.put
export const UPDATE_SETTINGS_REQUEST = 'UPDATE_SETTINGS_REQUEST';
export const UPDATE_SETTINGS_SUCCESS = 'UPDATE_SETTINGS_SUCCESS';
export const UPDATE_SETTINGS_FAILURE = 'UPDATE_SETTINGS_FAILURE';

// user.put
export const UPDATE_USER_REQUEST = 'UPDATE_USER_REQUEST';
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS';
export const UPDATE_USER_FAILURE = 'UPDATE_USER_FAILURE';

// log api arror
export const LOG_ERROR_REQUEST = 'LOG_ERROR_REQUEST';
export const LOG_ERROR_SUCCESS = 'LOG_ERROR_SUCCESS';
// no such thing as LOG_ERROR_FAILURE

export const UPDATE_DATA_DONATION_ACCOUNTS_REQUEST = 'UPDATE_DATA_DONATION_ACCOUNTS_REQUEST';
export const UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS = 'UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS';
export const UPDATE_DATA_DONATION_ACCOUNTS_FAILURE = 'UPDATE_DATA_DONATION_ACCOUNTS_FAILURE';

// data sources
export const FETCH_DATA_SOURCES_REQUEST = 'FETCH_DATA_SOURCES_REQUEST';
export const FETCH_DATA_SOURCES_SUCCESS = 'FETCH_DATA_SOURCES_SUCCESS';
export const FETCH_DATA_SOURCES_FAILURE = 'FETCH_DATA_SOURCES_FAILURE';

export const CONNECT_DATA_SOURCE_REQUEST = 'CONNECT_DATA_SOURCE_REQUEST';
export const CONNECT_DATA_SOURCE_SUCCESS = 'CONNECT_DATA_SOURCE_SUCCESS';
export const CONNECT_DATA_SOURCE_FAILURE = 'CONNECT_DATA_SOURCE_FAILURE';

export const DISCONNECT_DATA_SOURCE_REQUEST = 'DISCONNECT_DATA_SOURCE_REQUEST';
export const DISCONNECT_DATA_SOURCE_SUCCESS = 'DISCONNECT_DATA_SOURCE_SUCCESS';
export const DISCONNECT_DATA_SOURCE_FAILURE = 'DISCONNECT_DATA_SOURCE_FAILURE';

// server time
export const FETCH_SERVER_TIME_REQUEST = 'FETCH_SERVER_TIME_REQUEST';
export const FETCH_SERVER_TIME_SUCCESS = 'FETCH_SERVER_TIME_SUCCESS';
export const FETCH_SERVER_TIME_FAILURE = 'FETCH_SERVER_TIME_FAILURE';

/**
 * Web Worker action types
 */

// pdf generation
export const GENERATE_PDF_REQUEST = 'GENERATE_PDF_REQUEST';
export const GENERATE_PDF_SUCCESS = 'GENERATE_PDF_SUCCESS';
export const GENERATE_PDF_FAILURE = 'GENERATE_PDF_FAILURE';

export const REMOVE_GENERATED_PDFS = 'REMOVE_GENERATED_PDFS';

export const GENERATE_AGP_IMAGES_REQUEST = 'GENERATE_AGP_IMAGES_REQUEST';
export const GENERATE_AGP_IMAGES_SUCCESS = 'GENERATE_AGP_IMAGES_SUCCESS';
export const GENERATE_AGP_IMAGES_FAILURE = 'GENERATE_AGP_IMAGES_FAILURE';

// data worker
export const DATA_WORKER_ADD_DATA_REQUEST = 'DATA_WORKER_ADD_DATA_REQUEST';
export const DATA_WORKER_ADD_DATA_SUCCESS = 'DATA_WORKER_ADD_DATA_SUCCESS';
export const DATA_WORKER_ADD_DATA_FAILURE = 'DATA_WORKER_ADD_DATA_FAILURE';

export const DATA_WORKER_REMOVE_DATA_REQUEST = 'DATA_WORKER_REMOVE_DATA_REQUEST';
export const DATA_WORKER_REMOVE_DATA_SUCCESS = 'DATA_WORKER_REMOVE_DATA_SUCCESS';
export const DATA_WORKER_REMOVE_DATA_FAILURE = 'DATA_WORKER_REMOVE_DATA_FAILURE';

export const DATA_WORKER_UPDATE_DATUM_REQUEST = 'DATA_WORKER_UPDATE_DATUM_REQUEST';
export const DATA_WORKER_UPDATE_DATUM_SUCCESS = 'DATA_WORKER_UPDATE_DATUM_SUCCESS';
export const DATA_WORKER_UPDATE_DATUM_FAILURE = 'DATA_WORKER_UPDATE_DATUM_FAILURE';

export const DATA_WORKER_QUERY_DATA_REQUEST = 'DATA_WORKER_QUERY_DATA_REQUEST';
export const DATA_WORKER_QUERY_DATA_SUCCESS = 'DATA_WORKER_QUERY_DATA_SUCCESS';
export const DATA_WORKER_QUERY_DATA_FAILURE = 'DATA_WORKER_QUERY_DATA_FAILURE';

// clinics
// clinics.getAll
export const GET_CLINICS_REQUEST = 'GET_CLINICS_REQUEST';
export const GET_CLINICS_SUCCESS = 'GET_CLINICS_SUCCESS';
export const GET_CLINICS_FAILURE = 'GET_CLINICS_FAILURE';

// clinics.create
export const CREATE_CLINIC_REQUEST = 'CREATE_CLINIC_REQUEST';
export const CREATE_CLINIC_SUCCESS = 'CREATE_CLINIC_SUCCESS';
export const CREATE_CLINIC_FAILURE = 'CREATE_CLINIC_FAILURE';

// clinics.get
export const FETCH_CLINIC_REQUEST = 'FETCH_CLINIC_REQUEST';
export const FETCH_CLINIC_SUCCESS = 'FETCH_CLINIC_SUCCESS';
export const FETCH_CLINIC_FAILURE = 'FETCH_CLINIC_FAILURE';

// clinics.get
export const FETCH_CLINICS_BY_IDS_REQUEST = 'FETCH_CLINICS_BY_IDS_REQUEST';
export const FETCH_CLINICS_BY_IDS_SUCCESS = 'FETCH_CLINICS_BY_IDS_SUCCESS';
export const FETCH_CLINICS_BY_IDS_FAILURE = 'FETCH_CLINICS_BY_IDS_FAILURE';

// clinics.update
export const UPDATE_CLINIC_REQUEST = 'UPDATE_CLINIC_REQUEST';
export const UPDATE_CLINIC_SUCCESS = 'UPDATE_CLINIC_SUCCESS';
export const UPDATE_CLINIC_FAILURE = 'UPDATE_CLINIC_FAILURE';

// clinics.getCliniciansFromClinic
export const FETCH_CLINICIANS_FROM_CLINIC_REQUEST = 'FETCH_CLINICIANS_FROM_CLINIC_REQUEST';
export const FETCH_CLINICIANS_FROM_CLINIC_SUCCESS = 'FETCH_CLINICIANS_FROM_CLINIC_SUCCESS';
export const FETCH_CLINICIANS_FROM_CLINIC_FAILURE = 'FETCH_CLINICIANS_FROM_CLINIC_FAILURE';

// clinics.getClinician
export const FETCH_CLINICIAN_REQUEST = 'FETCH_CLINICIAN_REQUEST';
export const FETCH_CLINICIAN_SUCCESS = 'FETCH_CLINICIAN_SUCCESS';
export const FETCH_CLINICIAN_FAILURE = 'FETCH_CLINICIAN_FAILURE';

// clinics.updateClinician
export const UPDATE_CLINICIAN_REQUEST = 'UPDATE_CLINICIAN_REQUEST';
export const UPDATE_CLINICIAN_SUCCESS = 'UPDATE_CLINICIAN_SUCCESS';
export const UPDATE_CLINICIAN_FAILURE = 'UPDATE_CLINICIAN_FAILURE';

// clinics.deleteClinicianFromClinic
export const DELETE_CLINICIAN_FROM_CLINIC_REQUEST = 'DELETE_CLINICIAN_FROM_CLINIC_REQUEST';
export const DELETE_CLINICIAN_FROM_CLINIC_SUCCESS = 'DELETE_CLINICIAN_FROM_CLINIC_SUCCESS';
export const DELETE_CLINICIAN_FROM_CLINIC_FAILURE = 'DELETE_CLINICIAN_FROM_CLINIC_FAILURE';

// clinics.deletePatientFromClinic
export const DELETE_PATIENT_FROM_CLINIC_REQUEST = 'DELETE_PATIENT_FROM_CLINIC_REQUEST';
export const DELETE_PATIENT_FROM_CLINIC_SUCCESS = 'DELETE_PATIENT_FROM_CLINIC_SUCCESS';
export const DELETE_PATIENT_FROM_CLINIC_FAILURE = 'DELETE_PATIENT_FROM_CLINIC_FAILURE';

// clinics.getPatientsForClinic
export const FETCH_PATIENTS_FOR_CLINIC_REQUEST = 'FETCH_PATIENTS_FOR_CLINIC_REQUEST';
export const FETCH_PATIENTS_FOR_CLINIC_SUCCESS = 'FETCH_PATIENTS_FOR_CLINIC_SUCCESS';
export const FETCH_PATIENTS_FOR_CLINIC_FAILURE = 'FETCH_PATIENTS_FOR_CLINIC_FAILURE';

// clinics.getPatientFromClinic
export const FETCH_PATIENT_FROM_CLINIC_REQUEST = 'FETCH_PATIENT_FROM_CLINIC_REQUEST';
export const FETCH_PATIENT_FROM_CLINIC_SUCCESS = 'FETCH_PATIENT_FROM_CLINIC_SUCCESS';
export const FETCH_PATIENT_FROM_CLINIC_FAILURE = 'FETCH_PATIENT_FROM_CLINIC_FAILURE';

// clinics.createClinicCustodialAccount
export const CREATE_CLINIC_CUSTODIAL_ACCOUNT_REQUEST = 'CREATE_CLINIC_CUSTODIAL_ACCOUNT_REQUEST';
export const CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS = 'CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS';
export const CREATE_CLINIC_CUSTODIAL_ACCOUNT_FAILURE = 'CREATE_CLINIC_CUSTODIAL_ACCOUNT_FAILURE';

// clinics.createVCACustodialAccount
export const CREATE_VCA_CUSTODIAL_ACCOUNT_REQUEST = 'CREATE_VCA_CUSTODIAL_ACCOUNT_REQUEST';
export const CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS = 'CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS';
export const CREATE_VCA_CUSTODIAL_ACCOUNT_FAILURE = 'CREATE_VCA_CUSTODIAL_ACCOUNT_FAILURE';

// clinics.updateClinicPatient
export const UPDATE_CLINIC_PATIENT_REQUEST = 'UPDATE_CLINIC_PATIENT_REQUEST';
export const UPDATE_CLINIC_PATIENT_SUCCESS = 'UPDATE_CLINIC_PATIENT_SUCCESS';
export const UPDATE_CLINIC_PATIENT_FAILURE = 'UPDATE_CLINIC_PATIENT_FAILURE';

// clinics.inviteClinician
export const SEND_CLINICIAN_INVITE_REQUEST = 'SEND_CLINICIAN_INVITE_REQUEST';
export const SEND_CLINICIAN_INVITE_SUCCESS = 'SEND_CLINICIAN_INVITE_SUCCESS';
export const SEND_CLINICIAN_INVITE_FAILURE = 'SEND_CLINICIAN_INVITE_FAILURE';

// clinics.getClinicianInvite
export const FETCH_CLINICIAN_INVITE_REQUEST = 'FETCH_CLINICIAN_INVITE_REQUEST';
export const FETCH_CLINICIAN_INVITE_SUCCESS = 'FETCH_CLINICIAN_INVITE_SUCCESS';
export const FETCH_CLINICIAN_INVITE_FAILURE = 'FETCH_CLINICIAN_INVITE_FAILURE';

// clinics.resendClinicianInvite
export const RESEND_CLINICIAN_INVITE_REQUEST = 'RESEND_CLINICIAN_INVITE_REQUEST';
export const RESEND_CLINICIAN_INVITE_SUCCESS = 'RESEND_CLINICIAN_INVITE_SUCCESS';
export const RESEND_CLINICIAN_INVITE_FAILURE = 'RESEND_CLINICIAN_INVITE_FAILURE';

// clinics.deleteClinicianInvite
export const DELETE_CLINICIAN_INVITE_REQUEST = 'DELETE_CLINICIAN_INVITE_REQUEST';
export const DELETE_CLINICIAN_INVITE_SUCCESS = 'DELETE_CLINICIAN_INVITE_SUCCESS';
export const DELETE_CLINICIAN_INVITE_FAILURE = 'DELETE_CLINICIAN_INVITE_FAILURE';

// clinics.getPatientInvites
export const FETCH_PATIENT_INVITES_REQUEST = 'FETCH_PATIENT_INVITES_REQUEST';
export const FETCH_PATIENT_INVITES_SUCCESS = 'FETCH_PATIENT_INVITES_SUCCESS';
export const FETCH_PATIENT_INVITES_FAILURE = 'FETCH_PATIENT_INVITES_FAILURE';

// clinics.acceptPatientInvitation
export const ACCEPT_PATIENT_INVITATION_REQUEST = 'ACCEPT_PATIENT_INVITATION_REQUEST';
export const ACCEPT_PATIENT_INVITATION_SUCCESS = 'ACCEPT_PATIENT_INVITATION_SUCCESS';
export const ACCEPT_PATIENT_INVITATION_FAILURE = 'ACCEPT_PATIENT_INVITATION_FAILURE';

// clinics.deletePatientInvitation
export const DELETE_PATIENT_INVITATION_REQUEST = 'DELETE_PATIENT_INVITATION_REQUEST';
export const DELETE_PATIENT_INVITATION_SUCCESS = 'DELETE_PATIENT_INVITATION_SUCCESS';
export const DELETE_PATIENT_INVITATION_FAILURE = 'DELETE_PATIENT_INVITATION_FAILURE';

// clinics.updatePatientPermissions
export const UPDATE_PATIENT_PERMISSIONS_REQUEST = 'UPDATE_PATIENT_PERMISSIONS_REQUEST';
export const UPDATE_PATIENT_PERMISSIONS_SUCCESS = 'UPDATE_PATIENT_PERMISSIONS_SUCCESS';
export const UPDATE_PATIENT_PERMISSIONS_FAILURE = 'UPDATE_PATIENT_PERMISSIONS_FAILURE';

// clinics.getMRNSettings
export const FETCH_CLINIC_MRN_SETTINGS_REQUEST = 'FETCH_CLINIC_MRN_SETTINGS_REQUEST';
export const FETCH_CLINIC_MRN_SETTINGS_SUCCESS = 'FETCH_CLINIC_MRN_SETTINGS_SUCCESS';
export const FETCH_CLINIC_MRN_SETTINGS_FAILURE = 'FETCH_CLINIC_MRN_SETTINGS_FAILURE';

// clinics.getEHRSettings
export const FETCH_CLINIC_EHR_SETTINGS_REQUEST = 'FETCH_CLINIC_EHR_SETTINGS_REQUEST';
export const FETCH_CLINIC_EHR_SETTINGS_SUCCESS = 'FETCH_CLINIC_EHR_SETTINGS_SUCCESS';
export const FETCH_CLINIC_EHR_SETTINGS_FAILURE = 'FETCH_CLINIC_EHR_SETTINGS_FAILURE';

// clinics.getClinicsForPatient
export const FETCH_CLINICS_FOR_PATIENT_REQUEST = 'FETCH_CLINICS_FOR_PATIENT_REQUEST';
export const FETCH_CLINICS_FOR_PATIENT_SUCCESS = 'FETCH_CLINICS_FOR_PATIENT_SUCCESS';
export const FETCH_CLINICS_FOR_PATIENT_FAILURE = 'FETCH_CLINICS_FOR_PATIENT_FAILURE';

// clinics.getClinicianInvites
export const FETCH_CLINICIAN_INVITES_REQUEST = 'FETCH_CLINICIAN_INVITES_REQUEST';
export const FETCH_CLINICIAN_INVITES_SUCCESS = 'FETCH_CLINICIAN_INVITES_SUCCESS';
export const FETCH_CLINICIAN_INVITES_FAILURE = 'FETCH_CLINICIAN_INVITES_FAILURE';

// clinics.acceptClinicianInvite
export const ACCEPT_CLINICIAN_INVITE_REQUEST = 'ACCEPT_CLINICIAN_INVITE_REQUEST';
export const ACCEPT_CLINICIAN_INVITE_SUCCESS = 'ACCEPT_CLINICIAN_INVITE_SUCCESS';
export const ACCEPT_CLINICIAN_INVITE_FAILURE = 'ACCEPT_CLINICIAN_INVITE_FAILURE';

// clinics.dismissClinicianInvite
export const DISMISS_CLINICIAN_INVITE_REQUEST = 'DISMISS_CLINICIAN_INVITE_REQUEST';
export const DISMISS_CLINICIAN_INVITE_SUCCESS = 'DISMISS_CLINICIAN_INVITE_SUCCESS';
export const DISMISS_CLINICIAN_INVITE_FAILURE = 'DISMISS_CLINICIAN_INVITE_FAILURE';

// clinics.getClinicsForClinician
export const GET_CLINICS_FOR_CLINICIAN_REQUEST = 'GET_CLINICS_FOR_CLINICIAN_REQUEST';
export const GET_CLINICS_FOR_CLINICIAN_SUCCESS = 'GET_CLINICS_FOR_CLINICIAN_SUCCESS';
export const GET_CLINICS_FOR_CLINICIAN_FAILURE = 'GET_CLINICS_FOR_CLINICIAN_FAILURE';

// clinics.triggerInitialClinicMigration
export const TRIGGER_INITIAL_CLINIC_MIGRATION_REQUEST = 'TRIGGER_INITIAL_CLINIC_MIGRATION_REQUEST';
export const TRIGGER_INITIAL_CLINIC_MIGRATION_SUCCESS = 'TRIGGER_INITIAL_CLINIC_MIGRATION_SUCCESS';
export const TRIGGER_INITIAL_CLINIC_MIGRATION_FAILURE = 'TRIGGER_INITIAL_CLINIC_MIGRATION_FAILURE';

// clinics.sendPatientUploadReminder
export const SEND_PATIENT_UPLOAD_REMINDER_REQUEST = 'SEND_PATIENT_UPLOAD_REMINDER_REQUEST';
export const SEND_PATIENT_UPLOAD_REMINDER_SUCCESS = 'SEND_PATIENT_UPLOAD_REMINDER_SUCCESS';
export const SEND_PATIENT_UPLOAD_REMINDER_FAILURE = 'SEND_PATIENT_UPLOAD_REMINDER_FAILURE';

// clinics.sendPatientDexcomConnectRequest
export const SEND_PATIENT_DEXCOM_CONNECT_REQUEST_REQUEST = 'SEND_PATIENT_DEXCOM_CONNECT_REQUEST_REQUEST';
export const SEND_PATIENT_DEXCOM_CONNECT_REQUEST_SUCCESS = 'SEND_PATIENT_DEXCOM_CONNECT_REQUEST_SUCCESS';
export const SEND_PATIENT_DEXCOM_CONNECT_REQUEST_FAILURE = 'SEND_PATIENT_DEXCOM_CONNECT_REQUEST_FAILURE';

// clinics.createClinicPatientTag
export const CREATE_CLINIC_PATIENT_TAG_REQUEST = 'CREATE_CLINIC_PATIENT_TAG_REQUEST';
export const CREATE_CLINIC_PATIENT_TAG_SUCCESS = 'CREATE_CLINIC_PATIENT_TAG_SUCCESS';
export const CREATE_CLINIC_PATIENT_TAG_FAILURE = 'CREATE_CLINIC_PATIENT_TAG_FAILURE';

// clinics.updateClinicPatientTag
export const UPDATE_CLINIC_PATIENT_TAG_REQUEST = 'UPDATE_CLINIC_PATIENT_TAG_REQUEST';
export const UPDATE_CLINIC_PATIENT_TAG_SUCCESS = 'UPDATE_CLINIC_PATIENT_TAG_SUCCESS';
export const UPDATE_CLINIC_PATIENT_TAG_FAILURE = 'UPDATE_CLINIC_PATIENT_TAG_FAILURE';

// clinics.deleteClinicPatientTag
export const DELETE_CLINIC_PATIENT_TAG_REQUEST = 'DELETE_CLINIC_PATIENT_TAG_REQUEST';
export const DELETE_CLINIC_PATIENT_TAG_SUCCESS = 'DELETE_CLINIC_PATIENT_TAG_SUCCESS';
export const DELETE_CLINIC_PATIENT_TAG_FAILURE = 'DELETE_CLINIC_PATIENT_TAG_FAILURE';

// keycloak
export const KEYCLOAK_READY = 'KEYCLOAK_READY';
export const KEYCLOAK_INIT_ERROR = 'KEYCLOAK_INIT_ERROR';
export const KEYCLOAK_AUTH_SUCCESS = 'KEYCLOAK_AUTH_SUCCESS';
export const KEYCLOAK_AUTH_ERROR = 'KEYCLOAK_AUTH_ERROR';
export const KEYCLOAK_AUTH_REFRESH_SUCCESS = 'KEYCLOAK_AUTH_REFRESH_SUCCESS';
export const KEYCLOAK_AUTH_REFRESH_ERROR = 'KEYCLOAK_AUTH_REFRESH_ERROR';
export const KEYCLOAK_TOKEN_EXPIRED = 'KEYCLOAK_TOKEN_EXPIRED';
export const KEYCLOAK_AUTH_LOGOUT = 'KEYCLOAK_AUTH_LOGOUT';
export const KEYCLOAK_TOKENS_RECEIVED = 'KEYCLOAK_TOKENS_RECEIVED';

export const FETCH_INFO_SUCCESS = 'FETCH_INFO_SUCCESS';
export const FETCH_INFO_REQUEST = 'FETCH_INFO_REQUEST';
export const FETCH_INFO_FAILURE = 'FETCH_INFO_FAILURE';

export const FETCH_TIDE_DASHBOARD_PATIENTS_SUCCESS = 'FETCH_TIDE_DASHBOARD_PATIENTS_SUCCESS';
export const FETCH_TIDE_DASHBOARD_PATIENTS_REQUEST = 'FETCH_TIDE_DASHBOARD_PATIENTS_REQUEST';
export const FETCH_TIDE_DASHBOARD_PATIENTS_FAILURE = 'FETCH_TIDE_DASHBOARD_PATIENTS_FAILURE';
export const CLEAR_TIDE_DASHBOARD_PATIENTS = 'CLEAR_TIDE_DASHBOARD_PATIENTS';

export const SET_SSO_ENABLED_DISPLAY = 'SET_SSO_ENABLED_DISPLAY';

export const FETCH_CLINIC_PATIENT_COUNT_REQUEST = 'FETCH_CLINIC_PATIENT_COUNT_REQUEST';
export const FETCH_CLINIC_PATIENT_COUNT_SUCCESS = 'FETCH_CLINIC_PATIENT_COUNT_SUCCESS';
export const FETCH_CLINIC_PATIENT_COUNT_FAILURE = 'FETCH_CLINIC_PATIENT_COUNT_FAILURE';

export const FETCH_CLINIC_PATIENT_COUNT_SETTINGS_REQUEST = 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_REQUEST';
export const FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS = 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS';
export const FETCH_CLINIC_PATIENT_COUNT_SETTINGS_FAILURE = 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_FAILURE';
