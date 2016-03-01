/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */
import _ from 'lodash';

import reducer from '../../../../app/redux/reducers/working';
import actions from '../../../../app/redux/actions/index';
import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { working as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('working', () => {
  describe('acknowledgeNotification', () => {
    it('should set state.fetchingUser.notification to null when called with "fetchingUser"', () => {
      let initialStateForTest = _.merge({}, initialState, { fetchingUser: { notification: { message: 'foo' } } });
      let action = actions.sync.acknowledgeNotification('fetchingUser')

      expect(initialStateForTest.fetchingUser.notification.message).to.equal('foo');

      let state = reducer(initialStateForTest, action);
      expect(state.fetchingUser.notification).to.be.null;
    });
  });

  describe('access', () => {
    describe('login', () => {
      describe('request', () => {
        it('should set working.loggingIn to be true', () => {
          let action = actions.sync.loginRequest();
          expect(initialState.loggingIn.inProgress).to.be.false;

          let state = reducer(initialState, action);

          console.log('login!', state);
          expect(state.loggingIn.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set working.loggingIn to be false', () => {
          let error = 'Something bad happened';

          let requestAction = actions.sync.loginRequest();
          expect(initialState.loggingIn.inProgress).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.loggingIn.inProgress).to.be.true;

          let failureAction = actions.sync.loginFailure(error);
          let state = reducer(intermediateState, failureAction);
          expect(state.loggingIn.inProgress).to.be.false;
          expect(state.loggingIn.notification.type).to.equal('error');
          expect(state.loggingIn.notification.message).to.equal(error);
        });

        it('should set working.loggingIn to be false', () => {
          let error = 'Something bad happened';

          let requestAction = actions.sync.loginRequest();
          expect(initialState.loggingIn.inProgress).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.loggingIn.inProgress).to.be.true;

          let failureAction = actions.sync.loginFailure(error, { isLoggedIn: false, emailVerificationSent: false });
          let state = reducer(intermediateState, failureAction);
          expect(state.loggingIn.inProgress).to.be.false;
          expect(state.loggingIn.notification.type).to.equal('error');
          expect(state.loggingIn.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set working.loggingIn.inProgress to be false', () => {
          let user = 'user'

          let requestAction = actions.sync.loginRequest();
          expect(initialState.loggingIn.inProgress).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.loggingIn.inProgress).to.be.true;

          let successAction = actions.sync.loginSuccess(user);
          let state = reducer(intermediateState, successAction);
          expect(state.loggingIn.inProgress).to.be.false;
        });
      });
    });

    describe('logout', () => {
      describe('request', () => {
        it('should set working.loggingOut.inProgress to be true', () => {
          let action = actions.sync.logoutRequest();
          expect(initialState.loggingOut.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.loggingOut.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set working.loggingOut.inProgress to be false', () => {
          let error = 'Something bad happened';

          let requestAction = actions.sync.logoutRequest();
          expect(initialState.loggingOut.inProgress).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.loggingOut.inProgress).to.be.true;

          let failureAction = actions.sync.logoutFailure(error);
          let state = reducer(intermediateState, failureAction);
          expect(state.loggingOut.inProgress).to.be.false;
          expect(state.loggingOut.notification.type).to.equal('error');
          expect(state.loggingOut.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set working.loggingOut.inProgress to be false', () => {
          let user = 'user';

          let requestAction = actions.sync.logoutRequest();
          expect(initialState.loggingOut.inProgress).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.loggingOut.inProgress).to.be.true;

          let successAction = actions.sync.logoutSuccess(user);
          let state = reducer(intermediateState, successAction);
          expect(state.loggingOut.inProgress).to.be.false;
        });
      });
    });
  });

  describe('signup', () => {
    describe('request', () => {
      it('should set working.signingUp.inProgress to be true', () => {
        let action = actions.sync.signupRequest();
        expect(initialState.signingUp.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.signingUp.inProgress).to.be.true;
      });
    });

    describe('failure', () => {
      it('should set working.signingUp.inProgress to be false', () => {
        let error = 'Something bad happened when signing up';

        let requestAction = actions.sync.signupRequest();
        expect(initialState.signingUp.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.signingUp.inProgress).to.be.true;

        let failureAction = actions.sync.signupFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.signingUp.inProgress).to.be.false;
        expect(state.signingUp.notification.type).to.equal('error');
        expect(state.signingUp.notification.message).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.signingUp.inProgress to be false', () => {
        let user = 'user';

        let requestAction = actions.sync.signupRequest();
        
        expect(initialState.signingUp.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.signingUp.inProgress).to.be.true;

        let successAction = actions.sync.signupSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.signingUp.inProgress).to.be.false;
      });
    });
  });

  describe('confirmSignup', () => {
    describe('request', () => {
      it('should set working.confirmingSignup.inProgress to be true', () => {
        let action = actions.sync.confirmSignupRequest();
        expect(initialState.confirmingSignup.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.confirmingSignup.inProgress).to.be.true;
      });
    });

    describe('failure', () => {
      it('should set working.confirmingSignup.inProgress to be false', () => {
        let error = 'Something bad happened when signing up';

        let requestAction = actions.sync.confirmSignupRequest();
        expect(initialState.confirmingSignup.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.confirmingSignup.inProgress).to.be.true;

        let failureAction = actions.sync.confirmSignupFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.confirmingSignup.inProgress).to.be.false;
        expect(state.confirmingSignup.notification.type).to.equal('error');
        expect(state.confirmingSignup.notification.message).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.confirmingSignup.inProgress to be false', () => {
        let user = 'user';

        let requestAction = actions.sync.confirmSignupRequest();
        
        expect(initialState.confirmingSignup.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.confirmingSignup.inProgress).to.be.true;

        let successAction = actions.sync.confirmSignupSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.confirmingSignup.inProgress).to.be.false;
      });
    });
  });

  describe('confirmPasswordReset', () => {
    describe('request', () => {
      it('should set working.confirmingPasswordReset.inProgress to be true', () => {
        let action = actions.sync.confirmPasswordResetRequest();
        expect(initialState.confirmingPasswordReset.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.confirmingPasswordReset.inProgress).to.be.true;
      });
    });

    describe('failure', () => {
      it('should set working.confirmingPasswordReset.inProgress to be false', () => {
        let error = 'Something bad happened when signing up';

        let requestAction = actions.sync.confirmPasswordResetRequest();
        expect(initialState.confirmingPasswordReset.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.confirmingPasswordReset.inProgress).to.be.true;

        let failureAction = actions.sync.confirmPasswordResetFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.confirmingPasswordReset.inProgress).to.be.false;
        expect(state.confirmingPasswordReset.notification.type).to.equal('error');
        expect(state.confirmingPasswordReset.notification.message).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.confirmingPasswordReset.inProgress to be false', () => {
        let user = 'user';

        let requestAction = actions.sync.confirmPasswordResetRequest();
        
        expect(initialState.confirmingPasswordReset.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.confirmingPasswordReset.inProgress).to.be.true;

        let successAction = actions.sync.confirmPasswordResetSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.confirmingPasswordReset.inProgress).to.be.false;
      });
    });
  });

  describe('acceptTerms', () => {
    describe('request', () => {
      it('should set working.acceptingTerms.inProgress to be true', () => {
        let action = actions.sync.acceptTermsRequest(); 

        expect(initialState.acceptingTerms.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.acceptingTerms.inProgress).to.be.true;
      });
    });

    describe('failure', () => {
      it('should set working.acceptingTerms.inProgress to be false', () => {
        let error = 'Something bad happened when signing up';

        let requestAction = actions.sync.acceptTermsRequest();
        expect(initialState.acceptingTerms.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.acceptingTerms.inProgress).to.be.true;

        let failureAction = actions.sync.acceptTermsFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.acceptingTerms.inProgress).to.be.false;
        expect(state.acceptingTerms.notification.type).to.equal('error');
        expect(state.acceptingTerms.notification.message).to.equal(error);
      });
    });

    describe('success', () => {
      it('should set working.acceptingTerms.inProgress to be false', () => {
        let termsAccepted = '2015-02-01';

        let user = { termsAccepted: false };

        let requestAction = actions.sync.acceptTermsRequest();
        
        expect(initialState.acceptingTerms.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.acceptingTerms.inProgress).to.be.true;

        let successAction = actions.sync.acceptTermsSuccess(termsAccepted);
        let state = reducer(intermediateState, successAction);

        expect(state.acceptingTerms.inProgress).to.be.false;
      });
    });
  });

  describe('fetchers', () => {
    describe('fetchUser', () => {
      describe('request', () => {
        it('should set fetchingUser to be true', () => {
          let action = actions.sync.fetchUserRequest(); 

          expect(initialState.fetchingUser.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingUser.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingUser to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingUser: { inProgress : true, notification: null } });
          let error = 'Something bad happened!';
          let action = actions.sync.fetchUserFailure(error);

          expect(initialStateForTest.fetchingUser.inProgress).to.be.true;
          expect(initialStateForTest.fetchingUser.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingUser.inProgress).to.be.false;
          expect(state.fetchingUser.notification.type).to.equal('error');
          expect(state.fetchingUser.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingUser to be false', () => {
          let initialStateForTest = _.merge({}, { fetchingUser: { inProgress : true, notification: null } });
          let user = { id: 501, name: 'Jamie Blake'};
          let action = actions.sync.fetchUserSuccess(user);

          expect(initialStateForTest.fetchingUser.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.fetchingUser.inProgress).to.be.false;
        });
      });
    });

    describe('fetchPatient', () => {
      describe('request', () => {
        it('should set fetchingPatient to be true', () => {
          let action = actions.sync.fetchPatientRequest(); 

          expect(initialState.fetchingPatient.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingPatient.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingPatient: { inProgress : true, notification: null } });
          let error = 'Something else bad happened!';
          let action = actions.sync.fetchPatientFailure(error);

          expect(initialStateForTest.fetchingPatient.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPatient.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatient.inProgress).to.be.false;
          expect(state.fetchingPatient.notification.type).to.equal('error');
          expect(state.fetchingPatient.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingPatient to be false', () => {
          let initialStateForTest = _.merge({}, { fetchingPatient: { inProgress : true, notification: null } });
          let patient = { id: 2020, name: 'Megan Durrant'};
          let action = actions.sync.fetchPatientSuccess(patient);

          expect(initialStateForTest.fetchingPatient.inProgress).to.be.true;
          
          let state = reducer(initialStateForTest, action);
          
          expect(state.fetchingPatient.inProgress).to.be.false;
        });
      });
    });

    describe('fetchPatients', () => {
      describe('request', () => {
        it('should set fetchingPatients to be true', () => {
          let action = actions.sync.fetchPatientsRequest(); 

          expect(initialState.fetchingPatients.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingPatients.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatients to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingPatients: { inProgress : true, notification: null } });
          let error = 'Oh no!!';
          let action = actions.sync.fetchPatientsFailure(error);

          expect(initialStateForTest.fetchingPatients.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPatients.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatients.inProgress).to.be.false;
          expect(state.fetchingPatients.notification.type).to.equal('error');
          expect(state.fetchingPatients.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingPatients to be false', () => {
          let initialStateForTest = _.merge({}, { fetchingPatients: { inProgress : true, notification: null } });
          let patients = [
            { userid: 2020, name: 'Megan Durrant'},
            { userid: 501, name: 'Jamie Blake'}
          ];
          let action = actions.sync.fetchPatientsSuccess(patients);

          expect(initialStateForTest.fetchingPatients.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.fetchingPatients.inProgress).to.be.false;
        });
      });
    });

    describe('fetchPatientData', () => {
      describe('request', () => {
        it('should set fetchingPatientData to be true', () => {
          let action = actions.sync.fetchPatientDataRequest(); 

          expect(initialState.fetchingPatientData.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingPatientData.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatientData to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingPatientData: { inProgress : true, notification: null } });
          let error = 'Oh no!!';
          let action = actions.sync.fetchPatientDataFailure(error);

          expect(initialStateForTest.fetchingPatientData.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPatientData.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatientData.inProgress).to.be.false;
          expect(state.fetchingPatientData.notification.type).to.equal('error');
          expect(state.fetchingPatientData.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingPatientData to be false', () => {
          let initialStateForTest = _.merge({}, { fetchingPatientData: { inProgress : true, notification: null } });
          let patientId = 300;
          let patientData = [
            { id: 2020 },
            { id: 501 }
          ];
          let action = actions.sync.fetchPatientDataSuccess(patientId, patientData);

          expect(initialStateForTest.fetchingPatientData.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.fetchingPatientData.inProgress).to.be.false;
        });
      });
    });

    describe('fetchPendingInvites', () => {
      describe('request', () => {
        it('should set fetchingPendingInvites to be true', () => {
          let action = actions.sync.fetchPendingInvitesRequest(); 

          expect(initialState.fetchingPendingInvites.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingPendingInvites.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPendingInvites to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingPendingInvites: { inProgress : true, notification: null } });
          let error = 'Oh no, did not work!!';
          let action = actions.sync.fetchPendingInvitesFailure(error);

          expect(initialStateForTest.fetchingPendingInvites.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPendingInvites.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPendingInvites.inProgress).to.be.false;
          expect(state.fetchingPendingInvites.notification.type).to.equal('error');
          expect(state.fetchingPendingInvites.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingPendingInvites to be false and set patient', () => {
          let initialStateForTest = _.merge({}, { fetchingPendingInvites: { inProgress : true, notification: null } });
          let pendingInvites = [
            { id: 1167 },
            { id: 11 }
          ];
          let action = actions.sync.fetchPendingInvitesSuccess(pendingInvites);

          expect(initialStateForTest.fetchingPendingInvites.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.fetchingPendingInvites.inProgress).to.be.false;
        });
      });
    });

    describe('fetchPendingMemberships', () => {
      describe('request', () => {
        it('should set fetchingPendingMemberships to be true', () => {
          let action = actions.sync.fetchPendingMembershipsRequest(); 

          expect(initialState.fetchingPendingMemberships.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingPendingMemberships.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingPendingMemberships to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { fetchingPendingMemberships: { inProgress : true, notification: null } });
          let error = 'Oh no, did not get pending memeberships!!';
          let action = actions.sync.fetchPendingMembershipsFailure(error);

          expect(initialStateForTest.fetchingPendingMemberships.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPendingMemberships.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPendingMemberships.inProgress).to.be.false;
          expect(state.fetchingPendingMemberships.notification.type).to.equal('error');
          expect(state.fetchingPendingMemberships.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingPendingMemberships to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { fetchingPendingMemberships: { inProgress : true, notification: null } });
          let pendingMemberships = [
            { id: 204 },
            { id: 1 }
          ];
          let action = actions.sync.fetchPendingMembershipsSuccess(pendingMemberships);

          expect(initialStateForTest.fetchingPendingMemberships.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.fetchingPendingMemberships.inProgress).to.be.false;
        });
      });
    });

    describe('fetchMessageThread', () => {
      describe('request', () => {
        it('should set fetchingMessageThread to be true', () => {
          let action = actions.sync.fetchMessageThreadRequest(); 

          expect(initialState.fetchingMessageThread.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingMessageThread.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set fetchingMessageThread to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { fetchingMessageThread: { inProgress : true, notification: null } });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.fetchMessageThreadFailure(error);
          
          expect(initialStateForTest.fetchingMessageThread.inProgress).to.be.true;
          expect(initialStateForTest.fetchingMessageThread.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.fetchingMessageThread.inProgress).to.be.false;
          expect(state.fetchingMessageThread.notification.type).to.equal('error');
          expect(state.fetchingMessageThread.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set fetchingMessageThread to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { fetchingMessageThread: { inProgress : true, notification: null } });
          let messageThread = 'some message thread';
          let action = actions.sync.fetchMessageThreadSuccess(messageThread);

          expect(initialStateForTest.fetchingMessageThread.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.fetchingMessageThread.inProgress).to.be.false;
        });
      });
    });

    describe('createPatient', () => {
      describe('request', () => {
        it('should set creatingPatient to be true', () => {
          let action = actions.sync.createPatientRequest(); 

          expect(initialState.creatingPatient.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.creatingPatient.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set creatingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            creatingPatient: {
              inProgress: true,
              notification: null
            }
          });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.createPatientFailure(error);
          
          expect(initialStateForTest.creatingPatient.inProgress).to.be.true;
          expect(initialStateForTest.creatingPatient.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.creatingPatient.inProgress).to.be.false;
          expect(state.creatingPatient.notification.type).to.equal('error');
          expect(state.creatingPatient.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set creatingPatient to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, {
            creatingPatient: {
              inProgress: true,
              notification: null
            }
          });
          let patient = 'Patient!';
          let action = actions.sync.createPatientSuccess(patient);

          expect(initialStateForTest.creatingPatient.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.creatingPatient.inProgress).to.be.false;
        });
      });
    });

    describe('removePatient', () => {
      describe('request', () => {
        it('should set removingPatient to be true', () => {
          let action = actions.sync.removePatientRequest(); 

          expect(initialState.removingPatient.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.removingPatient.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set removingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { removingPatient: { inProgress : true, notification: null } });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.removePatientFailure(error);
          
          expect(initialStateForTest.removingPatient.inProgress).to.be.true;
          expect(initialStateForTest.removingPatient.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.removingPatient.inProgress).to.be.false;
          expect(state.removingPatient.notification.type).to.equal('error');
          expect(state.removingPatient.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set removingPatient to be false', () => {
          let initialStateForTest = _.merge({}, initialState, { removingPatient: { inProgress : true, notification: null } });
          let patientId = 15;
          let action = actions.sync.removePatientSuccess(patientId);

          expect(initialStateForTest.removingPatient.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.removingPatient.inProgress).to.be.false;
        });
      });
    });

    describe('removeMember', () => {
      describe('request', () => {
        it('should set removingMember to be true', () => {
          let action = actions.sync.removeMemberRequest(); 

          expect(initialState.removingMember.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.removingMember.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set removingMember to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { 
            removingMember: { 
              inProgress: true, 
              notification: null
            }
          });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.removeMemberFailure(error);
          
          expect(initialStateForTest.removingMember.inProgress).to.be.true;
          expect(initialStateForTest.removingMember.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.removingMember.inProgress).to.be.false;
          expect(state.removingMember.notification.type).to.equal('error');
          expect(state.removingMember.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set removingMember to be false', () => {
          let initialStateForTest = _.merge({}, initialState, { 
            removingMember: { 
              inProgress: true, 
              notification: null
            }
          });
          let memberId = 15;
          let action = actions.sync.removeMemberSuccess(memberId);

          expect(initialStateForTest.removingMember.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.removingMember.inProgress).to.be.false;
        });
      });
    });

    describe('sendInvitation', () => {
      describe('request', () => {
        it('should set sendingInvitation to be true', () => {
          let action = actions.sync.sendInvitationRequest(); 

          expect(initialState.sendingInvitation.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.sendingInvitation.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set sendingInvitation to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { 
            sendingInvitation: {
              inProgress: true,
              notification: null
            }
          });
          let error = ErrorMessages.STANDARD;

          let action = actions.sync.sendInvitationFailure(error);
          
          expect(initialStateForTest.sendingInvitation.inProgress).to.be.true;
          expect(initialStateForTest.sendingInvitation.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.sendingInvitation.inProgress).to.be.false;
          expect(state.sendingInvitation.notification.type).to.equal('error');
          expect(state.sendingInvitation.notification.message).to.equal(ErrorMessages.STANDARD);
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
              sendingInvitation: {
                inProgress: true,
                notification: false
              }
          });
          
          let invitation = { email: 'f@f.com', permissions: 'foo' };
          let action = actions.sync.sendInvitationSuccess(invitation);

          expect(initialStateForTest.sendingInvitation.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.sendingInvitation.inProgress).to.be.false;
        });
      });
    });

    describe('cancelInvitation', () => {
      describe('request', () => {
        it('should set cancellingInvitation to be true', () => {
          let action = actions.sync.cancelInvitationRequest(); 

          expect(initialState.cancellingInvitation.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.cancellingInvitation.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set cancellingInvitation to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { 
            cancellingInvitation: { 
              inProgress: true, 
              notification: null
            }
          });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.cancelInvitationFailure(error);
          
          expect(initialStateForTest.cancellingInvitation.inProgress).to.be.true;
          expect(initialStateForTest.cancellingInvitation.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.cancellingInvitation.inProgress).to.be.false;
          expect(state.cancellingInvitation.notification.type).to.equal('error');
          expect(state.cancellingInvitation.notification.message).to.equal(error);
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
              cancellingInvitation: { 
                inProgress: true, 
                notification: null
              }
          });
          
          let invitation = { email: 'f@f.com', permissions: 'foo' };
          let action = actions.sync.cancelInvitationSuccess(invitation.email);

          expect(initialStateForTest.cancellingInvitation.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.cancellingInvitation.inProgress).to.be.false;
        });
      });
    });

    describe('setMemberPermissions', () => {
      describe('request', () => {
        it('should set settingMemberPermissions to be true', () => {
          let action = actions.sync.setMemberPermissionsRequest(); 

          expect(initialState.settingMemberPermissions.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.settingMemberPermissions.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set settingMemberPermissions to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, 
            { 
              settingMemberPermissions: {
                inProgress: true,
                notification: null
              }
            } 
          );
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.setMemberPermissionsFailure(error);
          
          expect(initialStateForTest.settingMemberPermissions.inProgress).to.be.true;
          expect(initialStateForTest.settingMemberPermissions.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.settingMemberPermissions.inProgress).to.be.false;
          expect(state.settingMemberPermissions.notification.type).to.equal('error');
          expect(state.settingMemberPermissions.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set settingMemberPermissions to be false', () => {
          let pendingMemberships = [
            { key: 'foo', creator: { userid: 500, name: 'Frank' } },
            { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
          ];

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { 
              settingMemberPermissions: {
                inProgress: true,
                notification: null
              }
            }
          );
          
          let action = actions.sync.setMemberPermissionsSuccess(pendingMemberships[0]);

          expect(initialStateForTest.settingMemberPermissions.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.settingMemberPermissions.inProgress).to.be.false;
        });
      });
    });

    describe('acceptMembership', () => {
      describe('request', () => {
        it('should set acceptingMembership to be true', () => {
          let action = actions.sync.acceptMembershipRequest(); 

          expect(initialState.acceptingMembership.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.acceptingMembership.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set acceptingMembership to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { acceptingMembership: { inProgress : true, notification: null } });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.acceptMembershipFailure(error);
          
          expect(initialStateForTest.acceptingMembership.inProgress).to.be.true;
          expect(initialStateForTest.acceptingMembership.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.acceptingMembership.inProgress).to.be.false;
          expect(state.acceptingMembership.notification.type).to.equal('error');
          expect(state.acceptingMembership.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set acceptingMembership to be false', () => {
          let pendingMemberships = [
            { key: 'foo', creator: { userid: 500, name: 'Frank' } },
            { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
          ];

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { acceptingMembership: { inProgress : true, notification: null }
          });
          
          let action = actions.sync.acceptMembershipSuccess(pendingMemberships[0]);

          expect(initialStateForTest.acceptingMembership.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.acceptingMembership.inProgress).to.be.false;
        });
      });
    });

    describe('dismissMembership', () => {
      describe('request', () => {
        it('should set dismissingMembership to be true', () => {
          let action = actions.sync.dismissMembershipRequest(); 

          expect(initialState.dismissingMembership.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.dismissingMembership.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set dismissingMembership to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { dismissingMembership: { inProgress : true, notification: null } });
          let error = 'Oh no, did not get a message thread!!';
          let action = actions.sync.dismissMembershipFailure(error);
          
          expect(initialStateForTest.dismissingMembership.inProgress).to.be.true;
          expect(initialStateForTest.dismissingMembership.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.dismissingMembership.inProgress).to.be.false;
          expect(state.dismissingMembership.notification.type).to.equal('error');
          expect(state.dismissingMembership.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set dismissingMembership to be false', () => {
          let pendingMemberships = [
            { key: 'foo', creator: { userid: 500, name: 'Frank' } },
            { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
          ];

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { dismissingMembership: { inProgress : true, notification: null }
          });
          
          let action = actions.sync.dismissMembershipSuccess(pendingMemberships[0]);

          expect(initialStateForTest.dismissingMembership.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.dismissingMembership.inProgress).to.be.false;
        });
      });
    });

    describe('updatePatient', () => {
      describe('request', () => {
        it('should set updatingPatient to be true', () => {
          let action = actions.sync.updatePatientRequest(); 

          expect(initialState.updatingPatient.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.updatingPatient.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set updatingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { updatingPatient: { inProgress : true, notification: null } });
          let error = 'Oh no, did not update patient!!';
          let action = actions.sync.updatePatientFailure(error);
          
          expect(initialStateForTest.updatingPatient.inProgress).to.be.true;
          expect(initialStateForTest.updatingPatient.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.updatingPatient.inProgress).to.be.false;
          expect(state.updatingPatient.notification.type).to.equal('error');
          expect(state.updatingPatient.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set updatingPatient to be false', () => {
          let currentPatient = { userid: 506, name: 'Alice' };
          let updatedPatient = { userid: 506, name: 'Alice Cooper' };

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { updatingPatient: { inProgress : true, notification: null }
          });
          
          let action = actions.sync.updatePatientSuccess(updatedPatient);

          expect(initialStateForTest.updatingPatient.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.updatingPatient.inProgress).to.be.false;
        });
      });
    });

    describe('updateUser', () => {
      describe('request', () => {
        it('should set updatingUser to be true', () => {
          let updatingUser = { id: 506, name: 'Jimmy Hendrix' };

          let user = { id: 506 };

          let initialStateForTest = _.merge({}, initialState, { loggedInUser:  user });
          let action = actions.sync.updateUserRequest(updatingUser); 

          expect(initialStateForTest.updatingUser.inProgress).to.be.false;

          let state = reducer(initialStateForTest, action);
          expect(state.updatingUser.inProgress).to.be.true;
        });
      });

      describe('failure', () => {
        it('should set updatingUser to be false and set error', () => {
          
          let initialStateForTest = _.merge({}, initialState, { updatingUser: { inProgress : true, notification: null } });
          let error = 'Oh no, did not update patient!!';
          let action = actions.sync.updateUserFailure(error);
          
          expect(initialStateForTest.updatingUser.inProgress).to.be.true;
          expect(initialStateForTest.updatingUser.notification).to.be.null;

          let state = reducer(initialStateForTest, action);
          
          expect(state.updatingUser.inProgress).to.be.false;
          expect(state.updatingUser.notification.type).to.equal('error');
          expect(state.updatingUser.notification.message).to.equal(error);
        });
      });

      describe('success', () => {
        it('should set updatingUser to be false', () => {
          let loggedInUser = { id: 506, name: 'Jimmy' };
          let updatedUser = { id: 506, name: 'Jimmy Hendrix' };

          let initialStateForTest = _.merge(
            {}, 
            initialState, 
            { updatingUser: { inProgress : true, notification: null }
          });
          
          let action = actions.sync.updateUserSuccess(updatedUser);

          expect(initialStateForTest.updatingUser.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);
          
          expect(state.updatingUser.inProgress).to.be.false;
        });
      });
    });
  });
});
