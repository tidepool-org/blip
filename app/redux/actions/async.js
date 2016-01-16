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
import utils from '../../core/utils';
import * as ActionTypes from '../constants/actionTypes';
import * as sync from './sync.js';

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
 * Accept Terms Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} termsData
 */
export function acceptTerms(api, termsData) {
  return (dispatch) => {
    dispatch(sync.acceptTermsRequest());

    api.user.acceptTerms(termsData, function(err, user) {
      if (err) {
        dispatch(sync.acceptTermsFailure(err));
      } else {
        dispatch(sync.acceptTermsSuccess(user))
      }
    })
  };
}

/**
 * Create Patient Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patient
 */
export function createPatient(api, patient) {
  return (dispatch) => {
    dispatch(sync.createPatientRequest());

    api.patient.post(patient, (err, createdPatient) => {
      if (err) {
        dispatch(sync.createPatientFailure(err));
      } else {
        dispatch(sync.createPatientSuccess(createdPatient));
      }
    });
  }
}

/**
 * Remove Patient Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patientId
 */
export function removePatient(api, patientId) {
  return (dispatch) => {
    dispatch(sync.removePatientRequest());

    api.access.leaveGroup(patientId, (err) => {
      if (err) {
        dispatch(sync.removePatientFailure(err));
      } else {
        dispatch(sync.removePatientSuccess(patientId));
      }
    });
  }
}

/**
 * Remove Member Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} memberId
 */
export function removeMember(api, memberId) {
  return (dispatch) => {
    dispatch(sync.removeMemberRequest());

    api.access.removeMember(memberId, (err) => {
      if (err) {
        dispatch(sync.removeMemberFailure(err));
      } else {
        dispatch(sync.removeMemberSuccess(memberId));
      }
    });
  }
}

/**
 * Send Invitation Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} email
 * @param  {Object} permissions
 */
export function sendInvitation(api, email, permissions) {
  return (dispatch) => {
    dispatch(sync.sendInvitationRequest());

    api.invitation.send(email, permissions, (err, invitation) => {
      if (err) {
        dispatch(sync.sendInvitationFailure(err));
      } else {
        dispatch(sync.sendInvitationSuccess(invitation));
      }
    });
  }
}

/**
 * Cancel Invitation Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} email
 */
export function cancelInvitation(api, email) {
  return (dispatch) => {
    dispatch(sync.cancelInvitationRequest());

    api.invitation.cancel(email, (err) => {
      if (err) {
        dispatch(sync.cancelInvitationFailure(err));
      } else {
        dispatch(sync.cancelInvitationSuccess(email));
      }
    });
  }
}

/**
 * Accept Membership Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} invitation
 */
export function acceptMembership(api, invitation) {
  return (dispatch) => {
    dispatch(sync.acceptMembershipRequest(invitation));

    api.invitation.accept(
      invitation.key, 
      invitation.creator.userid, (err, invitation) => {
      if (err) {
        dispatch(sync.acceptMembershipFailure(err));
      } else {
        dispatch(sync.acceptMembershipSuccess(invitation));
      }
    });
  }
}

/**
 * Dismiss Membership Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} invitation
 */
export function dismissMembership(api, invitation) {
  return (dispatch) => {
    dispatch(sync.dismissMembershipRequest(invitation));

    api.invitation.dismiss(
      invitation.key, 
      invitation.creator.userid, (err, invitation) => {
      if (err) {
        dispatch(sync.dismissMembershipFailure(err));
      } else {
        dispatch(sync.dismissMembershipSuccess(invitation));
      }
    });
  }
}

/**
 * Dismiss Membership Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String|Number} patientId
 * @param  {String|Number} memberId
 * @param  {Object} permissions
 */
export function setMemberPermissions(api, patientId, memberId, permissions) {
  return (dispatch) => {
    dispatch(sync.setMemberPermissionsRequest());

    api.access.setMemberPermissions(
      memberId, 
      permissions, (err) => {
      if (err) {
        dispatch(sync.setMemberPermissionsFailure(err));
      } else {
        dispatch(sync.setMemberPermissionsSuccess(memberId, permissions));
      }
    });
  }
}

/**
 * Update Patient Data Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patient
 */
export function updatePatient(api, patient) {
  return (dispatch) => {
    dispatch(sync.updatePatientRequest());
    
    api.patient.put(patient, (err, updatedPatient) => {
      if (err) {
        dispatch(sync.updatePatientFailure(err));
      } else {
        dispatch(sync.updatePatientSuccess(updatedPatient));
      }
    });
  };
}

/**
 * Update User Data Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} user
 */
export function updateUser(api, user) {
  return (dispatch) => {
    dispatch(sync.updateUserRequest());
    
    api.user.put(user, (err, updatedUser) => {
      if (err) {
        dispatch(sync.updateUserFailure(err));
      } else {
        dispatch(sync.updateUserSuccess(updatedUser));
      }
    });
  };
}

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
 * @param {Object} queryParams
 */
export function fetchPatientData(api, id, queryParams) {
  return (dispatch, getState) => {
    const state = getState();

    dispatch(sync.fetchPatientDataRequest());

    async.parallel({
      patientData: api.patientData.get.bind(api, id),
      teamNotes: api.team.getNotes.bind(api, id)
    }, (err, results) => {
      if (err) {
        dispatch(sync.fetchPatientDataFailure(err));
      } else {
        let patientData = results.patientData || [];
        let notes = results.teamNotes || [];
        let combinedData = patientData.concat(notes);

        let processedData = utils.processPatientData(combinedData, queryParams, state.timePrefs, state.bgPrefs);

        dispatch(sync.fetchPatientDataSuccess(processedData));
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