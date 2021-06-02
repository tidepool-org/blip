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

    describe('fetchAssociatedAccountsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchAssociatedAccountsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_ASSOCIATED_ACCOUNTS_REQUEST', () => {
        let action = sync.fetchAssociatedAccountsRequest();
        expect(action.type).to.equal('FETCH_ASSOCIATED_ACCOUNTS_REQUEST');
      });
    });

    describe('fetchAssociatedAccountsSuccess', () => {
      it('should be a TSA', () => {
        let accounts = {
          patients: [{
            id: 20,
            name: 'Bruce Lee',
            age: 24
          }],
          dataDonationAccounts: [],
          careTeam: [],
        };
        let action = sync.fetchAssociatedAccountsSuccess(accounts);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_ASSOCIATED_ACCOUNTS_SUCCESS', () => {
        let accounts = {
          patients: [{
            id: 20,
            name: 'Bruce Lee',
            age: 24
          }],
          dataDonationAccounts: [],
          careTeam: [],
        };
        let action = sync.fetchAssociatedAccountsSuccess(accounts);

        expect(action.type).to.equal('FETCH_ASSOCIATED_ACCOUNTS_SUCCESS');
        expect(action.payload.patients).to.equal(accounts.patients);
      });
    });

    describe('fetchAssociatedAccountsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchAssociatedAccountsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_ASSOCIATED_ACCOUNTS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchAssociatedAccountsFailure(error);

        expect(action.type).to.equal('FETCH_ASSOCIATED_ACCOUNTS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientDataRequest', () => {
      it('should be a TSA', () => {
        let patientId = 400;
        let action = sync.fetchPatientDataRequest(patientId);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_REQUEST', () => {
        let patientId = 400;
        let action = sync.fetchPatientDataRequest(patientId);
        expect(action.type).to.equal('FETCH_PATIENT_DATA_REQUEST');
        expect(action.payload.patientId).to.equal(patientId);
      });
    });

    describe('fetchPatientDataSuccess', () => {
      it('should be a TSA', () => {
        let patientId = 400;
        let action = sync.fetchPatientDataSuccess(patientId);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_SUCCESS', () => {
        let patientId = 400;
        let action = sync.fetchPatientDataSuccess(patientId);
        expect(action.type).to.equal('FETCH_PATIENT_DATA_SUCCESS');
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

    describe('fetchPrescriptionsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPrescriptionsRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PRESCRIPTIONS_REQUEST', () => {
        let action = sync.fetchPrescriptionsRequest();
        expect(action.type).to.equal('FETCH_PRESCRIPTIONS_REQUEST');
      });
    });

    describe('fetchPrescriptionsSuccess', () => {
      it('should be a TSA', () => {
        let prescriptions = [
          { id: 'one' }
        ];
        let action = sync.fetchPrescriptionsSuccess(prescriptions);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PRESCRIPTIONS_SUCCESS', () => {
        let prescriptions = [
          { id: 'one' }
        ];
        let action = sync.fetchPrescriptionsSuccess(prescriptions);

        expect(action.type).to.equal('FETCH_PRESCRIPTIONS_SUCCESS');
        expect(action.payload.prescriptions).to.equal(prescriptions);
      });
    });

    describe('fetchPrescriptionsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchPrescriptionsFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PRESCRIPTIONS_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchPrescriptionsFailure(error);

        expect(action.type).to.equal('FETCH_PRESCRIPTIONS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('createPrescriptionRequest', () => {
      it('should be a TSA', () => {
        let action = sync.createPrescriptionRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_PRESCRIPTION_REQUEST', () => {
        let action = sync.createPrescriptionRequest();
        expect(action.type).to.equal('CREATE_PRESCRIPTION_REQUEST');
      });
    });

    describe('createPrescriptionSuccess', () => {
      it('should be a TSA', () => {
        let prescription = { id: 'one' };
        let action = sync.createPrescriptionSuccess(prescription);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_PRESCRIPTION_SUCCESS', () => {
        let prescription = { id: 'one' };
        let action = sync.createPrescriptionSuccess(prescription);

        expect(action.type).to.equal('CREATE_PRESCRIPTION_SUCCESS');
        expect(action.payload.prescription).to.equal(prescription);
      });
    });

    describe('createPrescriptionFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.createPrescriptionFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_PRESCRIPTION_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.createPrescriptionFailure(error);

        expect(action.type).to.equal('CREATE_PRESCRIPTION_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('createPrescriptionRevisionRequest', () => {
      it('should be a TSA', () => {
        let action = sync.createPrescriptionRevisionRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_PRESCRIPTION_REVISION_REQUEST', () => {
        let action = sync.createPrescriptionRevisionRequest();
        expect(action.type).to.equal('CREATE_PRESCRIPTION_REVISION_REQUEST');
      });
    });

    describe('createPrescriptionRevisionSuccess', () => {
      it('should be a TSA', () => {
        let prescription = { id: 'one' };
        let action = sync.createPrescriptionRevisionSuccess(prescription);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_PRESCRIPTION_REVISION_SUCCESS', () => {
        let prescription = { id: 'one' };
        let action = sync.createPrescriptionRevisionSuccess(prescription);

        expect(action.type).to.equal('CREATE_PRESCRIPTION_REVISION_SUCCESS');
        expect(action.payload.prescription).to.equal(prescription);
      });
    });

    describe('createPrescriptionRevisionFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.createPrescriptionRevisionFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_PRESCRIPTION_REVISION_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.createPrescriptionRevisionFailure(error);

        expect(action.type).to.equal('CREATE_PRESCRIPTION_REVISION_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('deletePrescriptionRequest', () => {
      it('should be a TSA', () => {
        let action = sync.deletePrescriptionRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_PRESCRIPTION_REQUEST', () => {
        let action = sync.deletePrescriptionRequest();
        expect(action.type).to.equal('DELETE_PRESCRIPTION_REQUEST');
      });
    });

    describe('deletePrescriptionSuccess', () => {
      it('should be a TSA', () => {
        let prescriptionId = 'one';
        let action = sync.deletePrescriptionSuccess(prescriptionId);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_PRESCRIPTION_SUCCESS', () => {
        let prescriptionId = 'one';
        let action = sync.deletePrescriptionSuccess(prescriptionId);

        expect(action.type).to.equal('DELETE_PRESCRIPTION_SUCCESS');
        expect(action.payload.prescriptionId).to.equal(prescriptionId);
      });
    });

    describe('deletePrescriptionFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.deletePrescriptionFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_PRESCRIPTION_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.deletePrescriptionFailure(error);

        expect(action.type).to.equal('DELETE_PRESCRIPTION_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchDevicesRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchDevicesRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DEVICES_REQUEST', () => {
        let action = sync.fetchDevicesRequest();
        expect(action.type).to.equal('FETCH_DEVICES_REQUEST');
      });
    });

    describe('fetchDevicesSuccess', () => {
      it('should be a TSA', () => {
        let devices = [
          { id: 'one' }
        ];
        let action = sync.fetchDevicesSuccess(devices);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DEVICES_SUCCESS', () => {
        let devices = [
          { id: 'one' }
        ];
        let action = sync.fetchDevicesSuccess(devices);

        expect(action.type).to.equal('FETCH_DEVICES_SUCCESS');
        expect(action.payload.devices).to.equal(devices);
      });
    });

    describe('fetchDevicesFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.fetchDevicesFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_DEVICES_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.fetchDevicesFailure(error);

        expect(action.type).to.equal('FETCH_DEVICES_FAILURE');
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

    describe('createMessageThreadRequest', () => {
      it('should be a TSA', () => {
        let action = sync.createMessageThreadRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_MESSAGE_THREAD_REQUEST', () => {
        let action = sync.createMessageThreadRequest();
        expect(action.type).to.equal('CREATE_MESSAGE_THREAD_REQUEST');
      });
    });

    describe('createMessageThreadSuccess', () => {
      it('should be a TSA', () => {
        let message = {
          id: 47,
          message: 'Good Morning'
        };
        let action = sync.createMessageThreadSuccess(message);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_MESSAGE_THREAD_SUCCESS', () => {
        let message = {
          id: 47,
          message: 'Good Morning'
        };

        let action = sync.createMessageThreadSuccess(message);

        expect(action.type).to.equal('CREATE_MESSAGE_THREAD_SUCCESS');
        expect(action.payload.message).to.equal(message);
      });
    });

    describe('createMessageThreadFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.createMessageThreadFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_MESSAGE_THREAD_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.createMessageThreadFailure(error);

        expect(action.type).to.equal('CREATE_MESSAGE_THREAD_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('editMessageThreadRequest', () => {
      it('should be a TSA', () => {
        let action = sync.editMessageThreadRequest();

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal EDIT_MESSAGE_THREAD_REQUEST', () => {
        let action = sync.editMessageThreadRequest();
        expect(action.type).to.equal('EDIT_MESSAGE_THREAD_REQUEST');
      });
    });

    describe('editMessageThreadSuccess', () => {
      it('should be a TSA', () => {
        let message = {
          id: 47,
          message: 'Good Morning (edited)'
        };
        let action = sync.editMessageThreadSuccess(message);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal EDIT_MESSAGE_THREAD_SUCCESS', () => {
        let message = {
          id: 47,
          message: 'Good Morning (edited)'
        };
        let action = sync.editMessageThreadSuccess(message);

        expect(action.type).to.equal('EDIT_MESSAGE_THREAD_SUCCESS');
        expect(action.payload.message).to.equal(message);
      });
    });

    describe('editMessageThreadFailure', () => {
      it('should be a TSA', () => {
        let error = new Error(':(');
        let action = sync.editMessageThreadFailure(error);

        expect(isTSA(action)).to.be.true;
      });

      it('type should equal EDIT_MESSAGE_THREAD_FAILURE and error should equal passed error', () => {
        let error = new Error(':(');
        let action = sync.editMessageThreadFailure(error);

        expect(action.type).to.equal('EDIT_MESSAGE_THREAD_FAILURE');
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
        expect(action.payload.dataDonationAccounts).to.equal(dataDonationAccounts);
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

    describe('getClinicsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.getClinicsRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal GET_CLINICS_REQUEST', () => {
        let action = sync.getClinicsRequest();
        expect(action.type).to.equal('GET_CLINICS_REQUEST');
      });
    });

    describe('getClinicsSuccess', () => {
      let clinics = [
        {id: 'clinicId', name: 'Clinic Name'},
        {id: 'clinicId2', name: 'Clinic Name'},
      ];
      let options = {clinicianId: 'clinicianId'};
      it('should be a TSA', () => {
        let action = sync.getClinicsSuccess(clinics, options);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal GET_CLINICS_SUCCESS', () => {
        let action = sync.getClinicsSuccess(clinics, options);
        expect(action.type).to.equal('GET_CLINICS_SUCCESS');
        expect(action.payload.clinics).to.equal(clinics);
        expect(action.payload.options).to.equal(options);
      });
    });

    describe('getClinicsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('getting clinics failed :(');
        let action = sync.getClinicsFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal GET_CLINICS_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.getClinicsFailure(error);
        expect(action.type).to.equal('GET_CLINICS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('createClinicRequest', () => {
      it('should be a TSA', () => {
        let action = sync.createClinicRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_CLINIC_REQUEST', () => {
        let action = sync.createClinicRequest();
        expect(action.type).to.equal('CREATE_CLINIC_REQUEST');
      });
    });

    describe('createClinicSuccess', () => {
      let clinic = {id: 'clinicId', name: 'Clinic Name'};
      it('should be a TSA', () => {
        let action = sync.createClinicSuccess(clinic);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_CLINIC_SUCCESS', () => {
        let action = sync.createClinicSuccess(clinic);
        expect(action.type).to.equal('CREATE_CLINIC_SUCCESS');
        expect(action.payload.clinic).to.equal(clinic);
      });
    });

    describe('createClinicFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('creating clinic failed :(');
        let action = sync.createClinicFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_CLINIC_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.createClinicFailure(error);
        expect(action.type).to.equal('CREATE_CLINIC_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchClinicRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchClinicRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINIC_REQUEST', () => {
        let action = sync.fetchClinicRequest();
        expect(action.type).to.equal('FETCH_CLINIC_REQUEST');
      });
    });

    describe('fetchClinicSuccess', () => {
      let clinic = {id: 'clinicId', name: 'Clinic Name'};
      it('should be a TSA', () => {
        let action = sync.fetchClinicSuccess(clinic);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINIC_SUCCESS', () => {
        let action = sync.fetchClinicSuccess(clinic);
        expect(action.type).to.equal('FETCH_CLINIC_SUCCESS');
        expect(action.payload.clinic).to.equal(clinic);
      });
    });

    describe('fetchClinicFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('fetching clinic failed :(');
        let action = sync.fetchClinicFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINIC_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchClinicFailure(error);
        expect(action.type).to.equal('FETCH_CLINIC_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updateClinicRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updateClinicRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINIC_REQUEST', () => {
        let action = sync.updateClinicRequest();
        expect(action.type).to.equal('UPDATE_CLINIC_REQUEST');
      });
    });

    describe('updateClinicSuccess', () => {
      let clinicId = 'clinicId';
      let clinic = {id: 'clinicId', name: 'New Name'};
      it('should be a TSA', () => {
        let action = sync.updateClinicSuccess(clinicId, clinic);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINIC_SUCCESS', () => {
        let action = sync.updateClinicSuccess(clinicId, clinic);
        expect(action.type).to.equal('UPDATE_CLINIC_SUCCESS');
        expect(action.payload.clinicId).to.equal(clinicId);
        expect(action.payload.clinic).to.equal(clinic);
      });
    });

    describe('updateClinicFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('updating clinic failed :(');
        let action = sync.updateClinicFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINIC_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.updateClinicFailure(error);
        expect(action.type).to.equal('UPDATE_CLINIC_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchCliniciansFromClinicRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchCliniciansFromClinicRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_CLINIC_REQUEST', () => {
        let action = sync.fetchCliniciansFromClinicRequest();
        expect(action.type).to.equal('FETCH_CLINICIANS_FROM_CLINIC_REQUEST');
      });
    });

    describe('fetchCliniciansFromClinicSuccess', () => {
      let results = {clinicians: ['clinician1','clinician2'], clinicId:'clinicId'};
      it('should be a TSA', () => {
        let action = sync.fetchCliniciansFromClinicSuccess(results);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICIANS_FROM_CLINIC_SUCCESS', () => {
        let action = sync.fetchCliniciansFromClinicSuccess(results);
        expect(action.type).to.equal('FETCH_CLINICIANS_FROM_CLINIC_SUCCESS');
        expect(action.payload.results).to.equal(results);
      });
    });

    describe('fetchCliniciansFromClinicFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('deleting clinic failed :(');
        let action = sync.fetchCliniciansFromClinicFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICIANS_FROM_CLINIC_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchCliniciansFromClinicFailure(error);
        expect(action.type).to.equal('FETCH_CLINICIANS_FROM_CLINIC_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchClinicianRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchClinicianRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICIAN_REQUEST', () => {
        let action = sync.fetchClinicianRequest();
        expect(action.type).to.equal('FETCH_CLINICIAN_REQUEST');
      });
    });

    describe('fetchClinicianSuccess', () => {
      let clinician = {clinicianid: 'clinicianId', name: 'Clinician Name'};
      let clinicId = 'clinicId'
      it('should be a TSA', () => {
        let action = sync.fetchClinicianSuccess(clinician, clinicId);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICIAN_SUCCESS', () => {
        let action = sync.fetchClinicianSuccess(clinician, clinicId);
        expect(action.type).to.equal('FETCH_CLINICIAN_SUCCESS');
        expect(action.payload.clinician).to.equal(clinician);
        expect(action.payload.clinicId).to.equal(clinicId);
      });
    });

    describe('fetchClinicianFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('fetching clinician failed :(');
        let action = sync.fetchClinicianFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICIAN_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchClinicianFailure(error);
        expect(action.type).to.equal('FETCH_CLINICIAN_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updateClinicianRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updateClinicianRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINICIAN_REQUEST', () => {
        let action = sync.updateClinicianRequest();
        expect(action.type).to.equal('UPDATE_CLINICIAN_REQUEST');
      });
    });

    describe('updateClinicianSuccess', () => {
      let clinician = {id: 'clinicianId', name: 'Clinician Name', roles: ['CLINIC_MEMBER']};
      let clinicId = 'clinic_id';
      let update = { id: 'clinicianId', name: 'Clinician Name', roles: ['CLINIC_ADMIN'] }
      it('should be a TSA', () => {
        let action = sync.updateClinicianSuccess(clinicId, clinician.id, update);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINICIAN_SUCCESS', () => {
        let action = sync.updateClinicianSuccess(clinicId, clinician.id, update);
        expect(action.type).to.equal('UPDATE_CLINICIAN_SUCCESS');
        expect(action.payload.clinicianId).to.equal(clinician.id);
        expect(action.payload.clinicId).to.equal(clinicId);
        expect(action.payload.clinician).to.equal(update);
      });
    });

    describe('updateClinicianFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('updating clinician failed :(');
        let action = sync.updateClinicianFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINICIAN_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.updateClinicianFailure(error);
        expect(action.type).to.equal('UPDATE_CLINICIAN_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('deleteClinicianFromClinicRequest', () => {
      it('should be a TSA', () => {
        let action = sync.deleteClinicianFromClinicRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_CLINICIAN_FROM_CLINIC_REQUEST', () => {
        let action = sync.deleteClinicianFromClinicRequest();
        expect(action.type).to.equal('DELETE_CLINICIAN_FROM_CLINIC_REQUEST');
      });
    });

    describe('deleteClinicianFromClinicSuccess', () => {
      let clinician = {clinicianid: 'clinicianId', name: 'Clinician Name'};
      let clinicId = 'clinic_id';
      it('should be a TSA', () => {
        let action = sync.deleteClinicianFromClinicSuccess(clinicId, clinician.clinicianid);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_CLINICIAN_FROM_CLINIC_SUCCESS', () => {
        let action = sync.deleteClinicianFromClinicSuccess(clinicId, clinician.clinicianid);
        expect(action.type).to.equal('DELETE_CLINICIAN_FROM_CLINIC_SUCCESS');
        expect(action.payload.clinicianId).to.equal(clinician.clinicianid);
        expect(action.payload.clinicId).to.equal(clinicId);
      });
    });

    describe('deleteClinicianFromClinicFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('deleting clinician from clinic failed :(');
        let action = sync.deleteClinicianFromClinicFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_CLINICIAN_FROM_CLINIC_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.deleteClinicianFromClinicFailure(error);
        expect(action.type).to.equal('DELETE_CLINICIAN_FROM_CLINIC_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientsForClinicRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPatientsForClinicRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_FOR_CLINIC_REQUEST', () => {
        let action = sync.fetchPatientsForClinicRequest();
        expect(action.type).to.equal('FETCH_PATIENTS_FOR_CLINIC_REQUEST');
      });
    });

    describe('fetchPatientsForClinicSuccess', () => {
      let patients = [{clinicId: 'clinicId', patientId: 'patientId'}];
      it('should be a TSA', () => {
        let action = sync.fetchPatientsForClinicSuccess(patients);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_FOR_CLINIC_SUCCESS', () => {
        let action = sync.fetchPatientsForClinicSuccess(patients);
        expect(action.type).to.equal('FETCH_PATIENTS_FOR_CLINIC_SUCCESS');
        expect(action.payload.patients).to.equal(patients);
      });
    });

    describe('fetchPatientsForClinicFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('fetching patients for clinic failed :(');
        let action = sync.fetchPatientsForClinicFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_FOR_CLINIC_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchPatientsForClinicFailure(error);
        expect(action.type).to.equal('FETCH_PATIENTS_FOR_CLINIC_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('createCustodialAccountRequest', () => {
      it('should be a TSA', () => {
        let action = sync.createCustodialAccountRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_CUSTODIAL_ACCOUNT_REQUEST', () => {
        let action = sync.createCustodialAccountRequest();
        expect(action.type).to.equal('CREATE_CUSTODIAL_ACCOUNT_REQUEST');
      });
    });

    describe('createCustodialAccountSuccess', () => {
      let patient = {clinicId: 'clinicId', patientId: 'patientId', id: 'patientUserId'};
      let clinicId = 'clinicId';
      let patientId = 'patientId';
      it('should be a TSA', () => {
        let action = sync.createCustodialAccountSuccess(clinicId, patient, patientId);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_CUSTODIAL_ACCOUNT_SUCCESS', () => {
        let action = sync.createCustodialAccountSuccess(clinicId, patient, patientId);
        expect(action.type).to.equal('CREATE_CUSTODIAL_ACCOUNT_SUCCESS');
        expect(action.payload.patient).to.equal(patient);
        expect(action.payload.clinicId).to.equal(clinicId);
        expect(action.payload.patientId).to.equal(patientId);
      });
    });

    describe('createCustodialAccountFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('fetching patients for clinic failed :(');
        let action = sync.createCustodialAccountFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal CREATE_CUSTODIAL_ACCOUNT_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.createCustodialAccountFailure(error);
        expect(action.type).to.equal('CREATE_CUSTODIAL_ACCOUNT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientFromClinicRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPatientFromClinicRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_FROM_CLINIC_REQUEST', () => {
        let action = sync.fetchPatientFromClinicRequest();
        expect(action.type).to.equal('FETCH_PATIENT_FROM_CLINIC_REQUEST');
      });
    });

    describe('fetchPatientFromClinicSuccess', () => {
      let patient = {clinicId: 'clinicId', patientId: 'patientId', id: 'patientUserId'};

      it('should be a TSA', () => {
        let action = sync.fetchPatientFromClinicSuccess(patient);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_FROM_CLINIC_SUCCESS', () => {
        let action = sync.fetchPatientFromClinicSuccess(patient);
        expect(action.type).to.equal('FETCH_PATIENT_FROM_CLINIC_SUCCESS');
        expect(action.payload.patient).to.equal(patient);
      });
    });

    describe('fetchPatientFromClinicFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('fetching patient from clinic failed :(');
        let action = sync.fetchPatientFromClinicFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_FROM_CLINIC_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchPatientFromClinicFailure(error);
        expect(action.type).to.equal('FETCH_PATIENT_FROM_CLINIC_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updateClinicPatientRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updateClinicPatientRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINIC_PATIENT_REQUEST', () => {
        let action = sync.updateClinicPatientRequest();
        expect(action.type).to.equal('UPDATE_CLINIC_PATIENT_REQUEST');
      });
    });

    describe('updateClinicPatientSuccess', () => {
      let clinicId = 'clinicId';
      let patientId = 'patientId';
      let patient = { permissions: ['VIEW'] };
      it('should be a TSA', () => {
        let action = sync.updateClinicPatientSuccess(clinicId, patientId, patient);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINIC_PATIENT_SUCCESS', () => {
        let action = sync.updateClinicPatientSuccess(clinicId, patientId, patient);
        expect(action.type).to.equal('UPDATE_CLINIC_PATIENT_SUCCESS');
        expect(action.payload.clinicId).to.equal(clinicId);
        expect(action.payload.patientId).to.equal(patientId);
        expect(action.payload.patient).to.equal(patient);
      });
    });

    describe('updateClinicPatientFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('updating clinic patient failed :(');
        let action = sync.updateClinicPatientFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_CLINIC_PATIENT_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.updateClinicPatientFailure(error);
        expect(action.type).to.equal('UPDATE_CLINIC_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('sendClinicianInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.sendClinicianInviteRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SEND_CLINICIAN_INVITE_REQUEST', () => {
        let action = sync.sendClinicianInviteRequest();
        expect(action.type).to.equal('SEND_CLINICIAN_INVITE_REQUEST');
      });
    });

    describe('sendClinicianInviteSuccess', () => {
      let clinician = 'clinician';
      let clinicId = 'clinicId'

      it('should be a TSA', () => {
        let action = sync.sendClinicianInviteSuccess(clinician, clinicId);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SEND_CLINICIAN_INVITE_SUCCESS', () => {
        let action = sync.sendClinicianInviteSuccess(clinician, clinicId);
        expect(action.type).to.equal('SEND_CLINICIAN_INVITE_SUCCESS');
        expect(action.payload.clinician).to.equal(clinician);
        expect(action.payload.clinicId).to.equal(clinicId);
      });
    });

    describe('sendClinicianInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('sending clinician invite failed :(');
        let action = sync.sendClinicianInviteFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal SEND_CLINICIAN_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.sendClinicianInviteFailure(error);
        expect(action.type).to.equal('SEND_CLINICIAN_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('resendClinicianInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.resendClinicianInviteRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal RESEND_CLINICIAN_INVITE_REQUEST', () => {
        let action = sync.resendClinicianInviteRequest();
        expect(action.type).to.equal('RESEND_CLINICIAN_INVITE_REQUEST');
      });
    });

    describe('resendClinicianInviteSuccess', () => {
      let result = {};
      it('should be a TSA', () => {
        let action = sync.resendClinicianInviteSuccess(result);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal RESEND_CLINICIAN_INVITE_SUCCESS', () => {
        let action = sync.resendClinicianInviteSuccess(result);
        expect(action.type).to.equal('RESEND_CLINICIAN_INVITE_SUCCESS');
        expect(action.payload.result).to.equal(result);
      });
    });

    describe('resendClinicianInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('resending clinician invite failed :(');
        let action = sync.resendClinicianInviteFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal RESEND_CLINICIAN_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.resendClinicianInviteFailure(error);
        expect(action.type).to.equal('RESEND_CLINICIAN_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('deleteClinicianInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.deleteClinicianInviteRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_CLINICIAN_INVITE_REQUEST', () => {
        let action = sync.deleteClinicianInviteRequest();
        expect(action.type).to.equal('DELETE_CLINICIAN_INVITE_REQUEST');
      });
    });

    describe('deleteClinicianInviteSuccess', () => {
      let clinicId = 'clinicId';
      let inviteId = 'inviteId';
      let result = {};
      it('should be a TSA', () => {
        let action = sync.deleteClinicianInviteSuccess(clinicId, inviteId, result);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_CLINICIAN_INVITE_SUCCESS', () => {
        let action = sync.deleteClinicianInviteSuccess(clinicId, inviteId, result);
        expect(action.type).to.equal('DELETE_CLINICIAN_INVITE_SUCCESS');
        expect(action.payload.result).to.equal(result);
        expect(action.payload.clinicId).to.equal(clinicId);
        expect(action.payload.inviteId).to.equal(inviteId);
      });
    });

    describe('deleteClinicianInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('deleting clinician invite failed :(');
        let action = sync.deleteClinicianInviteFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DELETE_CLINICIAN_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.deleteClinicianInviteFailure(error);
        expect(action.type).to.equal('DELETE_CLINICIAN_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientInvitesRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchPatientInvitesRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_INVITES_REQUEST', () => {
        let action = sync.fetchPatientInvitesRequest();
        expect(action.type).to.equal('FETCH_PATIENT_INVITES_REQUEST');
      });
    });

    describe('fetchPatientInvitesSuccess', () => {
      let invites = ['inviteid', 'inviteid2']
      it('should be a TSA', () => {
        let action = sync.fetchPatientInvitesSuccess(invites);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_INVITES_SUCCESS', () => {
        let action = sync.fetchPatientInvitesSuccess(invites);
        expect(action.type).to.equal('FETCH_PATIENT_INVITES_SUCCESS');
        expect(action.payload.invites).to.equal(invites);
      });
    });

    describe('fetchPatientInvitesFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('fetching patient invites failed :(');
        let action = sync.fetchPatientInvitesFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_INVITES_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchPatientInvitesFailure(error);
        expect(action.type).to.equal('FETCH_PATIENT_INVITES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('acceptPatientInvitationRequest', () => {
      it('should be a TSA', () => {
        let action = sync.acceptPatientInvitationRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_PATIENT_INVITATION_REQUEST', () => {
        let action = sync.acceptPatientInvitationRequest();
        expect(action.type).to.equal('ACCEPT_PATIENT_INVITATION_REQUEST');
      });
    });

    describe('acceptPatientInvitationSuccess', () => {
      let result = {}
      it('should be a TSA', () => {
        let action = sync.acceptPatientInvitationSuccess(result);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_PATIENT_INVITATION_SUCCESS', () => {
        let action = sync.acceptPatientInvitationSuccess(result);
        expect(action.type).to.equal('ACCEPT_PATIENT_INVITATION_SUCCESS');
        expect(action.payload.result).to.equal(result);
      });
    });

    describe('acceptPatientInvitationFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('accepting patient invitation failed :(');
        let action = sync.acceptPatientInvitationFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_PATIENT_INVITATION_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.acceptPatientInvitationFailure(error);
        expect(action.type).to.equal('ACCEPT_PATIENT_INVITATION_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updatePatientPermissionsRequest', () => {
      it('should be a TSA', () => {
        let action = sync.updatePatientPermissionsRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_PERMISSIONS_REQUEST', () => {
        let action = sync.updatePatientPermissionsRequest();
        expect(action.type).to.equal('UPDATE_PATIENT_PERMISSIONS_REQUEST');
      });
    });

    describe('updatePatientPermissionsSuccess', () => {
      let permissions = {upload: {}, view: {}};
      it('should be a TSA', () => {
        let action = sync.updatePatientPermissionsSuccess(permissions);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_PERMISSIONS_SUCCESS', () => {
        let action = sync.updatePatientPermissionsSuccess(permissions);
        expect(action.type).to.equal('UPDATE_PATIENT_PERMISSIONS_SUCCESS');
        expect(action.payload.permissions).to.equal(permissions);
      });
    });

    describe('updatePatientPermissionsFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('updating patient permissions failed :(');
        let action = sync.updatePatientPermissionsFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_PERMISSIONS_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.updatePatientPermissionsFailure(error);
        expect(action.type).to.equal('UPDATE_PATIENT_PERMISSIONS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchClinicsForPatientRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchClinicsForPatientRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICS_FOR_PATIENT_REQUEST', () => {
        let action = sync.fetchClinicsForPatientRequest();
        expect(action.type).to.equal('FETCH_CLINICS_FOR_PATIENT_REQUEST');
      });
    });

    describe('fetchClinicsForPatientSuccess', () => {
      let clinics = [{patient: {name:'patient name'}, clinic: {id:'clinicId'}}]
      it('should be a TSA', () => {
        let action = sync.fetchClinicsForPatientSuccess(clinics);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICS_FOR_PATIENT_SUCCESS', () => {
        let action = sync.fetchClinicsForPatientSuccess(clinics);
        expect(action.type).to.equal('FETCH_CLINICS_FOR_PATIENT_SUCCESS');
        expect(action.payload.clinics).to.equal(clinics);
      });
    });

    describe('fetchClinicsForPatientFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('fetching clinics for patient failed :(');
        let action = sync.fetchClinicsForPatientFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICS_FOR_PATIENT_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchClinicsForPatientFailure(error);
        expect(action.type).to.equal('FETCH_CLINICS_FOR_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchClinicianInvitesRequest', () => {
      it('should be a TSA', () => {
        let action = sync.fetchClinicianInvitesRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICIAN_INVITES_REQUEST', () => {
        let action = sync.fetchClinicianInvitesRequest();
        expect(action.type).to.equal('FETCH_CLINICIAN_INVITES_REQUEST');
      });
    });

    describe('fetchClinicianInvitesSuccess', () => {
      let invites = ['inviteId1', 'inviteId2'];
      it('should be a TSA', () => {
        let action = sync.fetchClinicianInvitesSuccess(invites);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICIAN_INVITES_SUCCESS', () => {
        let action = sync.fetchClinicianInvitesSuccess(invites);
        expect(action.type).to.equal('FETCH_CLINICIAN_INVITES_SUCCESS');
        expect(action.payload.invites).to.equal(invites);
      });
    });

    describe('fetchClinicianInvitesFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('fetching clinician invites failed :(');
        let action = sync.fetchClinicianInvitesFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal FETCH_CLINICIAN_INVITES_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.fetchClinicianInvitesFailure(error);
        expect(action.type).to.equal('FETCH_CLINICIAN_INVITES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('acceptClinicianInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.acceptClinicianInviteRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_CLINICIAN_INVITE_REQUEST', () => {
        let action = sync.acceptClinicianInviteRequest();
        expect(action.type).to.equal('ACCEPT_CLINICIAN_INVITE_REQUEST');
      });
    });

    describe('acceptClinicianInviteSuccess', () => {
      let result = {};
      it('should be a TSA', () => {
        let action = sync.acceptClinicianInviteSuccess(result);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_CLINICIAN_INVITE_SUCCESS', () => {
        let action = sync.acceptClinicianInviteSuccess(result);
        expect(action.type).to.equal('ACCEPT_CLINICIAN_INVITE_SUCCESS');
        expect(action.payload.result).to.equal(result);
      });
    });

    describe('acceptClinicianInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('accepting clinician invite failed :(');
        let action = sync.acceptClinicianInviteFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_CLINICIAN_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.acceptClinicianInviteFailure(error);
        expect(action.type).to.equal('ACCEPT_CLINICIAN_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('dismissClinicianInviteRequest', () => {
      it('should be a TSA', () => {
        let action = sync.dismissClinicianInviteRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DISMISS_CLINICIAN_INVITE_REQUEST', () => {
        let action = sync.dismissClinicianInviteRequest();
        expect(action.type).to.equal('DISMISS_CLINICIAN_INVITE_REQUEST');
      });
    });

    describe('dismissClinicianInviteSuccess', () => {
      let result = {};
      it('should be a TSA', () => {
        let action = sync.dismissClinicianInviteSuccess(result);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DISMISS_CLINICIAN_INVITE_SUCCESS', () => {
        let action = sync.dismissClinicianInviteSuccess(result);
        expect(action.type).to.equal('DISMISS_CLINICIAN_INVITE_SUCCESS');
        expect(action.payload.result).to.equal(result);
      });
    });

    describe('dismissClinicianInviteFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('dismissing clinician invite failed :(');
        let action = sync.dismissClinicianInviteFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal DISMISS_CLINICIAN_INVITE_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.dismissClinicianInviteFailure(error);
        expect(action.type).to.equal('DISMISS_CLINICIAN_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('getClinicsForClinicianRequest', () => {
      it('should be a TSA', () => {
        let action = sync.getClinicsForClinicianRequest();
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal GET_CLINICS_FOR_CLINICIAN_REQUEST', () => {
        let action = sync.getClinicsForClinicianRequest();
        expect(action.type).to.equal('GET_CLINICS_FOR_CLINICIAN_REQUEST');
      });
    });

    describe('getClinicsForClinicianSuccess', () => {
      let clinics = [
        {id: 'clinicId', name: 'Clinic Name'},
        {id: 'clinicId2', name: 'Clinic Name'},
      ];
      it('should be a TSA', () => {
        let action = sync.getClinicsForClinicianSuccess(clinics);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal GET_CLINICS_FOR_CLINICIAN_SUCCESS', () => {
        let action = sync.getClinicsForClinicianSuccess(clinics);
        expect(action.type).to.equal('GET_CLINICS_FOR_CLINICIAN_SUCCESS');
        expect(action.payload.clinics).to.equal(clinics);
      });
    });

    describe('getClinicsForClinicianFailure', () => {
      it('should be a TSA', () => {
        let error = new Error('deleting clinic clinician failed :(');
        let action = sync.getClinicsForClinicianFailure(error);
        expect(isTSA(action)).to.be.true;
      });

      it('type should equal GET_CLINICS_FOR_CLINICIAN_FAILURE and error should equal passed error', () => {
        let error = new Error('stink :(');
        let action = sync.getClinicsForClinicianFailure(error);
        expect(action.type).to.equal('GET_CLINICS_FOR_CLINICIAN_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

  });
});
