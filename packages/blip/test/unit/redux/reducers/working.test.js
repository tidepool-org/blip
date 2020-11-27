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

  describe('logout', () => {
    describe('request', () => {
      it('should set loggingOut.inProgress to be true', () => {
        let action = actions.sync.logoutRequest();
        expect(initialState.loggingOut.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.loggingOut.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set loggingOut.inProgress to be false', () => {
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

      it('should set loggingOut.completed.inProgress to be true', () => {
        let user = 'user';

        let requestAction = actions.sync.logoutRequest();
        expect(initialState.loggingOut.completed).to.be.null;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.loggingOut.completed).to.be.null;

        let successAction = actions.sync.logoutSuccess(user);
        let state = reducer(intermediateState, successAction);
        expect(state.loggingOut.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should reset to the initial working state for all other actions', () => {
        let user = 'user';

        expect(initialState.fetchingUser.completed).to.be.null;
        let updateOtherAction = actions.sync.fetchUserSuccess(user);

        let intermediateState = reducer(initialState, updateOtherAction);
        expect(intermediateState.fetchingUser.completed).to.be.true;

        let logoutSuccessAction = actions.sync.logoutSuccess(user);
        let state = reducer(intermediateState, logoutSuccessAction);
        expect(_.omit(state, 'loggingOut')).to.eql(_.omit(initialState, 'loggingOut'));
        expect(state.fetchingUser.completed).to.be.null;
      });
    });
  });

  describe('login', () => {
    describe('request', () => {
      it('should leave loggingIn.completed unchanged', () => {
        expect(initialState.loggingIn.completed).to.be.null;

        let requestAction = actions.sync.loginRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.loggingIn.completed).to.be.null;

        let successAction = actions.sync.loginSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.loggingIn.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.loggingIn.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set loggingIn.inProgress to be true', () => {
        let action = actions.sync.loginRequest();
        expect(initialState.loggingIn.inProgress).to.be.false;

        let state = reducer(initialState, action);

        expect(state.loggingIn.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set loggingIn.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.loggingIn.completed).to.be.null;

        let failureAction = actions.sync.loginFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.loggingIn.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set loggingIn.inProgress to be false and set error', () => {
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
      it('should set loggingIn.completed to be true', () => {
        expect(initialState.loggingIn.completed).to.be.null;

        let successAction = actions.sync.loginSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.loggingIn.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set loggingIn.inProgress to be false', () => {
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

  describe('signup', () => {
    describe('request', () => {
      it('should leave signingUp.completed unchanged', () => {
        expect(initialState.signingUp.completed).to.be.null;

        let requestAction = actions.sync.signupRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.signingUp.completed).to.be.null;

        let successAction = actions.sync.signupSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.signingUp.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.signingUp.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set signingUp.inProgress to be true', () => {
        let action = actions.sync.signupRequest();
        expect(initialState.signingUp.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.signingUp.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set signingUp.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.signingUp.completed).to.be.null;

        let failureAction = actions.sync.signupFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.signingUp.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set signingUp.inProgress to be false and set error', () => {
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
      it('should set signingUp.completed to be true', () => {
        expect(initialState.signingUp.completed).to.be.null;

        let successAction = actions.sync.signupSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.signingUp.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set signingUp.inProgress to be false', () => {
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
      it('should leave confirmingSignup.completed unchanged', () => {
        expect(initialState.confirmingSignup.completed).to.be.null;

        let requestAction = actions.sync.confirmSignupRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.confirmingSignup.completed).to.be.null;

        let successAction = actions.sync.confirmSignupSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.confirmingSignup.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.confirmingSignup.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set confirmingSignup.inProgress to be true', () => {
        let action = actions.sync.confirmSignupRequest();
        expect(initialState.confirmingSignup.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.confirmingSignup.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set confirmingSignup.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.confirmingSignup.completed).to.be.null;

        let failureAction = actions.sync.confirmSignupFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.confirmingSignup.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set confirmingSignup.inProgress to be false and set error', () => {
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
      it('should set confirmingSignup.completed to be true', () => {
        expect(initialState.confirmingSignup.completed).to.be.null;

        let successAction = actions.sync.confirmSignupSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.confirmingSignup.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set confirmingSignup.inProgress to be false', () => {
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
      it('should leave requestingPasswordReset.completed unchanged', () => {
        expect(initialState.requestingPasswordReset.completed).to.be.null;

        let requestAction = actions.sync.requestPasswordResetRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.requestingPasswordReset.completed).to.be.null;

        let successAction = actions.sync.requestPasswordResetSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.requestingPasswordReset.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.requestingPasswordReset.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set requestingPasswordReset.inProgress to be true', () => {
        let action = actions.sync.requestPasswordResetRequest();

        expect(initialState.requestingPasswordReset.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.requestingPasswordReset.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set requestingPasswordReset.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.requestingPasswordReset.completed).to.be.null;

        let failureAction = actions.sync.requestPasswordResetFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.requestingPasswordReset.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set requestingPasswordReset.inProgress to be false and set error', () => {
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
      it('should set requestingPasswordReset.completed to be true', () => {
        expect(initialState.requestingPasswordReset.completed).to.be.null;

        let successAction = actions.sync.requestPasswordResetSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.requestingPasswordReset.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set requestingPasswordReset.inProgress to be false', () => {
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
      it('should leave confirmingPasswordReset.completed unchanged', () => {
        expect(initialState.confirmingPasswordReset.completed).to.be.null;

        let requestAction = actions.sync.confirmPasswordResetRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.confirmingPasswordReset.completed).to.be.null;

        let successAction = actions.sync.confirmPasswordResetSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.confirmingPasswordReset.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.confirmingPasswordReset.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set confirmingPasswordReset.inProgress to be true', () => {
        let action = actions.sync.confirmPasswordResetRequest();
        expect(initialState.confirmingPasswordReset.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.confirmingPasswordReset.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set confirmingPasswordReset.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.confirmingPasswordReset.completed).to.be.null;

        let failureAction = actions.sync.confirmPasswordResetFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.confirmingPasswordReset.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set confirmingPasswordReset.inProgress to be false and set error', () => {
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
      it('should set confirmingPasswordReset.completed to be true', () => {
        expect(initialState.confirmingPasswordReset.completed).to.be.null;

        let successAction = actions.sync.confirmPasswordResetSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.confirmingPasswordReset.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set confirmingPasswordReset.inProgress to be false', () => {
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
      it('should leave acceptingTerms.completed unchanged', () => {
        expect(initialState.acceptingTerms.completed).to.be.null;

        let requestAction = actions.sync.acceptTermsRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.acceptingTerms.completed).to.be.null;

        let successAction = actions.sync.acceptTermsSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.acceptingTerms.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.acceptingTerms.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingTerms.inProgress to be true', () => {
        let action = actions.sync.acceptTermsRequest();

        expect(initialState.acceptingTerms.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.acceptingTerms.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set acceptingTerms.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.acceptingTerms.completed).to.be.null;

        let failureAction = actions.sync.acceptTermsFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.acceptingTerms.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingTerms.inProgress to be false and set error', () => {
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
      it('should set acceptingTerms.completed to be true', () => {
        expect(initialState.acceptingTerms.completed).to.be.null;

        let successAction = actions.sync.acceptTermsSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.acceptingTerms.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingTerms.inProgress to be false', () => {
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
      it('should leave resendingEmailVerification.completed unchanged', () => {
        expect(initialState.resendingEmailVerification.completed).to.be.null;

        let requestAction = actions.sync.resendEmailVerificationRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.resendingEmailVerification.completed).to.be.null;

        let successAction = actions.sync.resendEmailVerificationSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.resendingEmailVerification.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.resendingEmailVerification.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set resendingEmailVerification.inProgress to be true', () => {
        let action = actions.sync.resendEmailVerificationRequest();

        expect(initialState.resendingEmailVerification.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.resendingEmailVerification.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set resendingEmailVerification.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.resendingEmailVerification.completed).to.be.null;

        let failureAction = actions.sync.resendEmailVerificationFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.resendingEmailVerification.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set resendingEmailVerification.inProgress to be false and set error', () => {
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
      it('should set resendingEmailVerification.completed to be true', () => {
        expect(initialState.resendingEmailVerification.completed).to.be.null;

        let successAction = actions.sync.resendEmailVerificationSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.resendingEmailVerification.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set resendingEmailVerification.inProgress to be false', () => {
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

  describe('fetchUser', () => {
    describe('request', () => {
      it('should leave fetchingUser.completed unchanged', () => {
        expect(initialState.fetchingUser.completed).to.be.null;

        let requestAction = actions.sync.fetchUserRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingUser.completed).to.be.null;

        let successAction = actions.sync.fetchUserSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingUser.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingUser.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingUser.inProgress to be true', () => {
        let action = actions.sync.fetchUserRequest();

        expect(initialState.fetchingUser.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingUser.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingUser.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingUser.completed).to.be.null;

        let failureAction = actions.sync.fetchUserFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingUser.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingUser.inProgress to be false and set error', () => {
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
      it('should set fetchingUser.completed to be true', () => {
        expect(initialState.fetchingUser.completed).to.be.null;

        let successAction = actions.sync.fetchUserSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingUser.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingUser.inProgress to be false', () => {
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
      it('should leave fetchingPatient.completed unchanged', () => {
        expect(initialState.fetchingPatient.completed).to.be.null;

        let requestAction = actions.sync.fetchPatientRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingPatient.completed).to.be.null;

        let successAction = actions.sync.fetchPatientSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingPatient.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingPatient.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatient.inProgress to be true', () => {
        let action = actions.sync.fetchPatientRequest();

        expect(initialState.fetchingPatient.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingPatient.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingPatient.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingPatient.completed).to.be.null;

        let failureAction = actions.sync.fetchPatientFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingPatient.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatient.inProgress to be false and set error', () => {
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
      it('should set fetchingPatient.completed to be true', () => {
        expect(initialState.fetchingPatient.completed).to.be.null;

        let successAction = actions.sync.fetchPatientSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingPatient.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatient.inProgress to be false', () => {
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

  describe('fetchAssociatedAccounts', () => {
    describe('request', () => {
      it('should leave fetchingAssociatedAccounts.completed unchanged', () => {
        expect(initialState.fetchingAssociatedAccounts.completed).to.be.null;

        let requestAction = actions.sync.fetchAssociatedAccountsRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingAssociatedAccounts.completed).to.be.null;

        let successAction = actions.sync.fetchAssociatedAccountsSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingAssociatedAccounts.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingAssociatedAccounts.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingAssociatedAccounts.inProgress to be true', () => {
        let action = actions.sync.fetchAssociatedAccountsRequest();

        expect(initialState.fetchingAssociatedAccounts.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingAssociatedAccounts.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingAssociatedAccounts.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingAssociatedAccounts.completed).to.be.null;

        let failureAction = actions.sync.fetchAssociatedAccountsFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingAssociatedAccounts.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingAssociatedAccounts.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, { fetchingAssociatedAccounts: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchAssociatedAccountsFailure(error);

        expect(initialStateForTest.fetchingAssociatedAccounts.inProgress).to.be.true;
        expect(initialStateForTest.fetchingAssociatedAccounts.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingAssociatedAccounts.inProgress).to.be.false;
        expect(state.fetchingAssociatedAccounts.notification.type).to.equal('error');
        expect(state.fetchingAssociatedAccounts.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingAssociatedAccounts.completed to be true', () => {
        expect(initialState.fetchingAssociatedAccounts.completed).to.be.null;

        let successAction = actions.sync.fetchAssociatedAccountsSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingAssociatedAccounts.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingAssociatedAccounts.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, { fetchingAssociatedAccounts: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let patients = [
          { userid: 2020, name: 'Megan Durrant'},
          { userid: 501, name: 'Jamie Blake'}
        ];
        let action = actions.sync.fetchAssociatedAccountsSuccess(patients);

        expect(initialStateForTest.fetchingAssociatedAccounts.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingAssociatedAccounts.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchPatientData', () => {
    describe('request', () => {
      it('should leave fetchingPatientData.completed unchanged', () => {
        expect(initialState.fetchingPatientData.completed).to.be.null;

        let requestAction = actions.sync.fetchPatientDataRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingPatientData.completed).to.be.null;

        let successAction = actions.sync.fetchPatientDataSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingPatientData.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingPatientData.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientData.inProgress to be true', () => {
        let action = actions.sync.fetchPatientDataRequest();

        expect(initialState.fetchingPatientData.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingPatientData.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingPatientData.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingPatientData.completed).to.be.null;

        let failureAction = actions.sync.fetchPatientDataFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingPatientData.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientData.inProgress to be false and set error', () => {
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
      it('should set fetchingPatientData.completed to be true', () => {
        expect(initialState.fetchingPatientData.completed).to.be.null;

        let successAction = actions.sync.fetchPatientDataSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingPatientData.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientData.inProgress to be false', () => {
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
      it('should leave fetchingPendingSentInvites.completed unchanged', () => {
        expect(initialState.fetchingPendingSentInvites.completed).to.be.null;

        let requestAction = actions.sync.fetchPendingSentInvitesRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingPendingSentInvites.completed).to.be.null;

        let successAction = actions.sync.fetchPendingSentInvitesSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingPendingSentInvites.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingPendingSentInvites.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPendingSentInvites.inProgress to be true', () => {
        let action = actions.sync.fetchPendingSentInvitesRequest();

        expect(initialState.fetchingPendingSentInvites.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingPendingSentInvites.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingPendingSentInvites.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingPendingSentInvites.completed).to.be.null;

        let failureAction = actions.sync.fetchPendingSentInvitesFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingPendingSentInvites.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPendingSentInvites.inProgress to be false and set error', () => {
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
      it('should set fetchingPendingSentInvites.completed to be true', () => {
        expect(initialState.fetchingPendingSentInvites.completed).to.be.null;

        let successAction = actions.sync.fetchPendingSentInvitesSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingPendingSentInvites.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPendingSentInvites.inProgress to be false', () => {
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
      it('should leave fetchingPendingReceivedInvites.completed unchanged', () => {
        expect(initialState.fetchingPendingReceivedInvites.completed).to.be.null;

        let requestAction = actions.sync.fetchPendingReceivedInvitesRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingPendingReceivedInvites.completed).to.be.null;

        let successAction = actions.sync.fetchPendingReceivedInvitesSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingPendingReceivedInvites.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingPendingReceivedInvites.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPendingReceivedInvites.inProgress to be true', () => {
        let action = actions.sync.fetchPendingReceivedInvitesRequest();

        expect(initialState.fetchingPendingReceivedInvites.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingPendingReceivedInvites.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingPendingReceivedInvites.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingPendingReceivedInvites.completed).to.be.null;

        let failureAction = actions.sync.fetchPendingReceivedInvitesFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingPendingReceivedInvites.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPendingReceivedInvites.inProgress to be false and set error', () => {
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
      it('should set fetchingPendingReceivedInvites.completed to be true', () => {
        expect(initialState.fetchingPendingReceivedInvites.completed).to.be.null;

        let successAction = actions.sync.fetchPendingReceivedInvitesSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingPendingReceivedInvites.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPendingReceivedInvites.inProgress to be false', () => {
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
      it('should leave fetchingMessageThread.completed unchanged', () => {
        expect(initialState.fetchingMessageThread.completed).to.be.null;

        let requestAction = actions.sync.fetchMessageThreadRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingMessageThread.completed).to.be.null;

        let successAction = actions.sync.fetchMessageThreadSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingMessageThread.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingMessageThread.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingMessageThread.inProgress to be true', () => {
        let action = actions.sync.fetchMessageThreadRequest();

        expect(initialState.fetchingMessageThread.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingMessageThread.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingMessageThread.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingMessageThread.completed).to.be.null;

        let failureAction = actions.sync.fetchMessageThreadFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingMessageThread.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingMessageThread.inProgress to be false and set error', () => {
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
      it('should set fetchingMessageThread.completed to be true', () => {
        expect(initialState.fetchingMessageThread.completed).to.be.null;

        let successAction = actions.sync.fetchMessageThreadSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingMessageThread.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingMessageThread.inProgress to be false', () => {
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

  describe('setupDataStorage', () => {
    describe('request', () => {
      it('should leave settingUpDataStorage.completed unchanged', () => {
        expect(initialState.settingUpDataStorage.completed).to.be.null;

        let requestAction = actions.sync.setupDataStorageRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.settingUpDataStorage.completed).to.be.null;

        let successAction = actions.sync.setupDataStorageSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.settingUpDataStorage.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.settingUpDataStorage.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set settingUpDataStorage.inProgress to be true', () => {
        let action = actions.sync.setupDataStorageRequest();

        expect(initialState.settingUpDataStorage.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.settingUpDataStorage.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set settingUpDataStorage.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.settingUpDataStorage.completed).to.be.null;

        let failureAction = actions.sync.setupDataStorageFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.settingUpDataStorage.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set settingUpDataStorage.inProgress to be false and set error', () => {
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
      it('should set settingUpDataStorage.completed to be true', () => {
        expect(initialState.settingUpDataStorage.completed).to.be.null;

        let successAction = actions.sync.setupDataStorageSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.settingUpDataStorage.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set settingUpDataStorage.inProgress to be false', () => {
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
      it('should leave removingMembershipInOtherCareTeam.completed unchanged', () => {
        expect(initialState.removingMembershipInOtherCareTeam.completed).to.be.null;

        let requestAction = actions.sync.removeMembershipInOtherCareTeamRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.removingMembershipInOtherCareTeam.completed).to.be.null;

        let successAction = actions.sync.removeMembershipInOtherCareTeamSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.removingMembershipInOtherCareTeam.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.removingMembershipInOtherCareTeam.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingMembershipInOtherCareTeam.inProgress to be true', () => {
        let action = actions.sync.removeMembershipInOtherCareTeamRequest();

        expect(initialState.removingMembershipInOtherCareTeam.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.removingMembershipInOtherCareTeam.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set removingMembershipInOtherCareTeam.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.removingMembershipInOtherCareTeam.completed).to.be.null;

        let failureAction = actions.sync.removeMembershipInOtherCareTeamFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.removingMembershipInOtherCareTeam.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingMembershipInOtherCareTeam.inProgress to be false and set error', () => {
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
      it('should set removingMembershipInOtherCareTeam.completed to be true', () => {
        expect(initialState.removingMembershipInOtherCareTeam.completed).to.be.null;

        let successAction = actions.sync.removeMembershipInOtherCareTeamSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.removingMembershipInOtherCareTeam.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingMembershipInOtherCareTeam.inProgress to be false', () => {
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
      it('should leave removingMemberFromTargetCareTeam.completed unchanged', () => {
        expect(initialState.removingMemberFromTargetCareTeam.completed).to.be.null;

        let requestAction = actions.sync.removeMemberFromTargetCareTeamRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.removingMemberFromTargetCareTeam.completed).to.be.null;

        let successAction = actions.sync.removeMemberFromTargetCareTeamSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.removingMemberFromTargetCareTeam.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.removingMemberFromTargetCareTeam.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingMemberFromTargetCareTeam.inProgress to be true', () => {
        let action = actions.sync.removeMemberFromTargetCareTeamRequest();

        expect(initialState.removingMemberFromTargetCareTeam.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.removingMemberFromTargetCareTeam.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set removingMemberFromTargetCareTeam.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.removingMemberFromTargetCareTeam.completed).to.be.null;

        let failureAction = actions.sync.removeMemberFromTargetCareTeamFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.removingMemberFromTargetCareTeam.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingMemberFromTargetCareTeam.inProgress to be false and set error', () => {
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
      it('should set removingMemberFromTargetCareTeam.completed to be true', () => {
        expect(initialState.removingMemberFromTargetCareTeam.completed).to.be.null;

        let successAction = actions.sync.removeMemberFromTargetCareTeamSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.removingMemberFromTargetCareTeam.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingMemberFromTargetCareTeam.inProgress to be false', () => {
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
      it('should leave sendingInvite.completed unchanged', () => {
        expect(initialState.sendingInvite.completed).to.be.null;

        let requestAction = actions.sync.sendInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.sendingInvite.completed).to.be.null;

        let successAction = actions.sync.sendInviteSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.sendingInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.sendingInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set sendingInvite.inProgress to be true', () => {
        let action = actions.sync.sendInviteRequest();

        expect(initialState.sendingInvite.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.sendingInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set sendingInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.sendingInvite.completed).to.be.null;

        let failureAction = actions.sync.sendInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.sendingInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set sendingInvite.inProgress to be false and set error', () => {
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
      it('should set sendingInvite.completed to be true', () => {
        expect(initialState.sendingInvite.completed).to.be.null;

        let successAction = actions.sync.sendInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.sendingInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set sendingInvite.inProgress to be false', () => {
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
      it('should leave cancellingSentInvite.completed unchanged', () => {
        expect(initialState.cancellingSentInvite.completed).to.be.null;

        let requestAction = actions.sync.cancelSentInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.cancellingSentInvite.completed).to.be.null;

        let successAction = actions.sync.cancelSentInviteSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.cancellingSentInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.cancellingSentInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set cancellingSentInvite.inProgress to be true', () => {
        let action = actions.sync.cancelSentInviteRequest();

        expect(initialState.cancellingSentInvite.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.cancellingSentInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set cancellingSentInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.cancellingSentInvite.completed).to.be.null;

        let failureAction = actions.sync.cancelSentInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.cancellingSentInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set cancellingSentInvite.inProgress to be false and set error', () => {
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
      it('should set cancellingSentInvite.completed to be true', () => {
        expect(initialState.cancellingSentInvite.completed).to.be.null;

        let successAction = actions.sync.cancelSentInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.cancellingSentInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set cancellingSentInvite.inProgress to be false', () => {
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
      it('should leave settingMemberPermissions.completed unchanged', () => {
        expect(initialState.settingMemberPermissions.completed).to.be.null;

        let requestAction = actions.sync.setMemberPermissionsRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.settingMemberPermissions.completed).to.be.null;

        let successAction = actions.sync.setMemberPermissionsSuccess('foo');
          let successState = reducer(requestState, successAction);

          expect(successState.settingMemberPermissions.completed).to.be.true;

          let state = reducer(successState, requestAction);
          expect(state.settingMemberPermissions.completed).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set settingMemberPermissions.inProgress to be true', () => {
        let action = actions.sync.setMemberPermissionsRequest();

        expect(initialState.settingMemberPermissions.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.settingMemberPermissions.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set settingMemberPermissions.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.settingMemberPermissions.completed).to.be.null;

        let failureAction = actions.sync.setMemberPermissionsFailure(error);
          let state = reducer(initialState, failureAction);

          expect(state.settingMemberPermissions.completed).to.be.false;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set settingMemberPermissions.inProgress to be false and set error', () => {
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
      it('should set settingMemberPermissions.completed to be true', () => {
        expect(initialState.settingMemberPermissions.completed).to.be.null;

        let successAction = actions.sync.setMemberPermissionsSuccess('foo');
          let state = reducer(initialState, successAction);

          expect(state.settingMemberPermissions.completed).to.be.true;
          expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set settingMemberPermissions.inProgress to be false', () => {
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
      it('should leave acceptingReceivedInvite.completed unchanged', () => {
        expect(initialState.acceptingReceivedInvite.completed).to.be.null;

        let requestAction = actions.sync.acceptReceivedInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.acceptingReceivedInvite.completed).to.be.null;

        let successAction = actions.sync.acceptReceivedInviteSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.acceptingReceivedInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.acceptingReceivedInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingReceivedInvite.inProgress to be true', () => {
        let action = actions.sync.acceptReceivedInviteRequest();

        expect(initialState.acceptingReceivedInvite.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.acceptingReceivedInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set acceptingReceivedInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.acceptingReceivedInvite.completed).to.be.null;

        let failureAction = actions.sync.acceptReceivedInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.acceptingReceivedInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingReceivedInvite.inProgress to be false and set error', () => {
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
      it('should set acceptingReceivedInvite.completed to be true', () => {
        expect(initialState.acceptingReceivedInvite.completed).to.be.null;

        let successAction = actions.sync.acceptReceivedInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.acceptingReceivedInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingReceivedInvite.inProgress to be false', () => {
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
      it('should leave rejectingReceivedInvite.completed unchanged', () => {
        expect(initialState.rejectingReceivedInvite.completed).to.be.null;

        let requestAction = actions.sync.rejectReceivedInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.rejectingReceivedInvite.completed).to.be.null;

        let successAction = actions.sync.rejectReceivedInviteSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.rejectingReceivedInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.rejectingReceivedInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set rejectingReceivedInvite.inProgress to be true', () => {
        let action = actions.sync.rejectReceivedInviteRequest();

        expect(initialState.rejectingReceivedInvite.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.rejectingReceivedInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set rejectingReceivedInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.rejectingReceivedInvite.completed).to.be.null;

        let failureAction = actions.sync.rejectReceivedInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.rejectingReceivedInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set rejectingReceivedInvite.inProgress to be false and set error', () => {
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
      it('should set rejectingReceivedInvite.completed to be true', () => {
        expect(initialState.rejectingReceivedInvite.completed).to.be.null;

        let successAction = actions.sync.rejectReceivedInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.rejectingReceivedInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set rejectingReceivedInvite.inProgress to be false', () => {
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
      it('should leave updatingPatient.completed unchanged', () => {
        expect(initialState.updatingPatient.completed).to.be.null;

        let requestAction = actions.sync.updatePatientRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingPatient.completed).to.be.null;

        let successAction = actions.sync.updatePatientSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.updatingPatient.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingPatient.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatient.inProgress to be true', () => {
        let action = actions.sync.updatePatientRequest();

        expect(initialState.updatingPatient.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.updatingPatient.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set updatingPatient.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingPatient.completed).to.be.null;

        let failureAction = actions.sync.updatePatientFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingPatient.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatient.inProgress to be false and set error', () => {
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
      it('should set updatingPatient.completed to be true', () => {
        expect(initialState.updatingPatient.completed).to.be.null;

        let successAction = actions.sync.updatePatientSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingPatient.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatient.inProgress to be false', () => {
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
      it('should leave updatingPatientBgUnits.completed unchanged', () => {
        expect(initialState.updatingPatientBgUnits.completed).to.be.null;

        let requestAction = actions.sync.updatePatientBgUnitsRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingPatientBgUnits.completed).to.be.null;

        let successAction = actions.sync.updatePatientBgUnitsSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.updatingPatientBgUnits.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingPatientBgUnits.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatientBgUnits.inProgress to be true', () => {
        let action = actions.sync.updatePatientBgUnitsRequest();

        expect(initialState.updatingPatientBgUnits.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.updatingPatientBgUnits.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set updatingPatientBgUnits.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingPatientBgUnits.completed).to.be.null;

        let failureAction = actions.sync.updatePatientBgUnitsFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingPatientBgUnits.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatientBgUnits.inProgress to be false and set error', () => {
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
      it('should set updatingPatientBgUnits.completed to be true', () => {
        expect(initialState.updatingPatientBgUnits.completed).to.be.null;

        let successAction = actions.sync.updatePatientBgUnitsSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingPatientBgUnits.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatientBgUnits.inProgress to be false', () => {
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
      it('should leave updatingUser.completed unchanged', () => {
        expect(initialState.updatingUser.completed).to.be.null;

        let requestAction = actions.sync.updateUserRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingUser.completed).to.be.null;

        let successAction = actions.sync.updateUserSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.updatingUser.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingUser.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingUser.inProgress to be true', () => {
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
      it('should set updatingUser.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingUser.completed).to.be.null;

        let failureAction = actions.sync.updateUserFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingUser.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingUser.inProgress to be false and set error', () => {

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
      it('should set updatingUser.completed to be true', () => {
        expect(initialState.updatingUser.completed).to.be.null;

        let successAction = actions.sync.updateUserSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingUser.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingUser.inProgress to be false', () => {
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

  describe('updateDataDonationAccounts', () => {
    describe('request', () => {
      it('should leave updatingDataDonationAccounts.completed unchanged', () => {
        expect(initialState.updatingDataDonationAccounts.completed).to.be.null;

        let requestAction = actions.sync.updateDataDonationAccountsRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingDataDonationAccounts.completed).to.be.null;

        let successAction = actions.sync.updateDataDonationAccountsSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.updatingDataDonationAccounts.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingDataDonationAccounts.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingDataDonationAccounts.inProgress to be true', () => {
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
      it('should set updatingDataDonationAccounts.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingDataDonationAccounts.completed).to.be.null;

        let failureAction = actions.sync.updateDataDonationAccountsFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingDataDonationAccounts.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingDataDonationAccounts.inProgress to be false and set error', () => {
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
      it('should set updatingDataDonationAccounts.completed to be true', () => {
        expect(initialState.updatingDataDonationAccounts.completed).to.be.null;

        let successAction = actions.sync.updateDataDonationAccountsSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingDataDonationAccounts.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingDataDonationAccounts.inProgress to be false', () => {
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
      it('should leave fetchingDataSources.completed unchanged', () => {
        expect(initialState.fetchingDataSources.completed).to.be.null;

        let requestAction = actions.sync.fetchDataSourcesRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingDataSources.completed).to.be.null;

        let successAction = actions.sync.fetchDataSourcesSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingDataSources.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingDataSources.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingDataSources.inProgress to be true', () => {
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
      it('should set fetchingDataSources.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingDataSources.completed).to.be.null;

        let failureAction = actions.sync.fetchDataSourcesFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingDataSources.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingDataSources.inProgress to be false and set error', () => {
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
      it('should set fetchingDataSources.completed to be true', () => {
        expect(initialState.fetchingDataSources.completed).to.be.null;

        let successAction = actions.sync.fetchDataSourcesSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingDataSources.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingDataSources.inProgress to be false', () => {
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
      it('should leave fetchingServerTime.completed unchanged', () => {
        expect(initialState.fetchingServerTime.completed).to.be.null;

        let requestAction = actions.sync.fetchServerTimeRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingServerTime.completed).to.be.null;

        let successAction = actions.sync.fetchServerTimeSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingServerTime.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingServerTime.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingServerTime.inProgress to be true', () => {
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
      it('should set fetchingServerTime.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingServerTime.completed).to.be.null;

        let failureAction = actions.sync.fetchServerTimeFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingServerTime.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingServerTime.inProgress to be false and set error', () => {
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
      it('should set fetchingServerTime.completed to be true', () => {
        expect(initialState.fetchingServerTime.completed).to.be.null;

        let successAction = actions.sync.fetchServerTimeSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingServerTime.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingServerTime.inProgress to be false', () => {
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
      it('should leave connectingDataSource.completed unchanged', () => {
        expect(initialState.connectingDataSource.completed).to.be.null;

        let requestAction = actions.sync.connectDataSourceRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.connectingDataSource.completed).to.be.null;

        let successAction = actions.sync.connectDataSourceSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.connectingDataSource.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.connectingDataSource.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set connectingDataSource.inProgress to be true', () => {
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
      it('should set connectingDataSource.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.connectingDataSource.completed).to.be.null;

        let failureAction = actions.sync.connectDataSourceFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.connectingDataSource.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set connectingDataSource.inProgress to be false and set error', () => {
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
      it('should set connectingDataSource.completed to be true', () => {
        expect(initialState.connectingDataSource.completed).to.be.null;

        let successAction = actions.sync.connectDataSourceSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.connectingDataSource.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set connectingDataSource.inProgress to be false', () => {

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
      it('should leave disconnectingDataSource.completed unchanged', () => {
        expect(initialState.disconnectingDataSource.completed).to.be.null;

        let requestAction = actions.sync.disconnectDataSourceRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.disconnectingDataSource.completed).to.be.null;

        let successAction = actions.sync.disconnectDataSourceSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.disconnectingDataSource.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.disconnectingDataSource.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set disconnectingDataSource.inProgress to be true', () => {
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
      it('should set disconnectingDataSource.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.disconnectingDataSource.completed).to.be.null;

        let failureAction = actions.sync.disconnectDataSourceFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.disconnectingDataSource.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set disconnectingDataSource.inProgress to be false and set error', () => {
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
      it('should set disconnectingDataSource.completed to be true', () => {
        expect(initialState.disconnectingDataSource.completed).to.be.null;

        let successAction = actions.sync.disconnectDataSourceSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.disconnectingDataSource.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set disconnectingDataSource.inProgress to be false', () => {
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
