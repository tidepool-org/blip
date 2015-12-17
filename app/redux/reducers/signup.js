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

export default function signup(state = initialState, action) {
  //TODO: check if action is correct structure - FSA
  
  switch(action.type) {
    case ActionTypes.SIGNUP_REQUEST: 
      return merge({
        working: {
          signingUp: true
        }
      })
    case ActionTypes.SIGNUP_SUCCESS:
      return merge({
        working: {
          signingUp: false
        },
        isLoggedIn: true,
        user: action.payload.user
      })
    case ActionTypes.SIGNUP_FAILURE:
      return merge({
        working: {
          signingUp: false
        },
        error: action.error
      })
    default:
      return state;
  }

  // Convenience function
  function merge(newState) {
    // important to understand that _.merge performs a deep merge, unlike _.assign
    return _.merge({}, state, newState);
  }
}
