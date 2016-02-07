/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import reducer from '../../../../app/redux/reducers/index';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import initialState from '../../../../app/redux/reducers/initialState';


var expect = chai.expect;

describe('reducers', () => {
  describe('acknowledgeNotification', () => {
    it('should set error to null', () => {
      let initialStateForTest = _.merge({}, initialState, { notification: { message: 'foo' } });
      let action = actions.sync.acknowledgeNotification()

      expect(initialStateForTest.notification.message).to.equal('foo');

      let state = reducer(initialStateForTest, action);
      expect(state.notification).to.be.null;
    });
  });

  describe('access', () => {
    describe('login', () => {
      describe('request', () => {
        it('should set working.loggingIn to be true', () => {
          let action = actions.sync.loginRequest();
          expect(initialState.working.loggingIn.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.loggingIn.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set working.loggingIn to be false', () => {
          let error = 'Something bad happened';

          let requestAction = actions.sync.loginRequest();
          expect(initialState.working.loggingIn.inProgress).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.working.loggingIn.inProgress).to.be.true;

          let failureAction = actions.sync.loginFailure(error);
          let state = reducer(intermediateState, failureAction);
          expect(state.working.loggingIn.inProgress).to.be.false;
          expect(state.working.loggingIn.notification.type).to.equal('error');
          expect(state.working.loggingIn.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set working.loggingIn.inProgress to be false and set user', () => {
          let user = 'user'

          let requestAction = actions.sync.loginRequest();
          expect(initialState.working.loggingIn.inProgress).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.working.loggingIn.inProgress).to.be.true;

          let successAction = actions.sync.loginSuccess(user);
          let state = reducer(intermediateState, successAction);
          expect(state.working.loggingIn.inProgress).to.be.false;
          expect(state.isLoggedIn).to.be.true;
          expect(state.loggedInUser).to.equal(user);
        });
      });
    });

    describe('logout', () => {
      describe('request', () => {
        it('should set working.loggingOut to be true', () => {
          let action = actions.sync.logoutRequest();
          expect(initialState.working.loggingOut).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.loggingOut).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set working.loggingOut to be false', () => {
          let error = 'Something bad happened';

          let requestAction = actions.sync.logoutRequest();
          expect(initialState.working.loggingOut).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.working.loggingOut).to.be.true;

          let failureAction = actions.sync.logoutFailure(error);
          let state = reducer(intermediateState, failureAction);
          expect(state.working.loggingOut).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set working.loggingOut to be false and clear session state values', () => {
          let user = 'user';

          let requestAction = actions.sync.logoutRequest();
          expect(initialState.working.loggingOut).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.working.loggingOut).to.be.true;

          let successAction = actions.sync.logoutSuccess(user);
          let state = reducer(intermediateState, successAction);
          expect(state.working.loggingOut).to.be.false;
          expect(state.isLoggedIn).to.be.false;
          expect(state.loggedInUser).to.equal(null);
          expect(state.currentPatientInView).to.equal(null);
          expect(state.patients).to.equal(null);
          expect(state.patientsData).to.equal(null);
          expect(state.invites).to.equal(null);
        });
      });
    });
  });

  describe('signup', () => {
    describe('request', () => {
      it('should set working.signingUp to be true', () => {
        let action = actions.sync.signupRequest();
        expect(initialState.working.signingUp).to.be.false;

        let state = reducer(initialState, action);
        expect(state.working.signingUp).to.be.true;
      });
    });

    describe('failure', () => {
      it('should set working.signingUp to be false', () => {
        let error = 'Something bad happened when signing up';

        let requestAction = actions.sync.signupRequest();
        expect(initialState.working.signingUp).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.signingUp).to.be.true;

        let failureAction = actions.sync.signupFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.working.signingUp).to.be.false;
        expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.signingUp to be false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.signupRequest();
        
        expect(initialState.working.signingUp).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.signingUp).to.be.true;

        let successAction = actions.sync.signupSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.working.signingUp).to.be.false;
        expect(state.isLoggedIn).to.be.true;
        expect(state.loggedInUser).to.equal(user);
      });
    });
  });

  describe('confirmSignup', () => {
    describe('request', () => {
      it('should set working.confirmingSignup to be true', () => {
        let action = actions.sync.confirmSignupRequest();
        expect(initialState.working.confirmingSignup).to.be.false;

        let state = reducer(initialState, action);
        expect(state.working.confirmingSignup).to.be.true;
      });
    });

    describe('failure', () => {
      it('should set working.confirmingSignup to be false', () => {
        let error = 'Something bad happened when signing up';

        let requestAction = actions.sync.confirmSignupRequest();
        expect(initialState.working.confirmingSignup).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.confirmingSignup).to.be.true;

        let failureAction = actions.sync.confirmSignupFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.working.confirmingSignup).to.be.false;
        expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.confirmingSignup to be false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.confirmSignupRequest();
        
        expect(initialState.working.confirmingSignup).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.confirmingSignup).to.be.true;

        let successAction = actions.sync.confirmSignupSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.working.confirmingSignup).to.be.false;
        expect(state.confirmedSignup).to.be.true;
      });
    });
  });

  describe('confirmPasswordReset', () => {
    describe('request', () => {
      it('should set working.confirmingPasswordReset to be true', () => {
        let action = actions.sync.confirmPasswordResetRequest();
        expect(initialState.working.confirmingPasswordReset).to.be.false;

        let state = reducer(initialState, action);
        expect(state.working.confirmingPasswordReset).to.be.true;
      });
    });

    describe('failure', () => {
      it('should set working.confirmingPasswordReset to be false', () => {
        let error = 'Something bad happened when signing up';

        let requestAction = actions.sync.confirmPasswordResetRequest();
        expect(initialState.working.confirmingPasswordReset).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.confirmingPasswordReset).to.be.true;

        let failureAction = actions.sync.confirmPasswordResetFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.working.confirmingPasswordReset).to.be.false;
        expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.confirmingPasswordReset to be false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.confirmPasswordResetRequest();
        
        expect(initialState.working.confirmingPasswordReset).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.confirmingPasswordReset).to.be.true;

        let successAction = actions.sync.confirmPasswordResetSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.working.confirmingPasswordReset).to.be.false;
        expect(state.passwordResetConfirmed).to.be.true;
      });
    });
  });

  describe('acceptTerms', () => {
    describe('request', () => {
      it('should set working.acceptingTerms to be true', () => {
        let action = actions.sync.acceptTermsRequest(); 

        expect(initialState.working.acceptingTerms).to.be.false;

        let state = reducer(initialState, action);
        expect(state.working.acceptingTerms).to.be.true;
      });
    });

    describe('failure', () => {
      it('should set working.acceptingTerms to be false', () => {
        let error = 'Something bad happened when signing up';

        let requestAction = actions.sync.acceptTermsRequest();
        expect(initialState.working.acceptingTerms).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.acceptingTerms).to.be.true;

        let failureAction = actions.sync.acceptTermsFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.working.acceptingTerms).to.be.false;
        expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.acceptingTerms to be false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.acceptTermsRequest();
        
        expect(initialState.working.acceptingTerms).to.be.false;
        expect(initialState.loggedInUser).to.be.null;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.acceptingTerms).to.be.true;

        let successAction = actions.sync.acceptTermsSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.working.acceptingTerms).to.be.false;
        expect(state.loggedInUser).to.equal(user);
      });
    });
  });

  describe('fetchers', () => {
    describe('fetchUser', () => {
      describe('request', () => {
        it('should set fetchingUser to be true', () => {
          let action = actions.sync.fetchUserRequest(); 

          expect(initialState.working.fetchingUser).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.fetchingUser).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingUser to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingUser: true} });
          let error = 'Something bad happened!';
          let action = actions.sync.fetchUserFailure(error);

          expect(initialStateForTest.working.fetchingUser).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.working.fetchingUser).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingUser to be false and set user', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingUser: true} });
          let user = { id: 501, name: 'Jamie Blake'};
          let action = actions.sync.fetchUserSuccess(user);

          expect(initialStateForTest.working.fetchingUser).to.be.true;
          expect(initialStateForTest.loggedInUser).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingUser).to.be.false;
          expect(state.loggedInUser.id).to.equal(user.id);
          expect(state.loggedInUser.name).to.equal(user.name);
        });
      });
    });

    describe('fetchPatient', () => {
      describe('request', () => {
        it('should set fetchingPatient to be true', () => {
          let action = actions.sync.fetchPatientRequest(); 

          expect(initialState.working.fetchingPatient).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.fetchingPatient).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatient: true} });
          let error = 'Something else bad happened!';
          let action = actions.sync.fetchPatientFailure(error);

          expect(initialStateForTest.working.fetchingPatient).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.working.fetchingPatient).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingPatient to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatient: true} });
          let patient = { id: 2020, name: 'Megan Durrant'};
          let action = actions.sync.fetchPatientSuccess(patient);

          expect(initialStateForTest.working.fetchingPatient).to.be.true;
          expect(initialStateForTest.currentPatientInView).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingPatient).to.be.false;
          expect(state.currentPatientInView.id).to.equal(patient.id);
          expect(state.currentPatientInView.name).to.equal(patient.name);
        });
      });
    });

    describe('fetchPatients', () => {
      describe('request', () => {
        it('should set fetchingPatients to be true', () => {
          let action = actions.sync.fetchPatientsRequest(); 

          expect(initialState.working.fetchingPatients).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.fetchingPatients).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatients to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatients: true} });
          let error = 'Oh no!!';
          let action = actions.sync.fetchPatientsFailure(error);

          expect(initialStateForTest.working.fetchingPatients).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.working.fetchingPatients).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingPatients to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatients: true} });
          let patients = [
            { id: 2020, name: 'Megan Durrant'},
            { id: 501, name: 'Jamie Blake'}
          ];
          let action = actions.sync.fetchPatientsSuccess(patients);

          expect(initialStateForTest.working.fetchingPatients).to.be.true;
          expect(initialStateForTest.patients).to.be.empty;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingPatients).to.be.false;
          expect(Object.keys(state.patients).length).to.equal(2);
          expect(state.patients[patients[0].id].id).to.equal(patients[0].id);
          expect(state.patients[patients[1].id].id).to.equal(patients[1].id);
          expect(state.patients[patients[0].id].name).to.equal(patients[0].name);
          expect(state.patients[patients[1].id].name).to.equal(patients[1].name);
        });
      });
    });

    describe('fetchPatientData', () => {
      describe('request', () => {
        it('should set fetchingPatientData to be true', () => {
          let action = actions.sync.fetchPatientDataRequest(); 

          expect(initialState.working.fetchingPatientData).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.fetchingPatientData).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatientData to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatientData: true} });
          let error = 'Oh no!!';
          let action = actions.sync.fetchPatientDataFailure(error);

          expect(initialStateForTest.working.fetchingPatientData).to.be.true;
          expect(initialStateForTest.error).to.be.null;
          expect(initialStateForTest.patientData).to.be.empty;

          let state = reducer(initialStateForTest, action);

          expect(state.working.fetchingPatientData).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
          expect(state.patientData).to.be.empty;
        });
      });

      describe('success', () => {
        it('should set fetchingPatientData to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatientData: true} });
          let patientId = 300;
          let patientData = [
            { id: 2020 },
            { id: 501 }
          ];
          let action = actions.sync.fetchPatientDataSuccess(patientId, patientData);

          expect(initialStateForTest.working.fetchingPatientData).to.be.true;
          expect(initialStateForTest.patientData).to.be.empty;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingPatientData).to.be.false;
          expect(Object.keys(state.patientData).length).to.equal(1);
          expect(state.patientData[patientId].length).to.equal(patientData.length);
          expect(state.patientData[patientId][0].id).to.equal(patientData[0].id);
          expect(state.patientData[patientId][1].id).to.equal(patientData[1].id);
        });
      });
    });

    describe('fetchPendingInvites', () => {
      describe('request', () => {
        it('should set fetchingPendingInvites to be true', () => {
          let action = actions.sync.fetchPendingInvitesRequest(); 

          expect(initialState.working.fetchingPendingInvites).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.fetchingPendingInvites).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPendingInvites to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPendingInvites: true} });
          let error = 'Oh no, did not work!!';
          let action = actions.sync.fetchPendingInvitesFailure(error);

          expect(initialStateForTest.working.fetchingPendingInvites).to.be.true;
          expect(initialStateForTest.error).to.be.null;
          expect(initialStateForTest.pendingInvites).to.be.empty;

          let state = reducer(initialStateForTest, action);

          expect(state.working.fetchingPendingInvites).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
          expect(state.pendingInvites).to.be.empty;
        });
      });

      describe('success', () => {
        it('should set fetchingPendingInvites to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPendingInvites: true} });
          let pendingInvites = [
            { id: 1167 },
            { id: 11 }
          ];
          let action = actions.sync.fetchPendingInvitesSuccess(pendingInvites);

          expect(initialStateForTest.working.fetchingPendingInvites).to.be.true;
          expect(initialStateForTest.pendingInvites).to.be.empty;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingPendingInvites).to.be.false;
          expect(state.pendingInvites.length).to.equal(2);
          expect(state.pendingInvites[0].id).to.equal(pendingInvites[0].id);
          expect(state.pendingInvites[1].id).to.equal(pendingInvites[1].id);
        });
      });
    });

    describe('fetchPendingMemberships', () => {
      describe('request', () => {
        it('should set fetchingPendingMemberships to be true', () => {
          let action = actions.sync.fetchPendingMembershipsRequest(); 

          expect(initialState.working.fetchingPendingMemberships).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.fetchingPendingMemberships).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPendingMemberships to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPendingMemberships: true} });
          let error = 'Oh no, did not get pending memeberships!!';
          let action = actions.sync.fetchPendingMembershipsFailure(error);

          expect(initialStateForTest.working.fetchingPendingMemberships).to.be.true;
          expect(initialStateForTest.error).to.be.null;
          expect(initialStateForTest.pendingMemberships).to.be.empty;

          let state = reducer(initialStateForTest, action);

          expect(state.working.fetchingPendingMemberships).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
          expect(state.pendingMemberships).to.be.empty;
        });
      });

      describe('success', () => {
        it('should set fetchingPendingMemberships to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPendingMemberships: true} });
          let pendingMemberships = [
            { id: 204 },
            { id: 1 }
          ];
          let action = actions.sync.fetchPendingMembershipsSuccess(pendingMemberships);

          expect(initialStateForTest.working.fetchingPendingMemberships).to.be.true;
          expect(initialStateForTest.pendingMemberships).to.be.empty;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingPendingMemberships).to.be.false;
          expect(state.pendingMemberships.length).to.equal(2);
          expect(state.pendingMemberships[0].id).to.equal(pendingMemberships[0].id);
          expect(state.pendingMemberships[1].id).to.equal(pendingMemberships[1].id);
        });
      });
    });

    describe('fetchMessageThread', () => {
      describe('request', () => {
        it('should set fetchingMessageThread to be true', () => {
          let action = actions.sync.fetchMessageThreadRequest(); 

          expect(initialState.working.fetchingMessageThread).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.fetchingMessageThread).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingMessageThread to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingMessageThread: true} });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.fetchMessageThreadFailure(error);
          
          expect(initialStateForTest.working.fetchingMessageThread).to.be.true;
          expect(initialStateForTest.error).to.be.null;
          expect(initialStateForTest.messageThread).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingMessageThread).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
          expect(state.messageThread).to.be.null;
        });
      });

      describe('success', () => {
        it('should set fetchingMessageThread to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingMessageThread: true} });
          let messageThread = 'some message thread';
          let action = actions.sync.fetchMessageThreadSuccess(messageThread);

          expect(initialStateForTest.working.fetchingMessageThread).to.be.true;
          expect(initialStateForTest.messageThread).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingMessageThread).to.be.false;
          expect(state.messageThread).to.equal(messageThread);
        });
      });
    });

    describe('createPatient', () => {
      describe('request', () => {
        it('should set creatingPatient to be true', () => {
          let action = actions.sync.createPatientRequest(); 

          expect(initialState.working.creatingPatient.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.creatingPatient.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set creatingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            working: { 
              creatingPatient: {
                inProgress: true,
                notification: null
              }
            } 
          });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.createPatientFailure(error);
          
          expect(initialStateForTest.working.creatingPatient.inProgress).to.be.true;
          expect(initialStateForTest.error).to.be.null;
          expect(initialStateForTest.currentPatientInView).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.creatingPatient.inProgress).to.be.false;
          expect(state.working.creatingPatient.notification.type).to.equal('error');
          expect(state.working.creatingPatient.notification.message).to.equal(error);
          expect(state.currentPatientInView).to.be.null;
        });
      });

      describe('success', () => {
        it('should set creatingPatient to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, {
            working: { 
              creatingPatient: {
                inProgress: true,
                notification: null
              }
            } 
          });
          let patient = 'Patient!';
          let action = actions.sync.createPatientSuccess(patient);

          expect(initialStateForTest.working.creatingPatient.inProgress).to.be.true;
          expect(initialStateForTest.currentPatientInView).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.creatingPatient.inProgress).to.be.false;
          expect(state.currentPatientInView).to.equal(patient);
        });
      });
    });

    describe('removePatient', () => {
      describe('request', () => {
        it('should set removingPatient to be true', () => {
          let action = actions.sync.removePatientRequest(); 

          expect(initialState.working.removingPatient).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.removingPatient).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set removingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { removingPatient: true} });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.removePatientFailure(error);
          
          expect(initialStateForTest.working.removingPatient).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.removingPatient).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set removingPatient to be false', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { removingPatient: true} });
          let patientId = 15;
          let action = actions.sync.removePatientSuccess(patientId);

          expect(initialStateForTest.working.removingPatient).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.removingPatient).to.be.false;
        });
      });
    });

    describe('removePatient', () => {
      describe('request', () => {
        it('should set removingPatient to be true', () => {
          let action = actions.sync.removePatientRequest(); 

          expect(initialState.working.removingPatient).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.removingPatient).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set removingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { removingPatient: true} });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.removePatientFailure(error);
          
          expect(initialStateForTest.working.removingPatient).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.removingPatient).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set removingPatient to be false', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { removingPatient: true} });
          let patientId = 15;
          let action = actions.sync.removePatientSuccess(patientId);

          expect(initialStateForTest.working.removingPatient).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.removingPatient).to.be.false;
        });
      });
    });

    describe('removePatient', () => {
      describe('request', () => {
        it('should set removingPatient to be true', () => {
          let action = actions.sync.removePatientRequest(); 

          expect(initialState.working.removingPatient).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.removingPatient).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set removingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { removingPatient: true} });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.removePatientFailure(error);
          
          expect(initialStateForTest.working.removingPatient).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.removingPatient).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set removingPatient to be false', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { removingPatient: true} });
          let patientId = 15;
          let action = actions.sync.removePatientSuccess(patientId);

          expect(initialStateForTest.working.removingPatient).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.removingPatient).to.be.false;
        });
      });
    });

    describe('removeMember', () => {
      describe('request', () => {
        it('should set removingMember to be true', () => {
          let action = actions.sync.removeMemberRequest(); 

          expect(initialState.working.removingMember.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.removingMember.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set removingMember to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { 
            working: { 
              removingMember: { 
                inProgress: true, 
                notification: null
              }
            } 
          });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.removeMemberFailure(error);
          
          expect(initialStateForTest.working.removingMember.inProgress).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.removingMember.inProgress).to.be.false;
          expect(state.working.removingMember.notification.type).to.equal('error');
          expect(state.working.removingMember.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set removingMember to be false', () => {
          let initialStateForTest = _.merge({}, initialState, { 
            working: { 
              removingMember: { 
                inProgress: true, 
                notification: null
              }
            } 
          });
          let memberId = 15;
          let action = actions.sync.removeMemberSuccess(memberId);

          expect(initialStateForTest.working.removingMember.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.removingMember.inProgress).to.be.false;
        });
      });
    });

    describe('sendInvitation', () => {
      describe('request', () => {
        it('should set sendingInvitation to be true', () => {
          let action = actions.sync.sendInvitationRequest(); 

          expect(initialState.working.sendingInvitation.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.sendingInvitation.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set sendingInvitation to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { 
            working: { 
              sendingInvitation: {
                inProgress: true,
                notification: null
              }
            } 
          });
          let error = ErrorMessages.STANDARD;

          let action = actions.sync.sendInvitationFailure(error);
          
          expect(initialStateForTest.working.sendingInvitation.inProgress).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.sendingInvitation.inProgress).to.be.false;
          expect(state.working.sendingInvitation.notification.type).to.equal('error');
          expect(state.working.sendingInvitation.notification.message).to.equal(ErrorMessages.STANDARD);
        });
      });

      describe('success', () => {
        it('should set sendingInvitation to be false', () => {
          let pendingInvites = [
            { email: 'a@a.com', permissions: 'bar'}
          ];

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { 
              working: { 
                sendingInvitation: {
                  inProgress: true,
                  notification: false
                }
              },
              pendingInvites: pendingInvites
          });
          
          let invitation = { email: 'f@f.com', permissions: 'foo' };
          let action = actions.sync.sendInvitationSuccess(invitation);

          expect(initialStateForTest.working.sendingInvitation.inProgress).to.be.true;
          expect(initialStateForTest.pendingInvites.length).to.equal(pendingInvites.length);

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.sendingInvitation.inProgress).to.be.false;

          expect(state.pendingInvites.length).to.equal(pendingInvites.length + 1);
          expect(state.pendingInvites[0].email).to.equal(pendingInvites[0].email);
          expect(state.pendingInvites[0].permissions).to.equal(pendingInvites[0].permissions);
          expect(state.pendingInvites[1].email).to.equal(invitation.email);
          expect(state.pendingInvites[1].permissions).to.equal(invitation.permissions);
        });
      });
    });

    describe('cancelInvitation', () => {
      describe('request', () => {
        it('should set cancellingInvitation to be true', () => {
          let action = actions.sync.cancelInvitationRequest(); 

          expect(initialState.working.cancellingInvitation.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.cancellingInvitation.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set cancellingInvitation to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { 
            working: { 
              cancellingInvitation: { 
                inProgress: true, 
                notification: null
              }
            } 
          });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.cancelInvitationFailure(error);
          
          expect(initialStateForTest.working.cancellingInvitation.inProgress).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.cancellingInvitation.inProgress).to.be.false;
          expect(state.working.cancellingInvitation.notification.type).to.equal('error');
          expect(state.working.cancellingInvitation.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set cancellingInvitation to be false', () => {
          let pendingInvites = [
            { email: 'a@a.com', permissions: 'bar'},
            { email: 'f@f.com', permissions: 'foo' }
          ];

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { 
              working: { 
                cancellingInvitation: { 
                  inProgress: true, 
                  notification: null
                }
              },
              pendingInvites: pendingInvites
          });
          
          let invitation = { email: 'f@f.com', permissions: 'foo' };
          let action = actions.sync.cancelInvitationSuccess(invitation.email);

          expect(initialStateForTest.working.cancellingInvitation.inProgress).to.be.true;
          expect(initialStateForTest.pendingInvites.length).to.equal(pendingInvites.length);

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.cancellingInvitation.inProgress).to.be.false;

          expect(state.pendingInvites.length).to.equal(pendingInvites.length - 1);
          expect(state.pendingInvites[0].email).to.equal(pendingInvites[0].email);
          expect(state.pendingInvites[0].permissions).to.equal(pendingInvites[0].permissions);
        });
      });
    });

    describe('setMemberPermissions', () => {
      describe('request', () => {
        it('should set settingMemberPermissions to be true', () => {
          let action = actions.sync.setMemberPermissionsRequest(); 

          expect(initialState.working.settingMemberPermissions.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.settingMemberPermissions.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set settingMemberPermissions to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, 
            { working: 
              { 
                settingMemberPermissions: {
                  inProgress: true,
                  notification: null
                }
              } 
            }
          );
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.setMemberPermissionsFailure(error);
          
          expect(initialStateForTest.working.settingMemberPermissions.inProgress).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.settingMemberPermissions.inProgress).to.be.false;
          expect(state.working.settingMemberPermissions.notification.type).to.equal('error');
          expect(state.working.settingMemberPermissions.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set settingMemberPermissions to be false', () => {
          let pendingMemberships = [
            { key: 'foo', creator: { userid: 500, name: 'Frank' } },
            { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
          ];

          let patients = [
            { userid: 506, name: 'Alice' }
          ];

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { 
              working: { 
                settingMemberPermissions: {
                  inProgress: true,
                  notification: null
                }
              }
          });
          
          let action = actions.sync.setMemberPermissionsSuccess(pendingMemberships[0]);

          expect(initialStateForTest.working.settingMemberPermissions.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.settingMemberPermissions.inProgress).to.be.false;
        });
      });
    });

    describe('acceptMembership', () => {
      describe('request', () => {
        it('should set acceptingMembership to be true', () => {
          let action = actions.sync.acceptMembershipRequest(); 

          expect(initialState.working.acceptingMembership).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.acceptingMembership).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set acceptingMembership to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { acceptingMembership: true} });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.acceptMembershipFailure(error);
          
          expect(initialStateForTest.working.acceptingMembership).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.acceptingMembership).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set acceptingMembership to be false', () => {
          let pendingMemberships = [
            { key: 'foo', creator: { userid: 500, name: 'Frank' } },
            { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
          ];

          let patients = [
            { userid: 506, name: 'Alice' }
          ];

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { 
              working: { 
                acceptingMembership: true
              },
              pendingMemberships: pendingMemberships,
              patients: patients
          });
          
          let action = actions.sync.acceptMembershipSuccess(pendingMemberships[0]);

          expect(initialStateForTest.working.acceptingMembership).to.be.true;
          expect(initialStateForTest.pendingMemberships.length).to.equal(pendingMemberships.length);
          expect(initialStateForTest.patients.length).to.equal(patients.length);

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.acceptingMembership).to.be.false;

          expect(state.pendingMemberships.length).to.equal(pendingMemberships.length - 1);
          expect(state.pendingMemberships[0].key).to.equal(pendingMemberships[1].key);
          expect(state.pendingMemberships[0].creator.userid).to.equal(pendingMemberships[1].creator.userid);

          expect(state.patients.length).to.equal(patients.length + 1);
        });
      });
    });

    describe('dismissMembership', () => {
      describe('request', () => {
        it('should set dismissingMembership to be true', () => {
          let action = actions.sync.dismissMembershipRequest(); 

          expect(initialState.working.dismissingMembership).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.dismissingMembership).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set dismissingMembership to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { dismissingMembership: true} });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.dismissMembershipFailure(error);
          
          expect(initialStateForTest.working.dismissingMembership).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.dismissingMembership).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set dismissingMembership to be false', () => {
          let pendingMemberships = [
            { key: 'foo', creator: { userid: 500, name: 'Frank' } },
            { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
          ];

          let patients = [
            { userid: 506, name: 'Alice' }
          ];

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { 
              working: { 
                dismissingMembership: true
              },
              pendingMemberships: pendingMemberships,
              patients: patients
          });
          
          let action = actions.sync.dismissMembershipSuccess(pendingMemberships[0]);

          expect(initialStateForTest.working.dismissingMembership).to.be.true;
          expect(initialStateForTest.pendingMemberships.length).to.equal(pendingMemberships.length);
          expect(initialStateForTest.patients.length).to.equal(patients.length);

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.dismissingMembership).to.be.false;

          expect(state.pendingMemberships.length).to.equal(pendingMemberships.length - 1);
          expect(state.pendingMemberships[0].key).to.equal(pendingMemberships[1].key);
          expect(state.pendingMemberships[0].creator.userid).to.equal(pendingMemberships[1].creator.userid);

          expect(state.patients.length).to.equal(patients.length);
        });
      });
    });

    describe('updatePatient', () => {
      describe('request', () => {
        it('should set updatingPatient to be true', () => {
          let action = actions.sync.updatePatientRequest(); 

          expect(initialState.working.updatingPatient).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.updatingPatient).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set updatingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { updatingPatient: true} });
          let error = 'Oh no, did not update patient!!';
          let action = actions.sync.updatePatientFailure(error);
          
          expect(initialStateForTest.working.updatingPatient).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.updatingPatient).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set updatingPatient to be false', () => {
          let currentPatient = { userid: 506, name: 'Alice' };
          let updatedPatient = { userid: 506, name: 'Alice Cooper' };

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { 
              working: { 
                updatingPatient: true
              },
              currentPatientInView: currentPatient
          });
          
          let action = actions.sync.updatePatientSuccess(updatedPatient);

          expect(initialStateForTest.working.updatingPatient).to.be.true;
          expect(initialStateForTest.currentPatientInView.userid).to.equal(currentPatient.userid);
          expect(initialStateForTest.currentPatientInView.name).to.equal(currentPatient.name);

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.updatingPatient).to.be.false;

          expect(state.currentPatientInView.userid).to.equal(updatedPatient.userid);
          expect(state.currentPatientInView.name).to.equal(updatedPatient.name);
        });
      });
    });

    describe('updateUser', () => {
      describe('request', () => {
        it('should set updatingUser to be true', () => {
          let updatingUser = { id: 506, name: 'Jimmy Hendrix' };
          let action = actions.sync.updateUserRequest(updatingUser); 

          expect(initialState.working.updatingUser).to.be.false;
          expect(initialState.loggedInUser).to.be.null;

          let state = reducer(initialState, action);
          expect(state.working.updatingUser).to.be.true;
          expect(state.loggedInUser.id).to.equal(updatingUser.id);
          expect(state.loggedInUser.name).to.equal(updatingUser.name);
        });
      });

      describe('failure', () => {
        it('should set updatingUser to be false and set error', () => {
          
          let initialStateForTest = _.merge({}, initialState, { working: { updatingUser: true} });
          let error = 'Oh no, did not update patient!!';
          let action = actions.sync.updateUserFailure(error);
          
          expect(initialStateForTest.working.updatingUser).to.be.true;
          expect(initialStateForTest.error).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.updatingUser).to.be.false;
          expect(state.notification.type).to.equal('error');
          expect(state.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set updatingUser to be false', () => {
          let loggedInUser = { id: 506, name: 'Jimmy' };
          let updatedUser = { id: 506, name: 'Jimmy Hendrix' };

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { 
              working: { 
                updatingUser: true
              },
              loggedInUser: loggedInUser
          });
          
          let action = actions.sync.updateUserSuccess(updatedUser);

          expect(initialStateForTest.working.updatingUser).to.be.true;
          expect(initialStateForTest.loggedInUser.id).to.equal(loggedInUser.id);
          expect(initialStateForTest.loggedInUser.name).to.equal(loggedInUser.name);

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.updatingUser).to.be.false;

          expect(state.loggedInUser.id).to.equal(updatedUser.id);
          expect(state.loggedInUser.name).to.equal(updatedUser.name);
        });
      });
    });
  });
});
