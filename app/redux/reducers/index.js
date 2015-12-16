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
        isLoggedIn: true
      })
    case ActionTypes.LOGIN_FAILURE:
      return merge({
        working: {
          loggingIn: false
        }
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
        }
      })
    default:
      return state;
  }

  // Convenience function
  function merge(newState) {
    return Object.assign({}, state, newState);
  }
}
