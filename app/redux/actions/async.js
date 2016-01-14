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
import * as sync from './sync.js';

/**
 * Fetch User Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchUser(api) {
  return (dispatch) => {
    dispatch(sync.fetchUserRequest());
    
    api.user.get((err, user) => {
      if (err) {
        dispatch(sync.fetchUserFailure(err));
      } else {
        dispatch(sync.fetchUserSuccess(user));
      }
    });
  };
}

/**
 * Fetch Pending Invites Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchPendingInvites(api) {
  return (dispatch) => {
    dispatch(sync.fetchPendingInvitesRequest());
    
    api.invitation.getSent((err, pendingInvites) => {
      if (err) {
        dispatch(sync.fetchPendingInvitesFailure(err));
      } else {
        dispatch(sync.fetchPendingInvitesSuccess(pendingInvites));
      }
    });
  };
}

/**
 * Fetch Pending Memberships Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchPendingMemberships(api) {
  return (dispatch) => {
    dispatch(sync.fetchPendingMembershipsRequest());
    
    api.invitation.getReceived((err, pendingMemberships) => {
      if (err) {
        dispatch(sync.fetchPendingMembershipsFailure(err));
      } else {
        dispatch(sync.fetchPendingMembershipsSuccess(pendingMemberships));
      }
    });
  };
}

/**
 * Fetch Patient Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param {String|Number} id
 */
export function fetchPatient(api, id) {
  return (dispatch) => {
    dispatch(sync.fetchPatientRequest());
    
    api.patient.get(id, (err, patient) => {
      if (err) {
        dispatch(sync.fetchPatientFailure(err));
      } else {
        dispatch(sync.fetchPatientSuccess(patient));
      }
    });
  };
}

/**
 * Fetch Patients Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchPatients(api) {
  return (dispatch) => {
    dispatch(sync.fetchPatientsRequest());
    
    api.patient.getAll((err, patients) => {
      if (err) {
        dispatch(sync.fetchPatientsFailure(err));
      } else {
        dispatch(sync.fetchPatientsSuccess(patients));
      }
    });
  };
}

/**
 * Fetch Patient Data Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param {String|Number} id
 */
export function fetchPatientData(api, id) {
  return (dispatch) => {
    dispatch(sync.fetchPatientDataRequest());
    
    api.patientData.get(id, (err, patientData) => {
      if (err) {
        dispatch(sync.fetchPatientDataFailure(err));
      } else {
        dispatch(sync.fetchPatientDataSuccess(patientData));
      }
    });
  };
}

/**
 * Fetch Team Notes Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param {String|Number} id
 */
export function fetchTeamNotes(api, id) {
  return (dispatch) => {
    dispatch(sync.fetchTeamNotesRequest());
    
    api.team.getNotes(id, (err, teamNotes) => {
      if (err) {
        dispatch(sync.fetchTeamNotesFailure(err));
      } else {
        dispatch(sync.fetchTeamNotesSuccess(teamNotes));
      }
    });
  };
}

/**
 * Fetch Message Thread Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param {String|Number} id
 */
export function fetchMessageThread(api, id ) {
  return (dispatch) => {
    dispatch(sync.fetchMessageThreadRequest());
    
    api.team.getMessageThread(id, (err, messageThread) => {
      if (err) {
        dispatch(sync.fetchMessageThreadFailure(err));
      } else {
        dispatch(sync.fetchMessageThreadSuccess(messageThread));
      }
    });
  };
}

/**
 * Signup Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} accountDetails contains email, password, name
 */
export function signup(api, accountDetails) {
  return (dispatch) => {
    dispatch(sync.signupRequest());

    api.user.signup(accountDetails, (err, result) => {
      if (err) {
        dispatch(sync.signupFailure(err));
      } else {
        api.user.get((err, user) => {
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

/**
 * Confirm Signup Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} signupKey
 */
export function confirmSignup(api, signupKey) {
  return (dispatch) => {
    dispatch(sync.confirmSignupRequest());

    api.user.confirmSignup(signupKey, function(err) {
      if (err) {
        dispatch(sync.confirmSignupFailure(err));
      } else {
        dispatch(sync.confirmSignupSuccess())
      }
    })
  };
}

/**
 * Login Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} accountDetails contains email and password
 * @param  {?Object} options optionalArgument that contains options like remember
 */
export function login(api, credentials, options) {
  return (dispatch) => {
    dispatch(sync.loginRequest());

    api.user.login(credentials, options, (err) => {
      if (err) {
        dispatch(sync.loginFailure(err));
      } else {
        api.user.get((err, user) => {
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
 * @param  {Object} api an instance of the API wrapper
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
 * Log Error Async Action Creator
 * 
 * @param  {Object} api
 * @param  {String} error
 * @param  {String} message
 * @param  {Object} properties - usually an error stack trace
 */
export function logError(api, error, message, properties) {
  return (dispatch) => {
    dispatch(sync.logErrorRequest());

    api.errors.log(error, message, properties, (err) => {
      if (err) {
        dispatch(sync.logErrorFailure(err));
      } else {
        dispatch(sync.logErrorSuccess());
      }
    });
  }
}