/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global afterEach */

import isTSA from 'tidepool-standard-action';

import * as sync from '../../../../app/redux/actions/sync';
import * as UserMessages from '../../../../app/redux/constants/usrMessages';

import { TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL, MMOLL_UNITS } from '../../../../app/core/constants';

describe('Actions', () => {

  describe('Synchronous Actions', () => {
    describe('showWelcomeMessage', () => {
      it('should be a TSA', () => {
        let action = sync.showWelcomeMessage();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SHOW_WELCOME_MESSAGE', () => {
        let action = sync.showWelcomeMessage();
        expect(action.type).to.equal('SHOW_WELCOME_MESSAGE');
      });
    });

    describe('hideWelcomeMessage', () => {
      it('should be a TSA', () => {
        let action = sync.hideWelcomeMessage();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal HIDE_WELCOME_MESSAGE', () => {
        let action = sync.hideWelcomeMessage();
        expect(action.type).to.equal('HIDE_WELCOME_MESSAGE');
      });
    });

    describe('showBanner', () => {
      it('should be a TSA', () => {
        let action = sync.showBanner();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SHOW_BANNER', () => {
        let action = sync.showBanner();
        expect(action.type).to.equal('SHOW_BANNER');
      });

      it('should set the payload `type` from argument', () => {
        let action = sync.showBanner('myType');
        expect(action.payload.type).to.equal('myType');
      });
    });

    describe('hideBanner', () => {
      it('should be a TSA', () => {
        let action = sync.hideBanner();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal HIDE_BANNER', () => {
        let action = sync.hideBanner();
        expect(action.type).to.equal('HIDE_BANNER');
      });

      it('should set the payload `type` from argument', () => {
        let action = sync.hideBanner('myType');
        expect(action.payload.type).to.equal('myType');
      });
    });

    describe('dismissBanner', () => {
      it('should be a TSA', () => {
        let action = sync.dismissBanner();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DISMISS_BANNER', () => {
        let action = sync.dismissBanner();
        expect(action.type).to.equal('DISMISS_BANNER');
      });

      it('should set the payload `type` from argument', () => {
        let action = sync.dismissBanner('myType');
        expect(action.payload.type).to.equal('myType');
      });
    });

    describe('acknowledgeNotification', () => {
      it('should be a TSA', () => {
        let action = sync.acknowledgeNotification();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACKNOWLEDGE_NOTIFICATION', () => {
        let note = 'foo';
        let action = sync.acknowledgeNotification(note);

        expect(action.payload.acknowledgedNotification).to.equal(note);
        expect(action.type).to.equal('ACKNOWLEDGE_NOTIFICATION');
      });
    });

    describe('closeMessageThread', () => {
      it('should be a TSA', () => {
        let action = sync.closeMessageThread();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CLOSE_MESSAGE_THREAD', () => {
        let action = { type: 'CLOSE_MESSAGE_THREAD' };

        expect(sync.closeMessageThread()).to.deep.equal(action);
      });
    });

    describe('addPatientNote', () => {
      const note = {
        groupid: 1234,
      };
      it('should be a TSA', () => {
        let action = sync.addPatientNote(note);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ADD_PATIENT_NOTE', () => {
        let action = {
          type: 'ADD_PATIENT_NOTE',
          payload: {
            note,
            patientId: note.groupid,
          },
        };

        expect(sync.addPatientNote(note)).to.deep.equal(action);
      });
    });

    describe('updatePatientNote', () => {
      const note = {
        groupid: 1234,
      };
      it('should be a TSA', () => {
        let action = sync.updatePatientNote(note);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_NOTE', () => {
        let action = {
          type: 'UPDATE_PATIENT_NOTE',
          payload: {
            note,
            patientId: note.groupid,
          },
        };

        expect(sync.updatePatientNote(note)).to.deep.equal(action);
      });
    });

    describe('clearPatientData', () => {
      const patientId = 'a1b2c3';
      it('should be a TSA', () => {
        let action = sync.clearPatientData(patientId);

        expect(isTSA(action)).to.be.true;
      });

      it('type should expect CLEAR_PATIENT_DATA', () => {
        let action = { type: 'CLEAR_PATIENT_DATA', payload: { patientId } };

        expect(sync.clearPatientData(patientId)).to.deep.equal(action);
      });
    });

    describe('clearPatientInView', () => {
      it('should be a TSA', () => {
        let action = sync.clearPatientInView();

        expect(isTSA(action)).to.be.true;
      });

      it('type should expect CLEAR_PATIENT_IN_VIEW', () => {
        let action = { type: 'CLEAR_PATIENT_IN_VIEW' };

        expect(sync.clearPatientInView()).to.deep.equal(action);
      });
    });

    describe('loginRequest', () => {
      it('should be a TSA', () => {
        let action = sync.loginRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal LOGIN_REQUEST', () => {
        let action = sync.loginRequest();
        expect(action.type).to.equal('LOGIN_REQUEST');
      });
    });

    describe('loginSuccess', () => {
      it('should be a TSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.loginSuccess(user);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal LOGIN_SUCCESS and payload should contain user', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.loginSuccess(user);

        expect(action.type).to.equal('LOGIN_SUCCESS');
        expect(action.payload.user).to.equal(user);
      });
    });

    describe('loginFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.loginFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal LOGIN_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.loginFailure(error);

        expect(action.type).to.equal('LOGIN_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('logoutRequest', () => {
      it('should be a TSA', () => {
        let action = sync.logoutRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal LOGOUT_REQUEST', () => {
        let action = sync.logoutRequest();
        expect(action.type).to.equal('LOGOUT_REQUEST');
      });
    });

    describe('logoutSuccess', () => {
      it('should be a TSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.logoutSuccess(user);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal LOGOUT_SUCCESS', () => {
        let action = sync.logoutSuccess();

        expect(action.type).to.equal('LOGOUT_SUCCESS');
      });
    });

    describe('signupRequest', () => {
      it('should be a TSA', () => {
        let action = sync.signupRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SIGNUP_REQUEST', () => {
        let action = sync.signupRequest();
        expect(action.type).to.equal('SIGNUP_REQUEST');
      });
    });

    describe('signupSuccess', () => {
      it('should be a TSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.signupSuccess(user);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SIGNUP_SUCCESS and payload should contain user', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.signupSuccess(user);

        expect(action.type).to.equal('SIGNUP_SUCCESS');
        expect(action.payload.user).to.equal(user);
      });
    });

    describe('signupFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.signupFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SIGNUP_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.signupFailure(error);

        expect(action.type).to.equal('SIGNUP_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('confirmPasswordResetRequest', () => {
      it('should be a TSA', () => {
        let action = sync.confirmPasswordResetRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_PASSWORD_RESET_REQUEST', () => {
        let action = { type: 'CONFIRM_PASSWORD_RESET_REQUEST' };

        expect(sync.confirmPasswordResetRequest()).to.deep.equal(action);
      });
    });

    describe('confirmPasswordResetSuccess', () => {
      it('should be a TSA', () => {
        let action = sync.confirmPasswordResetSuccess();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_PASSWORD_RESET_SUCCESS', () => {
        let action = { type: 'CONFIRM_PASSWORD_RESET_SUCCESS' };

        expect(sync.confirmPasswordResetSuccess()).to.deep.equal(action);
      });
    });

    describe('confirmPasswordResetFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.confirmPasswordResetFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_PASSWORD_RESET_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.confirmPasswordResetFailure(error);

        expect(action.type).to.equal('CONFIRM_PASSWORD_RESET_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('confirmSignupRequest', () => {
      it('should be a TSA', () => {
        let action = sync.confirmSignupRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_REQUEST', () => {
        let action = sync.confirmSignupRequest();
        expect(action.type).to.equal('CONFIRM_SIGNUP_REQUEST');
      });
    });

    describe('confirmSignupSuccess', () => {
      it('should be a TSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.confirmSignupSuccess(user);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_SUCCESS', () => {
        let action = sync.confirmSignupSuccess();

        expect(action.type).to.equal('CONFIRM_SIGNUP_SUCCESS');
      });
    });

    describe('confirmSignupFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.confirmSignupFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.confirmSignupFailure(error);

        expect(action.type).to.equal('CONFIRM_SIGNUP_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('resendEmailVerificationRequest', () => {
      it('should be a TSA', () => {
        let action = sync.resendEmailVerificationRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal RESEND_EMAIL_VERIFICATION_REQUEST', () => {
        let action = { type: 'RESEND_EMAIL_VERIFICATION_REQUEST' };

        expect(sync.resendEmailVerificationRequest()).to.deep.equal(action);
      });
    });

    describe('resendEmailVerificationSuccess', () => {
      it('should be a TSA', () => {
        let action = sync.resendEmailVerificationSuccess();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal RESEND_EMAIL_VERIFICATION_SUCCESS', () => {
        let action = sync.resendEmailVerificationSuccess();

        expect(action.type).to.equal('RESEND_EMAIL_VERIFICATION_SUCCESS');
        expect(action.payload).to.deep.equal({
          notification: {
            type: 'alert',
            message: UserMessages.EMAIL_SENT
          }
        });
      });
    });

    describe('resendEmailVerificationFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.resendEmailVerificationFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal RESEND_EMAIL_VERIFICATION_FAILURE', () => {
        let error = new Error(':(');
        let action = sync.resendEmailVerificationFailure(error);

        expect(action.type).to.equal('RESEND_EMAIL_VERIFICATION_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('acceptTermsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.acceptTermsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_TERMS_REQUEST', () => {
        let action = sync.acceptTermsRequest();
        expect(action.type).to.equal('ACCEPT_TERMS_REQUEST');
      });
    });

    describe('acceptTermsSuccess', () => {
      it('should be a TSA', () => {
        let acceptedDate = new Date();
        let userId = 647;
        let action = sync.acceptTermsSuccess(userId, acceptedDate);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_TERMS_SUCCESS', () => {
        let acceptedDate = new Date();
        let userId = 647;
        let action = sync.acceptTermsSuccess(userId, acceptedDate);

        expect(action.type).to.equal('ACCEPT_TERMS_SUCCESS');
        expect(action.payload.userId).to.equal(userId);
        expect(action.payload.acceptedDate).to.equal(acceptedDate);
      });
    });

    describe('acceptTermsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.acceptTermsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_TERMS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.acceptTermsFailure(error);

        expect(action.type).to.equal('ACCEPT_TERMS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('setupDataStorageRequest', () => {
      it('should be a TSA', () => {
        let action = sync.setupDataStorageRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SETUP_DATA_STORAGE_REQUEST', () => {
        let action = sync.setupDataStorageRequest();
        expect(action.type).to.equal('SETUP_DATA_STORAGE_REQUEST');
      });
    });

    describe('setupDataStorageSuccess', () => {
      it('should be a TSA', () => {
        let userId = 540;
        let patient = {
          id: 540
        };
        let action = sync.setupDataStorageSuccess(userId, patient);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SETUP_DATA_STORAGE_SUCCESS', () => {
        let userId = 540;
        let patient = {
          id: 540
        };
        let action = sync.setupDataStorageSuccess(userId, patient);

        expect(action.type).to.equal('SETUP_DATA_STORAGE_SUCCESS');
        expect(action.payload.userId).to.equal(userId);
        expect(action.payload.patient).to.equal(patient);
      });
    });

    describe('setupDataStorageFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.setupDataStorageFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SETUP_DATA_STORAGE_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.setupDataStorageFailure(error);

        expect(action.type).to.equal('SETUP_DATA_STORAGE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('removeMembershipInOtherCareTeamRequest', () => {
      it('should be a TSA', () => {
        let action = sync.removeMembershipInOtherCareTeamRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST', () => {
        let action = sync.removeMembershipInOtherCareTeamRequest();
        expect(action.type).to.equal('REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST');
      });
    });

    describe('removeMembershipInOtherCareTeamSuccess', () => {
      it('should be a TSA', () => {
        let patientId = 540;
        let action = sync.removeMembershipInOtherCareTeamSuccess(patientId);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS', () => {
        let patientId = 540;
        let action = sync.removeMembershipInOtherCareTeamSuccess(patientId);

        expect(action.type).to.equal('REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS');
        expect(action.payload.removedPatientId).to.equal(patientId);
      });
    });

    describe('removeMembershipInOtherCareTeamFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.removeMembershipInOtherCareTeamFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.removeMembershipInOtherCareTeamFailure(error);

        expect(action.type).to.equal('REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('removeMemberFromTargetCareTeamRequest', () => {
      it('should be a TSA', () => {
        let action = sync.removeMemberFromTargetCareTeamRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST', () => {
        let action = sync.removeMemberFromTargetCareTeamRequest();
        expect(action.type).to.equal('REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST');
      });
    });

    describe('removeMemberFromTargetCareTeamSuccess', () => {
      it('should be a TSA', () => {
        let memberId = 540;
        let action = sync.removeMemberFromTargetCareTeamSuccess(memberId);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS', () => {
        let memberId = 540;
        let action = sync.removeMemberFromTargetCareTeamSuccess(memberId);

        expect(action.type).to.equal('REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS');
        expect(action.payload.removedMemberId).to.equal(memberId);
      });
    });

    describe('removeMemberFromTargetCareTeamFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.removeMemberFromTargetCareTeamFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.removeMemberFromTargetCareTeamFailure(error);

        expect(action.type).to.equal('REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('requestPasswordResetRequest', () => {
      it('should be a TSA', () => {
        let action = sync.requestPasswordResetRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REQUEST_PASSWORD_RESET_REQUEST', () => {
        let action = { type: 'REQUEST_PASSWORD_RESET_REQUEST' };

        expect(sync.requestPasswordResetRequest()).to.deep.equal(action);
      });
    });

    describe('requestPasswordResetSuccess', () => {
      it('should be a TSA', () => {
        let action = sync.requestPasswordResetSuccess();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REQUEST_PASSWORD_RESET_SUCCESS', () => {
        let action = { type: 'REQUEST_PASSWORD_RESET_SUCCESS' };

        expect(sync.requestPasswordResetSuccess()).to.deep.equal(action);
      });
    });

    describe('requestPasswordResetFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.requestPasswordResetFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REQUEST_PASSWORD_RESET_FAILURE', () => {
        let error = new Error(':(');
        let action = sync.requestPasswordResetFailure(error);

        expect(action.type).to.deep.equal('REQUEST_PASSWORD_RESET_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('sendInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.sendInviteRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SEND_INVITE_REQUEST', () => {
        let action = sync.sendInviteRequest();
        expect(action.type).to.equal('SEND_INVITE_REQUEST');
      });
    });

    describe('sendInviteSuccess', () => {
      it('should be a TSA', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.sendInviteSuccess(invite);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SEND_INVITE_SUCCESS', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.sendInviteSuccess(invite);

        expect(action.type).to.equal('SEND_INVITE_SUCCESS');
        expect(action.payload.invite).to.equal(invite);
      });
    });

    describe('sendInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.sendInviteFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SEND_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.sendInviteFailure(error);

        expect(action.type).to.equal('SEND_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('cancelSentInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.cancelSentInviteRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CANCEL_SENT_INVITE_REQUEST', () => {
        let action = sync.cancelSentInviteRequest();
        expect(action.type).to.equal('CANCEL_SENT_INVITE_REQUEST');
      });
    });

    describe('cancelSentInviteSuccess', () => {
      it('should be a TSA', () => {
        let email = 'a@b.com';
        let action = sync.cancelSentInviteSuccess(email);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CANCEL_SENT_INVITE_SUCCESS', () => {
        let email = 'a@b.com';
        let action = sync.cancelSentInviteSuccess(email);

        expect(action.type).to.equal('CANCEL_SENT_INVITE_SUCCESS');
        expect(action.payload.removedEmail).to.equal(email);
      });
    });

    describe('cancelSentInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.cancelSentInviteFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CANCEL_SENT_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.cancelSentInviteFailure(error);

        expect(action.type).to.equal('CANCEL_SENT_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('acceptReceivedInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.acceptReceivedInviteRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_RECEIVED_INVITE_REQUEST', () => {
        let action = sync.acceptReceivedInviteRequest();
        expect(action.type).to.equal('ACCEPT_RECEIVED_INVITE_REQUEST');
      });
    });

    describe('acceptReceivedInviteSuccess', () => {
      it('should be a TSA', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.acceptReceivedInviteSuccess(invite);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_RECEIVED_INVITE_SUCCESS', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.acceptReceivedInviteSuccess(invite);

        expect(action.type).to.equal('ACCEPT_RECEIVED_INVITE_SUCCESS');
        expect(action.payload.acceptedReceivedInvite).to.equal(invite);
      });
    });

    describe('acceptReceivedInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.acceptReceivedInviteFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_RECEIVED_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.acceptReceivedInviteFailure(error);

        expect(action.type).to.equal('ACCEPT_RECEIVED_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('rejectReceivedInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.rejectReceivedInviteRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REJECT_RECEIVED_INVITE_REQUEST', () => {
        let action = sync.rejectReceivedInviteRequest();
        expect(action.type).to.equal('REJECT_RECEIVED_INVITE_REQUEST');
      });
    });

    describe('rejectReceivedInviteSuccess', () => {
      it('should be a TSA', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.rejectReceivedInviteSuccess(invite);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REJECT_RECEIVED_INVITE_SUCCESS', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.rejectReceivedInviteSuccess(invite);

        expect(action.type).to.equal('REJECT_RECEIVED_INVITE_SUCCESS');
        expect(action.payload.rejectedReceivedInvite).to.equal(invite);
      });
    });

    describe('rejectReceivedInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.rejectReceivedInviteFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal REJECT_RECEIVED_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.rejectReceivedInviteFailure(error);

        expect(action.type).to.equal('REJECT_RECEIVED_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('setMemberPermissionsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.setMemberPermissionsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SET_MEMBER_PERMISSIONS_REQUEST', () => {
        let action = sync.setMemberPermissionsRequest();
        expect(action.type).to.equal('SET_MEMBER_PERMISSIONS_REQUEST');
      });
    });

    describe('setMemberPermissionsSuccess', () => {
      it('should be a TSA', () => {
        let memberId = 444;
        let permissions = {
          view: true,
          clear: true
        };
        let action = sync.setMemberPermissionsSuccess(memberId, permissions);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SET_MEMBER_PERMISSIONS_SUCCESS', () => {
        let memberId = 444;
        let permissions = {
          view: true,
          clear: true
        };
        let action = sync.setMemberPermissionsSuccess(memberId, permissions);

        expect(action.type).to.equal('SET_MEMBER_PERMISSIONS_SUCCESS');
        expect(action.payload.memberId).to.equal(memberId);
        expect(action.payload.permissions).to.equal(permissions);
      });
    });

    describe('setMemberPermissionsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.setMemberPermissionsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SET_MEMBER_PERMISSIONS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.setMemberPermissionsFailure(error);

        expect(action.type).to.equal('SET_MEMBER_PERMISSIONS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updatePatientRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updatePatientRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_REQUEST', () => {
        let action = sync.updatePatientRequest();
        expect(action.type).to.equal('UPDATE_PATIENT_REQUEST');
      });
    });

    describe('updatePatientSuccess', () => {
      it('should be a TSA', () => {
        let patient = {
          name: 'Frank'
        };
        let action = sync.updatePatientSuccess(patient);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_SUCCESS', () => {
        let patient = {
          name: 'Frank'
        };
        let action = sync.updatePatientSuccess(patient);

        expect(action.type).to.equal('UPDATE_PATIENT_SUCCESS');
        expect(action.payload.updatedPatient).to.equal(patient);
      });
    });

    describe('updatePatientFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.updatePatientFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.updatePatientFailure(error);

        expect(action.type).to.equal('UPDATE_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updatePreferencesRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updatePreferencesRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PREFERENCES_REQUEST', () => {
        let action = sync.updatePreferencesRequest();
        expect(action.type).to.equal('UPDATE_PREFERENCES_REQUEST');
      });
    });

    describe('updatePreferencesSuccess', () => {
      it('should be a TSA', () => {
        let preference = {
          display: 'all'
        };
        let action = sync.updatePreferencesSuccess(preference);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PREFERENCES_SUCCESS', () => {
        let preference = {
          display: 'all'
        };
        let action = sync.updatePreferencesSuccess(preference);

        expect(action.type).to.equal('UPDATE_PREFERENCES_SUCCESS');
        expect(action.payload.updatedPreferences).to.equal(preference);
      });
    });

    describe('updatePreferencesFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.updatePreferencesFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PREFERENCES_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.updatePreferencesFailure(error);

        expect(action.type).to.equal('UPDATE_PREFERENCES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updateSettingsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updateSettingsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_SETTINGS_REQUEST', () => {
        let action = sync.updateSettingsRequest();
        expect(action.type).to.equal('UPDATE_SETTINGS_REQUEST');
      });
    });

    describe('updateSettingsSuccess', () => {
      it('should be a TSA', () => {
        let settings = {
          siteChangeSource: 'cannulaPrime'
        };
        let action = sync.updateSettingsSuccess(settings);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_SETTINGS_SUCCESS', () => {
        let settings = {
          siteChangeSource: 'cannulaPrime'
        };
        let action = sync.updateSettingsSuccess(1234, settings);

        expect(action.type).to.equal('UPDATE_SETTINGS_SUCCESS');
        expect(action.payload.updatedSettings).to.equal(settings);
      });
    });

    describe('updateSettingsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.updateSettingsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_SETTINGS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.updateSettingsFailure(error);

        expect(action.type).to.equal('UPDATE_SETTINGS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updatePatientBgUnitsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updatePatientBgUnitsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_BG_UNITS_REQUEST', () => {
        let action = sync.updatePatientBgUnitsRequest();
        expect(action.type).to.equal('UPDATE_PATIENT_BG_UNITS_REQUEST');
      });
    });

    describe('updatePatientBgUnitsSuccess', () => {
      it('should be a TSA', () => {
        let settings = { units: { bg: MMOLL_UNITS } };
        let action = sync.updatePatientBgUnitsSuccess(settings);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_BG_UNITS_SUCCESS', () => {
        let settings = { units: { bg: MMOLL_UNITS } };
        let action = sync.updatePatientBgUnitsSuccess(1234, settings);

        expect(action.type).to.equal('UPDATE_PATIENT_BG_UNITS_SUCCESS');
        expect(action.payload.updatedSettings).to.deep.equal(settings);
      });
    });

    describe('updatePatientBgUnitsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.updatePatientBgUnitsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_BG_UNITS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.updatePatientBgUnitsFailure(error);

        expect(action.type).to.equal('UPDATE_PATIENT_BG_UNITS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updateUserRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updateUserRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_USER_REQUEST', () => {
        let action = sync.updateUserRequest();
        expect(action.type).to.equal('UPDATE_USER_REQUEST');
      });
    });

    describe('updateUserSuccess', () => {
      it('should be a TSA', () => {
        let userId = 500;
        let user = {
          name: 'Frank'
        };
        let action = sync.updateUserSuccess(userId, user);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_USER_SUCCESS', () => {
        let userId = 500;
        let user = {
          name: 'Frank'
        };
        let action = sync.updateUserSuccess(userId, user);

        expect(action.type).to.equal('UPDATE_USER_SUCCESS');
        expect(action.payload.userId).to.equal(userId);
        expect(action.payload.updatedUser).to.equal(user);
      });
    });

    describe('updateUserFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.updateUserFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_USER_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.updateUserFailure(error);

        expect(action.type).to.equal('UPDATE_USER_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('logErrorRequest', () => {
      it('should be a TSA', () => {
        let action = sync.logErrorRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal LOG_ERROR_REQUEST', () => {
        let action = sync.logErrorRequest();
        expect(action.type).to.equal('LOG_ERROR_REQUEST');
      });
    });

    describe('logErrorSuccess', () => {
      it('should be a TSA', () => {
        let action = sync.logErrorSuccess();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal LOG_ERROR_SUCCESS', () => {
        let action = sync.logErrorSuccess();

        expect(action.type).to.equal('LOG_ERROR_SUCCESS');
      });
    });

    describe('fetchUserRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchUserRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_USER_REQUEST', () => {
        let action = sync.fetchUserRequest();
        expect(action.type).to.equal('FETCH_USER_REQUEST');
      });
    });

    describe('fetchUserSuccess', () => {
      it('should be a TSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.fetchUserSuccess(user);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_USER_SUCCESS', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.fetchUserSuccess(user);

        expect(action.type).to.equal('FETCH_USER_SUCCESS');
        expect(action.payload.user).to.equal(user);
      });
    });

    describe('fetchUserFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchUserFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_USER_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchUserFailure(error);

        expect(action.type).to.equal('FETCH_USER_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPendingSentInvitesRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPendingSentInvitesRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_SENT_INVITES_REQUEST', () => {
        let action = sync.fetchPendingSentInvitesRequest();
        expect(action.type).to.equal('FETCH_PENDING_SENT_INVITES_REQUEST');
      });
    });

    describe('fetchPendingSentInvitesSuccess', () => {
      it('should be a TSA', () => {
        let pendingSentInvites = [1, 2, 27];
        let action = sync.fetchPendingSentInvitesSuccess(pendingSentInvites);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_SENT_INVITES_SUCCESS', () => {
        let pendingSentInvites = [1, 7, 27, 566];
        let action = sync.fetchPendingSentInvitesSuccess(pendingSentInvites);

        expect(action.type).to.equal('FETCH_PENDING_SENT_INVITES_SUCCESS');
        expect(action.payload.pendingSentInvites).to.equal(pendingSentInvites);
      });
    });

    describe('fetchPendingSentInvitesFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchPendingSentInvitesFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_SENT_INVITES_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchPendingSentInvitesFailure(error);

        expect(action.type).to.equal('FETCH_PENDING_SENT_INVITES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPendingReceivedInvitesRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPendingReceivedInvitesRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_RECEIVED_INVITES_REQUEST', () => {
        let action = sync.fetchPendingReceivedInvitesRequest();
        expect(action.type).to.equal('FETCH_PENDING_RECEIVED_INVITES_REQUEST');
      });
    });

    describe('fetchPendingReceivedInvitesSuccess', () => {
      it('should be a TSA', () => {
        let pendingReceivedInvites = [1, 2, 27];
        let action = sync.fetchPendingReceivedInvitesSuccess(pendingReceivedInvites);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_RECEIVED_INVITES_SUCCESS', () => {
        let pendingReceivedInvites = [1, 7, 27, 566];
        let action = sync.fetchPendingReceivedInvitesSuccess(pendingReceivedInvites);

        expect(action.type).to.equal('FETCH_PENDING_RECEIVED_INVITES_SUCCESS');
        expect(action.payload.pendingReceivedInvites).to.equal(pendingReceivedInvites);
      });
    });

    describe('fetchPendingReceivedInvitesFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchPendingReceivedInvitesFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_RECEIVED_INVITES_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchPendingReceivedInvitesFailure(error);

        expect(action.type).to.equal('FETCH_PENDING_RECEIVED_INVITES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPatientRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_REQUEST', () => {
        let action = sync.fetchPatientRequest();
        expect(action.type).to.equal('FETCH_PATIENT_REQUEST');
      });
    });

    describe('fetchPatientSuccess', () => {
      it('should be a TSA', () => {
        let patient = {
          name: 'Bruce Lee',
          age: 24
        };
        let action = sync.fetchPatientSuccess(patient);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_SUCCESS', () => {
        let patient = {
          name: 'Jackie Chan',
          age: 24
        };
        let action = sync.fetchPatientSuccess(patient);

        expect(action.type).to.equal('FETCH_PATIENT_SUCCESS');
        expect(action.payload.patient).to.equal(patient);
      });
    });

    describe('fetchPatientFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchPatientFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchPatientFailure(error);

        expect(action.type).to.equal('FETCH_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPatientsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_REQUEST', () => {
        let action = sync.fetchPatientsRequest();
        expect(action.type).to.equal('FETCH_PATIENTS_REQUEST');
      });
    });

    describe('fetchPatientsSuccess', () => {
      it('should be a TSA', () => {
        let patients = [{
          id: 20,
          name: 'Bruce Lee',
          age: 24
        }];
        let action = sync.fetchPatientsSuccess(patients);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_SUCCESS', () => {
        let patients = [{
          id: 20,
          name: 'Jackie Chan',
          age: 24
        }];
        let action = sync.fetchPatientsSuccess(patients);

        expect(action.type).to.equal('FETCH_PATIENTS_SUCCESS');
        expect(action.payload.patients).to.equal(patients);
      });
    });

    describe('fetchPatientsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchPatientsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchPatientsFailure(error);

        expect(action.type).to.equal('FETCH_PATIENTS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientDataRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPatientDataRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_REQUEST', () => {
        let action = sync.fetchPatientDataRequest();
        expect(action.type).to.equal('FETCH_PATIENT_DATA_REQUEST');
      });
    });

    describe('fetchPatientDataSuccess', () => {
      it('should be a TSA', () => {
        let patientData = [
          {
            id: 24,
            value: 500
          },
          {
            id: 4567,
            value: 300
          }
        ];
        let action = sync.fetchPatientDataSuccess(patientData);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_SUCCESS', () => {
        let patientId = 400;
        let patientData = [
          {
            id: 24,
            value: 500
          },
          {
            id: 4567,
            value: 400
          }
        ];
        let action = sync.fetchPatientDataSuccess(patientId, patientData);

        expect(action.type).to.equal('FETCH_PATIENT_DATA_SUCCESS');
        expect(action.payload.patientData).to.equal(patientData);
        expect(action.payload.patientId).to.equal(patientId);
      });
    });

    describe('fetchPatientDataFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchPatientDataFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchPatientDataFailure(error);

        expect(action.type).to.equal('FETCH_PATIENT_DATA_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchSettingsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchSettingsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_SETTINGS_REQUEST', () => {
        let action = sync.fetchSettingsRequest();
        expect(action.type).to.equal('FETCH_SETTINGS_REQUEST');
      });
    });

    describe('fetchSettingsSuccess', () => {
      it('should be a TSA', () => {
        let settings = {
          siteChangeSource: 'cannulaPrime'
        };
        let action = sync.fetchSettingsSuccess(settings);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_SETTINGS_SUCCESS', () => {
        let settings = {
          siteChangeSource: 'cannulaPrime'
        };
        let action = sync.fetchSettingsSuccess(settings);

        expect(action.type).to.equal('FETCH_SETTINGS_SUCCESS');
        expect(action.payload.settings).to.equal(settings);
      });
    });

    describe('fetchSettingsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchSettingsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_SETTINGS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchSettingsFailure(error);

        expect(action.type).to.equal('FETCH_SETTINGS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchMessageThreadRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchMessageThreadRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_MESSAGE_THREAD_REQUEST', () => {
        let action = sync.fetchMessageThreadRequest();
        expect(action.type).to.equal('FETCH_MESSAGE_THREAD_REQUEST');
      });
    });

    describe('fetchMessageThreadSuccess', () => {
      it('should be a TSA', () => {
        let messageThread = [
          {
            id: 47,
            message: 'Good Morning'
          },
          {
            id: 7447,
            message: 'I know Kung Fu!'
          }
        ];
        let action = sync.fetchMessageThreadSuccess(messageThread);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_MESSAGE_THREAD_SUCCESS', () => {
        let messageThread = [
          {
            id: 10106,
            message: 'Hello, this is quite fun!'
          },
          {
            id: 7,
            message: 'And they all lived happily ever after.'
          }
        ];
        let action = sync.fetchMessageThreadSuccess(messageThread);

        expect(action.type).to.equal('FETCH_MESSAGE_THREAD_SUCCESS');
        expect(action.payload.messageThread).to.equal(messageThread);
      });
    });

    describe('fetchMessageThreadFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchMessageThreadFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_MESSAGE_THREAD_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchMessageThreadFailure(error);

        expect(action.type).to.equal('FETCH_MESSAGE_THREAD_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchDataDonationAccountsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchDataDonationAccountsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DATA_DONATION_ACCOUNTS_REQUEST', () => {
        let action = sync.fetchDataDonationAccountsRequest();
        expect(action.type).to.equal('FETCH_DATA_DONATION_ACCOUNTS_REQUEST');
      });
    });

    describe('fetchDataDonationAccountsSuccess', () => {
      it('should be a TSA', () => {
        let dataDonationAccounts = [
          { email: TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL },
          { email: 'bigdata+NSF@tidepool.org' },
        ];

        let action = sync.fetchDataDonationAccountsSuccess(dataDonationAccounts);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DATA_DONATION_ACCOUNTS_SUCCESS', () => {
        let dataDonationAccounts = [
          { email: TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL },
          { email: 'bigdata+NSF@tidepool.org' },
        ];

        let action = sync.fetchDataDonationAccountsSuccess(dataDonationAccounts);

        expect(action.type).to.equal('FETCH_DATA_DONATION_ACCOUNTS_SUCCESS');
        expect(action.payload.accounts).to.equal(dataDonationAccounts);
      });
    });

    describe('fetchDataDonationAccountsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchDataDonationAccountsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DATA_DONATION_ACCOUNTS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchDataDonationAccountsFailure(error);

        expect(action.type).to.equal('FETCH_DATA_DONATION_ACCOUNTS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updateDataDonationAccountsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updateDataDonationAccountsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_DATA_DONATION_ACCOUNTS_REQUEST', () => {
        let action = sync.updateDataDonationAccountsRequest();
        expect(action.type).to.equal('UPDATE_DATA_DONATION_ACCOUNTS_REQUEST');
      });
    });

    describe('updateDataDonationAccountsSuccess', () => {
      it('should be a TSA', () => {
        let dataDonationAccounts = {
          addAccounts: [
            { email: 'bigdata+YYY@tidepool.org' },
          ],
          removeAccounts: [
            { removedEmail: 'bigdata+NSF@tidepool.org' },
          ],
        };

        let action = sync.updateDataDonationAccountsSuccess(dataDonationAccounts);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS', () => {
        let dataDonationAccounts = {
          addAccounts: [
            { email: 'bigdata+YYY@tidepool.org' },
          ],
          removeAccounts: [
            { removedEmail: 'bigdata+NSF@tidepool.org' },
          ],
        };

        let action = sync.updateDataDonationAccountsSuccess(dataDonationAccounts);

        expect(action.type).to.equal('UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS');
        expect(action.payload.accounts).to.equal(dataDonationAccounts);
      });
    });

    describe('updateDataDonationAccountsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.updateDataDonationAccountsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_DATA_DONATION_ACCOUNTS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.updateDataDonationAccountsFailure(error);

        expect(action.type).to.equal('UPDATE_DATA_DONATION_ACCOUNTS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchDataSourcesRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchDataSourcesRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DATA_SOURCES_REQUEST', () => {
        let action = sync.fetchDataSourcesRequest();
        expect(action.type).to.equal('FETCH_DATA_SOURCES_REQUEST');
      });
    });

    describe('fetchDataSourcesSuccess', () => {
      it('should be a TSA', () => {
        let dataSources = [
          { id: 'strava', url: 'blah' },
          { name: 'fitbit', url: 'blah' },
        ];

        let action = sync.fetchDataSourcesSuccess(dataSources);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DATA_SOURCES_SUCCESS', () => {
        let dataSources = [
          { id: 'strava', url: 'blah' },
          { name: 'fitbit', url: 'blah' },
        ];

        let action = sync.fetchDataSourcesSuccess(dataSources);

        expect(action.type).to.equal('FETCH_DATA_SOURCES_SUCCESS');
        expect(action.payload.dataSources).to.equal(dataSources);
      });
    });

    describe('fetchDataSourcesFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchDataSourcesFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DATA_SOURCES_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchDataSourcesFailure(error);

        expect(action.type).to.equal('FETCH_DATA_SOURCES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchServerTimeRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchServerTimeRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_SERVER_TIME_REQUEST', () => {
        let action = sync.fetchServerTimeRequest();
        expect(action.type).to.equal('FETCH_SERVER_TIME_REQUEST');
      });
    });

    describe('fetchServerTimeSuccess', () => {
      it('should be a TSA', () => {
        let serverTime = '2018-01-01T00:00:00.000Z';
        let action = sync.fetchServerTimeSuccess(serverTime);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_SERVER_TIME_SUCCESS', () => {
        let serverTime = '2018-01-01T00:00:00.000Z';
        let action = sync.fetchServerTimeSuccess(serverTime);

        expect(action.type).to.equal('FETCH_SERVER_TIME_SUCCESS');
        expect(action.payload.serverTime).to.equal(serverTime);
      });
    });

    describe('fetchServerTimeFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchServerTimeFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_SERVER_TIME_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchServerTimeFailure(error);

        expect(action.type).to.equal('FETCH_SERVER_TIME_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('connectDataSourceRequest', () => {
      it('should be a TSA', () => {
        let action = sync.connectDataSourceRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONNECT_DATA_SOURCE_REQUEST', () => {
        let action = sync.connectDataSourceRequest();
        expect(action.type).to.equal('CONNECT_DATA_SOURCE_REQUEST');
      });
    });

    describe('connectDataSourceSuccess', () => {
      it('should be a TSA', () => {
        let action = sync.connectDataSourceSuccess('dataSources', 'stuff');
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONNECT_DATA_SOURCE_SUCCESS', () => {
        let source = { id: 'dataSources', url: 'stuff' };
        let action = sync.connectDataSourceSuccess(source.id, source.url);
        expect(action.type).to.equal('CONNECT_DATA_SOURCE_SUCCESS');
        expect(action.payload.authorizedDataSource.id).to.equal(source.id);
        expect(action.payload.authorizedDataSource.url).to.equal(source.url);
      });
    });

    describe('connectDataSourceFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('failed :(');
        let action = sync.connectDataSourceFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CONNECT_DATA_SOURCE_FAILURE and error should equal passed error', () => {
        let error = new Error('opps :(');
        let action = sync.connectDataSourceFailure(error);

        expect(action.type).to.equal('CONNECT_DATA_SOURCE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('disconnectDataSourceRequest', () => {
      it('should be a TSA', () => {
        let action = sync.disconnectDataSourceRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DISCONNECT_DATA_SOURCE_REQUEST', () => {
        let action = sync.disconnectDataSourceRequest();
        expect(action.type).to.equal('DISCONNECT_DATA_SOURCE_REQUEST');
      });
    });

    describe('disconnectDataSourceSuccess', () => {
      it('should be a TSA', () => {
        let action = sync.disconnectDataSourceSuccess();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DISCONNECT_DATA_SOURCE_SUCCESS', () => {
        let action = sync.disconnectDataSourceSuccess();
        expect(action.type).to.equal('DISCONNECT_DATA_SOURCE_SUCCESS');
        expect(action.payload).to.be.empty;
      });
    });

    describe('disconnectDataSourceFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('disconnecting failed :(');
        let action = sync.disconnectDataSourceFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DISCONNECT_DATA_SOURCE_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.disconnectDataSourceFailure(error);
        expect(action.type).to.equal('DISCONNECT_DATA_SOURCE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });
  });
});
