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

import mutationTracker from 'object-invariant-test-helper';

import reducer from '../../../../app/redux/reducers/working';
import * as actions from '../../../../app/redux/actions/index';

import initialAll from '../../../../app/redux/reducers/initialState';
const { working: initialState } = initialAll;
let tracked = mutationTracker.trackObj(initialState);

var expect = chai.expect;

describe('working', () => {
  describe('acknowledgeNotification', () => {
    it('should set state.fetchingUser.notification to null when called with "fetchingUser"', () => {
      let initialStateForTest = _.merge({}, initialState, { fetchingUser: { notification: { message: 'foo' } } });
      let tracked = mutationTracker.trackObj(initialStateForTest);
      let action = actions.sync.acknowledgeNotification('fetchingUser')

      expect(initialStateForTest.fetchingUser.notification.message).to.equal('foo');

      let state = reducer(initialStateForTest, action);
      expect(state.fetchingUser.notification).to.be.null;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should clear all notifications when no acknowledgeNotificationKey is specified', () => {
      let initialStateForTest = _.merge({}, initialState, { fetchingUser: { notification: { message: 'foo' } } });
      let tracked = mutationTracker.trackObj(initialStateForTest);
      let action = actions.sync.acknowledgeNotification()

      expect(initialStateForTest.fetchingUser.notification.message).to.equal('foo');

      let state = reducer(initialStateForTest, action);
      expect(state.fetchingUser.notification).to.be.null;
      expect(state).to.deep.equal(initialState);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });

  describe('access', () => {
    describe('login', () => {
      describe('request', () => {
        it('should set working.loggingIn to be true', () => {
          let action = actions.sync.loginRequest();
          expect(initialState.loggingIn.inProgress).to.be.false;

          let state = reducer(initialState, action);

          expect(state.loggingIn.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set working.loggingIn to be false', () => {
          let error = new Error('Something bad happened :(');

          let requestAction = actions.sync.loginRequest();
          expect(initialState.loggingIn.inProgress).to.be.false;

          let intermediateState = reducer(initialState, requestAction);
          expect(intermediateState.loggingIn.inProgress).to.be.true;

          let failureAction = actions.sync.loginFailure(error);
          let state = reducer(intermediateState, failureAction);
          expect(state.loggingIn.inProgress).to.be.false;
          expect(state.loggingIn.notification.type).to.equal('error');
          expect(state.loggingIn.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set working.signingUp.inProgress to be false', () => {
        let error = new Error('Something bad happened :(');

        let requestAction = actions.sync.signupRequest();
        expect(initialState.signingUp.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.signingUp.inProgress).to.be.true;

        let failureAction = actions.sync.signupFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.signingUp.inProgress).to.be.false;
        expect(state.signingUp.notification.type).to.equal('error');
        expect(state.signingUp.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set working.confirmingSignup.inProgress to be false', () => {
        let error = new Error('Something bad happened :(');

        let requestAction = actions.sync.confirmSignupRequest();
        expect(initialState.confirmingSignup.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.confirmingSignup.inProgress).to.be.true;

        let failureAction = actions.sync.confirmSignupFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.confirmingSignup.inProgress).to.be.false;
        expect(state.confirmingSignup.notification.type).to.equal('error');
        expect(state.confirmingSignup.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('requestPasswordReset', () => {
    describe('request', () => {
      it('should set working.requestingPasswordReset to be true', () => {
        let action = actions.sync.requestPasswordResetRequest();

        expect(initialState.requestingPasswordReset.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.requestingPasswordReset.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set working.requestingPasswordReset.inProgress to be false', () => {
        let error = new Error('Something bad happened :(');

        let requestAction = actions.sync.requestPasswordResetRequest();
        expect(initialState.requestingPasswordReset.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.requestingPasswordReset.inProgress).to.be.true;

        let failureAction = actions.sync.requestPasswordResetFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.requestingPasswordReset.inProgress).to.be.false;
        expect(state.requestingPasswordReset.notification.type).to.equal('error');
        expect(state.requestingPasswordReset.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set working.requestingPasswordReset.inProgress to be false', () => {
        let user = 'user';

        let requestAction = actions.sync.requestPasswordResetRequest();

        expect(initialState.requestingPasswordReset.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.requestingPasswordReset.inProgress).to.be.true;

        let successAction = actions.sync.requestPasswordResetSuccess(user);
        let state = reducer(intermediateState, successAction);

        expect(state.requestingPasswordReset.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set working.confirmingPasswordReset.inProgress to be false', () => {
        let error = new Error('Something bad happened :(');

        let requestAction = actions.sync.confirmPasswordResetRequest();
        expect(initialState.confirmingPasswordReset.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.confirmingPasswordReset.inProgress).to.be.true;

        let failureAction = actions.sync.confirmPasswordResetFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.confirmingPasswordReset.inProgress).to.be.false;
        expect(state.confirmingPasswordReset.notification.type).to.equal('error');
        expect(state.confirmingPasswordReset.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set working.acceptingTerms.inProgress to be false', () => {
        let error = new Error('Something bad happened :(');

        let requestAction = actions.sync.acceptTermsRequest();
        expect(initialState.acceptingTerms.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.acceptingTerms.inProgress).to.be.true;

        let failureAction = actions.sync.acceptTermsFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.acceptingTerms.inProgress).to.be.false;
        expect(state.acceptingTerms.notification.type).to.equal('error');
        expect(state.acceptingTerms.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('resendingEmailVerification', () => {
    describe('request', () => {
      it('should set the working.resendingEmailVerification.inProgress to be true', () => {
        let action = actions.sync.resendEmailVerificationRequest();

        expect(initialState.resendingEmailVerification.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.resendingEmailVerification.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set working.resendingEmailVerification.inProgress to be false', () => {
        let error = new Error('Something bad happened :(');

        let requestAction = actions.sync.resendEmailVerificationRequest();
        expect(initialState.resendingEmailVerification.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.resendingEmailVerification.inProgress).to.be.true;

        let failureAction = actions.sync.resendEmailVerificationFailure(error);
        let state = reducer(intermediateState, failureAction);
        expect(state.resendingEmailVerification.inProgress).to.be.false;
        expect(state.resendingEmailVerification.notification.type).to.equal('error');
        expect(state.resendingEmailVerification.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set working.resendingEmailVerification.inProgress to be false', () => {
        let requestAction = actions.sync.resendEmailVerificationRequest();
        expect(initialState.resendingEmailVerification.inProgress).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.resendingEmailVerification.inProgress).to.be.true;

        let successAction = actions.sync.resendEmailVerificationSuccess();
        let state = reducer(intermediateState, successAction);
        expect(state.resendingEmailVerification.inProgress).to.be.false;
        expect(state.resendingEmailVerification.notification.type).to.equal('alert');
        expect(state.resendingEmailVerification.notification.message).to.equal('We just sent you an e-mail.');
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingUser to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingUser: { inProgress : true, notification: null } });
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchUserFailure(error);

          expect(initialStateForTest.fetchingUser.inProgress).to.be.true;
          expect(initialStateForTest.fetchingUser.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingUser.inProgress).to.be.false;
          expect(state.fetchingUser.notification.type).to.equal('error');
          expect(state.fetchingUser.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingPatient: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchPatientFailure(error);

          expect(initialStateForTest.fetchingPatient.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPatient.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatient.inProgress).to.be.false;
          expect(state.fetchingPatient.notification.type).to.equal('error');
          expect(state.fetchingPatient.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set fetchingPatient to be false', () => {
          let initialStateForTest = _.merge({}, { fetchingPatient: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let patient = { id: 2020, name: 'Megan Durrant'};
          let action = actions.sync.fetchPatientSuccess(patient);

          expect(initialStateForTest.fetchingPatient.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatient.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatients to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingPatients: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchPatientsFailure(error);

          expect(initialStateForTest.fetchingPatients.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPatients.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatients.inProgress).to.be.false;
          expect(state.fetchingPatients.notification.type).to.equal('error');
          expect(state.fetchingPatients.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set fetchingPatients to be false', () => {
          let initialStateForTest = _.merge({}, { fetchingPatients: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let patients = [
            { userid: 2020, name: 'Megan Durrant'},
            { userid: 501, name: 'Jamie Blake'}
          ];
          let action = actions.sync.fetchPatientsSuccess(patients);

          expect(initialStateForTest.fetchingPatients.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatients.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingPatientData to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingPatientData: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchPatientDataFailure(error);

          expect(initialStateForTest.fetchingPatientData.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPatientData.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatientData.inProgress).to.be.false;
          expect(state.fetchingPatientData.notification.type).to.equal('error');
          expect(state.fetchingPatientData.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set fetchingPatientData to be false', () => {
          let initialStateForTest = _.merge({}, { fetchingPatientData: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let patientId = 300;
          let patientData = [
            { id: 2020 },
            { id: 501 }
          ];
          let action = actions.sync.fetchPatientDataSuccess(patientId, patientData);

          expect(initialStateForTest.fetchingPatientData.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPatientData.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('fetchPendingSentInvites', () => {
      describe('request', () => {
        it('should set fetchingPendingSentInvites to be true', () => {
          let action = actions.sync.fetchPendingSentInvitesRequest();

          expect(initialState.fetchingPendingSentInvites.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingPendingSentInvites.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingPendingSentInvites to be false and set error', () => {
          let initialStateForTest = _.merge({}, { fetchingPendingSentInvites: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchPendingSentInvitesFailure(error);

          expect(initialStateForTest.fetchingPendingSentInvites.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPendingSentInvites.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPendingSentInvites.inProgress).to.be.false;
          expect(state.fetchingPendingSentInvites.notification.type).to.equal('error');
          expect(state.fetchingPendingSentInvites.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set fetchingPendingSentInvites to be false and set patient', () => {
          let initialStateForTest = _.merge({}, { fetchingPendingSentInvites: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let pendingSentInvites = [
            { id: 1167 },
            { id: 11 }
          ];
          let action = actions.sync.fetchPendingSentInvitesSuccess(pendingSentInvites);

          expect(initialStateForTest.fetchingPendingSentInvites.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPendingSentInvites.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('fetchPendingReceivedInvites', () => {
      describe('request', () => {
        it('should set fetchingPendingReceivedInvites to be true', () => {
          let action = actions.sync.fetchPendingReceivedInvitesRequest();

          expect(initialState.fetchingPendingReceivedInvites.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.fetchingPendingReceivedInvites.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingPendingReceivedInvites to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { fetchingPendingReceivedInvites: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchPendingReceivedInvitesFailure(error);

          expect(initialStateForTest.fetchingPendingReceivedInvites.inProgress).to.be.true;
          expect(initialStateForTest.fetchingPendingReceivedInvites.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPendingReceivedInvites.inProgress).to.be.false;
          expect(state.fetchingPendingReceivedInvites.notification.type).to.equal('error');
          expect(state.fetchingPendingReceivedInvites.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set fetchingPendingReceivedInvites to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { fetchingPendingReceivedInvites: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let pendingReceivedInvites = [
            { id: 204 },
            { id: 1 }
          ];
          let action = actions.sync.fetchPendingReceivedInvitesSuccess(pendingReceivedInvites);

          expect(initialStateForTest.fetchingPendingReceivedInvites.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingPendingReceivedInvites.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingMessageThread to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { fetchingMessageThread: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchMessageThreadFailure(error);

          expect(initialStateForTest.fetchingMessageThread.inProgress).to.be.true;
          expect(initialStateForTest.fetchingMessageThread.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingMessageThread.inProgress).to.be.false;
          expect(state.fetchingMessageThread.notification.type).to.equal('error');
          expect(state.fetchingMessageThread.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set fetchingMessageThread to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, { fetchingMessageThread: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let messageThread = 'some message thread';
          let action = actions.sync.fetchMessageThreadSuccess(messageThread);

          expect(initialStateForTest.fetchingMessageThread.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingMessageThread.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('generatePDF', () => {
      describe('request', () => {
        it('should set generatingPDF to be true', () => {
          let action = actions.worker.generatePDFRequest();

          expect(initialState.generatingPDF.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.generatingPDF.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set generatingPDF to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { generatingPDF: { inProgress: true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.worker.generatePDFFailure(error);

          expect(initialStateForTest.generatingPDF.inProgress).to.be.true;
          expect(initialStateForTest.generatingPDF.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.generatingPDF.inProgress).to.be.false;
          expect(state.generatingPDF.notification.type).to.equal('error');
          expect(state.generatingPDF.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set generatingPDF from true to false', () => {
          let initialStateForTest = _.merge({}, initialState, { generatingPDF: { inProgress: true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let pdf = {};

          let action = actions.worker.generatePDFSuccess({ pdf });

          expect(initialStateForTest.generatingPDF.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.generatingPDF.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('setupDataStorage', () => {
      describe('request', () => {
        it('should set settingUpDataStorage to be true', () => {
          let action = actions.sync.setupDataStorageRequest();

          expect(initialState.settingUpDataStorage.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.settingUpDataStorage.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set settingUpDataStorage to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            settingUpDataStorage: {
              inProgress: true,
              notification: null
            }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.setupDataStorageFailure(error);

          expect(initialStateForTest.settingUpDataStorage.inProgress).to.be.true;
          expect(initialStateForTest.settingUpDataStorage.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.settingUpDataStorage.inProgress).to.be.false;
          expect(state.settingUpDataStorage.notification.type).to.equal('error');
          expect(state.settingUpDataStorage.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set settingUpDataStorage to be false and set patient', () => {
          let initialStateForTest = _.merge({}, initialState, {
            settingUpDataStorage: {
              inProgress: true,
              notification: null
            }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let patient = 'Patient!';
          let action = actions.sync.setupDataStorageSuccess(patient);

          expect(initialStateForTest.settingUpDataStorage.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.settingUpDataStorage.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('removeMembershipInOtherCareTeam', () => {
      describe('request', () => {
        it('should set removingMembershipInOtherCareTeam to be true', () => {
          let action = actions.sync.removeMembershipInOtherCareTeamRequest();

          expect(initialState.removingMembershipInOtherCareTeam.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.removingMembershipInOtherCareTeam.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set removingMembershipInOtherCareTeam to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { removingMembershipInOtherCareTeam: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.removeMembershipInOtherCareTeamFailure(error);

          expect(initialStateForTest.removingMembershipInOtherCareTeam.inProgress).to.be.true;
          expect(initialStateForTest.removingMembershipInOtherCareTeam.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.removingMembershipInOtherCareTeam.inProgress).to.be.false;
          expect(state.removingMembershipInOtherCareTeam.notification.type).to.equal('error');
          expect(state.removingMembershipInOtherCareTeam.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set removingMembershipInOtherCareTeam to be false', () => {
          let initialStateForTest = _.merge({}, initialState, { removingMembershipInOtherCareTeam: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let patientId = 15;
          let action = actions.sync.removeMembershipInOtherCareTeamSuccess(patientId);

          expect(initialStateForTest.removingMembershipInOtherCareTeam.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.removingMembershipInOtherCareTeam.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('removeMemberFromTargetCareTeam', () => {
      describe('request', () => {
        it('should set removingMemberFromTargetCareTeam to be true', () => {
          let action = actions.sync.removeMemberFromTargetCareTeamRequest();

          expect(initialState.removingMemberFromTargetCareTeam.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.removingMemberFromTargetCareTeam.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set removingMemberFromTargetCareTeam to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            removingMemberFromTargetCareTeam: {
              inProgress: true,
              notification: null
            }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.removeMemberFromTargetCareTeamFailure(error);

          expect(initialStateForTest.removingMemberFromTargetCareTeam.inProgress).to.be.true;
          expect(initialStateForTest.removingMemberFromTargetCareTeam.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.removingMemberFromTargetCareTeam.inProgress).to.be.false;
          expect(state.removingMemberFromTargetCareTeam.notification.type).to.equal('error');
          expect(state.removingMemberFromTargetCareTeam.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set removingMemberFromTargetCareTeam to be false', () => {
          let initialStateForTest = _.merge({}, initialState, {
            removingMemberFromTargetCareTeam: {
              inProgress: true,
              notification: null
            }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let memberId = 15;
          let action = actions.sync.removeMemberFromTargetCareTeamSuccess(memberId);

          expect(initialStateForTest.removingMemberFromTargetCareTeam.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.removingMemberFromTargetCareTeam.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('sendInvite', () => {
      describe('request', () => {
        it('should set sendingInvite to be true', () => {
          let action = actions.sync.sendInviteRequest();

          expect(initialState.sendingInvite.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.sendingInvite.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set sendingInvite to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            sendingInvite: {
              inProgress: true,
              notification: null
            }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');

          let action = actions.sync.sendInviteFailure(error);

          expect(initialStateForTest.sendingInvite.inProgress).to.be.true;
          expect(initialStateForTest.sendingInvite.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.sendingInvite.inProgress).to.be.false;
          expect(state.sendingInvite.notification.type).to.equal('error');
          expect(state.sendingInvite.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set sendingInvite to be false', () => {
          let pendingSentInvites = [
            { email: 'a@a.com', permissions: 'bar'}
          ];

          let initialStateForTest = _.merge(
            {},
            initialState,
            {
              sendingInvite: {
                inProgress: true,
                notification: false
              }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);

          let invitation = { email: 'f@f.com', permissions: 'foo' };
          let action = actions.sync.sendInviteSuccess(invitation);

          expect(initialStateForTest.sendingInvite.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.sendingInvite.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('cancelSentInvite', () => {
      describe('request', () => {
        it('should set cancellingSentInvite to be true', () => {
          let action = actions.sync.cancelSentInviteRequest();

          expect(initialState.cancellingSentInvite.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.cancellingSentInvite.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set cancellingSentInvite to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            cancellingSentInvite: {
              inProgress: true,
              notification: null
            }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.cancelSentInviteFailure(error);

          expect(initialStateForTest.cancellingSentInvite.inProgress).to.be.true;
          expect(initialStateForTest.cancellingSentInvite.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.cancellingSentInvite.inProgress).to.be.false;
          expect(state.cancellingSentInvite.notification.type).to.equal('error');
          expect(state.cancellingSentInvite.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set cancellingSentInvite to be false', () => {
          let pendingSentInvites = [
            { email: 'a@a.com', permissions: 'bar'},
            { email: 'f@f.com', permissions: 'foo' }
          ];

          let initialStateForTest = _.merge(
            {},
            initialState,
            {
              cancellingSentInvite: {
                inProgress: true,
                notification: null
              }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);

          let invitation = { email: 'f@f.com', permissions: 'foo' };
          let action = actions.sync.cancelSentInviteSuccess(invitation.email);

          expect(initialStateForTest.cancellingSentInvite.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.cancellingSentInvite.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.setMemberPermissionsFailure(error);

          expect(initialStateForTest.settingMemberPermissions.inProgress).to.be.true;
          expect(initialStateForTest.settingMemberPermissions.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.settingMemberPermissions.inProgress).to.be.false;
          expect(state.settingMemberPermissions.notification.type).to.equal('error');
          expect(state.settingMemberPermissions.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set settingMemberPermissions to be false', () => {
          let pendingReceivedInvites = [
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
          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.setMemberPermissionsSuccess(pendingReceivedInvites[0]);

          expect(initialStateForTest.settingMemberPermissions.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.settingMemberPermissions.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('acceptReceivedInvite', () => {
      describe('request', () => {
        it('should set acceptingReceivedInvite to be true', () => {
          let action = actions.sync.acceptReceivedInviteRequest();

          expect(initialState.acceptingReceivedInvite.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.acceptingReceivedInvite.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set acceptingReceivedInvite to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { acceptingReceivedInvite: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.acceptReceivedInviteFailure(error);

          expect(initialStateForTest.acceptingReceivedInvite.inProgress).to.be.true;
          expect(initialStateForTest.acceptingReceivedInvite.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.acceptingReceivedInvite.inProgress).to.be.false;
          expect(state.acceptingReceivedInvite.notification.type).to.equal('error');
          expect(state.acceptingReceivedInvite.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set acceptingReceivedInvite to be false', () => {
          let pendingReceivedInvites = [
            { key: 'foo', creator: { userid: 500, name: 'Frank' } },
            { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
          ];

          let initialStateForTest = _.merge(
            {},
            initialState,
            { acceptingReceivedInvite: { inProgress : true, notification: null }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.acceptReceivedInviteSuccess(pendingReceivedInvites[0]);

          expect(initialStateForTest.acceptingReceivedInvite.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.acceptingReceivedInvite.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('rejectReceivedInvite', () => {
      describe('request', () => {
        it('should set rejectingReceivedInvite to be true', () => {
          let action = actions.sync.rejectReceivedInviteRequest();

          expect(initialState.rejectingReceivedInvite.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.rejectingReceivedInvite.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set rejectingReceivedInvite to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { rejectingReceivedInvite: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.rejectReceivedInviteFailure(error);

          expect(initialStateForTest.rejectingReceivedInvite.inProgress).to.be.true;
          expect(initialStateForTest.rejectingReceivedInvite.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.rejectingReceivedInvite.inProgress).to.be.false;
          expect(state.rejectingReceivedInvite.notification.type).to.equal('error');
          expect(state.rejectingReceivedInvite.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set rejectingReceivedInvite to be false', () => {
          let pendingReceivedInvites = [
            { key: 'foo', creator: { userid: 500, name: 'Frank' } },
            { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
          ];

          let initialStateForTest = _.merge(
            {},
            initialState,
            { rejectingReceivedInvite: { inProgress : true, notification: null }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.rejectReceivedInviteSuccess(pendingReceivedInvites[0]);

          expect(initialStateForTest.rejectingReceivedInvite.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.rejectingReceivedInvite.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set updatingPatient to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { updatingPatient: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.updatePatientFailure(error);

          expect(initialStateForTest.updatingPatient.inProgress).to.be.true;
          expect(initialStateForTest.updatingPatient.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.updatingPatient.inProgress).to.be.false;
          expect(state.updatingPatient.notification.type).to.equal('error');
          expect(state.updatingPatient.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.updatePatientSuccess(updatedPatient);

          expect(initialStateForTest.updatingPatient.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.updatingPatient.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('updatePatientBgUnits', () => {
      describe('request', () => {
        it('should set updatingPatientBgUnits to be true', () => {
          let action = actions.sync.updatePatientBgUnitsRequest();

          expect(initialState.updatingPatientBgUnits.inProgress).to.be.false;

          let state = reducer(initialState, action);
          expect(state.updatingPatientBgUnits.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set updatingPatientBgUnits to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, { updatingPatientBgUnits: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.updatePatientBgUnitsFailure(error);

          expect(initialStateForTest.updatingPatientBgUnits.inProgress).to.be.true;
          expect(initialStateForTest.updatingPatientBgUnits.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.updatingPatientBgUnits.inProgress).to.be.false;
          expect(state.updatingPatientBgUnits.notification.type).to.equal('error');
          expect(state.updatingPatientBgUnits.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set updatingPatientBgUnits to be false', () => {
          let currentPatient = { userid: 506, name: 'Alice' };
          let updatedPatient = { userid: 506, name: 'Alice Cooper' };

          let initialStateForTest = _.merge(
            {},
            initialState,
            { updatingPatientBgUnits: { inProgress : true, notification: null }
          });
          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.updatePatientBgUnitsSuccess(updatedPatient);

          expect(initialStateForTest.updatingPatientBgUnits.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.updatingPatientBgUnits.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('updateUser', () => {
      describe('request', () => {
        it('should set updatingUser to be true', () => {
          let updatingUser = { id: 506, name: 'Jimmy Hendrix' };

          let user = { id: 506 };

          let initialStateForTest = _.merge({}, initialState, { loggedInUser:  user });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let action = actions.sync.updateUserRequest(updatingUser);

          expect(initialStateForTest.updatingUser.inProgress).to.be.false;

          let state = reducer(initialStateForTest, action);
          expect(state.updatingUser.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set updatingUser to be false and set error', () => {

          let initialStateForTest = _.merge({}, initialState, { updatingUser: { inProgress : true, notification: null } });
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.updateUserFailure(error);

          expect(initialStateForTest.updatingUser.inProgress).to.be.true;
          expect(initialStateForTest.updatingUser.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.updatingUser.inProgress).to.be.false;
          expect(state.updatingUser.notification.type).to.equal('error');
          expect(state.updatingUser.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
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
          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.updateUserSuccess(updatedUser);

          expect(initialStateForTest.updatingUser.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.updatingUser.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('fetchDataDonationAccounts', () => {
      describe('request', () => {
        it('should set fetchingDataDonationAccounts to be true', () => {
          let initialStateForTest = _.merge({}, initialState);
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let action = actions.sync.fetchDataDonationAccountsRequest();

          expect(initialStateForTest.fetchingDataDonationAccounts.inProgress).to.be.false;

          let state = reducer(initialStateForTest, action);
          expect(state.fetchingDataDonationAccounts.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set updatingUser to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            fetchingDataDonationAccounts: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchDataDonationAccountsFailure(error);

          expect(initialStateForTest.fetchingDataDonationAccounts.inProgress).to.be.true;
          expect(initialStateForTest.fetchingDataDonationAccounts.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingDataDonationAccounts.inProgress).to.be.false;
          expect(state.fetchingDataDonationAccounts.notification.type).to.equal('error');
          expect(state.fetchingDataDonationAccounts.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set updatingUser to be false', () => {
          let accounts = [
            { email: 'bigdata@tidepool.org' },
            { email: 'bigdata+NSF@tidepool.org' },
          ];

          let initialStateForTest = _.merge({}, initialState, {
            fetchingDataDonationAccounts: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.fetchDataDonationAccountsSuccess(accounts);

          expect(initialStateForTest.fetchingDataDonationAccounts.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingDataDonationAccounts.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('updateDataDonationAccounts', () => {
      describe('request', () => {
        it('should set updateingDataDonationAccounts to be true', () => {
          let initialStateForTest = _.merge({}, initialState);
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let action = actions.sync.updateDataDonationAccountsRequest();

          expect(initialStateForTest.updatingDataDonationAccounts.inProgress).to.be.false;

          let state = reducer(initialStateForTest, action);
          expect(state.updatingDataDonationAccounts.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set updatingUser to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            updatingDataDonationAccounts: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.updateDataDonationAccountsFailure(error);

          expect(initialStateForTest.updatingDataDonationAccounts.inProgress).to.be.true;
          expect(initialStateForTest.updatingDataDonationAccounts.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.updatingDataDonationAccounts.inProgress).to.be.false;
          expect(state.updatingDataDonationAccounts.notification.type).to.equal('error');
          expect(state.updatingDataDonationAccounts.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set updatingUser to be false', () => {
          let accounts = {
            addAccounts: [
              { email: 'bigdata+YYY@tidepool.org' },
            ],
            removeAccounts: [
              { email: 'bigdata+NSF@tidepool.org' },
            ],
          };

          let initialStateForTest = _.merge({}, initialState, {
            updatingDataDonationAccounts: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.updateDataDonationAccountsSuccess(accounts);

          expect(initialStateForTest.updatingDataDonationAccounts.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.updatingDataDonationAccounts.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('fetchDataSources', () => {
      describe('request', () => {
        it('should set fetchingDataSources to be true', () => {
          let initialStateForTest = _.merge({}, initialState);
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let action = actions.sync.fetchDataSourcesRequest();

          expect(initialStateForTest.fetchingDataSources.inProgress).to.be.false;

          let state = reducer(initialStateForTest, action);
          expect(state.fetchingDataSources.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingDataSources to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            fetchingDataSources: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchDataSourcesFailure(error);

          expect(initialStateForTest.fetchingDataSources.inProgress).to.be.true;
          expect(initialStateForTest.fetchingDataSources.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingDataSources.inProgress).to.be.false;
          expect(state.fetchingDataSources.notification.type).to.equal('error');
          expect(state.fetchingDataSources.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set fetchingDataSources to be false', () => {
          let dataSources = [
            { id: 'strava', url: 'blah' },
            { name: 'fitbit', url: 'blah' },
          ];

          let initialStateForTest = _.merge({}, initialState, {
            fetchingDataSources: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.fetchDataSourcesSuccess(dataSources);

          expect(initialStateForTest.fetchingDataSources.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingDataSources.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('fetchServerTime', () => {
      describe('request', () => {
        it('should set fetchingServerTime to be true', () => {
          let initialStateForTest = _.merge({}, initialState);
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let action = actions.sync.fetchServerTimeRequest();

          expect(initialStateForTest.fetchingServerTime.inProgress).to.be.false;

          let state = reducer(initialStateForTest, action);
          expect(state.fetchingServerTime.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set fetchingServerTime to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            fetchingServerTime: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.fetchServerTimeFailure(error);

          expect(initialStateForTest.fetchingServerTime.inProgress).to.be.true;
          expect(initialStateForTest.fetchingServerTime.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingServerTime.inProgress).to.be.false;
          expect(state.fetchingServerTime.notification.type).to.equal('error');
          expect(state.fetchingServerTime.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set fetchingServerTime to be false', () => {
          let ServerTime = [
            { id: 'strava', url: 'blah' },
            { name: 'fitbit', url: 'blah' },
          ];

          let initialStateForTest = _.merge({}, initialState, {
            fetchingServerTime: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.fetchServerTimeSuccess(ServerTime);

          expect(initialStateForTest.fetchingServerTime.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.fetchingServerTime.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('connectDataSource', () => {
      describe('request', () => {
        it('should set connectDataSource to be true', () => {
          let initialStateForTest = _.merge({}, initialState);
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let action = actions.sync.connectDataSourceRequest();

          expect(initialStateForTest.connectingDataSource.inProgress).to.be.false;

          let state = reducer(initialStateForTest, action);
          expect(state.connectingDataSource.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set connectDataSource to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            connectingDataSource: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened :(');
          let action = actions.sync.connectDataSourceFailure(error);

          expect(initialStateForTest.connectingDataSource.inProgress).to.be.true;
          expect(initialStateForTest.connectingDataSource.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.connectingDataSource.inProgress).to.be.false;
          expect(state.connectingDataSource.notification.type).to.equal('error');
          expect(state.connectingDataSource.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set connectingDataSource to be false', () => {

          let initialStateForTest = _.merge({}, initialState, {
            connectingDataSource: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.connectDataSourceSuccess('strava', 'blah');

          expect(initialStateForTest.connectingDataSource.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.connectingDataSource.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });

    describe('disconnectDataSource', () => {
      describe('request', () => {
        it('should set disconnectingDataSource to be true', () => {
          let initialStateForTest = _.merge({}, initialState);
          let tracked = mutationTracker.trackObj(initialStateForTest);
          let action = actions.sync.disconnectDataSourceRequest();

          expect(initialStateForTest.disconnectingDataSource.inProgress).to.be.false;

          let state = reducer(initialStateForTest, action);
          expect(state.disconnectingDataSource.inProgress).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('failure', () => {
        it('should set disconnectingDataSource to be false and set error', () => {
          let initialStateForTest = _.merge({}, initialState, {
            disconnectingDataSource: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);
          let error = new Error('Something bad happened when disconnecting :(');
          let action = actions.sync.disconnectDataSourceFailure(error);

          expect(initialStateForTest.disconnectingDataSource.inProgress).to.be.true;
          expect(initialStateForTest.disconnectingDataSource.notification).to.be.null;

          let state = reducer(initialStateForTest, action);

          expect(state.disconnectingDataSource.inProgress).to.be.false;
          expect(state.disconnectingDataSource.notification.type).to.equal('error');
          expect(state.disconnectingDataSource.notification.message).to.equal(error.message);
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });

      describe('success', () => {
        it('should set updatingUser to be false', () => {
          let initialStateForTest = _.merge({}, initialState, {
            disconnectingDataSource: { inProgress: true, notification: null },
          });

          let tracked = mutationTracker.trackObj(initialStateForTest);

          let action = actions.sync.disconnectDataSourceSuccess();

          expect(initialStateForTest.disconnectingDataSource.inProgress).to.be.true;

          let state = reducer(initialStateForTest, action);

          expect(state.disconnectingDataSource.inProgress).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
        });
      });
    });
  });
});
