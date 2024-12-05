import _ from 'lodash';
import sundial from 'sundial';
import async from 'async';
import moment from 'moment';
import { checkCacheValid } from 'redux-cache';

import * as ErrorMessages from '../constants/errorMessages';
import * as UserMessages from '../constants/usrMessages';
import { ALL_FETCHED_DATA_TYPES, DIABETES_DATA_TYPES } from '../../core/constants';
import * as sync from './sync.js';
import update from 'immutability-helper';
import personUtils from '../../core/personutils';
import { keycloak } from '../../keycloak';
import { push } from 'connected-react-router';
import { worker } from '.';

import utils from '../../core/utils';
import { clinicUIDetails } from '../../core/clinicUtils.js';

let win = window;

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
        dispatch(push('/email-verification'));
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
        let errMsg = ErrorMessages.ERR_CONFIRMING_SIGNUP;
        if (_.get(err, 'status') === 404) {
          errMsg = ErrorMessages.ERR_CONFIRMING_SIGNUP_NOMATCH;
        }
        dispatch(sync.confirmSignupFailure(
          createActionError(errMsg, err), err, signupKey
        ));
        if (err.status === 409) {
          dispatch(push(`/verification-with-password?signupKey=${signupKey}&signupEmail=${signupEmail}`));
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
        const { blip: { keycloakConfig } } = getState();
        if (keycloakConfig.initialized) {
          keycloak.login({ loginHint: signupEmail, redirectUri: win.location.origin + '/login' });
        } else {
          dispatch(login(api, { username: signupEmail, password: password }, null, sync.verifyCustodialSuccess));
        }
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
          if(personUtils.isClinicianAccount(user)){
            dispatch(push('/clinician-details'));
          } else {
            dispatch(push('/patients/new'));
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
  return (dispatch, getState) => {
    dispatch(sync.loginRequest());

    const routes = {
      patients: '/patients?justLoggedIn=true',
      newPatient: '/patients/new',
      workspaces: '/workspaces',
      clinicDetails: '/clinic-details',
      clinicWorkspace: '/clinic-workspace',
      profile: '/profile',
    };

    let redirectRoute = routes.patients;
    let {
      blip: { selectedClinicId = null },
      router: routerState,
    } = getState();
    let dest = routerState?.location?.query?.dest;
    let hasDest = dest && dest !== '/';
    if (hasDest) {
      redirectRoute = dest;
    }

    api.user.login(credentials, options, (err) => {
      if (err) {
        var error = (err.status === 401) ? createActionError(ErrorMessages.ERR_LOGIN_CREDS, err) :
          createActionError(ErrorMessages.ERR_LOGIN, err);

        if (err.status === 403) {
          dispatch(sync.loginFailure(null, err, { isLoggedIn: false, emailVerificationSent: false }));
          dispatch(push('/email-verification'));
        } else {
          dispatch(sync.loginFailure(error, err));
        }
      } else {
        dispatch(fetchUser(api, (err, user) => {
          if (err) {
            handleLoginFailure(ErrorMessages.ERR_FETCHING_USER, err);
          } else {
            const userHasClinicProfile = !!_.get(user, ['profile', 'clinic'], false);
            const isClinicianAccount = personUtils.isClinicianAccount(user);
            const hasClinicianRole = _.includes(user.roles, 'clinician');
            const hasLegacyClinicRole = _.includes(user.roles, 'clinic');
            const userHasFullName = !_.isEmpty(user.profile.fullName);

            // Fetch clinic-clinician relationships and pending clinic invites, and only proceed
            // to the clinic workflow if a relationship with a clinic object or an invite exists.
            const fetchers = {
              clinics: cb => dispatch(getClinicsForClinician(api, user.userid, { limit: 1000, offset: 0 }, cb)),
              invites: cb => dispatch(fetchClinicianInvites(api, user.userid, cb)),
              associatedAccounts: cb => dispatch(fetchAssociatedAccounts(api, cb)),
            };

            async.parallel(async.reflectAll(fetchers), (err, results) => {
              const errors = _.mapValues(results, ({error}) => error);
              const values = _.mapValues(results, ({value}) => value);
              const hasError = err || _.some(errors, err => !_.isUndefined(err));

              if (hasError) {
                if (errors) {
                  if (errors.clinics) {
                    handleLoginFailure(ErrorMessages.ERR_FETCHING_CLINICS_FOR_CLINICIAN, errors.clinics);
                  }
                  if (errors.invites) {
                    handleLoginFailure(ErrorMessages.ERR_FETCHING_CLINICIAN_INVITES, errors.invites);
                  }
                  if (errors.associatedAccounts) {
                    handleLoginFailure(ErrorMessages.ERR_FETCHING_ASSOCIATED_ACCOUNTS, errors.associatedAccounts);
                  }
                } else {
                  handleLoginFailure(ErrorMessages.ERR_LOGIN, err);
                }
              }
              else {
                if (values.invites?.length) {
                  // If that the initial selectedClinicId state is available, and the user is on an
                  // internal route, such as on page refresh, dispatch the selectClinic action so
                  // that middlewares (currently Pendo and LaunchDarkly) can react to it.
                  if (userHasClinicProfile && selectedClinicId && hasDest) {
                    dispatch(selectClinic(api, selectedClinicId));
                  }

                  // If we have an empty clinic profile, go to clinic details, otherwise workspaces
                  setRedirectRoute(!userHasClinicProfile ? `${routes.clinicDetails}/profile` : routes.workspaces);
                } else if (values.clinics?.length) {
                  const clinicMigration = _.find(values.clinics, clinic => _.isEmpty(clinic.clinic?.name) || clinic.clinic?.canMigrate);

                  if (!clinicMigration && (values.clinics.length === 1 || selectedClinicId)) {
                    // Go to the clinic workspace if only one clinic or there is a currently selected clinic
                    if (values.clinics.length === 1) {
                      selectedClinicId = values.clinics[0]?.clinic?.id;
                    }
                    dispatch(selectClinic(api, selectedClinicId));
                    setRedirectRoute(routes.clinicWorkspace, selectedClinicId);
                  } else {
                    // If we have an empty clinic object, go to clinic details, otherwise workspaces
                    if (hasLegacyClinicRole && clinicMigration) {
                      dispatch(selectClinic(api, clinicMigration.clinic?.id));
                      setRedirectRoute(`${routes.clinicDetails}/migrate`, values.clinics[0]?.clinic?.id);
                    } else {
                      setRedirectRoute(routes.workspaces);
                    }
                  }
                } else if (hasClinicianRole || (isClinicianAccount && !userHasClinicProfile)) {
                  // New clinician accounts that are intended to leverage the new clinic workspace
                  // will have the 'clinician' role assigned at signup, and should be directed to the
                  // clinic workspace to create their clinic profile and add a clinic if they have
                  // not already done so.
                  setRedirectRoute(!userHasClinicProfile ? `${routes.clinicDetails}/profile` : routes.workspaces);
                } else if (!userHasFullName) {
                  setRedirectRoute(routes.newPatient);
                } else {
                  getPatientProfile();
                }
              }
            });

            function setRedirectRoute(route, clinicId = null) {
              redirectRoute = hasDest ? dest : route;
              if (clinicId) {
                selectedClinicId = clinicId;
              }
              getPatientProfile();
            }

            function getPatientProfile() {
              if (_.get(user, ['profile', 'patient'])) {
                dispatch(fetchPatient(api, user.userid, (err, patient) => {
                  if (err) {
                    handleLoginFailure(ErrorMessages.ERR_FETCHING_PATIENT, err);
                  } else {
                    user = update(user, { $merge: patient });
                    handleLoginSuccess(user)
                  }
                }));
              } else {
                handleLoginSuccess(user)
              }
            }
          }

          function handleLoginSuccess(user) {
            dispatch(sync.loginSuccess(user));

            if (postLoginAction) {
              dispatch(postLoginAction());
            }

            const redirectState = {
              selectedClinicId,
            };

            dispatch(push(redirectRoute, redirectState));
          }

          function handleLoginFailure(message, err) {
            dispatch(sync.loginFailure(
              createActionError(message, err), err
            ));

            dispatch(logout(api));
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
    const { blip: { currentPatientInViewId, keycloakConfig } } = getState();
    dispatch(sync.logoutRequest());
    dispatch(worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
    api.user.logout(() => {
      dispatch(sync.logoutSuccess());
      if(keycloakConfig.logoutUrl){
        win.location.assign(keycloakConfig.logoutUrl);
      } else {
        dispatch(push('/'));
      }
    });
  }
}

/**
 * Logged out Async Action Creator
 *
 * @param {Object} api an instance of the API wrapper
 */
export function loggedOut(api) {
  return (dispatch, getState) => {
    const { blip: { currentPatientInViewId } } = getState();
    dispatch(sync.logoutRequest());
    dispatch(worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
    api.user.logout(() => {
      dispatch(sync.logoutSuccess());
      dispatch(push('/logged-out'));
    })
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
export function removeMembershipInOtherCareTeam(api, patientId, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.removeMembershipInOtherCareTeamRequest());

    api.access.leaveGroup(patientId, (err) => {
      cb(err);
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
 * Resend Invite Async Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 * @param  {String} email
 * @param  {Object} permissions
 */
export function resendInvite(api, inviteId) {
  return (dispatch) => {
    dispatch(sync.resendInviteRequest());

    api.invitation.resend(inviteId, (err, invite) => {
      if (err) {
        dispatch(sync.resendInviteFailure(
          createActionError(ErrorMessages.ERR_RESENDING_INVITE, err), err
        ));
      } else {
        dispatch(sync.resendInviteSuccess(invite, inviteId));
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
        let errMsg = ErrorMessages.ERR_UPDATING_PATIENT;
        if(err?.status === 409) {
          errMsg = ErrorMessages.ERR_ACCOUNT_ALREADY_EXISTS;
        }
        dispatch(sync.updatePatientFailure(
          createActionError(errMsg, err), err
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
        let errMsg = ErrorMessages.ERR_UPDATING_USER;
        if (err?.status === 409) {
          errMsg = ErrorMessages.ERR_UPDATING_USER_EMAIL_IN_USE;
        }
        dispatch(sync.updateUserFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.updateUserSuccess(loggedInUserId, updatedUser));
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
        err = createActionError(ErrorMessages.ERR_EMAIL_NOT_VERIFIED);
        dispatch(sync.fetchUserFailure(err));
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
        if (status === 401) {
          if (id === loggedInUserId){
            errMsg = ErrorMessages.ERR_FETCHING_PATIENT_UNAUTHORIZED;
          } else {
            errMsg = ErrorMessages.ERR_FETCHING_PATIENT_CLINICIAN_UNAUTHORIZED;
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
export function fetchAssociatedAccounts(api, cb = _.noop) {
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

      // Invoke callback if provided
      cb(err, accounts);
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
    type: ALL_FETCHED_DATA_TYPES.join(','),
  });

  let latestUpload;
  let latestPumpSettings;

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
      // On the initial fetch for latest diabetes datums, we want to use the server time if we can
      // in case the user's local computer time is off and set the endDate to one day in the future
      // since we can get `time` fields that are slightly (or not-so-slightly) in the future due to
      // incorrect device time and/or computer time upon upload.
      dispatch(sync.fetchServerTimeRequest());
      api.server.getTime((err, results) => {
        let serverTime;

        if (err) {
          dispatch(sync.fetchServerTimeFailure(
            createActionError(ErrorMessages.ERR_FETCHING_SERVER_TIME, err), err
          ));
        }
        else {
          serverTime = _.get(results, 'data.time');
          dispatch(sync.fetchServerTimeSuccess(serverTime));
        }

        // Now that we have the server time, we want to find the latest non-future diabetes datum
        // times, and use that to determine the ideal start and end date ranges for our data fetch
        const datumTypesToFetch = [...DIABETES_DATA_TYPES, 'pumpSettings', 'upload'];

        const latestDatumsFetchParams = {
          type: datumTypesToFetch.join(','),
          latest: 1,
          endDate: moment.utc(serverTime).add(1, 'days').toISOString(),
        };

        api.patientData.get(id, latestDatumsFetchParams, (err, latestDatums) => {
          if (err) {
            const { blip: { loggedInUserId } } = getState();
            let errMsg = ErrorMessages.ERR_FETCHING_PATIENT_DATA
            if (err?.status === 403) {
              if(loggedInUserId === id) {
                errMsg = ErrorMessages.ERR_FETCHING_PATIENT_DATA_UNAUTHORIZED
              } else {
                errMsg = ErrorMessages.ERR_FETCHING_PATIENT_DATA_CLINICIAN_UNAUTHORIZED
              }
            }
            dispatch(sync.fetchPatientDataFailure(
              createActionError(errMsg, err), err
            ));
          } else {
            // We then determine the date range to fetch data for by first finding the latest
            // diabetes datum time and going back 30 days
            const diabetesDatums = _.reject(latestDatums, d => _.includes(['food', 'upload', 'pumpSettings'], d.type));
            const latestDiabetesDatumTime = _.max(_.map(diabetesDatums, d => (d.time)));
            const latestDatumTime = _.max(_.map(latestDatums, d => (d.time)));

            // If we have no latest diabetes datum time, we fall back to use the server time as the
            // ideal end date.
            const fetchFromTime = latestDiabetesDatumTime || serverTime;
            const fetchToTime = latestDatumTime || serverTime;

            options.startDate = moment.utc(fetchFromTime).subtract(30, 'days').startOf('day').toISOString();

            // We add a 1 day buffer to the end date since we can get `time` fields that are slightly
            // in the future due to timezones or incorrect device and/or computer time upon upload.
            options.endDate = moment.utc(fetchToTime).add(1, 'days').toISOString();

            // We want to make sure the latest upload, which may be beyond the data range we'll be
            // fetching, is stored so we can include it with the fetched results
            latestUpload = _.find(latestDatums, { type: 'upload' });
            latestPumpSettings = _.find(latestDatums, { type: 'pumpSettings' });
            const latestPumpSettingsUploadId = _.get(latestPumpSettings || {}, 'uploadId');
            const latestPumpSettingsUpload = _.find(latestDatums, { type: 'upload', uploadId: latestPumpSettingsUploadId });

            if (latestPumpSettingsUploadId && !latestPumpSettingsUpload) {
              // If we have pump settings, but we don't have the corresponing upload record used
              // to get the device source, we need to fetch it
              options.getPumpSettingsUploadRecordById = latestPumpSettingsUploadId;
            }

            fetchData(options);
          }
        });
      });
    }
    else {
      fetchData(options);
    }

    function handleFetchErrors(errors) {
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
      const { blip: { working }, router: { location } } = getState();
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
            ...(resultsVal.latestPumpSettingsUpload || []),
            ...resultsVal.teamNotes,
          ];

          // If the latest upload or pumpSettings is later than the latest diabetes datum, it would have been
          // outside of the fetched data range, and needs to be added.
          if (latestUpload && !_.find(combinedData, { id: latestUpload.id })) {
            combinedData.push(latestUpload);
          }
          if (latestPumpSettings && !_.find(combinedData, { id: latestPumpSettings.id })) {
            combinedData.push(latestPumpSettings);
          }

          handleFetchSuccess(combinedData, id, options);
        }
      });
    };
  };
}

/**
 * Fetch Prescriptions Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 */
export function fetchClinicPrescriptions(api, clinicId, options = {}) {
  _.defaults(options, {
    size: 1000,
  });

  return (dispatch) => {
    dispatch(sync.fetchClinicPrescriptionsRequest());

    api.prescription.getAllForClinic(clinicId, options, (err, prescriptions) => {
      if (err) {
        dispatch(sync.fetchClinicPrescriptionsFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINIC_PRESCRIPTIONS, err), err
        ));
      } else {
        dispatch(sync.fetchClinicPrescriptionsSuccess(prescriptions));
      }
    });
  };
}

/**
 * Create Prescription Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param  {Object} prescription to be created
 */
export function createPrescription(api, clinicId, prescription) {
  return (dispatch) => {
    dispatch(sync.createPrescriptionRequest());

    api.prescription.create(clinicId, prescription, (err, result) => {
      if (err) {
        dispatch(sync.createPrescriptionFailure(
          createActionError(ErrorMessages.ERR_CREATING_PRESCRIPTION, err), err
        ));
      } else {
        dispatch(sync.createPrescriptionSuccess(result));
      }
    });
  };
}

/**
 * Create Prescription Revision Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param  {Object} revision revision to be created
 * @param  {String} prescriptionID id of prescription to add revision to
 */
export function createPrescriptionRevision(api, clinicId, revision, prescriptionId) {
  return (dispatch) => {
    dispatch(sync.createPrescriptionRevisionRequest());

    api.prescription.createRevision(clinicId, revision, prescriptionId, (err, prescription) => {
      if (err) {
        dispatch(sync.createPrescriptionRevisionFailure(
          createActionError(ErrorMessages.ERR_CREATING_PRESCRIPTION_REVISION, err), err
        ));
      } else {
        dispatch(sync.createPrescriptionRevisionSuccess(prescription));
      }
    });
  };
}

/**
 * Delete Prescription Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param  {String} prescriptionID id of prescription to be deleted
 */
export function deletePrescription(api, clinicId, prescriptionId) {
  return (dispatch) => {
    dispatch(sync.deletePrescriptionRequest(prescriptionId));

    api.prescription.delete(clinicId, prescriptionId, (err) => {
      if (err) {
        dispatch(sync.deletePrescriptionFailure(
          createActionError(ErrorMessages.ERR_DELETING_PRESCRIPTION, err), err
        ));
      } else {
        dispatch(sync.deletePrescriptionSuccess(prescriptionId));
      }
    });
  };
}

/**
 * Fetch Devices Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 */
export function fetchDevices(api) {
  return (dispatch) => {
    dispatch(sync.fetchDevicesRequest());

    api.devices.getAll((err, devices) => {
      if (err) {
        dispatch(sync.fetchDevicesFailure(
          createActionError(ErrorMessages.ERR_FETCHING_DEVICES, err), err
        ));
      } else {
        dispatch(sync.fetchDevicesSuccess(devices));
      }
    });
  };
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
 * Click Dexcom Banner Action Creator
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
 * Dismiss Update Type Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function dismissUpdateTypeBanner(api, patientId, dismissedDate) {
  dismissedDate = dismissedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('updatetype'));

    const preferences = {
      dismissedUpdateTypeBannerTime: dismissedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}

/**
 * Click Update Type Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function clickUpdateTypeBanner(api, patientId, clickedDate) {
  clickedDate = clickedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('updatetype'));

    const preferences = {
      clickedUpdateTypeBannerTime: clickedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}

/**
 * Dismiss Uploader Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function dismissUploaderBanner(api, patientId, dismissedDate) {
  dismissedDate = dismissedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('uploader'));

    const preferences = {
      dismissedUploaderBannerTime: dismissedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}

/**
 * Click Uploader Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function clickUploaderBanner(api, patientId, clickedDate) {
  clickedDate = clickedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('uploader'));

    const preferences = {
      clickedUploaderBannerTime: clickedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}


/**
 * Dismiss Share Data Connect Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function dismissShareDataBanner(api, patientId, dismissedDate) {
  dismissedDate = dismissedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('sharedata'));

    const preferences = {
      dismissedShareDataBannerTime: dismissedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}

/**
 * Click Share Data Banner Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function clickShareDataBanner(api, patientId, clickedDate) {
  clickedDate = clickedDate || sundial.utcDateString();

  return (dispatch) => {
    dispatch(sync.dismissBanner('sharedata'));

    const preferences = {
      clickedShareDataBannerTime: clickedDate,
    };

    dispatch(updatePreferences(api, patientId, preferences));
  };
}

/**
 * Count Share Data Banner Seen Action Creator
 *
 * @param  {Object} api an instance of the API wrapper
 */
export function updateShareDataBannerSeen(api, patientId) {
  const viewDate = sundial.utcDateString();
  const viewMoment = moment(viewDate);

  return (dispatch, getState) => {
    const { blip: { loggedInUserId, allUsersMap } } = getState();
    const loggedInUser = allUsersMap[loggedInUserId];
    var seenShareDataBannerDate = _.get(loggedInUser, 'preferences.seenShareDataBannerDate', 0);
    var seenShareDataBannerCount = _.get(loggedInUser, 'preferences.seenShareDataBannerCount', 0);

    const seenShareDataBannerMoment = moment(seenShareDataBannerDate);

    const diffMoment = viewMoment.diff(seenShareDataBannerMoment, 'days');

    if(diffMoment > 0) {
      seenShareDataBannerCount += 1;
      seenShareDataBannerDate = viewDate;
    }

    const preferences = {
      seenShareDataBannerDate: seenShareDataBannerDate,
      seenShareDataBannerCount: seenShareDataBannerCount,
    };

    dispatch(sync.bannerCount(seenShareDataBannerCount));
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

/**
 * Get All Clinics Action Creator
 *
 * @param {Object} options
 * @param {Number} [options.limit] - Query result limit
 * @param {Number} [options.offset] - Query offset
 * @param {String} [options.email] - Email address
 * @param {Object} api - an instance of the API wrapper
 */
export function getAllClinics(api, options = {}, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.getClinicsRequest());

    api.clinics.getAll(options, (err, clinics) => {
      cb(err, clinics);
      if (err) {
        dispatch(sync.getClinicsFailure(
          createActionError(ErrorMessages.ERR_GETTING_CLINICS, err), err
        ));
      } else {
        dispatch(sync.getClinicsSuccess(clinics, options));

        // for each fetched clinic, get EHR and MRN settings
        _.forEach(clinics, clinic => {
          dispatch(fetchClinicEHRSettings(api, clinic.id));
          dispatch(fetchClinicMRNSettings(api, clinic.id));
        });
      }
    });
  };
}

/**
 * Create Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {Object} clinic - New clinic
 * @param {String} [clinic.name] - Clinic name
 * @param {String} [clinic.address] - Clinic address
 * @param {String} [clinic.city] - Clinic city
 * @param {String} [clinic.postalCode] - Clinic Zip code
 * @param {String} [clinic.state] - Clinic state
 * @param {String} [clinic.country] - Clinic 2-character country code
 * @param {String} [clinic.clinicType] - Clinic type
 * @param {String} clinic.email - Primary email address for clinic
 * @param {String} clinicianId - Id of clinician creating the clinic
 */
export function createClinic(api, clinic, clinicianId) {
  return (dispatch) => {
    dispatch(sync.createClinicRequest());

    api.clinics.create(clinic, (err, clinic) => {
      if (err) {
        dispatch(
          sync.createClinicFailure(
            createActionError(ErrorMessages.ERR_CREATING_CLINIC, err),
            err
          )
        );
      } else {
        dispatch(sync.createClinicSuccess(clinic));
        dispatch(selectClinic(api, clinic.id));
        dispatch(getClinicsForClinician(api, clinicianId, { limit: 1000, offset: 0 }));
      }
    });
  };
}

/**
 * Fetch Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 */
export function fetchClinic(api, clinicId) {
  return (dispatch) => {
    dispatch(sync.fetchClinicRequest());

    api.clinics.get(clinicId, (err, clinic) => {
      if (err) {
        dispatch(sync.fetchClinicFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINIC, err), err
        ));
      } else {
        dispatch(sync.fetchClinicSuccess(clinic));
        // fill in EHR and MRN settings
        dispatch(fetchClinicEHRSettings(api, clinic.id));
        dispatch(fetchClinicMRNSettings(api, clinic.id));
      }
    });
  };
}

/**
 * Fetch Clinics By IDs Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {Array} clinicIds - Array of clinic Ids of the clinics to fetch
 */
export function fetchClinicsByIds(api, clinicIds) {
  return (dispatch) => {
    dispatch(sync.fetchClinicsByIdsRequest());

    const fetchers = {};

    _.forEach(clinicIds, clinicId => {
      fetchers[clinicId] = api.clinics.get.bind(api, clinicId);
    });

    async.parallel(async.reflectAll(fetchers), (err, results) => {
      const resultsErr = _.mapValues(results, ({ error }) => error);
      const resultsVal = _.mapValues(results, ({ value }) => value);
      const error = _.find(resultsErr, err => !_.isUndefined(err));

      if (error) {
        dispatch(sync.fetchClinicsByIdsFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINICS_BY_IDS, error), error
        ));
      } else {
        dispatch(sync.fetchClinicsByIdsSuccess(resultsVal));
        // for each fetched clinic, get EHR and MRN settings
        _.forEach(resultsVal, clinic => {
          dispatch(fetchClinicEHRSettings(api, clinic.id));
          dispatch(fetchClinicMRNSettings(api, clinic.id));
        });
      }
    });
  };
}

/**
 * Update Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {Object} clinic
 * @param {String} [clinic.name] - Clinic name
 * @param {String} [clinic.address] - Clinic address
 * @param {String} [clinic.city] - Clinic city
 * @param {String} [clinic.postalCode] - Clinic Zip code
 * @param {String} [clinic.state] - Clinic state
 * @param {String} [clinic.country] - Clinic 2-character country code
 * @param {String} [clinic.clinicType] - Clinic type
 * @param {String} clinic.email - Primary email address for clinic
 */
export function updateClinic(api, clinicId, clinic) {
  return (dispatch) => {
    dispatch(sync.updateClinicRequest());

    api.clinics.update(clinicId, clinic, (err, updatedClinic) => {
      if (err) {
        dispatch(sync.updateClinicFailure(
          createActionError(ErrorMessages.ERR_UPDATING_CLINIC, err), err
        ));
      } else {
        dispatch(sync.updateClinicSuccess(clinicId, updatedClinic));
      }
    });
  };
}

/**
 * Fetch Clinicians from Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {Object} [options] - Search options
 * @param {String} [options.search] - Query
 * @param {Number} [options.offset] - Page offset
 * @param {Number} [options.limit] - Results per page
 * @param {String} [options.email] - Email to search
 */
export function fetchCliniciansFromClinic(api, clinicId, options) {
  return (dispatch) => {
    dispatch(sync.fetchCliniciansFromClinicRequest());

    api.clinics.getCliniciansFromClinic(clinicId, options, (err, clinicians) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_FETCHING_CLINICIANS_FROM_CLINIC;
        if (err?.status === 403) {
          errMsg = ErrorMessages.ERR_FETCHING_CLINICIANS_FROM_CLINIC_UNAUTHORIZED;
        }
        dispatch(sync.fetchCliniciansFromClinicFailure(
          createActionError(errMsg, err), err, clinicId
        ));
      } else {
        dispatch(sync.fetchCliniciansFromClinicSuccess({clinicians,clinicId}));
      }
    });
  };
}

/**
 * Fetch Clinician Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} clinicianId - Id of the clinician
 */
export function fetchClinician(api, clinicId, clinicianId) {
  return (dispatch) => {
    dispatch(sync.fetchClinicianRequest());

    api.clinics.getClinician(clinicId, clinicianId, (err, clinician) => {
      if (err) {
        dispatch(sync.fetchClinicianFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINICIAN, err), err
        ));
      } else {
        dispatch(sync.fetchClinicianSuccess(clinician, clinicId));
      }
    });
  };
}

/**
 * Update Clinician Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {Number} clinicId - Id of the clinic
 * @param {Number} clinicianId - Id of the clinician
 * @param {Object} clinician
 * @param {String} clinician.id - String representation of a Tidepool User ID
 * @param {String} [clinician.inviteId] - The id of the invite if it hasn't been accepted
 * @param {String} clinician.email - The email of the clinician
 * @param {String} clinician.name - The name of the clinician
 * @param {String[]} clinician.roles - Array of string roles
 */
export function updateClinician(api, clinicId, clinicianId, clinician) {
  return (dispatch) => {
    dispatch(sync.updateClinicianRequest());

    api.clinics.updateClinician(clinicId, clinicianId, clinician, (err) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_UPDATING_CLINICIAN;
        if (err?.status === 403) {
          errMsg = ErrorMessages.ERR_UPDATING_CLINICIAN_UNAUTHORIZED;
        }
        dispatch(sync.updateClinicianFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.updateClinicianSuccess(clinicId, clinicianId, clinician));
      }
    });
  };
}

/**
 * Delete Clinician from Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} clinicianId - Id of the clinician
 */
export function deleteClinicianFromClinic(api, clinicId, clinicianId) {
  return (dispatch) => {
    dispatch(sync.deleteClinicianFromClinicRequest());

    api.clinics.deleteClinicianFromClinic(clinicId, clinicianId, (err) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_DELETING_CLINICIAN_FROM_CLINIC;
        if (err?.status === 403) {
          errMsg = ErrorMessages.ERR_DELETING_CLINICIAN_FROM_CLINIC_UNAUTHORIZED;
        }
        dispatch(sync.deleteClinicianFromClinicFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.deleteClinicianFromClinicSuccess(clinicId, clinicianId));
      }
    });
  };
}

/**
 * Delete Patient from Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} patientId - Id of the clinician
 */
export function deletePatientFromClinic(api, clinicId, patientId, cb = _.noop) {
  return (dispatch, getState) => {
    const { blip: { clinics = {} } } = getState();
    const clinic = clinics[clinicId];
    const updatedClinic = { ...(clinic || {}) };

    dispatch(sync.deletePatientFromClinicRequest());

    api.clinics.deletePatientFromClinic(clinicId, patientId, (err) => {
      cb(err);

      if (err) {
        let errMsg = ErrorMessages.ERR_DELETING_PATIENT_FROM_CLINIC;
        if (err?.status === 403) {
          errMsg = ErrorMessages.ERR_DELETING_PATIENT_FROM_CLINIC_UNAUTHORIZED;
        }
        dispatch(sync.deletePatientFromClinicFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.deletePatientFromClinicSuccess(clinicId, patientId));

        if (isFinite(updatedClinic.patientCount)) {
          updatedClinic.patientCount -= 1;
          dispatch(sync.setClinicUIDetails(clinicId, clinicUIDetails(updatedClinic)));
        }
      }
    });
  };
}

/**
 * Fetch Patients for Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {Object} [options] - search options
 * @param {String} [options.search] - search query string
 * @param {Number} [options.offset] - search page offset
 * @param {Number} [options.limit] - results per page
 * @param {Number} [options.sort] - directionally prefixed field to sort by (e.g. +name or -name)
 * @param {Number} [options.sortType] - type of bg data to sort by (cgm|bgm)
 * @param {Number} [options.period] - summary period to sort by (1d|7d|14d|30d)
 */
export function fetchPatientsForClinic(api, clinicId, options = {}) {
  return (dispatch) => {
    dispatch(sync.fetchPatientsForClinicRequest());

    api.clinics.getPatientsForClinic(clinicId, options, (err, results) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_FETCHING_PATIENTS_FOR_CLINIC;
        if (err?.status === 403) {
          errMsg = ErrorMessages.ERR_FETCHING_PATIENTS_FOR_CLINIC_UNAUTHORIZED;
        }
        dispatch(sync.fetchPatientsForClinicFailure(
          createActionError(errMsg, err), err, clinicId
        ));
      } else {
        const { data, meta } = results;
        dispatch(sync.fetchPatientsForClinicSuccess(clinicId, data, meta.count));
      }
    });
  };
}

/**
 * Fetch Patient from Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} patientId - Id of the patient
 */
export function fetchPatientFromClinic(api, clinicId, patientId) {
  return (dispatch) => {
    dispatch(sync.fetchPatientFromClinicRequest());

    api.clinics.getPatientFromClinic(clinicId, patientId, (err, patient) => {
      if (err) {
        dispatch(sync.fetchPatientFromClinicFailure(
          createActionError(ErrorMessages.ERR_FETCHING_PATIENT_FROM_CLINIC, err), err
        ));
      } else {
        dispatch(sync.fetchPatientFromClinicSuccess(clinicId, patient));
      }
    });
  };
}

/**
 * Create custodial Patient for Clinic Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {Object} patient
 * @param {String} patient.fullName - The full name of the patient
 * @param {String} patient.birthDate - YYYY-MM-DD
 * @param {String} [patient.mrn] - The medical record number of the patient
 * @param {String} [patient.email] - The email address of the patient
 */
export function createClinicCustodialAccount(api, clinicId, patient) {
  return (dispatch, getState) => {
    dispatch(sync.createClinicCustodialAccountRequest());

    api.clinics.createClinicCustodialAccount(clinicId, patient, (err, result) => {
      const { blip: { clinics = {} } } = getState();
      const clinic = clinics[clinicId];
      const updatedClinic = { ...(clinic || {}) };

      if (err) {
        let errMsg = ErrorMessages.ERR_CREATING_CUSTODIAL_ACCOUNT;
        if (err?.status === 403) {
          errMsg = ErrorMessages.ERR_CREATING_CUSTODIAL_ACCOUNT_UNAUTHORIZED;
        }
        if (err?.status === 409) {
          errMsg = ErrorMessages.ERR_ACCOUNT_ALREADY_EXISTS;
        }
        if (err?.status === 402) {
          errMsg = ErrorMessages.ERR_CREATING_CUSTODIAL_ACCOUNT_LIMIT_REACHED;

          // This should only occur if the limit was pushed over by another team member in another
          // session, after the current user session had started with the patient count below the limit.
          // In this case, we re-fetch the patient count and update the UI to reflect it.
          if (clinic) {
            dispatch(sync.fetchClinicPatientCountRequest());

            api.clinics.getClinicPatientCount(clinicId, (err, results) => {
              if (err) {
                dispatch(sync.fetchClinicPatientCountFailure(
                  createActionError(ErrorMessages.ERR_FETCHING_CLINIC_PATIENT_COUNT, err), err
                ));
              } else {
                dispatch(sync.fetchClinicPatientCountSuccess(clinicId, results));
                updatedClinic.patientCount = results.patientCount;
                dispatch(sync.setClinicUIDetails(clinicId, clinicUIDetails(updatedClinic)));
              }
            });
          }
        }

        dispatch(sync.createClinicCustodialAccountFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.createClinicCustodialAccountSuccess(clinicId, result.id, result));

        if (isFinite(updatedClinic.patientCount)) {
          updatedClinic.patientCount += 1;
          dispatch(sync.setClinicUIDetails(clinicId, clinicUIDetails(updatedClinic)));
        }
      }
    });
  };
}

/**
 * Create custodial Patient for VCA Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {Object} profile
 * @param {String[]} [profile.emails] - The email address of the patient in an array wrapper
 * @param {Object} profile.patient
 * @param {String} profile.patient.birthDate - YYYY-MM-DD
 * @param {String} [profile.patient.mrn] - The medical record number of the patient
 */
export function createVCACustodialAccount(api, profile) {
  return (dispatch) => {
    dispatch(sync.createVCACustodialAccountRequest());
    api.user.createCustodialAccount(profile, (err, result) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_CREATING_CUSTODIAL_ACCOUNT;
        if (err?.status === 409) {
          errMsg = ErrorMessages.ERR_ACCOUNT_ALREADY_EXISTS;
        }
        dispatch(sync.createVCACustodialAccountFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.createVCACustodialAccountSuccess(result.userid, result));
      }
    });
  };
}

/**
 * Update Clinic Patient Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} patientId - Id of the patient
 * @param {Object} patient - new patient
 * @param {String} patient.fullName - The full name of the patient
 * @param {String} patient.birthDate - YYYY-MM-DD
 * @param {String} [patient.mrn] - The medical record number of the patient
 * @param {String} [patient.email] - The email address of the patient
 */
export function updateClinicPatient(api, clinicId, patientId, patient) {
  return (dispatch) => {
    dispatch(sync.updateClinicPatientRequest());

    api.clinics.updateClinicPatient(clinicId, patientId, patient, (err, patient) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_UPDATING_CLINIC_PATIENT;
        if (err?.status === 403) {
          errMsg = ErrorMessages.ERR_UPDATING_CLINIC_PATIENT_UNAUTHORIZED;
        }
        if (err?.status === 409) {
          errMsg = ErrorMessages.ERR_ACCOUNT_ALREADY_EXISTS;
        }
        dispatch(sync.updateClinicPatientFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.updateClinicPatientSuccess(clinicId, patient.id, patient));
      }
    });
  };
}

/**
 * Send Clinician Invite Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - clinic ID
 * @param {Object} clinician - clinician Invite object
 * @param {String} clinician.email - clinician's email address
 * @param {String[]} clinician.roles - array of clinician's roles
 */
export function sendClinicianInvite(api, clinicId, clinician) {
  return (dispatch) => {
    dispatch(sync.sendClinicianInviteRequest());

    api.clinics.inviteClinician(clinicId, clinician, (err, clinician) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_SENDING_CLINICIAN_INVITE;
        if (err?.status === 409) {
          errMsg = ErrorMessages.ERR_SENDING_CLINICIAN_INVITE_ALREADY_MEMBER;
        }
        if (err?.status === 401) {
          errMsg = ErrorMessages.ERR_SENDING_CLINICIAN_INVITE_UNAUTHORIZED;
        }

        dispatch(sync.sendClinicianInviteFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.sendClinicianInviteSuccess(clinician, clinicId));
      }
    });
  };
}

/**
 * Fetch Clinician Invite Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - clinic ID
 * @param {Object} inviteId - clinician Invite object
 */
export function fetchClinicianInvite(api, clinicId, inviteId) {
  return (dispatch) => {
    dispatch(sync.fetchClinicianInviteRequest());

    api.clinics.getClinicianInvite(clinicId, inviteId, (err, invite) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_FETCHING_CLINICIAN_INVITE;
        if (err?.status === 401) {
          errMsg = ErrorMessages.ERR_FETCHING_CLINICIAN_INVITE_UNAUTHORIZED;
        }
        dispatch(sync.fetchClinicianInviteFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.fetchClinicianInviteSuccess(invite, clinicId));
      }
    });
  };
}

/**
 * Resend Clinician Invite Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - clinic Id
 * @param {String} inviteId - invite Id
 */
export function resendClinicianInvite(api, clinicId, inviteId) {
  return (dispatch) => {
    dispatch(sync.resendClinicianInviteRequest());

    api.clinics.resendClinicianInvite(clinicId, inviteId, (err, result) => {
      if (err) {
        dispatch(sync.resendClinicianInviteFailure(
          createActionError(ErrorMessages.ERR_RESENDING_CLINICIAN_INVITE, err), err
        ));
      } else {
        dispatch(sync.resendClinicianInviteSuccess(result));
      }
    });
  };
}

/**
 * Delete Clinician Invite Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - clinic Id
 * @param {String} inviteId - invite Id
 */
export function deleteClinicianInvite(api, clinicId, inviteId) {
  return (dispatch) => {
    dispatch(sync.deleteClinicianInviteRequest());

    api.clinics.deleteClinicianInvite(clinicId, inviteId, (err, result) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_DELETING_CLINICIAN_INVITE;
        if (err?.status === 401) {
          errMsg = ErrorMessages.ERR_DELETING_CLINICIAN_INVITE_UNAUTHORIZED;
        }
        dispatch(sync.deleteClinicianInviteFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.deleteClinicianInviteSuccess(clinicId, inviteId, result));
      }
    });
  };
}

/**
 * Send Clinic Invite Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} shareCode - share code of the clinic to invite
 * @param {Object} permissions - permissions to be given
 * @param {String} patientId - id of the patient sending the invite
 */
export function sendClinicInvite(api, shareCode, permissions, patientId) {
  return (dispatch) => {
    dispatch(sync.sendClinicInviteRequest());

    api.clinics.inviteClinic(shareCode, permissions, patientId, (err, invite) => {
      if (err) {
        dispatch(sync.sendClinicInviteFailure(
          createActionError(ErrorMessages.ERR_SENDING_CLINIC_INVITE, err), err
        ));
      } else {
        dispatch(sync.sendClinicInviteSuccess(invite));
      }
    });
  };
}

/**
 * Fetch Patient Invites Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 */
export function fetchPatientInvites(api, clinicId) {
  return (dispatch) => {
    dispatch(sync.fetchPatientInvitesRequest());

    api.clinics.getPatientInvites(clinicId, (err, invites) => {
      if (err) {
        let errMsg = ErrorMessages.ERR_FETCHING_PATIENT_INVITES;
        if (err?.status === 401) {
          errMsg = ErrorMessages.ERR_FETCHING_PATIENT_INVITES_UNAUTHORIZED;
        }
        dispatch(sync.fetchPatientInvitesFailure(
          createActionError(errMsg, err), err
        ));
      } else {
        dispatch(sync.fetchPatientInvitesSuccess(clinicId, invites));
      }
    });
  };
}

/**
 * Accept Patient Invitation Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} inviteId - Id of the invite
 * @param {String} patientId - Id of the patient being invited
 * @param {Object} [patientDetails] - Patient details to set for newly created clinic user
 * @param {String} [patientDetails.fullName] - The full name of the patient
 * @param {String} [patientDetails.birthDate] - YYYY-MM-DD
 * @param {String} [patientDetails.mrn] - The medical record number of the patient
 * @param {String[]} [patientDetails.tags] - Array of string tag IDs
 */
export function acceptPatientInvitation(api, clinicId, inviteId, patientId, patientDetails) {
  return (dispatch, getState) => {
    dispatch(sync.acceptPatientInvitationRequest());

    api.clinics.acceptPatientInvitation(clinicId, inviteId, patientDetails, (err, result) => {
      if (err) {
        dispatch(sync.acceptPatientInvitationFailure(
          createActionError(ErrorMessages.ERR_ACCEPTING_PATIENT_INVITATION, err), err
        ));
      } else {
        dispatch(sync.acceptPatientInvitationSuccess(clinicId, inviteId, patientId));

        const { blip: { clinics = {} } } = getState();
        const clinic = clinics[clinicId];
        const updatedClinic = { ...(clinic || {}) };

        if (isFinite(updatedClinic.patientCount)) {
          updatedClinic.patientCount += 1;
          dispatch(sync.setClinicUIDetails(clinicId, clinicUIDetails(updatedClinic)));
        }
      }
    });
  };
}

/**
 * Delete Patient Invitation Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} inviteId - Id of the invite
 */
export function deletePatientInvitation(api, clinicId, inviteId) {
  return (dispatch) => {
    dispatch(sync.deletePatientInvitationRequest());

    api.clinics.deletePatientInvitation(clinicId, inviteId, (err, result) => {
      if (err) {
        dispatch(sync.deletePatientInvitationFailure(
          createActionError(ErrorMessages.ERR_DELETING_PATIENT_INVITATION, err), err
        ));
      } else {
        dispatch(sync.deletePatientInvitationSuccess(clinicId, inviteId));
      }
    });
  };
}

/**
 * Update Patient Permissions Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} patientId - Id of the patient
 * @param {Object} permissions - New permissions
 */
export function updatePatientPermissions(api, clinicId, patientId, permissions) {
  return (dispatch) => {
    dispatch(sync.updatePatientPermissionsRequest());

    api.clinics.updatePatientPermissions(clinicId, patientId, permissions, (err, permissions) => {
      if (err) {
        dispatch(sync.updatePatientPermissionsFailure(
          createActionError(ErrorMessages.ERR_UPDATING_PATIENT_PERMISSIONS, err), err
        ));
      } else {
        dispatch(sync.updatePatientPermissionsSuccess(clinicId, patientId, permissions));
      }
    });
  };
}

/**
 * Fetch Clinic MRN Settings Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 */
export function fetchClinicMRNSettings(api, clinicId) {
  return (dispatch) => {
    dispatch(sync.fetchClinicMRNSettingsRequest());

    api.clinics.getMRNSettings(clinicId, (err, settings) => {
      if (err) {
        dispatch(sync.fetchClinicMRNSettingsFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINIC_MRN_SETTINGS, err), err
        ));
      } else {
        dispatch(sync.fetchClinicMRNSettingsSuccess(clinicId, settings));
      }
    });
  };
}

/**
 * Fetch Clinic EHR Settings Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 */
export function fetchClinicEHRSettings(api, clinicId) {
  return (dispatch) => {
    dispatch(sync.fetchClinicEHRSettingsRequest());

    api.clinics.getEHRSettings(clinicId, (err, settings) => {
      if (err) {
        dispatch(sync.fetchClinicEHRSettingsFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINIC_EHR_SETTINGS, err), err
        ));
      } else {
        dispatch(sync.fetchClinicEHRSettingsSuccess(clinicId, settings));
      }
    });
  };
}

/**
 * Fetch Clinics For Patient Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} userId - Patient user id
 * @param {Object} [options] - search options
 * @param {Number} [options.offset] - search page offset
 * @param {Number} [options.limit] - results per page
 */
export function fetchClinicsForPatient(api, userId, options = {}) {
  return (dispatch) => {
    dispatch(sync.fetchClinicsForPatientRequest());

    api.clinics.getClinicsForPatient(userId, options, (err, clinics) => {
      if (err) {
        dispatch(sync.fetchClinicsForPatientFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINICS_FOR_PATIENT, err), err
        ));
      } else {
        dispatch(sync.fetchClinicsForPatientSuccess(clinics));
      }
    });
  };
}

/**
 * Fetch Clinician Invites Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} userId - User Id of the clinician
 * @param {Function} [cb] - optional callback
 */
export function fetchClinicianInvites(api, userId, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.fetchClinicianInvitesRequest());

    api.clinics.getClinicianInvites(userId, (err, invites) => {
      if (err) {
        dispatch(sync.fetchClinicianInvitesFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINICIAN_INVITES, err), err
        ));
      } else {
        dispatch(sync.fetchClinicianInvitesSuccess(invites));
      }
      cb(err, invites);
    });
  };
}

/**
 * Accept Clinician Invite Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} userId - User Id of the clinician
 * @param {String} inviteId - Id of the invite
 */
export function acceptClinicianInvite(api, userId, inviteId) {
  return (dispatch) => {
    dispatch(sync.acceptClinicianInviteRequest());

    api.clinics.acceptClinicianInvite(userId, inviteId, (err, result) => {
      if (err) {
        dispatch(sync.acceptClinicianInviteFailure(
          createActionError(ErrorMessages.ERR_ACCEPTING_CLINICIAN_INVITE, err), err
        ));
      } else {
        dispatch(sync.acceptClinicianInviteSuccess(inviteId));
      }
    });
  };
}

/**
 * Dismiss Clinician Invite Action Creator
 *
 * @param  {Object} api - an instance of the API wrapper
 * @param {String} userId - User Id of invited clinician
 * @param {String} inviteId - invite Id
 */
export function dismissClinicianInvite(api, userId, inviteId) {
  return (dispatch) => {
    dispatch(sync.dismissClinicianInviteRequest());

    api.clinics.dismissClinicianInvite(userId, inviteId, (err, result) => {
      if (err) {
        dispatch(sync.dismissClinicianInviteFailure(
          createActionError(ErrorMessages.ERR_DISMISSING_CLINICIAN_INVITE, err), err
        ));
      } else {
        dispatch(sync.dismissClinicianInviteSuccess(inviteId));
      }
    });
  };
}

/**
 * Get Clinics for Clinician Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicianId - Clinician User ID
 * @param {Object} [options]
 * @param {Number} [options.limit] - Query result limit
 * @param {Number} [options.offset] - Query offset
 * @param {Function} [cb] - optional callback
 */
export function getClinicsForClinician(api, clinicianId, options = {}, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.getClinicsForClinicianRequest());

    api.clinics.getClinicsForClinician(clinicianId, options, (err, clinics) => {
      cb(err, clinics);
      if (err) {
        dispatch(sync.getClinicsForClinicianFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINICS_FOR_CLINICIAN, err), err
        ));
      } else {
        dispatch(sync.getClinicsForClinicianSuccess(clinics, clinicianId, options));
      }
      // fetch EHR and MRN settings for clinics
      _.each(clinics, (clinic) => {
        dispatch(fetchClinicEHRSettings(api, clinic.clinic.id));
        dispatch(fetchClinicMRNSettings(api, clinic.clinic.id));
      });
    });
  };
}

/**
 * Fetch Clinic by Share Code Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} shareCode - Share code of the clinic
 */
export function fetchClinicByShareCode(api, shareCode) {
  return (dispatch) => {
    dispatch(sync.fetchClinicRequest());

    api.clinics.getClinicByShareCode(shareCode, (err, clinic) => {
      if (err) {
        dispatch(sync.fetchClinicFailure(
          createActionError(ErrorMessages.ERR_FETCHING_CLINIC, err), err
        ));
      } else {
        dispatch(sync.fetchClinicSuccess(clinic));
      }
    });
  };
}

/**
 * Trigger migration of a clinician's patient list to a clinic
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 */
export function triggerInitialClinicMigration(api, clinicId) {
  return (dispatch) => {
    dispatch(sync.triggerInitialClinicMigrationRequest());

    api.clinics.triggerInitialClinicMigration(clinicId, (err) => {
      if (err) {
        dispatch(sync.triggerInitialClinicMigrationFailure(
          createActionError(ErrorMessages.ERR_TRIGGERING_INITIAL_CLINIC_MIGRATION, err), err
        ));
      } else {
        dispatch(sync.triggerInitialClinicMigrationSuccess(clinicId));
      }
    });
  };
}

/**
 * Send an upload reminder email to a clinic patient
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 */
export function sendPatientUploadReminder(api, clinicId, patientId) {
  return (dispatch) => {
    dispatch(sync.sendPatientUploadReminderRequest());

    api.clinics.sendPatientUploadReminder(clinicId, patientId, (err, result) => {
      if (err) {
        dispatch(sync.sendPatientUploadReminderFailure(
          createActionError(ErrorMessages.ERR_SENDING_PATIENT_UPLOAD_REMINDER, err), err
        ));
      } else {
        dispatch(sync.sendPatientUploadReminderSuccess(clinicId, patientId, _.get(result, 'lastUploadReminderTime', moment().toISOString())));
      }
    });
  };
}


/**
 * Mark a clinic patient as reviewed
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} patientId - Id of the patient
 */
export function setClinicPatientLastReviewed(api, clinicId, patientId) {
  return dispatch => {
    dispatch(sync.setClinicPatientLastReviewedRequest());

    api.clinics.setClinicPatientLastReviewed(clinicId, patientId, (err, result) => {
      if (err) {
        dispatch(sync.setClinicPatientLastReviewedFailure(
          createActionError(ErrorMessages.ERR_SETTING_CLINIC_PATIENT_LAST_REVIEWED, err), err
        ));
      } else {
        dispatch(sync.setClinicPatientLastReviewedSuccess(clinicId, patientId, result));
      }
    });
  };
}

/**
 * Revert a clinic patient last reviewed date
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} patientId - Id of the patient
 */
export function revertClinicPatientLastReviewed(api, clinicId, patientId) {
  return dispatch => {
    dispatch(sync.revertClinicPatientLastReviewedRequest());

    api.clinics.revertClinicPatientLastReviewed(clinicId, patientId, (err, result) => {
      if (err) {
        let message = ErrorMessages.ERR_REVERTING_CLINIC_PATIENT_LAST_REVIEWED;

        if (err.status === 409) {
          message = ErrorMessages.ERR_REVERTING_CLINIC_PATIENT_LAST_REVIEWED_UNAUTHORIZED;
        }

        dispatch(sync.revertClinicPatientLastReviewedFailure(
          createActionError(message, err), err
        ));
      } else {
        dispatch(sync.revertClinicPatientLastReviewedSuccess(clinicId, patientId, result));
      }
    });
  };
}

/**
 * Send a dexcom connect reqeust email to a clinic patient
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 */
export function sendPatientDexcomConnectRequest(api, clinicId, patientId) {
  return (dispatch) => {
    dispatch(sync.sendPatientDexcomConnectRequestRequest());

    api.clinics.sendPatientDexcomConnectRequest(clinicId, patientId, (err, result) => {
      if (err) {
        dispatch(sync.sendPatientDexcomConnectRequestFailure(
          createActionError(ErrorMessages.ERR_SENDING_PATIENT_DEXCOM_CONNECT_REQUEST, err), err
        ));
      } else {
        dispatch(sync.sendPatientDexcomConnectRequestSuccess(clinicId, patientId, _.get(result, 'lastRequestedDexcomConnectTime', moment().toISOString())));
      }
    });
  };
}

/**
 * Create a patient tag for a clinic
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {Object} patientTag - the tag to create
 * @param {String} patientTag.name - the tag name
 */
export function createClinicPatientTag(api, clinicId, patientTag) {
  return (dispatch) => {
    dispatch(sync.createClinicPatientTagRequest());

    api.clinics.createClinicPatientTag(clinicId, patientTag, (err, patientTags) => {
      if (err) {
        let message = ErrorMessages.ERR_CREATING_CLINIC_PATIENT_TAG;

        if (err.status === 422) {
          message = ErrorMessages.ERR_CREATING_CLINIC_PATIENT_TAG_MAX_EXCEEDED;
        } else if (err.status === 409) {
          message = ErrorMessages.ERR_CREATING_CLINIC_PATIENT_TAG_DUPLICATE;
        }

        dispatch(sync.createClinicPatientTagFailure(
          createActionError(message, err), err
        ));
      } else {
        dispatch(sync.createClinicPatientTagSuccess(clinicId, patientTags));
      }
    });
  };
}

/**
 * Update a patient tag for a clinic
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} patientTagId - Id of the tag
 * @param {Object} patientTag - the updated tag
 * @param {String} patientTag.name - the tag name
 */
export function updateClinicPatientTag(api, clinicId, patientTagId, patientTag) {
  return (dispatch) => {
    dispatch(sync.updateClinicPatientTagRequest());

    api.clinics.updateClinicPatientTag(clinicId, patientTagId, patientTag, (err, patientTags) => {
      if (err) {
        let message = ErrorMessages.ERR_UPDATING_CLINIC_PATIENT_TAG;

        if (err.status === 409) {
          message = ErrorMessages.ERR_CREATING_CLINIC_PATIENT_TAG_DUPLICATE;
        }

        dispatch(sync.updateClinicPatientTagFailure(
          createActionError(message, err), err
        ));
      } else {
        dispatch(sync.updateClinicPatientTagSuccess(clinicId, patientTags));
      }
    });
  };
}

/**
 * Delete a patient tag for a clinic
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {String} patientTagId - Id of the tag to delete
 */
export function deleteClinicPatientTag(api, clinicId, patientTagId) {
  return (dispatch) => {
    dispatch(sync.deleteClinicPatientTagRequest());

    api.clinics.deleteClinicPatientTag(clinicId, patientTagId, (err, patientTags) => {
      if (err) {
        dispatch(sync.deleteClinicPatientTagFailure(
          createActionError(ErrorMessages.ERR_DELETING_CLINIC_PATIENT_TAG, err), err
        ));
      } else {
        dispatch(sync.deleteClinicPatientTagSuccess(clinicId, patientTags));
      }
    });
  };
}

/**
 * Fetch server configuration information
 *
 * @param  {Object} api an instance of the API wrapper
 */
 export function fetchInfo(api, cb = _.noop) {
  return (dispatch) => {
    dispatch(sync.fetchInfoRequest());

    api.server.getInfo((err, info) => {
      if (err) {
        dispatch(sync.fetchInfoFailure(
          createActionError(ErrorMessages.ERR_FETCHING_INFO, err), err
        ));
      } else {
        dispatch(sync.fetchInfoSuccess(info));
      }

      // Invoke callback if provided
      cb(err, info);
    });
  };
}

/**
 * Fetch Patients for Tide Dashboard Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {Object} [options] - report config options
 * @param {Number} [options.period] - period to sort by (1d|7d|14d|30d)
 * @param {Array} [options.tags] - Array of patient tag IDs
 * @param {Number} [options.lastDataCutoff] - ISO date for data recency cutoff date
 */
 export function fetchTideDashboardPatients(api, clinicId, options) {
  return (dispatch) => {
    dispatch(sync.fetchTideDashboardPatientsRequest());

    api.clinics.getPatientsForTideDashboard(clinicId, options, (err, results) => {
      if (err) {
        dispatch(sync.fetchTideDashboardPatientsFailure(
          createActionError(ErrorMessages.ERR_FETCHING_TIDE_DASHBOARD_PATIENTS, err), err
        ));
      } else {
        if (results.config) results.config.lastData = options.lastData;
        dispatch(sync.fetchTideDashboardPatientsSuccess(results));
      }
    });
  };
}

/**
 * Fetch Patients for RPM Report Action Creator
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String} clinicId - Id of the clinic
 * @param {Object} [options] - report config options
 * @param {String} [options.startDate] - UTC ISO datetime for start of the report range
 * @param {String} [options.endDate] - UTC ISO datetime for end of the report range
 * @param {Object} [options.rawConfig] - raw user-selected report config values
 * @param {String} [options.rawConfig.startDate] - ISO date for first day of the report range
 * @param {String} [options.rawConfig.endDate] - ISO date for last day of the report range
 * @param {String} [options.rawConfig.timezone] - Timezone to use for the report
 * @param {Object} [options.patientFilters] - Filters used to generate the patient list
 * @param {String} [options.patientFilters.search] - Search query string
 * @param {Array} [options.patientFilters.tags] - Array of clinic patient tag IDs
 * @param {String} [options.patientFilters.cgm.lastDataFrom] - UTC ISO datetime for minimum date of the last cgm upload
 * @param {String} [options.patientFilters.cgm.lastDataTo] - UTC ISO datetime for maximum date of the last cgm upload
 * @param {String} [options.patientFilters.cgm.timeInLowPercent] - Comparator and value for time in low percent
 * @param {String} [options.patientFilters.cgm.timeInHighPercent] - Comparator and value for time in high percent
 * @param {String} [options.patientFilters.cgm.timeInVeryLowPercent] - Comparator and value for time in very low percent
 * @param {String} [options.patientFilters.cgm.timeInTargetPercent] - Comparator and value for time in target percent
 * @param {String} [options.patientFilters.cgm.timeInVeryHighPercent] - Comparator and value for time in very high percent
 * @param {String} [options.patientFilters.cgm.timeCGMUsePercent] - Comparator and value for time of cgm use percent
 * @param {String} [options.patientFilters.bgm.lastDataFrom] - UTC ISO datetime for minimum date of the last bgm upload
 * @param {String} [options.patientFilters.bgm.lastDataTo] - UTC ISO datetime for maximum date of the last bgm upload
 */
export function fetchRpmReportPatients(api, clinicId, options) {
  return (dispatch) => {
    dispatch(sync.fetchRpmReportPatientsRequest());

    const apiConfigOptions = _.pick(options, ['startDate', 'endDate', 'patientFilters']);

    api.clinics.getPatientsForRpmReport(clinicId, apiConfigOptions, (err, results) => {
      if (err) {
        dispatch(sync.fetchRpmReportPatientsFailure(
          createActionError(ErrorMessages.ERR_FETCHING_RPM_REPORT_PATIENTS, err), err
        ));
      } else {
        if (results.config) results.config.rawConfig = options.rawConfig;
        dispatch(sync.fetchRpmReportPatientsSuccess(results));
      }
    });
  };
}

/**
 * Select Clinic Action Creator
 *
 * Immediately sets or unsets the selected clinic to state,
 * then fetches additional clinic metadata asynchronously.
 *
 * @param {Object} api - an instance of the API wrapper
 * @param {String | null} clinicId - Id of the clinic, or null to unset
 */
export function selectClinic(api, clinicId) {
  return (dispatch, getState) => {
    dispatch(sync.selectClinicSuccess(clinicId));

    const { blip: { clinics = {} } } = getState();
    const clinic = clinics[clinicId];

    if (clinic) {
      const fetchers = {};

      if (_.isNil(clinics[clinicId].patientCount)) {
        fetchers.clinicPatientCount = api.clinics.getClinicPatientCount.bind(api, clinicId);
        dispatch(sync.fetchClinicPatientCountRequest());
      }

      if (_.isNil(clinics[clinicId].patientCountSettings)) {
        fetchers.clinicPatientCountSettings = api.clinics.getClinicPatientCountSettings.bind(api, clinicId);
        dispatch(sync.fetchClinicPatientCountSettingsRequest());
      }

      async.parallel(async.reflectAll(fetchers), (err, results) => {
        const selectedClinic = { ...clinic };
        const errors = _.mapValues(results, ({error}) => error);
        const values = _.mapValues(results, ({value}) => value);

        if (errors?.clinicPatientCount) {
          dispatch(sync.fetchClinicPatientCountFailure(
            createActionError(ErrorMessages.ERR_FETCHING_CLINIC_PATIENT_COUNT, errors.clinicPatientCount), errors.clinicPatientCount
          ));
        }

        if (errors?.clinicPatientCountSettings) {
          dispatch(sync.fetchClinicPatientCountSettingsFailure(
            createActionError(ErrorMessages.ERR_FETCHING_CLINIC_PATIENT_COUNT_SETTINGS, errors.clinicPatientCountSettings), errors.clinicPatientCountSettings
          ));
        }

        if (values.clinicPatientCount) {
          dispatch(sync.fetchClinicPatientCountSuccess(clinicId, values.clinicPatientCount));
          selectedClinic.patientCount = values.clinicPatientCount?.patientCount;
        }

        if (values.clinicPatientCountSettings) {
          dispatch(sync.fetchClinicPatientCountSettingsSuccess(clinicId, values.clinicPatientCountSettings));
          selectedClinic.patientCountSettings = values.clinicPatientCountSettings;
        }

        if (_.isFinite(selectedClinic.patientCount) && _.isPlainObject(selectedClinic.patientCountSettings)) {
          dispatch(sync.setClinicUIDetails(clinicId, clinicUIDetails(selectedClinic)));
        }
      });
    }
  };
}
