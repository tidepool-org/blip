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

export function logoutSuccess(user) {
  return {
    type: ActionTypes.LOGOUT_SUCCESS,
    payload: {
      user: user
    }
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