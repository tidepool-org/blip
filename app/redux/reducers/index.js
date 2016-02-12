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

import update from 'react-addons-update';

import initialState from './initialState';

import * as types from '../constants/actionTypes';

export default (state = initialState, action) => {
  switch (action.type) {
    case types.ACKNOWLEDGE_NOTIFICATION:
      if (!action.payload.acknowledgedNotification) {
        return update(state, { notification: { $set: null } });
      } else {
        return update(state, { 
          working: {
            [action.payload.acknowledgedNotification]: { 
              notification: { $set: null }
            }
          }
        });
      }
    case types.SET_TIME_PREFERENCES:
      return update(state, { timePrefs: { $set: action.payload.timePrefs } });
    case types.SET_BLOOD_GLUCOSE_PREFERENCES:
      return update(state, { bgPrefs: { $set: action.payload.bgPrefs } });
    case types.FETCH_USER_REQUEST: 
      return update(state, { 
        working: {
          fetchingUser: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.FETCH_USER_SUCCESS:
      return update(state, { 
        working: {
          fetchingUser: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        loggedInUser: { $set: action.payload.user },
        isLoggedIn: { $set: true }
      });
    case types.FETCH_USER_FAILURE: 
      return update(state, { 
        working: {
          fetchingUser: { 
            $set: {
              inProgress: false,
              notification: { 
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.FETCH_PENDING_INVITES_REQUEST: 
      return update(state, { 
        working: {
          fetchingPendingInvites: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.FETCH_PENDING_INVITES_SUCCESS: 
      return update(state, { 
        working: {
          fetchingPendingInvites: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        pendingInvites: { $set: action.payload.pendingInvites }
      });
    case types.FETCH_PENDING_INVITES_FAILURE: 
      return update(state, { 
        working: {
          fetchingPendingInvites: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.FETCH_PENDING_MEMBERSHIPS_REQUEST: 
      return update(state, { 
        working: {
          fetchingPendingMemberships: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.FETCH_PENDING_MEMBERSHIPS_SUCCESS: 
      return update(state, { 
        working: {
          fetchingPendingMemberships: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        pendingMemberships: { $set: action.payload.pendingMemberships }
      });
    case types.FETCH_PENDING_MEMBERSHIPS_FAILURE: 
      return update(state, { 
        working: {
          fetchingPendingMemberships: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.FETCH_PATIENTS_REQUEST: 
      return update(state, { 
        working: {
          fetchingPatients: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.FETCH_PATIENTS_SUCCESS: 
      let patientMap = {};
      action.payload.patients.forEach((p) => patientMap[p.userid] = p);

      return update(state, {
        working: {
          fetchingPatients: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        patients: { $set: patientMap }
      });
    case types.FETCH_PATIENTS_FAILURE: 
      return update(state, { 
        working: {
          fetchingPatients: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.FETCH_PATIENT_REQUEST: 
      return update(state, { 
        working: {
          fetchingPatient: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.FETCH_PATIENT_SUCCESS:
      return update(state, { 
        working: {
          fetchingPatient: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        currentPatientInView: { $set: action.payload.patient }
      });
    case types.FETCH_PATIENT_FAILURE: 
      return update(state, { 
        working: {
          fetchingPatient: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.UPDATE_LOCAL_PATIENT_DATA:
      return update(state, {
        patientData: {
          [action.payload.patientId]: { $set: action.payload.patientData }
        }
      });
    case types.FETCH_PATIENT_DATA_REQUEST: 
      return update(state, { 
        working: {
          fetchingPatientData: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.FETCH_PATIENT_DATA_SUCCESS:
      return update(state, { 
        working: {
          fetchingPatientData: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        patientData: {
          [action.payload.patientId]: { $set: action.payload.patientData }
        },
        bgPrefs: {
          bgClasses: { $set: action.payload.patientData.bgClasses },
          bgUnits: { $set: action.payload.patientData.bgUnits }
        }
      });
    case types.FETCH_PATIENT_DATA_FAILURE: 
      return update(state, { 
        working: {
          fetchingPatientData: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.CLOSE_MESSAGE_THREAD: 
      return update(state, {
        messageThread: { $set: null }
      });
    case types.FETCH_MESSAGE_THREAD_REQUEST:
      return update(state, { 
        working: {
          fetchingMessageThread: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.FETCH_MESSAGE_THREAD_SUCCESS: 
      return update(state, { 
        working: {
          fetchingMessageThread: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        messageThread: { $set: action.payload.messageThread }
      });
    case types.FETCH_MESSAGE_THREAD_FAILURE: 
      return update(state, { 
        working: {
          fetchingMessageThread: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.LOGIN_REQUEST: 
      return update(state, { 
        working: {
          loggingIn: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.LOGIN_SUCCESS:
      return update(state, { 
        working: {
          loggingIn: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        loggedInUser: { $set: action.payload.user },
        isLoggedIn: { $set: true }
      });
    case types.LOGIN_FAILURE:
      let update1 = update(state, { 
        working: {
          loggingIn: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });

      if (action.payload) {
        return update(update1, { $merge: action.payload });
      } else {
        return update1;
      }
    case types.LOGOUT_REQUEST: 
      return update(state, { 
        working: {
          loggingOut: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.LOGOUT_SUCCESS:
      return update(state, { 
        working: {
          loggingOut: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        isLoggedIn: { $set: false },
        patients: { $set: null }, 
        patientsData: { $set: null },
        invites: { $set: null }, 
        loggedInUser: { $set: null },
        currentPatientInView: { $set: null }
      });
    case types.LOGOUT_FAILURE:
      return update(state, { 
        working: {
          loggingOut: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.SIGNUP_REQUEST: 
      return update(state, { 
        working: {
          signingUp: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.SIGNUP_SUCCESS:
      return update(state, { 
        working: {
          signingUp: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        isLoggedIn: { $set: true },
        emailVerificationSent: { $set: true },
        loggedInUser: { $set: action.payload.user }
      });
    case types.SIGNUP_FAILURE:
      return update(state, { 
        working: {
          signingUp: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.CONFIRM_SIGNUP_REQUEST: 
      return update(state, { 
        working: {
          confirmingSignup: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.CONFIRM_SIGNUP_SUCCESS:
      return update(state, { 
        working: {
          confirmingSignup: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        confirmedSignup: { $set: true }
      });
    case types.CONFIRM_SIGNUP_FAILURE:
      return update(state, { 
        working: {
          confirmingSignup: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.CONFIRM_PASSWORD_RESET_REQUEST: 
      return update(state, { 
        working: {
          confirmingPasswordReset: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.CONFIRM_PASSWORD_RESET_SUCCESS:
      return update(state, { 
        working: {
          confirmingPasswordReset: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        passwordResetConfirmed: { $set: true }
      });
    case types.CONFIRM_PASSWORD_RESET_FAILURE:
      return update(state, { 
        working: {
          confirmingPasswordReset: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.ACCEPT_TERMS_REQUEST: 
      return update(state, { 
        working: {
          acceptingTerms: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.ACCEPT_TERMS_SUCCESS:
      return update(state, { 
        working: {
          acceptingTerms: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        loggedInUser: { $set: action.payload.user }
      });
    case types.ACCEPT_TERMS_FAILURE:
      return update(state, { 
        working: {
          acceptingTerms: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.RESEND_EMAIL_VERIFICATION_REQUEST: 
      return update(state, { 
        working: {
          resendingEmailVerification: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
      return update(state, { 
        working: {
          resendingEmailVerification: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        resentEmailVerification: { $set: true }
      });
    case types.RESEND_EMAIL_VERIFICATION_FAILURE:
      return update(state, { 
        working: {
          resendingEmailVerification: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.SET_MEMBER_PERMISSIONS_REQUEST: 
      return update(state, { 
        working: {
          settingMemberPermissions: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.SET_MEMBER_PERMISSIONS_SUCCESS:
      return update(state, { 
        working: {
          settingMemberPermissions: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        }
      });
    case types.SET_MEMBER_PERMISSIONS_FAILURE:
      return update(state, { 
        working: {
          settingMemberPermissions: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.CREATE_PATIENT_REQUEST: 
      return update(state, { 
        working: {
          creatingPatient: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.CREATE_PATIENT_SUCCESS:
      return update(state, { 
        working: {
          creatingPatient: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        loggedInUser: { $set:
          { profile: action.payload.patient.profile }
        },
        currentPatientInView: { $set:action.payload.patient }
      });
    case types.CREATE_PATIENT_FAILURE:
      return update(state, { 
        working: {
          creatingPatient: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.REMOVE_PATIENT_REQUEST: 
      return update(state, { 
        working: {
          removingPatient: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.REMOVE_PATIENT_SUCCESS:
      return update(state, { 
        working: {
          removingPatient: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        }
      });
    case types.REMOVE_PATIENT_FAILURE:
      return update(state, { 
        working: {
          removingPatient: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.REMOVE_MEMBER_REQUEST: 
      return update(state, { 
        working: {
          removingMember: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.REMOVE_MEMBER_SUCCESS:
      return update(state, { 
        working: {
          removingMember: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        }
      });
    case types.REMOVE_MEMBER_FAILURE:
      return update(state, { 
        working: {
          removingMember: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.REQUEST_PASSWORD_RESET_REQUEST: 
      return update(state, { 
        working: {
          requestingPasswordReset: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.REQUEST_PASSWORD_RESET_SUCCESS:
      return update(state, { 
        working: {
          requestingPasswordReset: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        }
      });
    case types.REQUEST_PASSWORD_RESET_FAILURE:
      return update(state, { 
        working: {
          requestingPasswordReset: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.SEND_INVITATION_REQUEST: 
      return update(state, { 
        working: {
          sendingInvitation: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.SEND_INVITATION_SUCCESS:
      return update(state, { 
        working: {
          sendingInvitation: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        pendingInvites: { $push: [action.payload.invitation ]}
      });
    case types.SEND_INVITATION_FAILURE:
      return update(state, { 
        working: {
          sendingInvitation: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.CANCEL_INVITATION_REQUEST: 
      return update(state, { 
        working: {
          cancellingInvitation: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.CANCEL_INVITATION_SUCCESS:
      return update(state, { 
        working: {
          cancellingInvitation: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        pendingInvites: { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.email !== action.payload.removedEmail )
        }}
      });
    case types.CANCEL_INVITATION_FAILURE:
      return update(state, { 
        working: {
          cancellingInvitation: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.ACCEPT_MEMBERSHIP_REQUEST: 
      return update(state, { 
        working: {
          acceptingMembership: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.ACCEPT_MEMBERSHIP_SUCCESS:
      return update(state, { 
        working: {
          acceptingMembership: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        pendingMemberships: { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.key !== action.payload.acceptedMembership.key );
        }},
        patients: { $push: [ action.payload.acceptedMembership.creator ] }
      });
    case types.ACCEPT_MEMBERSHIP_FAILURE:
      return update(state, { 
        working: {
          acceptingMembership: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.DISMISS_MEMBERSHIP_REQUEST: 
      return update(state, { 
        working: {
          dismissingMembership: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.DISMISS_MEMBERSHIP_SUCCESS:
      return update(state, { 
        working: {
          dismissingMembership: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        pendingMemberships: { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.key !== action.payload.dismissedMembership.key );
        }}
      });
    case types.DISMISS_MEMBERSHIP_FAILURE:
      return update(state, { 
        working: {
          dismissingMembership: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.UPDATE_PATIENT_REQUEST: 
      return update(state, { 
        working: {
          updatingPatient: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        }
      });
    case types.UPDATE_PATIENT_SUCCESS:
      return update(state, { 
        working: {
          updatingPatient: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        currentPatientInView: { $set: action.payload.updatedPatient }
      });
    case types.UPDATE_PATIENT_FAILURE:
      return update(state, { 
        working: {
          updatingPatient: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    case types.UPDATE_USER_REQUEST:
      return update(state, { 
        working: {
          updatingUser: { 
            $set: {
              inProgress: true,
              notification: null
            } 
          } 
        },
        loggedInUser: {
          $set: action.payload.updatingUser
        }
      }); 
    case types.UPDATE_USER_SUCCESS:
      return update(state, { 
        working: {
          updatingUser: { 
            $set: {
              inProgress: false,
              notification: null
            } 
          } 
        },
        loggedInUser: {
          $set: action.payload.updatedUser
        }
      });
    case types.UPDATE_USER_FAILURE:
      return update(state, { 
        working: {
          updatingUser: { 
            $set: {
              inProgress: false,
              notification: {
                type: 'error',
                message: action.error
              }
            } 
          } 
        }
      });
    default: 
      return state;
  }
};