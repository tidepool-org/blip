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
import async from 'async';
import * as ActionTypes from '../constants/actionTypes';
import * as syncActions from './sync.js';

/**
 * Signup Async Action Creator
 * 
 * @param  {[type]} api an instance of the API wrapper
 * @param  {object} accountDetails contains email, password, name
 */
export function signup(api, accountDetails) {
  return (dispatch) => {
    dispatch(sync.signupRequest());

    api.user.signup(accountDetails, (err, result) => {
      if (err) {
        dispatch(sync.signupFailure(err));
      } else {
        api.user.api.user.get((err, user) => {
          if (err) {
            dispatch(sync.signupFailure(err));
          } else {
            dispatch(sync.signupSuccess(user));
          }
        });
      }
    });
  };
}

export function confirmSignup(api, signupKey) {
  return (dispatch) => {
    dispatch(sync.confirmSignupRequest());

  };
}

/**
 * Login Async Action Creator
 * 
 * @param  {[type]} api an instance of the API wrapper
 * @param  {object} accountDetails contains email and password
 * @param  {?object} options optionalArgument that contains options like remember
 */
export function login(api, credentials, options) {
  return (dispatch) => {
    dispatch(sync.loginRequest());

    api.user.login(credentials, options, (err, result) => {
      if (err) {
        dispatch(sync.loginFailure(err));
      } else {
        api.user.api.user.get((err, user) => {
          if (err) {
            dispatch(sync.loginFailure(err));
          } else {
            dispatch(sync.loginSuccess(user));
          }
        });
      }
    });
  };
}

/**
 * Logout Async Action Creator
 * 
 * @param  {[type]} api an instance of the API wrapper
 */
export function logout(api) {
  return (dispatch) => {
    dispatch(sync.logoutRequest());

    api.user.logout((err) => {
      if (err) {
        dispatch(sync.logoutFailure(err));
      } else {
        dispatch(sync.logoutSuccess());
      }
    });
  }
}

/**
 * Log API Error Async Action Creator
 * @param  {[type]} api [description]
 * @return {[type]}     [description]
 */
export function logApiError(api) {

}