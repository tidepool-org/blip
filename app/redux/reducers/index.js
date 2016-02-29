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
import update from 'react-addons-update';

import initialState from './initialState';
import * as types from '../constants/actionTypes';

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SET_TIME_PREFERENCES:
      return update(state, { timePrefs: { $merge: action.payload.timePrefs } });
    case types.SET_BLOOD_GLUCOSE_PREFERENCES:
      return update(state, { bgPrefs: { $merge: action.payload.bgPrefs } });
    case types.FETCH_USER_SUCCESS:
      return update(state, { 
        loggedInUser: { $set: action.payload.user },
        isLoggedIn: { $set: true }
      });
    case types.FETCH_PENDING_INVITES_SUCCESS: 
      return update(state, { 
        pendingInvites: { $set: action.payload.pendingInvites }
      });
    case types.FETCH_PENDING_MEMBERSHIPS_SUCCESS: 
      return update(state, { 
        pendingMemberships: { $set: action.payload.pendingMemberships }
      });
    case types.FETCH_PATIENTS_SUCCESS: 
      let patientMap = {};
      action.payload.patients.forEach((p) => patientMap[p.userid] = p);

      return update(state, {
        patientsMap: { $set: patientMap }
      });
    case types.CLEAR_PATIENT_IN_VIEW: 
      return update(state, { 
        currentPatientInView: { $set: null }
      });
    case types.FETCH_PATIENT_SUCCESS:
      return update(state, { 
        currentPatientInView: { $set: action.payload.patient }
      });
    case types.CLEAR_PATIENT_DATA: 
      return update(state, { 
        patientDataMap: {
          [action.payload.patientId]: { $set: null }
        },
        patientNotesMap: {
          [action.payload.patientId]: { $set: null }
        }
      });
    case types.UPDATE_LOCAL_PATIENT_DATA:
      return update(state, {
        patientDataMapa: {
          [action.payload.patientId]: { $set: action.payload.patientData }
        }
      });
    case types.FETCH_PATIENT_DATA_SUCCESS:
      return update(state, { 
        patientDataMap: {
          [action.payload.patientId]: { $set: action.payload.patientData }
        },
        patientNotesMap: {
          [action.payload.patientId]: { $set: action.payload.patientNotes }
        }
      });
    case types.CLOSE_MESSAGE_THREAD: 
      return update(state, {
        messageThread: { $set: null }
      });
    case types.FETCH_MESSAGE_THREAD_SUCCESS: 
      return update(state, { 
        messageThread: { $set: action.payload.messageThread }
      });
    case types.LOGIN_SUCCESS:
      return update(state, { 
        loggedInUser: { $set: action.payload.user },
        isLoggedIn: { $set: true }
      });
    case types.LOGIN_FAILURE:
      if (action.payload) {
        return update(state, { $merge: action.payload });
      } else {
        return state;
      }
    case types.LOGOUT_SUCCESS:
      return update(state, { 
        isLoggedIn: { $set: false },
        patientsMap: { $set: {} }, 
        patientDataMap: { $set: {} },
        patientNotesMap: { $set: {} },
        invites: { $set: [] }, 
        loggedInUser: { $set: null },
        currentPatientInView: { $set: null }
      });
    case types.SIGNUP_SUCCESS:
      return update(state, { 
        emailVerificationSent: { $set: true }
      });
    case types.CONFIRM_SIGNUP_SUCCESS:
      return update(state, { 
        confirmedSignup: { $set: true }
      });
    case types.CONFIRM_PASSWORD_RESET_SUCCESS:
      return update(state, { 
        passwordResetConfirmed: { $set: true }
      });
    case types.ACCEPT_TERMS_SUCCESS:
      return update(state, { 
        loggedInUser: {
          termsAccepted: { $set: action.payload.acceptedDate }
        }
      });
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
      return update(state, { 
        resentEmailVerification: { $set: true }
      });
    case types.CREATE_PATIENT_SUCCESS:
      return update(state, { 
        loggedInUser: { $set:
          { profile: action.payload.patient.profile }
        },
        currentPatientInView: { $set:action.payload.patient }
      });
    case types.SEND_INVITATION_SUCCESS:
      return update(state, { 
        pendingInvites: { $push: [action.payload.invitation ]}
      });
    case types.CANCEL_INVITATION_SUCCESS:
      return update(state, { 
        pendingInvites: { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.email !== action.payload.removedEmail )
        }}
      });
    case types.ACCEPT_MEMBERSHIP_SUCCESS:
      return update(state, { 
        pendingMemberships: { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.key !== action.payload.acceptedMembership.key );
        }},
        patientsMap: { $merge: { [action.payload.acceptedMembership.creator.userid]: action.payload.acceptedMembership.creator } }
      });
    case types.DISMISS_MEMBERSHIP_SUCCESS:
      return update(state, { 
        pendingMemberships: { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.key !== action.payload.dismissedMembership.key );
        }}
      });
    case types.UPDATE_PATIENT_SUCCESS:
      return update(state, { 
        currentPatientInView: { $set: action.payload.updatedPatient }
      });
    case types.UPDATE_USER_REQUEST:
      return update(state, { 
        loggedInUser: {
          $merge: action.payload.updatingUser
        }
      }); 
    case types.UPDATE_USER_SUCCESS:
      return update(state, { 
        loggedInUser: {
          $merge: action.payload.updatedUser
        }
      });
    default: 
      return state;
  }
};