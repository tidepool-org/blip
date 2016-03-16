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

export const notification = (state = initialState.notification, action) => {
  switch (action.type) {
    case types.ACKNOWLEDGE_NOTIFICATION:
      if (!action.payload.acknowledgedNotification) {
        return update(state, { $set: null });
      }
    default:
      return state;
  }
};

export const passwordResetConfirmed = (state = initialState.passwordResetConfirmed, action) => {
  switch(action.type) {
    case types.CONFIRM_PASSWORD_RESET_SUCCESS:
      return update(state, { $set: true });
    default:
      return state;
  }
};

export const signupConfirmed = (state = initialState.signupConfirmed, action) => {
  switch(action.type) {
    case types.CONFIRM_SIGNUP_SUCCESS:
      return update(state, { $set: true });
    case types.HIDE_WELCOME_MESSAGE:
      return update(state, { $set: false });
    default:
      return state;
  }
};

export const isLoggedIn = (state = initialState.isLoggedIn, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      return update(state, { $set: true });
    case types.LOGOUT_REQUEST:
      return update(state, { $set: false });
    default:
      return state;
  }
};

export const sentEmailVerification = (state = initialState.sentEmailVerification, action) => {
  switch(action.type) {
    case types.SIGNUP_SUCCESS:
      return update(state, { $set: true });
    default:
      return state;
  }
};

export const resentEmailVerification = (state = initialState.resentEmailVerification, action) => {
  switch(action.type) {
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
      return update(state, { $set: true });
    default:
      return state;
  }
};

export const allUsersMap = (state = initialState.allUsersMap, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      return update(state, { [action.payload.user.userid]: { $set: _.omit(action.payload.user, ['team']) } });
    case types.FETCH_PATIENT_SUCCESS: 
      let intermediate;

      if (state[action.payload.patient.userid]) {
        intermediate = update(state,  { [action.payload.patient.userid]: { $merge: _.omit(action.payload.patient, ['permissions', 'team']) } });
      } else {
        intermediate = update(state,  { [action.payload.patient.userid]: { $set: _.omit(action.payload.patient, ['permissions', 'team']) } });
      }
      
      if (action.payload.patient.team) {
        let others = {};
        action.payload.patient.team.forEach((t) => others[t.userid] = _.omit(t, 'permissions'));
        return update(intermediate, { $merge: others });
      }
      
      return intermediate;
    case types.FETCH_PATIENTS_SUCCESS: 
      let patientsMap = {};
      
      action.payload.patients.forEach((p) => {
        patientsMap[p.userid] = _.omit(p, ['permissions', 'team']);
      });

      return update(state, { $merge: patientsMap });
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
      let { creator } = action.payload.acceptedReceivedInvite;
      return update(state, { $merge: { [creator.userid]: creator } });
    case types.ACCEPT_TERMS_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: { termsAccepted: action.payload.acceptedDate } } });
    case types.CREATE_PATIENT_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: { profile: action.payload.patient.profile } } });
    case types.UPDATE_USER_REQUEST:
      return update(state, { [action.payload.userId]: { $merge: _.omit(action.payload.updatingUser, ['permissions']) }});
    case types.UPDATE_USER_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: _.omit(action.payload.updatedUser, ['permissions']) }});
    case types.UPDATE_PATIENT_SUCCESS:
      return update(state, { [action.payload.updatedPatient.userid]: { $merge: _.omit(action.payload.updatedPatient, ['permissions']) }});
    case types.LOGOUT_REQUEST:
      return update(state, { $set: {} });
    default:
      return state;
  }
};

export const currentPatientInViewId = (state = initialState.currentPatientInViewId, action) => {
  switch(action.type) {
    case types.CREATE_PATIENT_SUCCESS:
    case types.FETCH_PATIENT_SUCCESS:
      return update(state, { $set: action.payload.patient.userid });
    case types.UPDATE_PATIENT_SUCCESS:
      return update(state, { $set: action.payload.updatedPatient.userid });
    case types.LOGOUT_REQUEST:
    case types.CLEAR_PATIENT_IN_VIEW:
      return update(state, { $set: null });
    default:
      return state; 
  }
};

export const targetUserId = (state = initialState.targetUserId, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      if (_.get(action.payload.user, ['profile', 'patient'])) {
        return update(state, { $set: action.payload.user.userid });
      } else {
        return update(state, { $set: null });
      }
    case types.LOGOUT_REQUEST:
      return update(state, { $set: null });
    default:
      return state;
  }
};

export const loggedInUserId = (state = initialState.loggedInUserId, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      return update(state, { $set: action.payload.user.userid });
    case types.LOGOUT_REQUEST:
      return update(state, { $set: null });
    default:
      return state;
  }
};

export const membersOfTargetCareTeam = (state = initialState.membersOfTargetCareTeam, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_SUCCESS:
      if (action.payload.patient.team){
        let ids = [];
        ids = action.payload.patient.team.map((t) => t.userid);
        return update(state, { $set: ids });
      }

      return state;
    case types.LOGOUT_REQUEST:
      return update(state, { $set: [] });
    default:
      return state;
  }
};

export const memberInOtherCareTeams = (state = initialState.memberInOtherCareTeams, action) => {
  switch(action.type) {
    case types.FETCH_PATIENTS_SUCCESS:
      let ids = action.payload.patients.map((p) => p.userid);

      return update(state, { $set: ids });
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
      let { creator } = action.payload.acceptedReceivedInvite;
      return update(state, { $push: [ creator.userid ] });
    case types.LOGOUT_REQUEST:
      return update(state, { $set: [] });
    default:
      return state;
  }
};

export const permissionsOfMembersInTargetCareTeam = (state = initialState.permissionsOfMembersInTargetCareTeam, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_SUCCESS:
      if (action.payload.patient.team) {
        let permissions = {};
        action.payload.patient.team.forEach((t) => permissions[t.userid] = t.permissions);
        return update(state, { $set: permissions });
      }
        
      return state;
    case types.LOGOUT_REQUEST:
      return update(state, { $set: {} });
    default:
      return state;
  }
};

export const membershipPermissionsInOtherCareTeams = (state = initialState.membershipPermissionsInOtherCareTeams, action) => {
  switch(action.type) {
    case types.FETCH_PATIENTS_SUCCESS:
      let permissions = {};
      action.payload.patients.forEach((p) => permissions[p.userid] = p.permissions);

      return update(state, { $set: permissions });
    case types.REMOVE_PATIENT_SUCCESS:
      return update(state, { $set: permissions });
    case types.LOGOUT_REQUEST:
      return update(state, { $set: {} });
    default:
      return state;
  }
};

export const timePrefs = (state = initialState.timePrefs, action) => {
  switch(action.type) {
    case types.SET_TIME_PREFERENCES:
      return update(state, { $set: action.payload.timePrefs });
    default:
      return state;
  }
};

export const bgPrefs = (state = initialState.bgPrefs, action) => {
  switch(action.type) {
    case types.SET_BLOOD_GLUCOSE_PREFERENCES:
      return update(state, { $set: action.payload.bgPrefs });
    default:
      return state;
  }
};

export const messageThread = (state = initialState.messageThread, action) => {
  switch(action.type) {
    case types.FETCH_MESSAGE_THREAD_SUCCESS:
      return update(state, { $set: action.payload.messageThread });
    case types.CLOSE_MESSAGE_THREAD:
    case types.LOGOUT_REQUEST:
      return update(state, { $set: null });
    default:
      return state;
  }
};

export const patientDataMap = (state = initialState.patientDataMap, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_DATA_SUCCESS:
      return update(state, {
        [action.payload.patientId]: { $set: action.payload.patientData }
      });
    case types.CLEAR_PATIENT_DATA:
      return update(state, {
        [action.payload.patientId]: { $set: null }
      });
    case types.LOGOUT_REQUEST:
      return update(state, { $set: {} });
    default:
      return state;
  }
};

export const patientNotesMap = (state = initialState.patientNotesMap, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_DATA_SUCCESS:
      return update(state, {
        [action.payload.patientId]: { $set: action.payload.patientNotes }
      });
    case types.CLEAR_PATIENT_DATA:
      return update(state, {
        [action.payload.patientId]: { $set: null }
      });
    case types.LOGOUT_REQUEST:
      return update(state, { $set: {} });
    default:
      return state;
  }
};

export const pendingSentInvites = (state = initialState.pendingSentInvites, action) => {
  switch(action.type) {
    case types.FETCH_PENDING_SENT_INVITES_SUCCESS:
      return update(state, { $set: action.payload.pendingSentInvites });
    case types.SEND_INVITE_SUCCESS:
      return update(state, { $push: [ action.payload.invite ] });
    case types.CANCEL_SENT_INVITE_SUCCESS:
      return update(state, { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.email !== action.payload.removedEmail )
        }
      });
    case types.LOGOUT_REQUEST:
      return update(state, { $set: [] });
    default:
      return state;
  }
};

export const pendingReceivedInvites = (state = initialState.pendingReceivedInvites, action) => {
  switch(action.type) {
    case types.FETCH_PENDING_RECEIVED_INVITES_SUCCESS:
      return update(state, { $set: action.payload.pendingReceivedInvites });
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
      return update(state, { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.key !== action.payload.acceptedReceivedInvite.key );
        }
      });
    case types.REJECT_RECEIVED_INVITE_SUCCESS:
      return update(state, { $apply: (currentValue) => {
          return currentValue.filter( (i) => i.key !== action.payload.rejectedReceivedInvite.key );
        }
      });
    case types.LOGOUT_REQUEST:
      return update(state, { $set: [] });
    default:
      return state;
  }
};