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
import sundial from 'sundial';
import async from 'async';
import utils from '../../core/utils';
import * as ActionTypes from '../constants/actionTypes';
import * as ErrorMessages from '../constants/errorMessages';
import * as sync from './sync.js';
import update from 'react-addons-update';

import { routeActions } from 'react-router-redux';

/**
 * Signup Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} accountDetails contains email, password, name
 */
export function signup(api, accountDetails) {
  return (dispatch) => {
    dispatch(sync.signupRequest());

    api.user.signup(accountDetails, (err, user) => {
      if (err) {
        let error = ErrorMessages.SIGNUP_ERROR;
        if (err.status && err.status === 409) {
          error = ErrorMessages.ACCOUNT_ALREADY_EXISTS;
        }
        dispatch(sync.signupFailure(error, err));
      } else {
        dispatch(sync.signupSuccess(user));
        dispatch(routeActions.push('/email-verification'));
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
        var error = (err.status === 401) ? 'Wrong username or password.' : 'An error occured while logging in.';

        if (err.status === 403) {
          dispatch(sync.loginFailure(error, err, { isLoggedIn: false, emailVerificationSent: false }));
          dispatch(routeActions.push('/email-verification'));
        } else {
          dispatch(sync.loginFailure(error, err));
        }
      } else {
        api.user.get((err, user) => {
          if (err) {
            dispatch(sync.loginFailure(ErrorMessages.STANDARD, err));
          } else {
            if (_.get(user, ['profile', 'patient'])) {
              api.patient.get(user.userid, (err, patient) => {
                if (err) {
                  dispatch(sync.loginFailure(ErrorMessages.STANDARD, err));
                } else {
                  user = update(user, { $merge: patient });
                  dispatch(sync.loginSuccess(user));
                  dispatch(routeActions.push('/patients?justLoggedIn=true'));
                }
              });
            } else {
              dispatch(sync.loginSuccess(user));
              dispatch(routeActions.push('/patients?justLoggedIn=true'));
            }
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
        dispatch(sync.logoutFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.logoutSuccess());
        dispatch(routeActions.push('/'));
      }
    });
  }
}

/**
 * Confirm PasswordReset Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} formValues
 */
export function confirmPasswordReset(api, formValues) {
  return (dispatch) => {
    dispatch(sync.confirmPasswordResetRequest());

    api.user.confirmPasswordReset(formValues, function(err) {
      if (err) {
        var message = 'We couldn\'t change your password. You may have mistyped your email, or the reset link may have expired.';
        dispatch(sync.confirmPasswordResetFailure(message, err));
      } else {
        dispatch(sync.confirmPasswordResetSuccess())
      }
    })
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

    api.user.confirmSignUp(signupKey, function(err) {
      if (err) {
        dispatch(sync.confirmSignupFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.confirmSignupSuccess())
      }
    })
  };
}

/**
 * Resend Email Verification Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} email
 */
export function resendEmailVerification(api, email) {
  return (dispatch) => {
    dispatch(sync.resendEmailVerificationRequest());

    api.user.resendEmailVerification(email, function(err) {
      if (err) {
        var message = 'An error occured while trying to resend your verification email.'
        dispatch(sync.resendEmailVerificationFailure(message, err));
      } else {
        dispatch(sync.resendEmailVerificationSuccess())
      }
    })
  };
}

/**
 * Accept Terms Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} acceptedDate
 */
export function acceptTerms(api, acceptedDate) {
  acceptedDate = acceptedDate || sundial.utcDateString();
  return (dispatch, getState) => {
    const { blip: { loggedInUserId } } = getState();
    dispatch(sync.acceptTermsRequest());

    api.user.acceptTerms({ termsAccepted: acceptedDate }, function(err, user) {
      if (err) {
        dispatch(sync.acceptTermsFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.acceptTermsSuccess(loggedInUserId, acceptedDate));
        dispatch(routeActions.push(`/patients?justLoggedIn=true`));
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
  return (dispatch, getState) => {
    const { blip: { loggedInUserId } } = getState();
    dispatch(sync.createPatientRequest());

    api.patient.post(patient, (err, createdPatient) => {
      if (err) {
        dispatch(sync.createPatientFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.createPatientSuccess(loggedInUserId, createdPatient));
        dispatch(routeActions.push(`/patients/${createdPatient.userid}/data`));
      }
    });
  }
}

/**
 * Request PasswordReset Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} email
 */
export function requestPasswordReset(api, email) {
  return (dispatch) => {
    dispatch(sync.requestPasswordResetRequest());

    api.user.requestPasswordReset(email, function(err) {
      if (err) {
        let message = 'An error occurred whilst attempting to reset your password';
        dispatch(sync.requestPasswordResetFailure(message, err));
      } else {
        dispatch(sync.requestPasswordResetSuccess())
      }
    })
  };
}

/**
 * Remove Patient Async Action Creator
 * This function calls fetchPatients to get an updated list of patients
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patientId
 */
export function removePatient(api, patientId) {
  return (dispatch) => {
    dispatch(sync.removePatientRequest());

    api.access.leaveGroup(patientId, (err) => {
      if (err) {
        dispatch(sync.removePatientFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.removePatientSuccess(patientId));
        dispatch(fetchPatients(api));
      }
    });
  }
}

/**
 * Remove Member Async Action Creator
 * This function calls fetchPatient to get an updated patient object
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String|Number} patientId
 * @param  {String|Number} memberId
 */
export function removeMember(api, patientId, memberId) {
  return (dispatch) => {
    dispatch(sync.removeMemberRequest());

    api.access.removeMember(memberId, (err) => {
      if (err) {
        dispatch(sync.removeMemberFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.removeMemberSuccess(memberId));
        dispatch(fetchPatient(api, patientId));
      }
    });
  }
}

/**
 * Send Invite Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} email
 * @param  {Object} permissions
 */
export function sendInvite(api, email, permissions) {
  return (dispatch) => {
    dispatch(sync.sendInviteRequest());

    api.invitation.send(email, permissions, (err, invite) => {
      if (err) {
        if (err.status === 409) {
          dispatch(sync.sendInviteFailure(ErrorMessages.ALREADY_SENT_TO_EMAIL, err));
        } else {
          dispatch(sync.sendInviteFailure(ErrorMessages.STANDARD, err));
        }
      } else {
        dispatch(sync.sendInviteSuccess(invite));
      }
    });
  }
}

/**
 * Cancel Sent Invite Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} email
 */
export function cancelSentInvite(api, email) {
  return (dispatch) => {
    dispatch(sync.cancelSentInviteRequest());

    api.invitation.cancel(email, (err) => {
      if (err) {
        dispatch(sync.cancelSentInviteFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.cancelSentInviteSuccess(email));
      }
    });
  }
}

/**
 * Accept ReceivedInvite Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} invite
 */
export function acceptReceivedInvite(api, invite) {
  return (dispatch) => {
    dispatch(sync.acceptReceivedInviteRequest(invite));

    api.invitation.accept(
      invite.key, 
      invite.creator.userid, (err) => {
      if (err) {
        dispatch(sync.acceptReceivedInviteFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.acceptReceivedInviteSuccess(invite));
      }
    });
  }
}

/**
 * Dismiss Membership Async Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} invite
 */
export function rejectReceivedInvite(api, invite) {
  return (dispatch) => {
    dispatch(sync.rejectReceivedInviteRequest(invite));

    api.invitation.dismiss(
      invite.key, 
      invite.creator.userid, (err) => {
      if (err) {
        dispatch(sync.rejectReceivedInviteFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.rejectReceivedInviteSuccess(invite));
      }
    });
  }
}

/**
 * Set Member Permissions Async Action Creator
 * This in turn triggers a fetch of the patient the permissions are for
 *
 * @todo  refactor this behaviour so that the updating of the whole patient
 * is not neccessary
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
        dispatch(sync.setMemberPermissionsFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.setMemberPermissionsSuccess(memberId, permissions));
        dispatch(fetchPatient(api, patientId));
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
        dispatch(sync.updatePatientFailure(ErrorMessages.STANDARD, err));
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
 * @param {userId} userId
 * @param  {Object} formValues
 */
export function updateUser(api, formValues) {
  return (dispatch, getState) => {
    const { blip: { loggedInUserId, allUsersMap } } = getState();
    const loggedInUser = allUsersMap[loggedInUserId];

    const newUser = _.assign({}, 
      _.omit(loggedInUser, 'profile'),
      _.omit(formValues, 'profile'),
      { profile: _.assign({}, loggedInUser.profile, formValues.profile) } 
    );

    dispatch(sync.updateUserRequest(loggedInUserId, _.omit(newUser, 'password')));

    var userUpdates = _.cloneDeep(newUser);
    if (userUpdates.username === loggedInUser.username) {
      userUpdates = _.omit(userUpdates, 'username', 'emails');
    }
    
    api.user.put(userUpdates, (err, updatedUser) => {
      if (err) {
        dispatch(sync.updateUserFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.updateUserSuccess(loggedInUserId, updatedUser));
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
        if (err.status === 401) {
          // No need to record anything if user is currently not authenticated
          dispatch(sync.fetchUserFailure(null, err));
        } else {
          dispatch(sync.fetchUserFailure(ErrorMessages.STANDARD, err));
        }
      } else if (!utils.hasVerifiedEmail(user)) {
        dispatch(sync.fetchUserFailure(ErrorMessages.EMAIL_NOT_VERIFIED));
      } else {
        if (_.get(user, ['profile', 'patient'])) {
          api.patient.get(user.userid, (err, patient) => {
            if (err) {
              dispatch(sync.fetchUserFailure(ErrorMessages.STANDARD, err));
            } else {
              user = update(user, { $merge: patient });
              dispatch(sync.fetchUserSuccess(user));
            }
          });
        } else {
          dispatch(sync.fetchUserSuccess(user));
        }
      }
    });
  };
}

/**
 * Fetch Pending Sent Invites Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchPendingSentInvites(api) {
  return (dispatch) => {
    dispatch(sync.fetchPendingSentInvitesRequest());
    
    api.invitation.getSent((err, pending) => {
      if (err) {
        dispatch(sync.fetchPendingSentInvitesFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.fetchPendingSentInvitesSuccess(pending));
      }
    });
  };
}

/**
 * Fetch Pending Received Invites Action Creator
 * 
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchPendingReceivedInvites(api) {
  return (dispatch) => {
    dispatch(sync.fetchPendingReceivedInvitesRequest());
    
    api.invitation.getReceived((err, pending) => {
      if (err) {
        dispatch(sync.fetchPendingReceivedInvitesFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.fetchPendingReceivedInvitesSuccess(pending));
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
        dispatch(sync.fetchPatientFailure(ErrorMessages.STANDARD, err));
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
        dispatch(sync.fetchPatientsFailure(ErrorMessages.STANDARD, err));
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
export function fetchPatientData(api, id) {
  return (dispatch) => {
    dispatch(sync.fetchPatientDataRequest());

    async.parallel({
      patientData: api.patientData.get.bind(api, id),
      teamNotes: api.team.getNotes.bind(api, id)
    }, (err, results) => {
      if (err) {
        dispatch(sync.fetchPatientDataFailure(ErrorMessages.STANDARD, err));
      } else {
        let patientData = results.patientData || [];
        let notes = results.teamNotes || [];
        dispatch(sync.fetchPatientDataSuccess(id, patientData, notes));
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
        dispatch(sync.fetchMessageThreadFailure(ErrorMessages.STANDARD, err));
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
        dispatch(sync.logErrorFailure(ErrorMessages.STANDARD, err));
      } else {
        dispatch(sync.logErrorSuccess());
      }
    });
  }
}