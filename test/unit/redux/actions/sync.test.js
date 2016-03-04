/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global afterEach */

import { isFSA } from 'flux-standard-action';

import * as sync from '../../../../app/redux/actions/sync';

describe('Actions', () => {

  describe('Synchronous Actions', () => {
    describe('showWelcomeMessage', () => {
      it('should be a FSA', () => {
        let action = sync.showWelcomeMessage();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SHOW_WELCOME_MESSAGE', () => {
        let action = sync.showWelcomeMessage();
        expect(action.type).to.equal('SHOW_WELCOME_MESSAGE');
      });
    });

    describe('hideWelcomeMessage', () => {
      it('should be a FSA', () => {
        let action = sync.hideWelcomeMessage();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal HIDE_WELCOME_MESSAGE', () => {
        let action = sync.hideWelcomeMessage();
        expect(action.type).to.equal('HIDE_WELCOME_MESSAGE');
      });
    });

    describe('showNotification', () => {
      it('should be a FSA', () => {
        let action = sync.showNotification('Fake notification');

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SHOW_NOTIFICATION', () => {
        let action = sync.showNotification();
        expect(action.type).to.equal('SHOW_NOTIFICATION');
      });
    });

    describe('acknowledgeNotification', () => {
      it('should be a FSA', () => {
        let action = sync.acknowledgeNotification();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal ACKNOWLEDGE_NOTIFICATION', () => {
        let note = 'foo';
        let action = sync.acknowledgeNotification(note);

        expect(action.payload.acknowledgedNotification).to.equal(note);
        expect(action.type).to.equal('ACKNOWLEDGE_NOTIFICATION');
      });
    });

    describe('loginRequest', () => {
      it('should be a FSA', () => {
        let action = sync.loginRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGIN_REQUEST', () => {
        let action = sync.loginRequest();
        expect(action.type).to.equal('LOGIN_REQUEST');
      });
    });

    describe('loginSuccess', () => {
      it('should be a FSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.loginSuccess(user);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.loginFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGIN_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.loginFailure(error);

        expect(action.type).to.equal('LOGIN_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('logoutRequest', () => {
      it('should be a FSA', () => {
        let action = sync.logoutRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGOUT_REQUEST', () => {
        let action = sync.logoutRequest();
        expect(action.type).to.equal('LOGOUT_REQUEST');
      });
    });

    describe('logoutSuccess', () => {
      it('should be a FSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.logoutSuccess(user);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGOUT_SUCCESS', () => {
        let action = sync.logoutSuccess();

        expect(action.type).to.equal('LOGOUT_SUCCESS');
      });
    });

    describe('logoutFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.logoutFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGOUT_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.logoutFailure(error);

        expect(action.type).to.equal('LOGOUT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('signupRequest', () => {
      it('should be a FSA', () => {
        let action = sync.signupRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SIGNUP_REQUEST', () => {
        let action = sync.signupRequest();
        expect(action.type).to.equal('SIGNUP_REQUEST');
      });
    });

    describe('signupSuccess', () => {
      it('should be a FSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.signupSuccess(user);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.signupFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SIGNUP_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.signupFailure(error);

        expect(action.type).to.equal('SIGNUP_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('confirmSignupRequest', () => {
      it('should be a FSA', () => {
        let action = sync.confirmSignupRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_REQUEST', () => {
        let action = sync.confirmSignupRequest();
        expect(action.type).to.equal('CONFIRM_SIGNUP_REQUEST');
      });
    });

    describe('confirmSignupSuccess', () => {
      it('should be a FSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.confirmSignupSuccess(user);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_SUCCESS', () => {
        let action = sync.confirmSignupSuccess();

        expect(action.type).to.equal('CONFIRM_SIGNUP_SUCCESS');
      });
    });

    describe('confirmSignupFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.confirmSignupFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.confirmSignupFailure(error);

        expect(action.type).to.equal('CONFIRM_SIGNUP_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('acceptTermsRequest', () => {
      it('should be a FSA', () => {
        let action = sync.acceptTermsRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_TERMS_REQUEST', () => {
        let action = sync.acceptTermsRequest();
        expect(action.type).to.equal('ACCEPT_TERMS_REQUEST');
      });
    });

    describe('acceptTermsSuccess', () => {
      it('should be a FSA', () => {
        let acceptedDate = new Date();
        let action = sync.acceptTermsSuccess(acceptedDate);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_TERMS_SUCCESS', () => {
        let acceptedDate = new Date();
        let action = sync.acceptTermsSuccess(acceptedDate);

        expect(action.type).to.equal('ACCEPT_TERMS_SUCCESS');
        expect(action.payload.acceptedDate).to.equal(acceptedDate);
      });
    });

    describe('acceptTermsFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.acceptTermsFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_TERMS_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.acceptTermsFailure(error);

        expect(action.type).to.equal('ACCEPT_TERMS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('createPatientRequest', () => {
      it('should be a FSA', () => {
        let action = sync.createPatientRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CREATE_PATIENT_REQUEST', () => {
        let action = sync.createPatientRequest();
        expect(action.type).to.equal('CREATE_PATIENT_REQUEST');
      });
    });

    describe('createPatientSuccess', () => {
      it('should be a FSA', () => {
        let patient = {
          id: 540
        };
        let action = sync.createPatientSuccess(patient);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CREATE_PATIENT_SUCCESS', () => {
        let patient = {
          id: 540
        };
        let action = sync.createPatientSuccess(patient);

        expect(action.type).to.equal('CREATE_PATIENT_SUCCESS');
        expect(action.payload.patient).to.equal(patient);
      });
    });

    describe('createPatientFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.createPatientFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CREATE_PATIENT_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.createPatientFailure(error);

        expect(action.type).to.equal('CREATE_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('removePatientRequest', () => {
      it('should be a FSA', () => {
        let action = sync.removePatientRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal REMOVE_PATIENT_REQUEST', () => {
        let action = sync.removePatientRequest();
        expect(action.type).to.equal('REMOVE_PATIENT_REQUEST');
      });
    });

    describe('removePatientSuccess', () => {
      it('should be a FSA', () => {
        let patientId = 540;
        let action = sync.removePatientSuccess(patientId);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal REMOVE_PATIENT_SUCCESS', () => {
        let patientId = 540;
        let action = sync.removePatientSuccess(patientId);

        expect(action.type).to.equal('REMOVE_PATIENT_SUCCESS');
        expect(action.payload.removedPatientId).to.equal(patientId);
      });
    });

    describe('removePatientFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.removePatientFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal REMOVE_PATIENT_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.removePatientFailure(error);

        expect(action.type).to.equal('REMOVE_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('removeMemberRequest', () => {
      it('should be a FSA', () => {
        let action = sync.removeMemberRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBER_REQUEST', () => {
        let action = sync.removeMemberRequest();
        expect(action.type).to.equal('REMOVE_MEMBER_REQUEST');
      });
    });

    describe('removeMemberSuccess', () => {
      it('should be a FSA', () => {
        let memberId = 540;
        let action = sync.removeMemberSuccess(memberId);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBER_SUCCESS', () => {
        let memberId = 540;
        let action = sync.removeMemberSuccess(memberId);

        expect(action.type).to.equal('REMOVE_MEMBER_SUCCESS');
        expect(action.payload.removedMemberId).to.equal(memberId);
      });
    });

    describe('removeMemberFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.removeMemberFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal REMOVE_MEMBER_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.removeMemberFailure(error);

        expect(action.type).to.equal('REMOVE_MEMBER_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('sendInviteRequest', () => {
      it('should be a FSA', () => {
        let action = sync.sendInviteRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SEND_INVITE_REQUEST', () => {
        let action = sync.sendInviteRequest();
        expect(action.type).to.equal('SEND_INVITE_REQUEST');
      });
    });

    describe('sendInviteSuccess', () => {
      it('should be a FSA', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.sendInviteSuccess(invite);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.sendInviteFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SEND_INVITE_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.sendInviteFailure(error);

        expect(action.type).to.equal('SEND_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('cancelSentInviteRequest', () => {
      it('should be a FSA', () => {
        let action = sync.cancelSentInviteRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CANCEL_SENT_INVITE_REQUEST', () => {
        let action = sync.cancelSentInviteRequest();
        expect(action.type).to.equal('CANCEL_SENT_INVITE_REQUEST');
      });
    });

    describe('cancelSentInviteSuccess', () => {
      it('should be a FSA', () => {
        let email = 'a@b.com';
        let action = sync.cancelSentInviteSuccess(email);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CANCEL_SENT_INVITE_SUCCESS', () => {
        let email = 'a@b.com';
        let action = sync.cancelSentInviteSuccess(email);

        expect(action.type).to.equal('CANCEL_SENT_INVITE_SUCCESS');
        expect(action.payload.removedEmail).to.equal(email);
      });
    });

    describe('cancelSentInviteFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.cancelSentInviteFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CANCEL_SENT_INVITE_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.cancelSentInviteFailure(error);

        expect(action.type).to.equal('CANCEL_SENT_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('acceptReceivedInviteRequest', () => {
      it('should be a FSA', () => {
        let action = sync.acceptReceivedInviteRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_RECEIVED_INVITE_REQUEST', () => {
        let action = sync.acceptReceivedInviteRequest();
        expect(action.type).to.equal('ACCEPT_RECEIVED_INVITE_REQUEST');
      });
    });

    describe('acceptReceivedInviteSuccess', () => {
      it('should be a FSA', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.acceptReceivedInviteSuccess(invite);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.acceptReceivedInviteFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal ACCEPT_RECEIVED_INVITE_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.acceptReceivedInviteFailure(error);

        expect(action.type).to.equal('ACCEPT_RECEIVED_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('rejectReceivedInviteRequest', () => {
      it('should be a FSA', () => {
        let action = sync.rejectReceivedInviteRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal REJECT_RECEIVED_INVITE_REQUEST', () => {
        let action = sync.rejectReceivedInviteRequest();
        expect(action.type).to.equal('REJECT_RECEIVED_INVITE_REQUEST');
      });
    });

    describe('rejectReceivedInviteSuccess', () => {
      it('should be a FSA', () => {
        let invite = {
          email: 'joe@google.com',
          permissions: {
            view: true,
            clear: true
          }
        };
        let action = sync.rejectReceivedInviteSuccess(invite);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.rejectReceivedInviteFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal REJECT_RECEIVED_INVITE_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.rejectReceivedInviteFailure(error);

        expect(action.type).to.equal('REJECT_RECEIVED_INVITE_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('setMemberPermissionsRequest', () => {
      it('should be a FSA', () => {
        let action = sync.setMemberPermissionsRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SET_MEMBER_PERMISSIONS_REQUEST', () => {
        let action = sync.setMemberPermissionsRequest();
        expect(action.type).to.equal('SET_MEMBER_PERMISSIONS_REQUEST');
      });
    });

    describe('setMemberPermissionsSuccess', () => {
      it('should be a FSA', () => {
        let memberId = 444;
        let permissions = {
          view: true,
          clear: true
        };
        let action = sync.setMemberPermissionsSuccess(memberId, permissions);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.setMemberPermissionsFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SET_MEMBER_PERMISSIONS_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.setMemberPermissionsFailure(error);

        expect(action.type).to.equal('SET_MEMBER_PERMISSIONS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updatePatientRequest', () => {
      it('should be a FSA', () => {
        let action = sync.updatePatientRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_REQUEST', () => {
        let action = sync.updatePatientRequest();
        expect(action.type).to.equal('UPDATE_PATIENT_REQUEST');
      });
    });

    describe('updatePatientSuccess', () => {
      it('should be a FSA', () => {
        let patient = {
          name: 'Frank'
        };
        let action = sync.updatePatientSuccess(patient);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.updatePatientFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal UPDATE_PATIENT_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.updatePatientFailure(error);

        expect(action.type).to.equal('UPDATE_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('updateUserRequest', () => {
      it('should be a FSA', () => {
        let action = sync.updateUserRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal UPDATE_USER_REQUEST', () => {
        let action = sync.updateUserRequest();
        expect(action.type).to.equal('UPDATE_USER_REQUEST');
      });
    });

    describe('updateUserSuccess', () => {
      it('should be a FSA', () => {
        let user = {
          name: 'Frank'
        };
        let action = sync.updateUserSuccess(user);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal UPDATE_USER_SUCCESS', () => {
        let user = {
          name: 'Frank'
        };
        let action = sync.updateUserSuccess(user);

        expect(action.type).to.equal('UPDATE_USER_SUCCESS');
        expect(action.payload.updatedUser).to.equal(user);
      });
    });

    describe('updateUserFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.updateUserFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal UPDATE_USER_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.updateUserFailure(error);

        expect(action.type).to.equal('UPDATE_USER_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('logErrorRequest', () => {
      it('should be a FSA', () => {
        let action = sync.logErrorRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOG_ERROR_REQUEST', () => {
        let action = sync.logErrorRequest();
        expect(action.type).to.equal('LOG_ERROR_REQUEST');
      });
    });

    describe('logErrorSuccess', () => {
      it('should be a FSA', () => {
        let action = sync.logErrorSuccess();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOG_ERROR_SUCCESS', () => {
        let action = sync.logErrorSuccess();

        expect(action.type).to.equal('LOG_ERROR_SUCCESS');
      });
    });

    describe('logErrorFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.logErrorFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOG_ERROR_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.logErrorFailure(error);

        expect(action.type).to.equal('LOG_ERROR_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchUserRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchUserRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_USER_REQUEST', () => {
        let action = sync.fetchUserRequest();
        expect(action.type).to.equal('FETCH_USER_REQUEST');
      });
    });

    describe('fetchUserSuccess', () => {
      it('should be a FSA', () => {
        let user = {
          id: 27,
          name: 'Frankie'
        };
        let action = sync.fetchUserSuccess(user);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchUserFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_USER_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchUserFailure(error);

        expect(action.type).to.equal('FETCH_USER_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPendingSentInvitesRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPendingSentInvitesRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_SENT_INVITES_REQUEST', () => {
        let action = sync.fetchPendingSentInvitesRequest();
        expect(action.type).to.equal('FETCH_PENDING_SENT_INVITES_REQUEST');
      });
    });

    describe('fetchPendingSentInvitesSuccess', () => {
      it('should be a FSA', () => {
        let pendingSentInvites = [1, 2, 27];
        let action = sync.fetchPendingSentInvitesSuccess(pendingSentInvites);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_SENT_INVITES_SUCCESS', () => {
        let pendingSentInvites = [1, 7, 27, 566];
        let action = sync.fetchPendingSentInvitesSuccess(pendingSentInvites);

        expect(action.type).to.equal('FETCH_PENDING_SENT_INVITES_SUCCESS');
        expect(action.payload.pendingSentInvites).to.equal(pendingSentInvites);
      });
    });

    describe('fetchPendingSentInvitesFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPendingSentInvitesFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_SENT_INVITES_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPendingSentInvitesFailure(error);

        expect(action.type).to.equal('FETCH_PENDING_SENT_INVITES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPendingReceivedInvitesRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPendingReceivedInvitesRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_RECEIVED_INVITES_REQUEST', () => {
        let action = sync.fetchPendingReceivedInvitesRequest();
        expect(action.type).to.equal('FETCH_PENDING_RECEIVED_INVITES_REQUEST');
      });
    });

    describe('fetchPendingReceivedInvitesSuccess', () => {
      it('should be a FSA', () => {
        let pendingReceivedInvites = [1, 2, 27];
        let action = sync.fetchPendingReceivedInvitesSuccess(pendingReceivedInvites);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_RECEIVED_INVITES_SUCCESS', () => {
        let pendingReceivedInvites = [1, 7, 27, 566];
        let action = sync.fetchPendingReceivedInvitesSuccess(pendingReceivedInvites);

        expect(action.type).to.equal('FETCH_PENDING_RECEIVED_INVITES_SUCCESS');
        expect(action.payload.pendingReceivedInvites).to.equal(pendingReceivedInvites);
      });
    });

    describe('fetchPendingReceivedInvitesFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPendingReceivedInvitesFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_RECEIVED_INVITES_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPendingReceivedInvitesFailure(error);

        expect(action.type).to.equal('FETCH_PENDING_RECEIVED_INVITES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPatientRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_REQUEST', () => {
        let action = sync.fetchPatientRequest();
        expect(action.type).to.equal('FETCH_PATIENT_REQUEST');
      });
    });

    describe('fetchPatientSuccess', () => {
      it('should be a FSA', () => {
        let patient = {
          name: 'Bruce Lee',
          age: 24
        };
        let action = sync.fetchPatientSuccess(patient);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPatientFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPatientFailure(error);

        expect(action.type).to.equal('FETCH_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientsRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPatientsRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_REQUEST', () => {
        let action = sync.fetchPatientsRequest();
        expect(action.type).to.equal('FETCH_PATIENTS_REQUEST');
      });
    });

    describe('fetchPatientsSuccess', () => {
      it('should be a FSA', () => {
        let patients = [{
          id: 20,
          name: 'Bruce Lee',
          age: 24
        }];
        let action = sync.fetchPatientsSuccess(patients);

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPatientsFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPatientsFailure(error);

        expect(action.type).to.equal('FETCH_PATIENTS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientDataRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPatientDataRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_REQUEST', () => {
        let action = sync.fetchPatientDataRequest();
        expect(action.type).to.equal('FETCH_PATIENT_DATA_REQUEST');
      });
    });

    describe('fetchPatientDataSuccess', () => {
      it('should be a FSA', () => {
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

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPatientDataFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPatientDataFailure(error);

        expect(action.type).to.equal('FETCH_PATIENT_DATA_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchMessageThreadRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchMessageThreadRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_MESSAGE_THREAD_REQUEST', () => {
        let action = sync.fetchMessageThreadRequest();
        expect(action.type).to.equal('FETCH_MESSAGE_THREAD_REQUEST');
      });
    });

    describe('fetchMessageThreadSuccess', () => {
      it('should be a FSA', () => {
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

        expect(isFSA(action)).to.be.true;
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
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchMessageThreadFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_MESSAGE_THREAD_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchMessageThreadFailure(error);

        expect(action.type).to.equal('FETCH_MESSAGE_THREAD_FAILURE');
        expect(action.error).to.equal(error);
      });
    });
  });
});