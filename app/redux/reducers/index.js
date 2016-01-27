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

import * as types from '../constants/actionTypes';


export default (state, action) => {
  switch (action.type) {
    case types.ACKNOWLEDGE_NOTIFICATION:
      return merge({
        notification: null
      });
    case types.FETCH_USER_REQUEST: 
      return merge({
        working: {
          fetchingUser: true
        }
      });
    case types.FETCH_USER_SUCCESS:
      return merge({
        working: {
          fetchingUser: false
        },
        user: action.payload.user
      });
    case types.FETCH_USER_FAILURE: 
      return merge({
        working: {
          fetchingUser: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.FETCH_PENDING_INVITES_REQUEST: 
      return merge({
        working: {
          fetchingPendingInvites: true
        }
      });
    case types.FETCH_PENDING_INVITES_SUCCESS: 
      return merge({
        working: {
          fetchingPendingInvites: false
        },
        pendingInvites: action.payload.pendingInvites
      });
    case types.FETCH_PENDING_INVITES_FAILURE: 
      return merge({
        working: {
          fetchingPendingInvites: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.FETCH_PENDING_MEMBERSHIPS_REQUEST: 
      return merge({
        working: {
          fetchingPendingMemberships: true
        }
      });
    case types.FETCH_PENDING_MEMBERSHIPS_SUCCESS: 
      return merge({
        working: {
          fetchingPendingMemberships: false
        },
        pendingMemberships: action.payload.pendingMemberships
      });
    case types.FETCH_PENDING_MEMBERSHIPS_FAILURE: 
      return merge({
        working: {
          fetchingPendingMemberships: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });

    case types.FETCH_PATIENTS_REQUEST: 
      return merge({
        working: {
          fetchingPatients: true
        }
      });
    case types.FETCH_PATIENTS_SUCCESS: 
      return merge({
        working: {
          fetchingPatients: false
        },
        patients: action.payload.patients
      });
    case types.FETCH_PATIENTS_FAILURE: 
      return merge({
        working: {
          fetchingPatients: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.FETCH_PATIENT_REQUEST: 
      return merge({
        working: {
          fetchingPatient: true
        }
      });
    case types.FETCH_PATIENT_SUCCESS: 
      return merge({
        working: {
          fetchingPatient: false
        },
        patient: action.payload.patient
      });
    case types.FETCH_PATIENT_FAILURE: 
      return merge({
        working: {
          fetchingPatient: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.FETCH_PATIENT_DATA_REQUEST: 
      return merge({
        working: {
          fetchingPatientData: true
        }
      });
    case types.FETCH_PATIENT_DATA_SUCCESS: 
      return merge({
        working: {
          fetchingPatientData: false
        },
        patientData: action.payload.patientData
      });
    case types.FETCH_PATIENT_DATA_FAILURE: 
      return merge({
        working: {
          fetchingPatientData: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.FETCH_MESSAGE_THREAD_REQUEST: 
      return merge({
        working: {
          fetchingMessageThread: true
        }
      });
    case types.FETCH_MESSAGE_THREAD_SUCCESS: 
      return merge({
        working: {
          fetchingMessageThread: false
        },
        messageThread: action.payload.messageThread
      });
    case types.FETCH_MESSAGE_THREAD_FAILURE: 
      return merge({
        working: {
          fetchingMessageThread: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.LOGIN_REQUEST: 
      return merge({
        working: {
          loggingIn: true
        }
      });
    case types.LOGIN_SUCCESS:
      return merge({
        working: {
          loggingIn: false
        },
        user: action.payload.user,
        isLoggedIn: true
      });
    case types.LOGIN_FAILURE:
      return merge({
        working: {
          loggingIn: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.LOGOUT_REQUEST: 
      return merge({
        working: {
          loggingOut: true
        }
      });
    case types.LOGOUT_SUCCESS:
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
      });
    case types.LOGOUT_FAILURE:
      return merge({
        working: {
          loggingOut: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.SIGNUP_REQUEST: 
      return merge({
        working: {
          signingUp: true
        }
      });
    case types.SIGNUP_SUCCESS:
      return merge({
        working: {
          signingUp: false
        },
        isLoggedIn: true,
        verificationEmailSent: true,
        user: action.payload.user
      });
    case types.SIGNUP_FAILURE:
      return merge({
        working: {
          signingUp: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.CONFIRM_SIGNUP_REQUEST: 
      return merge({
        working: {
          confirmingSignup: true
        }
      });
    case types.CONFIRM_SIGNUP_SUCCESS:
      return merge({
        working: {
          confirmingSignup: false
        },
        confirmedSignup: true
      });
    case types.CONFIRM_SIGNUP_FAILURE:
      return merge({
        working: {
          confirmingSignup: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.ACCEPT_TERMS_REQUEST: 
      return merge({
        working: {
          acceptingTerms: true
        }
      });
    case types.ACCEPT_TERMS_SUCCESS:
      return merge({
        working: {
          acceptingTerms: false
        },
        user: action.payload.user
      });
    case types.ACCEPT_TERMS_FAILURE:
      return merge({
        working: {
          acceptingTerms: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.SET_MEMBER_PERMISSIONS_REQUEST: 
      return merge({
        working: {
          settingMemberPermissions: true
        }
      });
    case types.SET_MEMBER_PERMISSIONS_SUCCESS:
      return merge({
        working: {
          settingMemberPermissions: false
        }
      });
    case types.SET_MEMBER_PERMISSIONS_FAILURE:
      return merge({
        working: {
          settingMemberPermissions: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.CREATE_PATIENT_REQUEST: 
      return merge({
        working: {
          creatingPatient: true
        }
      });
    case types.CREATE_PATIENT_SUCCESS:
      return merge({
        working: {
          creatingPatient: false
        },
        user: {
          profile: action.payload.patient.profile
        },
        patient: action.payload.patient
      });
    case types.CREATE_PATIENT_FAILURE:
      return merge({
        working: {
          creatingPatient: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.REMOVE_PATIENT_REQUEST: 
      return merge({
        working: {
          removingPatient: true
        }
      });
    case types.REMOVE_PATIENT_SUCCESS:
      return merge({
        working: {
          removingPatient: false
        }
      });
    case types.REMOVE_PATIENT_FAILURE:
      return merge({
        working: {
          removingPatient: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.REMOVE_MEMBER_REQUEST: 
      return merge({
        working: {
          removingMember: true
        }
      });
    case types.REMOVE_MEMBER_SUCCESS:
      return merge({
        working: {
          removingMember: false
        }
      });
    case types.REMOVE_MEMBER_FAILURE:
      return merge({
        working: {
          removingMember: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.SEND_INVITATION_REQUEST: 
      return merge({
        working: {
          sendingInvitation: true
        }
      });
    case types.SEND_INVITATION_SUCCESS:
      let sState = merge({
        working: {
          sendingInvitation: false
        }
      });

      //add invitation into pendingInvites
      sState.pendingInvites = state.pendingInvites.concat([action.payload.invitation ]);

      return sState; 
    case types.SEND_INVITATION_FAILURE:
      return merge({
        working: {
          sendingInvitation: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.CANCEL_INVITATION_REQUEST: 
      return merge({
        working: {
          cancellingInvitation: true
        }
      });
    case types.CANCEL_INVITATION_SUCCESS:
      let cState = merge({
        working: {
          cancellingInvitation: false
        }
      });

      cState.pendingInvites = state.pendingInvites.filter( (i) => i.email !== action.payload.removedEmail )
      
      return cState;
    case types.CANCEL_INVITATION_FAILURE:
      return merge({
        working: {
          cancellingInvitation: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.ACCEPT_MEMBERSHIP_REQUEST: 
      return merge({
        working: {
          acceptingMembership: true
        }
      });
    case types.ACCEPT_MEMBERSHIP_SUCCESS:
      let aState = merge({
        working: {
          acceptingMembership: false
        }
      });

      aState.pendingMemberships = state.pendingMemberships.filter( (i) => i.key !== action.payload.acceptedMembership.key )
      aState.patients = state.patients.concat(action.payload.acceptedMembership.creator);

      return aState;
    case types.ACCEPT_MEMBERSHIP_FAILURE:
      return merge({
        working: {
          acceptingMembership: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.DISMISS_MEMBERSHIP_REQUEST: 
      return merge({
        working: {
          dismissingMembership: true
        }
      });
    case types.DISMISS_MEMBERSHIP_SUCCESS:
      let dState = merge({
        working: {
          dismissingMembership: false
        }
      });

      dState.pendingMemberships = state.pendingMemberships.filter( (i) => i.key !== action.payload.dismissedMembership.key )
      
      return dState;
    case types.DISMISS_MEMBERSHIP_FAILURE:
      return merge({
        working: {
          dismissingMembership: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.UPDATE_PATIENT_REQUEST: 
      return merge({
        working: {
          updatingPatient: true
        }
      });
    case types.UPDATE_PATIENT_SUCCESS:
      return merge({
        working: {
          updatingPatient: false
        },
        patient: action.payload.updatedPatient
      });
    case types.UPDATE_PATIENT_FAILURE:
      return merge({
        working: {
          updatingPatient: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
    case types.UPDATE_USER_REQUEST: 
      return merge({
        working: {
          updatingUser: true
        },
        user: action.payload.updatingUser
      });
    case types.UPDATE_USER_SUCCESS:
      return merge({
        working: {
          updatingUser: false
        },
        user: action.payload.updatedUser
      });
    case types.UPDATE_USER_FAILURE:
      return merge({
        working: {
          updatingUser: false
        },
        notification: {
          type: 'error',
          message: action.error
        }
      });
  }

  // Convenience function
  function merge(newState) {
    // important to understand that _.merge performs a deep merge, unlike _.assign
    return _.merge({}, state, newState);
  }
};