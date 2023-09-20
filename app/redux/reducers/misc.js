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
import update from 'immutability-helper';
import { generateCacheTTL } from 'redux-cache';
import moment from 'moment';

import initialState from './initialState';
import * as types from '../constants/actionTypes';
import actionWorkingMap from '../constants/actionWorkingMap';
import { isDataDonationAccount } from '../../core/personutils';

export const notification = (state = initialState.notification, action) => {
  switch (action.type) {
    case types.FETCH_USER_FAILURE:
    case types.FETCH_PENDING_SENT_INVITES_FAILURE:
    case types.FETCH_PENDING_RECEIVED_INVITES_FAILURE:
    case types.FETCH_ASSOCIATED_ACCOUNTS_FAILURE:
    case types.FETCH_PATIENT_FAILURE:
    case types.FETCH_PATIENT_DATA_FAILURE:
    case types.FETCH_MESSAGE_THREAD_FAILURE:
    case types.LOGIN_FAILURE:
    case types.SIGNUP_FAILURE:
    case types.CONFIRM_SIGNUP_FAILURE:
    case types.CONFIRM_PASSWORD_RESET_FAILURE:
    case types.ACCEPT_TERMS_FAILURE:
    case types.RESEND_EMAIL_VERIFICATION_FAILURE:
    case types.SETUP_DATA_STORAGE_FAILURE:
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE:
    case types.REQUEST_PASSWORD_RESET_FAILURE:
    case types.ACCEPT_RECEIVED_INVITE_FAILURE:
    case types.REJECT_RECEIVED_INVITE_FAILURE:
    case types.UPDATE_PATIENT_FAILURE:
    case types.UPDATE_USER_FAILURE:
    case types.UPDATE_DATA_DONATION_ACCOUNTS_FAILURE:
    case types.FETCH_DATA_SOURCES_FAILURE:
    case types.FETCH_SERVER_TIME_FAILURE:
    case types.CONNECT_DATA_SOURCE_FAILURE:
    case types.DISCONNECT_DATA_SOURCE_FAILURE:
    case types.ADD_CLINICIAN_TO_CLINIC_FAILURE:
    case types.CREATE_CLINIC_FAILURE:
    case types.KEYCLOAK_INIT_ERROR:
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

export const showingDonateBanner = (state = initialState.showingDonateBanner, action) => {
  switch (action.type) {
    case types.SHOW_BANNER:
      return (action.payload.type === 'donate' && state !== false) ? true : state;
    case types.DISMISS_BANNER:
      return (action.payload.type === 'donate') ? false : state;
    case types.FETCH_USER_SUCCESS:
      const dismissedBanner = _.get(action.payload, 'user.preferences.dismissedDonateYourDataBannerTime');
      return dismissedBanner ? false : state;
    case types.HIDE_BANNER:
      return (action.payload.type === 'donate') ? null : state;
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const showingDexcomConnectBanner = (state = initialState.showingDexcomConnectBanner, action) => {
  switch (action.type) {
    case types.SHOW_BANNER:
      return (action.payload.type === 'dexcom' && state !== false) ? true : state;
    case types.DISMISS_BANNER:
      return (action.payload.type === 'dexcom') ? false : state;
    case types.FETCH_PATIENT_FROM_CLINIC_SUCCESS:
      const patientDexcomDataSourceConnectState = (_.find(action.payload.patient?.dataSources, { providerName: 'dexcom' }) || {}).state;
      return patientDexcomDataSourceConnectState === 'error' || state;
    case types.HIDE_BANNER:
      return (action.payload.type === 'dexcom') ? null : state;
    case types.DATA_WORKER_REMOVE_DATA_REQUEST:
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const showingUpdateTypeBanner = (state = initialState.showingUpdateTypeBanner, action) => {
  switch (action.type) {
    case types.SHOW_BANNER:
      return (action.payload.type === 'updatetype' && state !== false) ? true : state;
    case types.DISMISS_BANNER:
      return (action.payload.type === 'updatetype') ? false : state;
    case types.FETCH_USER_SUCCESS:
      const dismissedBanner = _.get(action.payload, 'user.preferences.dismissedUpdateTypeBannerTime');
      const clickedBanner = _.get(action.payload, 'user.preferences.clickedUpdateTypeBannerTime');
      return (dismissedBanner || clickedBanner) ? false : state;
    case types.HIDE_BANNER:
      return (action.payload.type === 'updatetype') ? null : state;
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const showingUploaderBanner = (state = initialState.showingUploaderBanner, action) => {
  switch (action.type) {
    case types.SHOW_BANNER:
      return (action.payload.type === 'uploader' && state !== false) ? true : state;
    case types.DISMISS_BANNER:
      return (action.payload.type === 'uploader') ? false : state;
    case types.FETCH_USER_SUCCESS:
      const dismissedBanner = _.get(action.payload, 'user.preferences.dismissedUploaderBannerTime');
      const clickedBanner = _.get(action.payload, 'user.preferences.clickedUploaderBannerTime');
      return (dismissedBanner || clickedBanner) ? false : state;
    case types.HIDE_BANNER:
      return (action.payload.type === 'uploader') ? null : state;
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const showingShareDataBanner = (state = initialState.showingShareDataBanner, action) => {
  switch (action.type) {
    case types.SHOW_BANNER:
      return (action.payload.type === 'sharedata' && state !== false) ? true : state;
    case types.DISMISS_BANNER:
      return (action.payload.type === 'sharedata') ? false : state;
    case types.FETCH_USER_SUCCESS:
      const dismissedBanner = _.get(action.payload, 'user.preferences.dismissedShareDataBannerTime');
      const clickedBanner = _.get(action.payload, 'user.preferences.clickedShareDataBannerTime');
      return (dismissedBanner || clickedBanner) ? false : state;
    case types.HIDE_BANNER:
      return (action.payload.type === 'sharedata') ? null : state;
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const seenShareDataBannerMax = (state = initialState.seenShareDataBannerMax, action) => {
  switch (action.type) {
    case types.SHOW_BANNER:
      return (action.payload.count > 2) ? true : state;
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
      const { user } = action.payload;
      return _.get(user, 'emails.0', state);
    default:
      return state;
  }
};

export const resentEmailVerification = (state = initialState.resentEmailVerification, action) => {
  switch(action.type) {
    case types.RESEND_EMAIL_VERIFICATION_SUCCESS:
      return true;
    case types.CLEAR_PATIENT_IN_VIEW:
    case types.FETCH_PATIENT_SUCCESS:
      return false;
    default:
      return state;
  }
};

export const allUsersMap = (state = initialState.allUsersMap, action) => {
  switch(action.type) {
    case types.FETCH_USER_SUCCESS:
    case types.SIGNUP_SUCCESS:
    case types.LOGIN_SUCCESS: {
      const { user } = action.payload;
      const updateAction = state[user.userid] ? '$merge' : '$set';
      return update(state, {
        [user.userid]: { [updateAction]: _.omit(user, ['permissions', 'team'])},
        [`${user.userid}_cacheUntil`]: { $set: generateCacheTTL(36e5) }, // Cache for 60 mins
      });
    }
    case types.FETCH_PATIENT_SUCCESS: {
      let newState;
      const { patient } = action.payload;
      const patientCache = {[`${patient.userid}_cacheUntil`]: { $set: generateCacheTTL(36e5) }}; // Cache for 60 mins
      if (state[patient.userid]) {
        newState = update(state, {
          [patient.userid]: { $merge: patient },
          ...patientCache,
        });
      } else {
        newState = update(state, {
          [patient.userid]: { $set: patient },
          ...patientCache,
        });
      }

      return newState;
    }
    case types.FETCH_ASSOCIATED_ACCOUNTS_SUCCESS:
      const { patients = [], careTeam = [] } = action.payload;
      let patientsMap = {};

      [...patients, ...careTeam].forEach((patient) => {
        patientsMap[patient.userid] = {
          ..._.omit(patient, ['permissions']),
          settings: patient.settings || _.get(state, [patient.userid, 'settings']),
        };
        patientsMap[`${patient.userid}_cacheUntil`] = generateCacheTTL(36e5); // Cache for 60 mins
      });

      return update(state, { $merge: patientsMap });
    case types.ACCEPT_RECEIVED_INVITE_SUCCESS:
      let { creator } = action.payload.acceptedReceivedInvite;
      return update(state, { $merge: {
        [creator.userid]: creator,
        [`${creator.userid}_cacheUntil`]: generateCacheTTL(36e5),
      } });
    case types.GET_CLINICS_FOR_CLINICIAN_SUCCESS:
      let { clinicianId, clinics } = action.payload;
      return update(state, { $merge: {
        [clinicianId]: {
          ...state[clinicianId],
          isClinicMember: clinics.length > 0,
        },
        [`${clinicianId}_cacheUntil`]: generateCacheTTL(36e5),
      } });
    case types.ACCEPT_TERMS_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: { termsAccepted: action.payload.acceptedDate } } });
    case types.SETUP_DATA_STORAGE_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: { profile: action.payload.patient.profile } } });
    case types.UPDATE_USER_SUCCESS:
      return update(state, { [action.payload.userId]: { $merge: action.payload.updatedUser }});
    case types.UPDATE_PATIENT_SUCCESS:
      return update(state, { [action.payload.updatedPatient.userid]: { $merge: action.payload.updatedPatient }});
    case types.UPDATE_CLINIC_PATIENT_SUCCESS: {
      const patientId = _.get(action.payload, 'patientId');
      return update(state, {
        // Remove stored user cache key so any changes are pulled in on next data view
        $unset: [`${patientId}_cacheUntil`],
      });
    }
    case types.CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS:
      return update(state, { [action.payload.patientId]: { $set: action.payload.patient }});
    case types.UPDATE_SETTINGS_SUCCESS:
      return update(state, { [action.payload.userId]: { settings: { $merge: action.payload.updatedSettings }}});
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
    case types.FETCH_ASSOCIATED_ACCOUNTS_SUCCESS:
      const team = _.get(action.payload, 'careTeam', []);
      return team.length ? team.map((member) => member.userid) : state;
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
    case types.FETCH_ASSOCIATED_ACCOUNTS_SUCCESS:
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
    case types.CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS:
      if (action.payload?.patientId) {
        return update(state, { $push: [ action.payload.patientId ]});
      }
      return state;
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
    case types.FETCH_ASSOCIATED_ACCOUNTS_SUCCESS: {
      const team = _.get(action.payload, 'careTeam');
      if (!_.isEmpty(team)) {
        let permissions = {};
        team.forEach((t) => permissions[t.userid] = t.permissions);
        return update(state, { $merge: permissions });
      }
      return state;
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
    case types.SET_MEMBER_PERMISSIONS_SUCCESS:
      const userId = _.get(action.payload, 'memberId');
      const perms = _.get(action.payload, 'permissions');
      if (userId && !_.isEmpty(perms)) {
        return update(state, {
          [userId]: { $set: perms }
        });
      } else {
        return state;
      }
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
    case types.FETCH_ASSOCIATED_ACCOUNTS_SUCCESS: {
      let permissions = {};
      action.payload.patients.forEach((patient) => {
        if (patient.permissions) {
          permissions[patient.userid] = patient.permissions;
        }
      });

      return update(state, { $set: permissions });
    }
    case types.REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS:
      return _.omit(state, _.get(action.payload, 'removedPatientId', null));
    case types.CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS:
      const { patientId } = action.payload;
      return update(state, { $merge: { [patientId]: { custodian: {}, upload: {}, view: {} } }});
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

export const pendingSentInvites = (state = initialState.pendingSentInvites, action) => {
  switch(action.type) {
    case types.FETCH_PENDING_SENT_INVITES_SUCCESS:
      return update(state, { $set: _.get(action.payload, 'pendingSentInvites', []) });
    case types.SEND_INVITE_SUCCESS:
    case types.SEND_CLINIC_INVITE_SUCCESS:
      const invite = _.get(action.payload, 'invite', null);
      if (invite) {
        // Replace at index of existing invite if already in state, else push if new.
        const existingInviteIndex = _.findIndex(state, { key: invite.key });
        if (existingInviteIndex >= 0) return update(state, { $splice: [[existingInviteIndex, 1, invite]] });
        return update(state, { $push: [ action.payload.invite ] });
      }
      return state;
    case types.CANCEL_SENT_INVITE_SUCCESS:
      return update(state, { $apply: (invites) => {
          return invites.filter( (i) => i.email !== action.payload.removedEmail )
        }
      });
    case types.RESEND_INVITE_SUCCESS:
      const updatedInvite = _.get(action.payload, 'invite', null);
      const removedInviteId = _.get(action.payload, 'removedInviteId');
      if (updatedInvite) {
        // Replace at index of existing invite if already in state, else push if new.
        const existingInviteIndex = _.findIndex(state, { key: removedInviteId });
        if (existingInviteIndex >= 0) return update(state, { $splice: [[existingInviteIndex, 1, updatedInvite]] });
        return update(state, { $push: [ updatedInvite ] });
      }
      return state;
    case types.DELETE_PATIENT_INVITATION_SUCCESS:
      return update(state, { $apply: (invites) => {
          return invites.filter( (i) => i.key !== action.payload.inviteId )
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

export const dataDonationAccounts = (state = initialState.dataDonationAccounts, action) => {
  let accounts;
  switch(action.type) {
    case types.FETCH_ASSOCIATED_ACCOUNTS_SUCCESS:
      accounts = state.concat(_.get(action.payload, 'dataDonationAccounts', []));
      return update(state, { $set: _.uniqBy(accounts, 'email') });

    case types.FETCH_PENDING_SENT_INVITES_SUCCESS:
      accounts = state.concat(_.get(action.payload, 'pendingSentInvites', []).map(invite => {
        return {
          email: invite.email,
          status: 'pending',
        };
      }));
      return update(state, { $set: _.uniqBy(_.filter(accounts, isDataDonationAccount), 'email') });

    case types.CANCEL_SENT_INVITE_SUCCESS:
      return _.reject(state, { email: _.get(action.payload, 'removedEmail') });

    case types.REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS:
      return _.reject(state, { userid: _.get(action.payload, 'removedMemberId') });

    case types.LOGOUT_REQUEST:
      return [];

    default:
      return state;
  }
};

export const dataSources = (state = initialState.dataSources, action) => {
  switch (action.type) {
    case types.FETCH_DATA_SOURCES_SUCCESS:
      let dataSources = _.get(action.payload, 'dataSources', []);
      return update(state, { $set: dataSources });
    case types.LOGOUT_REQUEST:
      return [];
    default:
      return state;
  }
};

export const authorizedDataSource = (state = initialState.authorizedDataSource, action) => {
  switch (action.type) {
    case types.CONNECT_DATA_SOURCE_SUCCESS:
      let authorizedDataSource = _.get(action.payload, 'authorizedDataSource', {});
      return update(state, { $set: authorizedDataSource });
    case types.LOGOUT_REQUEST:
      return {};
    default:
      return state;
  }
};

export const prescriptions = (state = initialState.prescriptions, action) => {
  switch (action.type) {
    case types.FETCH_CLINIC_PRESCRIPTIONS_SUCCESS:
      const prescriptions = _.get(action.payload, 'prescriptions', {});
      return update(state, { $set: prescriptions });
    case types.CREATE_PRESCRIPTION_SUCCESS:
      const prescription = _.get(action.payload, 'prescription', {});
      return update(state, { $push: [prescription] });
    case types.CREATE_PRESCRIPTION_REVISION_SUCCESS:
      const updatedPrescriptionIndex = _.findIndex(state, { id: action.payload.prescription.id });
      return update(state, { $splice: [[updatedPrescriptionIndex, 1, action.payload.prescription]] });
    case types.DELETE_PRESCRIPTION_SUCCESS:
      const deletedPrescriptionIndex = _.findIndex(state, { id: action.payload.prescriptionId });
      return update(state, { $splice: [[deletedPrescriptionIndex, 1]] });
    case types.LOGOUT_REQUEST:
      return [];
    default:
      return state;
  }
};

export const devices = (state = initialState.devices, action) => {
  switch (action.type) {
    case types.FETCH_DEVICES_SUCCESS:
      const devices = _.get(action.payload, 'devices', {});
      return update(state, { $set: devices });

    default:
      return state;
  }
};

export const clinics = (state = initialState.clinics, action) => {
  switch (action.type) {
    case types.GET_CLINICS_SUCCESS: {
      let clinics = _.get(action.payload, 'clinics', []);
      const newClinics = _.reduce(
        clinics,
        (newSet, clinic) => {
          newSet[clinic.id] = { clinicians: {}, patients: {}, patientInvites: {}, ...clinic };
          return newSet;
        },
        {}
      );
      return _.merge({}, state, newClinics);
    }
    case types.FETCH_PATIENTS_FOR_CLINIC_SUCCESS: {
      let { clinicId, patients, count } = action.payload;
      const newPatientSet = _.reduce(patients, (newSet, patient, i) => {
        newSet[patient.id] = { ...patient, sortIndex: i };
        return newSet;
      }, {});
      return update(state, {
        [clinicId]: { $set: { ...state[clinicId], patients: newPatientSet, patientCount: count, lastPatientFetchTime: moment.utc().valueOf() } },
      });
    }
    case types.FETCH_PATIENTS_FOR_CLINIC_FAILURE: {
      let { error } = action;
      if (error?.status === 403) {
        let {
          payload: { clinicId },
        } = action;
        return update(state, {
          [clinicId]: {
            $set: { ...state[clinicId], patients: {}, patientCount: 0 },
          },
        });
      }
      return state;
    }
    case types.FETCH_PATIENT_FROM_CLINIC_SUCCESS: {
      let { clinicId, patient } = action.payload;
      const existingSortIndex = state[clinicId]?.patients?.[patient.id]?.sortIndex;
      return update(state, {
        [clinicId]: { patients: { $set: {
          ...state[clinicId].patients,
          [patient.id]: { ...patient, sortIndex: existingSortIndex }
        } } }
      });
    }
    case types.FETCH_PATIENT_INVITES_SUCCESS: {
      const invites = _.get(action.payload, 'invites', []);
      const clinicId = _.get(action.payload, 'clinicId');
      const newClinics = _.cloneDeep(state);
      _.forEach(invites, (invite) => {
        _.set(
          newClinics,
          [clinicId, 'patientInvites', invite.key],
          invite
        );
      });
      return newClinics;
    }
    case types.ACCEPT_PATIENT_INVITATION_SUCCESS: {
      let inviteId = _.get(action.payload, 'inviteId');
      let clinicId = _.get(action.payload, 'clinicId');
      let newState = _.cloneDeep(state);
      delete newState[clinicId]?.patientInvites?.[inviteId];
      return newState;
    }
    case types.DELETE_PATIENT_INVITATION_SUCCESS: {
      let inviteId = _.get(action.payload, 'inviteId');
      let clinicId = _.get(action.payload, 'clinicId');
      let newState = _.cloneDeep(state);
      delete newState[clinicId]?.patientInvites?.[inviteId];
      return newState;
    }
    case types.CREATE_CLINIC_SUCCESS:
    case types.FETCH_CLINIC_SUCCESS: {
      let clinic = _.get(action.payload, 'clinic', {});
      return update(state, {
        [clinic.id]: { $set: { clinicians: {}, patients: {}, patientInvites: {}, ...clinic } },
      });
    }
    case types.FETCH_CLINICS_BY_IDS_SUCCESS: {
      const clinics = _.get(action.payload, 'clinics', {});
      return _.merge({}, state, clinics);
    }
    case types.UPDATE_CLINIC_SUCCESS: {
      let clinic = _.get(action.payload, 'clinic');
      let clinicId = _.get(action.payload, 'clinicId');
      return update(state, {
        [clinicId]: { $merge: clinic },
      });
    }
    case types.FETCH_CLINICIANS_FROM_CLINIC_SUCCESS: {
      const clinicians = _.get(action.payload, 'results.clinicians', []);
      const clinicId = _.get(action.payload, 'results.clinicId', '');
      const newClinics = _.cloneDeep(state);
      _.forEach(clinicians, (clinician) => {
        _.set(
          newClinics,
          [clinicId, 'clinicians', clinician.id || clinician.inviteId],
          clinician
        );
      });
      return newClinics;
    }
    case types.FETCH_CLINICIANS_FROM_CLINIC_FAILURE: {
      let { error } = action;
      if (error?.status === 403) {
        let {
          payload: { clinicId },
        } = action;
        const newClinics = _.cloneDeep(state);
        _.set(newClinics, [clinicId, 'clinicians'], {});
        return newClinics;
      }
      return state;
    }
    case types.UPDATE_CLINICIAN_SUCCESS: {
      let clinician = _.get(action.payload, 'clinician');
      let clinicId = _.get(action.payload, 'clinicId');
      return update(state, {
        [clinicId]: { clinicians: { [clinician.id]: { $set: clinician } } },
      });
    }
    case types.CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS:
    case types.UPDATE_CLINIC_PATIENT_SUCCESS: {
      const patient = _.get(action.payload, 'patient');
      const patientId = _.get(action.payload, 'patientId');
      const clinicId = _.get(action.payload, 'clinicId');
      let patientCount = state[clinicId].patientCount;

      // Retain existing sortIndex, or, in the case of a new custodial patient, set to -1 to show at top of
      // list for easy visibility of the newly created patient.
      const existingSortIndex = state[clinicId]?.patients?.[patientId]?.sortIndex || -1;

      if (action.type === types.CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS) patientCount++;
      return update(state, {
        [clinicId]: { patients: { [patientId]: { $set: { ...patient, sortIndex: existingSortIndex } } }, patientCount: { $set: patientCount } },
      });
    }
    case types.DELETE_CLINICIAN_FROM_CLINIC_SUCCESS: {
      let clinicId = _.get(action.payload, 'clinicId');
      let clinicianId = _.get(action.payload, 'clinicianId');
      let newState = _.cloneDeep(state);
      delete newState[clinicId]?.clinicians?.[clinicianId];
      return newState;
    }
    case types.DELETE_PATIENT_FROM_CLINIC_SUCCESS: {
      let clinicId = _.get(action.payload, 'clinicId');
      let patientId = _.get(action.payload, 'patientId');
      let newState = _.cloneDeep(state);
      delete newState[clinicId]?.patients?.[patientId];
      if (newState[clinicId]?.patientCount) newState[clinicId].patientCount--;
      return newState;
    }
    case types.SEND_CLINICIAN_INVITE_SUCCESS: {
      let clinician = _.get(action.payload, 'clinician');
      let clinicId = _.get(action.payload, 'clinicId');
      return update(state, {
        [clinicId]: {
          clinicians: { [clinician.inviteId]: { $set: clinician } },
        },
      });
    }
    case types.DELETE_CLINICIAN_INVITE_SUCCESS: {
      let clinicId = _.get(action.payload, 'clinicId');
      let inviteId = _.get(action.payload, 'inviteId');
      let newState = _.cloneDeep(state);
      delete newState[clinicId].clinicians[inviteId];
      return newState;
    }
    case types.GET_CLINICS_FOR_CLINICIAN_SUCCESS: {
      const clinics = _.get(action.payload, 'clinics');
      const newClinics = _.reduce(
        clinics,
        (newSet, clinic) => {
          newSet[clinic.clinic.id] = {
            ...clinic.clinic,
            clinicians: { [clinic.clinician.id]: clinic.clinician },
          };
          return newSet;
        },
        {}
      );
      return _.merge({}, state, newClinics);
    }
    case types.FETCH_CLINICS_FOR_PATIENT_SUCCESS: {
      const clinics = _.get(action.payload, 'clinics');
      const newClinics = _.reduce(
        clinics,
        (newSet, clinic) => {
          newSet[clinic.clinic.id] = {
            ...clinic.clinic,
            patients: { [clinic.patient.id]: clinic.patient },
          };
          return newSet;
        },
        {}
      );
      return _.merge({}, state, newClinics);
    }
    case types.UPDATE_PATIENT_PERMISSIONS_SUCCESS: {
      const {
        clinicId,
        patientId,
        permissions,
      } = action.payload;

      return update(state, {
        [clinicId]: {
          patients: { [patientId]: { $set: {
            ...state[clinicId].patients[patientId],
            permissions,
          } } },
        },
      });
    }
    case types.TRIGGER_INITIAL_CLINIC_MIGRATION_SUCCESS: {
      let clinicId = _.get(action.payload, 'clinicId');
      return update(state, {
        [clinicId]: { canMigrate: { $set: false } },
      });
    }
    case types.SEND_PATIENT_UPLOAD_REMINDER_SUCCESS: {
      const {
        clinicId,
        patientId,
        lastUploadReminderTime,
      } = action.payload;

      return update(state, {
        [clinicId]: {
          patients: { [patientId]: { $set: {
            ...state[clinicId].patients[patientId],
            lastUploadReminderTime,
          } } },
        },
      });
    }
    case types.SEND_PATIENT_DEXCOM_CONNECT_REQUEST_SUCCESS: {
      const {
        clinicId,
        patientId,
        lastRequestedDexcomConnectTime,
      } = action.payload;

      return update(state, {
        [clinicId]: {
          patients: { [patientId]: { $set: {
            ...state[clinicId].patients[patientId],
            lastRequestedDexcomConnectTime,
          } } },
        },
      });
    }
    case types.CREATE_CLINIC_PATIENT_TAG_SUCCESS:
    case types.UPDATE_CLINIC_PATIENT_TAG_SUCCESS:
    case types.DELETE_CLINIC_PATIENT_TAG_SUCCESS: {
      const {
        clinicId,
        patientTags,
      } = action.payload;

      return update(state, {
        [clinicId]: { patientTags: { $set: patientTags } },
      });
    }
    case types.FETCH_CLINIC_EHR_SETTINGS_SUCCESS: {
      const {
        clinicId,
        settings,
      } = action.payload;

      return update(state, {
        [clinicId]: { ehrSettings: { $set: settings } },
      });
    }
    case types.FETCH_CLINIC_MRN_SETTINGS_SUCCESS: {
      const {
        clinicId,
        settings,
      } = action.payload;

      return update(state, {
        [clinicId]: { mrnSettings: { $set: settings } },
      });
    }
    case types.LOGOUT_REQUEST:
      return initialState.clinics;
    default:
      return state;
  }
};

export const selectedClinicId = (state = initialState.selectedClinicId, action) => {
  switch(action.type) {
    case types.SELECT_CLINIC:
      return _.get(action.payload, 'clinicId', null);
    case types.LOGOUT_REQUEST:
      return null;
    default:
      return state;
  }
};

export const pendingSentClinicianInvites = (state = initialState.pendingSentClinicianInvites, action) => {
  switch (action.type) {
    case types.FETCH_CLINICIAN_INVITE_SUCCESS:
    case types.RESEND_CLINICIAN_INVITE_SUCCESS: {
      const { invite } = action.payload;
      const updateAction = state[invite.key] ? '$merge' : '$set';
      return update(state, {
        [invite.key]: { [updateAction]: invite },
      });
    }
    case types.DELETE_CLINICIAN_INVITE_SUCCESS:
      const { inviteId } = action.payload;
      return update(state, { $set: _.omit(state, inviteId) });
    case types.LOGOUT_REQUEST:
      return initialState.pendingSentClinicianInvites;
    default:
      return state;
  }
};

export const pendingReceivedClinicianInvites = (state = initialState.pendingReceivedClinicianInvites, action) => {
  switch(action.type) {
    case types.FETCH_CLINICIAN_INVITES_SUCCESS:
      return update(state, { $set: _.get(action.payload, 'invites', []) });
    case types.ACCEPT_CLINICIAN_INVITE_SUCCESS:
      return update(state, { $apply: (invite) => {
          return invite.filter( (i) => i.key !== _.get(action.payload, 'inviteId', null) );
        }
      });
    case types.DISMISS_CLINICIAN_INVITE_SUCCESS:
      return update(state, { $apply: (invite) => {
          return invite.filter( (i) => i.key !== _.get(action.payload, 'inviteId', null) );
        }
      });
    case types.LOGOUT_REQUEST:
      return [];
    default:
      return state;
  }
};

export const clinicFlowActive = (state = initialState.clinicFlowActive, action) => {
  switch(action.type) {
    case types.FETCH_CLINICIAN_INVITES_SUCCESS:
      return action.payload.invites.length > 0 || state;
    case types.GET_CLINICS_FOR_CLINICIAN_SUCCESS:
      return action.payload.clinics.length > 0 || state;
    case types.FETCH_USER_SUCCESS:
    case types.LOGIN_SUCCESS:
      return _.includes(action.payload?.user?.roles, 'clinician') || state;
    case types.LOGOUT_REQUEST:
      return initialState.clinicFlowActive;
    default:
      return state;
  }
};

export const keycloakConfig = (state = initialState.keycloakConfig, action) => {
  switch (action.type) {
    case types.FETCH_INFO_SUCCESS:
      if (!_.isMatch(state, action?.payload?.info?.auth)) {
        return _.get(action.payload, 'info.auth', {});
      }
    case types.KEYCLOAK_READY:
      let logoutUrl = _.get(action.payload, 'logoutUrl', '');
      return _.extend({}, state, { initialized: true, logoutUrl });
    case types.KEYCLOAK_AUTH_ERROR:
      let error = _.get(action.payload, 'error', {});
      let message = _.get(error, 'error', null);
      return _.extend({}, state, { error: message });
    default:
      return state;
  }
};

export const ssoEnabledDisplay = (state = initialState.ssoEnabledDisplay, action) => {
  switch (action.type) {
    case types.SET_SSO_ENABLED_DISPLAY:
      return action.payload.value;
    default:
      return state;
  }
};
