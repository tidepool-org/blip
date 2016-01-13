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