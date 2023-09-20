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
import update from 'immutability-helper';

import * as types from '../constants/actionTypes';
import actionWorkingMap from '../constants/actionWorkingMap';

import initialState from './initialState';
const { working: initialWorkingState } = initialState;

export default (state = initialWorkingState, action) => {
  let key;
  switch (action.type) {
    case types.ACKNOWLEDGE_NOTIFICATION:
      if (action.payload.acknowledgedNotification) {
        return update(state, {
          [action.payload.acknowledgedNotification]: {
            notification: { $set: null }
          }
        });
      } else {
        return initialWorkingState;
      }

    /**
     * Request handling
     *  - All working state objects have a similar structure and are updated
     *  in a consistent manner
     */
    case types.FETCH_USER_REQUEST:
    case types.FETCH_PENDING_SENT_INVITES_REQUEST:
    case types.FETCH_PENDING_RECEIVED_INVITES_REQUEST:
    case types.FETCH_ASSOCIATED_ACCOUNTS_REQUEST:
    case types.FETCH_PATIENT_REQUEST:
    case types.FETCH_PATIENT_DATA_REQUEST:
    case types.FETCH_CLINIC_PRESCRIPTIONS_REQUEST:
    case types.CREATE_PRESCRIPTION_REQUEST:
    case types.CREATE_PRESCRIPTION_REVISION_REQUEST:
    case types.DELETE_PRESCRIPTION_REQUEST:
    case types.FETCH_DEVICES_REQUEST:
    case types.FETCH_MESSAGE_THREAD_REQUEST:
    case types.CREATE_MESSAGE_THREAD_REQUEST:
    case types.EDIT_MESSAGE_THREAD_REQUEST:
    case types.LOGIN_REQUEST:
    case types.LOGOUT_REQUEST:
    case types.SIGNUP_REQUEST:
    case types.CONFIRM_SIGNUP_REQUEST:
    case types.CONFIRM_PASSWORD_RESET_REQUEST:
    case types.ACCEPT_TERMS_REQUEST:
    case types.RESEND_EMAIL_VERIFICATION_REQUEST:
    case types.SETUP_DATA_STORAGE_REQUEST:
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST:
    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST:
    case types.REQUEST_PASSWORD_RESET_REQUEST:
    case types.SEND_INVITE_REQUEST:
    case types.SEND_CLINIC_INVITE_REQUEST:
    case types.RESEND_INVITE_REQUEST:
    case types.CANCEL_SENT_INVITE_REQUEST:
    case types.ACCEPT_RECEIVED_INVITE_REQUEST:
    case types.REJECT_RECEIVED_INVITE_REQUEST:
    case types.SET_MEMBER_PERMISSIONS_REQUEST:
    case types.UPDATE_PATIENT_REQUEST:
    case types.UPDATE_PATIENT_BG_UNITS_REQUEST:
    case types.UPDATE_USER_REQUEST:
    case types.VERIFY_CUSTODIAL_REQUEST:
    case types.GENERATE_PDF_REQUEST:
    case types.DATA_WORKER_ADD_DATA_REQUEST:
    case types.DATA_WORKER_REMOVE_DATA_REQUEST:
    case types.DATA_WORKER_UPDATE_DATUM_REQUEST:
    case types.DATA_WORKER_QUERY_DATA_REQUEST:
    case types.UPDATE_DATA_DONATION_ACCOUNTS_REQUEST:
    case types.FETCH_DATA_SOURCES_REQUEST:
    case types.FETCH_SERVER_TIME_REQUEST:
    case types.CONNECT_DATA_SOURCE_REQUEST:
    case types.DISCONNECT_DATA_SOURCE_REQUEST:
    case types.GET_CLINICS_REQUEST:
    case types.CREATE_CLINIC_REQUEST:
    case types.FETCH_CLINIC_REQUEST:
    case types.FETCH_CLINICS_BY_IDS_REQUEST:
    case types.UPDATE_CLINIC_REQUEST:
    case types.FETCH_CLINICIANS_FROM_CLINIC_REQUEST:
    case types.FETCH_CLINICIAN_REQUEST:
    case types.UPDATE_CLINICIAN_REQUEST:
    case types.DELETE_CLINICIAN_FROM_CLINIC_REQUEST:
    case types.DELETE_PATIENT_FROM_CLINIC_REQUEST:
    case types.FETCH_PATIENTS_FOR_CLINIC_REQUEST:
    case types.FETCH_PATIENT_FROM_CLINIC_REQUEST:
    case types.CREATE_CLINIC_CUSTODIAL_ACCOUNT_REQUEST:
    case types.CREATE_VCA_CUSTODIAL_ACCOUNT_REQUEST:
    case types.UPDATE_CLINIC_PATIENT_REQUEST:
    case types.SEND_CLINICIAN_INVITE_REQUEST:
    case types.FETCH_CLINICIAN_INVITE_REQUEST:
    case types.RESEND_CLINICIAN_INVITE_REQUEST:
    case types.DELETE_CLINICIAN_INVITE_REQUEST:
    case types.FETCH_PATIENT_INVITES_REQUEST:
    case types.ACCEPT_PATIENT_INVITATION_REQUEST:
    case types.DELETE_PATIENT_INVITATION_REQUEST:
    case types.UPDATE_PATIENT_PERMISSIONS_REQUEST:
    case types.FETCH_CLINIC_MRN_SETTINGS_REQUEST:
    case types.FETCH_CLINIC_EHR_SETTINGS_REQUEST:
    case types.FETCH_CLINICS_FOR_PATIENT_REQUEST:
    case types.FETCH_CLINICIAN_INVITES_REQUEST:
    case types.ACCEPT_CLINICIAN_INVITE_REQUEST:
    case types.DISMISS_CLINICIAN_INVITE_REQUEST:
    case types.GET_CLINICS_FOR_CLINICIAN_REQUEST:
    case types.TRIGGER_INITIAL_CLINIC_MIGRATION_REQUEST:
    case types.SEND_PATIENT_UPLOAD_REMINDER_REQUEST:
    case types.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_REQUEST:
    case types.CREATE_CLINIC_PATIENT_TAG_REQUEST:
    case types.UPDATE_CLINIC_PATIENT_TAG_REQUEST:
    case types.DELETE_CLINIC_PATIENT_TAG_REQUEST:
    case types.FETCH_INFO_REQUEST:
      key = actionWorkingMap(action.type);
      if (key) {
        if (action.type === types.FETCH_PATIENT_DATA_REQUEST) {
          return update(state, {
            [key]: {
              $set: {
                inProgress: true,
                notification: null,
                completed: state[key].completed,
                patientId: _.get(action, ['payload', 'patientId'], null),
              }
            }
          });
        } else if (action.type === types.DELETE_PRESCRIPTION_REQUEST) {
          return update(state, {
            [key]: {
              $set: {
                inProgress: true,
                notification: null,
                completed: null, // For these types we don't persist the completed state
                prescriptionId: _.get(action, ['payload', 'prescriptionId']),
              }
            }
          });
        } else if (_.includes([
          types.CREATE_PRESCRIPTION_REQUEST,
          types.CREATE_PRESCRIPTION_REVISION_REQUEST,
          types.UPDATE_CLINICIAN_REQUEST,
          types.DELETE_CLINICIAN_FROM_CLINIC_REQUEST,
          types.DELETE_PATIENT_FROM_CLINIC_REQUEST,
          types.FETCH_PATIENTS_FOR_CLINIC_REQUEST,
          types.SEND_CLINICIAN_INVITE_REQUEST,
          types.FETCH_CLINICIAN_INVITE_REQUEST,
          types.SEND_INVITE_REQUEST,
          types.SEND_CLINIC_INVITE_REQUEST,
          types.RESEND_INVITE_REQUEST,
          types.DELETE_CLINICIAN_INVITE_REQUEST,
          types.ACCEPT_PATIENT_INVITATION_REQUEST,
          types.DELETE_PATIENT_INVITATION_REQUEST,
          types.ACCEPT_CLINICIAN_INVITE_REQUEST,
          types.DISMISS_CLINICIAN_INVITE_REQUEST,
          types.SET_MEMBER_PERMISSIONS_REQUEST,
          types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST,
          types.CREATE_CLINIC_CUSTODIAL_ACCOUNT_REQUEST,
          types.CREATE_VCA_CUSTODIAL_ACCOUNT_REQUEST,
          types.SEND_PATIENT_UPLOAD_REMINDER_REQUEST,
          types.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_REQUEST,
          types.DATA_WORKER_REMOVE_DATA_REQUEST,
          types.CREATE_CLINIC_PATIENT_TAG_REQUEST,
          types.UPDATE_CLINIC_PATIENT_TAG_REQUEST,
          types.DELETE_CLINIC_PATIENT_TAG_REQUEST,
        ], action.type)) {
          return update(state, {
            [key]: {
              $set: {
                inProgress: true,
                notification: null,
                completed: null, // For these types we don't persist the completed state
                prescriptionId: _.get(action, ['payload', 'prescription', 'id']),
              }
            }
          });
        } else {
          return update(state, {
            [key]: {
              $set: {
                inProgress: true,
                notification: null,
                completed: state[key].completed,
              }
            }
          });
        }
      } else {
        return state;
      }

    /**
     * Success handling
     *  - All working state objects have a similar structure and are updated
     *  in a consistent manner
     */
    case types.FETCH_USER_SUCCESS:
    case types.FETCH_PENDING_SENT_INVITES_SUCCESS:
    case types.FETCH_PENDING_RECEIVED_INVITES_SUCCESS:
    case types.FETCH_ASSOCIATED_ACCOUNTS_SUCCESS:
    case types.FETCH_PATIENT_SUCCESS:
    case types.FETCH_PATIENT_DATA_SUCCESS:
    case types.FETCH_CLINIC_PRESCRIPTIONS_SUCCESS:
    case types.CREATE_PRESCRIPTION_SUCCESS:
    case types.CREATE_PRESCRIPTION_REVISION_SUCCESS:
    case types.DELETE_PRESCRIPTION_SUCCESS:
    case types.FETCH_DEVICES_SUCCESS:
    case types.FETCH_MESSAGE_THREAD_SUCCESS:
    case types.CREATE_MESSAGE_THREAD_SUCCESS:
    case types.EDIT_MESSAGE_THREAD_SUCCESS:
    case types.LOGIN_SUCCESS:
    case types.LOGOUT_SUCCESS:
    case types.SIGNUP_SUCCESS:
    case types.CONFIRM_SIGNUP_SUCCESS:
    case types.CONFIRM_PASSWORD_RESET_SUCCESS:
    case types.ACCEPT_TERMS_SUCCESS:
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
    case types.SETUP_DATA_STORAGE_SUCCESS:
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS:
    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS:
    case types.REQUEST_PASSWORD_RESET_SUCCESS:
    case types.SEND_INVITE_SUCCESS:
    case types.SEND_CLINIC_INVITE_SUCCESS:
    case types.RESEND_INVITE_SUCCESS:
    case types.CANCEL_SENT_INVITE_SUCCESS:
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
    case types.REJECT_RECEIVED_INVITE_SUCCESS:
    case types.SET_MEMBER_PERMISSIONS_SUCCESS:
    case types.UPDATE_PATIENT_SUCCESS:
    case types.UPDATE_PATIENT_BG_UNITS_SUCCESS:
    case types.UPDATE_USER_SUCCESS:
    case types.VERIFY_CUSTODIAL_SUCCESS:
    case types.GENERATE_PDF_SUCCESS:
    case types.REMOVE_GENERATED_PDFS:
    case types.DATA_WORKER_ADD_DATA_SUCCESS:
    case types.DATA_WORKER_REMOVE_DATA_SUCCESS:
    case types.DATA_WORKER_UPDATE_DATUM_SUCCESS:
    case types.DATA_WORKER_QUERY_DATA_SUCCESS:
    case types.UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS:
    case types.FETCH_DATA_SOURCES_SUCCESS:
    case types.FETCH_SERVER_TIME_SUCCESS:
    case types.CONNECT_DATA_SOURCE_SUCCESS:
    case types.DISCONNECT_DATA_SOURCE_SUCCESS:
    case types.GET_CLINICS_SUCCESS:
    case types.CREATE_CLINIC_SUCCESS:
    case types.FETCH_CLINIC_SUCCESS:
    case types.FETCH_CLINICS_BY_IDS_SUCCESS:
    case types.UPDATE_CLINIC_SUCCESS:
    case types.FETCH_CLINICIANS_FROM_CLINIC_SUCCESS:
    case types.FETCH_CLINICIAN_SUCCESS:
    case types.UPDATE_CLINICIAN_SUCCESS:
    case types.DELETE_CLINICIAN_FROM_CLINIC_SUCCESS:
    case types.DELETE_PATIENT_FROM_CLINIC_SUCCESS:
    case types.FETCH_PATIENTS_FOR_CLINIC_SUCCESS:
    case types.FETCH_PATIENT_FROM_CLINIC_SUCCESS:
    case types.CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS:
    case types.CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS:
    case types.UPDATE_CLINIC_PATIENT_SUCCESS:
    case types.SEND_CLINICIAN_INVITE_SUCCESS:
    case types.FETCH_CLINICIAN_INVITE_SUCCESS:
    case types.RESEND_CLINICIAN_INVITE_SUCCESS:
    case types.DELETE_CLINICIAN_INVITE_SUCCESS:
    case types.FETCH_PATIENT_INVITES_SUCCESS:
    case types.ACCEPT_PATIENT_INVITATION_SUCCESS:
    case types.DELETE_PATIENT_INVITATION_SUCCESS:
    case types.UPDATE_PATIENT_PERMISSIONS_SUCCESS:
    case types.FETCH_CLINIC_MRN_SETTINGS_SUCCESS:
    case types.FETCH_CLINIC_EHR_SETTINGS_SUCCESS:
    case types.FETCH_CLINICS_FOR_PATIENT_SUCCESS:
    case types.FETCH_CLINICIAN_INVITES_SUCCESS:
    case types.ACCEPT_CLINICIAN_INVITE_SUCCESS:
    case types.DISMISS_CLINICIAN_INVITE_SUCCESS:
    case types.GET_CLINICS_FOR_CLINICIAN_SUCCESS:
    case types.TRIGGER_INITIAL_CLINIC_MIGRATION_SUCCESS:
    case types.SEND_PATIENT_UPLOAD_REMINDER_SUCCESS:
    case types.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_SUCCESS:
    case types.CREATE_CLINIC_PATIENT_TAG_SUCCESS:
    case types.UPDATE_CLINIC_PATIENT_TAG_SUCCESS:
    case types.DELETE_CLINIC_PATIENT_TAG_SUCCESS:
    case types.FETCH_INFO_SUCCESS:
      key = actionWorkingMap(action.type);
      if (key) {
        if (action.type === types.LOGOUT_SUCCESS) {
          return update(initialWorkingState, {
            [key]: {
              $set: {
                inProgress: false,
                notification: _.get(action, ['payload', 'notification'], null),
                completed: true,
              }
            }
          });
        } else if (action.type === types.DATA_WORKER_REMOVE_DATA_SUCCESS) {
          const queryingDataWorkingKey = actionWorkingMap(types.DATA_WORKER_QUERY_DATA_SUCCESS);
          return update(state, {
            [queryingDataWorkingKey]: {
              $set: initialState.working[queryingDataWorkingKey],
            },
            [key]: {
              $set: {
                inProgress: false,
                notification: _.get(action, ['payload', 'notification'], null),
                completed: true,
              }
            }
          });
        } else if (action.type === types.REMOVE_GENERATED_PDFS) {
          const generatingPDFWorkingKey = actionWorkingMap(types.GENERATE_PDF_SUCCESS);
          return update(state, {
            [generatingPDFWorkingKey]: {
              $set: initialState.working[generatingPDFWorkingKey],
            },
          });
        } else if (action.type === types.CREATE_PRESCRIPTION_SUCCESS) {
          return update(state, {
            [key]: {
              $set: {
                inProgress: false,
                notification: _.get(action, ['payload', 'notification'], null),
                completed: true,
                prescriptionId: _.get(action, ['payload', 'prescription', 'id']),
              }
            }
          });
        } else if (action.type === types.FETCH_CLINIC_SUCCESS) {
          return update(state, {
            [key]: {
              $set: {
                inProgress: false,
                notification: _.get(action, ['payload', 'notification'], null),
                completed: true,
                clinicId: _.get(action, ['payload', 'clinic', 'id']),
              }
            }
          });
        } else if (_.includes([
          types.CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS,
          types.UPDATE_CLINIC_PATIENT_SUCCESS,
          types.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_SUCCESS,
        ], action.type)) {
          return update(state, {
            [key]: {
              $set: {
                inProgress: false,
                notification: _.get(action, ['payload', 'notification'], null),
                completed: true,
                patientId: _.get(action, ['payload', 'patientId']),
              }
            }
          });
        } else {
          return update(state, {
            [key]: {
              $set: {
                inProgress: false,
                notification: _.get(action, ['payload', 'notification'], null),
                completed: true,
              }
            }
          });
        }
      }
      else {
        return state;
      }

    /**
     * Failure handling
     *  - All working state objects have a similar structure and are updated
     *  in a consistent manner
     */
    case types.FETCH_USER_FAILURE:
    case types.FETCH_PENDING_SENT_INVITES_FAILURE:
    case types.FETCH_PENDING_RECEIVED_INVITES_FAILURE:
    case types.FETCH_ASSOCIATED_ACCOUNTS_FAILURE:
    case types.FETCH_PATIENT_FAILURE:
    case types.FETCH_PATIENT_DATA_FAILURE:
    case types.FETCH_CLINIC_PRESCRIPTIONS_FAILURE:
    case types.CREATE_PRESCRIPTION_FAILURE:
    case types.CREATE_PRESCRIPTION_REVISION_FAILURE:
    case types.DELETE_PRESCRIPTION_FAILURE:
    case types.FETCH_DEVICES_FAILURE:
    case types.FETCH_MESSAGE_THREAD_FAILURE:
    case types.CREATE_MESSAGE_THREAD_FAILURE:
    case types.EDIT_MESSAGE_THREAD_FAILURE:
    case types.LOGIN_FAILURE:
    case types.SIGNUP_FAILURE:
    case types.CONFIRM_SIGNUP_FAILURE:
    case types.CONFIRM_PASSWORD_RESET_FAILURE:
    case types.ACCEPT_TERMS_FAILURE:
    case types.RESEND_EMAIL_VERIFICATION_FAILURE:
    case types.SETUP_DATA_STORAGE_FAILURE:
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE:
    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE:
    case types.REQUEST_PASSWORD_RESET_FAILURE:
    case types.SEND_INVITE_FAILURE:
    case types.SEND_CLINIC_INVITE_FAILURE:
    case types.RESEND_INVITE_FAILURE:
    case types.CANCEL_SENT_INVITE_FAILURE:
    case types.ACCEPT_RECEIVED_INVITE_FAILURE:
    case types.REJECT_RECEIVED_INVITE_FAILURE:
    case types.SET_MEMBER_PERMISSIONS_FAILURE:
    case types.UPDATE_PATIENT_FAILURE:
    case types.UPDATE_PATIENT_BG_UNITS_FAILURE:
    case types.UPDATE_USER_FAILURE:
    case types.VERIFY_CUSTODIAL_FAILURE:
    case types.GENERATE_PDF_FAILURE:
    case types.DATA_WORKER_ADD_DATA_FAILURE:
    case types.DATA_WORKER_REMOVE_DATA_FAILURE:
    case types.DATA_WORKER_UPDATE_DATUM_FAILURE:
    case types.DATA_WORKER_QUERY_DATA_FAILURE:
    case types.UPDATE_DATA_DONATION_ACCOUNTS_FAILURE:
    case types.FETCH_DATA_SOURCES_FAILURE:
    case types.FETCH_SERVER_TIME_FAILURE:
    case types.CONNECT_DATA_SOURCE_FAILURE:
    case types.DISCONNECT_DATA_SOURCE_FAILURE:
    case types.GET_CLINICS_FAILURE:
    case types.CREATE_CLINIC_FAILURE:
    case types.FETCH_CLINIC_FAILURE:
    case types.FETCH_CLINICS_BY_IDS_FAILURE:
    case types.UPDATE_CLINIC_FAILURE:
    case types.FETCH_CLINICIANS_FROM_CLINIC_FAILURE:
    case types.FETCH_CLINICIAN_FAILURE:
    case types.UPDATE_CLINICIAN_FAILURE:
    case types.DELETE_CLINICIAN_FROM_CLINIC_FAILURE:
    case types.DELETE_PATIENT_FROM_CLINIC_FAILURE:
    case types.FETCH_PATIENTS_FOR_CLINIC_FAILURE:
    case types.FETCH_PATIENT_FROM_CLINIC_FAILURE:
    case types.CREATE_CLINIC_CUSTODIAL_ACCOUNT_FAILURE:
    case types.CREATE_VCA_CUSTODIAL_ACCOUNT_FAILURE:
    case types.UPDATE_CLINIC_PATIENT_FAILURE:
    case types.SEND_CLINICIAN_INVITE_FAILURE:
    case types.FETCH_CLINICIAN_INVITE_FAILURE:
    case types.RESEND_CLINICIAN_INVITE_FAILURE:
    case types.DELETE_CLINICIAN_INVITE_FAILURE:
    case types.FETCH_PATIENT_INVITES_FAILURE:
    case types.ACCEPT_PATIENT_INVITATION_FAILURE:
    case types.DELETE_PATIENT_INVITATION_FAILURE:
    case types.UPDATE_PATIENT_PERMISSIONS_FAILURE:
    case types.FETCH_CLINIC_MRN_SETTINGS_FAILURE:
    case types.FETCH_CLINIC_EHR_SETTINGS_FAILURE:
    case types.FETCH_CLINICS_FOR_PATIENT_FAILURE:
    case types.FETCH_CLINICIAN_INVITES_FAILURE:
    case types.ACCEPT_CLINICIAN_INVITE_FAILURE:
    case types.DISMISS_CLINICIAN_INVITE_FAILURE:
    case types.GET_CLINICS_FOR_CLINICIAN_FAILURE:
    case types.TRIGGER_INITIAL_CLINIC_MIGRATION_FAILURE:
    case types.SEND_PATIENT_UPLOAD_REMINDER_FAILURE:
    case types.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_FAILURE:
    case types.CREATE_CLINIC_PATIENT_TAG_FAILURE:
    case types.UPDATE_CLINIC_PATIENT_TAG_FAILURE:
    case types.DELETE_CLINIC_PATIENT_TAG_FAILURE:
    case types.FETCH_INFO_FAILURE:
      key = actionWorkingMap(action.type);
      if (key) {
        return update(state, {
          [key]: {
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: _.get(action, ['error', 'message'], null),
              },
              completed: false,
            }
          }
        });
      } else {
        return state;
      }

    case types.SELECT_CLINIC:
      const newState = _.cloneDeep(state);
      _.forEach([
        'fetchingCliniciansFromClinic',
        'fetchingClinicPrescriptions',
        'fetchingPatientsForClinic',
        'fetchingPatientInvites',
      ], key => _.set(newState, key, {
        inProgress: false,
        notification: null,
        completed: null,
      }));
      return newState;

    default:
      return state;
  }
};
