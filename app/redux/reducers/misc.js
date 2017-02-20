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
import actionWorkingMap from '../constants/actionWorkingMap';

export const notification = (state = initialState.notification, action) => {
  switch (action.type) {
    case types.FETCH_USER_FAILURE:
    case types.FETCH_PENDING_SENT_INVITES_FAILURE:
    case types.FETCH_PENDING_RECEIVED_INVITES_FAILURE:
    case types.FETCH_PATIENTS_FAILURE:
    case types.FETCH_PATIENT_FAILURE:
    case types.FETCH_PATIENT_DATA_FAILURE:
    case types.FETCH_MESSAGE_THREAD_FAILURE:
    case types.LOGIN_FAILURE:
    case types.LOGOUT_FAILURE:
    case types.SIGNUP_FAILURE:
    case types.CONFIRM_SIGNUP_FAILURE:
    case types.CONFIRM_PASSWORD_RESET_FAILURE:
    case types.ACCEPT_TERMS_FAILURE:
    case types.RESEND_EMAIL_VERIFICATION_FAILURE:
    case types.SETUP_DATA_STORAGE_FAILURE:
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE:
    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE:
    case types.REQUEST_PASSWORD_RESET_FAILURE:
    case types.SEND_INVITE_FAILURE:
    case types.CANCEL_SENT_INVITE_FAILURE:
    case types.ACCEPT_RECEIVED_INVITE_FAILURE:
    case types.REJECT_RECEIVED_INVITE_FAILURE:
    case types.SET_MEMBER_PERMISSIONS_FAILURE:
    case types.UPDATE_PATIENT_FAILURE:
    case types.UPDATE_USER_FAILURE:
      const err = _.get(action, 'error', null);
      if (err) {
        return {
          key: actionWorkingMap(action.type),
          isDismissible: true,
          link: _.get(action, ['payload', 'link'], null),
          status: _.get(err, 'status', null)
        };
      }
      else {
        return null;
      }
    case types.ACKNOWLEDGE_NOTIFICATION:
      return null;
    default:
      return state;
  }
};

export const passwordResetConfirmed = (state = initialState.passwordResetConfirmed, action) => {
  switch(action.type) {
    case types.CONFIRM_PASSWORD_RESET_SUCCESS:
      return true;
    default:
      return state;
  }
};

export const showingWelcomeMessage = (state = initialState.showingWelcomeMessage, action) => {
  switch(action.type) {
    case types.SHOW_WELCOME_MESSAGE:
      return true;
    case types.HIDE_WELCOME_MESSAGE:
      return false;
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const signupKey = (state = initialState.signupKey, action) => {
  switch(action.type) {
    case types.CONFIRM_SIGNUP_FAILURE:
      return action.payload.signupKey;
    case types.VERIFY_CUSTODIAL_FAILURE:
      return action.payload.signupKey;
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const isLoggedIn = (state = initialState.isLoggedIn, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      return true;
    case types.LOGOUT_REQUEST:
      return false;
    default:
      return state;
  }
};

export const sentEmailVerification = (state = initialState.sentEmailVerification, action) => {
  switch(action.type) {
    case types.SIGNUP_SUCCESS:
      return true;
    default:
      return state;
  }
};

export const resentEmailVerification = (state = initialState.resentEmailVerification, action) => {
  switch(action.type) {
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
      return true;
    default:
      return state;
  }
};

export const allUsersMap = (state = initialState.allUsersMap, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS: {
      const { user } = action.payload;
      return update(state, {
        [user.userid]: { $set: _.omit(user, ['permissions', 'team'])}
      });
    }
    case types.FETCH_PATIENT_SUCCESS: {
      let newState;
      const { patient } = action.payload;
      if (state[patient.userid]) {
        newState = update(state, {
          [patient.userid]: { $merge: _.omit(patient, ['permissions', 'team'])}
        });
      } else {
        newState = update(state, {
          [patient.userid]: { $set: _.omit(patient, ['team'])}
        });
      }
      const { team } = patient;
      if (team) {
        let others = {};
        action.payload.patient.team.forEach(
          (member) => others[member.userid] = _.omit(member, 'permissions')
        );
        return update(newState, { $merge: others });
      }
      return newState;
    }
    case types.FETCH_PATIENTS_SUCCESS:
      const { patients } = action.payload || [];
      let patientsMap = {};

      patients.forEach((patient) => {
        patientsMap[patient.userid] = _.omit(patient, ['permissions', 'team']);
      });

      return update(state, { $merge: patientsMap });
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
      let { creator } = action.payload.acceptedReceivedInvite;
      return update(state, { $merge: { [creator.userid]: creator } });
    case types.ACCEPT_TERMS_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: { termsAccepted: action.payload.acceptedDate } } });
    case types.SETUP_DATA_STORAGE_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: { profile: action.payload.patient.profile } } });
    case types.UPDATE_USER_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: action.payload.updatedUser }});
    case types.UPDATE_PATIENT_SUCCESS:
      return update(state, { [action.payload.updatedPatient.userid]: { $merge: _.omit(action.payload.updatedPatient, ['permissions', 'team']) }});
    case types.LOGOUT_REQUEST:
      return {};
    default:
      return state;
  }
};

export const currentPatientInViewId = (state = initialState.currentPatientInViewId, action) => {
  switch(action.type) {
    case types.SETUP_DATA_STORAGE_SUCCESS:
    case types.FETCH_PATIENT_SUCCESS:
      return _.get(action.payload, ['patient', 'userid'], null);
    case types.UPDATE_PATIENT_SUCCESS:
      return _.get(action.payload, ['updatedPatient', 'userid'], null);
    case types.LOGOUT_REQUEST:
    case types.CLEAR_PATIENT_IN_VIEW:
      return null;
    default:
      return state;
  }
};

export const targetUserId = (state = initialState.targetUserId, action) => {
  switch(action.type) {
    case types.SETUP_DATA_STORAGE_SUCCESS:
      return _.get(action.payload, ['patient', 'userid'], null);
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      if (_.get(action.payload, ['user', 'profile', 'patient'])) {
        return _.get(action.payload, ['user', 'userid'], null);
      } else {
        return null;
      }
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const loggedInUserId = (state = initialState.loggedInUserId, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      return _.get(action.payload, ['user', 'userid'], null);
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const membersOfTargetCareTeam = (state = initialState.membersOfTargetCareTeam, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_SUCCESS:
      const team = _.get(action.payload, ['patient', 'team'], []);
      return team.map((member) => member.userid);
    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS:
      return _.reject(state, (memberId) => {
        return memberId === _.get(action.payload, 'removedMemberId', null);
      });
    case types.LOGOUT_REQUEST:
      return [];
    default:
      return state;
  }
};

export const membershipInOtherCareTeams = (state = initialState.membershipInOtherCareTeams, action) => {
  switch(action.type) {
    case types.FETCH_PATIENTS_SUCCESS:
      const patients = _.get(action.payload, ['patients'], []);
      return patients.map((patient) => patient.userid);
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
      const creatorId = _.get(action.payload, ['acceptedReceivedInvite', 'userid'], null);
      if (creatorId) {
        return update(state, { $push: [ creatorId ]});
      }
      return state;
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS:
      return _.reject(state, (memberId) => {
        return memberId === _.get(action.payload, 'removedPatientId', null);
      });
    case types.LOGOUT_REQUEST:
      return [];
    default:
      return state;
  }
};

export const permissionsOfMembersInTargetCareTeam = (state = initialState.permissionsOfMembersInTargetCareTeam, action) => {
  switch(action.type) {
    case types.SETUP_DATA_STORAGE_SUCCESS: {
      const userId = _.get(action.payload, 'userId');
      if (userId) {
        return update(state, {
          [userId]: { $set: {root: {}}}
        });
      } else {
        return state;
      }
    }
    case types.FETCH_PATIENT_SUCCESS: {
      const team = _.get(action.payload, ['patient', 'team']);
      if (!_.isEmpty(team)) {
        let permissions = {};
        team.forEach((t) => permissions[t.userid] = t.permissions);
        return update(state, { $merge: permissions });
      }
    }
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS: {
      const userId = _.get(action.payload, ['user', 'userid']);
      const perms = _.get(action.payload, ['user', 'permissions']);
      if (userId && !_.isEmpty(perms)) {
        return update(state, {
          [userId]: { $set: perms }
        });
      } else {
        return state;
      }
    }
    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS:
      return _.omit(state, _.get(action.payload, 'removedMemberId', null));
    case types.LOGOUT_REQUEST:
      return {};
    default:
      return state;
  }
};

export const membershipPermissionsInOtherCareTeams = (state = initialState.membershipPermissionsInOtherCareTeams, action) => {
  switch(action.type) {
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS: {
      const { creatorId } = action.payload.acceptedReceivedInvite;
      const { context } = action.payload.acceptedReceivedInvite;
      return update(state, { $merge: { [creatorId]: context }});
    }
    case types.FETCH_PATIENTS_SUCCESS: {
      let permissions = {};
      action.payload.patients.forEach((p) => permissions[p.userid] = p.permissions);

      return update(state, { $set: permissions });
    }
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS:
      return _.omit(state, _.get(action.payload, 'removedPatientId', null));
    case types.LOGOUT_REQUEST:
      return {};
    default:
      return state;
  }
};

// NB: not being used (yet!)
export const timePrefs = (state = initialState.timePrefs, action) => {
  switch(action.type) {
    case types.SET_TIME_PREFERENCES:
      return update(state, { $set: action.payload.timePrefs });
    default:
      return state;
  }
};

// NB: not being used (yet!)
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
      return update(state, { $set: _.get(action.payload, 'messageThread', null) });
    case types.CLOSE_MESSAGE_THREAD:
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const patientDataMap = (state = initialState.patientDataMap, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_DATA_SUCCESS: {
      const { patientId, patientData } = action.payload;
      return update(state, {
        [patientId]: { $set: patientData }
      });
    }
    case types.CLEAR_PATIENT_DATA: {
      const { patientId } = action.payload;
      return update(state, {
        [patientId]: { $set: null }
      });
    }
    case types.LOGOUT_REQUEST:
    case types.FETCH_PATIENT_DATA_FAILURE:
      return {};
    default:
      return state;
  }
};

export const patientNotesMap = (state = initialState.patientNotesMap, action) => {
  switch(action.type) {
    case types.FETCH_PATIENT_DATA_SUCCESS: {
      const { patientId, patientNotes } = action.payload;
      return update(state, {
        [patientId]: { $set: patientNotes }
      });
    }
    case types.CLEAR_PATIENT_DATA: {
      const { patientId } = action.payload;
      return update(state, {
        [patientId]: { $set: null }
      });
    }
    case types.LOGOUT_REQUEST:
    case types.FETCH_PATIENT_DATA_FAILURE:
      return {};
    default:
      return state;
  }
};

export const pendingSentInvites = (state = initialState.pendingSentInvites, action) => {
  switch(action.type) {
    case types.FETCH_PENDING_SENT_INVITES_SUCCESS:
      return update(state, { $set: _.get(action.payload, 'pendingSentInvites', []) });
    case types.SEND_INVITE_SUCCESS:
      const invite = _.get(action.payload, 'invite', null);
      if (invite) {
        return update(state, { $push: [ action.payload.invite ] });
      }
      return state;
    case types.CANCEL_SENT_INVITE_SUCCESS:
      return update(state, { $apply: (invite) => {
          return invite.filter( (i) => i.email !== action.payload.removedEmail )
        }
      });
    case types.LOGOUT_REQUEST:
      return [];
    default:
      return state;
  }
};

export const pendingReceivedInvites = (state = initialState.pendingReceivedInvites, action) => {
  switch(action.type) {
    case types.FETCH_PENDING_RECEIVED_INVITES_SUCCESS:
      return update(state, { $set: _.get(action.payload, 'pendingReceivedInvites', []) });
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
      return update(state, { $apply: (invite) => {
          return invite.filter( (i) => i.key !== _.get(action.payload, 'acceptedReceivedInvite.key', null) );
        }
      });
    case types.REJECT_RECEIVED_INVITE_SUCCESS:
      return update(state, { $apply: (invite) => {
          return invite.filter( (i) => i.key !== _.get(action.payload, 'rejectedReceivedInvite.key', null) );
        }
      });
    case types.LOGOUT_REQUEST:
      return [];
    default:
      return state;
  }
};
