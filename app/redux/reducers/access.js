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
import initialState from './initialState';

export default function access(state = initialState, action) {
  //TODO: check if action is correct structure - FSA
  
  switch(action.type) {
    case ActionTypes.LOGIN_REQUEST: 
      return merge({
        working: {
          loggingIn: true
        }
      })
    case ActionTypes.LOGIN_SUCCESS:
      return merge({
        working: {
          loggingIn: false
        },
        user: action.payload.user,
        isLoggedIn: true
      })
    case ActionTypes.LOGIN_FAILURE:
      return merge({
        working: {
          loggingIn: false
        },
        error: action.error
      })
    case ActionTypes.LOGOUT_REQUEST: 
      return merge({
        working: {
          loggingOut: true
        }
      })
    case ActionTypes.LOGOUT_SUCCESS:
      return merge({
        working: {
          loggingOut: false
        },
        isLoggedIn: false,
        patients: null, 
        patientsData: null,
        invites: null, 
        user: null,
        currentPatient: null
      })
    case ActionTypes.LOGOUT_FAILURE:
      return merge({
        working: {
          loggingOut: false
        },
        error: action.error
      })
    default:
      return state;
  }

  // Convenience function
  function merge(newState) {
    return _.assign({}, state, newState);
  }
}
