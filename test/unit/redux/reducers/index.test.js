/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import reducer from '../../../../app/redux/reducers/index';

import actions from '../../../../app/redux/actions/index';

import initialState from '../../../../app/redux/reducers/initialState';


var expect = chai.expect;

describe('reducers', () => {
  describe('acknowledgeError', () => {
    it('should set error to null', () => {
      let initialStateForTest = _.merge({}, initialState, { error: 'foo' });
      let action = actions.sync.acknowledgeError()

      expect(initialStateForTest.error).to.equal('foo');

      let state = reducer(initialStateForTest, action);
      expect(state.error).to.be.null;
    });
  });

  describe('access', () => {
    describe('login', () => {
      describe('request', () => {
        it('should set working.loggingIn to be true', () => {
          let action = actions.sync.loginRequest();
          expect(initialState.working.loggingIn).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.loggingIn).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set working.loggingIn to be false', () => {
          let error = 'Something bad happened';

          let requestAction = actions.sync.loginRequest();
          expect(initialState.working.loggingIn).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.working.loggingIn).to.be.true;

          let failureAction = actions.sync.loginFailure(error);
          let state = reducer(intermediateState, failureAction);
          expect(state.working.loggingIn).to.be.false;
          expect(state.error).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set working.loggingIn to be false and set user', () => {
          let user = 'user'

          let requestAction = actions.sync.loginRequest();
          expect(initialState.working.loggingIn).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.working.loggingIn).to.be.true;

          let successAction = actions.sync.loginSuccess(user);
          let state = reducer(intermediateState, successAction);
          expect(state.working.loggingIn).to.be.false;
          expect(state.isLoggedIn).to.be.true;
          expect(state.user).to.equal(user);
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
          expect(state.error).to.equal(error);
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
          expect(state.user).to.equal(null);
          expect(state.currentPatient).to.equal(null);
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
        expect(state.error).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.signingUp to be false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.signupRequest();
        
        expect(initialState.working.signingUp).to.be.false;
        expect(initialState.working.loggingIn).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.signingUp).to.be.true;

        let successAction = actions.sync.signupSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.working.signingUp).to.be.false;
        expect(state.working.loggingIn).to.be.false;
        expect(state.isLoggedIn).to.be.true;
        expect(state.user).to.equal(user);
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
        expect(state.error).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.confirmingSignup to be false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.confirmSignupRequest();
        
        expect(initialState.working.confirmingSignup).to.be.false;
        expect(initialState.working.loggingIn).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.confirmingSignup).to.be.true;

        let successAction = actions.sync.confirmSignupSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.working.confirmingSignup).to.be.false;
        expect(state.working.loggingIn).to.be.false;
        expect(state.confirmedSignup).to.be.true;
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
        expect(state.error).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.acceptingTerms to be false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.acceptTermsRequest();
        
        expect(initialState.working.acceptingTerms).to.be.false;
        expect(initialState.user).to.be.null;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.acceptingTerms).to.be.true;

        let successAction = actions.sync.acceptTermsSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.working.acceptingTerms).to.be.false;
        expect(state.user).to.equal(user);
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
          expect(state.error).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingUser to be false and set user', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingUser: true} });
          let user = { id: 501, name: 'Jamie Blake'};
          let action = actions.sync.fetchUserSuccess(user);

          expect(initialStateForTest.working.fetchingUser).to.be.true;
          expect(initialStateForTest.user).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingUser).to.be.false;
          expect(state.user.id).to.equal(user.id);
          expect(state.user.name).to.equal(user.name);
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
          expect(state.error).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingPatient to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatient: true} });
          let patient = { id: 2020, name: 'Megan Durrant'};
          let action = actions.sync.fetchPatientSuccess(patient);

          expect(initialStateForTest.working.fetchingPatient).to.be.true;
          expect(initialStateForTest.patient).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingPatient).to.be.false;
          expect(state.patient.id).to.equal(patient.id);
          expect(state.patient.name).to.equal(patient.name);
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
          expect(state.error).to.equal(error);
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
          expect(state.patients.length).to.equal(2);
          expect(state.patients[0].id).to.equal(patients[0].id);
          expect(state.patients[1].id).to.equal(patients[1].id);
          expect(state.patients[0].name).to.equal(patients[0].name);
          expect(state.patients[1].name).to.equal(patients[1].name);
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
          expect(state.error).to.equal(error);
          expect(state.patientData).to.be.empty;
        });
      });

      describe('success', () => {
        it('should set fetchingPatientData to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatientData: true} });
          let patientData = [
            { id: 2020 },
            { id: 501 }
          ];
          let action = actions.sync.fetchPatientDataSuccess(patientData);

          expect(initialStateForTest.working.fetchingPatientData).to.be.true;
          expect(initialStateForTest.patientData).to.be.empty;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.fetchingPatientData).to.be.false;
          expect(state.patientData.length).to.equal(2);
          expect(state.patientData[0].id).to.equal(patientData[0].id);
          expect(state.patientData[1].id).to.equal(patientData[1].id);
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
          expect(state.error).to.equal(error);
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
          expect(state.error).to.equal(error);
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
          expect(state.error).to.equal(error);
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

          expect(initialState.working.creatingPatient).to.be.false;

          let state = reducer(initialState, action);
          expect(state.working.creatingPatient).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set creatingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { creatingPatient: true} });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.createPatientFailure(error);
          
          expect(initialStateForTest.working.creatingPatient).to.be.true;
          expect(initialStateForTest.error).to.be.null;
          expect(initialStateForTest.patient).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.creatingPatient).to.be.false;
          expect(state.error).to.equal(error);
          expect(state.patient).to.be.null;
        });
      });

      describe('success', () => {
        it('should set creatingPatient to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { working: { creatingPatient: true} });
          let patient = 'Patient!';
          let action = actions.sync.createPatientSuccess(patient);

          expect(initialStateForTest.working.creatingPatient).to.be.true;
          expect(initialStateForTest.patient).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.working.creatingPatient).to.be.false;
          expect(state.patient).to.equal(patient);
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
          expect(state.error).to.equal(error);
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
  });
});
