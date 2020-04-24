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
import moment from 'moment';
import { checkCacheValid } from 'redux-cache';

import * as ErrorMessages from '../constants/errorMessages';
import * as UserMessages from '../constants/usrMessages';
import { DIABETES_DATA_TYPES } from '../../core/constants';
import * as sync from './sync.js';
import update from 'react-addons-update';
import personUtils from '../../core/personutils';

import { routeActions } from 'react-router-redux';
import { worker } from '.';

import utils from '../../core/utils';

import rollbar from '../../rollbar';

function createActionError(usrErrMessage, apiError) {
  const err = new Error(usrErrMessage);
  if (apiError) {
    err.originalError = apiError;
    if (apiError.status){
      err.status = apiError.status;
    }
  }
  return err;
}

/**
 * cacheByIdOptions
 *
 * Sets the options used by redux-cache for a given id. This allows us to selectively cache parts of
 * a nested data store, such as our allUsersMap, which stores nested data by patient ID
 *
 * @param {String} id - The ID to use for the cache key
 * @returns {Object} The options object
 */
function cacheByIdOptions(id) {
  return {
    accessStrategy: (state, reducerKey, cacheKey) => {
      return _.get(state.blip, [reducerKey, cacheKey], null);
    },
    cacheKey: `${id}_cacheUntil`,
  }
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

    api.user.signup(accountDetails, (err, user) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_SIGNUP;
        if (err.status && err.status === 409) {
          errMsg = ErrorMessages.ERR_ACCOUNT_ALREADY_EXISTS;
        }
        let error = createActionError(errMsg, err);
        dispatch(sync.signupFailure(error, err));
      } else {
        if (accountDetails.termsAccepted) {
          dispatch(acceptTerms(api, accountDetails.termsAccepted, user.userid));
        }
        dispatch(sync.signupSuccess(user));
        dispatch(routeActions.push('/email-verification'));
      }
    });
  };
}

/**
 * Confirm Signup Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} signupKey
 * @param  {String} signupEmail
 */
export function confirmSignup(api, signupKey, signupEmail) {
  return (dispatch) => {
    dispatch(sync.confirmSignupRequest());

    api.user.confirmSignUp(signupKey, function(err) {
      if (err) {
        dispatch(sync.confirmSignupFailure(
          createActionError(ErrorMessages.ERR_CONFIRMING_SIGNUP, err), err, signupKey
        ));
        if (err.status === 409) {
          dispatch(routeActions.push(`/verification-with-password?signupKey=${signupKey}&signupEmail=${signupEmail}`));
        }
      } else {
        dispatch(sync.confirmSignupSuccess())
      }
    })
  };
}

/**
 * Custodial Confirm Signup Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} signupKey
 * @param  {String} signupEmail
 * @param  {String} birthday
 * @param  {String} password
 */
export function verifyCustodial(api, signupKey, signupEmail, birthday, password) {
  return (dispatch, getState) => {
    const { blip: { working } } = getState();

    if (working.confirmingSignup.notification) {
      dispatch(sync.acknowledgeNotification('confirmingSignup'));
    }

    dispatch(sync.verifyCustodialRequest());

    api.user.custodialConfirmSignUp(signupKey, birthday, password, function(err) {
      if (err) {
        let errorMessage = ErrorMessages.ERR_CONFIRMING_SIGNUP;

        if (err.error && ErrorMessages.VERIFY_CUSTODIAL_ERRORS[err.error]) {
          errorMessage = ErrorMessages.VERIFY_CUSTODIAL_ERRORS[err.error];
        }

        dispatch(sync.verifyCustodialFailure(
          createActionError(errorMessage, err), err, signupKey
        ));
      } else {
        dispatch(login(api, {username: signupEmail, password: password}, null, sync.verifyCustodialSuccess));
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
        dispatch(sync.resendEmailVerificationFailure(
          createActionError(ErrorMessages.ERR_RESENDING_EMAIL_VERIFICATION, err), err
        ));
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
 * @param  {String} userId - passed in when accepting terms from the clinician signup form
 */
export function acceptTerms(api, acceptedDate, userId) {
  acceptedDate = acceptedDate || sundial.utcDateString();
  return (dispatch, getState) => {
    const { blip: { loggedInUserId } } = getState();
    dispatch(sync.acceptTermsRequest());

    api.user.acceptTerms({ termsAccepted: acceptedDate }, function(err, user) {
      if (err) {
        dispatch(sync.acceptTermsFailure(
          createActionError(ErrorMessages.ERR_ACCEPTING_TERMS, err), err
        ));
      } else {
        if (loggedInUserId) {
          dispatch(sync.acceptTermsSuccess(loggedInUserId, acceptedDate));
          if(personUtils.isClinic(user)){
            dispatch(routeActions.push('/clinician-details'));
          } else {
            dispatch(routeActions.push('/patients?justLoggedIn=true'));
          }
        } else {
          dispatch(sync.acceptTermsSuccess(userId, acceptedDate));
        }
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
 * @param  {?Function} postLoginAction optionalArgument action to call after login success
 */
export function login(api, credentials, options, postLoginAction) {
  return (dispatch) => {
    dispatch(sync.loginRequest());

    api.user.login(credentials, options, (err) => {
      if (err) {
        var error = (err.status === 401) ? createActionError(ErrorMessages.ERR_LOGIN_CREDS, err) :
          createActionError(ErrorMessages.ERR_LOGIN, err);

        if (err.status === 403) {
          dispatch(sync.loginFailure(null, err, { isLoggedIn: false, emailVerificationSent: false }));
          dispatch(routeActions.push('/email-verification'));
        } else {
          dispatch(sync.loginFailure(error, err));
        }
      } else {
        dispatch(fetchUser(api, (err, user) => {
          const isClinic = personUtils.isClinic(user);

          let redirectRoute = '/patients?justLoggedIn=true';
          if (isClinic && !_.get(user, ['profile', 'clinic'], false)) {
            redirectRoute = '/clinician-details';
          }

          if (err) {
            dispatch(sync.loginFailure(
              createActionError(ErrorMessages.ERR_FETCHING_USER, err), err
            ));
          } else {
            if (_.get(user, ['profile', 'patient'])) {
              dispatch(fetchPatient(api, user.userid, (err, patient) => {
                if (err) {
                  dispatch(sync.loginFailure(
                    createActionError(ErrorMessages.ERR_FETCHING_PATIENT, err), err
                  ));
                } else {
                  user = update(user, { $merge: patient });
                  dispatch(sync.loginSuccess(user));
                  if (postLoginAction) {
                    dispatch(postLoginAction());
                  }
                  dispatch(routeActions.push(redirectRoute));
                }
              }));
            } else {
              dispatch(sync.loginSuccess(user));
              if (postLoginAction) {
                dispatch(postLoginAction());
              }
              dispatch(routeActions.push(redirectRoute));
            }
          }
        }));
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
  return (dispatch, getState) => {
    const { blip: { currentPatientInViewId } } = getState();
    dispatch(sync.logoutRequest());
    dispatch(worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
    api.user.logout(() => {
      dispatch(sync.logoutSuccess());
      dispatch(routeActions.push('/'));
    });
  }
}

/**
 * Setup data storage Async Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patient
 */
export function setupDataStorage(api, patient) {
  return (dispatch, getState) => {
    const { blip: { loggedInUserId } } = getState();
    dispatch(sync.setupDataStorageRequest());

    api.patient.post(patient, (err, createdPatient) => {
      if (err) {
        dispatch(sync.setupDataStorageFailure(
          createActionError(ErrorMessages.ERR_DSA_SETUP, err), err
        ));
      } else {
        dispatch(sync.setupDataStorageSuccess(loggedInUserId, createdPatient));
        dispatch(routeActions.push(`/patients/${createdPatient.userid}/data`));
      }
    });
  }
}

/**
 * Remove membership in other care team Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patientId
 */
export function removeMembershipInOtherCareTeam(api, patientId) {
  return (dispatch) => {
    dispatch(sync.removeMembershipInOtherCareTeamRequest());

    api.access.leaveGroup(patientId, (err) => {
      if (err) {
        dispatch(sync.removeMembershipInOtherCareTeamFailure(
          createActionError(ErrorMessages.ERR_REMOVING_MEMBERSHIP, err), err
        ));
      } else {
        dispatch(sync.removeMembershipInOtherCareTeamSuccess(patientId));
        dispatch(fetchAssociatedAccounts(api));
      }
    });
  }
}

/**
 * Remove member from target care team Async Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String|Number} patientId
 * @param  {String|Number} memberId
 */
export function removeMemberFromTargetCareTeam(api, patientId, memberId, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.removeMemberFromTargetCareTeamRequest());

    api.access.removeMember(memberId, (err) => {
      cb(err, memberId);

      if (err) {
        dispatch(sync.removeMemberFromTargetCareTeamFailure(
          createActionError(ErrorMessages.ERR_REMOVING_MEMBER, err), err
        ));
      } else {
        dispatch(sync.removeMemberFromTargetCareTeamSuccess(memberId));
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
export function sendInvite(api, email, permissions, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.sendInviteRequest());

    api.invitation.send(email, permissions, (err, invite) => {
      cb(err, invite);

      if (err) {
        if (err.status === 409) {
          dispatch(sync.sendInviteFailure(
            createActionError(ErrorMessages.ERR_ALREADY_SENT_TO_EMAIL, err), err
          ));
        } else {
          dispatch(sync.sendInviteFailure(
            createActionError(ErrorMessages.ERR_SENDING_INVITE, err), err
          ));
        }
      } else {
        if (personUtils.isDataDonationAccount(invite)) {
          dispatch(fetchPendingSentInvites(api));
        }
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
export function cancelSentInvite(api, email, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.cancelSentInviteRequest());

    api.invitation.cancel(email, (err) => {
      cb(err, email);

      if (err) {
        dispatch(sync.cancelSentInviteFailure(
          createActionError(ErrorMessages.ERR_CANCELLING_INVITE, err), err
        ));
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
        dispatch(sync.acceptReceivedInviteFailure(
          createActionError(ErrorMessages.ERR_ACCEPTING_INVITE, err), err
        ));
      } else {
        dispatch(sync.acceptReceivedInviteSuccess(invite));
        dispatch(fetchPatient(api, invite.creator.userid));
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
        dispatch(sync.rejectReceivedInviteFailure(
          createActionError(ErrorMessages.ERR_REJECTING_INVITE, err), err
        ));
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
        dispatch(sync.setMemberPermissionsFailure(
          createActionError(ErrorMessages.ERR_CHANGING_PERMS, err), err
        ));
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
        dispatch(sync.updatePatientFailure(
          createActionError(ErrorMessages.ERR_UPDATING_PATIENT, err), err
        ));
      } else {
        dispatch(sync.updatePatientSuccess(updatedPatient));
      }
    });
  };
}

/**
 * Update Preferences Data Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patientId
 * @param  {Object} preferences
 */
export function updatePreferences(api, patientId, preferences) {
  return (dispatch) => {
    dispatch(sync.updatePreferencesRequest());

    api.metadata.preferences.put(patientId, preferences, (err, updatedPreferences) => {
      if (err) {
        dispatch(sync.updatePreferencesFailure(
          createActionError(ErrorMessages.ERR_UPDATING_PREFERENCES, err), err
        ));
      } else {
        dispatch(sync.updatePreferencesSuccess(updatedPreferences));
      }
    });
  };
}

/**
 * Fetch Settings Data Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patientId
 */
export function fetchSettings(api, patientId) {
  return (dispatch) => {
    dispatch(sync.fetchSettingsRequest());

    api.metadata.settings.get(patientId, (err, settings) => {
      if (err) {
        dispatch(sync.fetchSettingsFailure(
          createActionError(ErrorMessages.ERR_FETCHING_SETTINGS, err), err
        ));
      } else {
        dispatch(sync.fetchSettingsSuccess(settings));
      }
    });
  };
}

/**
 * Update Settings Data Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} patientId
 * @param  {Object} settings
 */
export function updateSettings(api, patientId, settings) {
  return (dispatch) => {
    const updatingBgUnits = !!_.get(settings, 'units.bg');

    dispatch(sync.updateSettingsRequest());
    updatingBgUnits && dispatch(sync.updatePatientBgUnitsRequest());

    api.metadata.settings.put(patientId, settings, (err, updatedSettings) => {
      if (err) {
        dispatch(sync.updateSettingsFailure(
          createActionError(ErrorMessages.ERR_UPDATING_SETTINGS, err), err
        ));
        updatingBgUnits && dispatch(sync.updatePatientBgUnitsFailure(
          createActionError(ErrorMessages.ERR_UPDATING_PATIENT_BG_UNITS, err), err
        ));
      } else {
        dispatch(sync.updateSettingsSuccess(patientId, updatedSettings));
        updatingBgUnits && dispatch(sync.updatePatientBgUnitsSuccess(patientId, updatedSettings));
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
      _.omit(loggedInUser, ['profile', 'preferences']),
      _.omit(formValues, ['profile', 'preferences']),
      {
        profile: _.assign({}, loggedInUser.profile, formValues.profile),
        preferences: _.assign({}, loggedInUser.preferences, formValues.preferences)
      }
    );

    dispatch(sync.updateUserRequest(loggedInUserId, _.omit(newUser, 'password')));

    var userUpdates = _.cloneDeep(newUser);
    if (userUpdates.username === loggedInUser.username) {
      userUpdates = _.omit(userUpdates, 'username', 'emails');
    }

    api.user.put(userUpdates, (err, updatedUser) => {
      if (err) {
        dispatch(sync.updateUserFailure(
          createActionError(ErrorMessages.ERR_UPDATING_USER, err), err
        ));
      } else {
        dispatch(sync.updateUserSuccess(loggedInUserId, updatedUser));
      }
    });
  };
}

/**
 * Update Clinician Profile Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param {userId} userId
 * @param  {Object} formValues
 */
export function updateClinicianProfile(api, formValues) {
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
        dispatch(sync.updateUserFailure(
          createActionError(ErrorMessages.ERR_UPDATING_USER, err), err
        ));
      } else {
        dispatch(sync.updateUserSuccess(loggedInUserId, updatedUser));
        dispatch(routeActions.push('/patients?justLoggedIn=true'));
      }
    });
  };
}

/**
 * Request Password Reset Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} email
 */
export function requestPasswordReset(api, email) {
  return (dispatch) => {
    dispatch(sync.requestPasswordResetRequest());

    api.user.requestPasswordReset(email, function(err) {
      if (err) {
        dispatch(sync.requestPasswordResetFailure(
          createActionError(ErrorMessages.ERR_REQUESTING_PASSWORD_RESET, err), err
        ));
      } else {
        dispatch(sync.requestPasswordResetSuccess())
      }
    })
  };
}

/**
 * Confirm Password Reset Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} formValues
 */
export function confirmPasswordReset(api, formValues) {
  return (dispatch) => {
    dispatch(sync.confirmPasswordResetRequest());

    api.user.confirmPasswordReset(formValues, function(err) {
      if (err) {
        dispatch(sync.confirmPasswordResetFailure(
          createActionError(ErrorMessages.ERR_CONFIRMING_PASSWORD_RESET, err), err
        ));
      } else {
        dispatch(sync.confirmPasswordResetSuccess())
      }
    })
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

/**
 * Fetch User Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchUser(api, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.fetchUserRequest());

    api.user.get((err, user) => {
      if (err) {
        if (err.status === 401) {
          // no need to surface an error if user is currently not authenticated
          dispatch(sync.fetchUserFailure(null, err));
        } else {
          dispatch(sync.fetchUserFailure(
            createActionError(ErrorMessages.ERR_FETCHING_USER, err), err
          ));
        }
      } else if (!utils.hasVerifiedEmail(user)) {
        dispatch(sync.fetchUserFailure(
          createActionError(ErrorMessages.ERR_EMAIL_NOT_VERIFIED)
        ));
      } else {
        dispatch(sync.fetchUserSuccess(user));
      }

      // Invoke callback if provided
      cb(err,user);
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
        dispatch(sync.fetchPendingSentInvitesFailure(
          createActionError(ErrorMessages.ERR_FETCHING_PENDING_SENT_INVITES, err), err
        ));
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
        dispatch(sync.fetchPendingReceivedInvitesFailure(
          createActionError(ErrorMessages.ERR_FETCHING_PENDING_RECEIVED_INVITES, err), err
        ));
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
export function fetchPatient(api, id, cb = _.noop) {
  return (dispatch, getState) => {
    // If we have a valid cache of the patient in our redux store, return without dispatching the fetch
    if(checkCacheValid(getState, 'allUsersMap', cacheByIdOptions(id))) {
      const patient = _.get(getState(), ['blip', 'allUsersMap', id]);
      // In cases where the patient was set via the results from getPatients, the settings will not
      // be present, and we need them for the data views, so we bypass the cache to ensure we get
      // the complete patient object
      if (_.get(patient, 'settings')) {
        dispatch(sync.fetchPatientSuccess(patient));

        // Invoke callback if provided
        cb(null, patient);
        return null;
      }
    }

    dispatch(sync.fetchPatientRequest());

    api.patient.get(id, (err, patient) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_FETCHING_PATIENT;
        let link = null;
        let status = _.get(err, 'status', null);
        const { blip: { loggedInUserId } } = getState();
        if (status === 404) {
          if (id === loggedInUserId) {
            errMsg = ErrorMessages.ERR_YOUR_ACCOUNT_NOT_CONFIGURED;
            link = {
              to: '/patients/new',
              text: UserMessages.YOUR_ACCOUNT_DATA_SETUP
            };
          } else {
            errMsg = ErrorMessages.ERR_ACCOUNT_NOT_CONFIGURED
          }
        }
        dispatch(sync.fetchPatientFailure(
          createActionError(errMsg, err), err, link
        ));
      } else {
        dispatch(sync.fetchPatientSuccess(patient));
      }

      // Invoke callback if provided
      cb(err, patient);
    });
  };
}

/**
 * Fetch Associated Accounts Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchAssociatedAccounts(api) {
  return (dispatch) => {
    dispatch(sync.fetchAssociatedAccountsRequest());

    api.user.getAssociatedAccounts((err, accounts) => {
      if (err) {
        dispatch(sync.fetchAssociatedAccountsFailure(
          createActionError(ErrorMessages.ERR_FETCHING_ASSOCIATED_ACCOUNTS, err), err
        ));
      } else {
        dispatch(sync.fetchAssociatedAccountsSuccess(accounts));
      }
    });
  };
}

/**
 * Fetch Patient Data Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} options
 * @param  {String|Number} id
 */
export function fetchPatientData(api, options, id) {
  // Default to only selecting the most recent 8 weeks of data
  _.defaults(options, {
    returnData: false,
    useCache: true,
    initial: true,
  });

  let latestUpload;

  return (dispatch, getState) => {
    // If we have a valid cache of the data in our redux store, return without dispatching the fetch
    const cacheOptions = {
      accessStrategy: (state, reducerKey, cacheKey) => {
        return _.get(state.blip, [reducerKey, cacheKey], null);
      },
      cacheKey: 'cacheUntil',
    };

    if (options.useCache && checkCacheValid(getState, 'data', cacheOptions)) {
      return null;
    }

    if (options.initial) {
      // On the initial fetch, we want to first find the latest diabetes datum time, and use that to
      // determine the ideal start and end date ranges for our data fetch
      const datumTypesToFetch = [...DIABETES_DATA_TYPES, 'pumpSettings', 'upload'];

      const initialFetchParams = {
        type: datumTypesToFetch.join(','),
        latest: 1,
      };

      // As a temporary workaround to some inefficiencies for this query on large datasets, we are
      // passing in an initial startDate param in the patientdata.js initial data fetcher.
      if (options.initialStartDate) initialFetchParams.startDate = options.initialStartDate;

      const initialFetchers = {
        serverTime: api.server.getTime.bind(api),
        latestDatums: api.patientData.get.bind(api, id, initialFetchParams),
      };

      async.parallel(async.reflectAll(initialFetchers), (err, results) => {
        const resultsErr = _.mapValues(results, ({error}) => error);
        const resultsVal = _.mapValues(results, ({value}) => value);
        const hasError = _.some(resultsErr, err => !_.isUndefined(err));

        if (hasError) {
          handleFetchErrors(resultsErr);
        }
        else {
          // On the initial fetch, we want to use the server time if we can in case the user's local
          // computer time is off and set the max endDate to one day in the future since we can get
          // `time` fields that are slightly (or not-so-slightly) in the future due to incorrect
          // device and/or computer time upon upload.
          const serverTime = _.get(resultsVal.serverTime, 'data.time');
          dispatch(sync.fetchServerTimeSuccess(serverTime));

          // We determine the date range to fetch data for by first finding the latest
          // diabetes datum time and going back 30 days
          const diabetesDatums = _.reject(resultsVal.latestDatums, d => _.includes(['food', 'upload'], d.type));
          const latestDiabetesDatumTime = _.max(_.map(diabetesDatums, d => (d.time)));

          if (moment.utc(latestDiabetesDatumTime).diff(moment.utc(serverTime), 'days') > 1) {
            _.isFunction(rollbar.error) && rollbar.error(
              new Error('Latest diabetes datum time is more than one day in the future'),
              {
                serverTime,
                latestDiabetesDatumTime,
                latestDatums: resultsVal.latestDatums,
              }
            );
          };

          // We want to use the server time as the max end date in case the user's local computer
          // time is off. We add add a one day buffer due to timezones and since we can get `time`
          // fields that are slightly in the future due to incorrect device and/or computer time
          // upon upload.
          const fetchFromTime = latestDiabetesDatumTime ? _.min([latestDiabetesDatumTime, serverTime]) : serverTime;
          options.startDate = moment.utc(fetchFromTime || options.browserTimeStub).subtract(30, 'days').startOf('day').toISOString();
          options.endDate = moment.utc(fetchFromTime || options.browserTimeStub).add(1, 'days').toISOString();

          // We want to make sure the latest upload, which may be beyond the data range we'll be
          // fetching, is stored so we can include it with the fetched results
          latestUpload = _.find(resultsVal.latestDatums, { type: 'upload' });
          const latestPumpSettings = _.find(resultsVal.latestDatums, { type: 'pumpSettings' });
          const latestPumpSettingsUploadId = _.get(latestPumpSettings || {}, 'uploadId');
          const latestPumpSettingsUpload = _.find(resultsVal.latestDatums, { type: 'upload', uploadId: latestPumpSettingsUploadId });

          if (latestPumpSettingsUploadId && !latestPumpSettingsUpload) {
            // If we have pump settings, but we don't have the corresponing upload record used
            // to get the device source, we need to fetch it
            options.getPumpSettingsUploadRecordById = latestPumpSettingsUploadId;
          }

          fetchData(options);
        }
      });
    }
    else {
      fetchData(options);
    }

    function handleFetchErrors(errors) {
      if (errors.serverTime) {
        dispatch(sync.fetchServerTimeFailure(
          createActionError(ErrorMessages.ERR_FETCHING_SERVER_TIME, errors.serverTime),
          errors.serverTime
        ));
      }
      if (errors.latestDatums) {
        dispatch(sync.fetchPatientDataFailure(
          createActionError(ErrorMessages.ERR_FETCHING_PATIENT_DATA, errors.latestDatums),
          errors.latestDatums
        ));
      }
      if (errors.patientData) {
        dispatch(sync.fetchPatientDataFailure(
          createActionError(ErrorMessages.ERR_FETCHING_PATIENT_DATA, errors.patientData),
          errors.patientData
        ));
      }
      if (errors.teamNotes) {
        dispatch(sync.fetchMessageThreadFailure(
          createActionError(ErrorMessages.ERR_FETCHING_MESSAGE_THREAD, errors.teamNotes),
          errors.teamNotes
        ));
      }
      if (errors.latestPumpSettingsUpload) {
        dispatch(sync.fetchPatientDataFailure(
          createActionError(ErrorMessages.ERR_FETCHING_LATEST_PUMP_SETTINGS_UPLOAD, errors.latestPumpSettingsUpload),
          errors.latestPumpSettingsUpload
        ));
      }
    }

    function handleFetchSuccess(data, patientId, options) {
      const { blip: { working }, routing: { location } } = getState();
      const fetchingPatientId = _.get(working, 'fetchingPatientData.patientId');

      dispatch(sync.fetchPatientDataSuccess(id));

      // We only add the data to the worker if another patient id has not been fetched
      // while we waited on this one, and we are still on an app view specific to that patient
      if (location.pathname.indexOf(id) >= 0 && (!fetchingPatientId || fetchingPatientId === id)) {
        dispatch(worker.dataWorkerAddDataRequest(data, options.returnData, patientId, options.startDate));
      }
    }

    function fetchData(options) {
      dispatch(sync.fetchPatientDataRequest(id));

      const fetchers = {
        patientData: api.patientData.get.bind(api, id, options),
        teamNotes: api.team.getNotes.bind(api, id, _.assign({}, options, {
          start: options.startDate,
          end: options.endDate,
        })),
      };

      if (options.getPumpSettingsUploadRecordById) {
        fetchers.latestPumpSettingsUpload = api.patientData.get.bind(api, id, {
          type: 'upload',
          uploadId: options.getPumpSettingsUploadRecordById,
        });
      }

      async.parallel(async.reflectAll(fetchers), (err, results) => {
        const resultsErr = _.mapValues(results, ({error}) => error);
        const resultsVal = _.mapValues(results, ({value}) => value);
        const hasError = _.some(resultsErr, err => !_.isUndefined(err));

        if (hasError) {
          handleFetchErrors(resultsErr);
        }
        else {
          const combinedData = [
            ...resultsVal.patientData,
            ...resultsVal.latestPumpSettingsUpload || [],
            ...resultsVal.teamNotes,
          ];

          // If the latest upload is later than the latest diabetes datum, it would have been
          // outside of the fetched data range, and needs to be added.
          if (latestUpload && !_.find(combinedData, { id: latestUpload.id })) {
            combinedData.push(latestUpload);
          }

          handleFetchSuccess(combinedData, id, options);
        }
      });
    };
  }
}

/**
 * Fetch Message Thread Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String|Number} id
 */
export function fetchMessageThread(api, id ) {
  return (dispatch) => {
    dispatch(sync.fetchMessageThreadRequest());

    api.team.getMessageThread(id, (err, messageThread) => {
      if (err) {
        dispatch(sync.fetchMessageThreadFailure(
          createActionError(ErrorMessages.ERR_FETCHING_MESSAGE_THREAD, err), err
        ));
      } else {
        dispatch(sync.fetchMessageThreadSuccess(messageThread));
      }
    });
  };
}

/**
 * Create Message Thread Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} message to be created
 */
export function createMessageThread(api, message, cb = _.noop) {
  return (dispatch, getState) => {
    dispatch(sync.createMessageThreadRequest());

    api.team.startMessageThread(message, (err, messageId) => {
      cb(err, messageId);

      if (err) {
        dispatch(sync.createMessageThreadFailure(
          createActionError(ErrorMessages.ERR_CREATING_MESSAGE_THREAD, err), err
        ));
      } else {
        const messageWithId = { ...message, id: messageId };
        const { blip: { currentPatientInViewId } } = getState();
        dispatch(sync.createMessageThreadSuccess(messageWithId));
        dispatch(worker.dataWorkerAddDataRequest([messageWithId], true, currentPatientInViewId));
      }
    });
  };
}

/**
 * Edit Message Thread Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {Object} updated message
 */
export function editMessageThread(api, message, cb = _.noop) {
  return (dispatch, getState) => {
    dispatch(sync.editMessageThreadRequest());

    api.team.editMessage(message, err => {
      cb(err);

      if (err) {
        dispatch(sync.editMessageThreadFailure(
          createActionError(ErrorMessages.ERR_EDITING_MESSAGE_THREAD, err), err
        ));
      } else {
        const { blip: { currentPatientInViewId } } = getState();
        dispatch(sync.editMessageThreadSuccess(message));
        dispatch(worker.dataWorkerUpdateDatumRequest(message, currentPatientInViewId));
      }
    });
  };
}

/**
 * Update Data Donation Accounts Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function updateDataDonationAccounts(api, addAccounts = [], removeAccounts = []) {
  return (dispatch, getState) => {
    dispatch(sync.updateDataDonationAccountsRequest());

    const { blip: { loggedInUserId } } = getState();

    const addAccount = (email, cb) => {
      const permissions = {
        view: {},
        note: {},
      };

      dispatch(sendInvite(api, email, permissions, cb));
    }

    const removeAccount = (account, cb) => {
      if (account.userid) {
        dispatch(removeMemberFromTargetCareTeam(api, loggedInUserId, account.userid, cb));
      } else {
        dispatch(cancelSentInvite(api, account.email, cb));
      }
    }

    async.parallel(async.reflectAll({
      addAccounts:  cb => { async.map(addAccounts, addAccount, (err, results) => cb(err, results)) },
      removeAccounts: cb => { async.map(removeAccounts, removeAccount, (err, results) => cb(err, results)) },
    }), (err, results) => {
      const resultsErr = _.mapValues(results, ({error}) => error);
      const resultsVal = _.mapValues(results, ({value}) => value);
      const error = resultsErr.addAccounts || resultsErr.removeAccounts;
      if (error) {
        dispatch(sync.updateDataDonationAccountsFailure(
          createActionError(ErrorMessages.ERR_UPDATING_DATA_DONATION_ACCOUNTS, error), error
        ));
      } else {
        dispatch(sync.updateDataDonationAccountsSuccess(resultsVal));
      }
    });
  };
}

/**
 * Dismiss Donate Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function dismissDonateBanner(api, patientId, dismissedDate) {
  dismissedDate = dismissedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('donate'));

    const preferences = {
      dismissedDonateYourDataBannerTime: dismissedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}

/**
 * Dismiss Dexcom Connect Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function dismissDexcomConnectBanner(api, patientId, dismissedDate) {
  dismissedDate = dismissedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('dexcom'));

    const preferences = {
      dismissedDexcomConnectBannerTime: dismissedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}

/**
 * Click Donate Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function clickDexcomConnectBanner(api, patientId, clickedDate) {
  clickedDate = clickedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('dexcom'));

    const preferences = {
      clickedDexcomConnectBannerTime: clickedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}

/**
 * Fetch Data Sources
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function fetchDataSources(api) {
  return (dispatch) => {
    dispatch(sync.fetchDataSourcesRequest());

    api.user.getDataSources((err, dataSources) => {
      if (err) {
        dispatch(sync.fetchDataSourcesFailure(
          createActionError(ErrorMessages.ERR_FETCHING_DATA_SOURCES, err), err
        ));
      } else {
        dispatch(sync.fetchDataSourcesSuccess(dataSources));
      }
    });
  };
}

/**
 * Connect Data Source
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} id the internal provider id
 * @param  {Object} restrictedTokenCreate the restricted token creation object
 * @param  {Object} dataSourceFilter the filter for the data source
 */
export function connectDataSource(api, id, restrictedTokenCreate, dataSourceFilter) {
  return (dispatch) => {
    dispatch(sync.connectDataSourceRequest());

    if (dataSourceFilter.providerType !== 'oauth') {
      let err = 'Unknown data source type';
      dispatch(sync.connectDataSourceFailure(
        createActionError(ErrorMessages.ERR_CONNECTING_DATA_SOURCE, err), err
      ));
    } else {
      api.user.createRestrictedToken(restrictedTokenCreate, (err, restrictedToken) => {
        if (err) {
          dispatch(sync.connectDataSourceFailure(
            createActionError(ErrorMessages.ERR_CONNECTING_DATA_SOURCE, err), err
          ));
        } else {
          restrictedToken = _.get(restrictedToken, 'id');
          api.user.createOAuthProviderAuthorization(dataSourceFilter.providerName, restrictedToken, (err, url) => {
            if (err) {
              dispatch(sync.connectDataSourceFailure(
                createActionError(ErrorMessages.ERR_CONNECTING_DATA_SOURCE, err), err
              ));
              return
            } else {
              dispatch(sync.connectDataSourceSuccess(id, url));
            }
          });
        }
      });
    }
  };
}

/**
 * Disconnect Data Source
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} id the internal provider id
 * @param  {Object} dataSourceFilter the filter for the data source
 */
export function disconnectDataSource(api, id, dataSourceFilter) {
  return (dispatch) => {
    dispatch(sync.disconnectDataSourceRequest());

    if (dataSourceFilter.providerType !== 'oauth') {
      let err = 'Unknown data source type';
      dispatch(sync.disconnectDataSourceFailure(
        createActionError(ErrorMessages.ERR_DISCONNECTING_DATA_SOURCE, err), err
      ));
    } else {
      api.user.deleteOAuthProviderAuthorization(dataSourceFilter.providerName, (err, restrictedToken) => {
        if (err) {
          dispatch(sync.disconnectDataSourceFailure(
            createActionError(ErrorMessages.ERR_DISCONNECTING_DATA_SOURCE, err), err
          ));
        } else {
          dispatch(sync.disconnectDataSourceSuccess());
        }
      });
    }
  };
}
