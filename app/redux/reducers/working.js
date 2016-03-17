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

import update from 'react-addons-update';

import * as types from '../constants/actionTypes';
import actionWorkingMap from '../constants/actionWorkingMap';

import { working as initialState } from './initialState';

export default (state = initialState, action) => {
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
        return state;
      }

    /**
     * Request handling
     *  - All working state objects have a similar structure and are updated
     *  in a consistent manner
     */
    case types.FETCH_USER_REQUEST:
    case types.FETCH_PENDING_SENT_INVITES_REQUEST:
    case types.FETCH_PENDING_RECEIVED_INVITES_REQUEST:
    case types.FETCH_PATIENTS_REQUEST:
    case types.FETCH_PATIENT_REQUEST:
    case types.FETCH_PATIENT_DATA_REQUEST:
    case types.FETCH_MESSAGE_THREAD_REQUEST:
    case types.LOGIN_REQUEST:
    case types.LOGOUT_REQUEST:
    case types.SIGNUP_REQUEST:
    case types.CONFIRM_SIGNUP_REQUEST:
    case types.CONFIRM_PASSWORD_RESET_REQUEST:
    case types.ACCEPT_TERMS_REQUEST:
    case types.RESEND_EMAIL_VERIFICATION_REQUEST:
    case types.CREATE_PATIENT_REQUEST:
    case types.REMOVE_PATIENT_REQUEST:
    case types.REMOVE_MEMBER_REQUEST:
    case types.REQUEST_PASSWORD_RESET_REQUEST:
    case types.SEND_INVITE_REQUEST:
    case types.CANCEL_SENT_INVITE_REQUEST:
    case types.ACCEPT_RECEIVED_INVITE_REQUEST:
    case types.REJECT_RECEIVED_INVITE_REQUEST:
    case types.SET_MEMBER_PERMISSIONS_REQUEST:
    case types.UPDATE_PATIENT_REQUEST:
    case types.UPDATE_USER_REQUEST:
      key = actionWorkingMap(action.type);
      if (key) {
        return update(state, {
          [key]: {
            $set: {
              inProgress: true,
              notification: null
            }
          }
        });
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
    case types.FETCH_PATIENTS_SUCCESS:
    case types.FETCH_PATIENT_SUCCESS:
    case types.FETCH_PATIENT_DATA_SUCCESS:
    case types.FETCH_MESSAGE_THREAD_SUCCESS:
    case types.LOGIN_SUCCESS:
    case types.LOGOUT_SUCCESS:
    case types.SIGNUP_SUCCESS:
    case types.CONFIRM_SIGNUP_SUCCESS:
    case types.CONFIRM_PASSWORD_RESET_SUCCESS:
    case types.ACCEPT_TERMS_SUCCESS:
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
    case types.CREATE_PATIENT_SUCCESS:
    case types.REMOVE_PATIENT_SUCCESS:
    case types.REMOVE_MEMBER_SUCCESS:
    case types.REQUEST_PASSWORD_RESET_SUCCESS:
    case types.SEND_INVITE_SUCCESS:
    case types.CANCEL_SENT_INVITE_SUCCESS:
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
    case types.REJECT_RECEIVED_INVITE_SUCCESS:
    case types.SET_MEMBER_PERMISSIONS_SUCCESS:
    case types.UPDATE_PATIENT_SUCCESS:
    case types.UPDATE_USER_SUCCESS:
      key = actionWorkingMap(action.type);
      if (key) {
        return update(state, {
          [key]: {
            $set: {
              inProgress: false,
              notification: null
            }
          }
        });
      } else {
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
    case types.FETCH_PATIENTS_FAILURE:
    case types.FETCH_PATIENT_FAILURE:
    case types.FETCH_PATIENT_DATA_FAILURE:
    case types.FETCH_MESSAGE_THREAD_FAILURE:
    case types.LOGIN_FAILURE:
    case types.LOGOUT_FAILURE:
    case types.SIGNUP_FAILURE:
    case types.CONFIRM_SIGNUP_FAILURE:
    case types.CONFIRM_PASSWORD_RESET_FAILURE:
    case types.ACCEPT_TERMS_FAILURE:
    case types.RESEND_EMAIL_VERIFICATION_FAILURE:
    case types.CREATE_PATIENT_FAILURE:
    case types.REMOVE_PATIENT_FAILURE:
    case types.REMOVE_MEMBER_FAILURE:
    case types.REQUEST_PASSWORD_RESET_FAILURE:
    case types.SEND_INVITE_FAILURE:
    case types.CANCEL_SENT_INVITE_FAILURE:
    case types.ACCEPT_RECEIVED_INVITE_FAILURE:
    case types.REJECT_RECEIVED_INVITE_FAILURE:
    case types.SET_MEMBER_PERMISSIONS_FAILURE:
    case types.UPDATE_PATIENT_FAILURE:
    case types.UPDATE_USER_FAILURE:
      key = actionWorkingMap(action.type);
      if (key) {
        return update(state, {
          [key]: {
            $set: {
              inProgress: false,
              notification: { 
                type: 'error',
                message: action.error
              }
            }
          }
        });
      } else {
        return state;
      }

    default: 
      return state;
  }
};