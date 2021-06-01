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

      it('should set fetchingPatientData.patientId', () => {
        const patientId = 'abc123';
        let action = actions.sync.fetchPatientDataRequest(patientId);

        expect(initialState.fetchingPatientData.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingPatientData.patientId).to.equal(patientId);
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

  describe('fetchPrescriptions', () => {
    describe('request', () => {
      it('should leave fetchingPrescriptions.completed unchanged', () => {
        expect(initialState.fetchingPrescriptions.completed).to.be.null;

        let requestAction = actions.sync.fetchPrescriptionsRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingPrescriptions.completed).to.be.null;

        let successAction = actions.sync.fetchPrescriptionsSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingPrescriptions.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingPrescriptions.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPrescriptions.inProgress to be true', () => {
        let action = actions.sync.fetchPrescriptionsRequest();

        expect(initialState.fetchingPrescriptions.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingPrescriptions.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingPrescriptions.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingPrescriptions.completed).to.be.null;

        let failureAction = actions.sync.fetchPrescriptionsFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingPrescriptions.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPrescriptions.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { fetchingPrescriptions: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchPrescriptionsFailure(error);

        expect(initialStateForTest.fetchingPrescriptions.inProgress).to.be.true;
        expect(initialStateForTest.fetchingPrescriptions.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingPrescriptions.inProgress).to.be.false;
        expect(state.fetchingPrescriptions.notification.type).to.equal('error');
        expect(state.fetchingPrescriptions.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingPrescriptions.completed to be true', () => {
        expect(initialState.fetchingPrescriptions.completed).to.be.null;

        let successAction = actions.sync.fetchPrescriptionsSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingPrescriptions.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPrescriptions.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { fetchingPrescriptions: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let prescriptions = 'some prescriptions';
        let action = actions.sync.fetchPrescriptionsSuccess(prescriptions);

        expect(initialStateForTest.fetchingPrescriptions.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingPrescriptions.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('createPrescription', () => {
    describe('request', () => {
      it('should set creatingPrescription.completed to null', () => {
        expect(initialState.creatingPrescription.completed).to.be.null;

        let requestAction = actions.sync.createPrescriptionRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.creatingPrescription.completed).to.be.null;

        let successAction = actions.sync.createPrescriptionSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.creatingPrescription.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.creatingPrescription.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingPrescription.inProgress to be true', () => {
        let action = actions.sync.createPrescriptionRequest();

        expect(initialState.creatingPrescription.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.creatingPrescription.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set creatingPrescription.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.creatingPrescription.completed).to.be.null;

        let failureAction = actions.sync.createPrescriptionFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.creatingPrescription.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingPrescription.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { creatingPrescription: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.createPrescriptionFailure(error);

        expect(initialStateForTest.creatingPrescription.inProgress).to.be.true;
        expect(initialStateForTest.creatingPrescription.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingPrescription.inProgress).to.be.false;
        expect(state.creatingPrescription.notification.type).to.equal('error');
        expect(state.creatingPrescription.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set creatingPrescription.completed to be true', () => {
        expect(initialState.creatingPrescription.completed).to.be.null;

        let successAction = actions.sync.createPrescriptionSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.creatingPrescription.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingPrescription.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { creatingPrescription: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let prescription = 'some prescription';
        let action = actions.sync.createPrescriptionSuccess(prescription);

        expect(initialStateForTest.creatingPrescription.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingPrescription.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingPrescription.prescriptionId to the payload value', () => {
        let initialStateForTest = _.merge({}, initialState, { creatingPrescription: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let prescription = { id: 'some prescription id' };
        let action = actions.sync.createPrescriptionSuccess(prescription);

        expect(initialStateForTest.creatingPrescription.prescriptionId).to.be.undefined;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingPrescription.prescriptionId).to.equal('some prescription id');
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('createPrescriptionRevision', () => {
    describe('request', () => {
      it('should set creatingPrescriptionRevision.completed to null', () => {
        expect(initialState.creatingPrescriptionRevision.completed).to.be.null;

        let requestAction = actions.sync.createPrescriptionRevisionRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.creatingPrescriptionRevision.completed).to.be.null;

        let successAction = actions.sync.createPrescriptionRevisionSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.creatingPrescriptionRevision.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.creatingPrescriptionRevision.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingPrescriptionRevision.inProgress to be true', () => {
        let action = actions.sync.createPrescriptionRevisionRequest();

        expect(initialState.creatingPrescriptionRevision.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.creatingPrescriptionRevision.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set creatingPrescriptionRevision.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.creatingPrescriptionRevision.completed).to.be.null;

        let failureAction = actions.sync.createPrescriptionRevisionFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.creatingPrescriptionRevision.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingPrescriptionRevision.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { creatingPrescriptionRevision: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.createPrescriptionRevisionFailure(error);

        expect(initialStateForTest.creatingPrescriptionRevision.inProgress).to.be.true;
        expect(initialStateForTest.creatingPrescriptionRevision.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingPrescriptionRevision.inProgress).to.be.false;
        expect(state.creatingPrescriptionRevision.notification.type).to.equal('error');
        expect(state.creatingPrescriptionRevision.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set creatingPrescriptionRevision.completed to be true', () => {
        expect(initialState.creatingPrescriptionRevision.completed).to.be.null;

        let successAction = actions.sync.createPrescriptionRevisionSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.creatingPrescriptionRevision.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingPrescriptionRevision.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { creatingPrescriptionRevision: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let prescription = 'some prescription';
        let action = actions.sync.createPrescriptionRevisionSuccess(prescription);

        expect(initialStateForTest.creatingPrescriptionRevision.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingPrescriptionRevision.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('deletePrescription', () => {
    describe('request', () => {
      it('should set deletingPrescription.completed to null', () => {
        expect(initialState.deletingPrescription.completed).to.be.null;

        let requestAction = actions.sync.deletePrescriptionRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.deletingPrescription.completed).to.be.null;

        let successAction = actions.sync.deletePrescriptionSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.deletingPrescription.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.deletingPrescription.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingPrescription.inProgress to be true', () => {
        let action = actions.sync.deletePrescriptionRequest();

        expect(initialState.deletingPrescription.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.deletingPrescription.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set deletingPrescription.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.deletingPrescription.completed).to.be.null;

        let failureAction = actions.sync.deletePrescriptionFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.deletingPrescription.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingPrescription.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { deletingPrescription: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.deletePrescriptionFailure(error);

        expect(initialStateForTest.deletingPrescription.inProgress).to.be.true;
        expect(initialStateForTest.deletingPrescription.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.deletingPrescription.inProgress).to.be.false;
        expect(state.deletingPrescription.notification.type).to.equal('error');
        expect(state.deletingPrescription.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set deletingPrescription.completed to be true', () => {
        expect(initialState.deletingPrescription.completed).to.be.null;

        let successAction = actions.sync.deletePrescriptionSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.deletingPrescription.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingPrescription.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { deletingPrescription: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let prescription = 'some prescription';
        let action = actions.sync.deletePrescriptionSuccess(prescription);

        expect(initialStateForTest.deletingPrescription.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.deletingPrescription.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchDevices', () => {
    describe('request', () => {
      it('should leave fetchingDevices.completed unchanged', () => {
        expect(initialState.fetchingDevices.completed).to.be.null;

        let requestAction = actions.sync.fetchDevicesRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingDevices.completed).to.be.null;

        let successAction = actions.sync.fetchDevicesSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingDevices.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingDevices.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingDevices.inProgress to be true', () => {
        let action = actions.sync.fetchDevicesRequest();

        expect(initialState.fetchingDevices.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.fetchingDevices.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingDevices.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingDevices.completed).to.be.null;

        let failureAction = actions.sync.fetchDevicesFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingDevices.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingDevices.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { fetchingDevices: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchDevicesFailure(error);

        expect(initialStateForTest.fetchingDevices.inProgress).to.be.true;
        expect(initialStateForTest.fetchingDevices.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingDevices.inProgress).to.be.false;
        expect(state.fetchingDevices.notification.type).to.equal('error');
        expect(state.fetchingDevices.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingDevices.completed to be true', () => {
        expect(initialState.fetchingDevices.completed).to.be.null;

        let successAction = actions.sync.fetchDevicesSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingDevices.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingDevices.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { fetchingDevices: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let devices = 'some devices';
        let action = actions.sync.fetchDevicesSuccess(devices);

        expect(initialStateForTest.fetchingDevices.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingDevices.inProgress).to.be.false;
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

  describe('createMessageThread', () => {
    describe('request', () => {
      it('should leave creatingMessageThread.completed unchanged', () => {
        expect(initialState.creatingMessageThread.completed).to.be.null;

        let requestAction = actions.sync.createMessageThreadRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.creatingMessageThread.completed).to.be.null;

        let successAction = actions.sync.createMessageThreadSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.creatingMessageThread.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.creatingMessageThread.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingMessageThread.inProgress to be true', () => {
        let action = actions.sync.createMessageThreadRequest();

        expect(initialState.creatingMessageThread.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.creatingMessageThread.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set creatingMessageThread.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.creatingMessageThread.completed).to.be.null;

        let failureAction = actions.sync.createMessageThreadFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.creatingMessageThread.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingMessageThread.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { creatingMessageThread: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.createMessageThreadFailure(error);

        expect(initialStateForTest.creatingMessageThread.inProgress).to.be.true;
        expect(initialStateForTest.creatingMessageThread.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingMessageThread.inProgress).to.be.false;
        expect(state.creatingMessageThread.notification.type).to.equal('error');
        expect(state.creatingMessageThread.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set creatingMessageThread.completed to be true', () => {
        expect(initialState.creatingMessageThread.completed).to.be.null;

        let successAction = actions.sync.createMessageThreadSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.creatingMessageThread.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingMessageThread.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { creatingMessageThread: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let messageThread = 'some message thread';
        let action = actions.sync.createMessageThreadSuccess(messageThread);

        expect(initialStateForTest.creatingMessageThread.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingMessageThread.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('editMessageThread', () => {
    describe('request', () => {
      it('should leave editingMessageThread.completed unchanged', () => {
        expect(initialState.editingMessageThread.completed).to.be.null;

        let requestAction = actions.sync.editMessageThreadRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.editingMessageThread.completed).to.be.null;

        let successAction = actions.sync.editMessageThreadSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.editingMessageThread.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.editingMessageThread.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set editingMessageThread.inProgress to be true', () => {
        let action = actions.sync.editMessageThreadRequest();

        expect(initialState.editingMessageThread.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.editingMessageThread.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set editingMessageThread.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.editingMessageThread.completed).to.be.null;

        let failureAction = actions.sync.editMessageThreadFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.editingMessageThread.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set editingMessageThread.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { editingMessageThread: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.editMessageThreadFailure(error);

        expect(initialStateForTest.editingMessageThread.inProgress).to.be.true;
        expect(initialStateForTest.editingMessageThread.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.editingMessageThread.inProgress).to.be.false;
        expect(state.editingMessageThread.notification.type).to.equal('error');
        expect(state.editingMessageThread.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set editingMessageThread.completed to be true', () => {
        expect(initialState.editingMessageThread.completed).to.be.null;

        let successAction = actions.sync.editMessageThreadSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.editingMessageThread.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set editingMessageThread.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { editingMessageThread: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let messageThread = 'some message thread';
        let action = actions.sync.editMessageThreadSuccess(messageThread);

        expect(initialStateForTest.editingMessageThread.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.editingMessageThread.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('generatePDF', () => {
    describe('request', () => {
      it('should leave generatingPDF.completed unchanged', () => {
        expect(initialState.generatingPDF.completed).to.be.null;

        let requestAction = actions.worker.generatePDFRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.generatingPDF.completed).to.be.null;

        let successAction = actions.worker.generatePDFSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.generatingPDF.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.generatingPDF.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set generatingPDF.inProgress to be true', () => {
        let action = actions.worker.generatePDFRequest();

        expect(initialState.generatingPDF.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.generatingPDF.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set generatingPDF.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.generatingPDF.completed).to.be.null;

        let failureAction = actions.worker.generatePDFFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.generatingPDF.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set generatingPDF.inProgress to be false and set error', () => {
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
      it('should set generatingPDF.completed to be true', () => {
        expect(initialState.generatingPDF.completed).to.be.null;

        let successAction = actions.worker.generatePDFSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.generatingPDF.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set generatingPDF.inProgress to be false', () => {
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

  describe('removingGeneratedPDFS', () => {
    describe('success', () => {
      it('should set generatingPDF to it\'s original state', () => {
        let initialStateForTest = _.merge({}, initialState, { generatingPDF: { inProgress: false, completed: true } });
        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.worker.removeGeneratedPDFS();
        let state = reducer(initialStateForTest, action);

        expect(state.generatingPDF).to.eql(initialState.generatingPDF);
      });
    });
  });

  describe('dataWorkerAddData', () => {
    describe('request', () => {
      it('should leave addingData.completed unchanged', () => {
        expect(initialState.addingData.completed).to.be.null;

        let requestAction = actions.worker.dataWorkerAddDataRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.addingData.completed).to.be.null;

        let successAction = actions.worker.dataWorkerAddDataSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.addingData.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.addingData.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set addingData.inProgress to be true', () => {
        let action = actions.worker.dataWorkerAddDataRequest();

        expect(initialState.addingData.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.addingData.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set addingData.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.addingData.completed).to.be.null;

        let failureAction = actions.worker.dataWorkerAddDataFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.addingData.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set addingData.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { addingData: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.worker.dataWorkerAddDataFailure(error);

        expect(initialStateForTest.addingData.inProgress).to.be.true;
        expect(initialStateForTest.addingData.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.addingData.inProgress).to.be.false;
        expect(state.addingData.notification.type).to.equal('error');
        expect(state.addingData.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set addingData.completed to be true', () => {
        expect(initialState.addingData.completed).to.be.null;

        let successAction = actions.worker.dataWorkerAddDataSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.addingData.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set addingData.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { addingData: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let result = 'some results';
        let action = actions.worker.dataWorkerAddDataSuccess(result);

        expect(initialStateForTest.addingData.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.addingData.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('dataWorkerRemoveData', () => {
    describe('request', () => {
      it('should leave removingData.completed unchanged', () => {
        expect(initialState.removingData.completed).to.be.null;

        let requestAction = actions.worker.dataWorkerRemoveDataRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.removingData.completed).to.be.null;

        let successAction = actions.worker.dataWorkerRemoveDataSuccess();
        let successState = reducer(requestState, successAction);

        expect(successState.removingData.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.removingData.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingData.inProgress to be true', () => {
        let action = actions.worker.dataWorkerRemoveDataRequest();

        expect(initialState.removingData.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.removingData.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set removingData.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.removingData.completed).to.be.null;

        let failureAction = actions.worker.dataWorkerRemoveDataFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.removingData.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingData.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { removingData: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.worker.dataWorkerRemoveDataFailure(error);

        expect(initialStateForTest.removingData.inProgress).to.be.true;
        expect(initialStateForTest.removingData.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.removingData.inProgress).to.be.false;
        expect(state.removingData.notification.type).to.equal('error');
        expect(state.removingData.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set removingData.completed to be true', () => {
        expect(initialState.removingData.completed).to.be.null;

        let successAction = actions.worker.dataWorkerRemoveDataSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.removingData.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set removingData.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { removingData: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let result = 'some results';
        let action = actions.worker.dataWorkerRemoveDataSuccess(result);

        expect(initialStateForTest.removingData.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.removingData.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set queryingData to it\'s initial working state', () => {
        let initialStateForTest = _.merge({}, initialState, { queryingData: { inProgress : true, completed: true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let result = 'some results';
        let action = actions.worker.dataWorkerRemoveDataSuccess(result);

        let state = reducer(initialStateForTest, action);

        expect(state.queryingData).to.be.eql(initialState.queryingData);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('dataWorkerUpdateDatum', () => {
    describe('request', () => {
      it('should leave updatingDatum.completed unchanged', () => {
        expect(initialState.updatingDatum.completed).to.be.null;

        let requestAction = actions.worker.dataWorkerUpdateDatumRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingDatum.completed).to.be.null;

        let successAction = actions.worker.dataWorkerUpdateDatumSuccess();
        let successState = reducer(requestState, successAction);

        expect(successState.updatingDatum.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingDatum.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingDatum.inProgress to be true', () => {
        let action = actions.worker.dataWorkerUpdateDatumRequest();

        expect(initialState.updatingDatum.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.updatingDatum.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set updatingDatum.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingDatum.completed).to.be.null;

        let failureAction = actions.worker.dataWorkerUpdateDatumFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingDatum.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingDatum.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { updatingDatum: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.worker.dataWorkerUpdateDatumFailure(error);

        expect(initialStateForTest.updatingDatum.inProgress).to.be.true;
        expect(initialStateForTest.updatingDatum.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingDatum.inProgress).to.be.false;
        expect(state.updatingDatum.notification.type).to.equal('error');
        expect(state.updatingDatum.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set updatingDatum.completed to be true', () => {
        expect(initialState.updatingDatum.completed).to.be.null;

        let successAction = actions.worker.dataWorkerUpdateDatumSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingDatum.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingDatum.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { updatingDatum: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let result = 'some results';
        let action = actions.worker.dataWorkerUpdateDatumSuccess(result);

        expect(initialStateForTest.updatingDatum.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingDatum.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

describe('dataWorkerQueryData', () => {
    describe('request', () => {
      it('should leave queryingData.completed unchanged', () => {
        expect(initialState.queryingData.completed).to.be.null;

      let requestAction = actions.worker.dataWorkerQueryDataRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.queryingData.completed).to.be.null;

      let successAction = actions.worker.dataWorkerQueryDataSuccess();
        let successState = reducer(requestState, successAction);

        expect(successState.queryingData.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.queryingData.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set queryingData.inProgress to be true', () => {
      let action = actions.worker.dataWorkerQueryDataRequest();

        expect(initialState.queryingData.inProgress).to.be.false;

        let state = reducer(initialState, action);
        expect(state.queryingData.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set queryingData.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.queryingData.completed).to.be.null;

      let failureAction = actions.worker.dataWorkerQueryDataFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.queryingData.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set queryingData.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, { queryingData: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
      let action = actions.worker.dataWorkerQueryDataFailure(error);

        expect(initialStateForTest.queryingData.inProgress).to.be.true;
        expect(initialStateForTest.queryingData.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.queryingData.inProgress).to.be.false;
        expect(state.queryingData.notification.type).to.equal('error');
        expect(state.queryingData.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set queryingData.completed to be true', () => {
        expect(initialState.queryingData.completed).to.be.null;

      let successAction = actions.worker.dataWorkerQueryDataSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.queryingData.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set queryingData.inProgress to be false', () => {
        let initialStateForTest = _.merge({}, initialState, { queryingData: { inProgress : true, notification: null } });
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let result = 'some results';
      let action = actions.worker.dataWorkerQueryDataSuccess(result);

        expect(initialStateForTest.queryingData.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.queryingData.inProgress).to.be.false;
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

  describe('getClinics', () => {
    describe('request', () => {
      it('should leave fetchingClinics.completed unchanged', () => {
        expect(initialState.fetchingClinics.completed).to.be.null;

        let requestAction = actions.sync.getClinicsRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingClinics.completed).to.be.null;

        let successAction = actions.sync.getClinicsSuccess('foo', {some:'option'});
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingClinics.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingClinics.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinics.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.getClinicsRequest();

        expect(initialStateForTest.fetchingClinics.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingClinics.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingClinics.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingClinics.completed).to.be.null;

        let failureAction = actions.sync.getClinicsFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingClinics.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinics.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinics: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.getClinicsFailure(error);

        expect(initialStateForTest.fetchingClinics.inProgress).to.be.true;
        expect(initialStateForTest.fetchingClinics.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinics.inProgress).to.be.false;
        expect(state.fetchingClinics.notification.type).to.equal('error');
        expect(state.fetchingClinics.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingClinics.completed to be true', () => {
        expect(initialState.fetchingClinics.completed).to.be.null;

        let successAction = actions.sync.getClinicsSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingClinics.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinics.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinics: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.getClinicsSuccess([ {clinic: {id:1} } ]);

        expect(initialStateForTest.fetchingClinics.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinics.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('createClinic', () => {
    describe('request', () => {
      it('should leave creatingClinic.completed unchanged', () => {
        expect(initialState.creatingClinic.completed).to.be.null;

        let requestAction = actions.sync.createClinicRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.creatingClinic.completed).to.be.null;

        let successAction = actions.sync.createClinicSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.creatingClinic.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.creatingClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingClinic.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.createClinicRequest();

        expect(initialStateForTest.creatingClinic.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.creatingClinic.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set creatingClinic.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.creatingClinic.completed).to.be.null;

        let failureAction = actions.sync.createClinicFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.creatingClinic.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingClinic.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          creatingClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.createClinicFailure(error);

        expect(initialStateForTest.creatingClinic.inProgress).to.be.true;
        expect(initialStateForTest.creatingClinic.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingClinic.inProgress).to.be.false;
        expect(state.creatingClinic.notification.type).to.equal('error');
        expect(state.creatingClinic.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set creatingClinic.completed to be true', () => {
        expect(initialState.creatingClinic.completed).to.be.null;

        let successAction = actions.sync.createClinicSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.creatingClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingClinic.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          creatingClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.createClinicSuccess({id:'clinicId'});

        expect(initialStateForTest.creatingClinic.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingClinic.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchClinic', () => {
    describe('request', () => {
      it('should leave fetchingClinic.completed unchanged', () => {
        expect(initialState.fetchingClinic.completed).to.be.null;

        let requestAction = actions.sync.fetchClinicRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingClinic.completed).to.be.null;

        let successAction = actions.sync.fetchClinicSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingClinic.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinic.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.fetchClinicRequest();

        expect(initialStateForTest.fetchingClinic.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingClinic.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingClinic.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingClinic.completed).to.be.null;

        let failureAction = actions.sync.fetchClinicFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingClinic.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinic.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchClinicFailure(error);

        expect(initialStateForTest.fetchingClinic.inProgress).to.be.true;
        expect(initialStateForTest.fetchingClinic.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinic.inProgress).to.be.false;
        expect(state.fetchingClinic.notification.type).to.equal('error');
        expect(state.fetchingClinic.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingClinic.completed to be true', () => {
        expect(initialState.fetchingClinic.completed).to.be.null;

        let successAction = actions.sync.fetchClinicSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinic.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchClinicSuccess({id:'clinicId'});

        expect(initialStateForTest.fetchingClinic.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinic.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('updateClinic', () => {
    describe('request', () => {
      it('should leave updatingClinic.completed unchanged', () => {
        expect(initialState.updatingClinic.completed).to.be.null;

        let requestAction = actions.sync.updateClinicRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingClinic.completed).to.be.null;

        let successAction = actions.sync.updateClinicSuccess('foo', {some:'update'});
        let successState = reducer(requestState, successAction);

        expect(successState.updatingClinic.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinic.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.updateClinicRequest();

        expect(initialStateForTest.updatingClinic.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.updatingClinic.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set updatingClinic.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingClinic.completed).to.be.null;

        let failureAction = actions.sync.updateClinicFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingClinic.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinic.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          updatingClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.updateClinicFailure(error);

        expect(initialStateForTest.updatingClinic.inProgress).to.be.true;
        expect(initialStateForTest.updatingClinic.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingClinic.inProgress).to.be.false;
        expect(state.updatingClinic.notification.type).to.equal('error');
        expect(state.updatingClinic.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set updatingClinic.completed to be true', () => {
        expect(initialState.updatingClinic.completed).to.be.null;

        let successAction = actions.sync.updateClinicSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinic.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          updatingClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.updateClinicSuccess('clinicId', {id:'clinicId', name:'newName'});

        expect(initialStateForTest.updatingClinic.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingClinic.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchCliniciansFromClinic', () => {
    describe('request', () => {
      it('should leave fetchingCliniciansFromClinic.completed unchanged', () => {
        expect(initialState.fetchingCliniciansFromClinic.completed).to.be.null;

        let requestAction = actions.sync.fetchCliniciansFromClinicRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingCliniciansFromClinic.completed).to.be.null;

        let successAction = actions.sync.fetchCliniciansFromClinicSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingCliniciansFromClinic.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingCliniciansFromClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingCliniciansFromClinic.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.fetchCliniciansFromClinicRequest();

        expect(initialStateForTest.fetchingCliniciansFromClinic.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingCliniciansFromClinic.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingCliniciansFromClinic.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingCliniciansFromClinic.completed).to.be.null;

        let failureAction = actions.sync.fetchCliniciansFromClinicFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingCliniciansFromClinic.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingCliniciansFromClinic.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingCliniciansFromClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchCliniciansFromClinicFailure(error);

        expect(initialStateForTest.fetchingCliniciansFromClinic.inProgress).to.be.true;
        expect(initialStateForTest.fetchingCliniciansFromClinic.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingCliniciansFromClinic.inProgress).to.be.false;
        expect(state.fetchingCliniciansFromClinic.notification.type).to.equal('error');
        expect(state.fetchingCliniciansFromClinic.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingCliniciansFromClinic.completed to be true', () => {
        expect(initialState.fetchingCliniciansFromClinic.completed).to.be.null;

        let successAction = actions.sync.fetchCliniciansFromClinicSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingCliniciansFromClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingCliniciansFromClinic.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingCliniciansFromClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchCliniciansFromClinicSuccess([{id:'clinicianId'}]);

        expect(initialStateForTest.fetchingCliniciansFromClinic.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingCliniciansFromClinic.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchClinician', () => {
    describe('request', () => {
      it('should leave fetchingClinician.completed unchanged', () => {
        expect(initialState.fetchingClinician.completed).to.be.null;

        let requestAction = actions.sync.fetchClinicianRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingClinician.completed).to.be.null;

        let successAction = actions.sync.fetchClinicianSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingClinician.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingClinician.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinician.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.fetchClinicianRequest();

        expect(initialStateForTest.fetchingClinician.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingClinician.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingClinician.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingClinician.completed).to.be.null;

        let failureAction = actions.sync.fetchClinicianFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingClinician.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinician.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinician: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchClinicianFailure(error);

        expect(initialStateForTest.fetchingClinician.inProgress).to.be.true;
        expect(initialStateForTest.fetchingClinician.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinician.inProgress).to.be.false;
        expect(state.fetchingClinician.notification.type).to.equal('error');
        expect(state.fetchingClinician.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingClinician.completed to be true', () => {
        expect(initialState.fetchingClinician.completed).to.be.null;

        let successAction = actions.sync.fetchClinicianSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingClinician.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinician.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinician: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchClinicianSuccess({id:'clinicianId'});

        expect(initialStateForTest.fetchingClinician.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinician.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('updateClinician', () => {
    describe('request', () => {
      it('should set updatingClinician.completed to null', () => {
        expect(initialState.updatingClinician.completed).to.be.null;

        let requestAction = actions.sync.updateClinicianRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingClinician.completed).to.be.null;

        let successAction = actions.sync.updateClinicianSuccess('foo', 'bar', 'baz');
        let successState = reducer(requestState, successAction);

        expect(successState.updatingClinician.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingClinician.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinician.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.updateClinicianRequest();

        expect(initialStateForTest.updatingClinician.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.updatingClinician.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set updatingClinician.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingClinician.completed).to.be.null;

        let failureAction = actions.sync.updateClinicianFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingClinician.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinician.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          updatingClinician: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.updateClinicianFailure(error);

        expect(initialStateForTest.updatingClinician.inProgress).to.be.true;
        expect(initialStateForTest.updatingClinician.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingClinician.inProgress).to.be.false;
        expect(state.updatingClinician.notification.type).to.equal('error');
        expect(state.updatingClinician.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set updatingClinician.completed to be true', () => {
        expect(initialState.updatingClinician.completed).to.be.null;

        let successAction = actions.sync.updateClinicianSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingClinician.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinician.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          updatingClinician: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.updateClinicianSuccess('clinicId','clinicianId',{id:'clinicianId', name:'newName'});

        expect(initialStateForTest.updatingClinician.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingClinician.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('deleteClinicianFromClinic', () => {
    describe('request', () => {
      it('should set deletingClinicianFromClinic.completed to null', () => {
        expect(initialState.deletingClinicianFromClinic.completed).to.be.null;

        let requestAction = actions.sync.deleteClinicianFromClinicRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.deletingClinicianFromClinic.completed).to.be.null;

        let successAction = actions.sync.deleteClinicianFromClinicSuccess('foo', 'bar');
        let successState = reducer(requestState, successAction);

        expect(successState.deletingClinicianFromClinic.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.deletingClinicianFromClinic.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingClinicianFromClinic.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.deleteClinicianFromClinicRequest();

        expect(initialStateForTest.deletingClinicianFromClinic.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.deletingClinicianFromClinic.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set deletingClinicianFromClinic.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.deletingClinicianFromClinic.completed).to.be.null;

        let failureAction = actions.sync.deleteClinicianFromClinicFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.deletingClinicianFromClinic.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingClinicianFromClinic.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          deletingClinicianFromClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.deleteClinicianFromClinicFailure(error);

        expect(initialStateForTest.deletingClinicianFromClinic.inProgress).to.be.true;
        expect(initialStateForTest.deletingClinicianFromClinic.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.deletingClinicianFromClinic.inProgress).to.be.false;
        expect(state.deletingClinicianFromClinic.notification.type).to.equal('error');
        expect(state.deletingClinicianFromClinic.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set deletingClinicianFromClinic.completed to be true', () => {
        expect(initialState.deletingClinicianFromClinic.completed).to.be.null;

        let successAction = actions.sync.deleteClinicianFromClinicSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.deletingClinicianFromClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingClinicianFromClinic.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          deletingClinicianFromClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.deleteClinicianFromClinicSuccess('clinicianId', 'clinicId');

        expect(initialStateForTest.deletingClinicianFromClinic.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.deletingClinicianFromClinic.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchPatientsForClinic', () => {
    describe('request', () => {
      it('should leave fetchingPatientsForClinic.completed unchanged', () => {
        expect(initialState.fetchingPatientsForClinic.completed).to.be.null;

        let requestAction = actions.sync.fetchPatientsForClinicRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingPatientsForClinic.completed).to.be.null;

        let successAction = actions.sync.fetchPatientsForClinicSuccess('foo', 'bar');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingPatientsForClinic.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingPatientsForClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientsForClinic.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.fetchPatientsForClinicRequest();

        expect(initialStateForTest.fetchingPatientsForClinic.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingPatientsForClinic.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingPatientsForClinic.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingPatientsForClinic.completed).to.be.null;

        let failureAction = actions.sync.fetchPatientsForClinicFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingPatientsForClinic.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientsForClinic.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingPatientsForClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchPatientsForClinicFailure(error);

        expect(initialStateForTest.fetchingPatientsForClinic.inProgress).to.be.true;
        expect(initialStateForTest.fetchingPatientsForClinic.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingPatientsForClinic.inProgress).to.be.false;
        expect(state.fetchingPatientsForClinic.notification.type).to.equal('error');
        expect(state.fetchingPatientsForClinic.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingPatientsForClinic.completed to be true', () => {
        expect(initialState.fetchingPatientsForClinic.completed).to.be.null;

        let successAction = actions.sync.fetchPatientsForClinicSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingPatientsForClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientsForClinic.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingPatientsForClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchPatientsForClinicSuccess([{id:'patientId', name:'patient name'}]);

        expect(initialStateForTest.fetchingPatientsForClinic.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingPatientsForClinic.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('createCustodialAccount', () => {
    describe('request', () => {
      it('should set creatingCustodialAccount.completed to null', () => {
        expect(initialState.creatingCustodialAccount.completed).to.be.null;

        let requestAction = actions.sync.createCustodialAccountRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.creatingCustodialAccount.completed).to.be.null;

        let successAction = actions.sync.createCustodialAccountSuccess('foo', 'bar', 'baz');
        let successState = reducer(requestState, successAction);

        expect(successState.creatingCustodialAccount.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.creatingCustodialAccount.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingCustodialAccount.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.createCustodialAccountRequest();

        expect(initialStateForTest.creatingCustodialAccount.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.creatingCustodialAccount.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set creatingCustodialAccount.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.creatingCustodialAccount.completed).to.be.null;

        let failureAction = actions.sync.createCustodialAccountFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.creatingCustodialAccount.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingCustodialAccount.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          creatingCustodialAccount: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.createCustodialAccountFailure(error);

        expect(initialStateForTest.creatingCustodialAccount.inProgress).to.be.true;
        expect(initialStateForTest.creatingCustodialAccount.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingCustodialAccount.inProgress).to.be.false;
        expect(state.creatingCustodialAccount.notification.type).to.equal('error');
        expect(state.creatingCustodialAccount.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set creatingCustodialAccount.completed to be true', () => {
        expect(initialState.creatingCustodialAccount.completed).to.be.null;

        let successAction = actions.sync.createCustodialAccountSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.creatingCustodialAccount.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set creatingCustodialAccount.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          creatingCustodialAccount: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.createCustodialAccountSuccess('clinicId', {id:'patientId'},'patientId');

        expect(initialStateForTest.creatingCustodialAccount.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.creatingCustodialAccount.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchPatientFromClinic', () => {
    describe('request', () => {
      it('should leave fetchingPatientFromClinic.completed unchanged', () => {
        expect(initialState.fetchingPatientFromClinic.completed).to.be.null;

        let requestAction = actions.sync.fetchPatientFromClinicRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingPatientFromClinic.completed).to.be.null;

        let successAction = actions.sync.fetchPatientFromClinicSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingPatientFromClinic.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingPatientFromClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientFromClinic.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.fetchPatientFromClinicRequest();

        expect(initialStateForTest.fetchingPatientFromClinic.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingPatientFromClinic.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingPatientFromClinic.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingPatientFromClinic.completed).to.be.null;

        let failureAction = actions.sync.fetchPatientFromClinicFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingPatientFromClinic.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientFromClinic.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingPatientFromClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchPatientFromClinicFailure(error);

        expect(initialStateForTest.fetchingPatientFromClinic.inProgress).to.be.true;
        expect(initialStateForTest.fetchingPatientFromClinic.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingPatientFromClinic.inProgress).to.be.false;
        expect(state.fetchingPatientFromClinic.notification.type).to.equal('error');
        expect(state.fetchingPatientFromClinic.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingPatientFromClinic.completed to be true', () => {
        expect(initialState.fetchingPatientFromClinic.completed).to.be.null;

        let successAction = actions.sync.fetchPatientFromClinicSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingPatientFromClinic.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientFromClinic.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingPatientFromClinic: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchPatientFromClinicSuccess({id:'patientId'});

        expect(initialStateForTest.fetchingPatientFromClinic.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingPatientFromClinic.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('updateClinicPatient', () => {
    describe('request', () => {
      it('should leave updatingClinicPatient.completed unchanged', () => {
        expect(initialState.updatingClinicPatient.completed).to.be.null;

        let requestAction = actions.sync.updateClinicPatientRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingClinicPatient.completed).to.be.null;

        let successAction = actions.sync.updateClinicPatientSuccess('foo', 'bar', 'baz');
        let successState = reducer(requestState, successAction);

        expect(successState.updatingClinicPatient.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingClinicPatient.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinicPatient.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.updateClinicPatientRequest();

        expect(initialStateForTest.updatingClinicPatient.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.updatingClinicPatient.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set updatingClinicPatient.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingClinicPatient.completed).to.be.null;

        let failureAction = actions.sync.updateClinicPatientFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingClinicPatient.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinicPatient.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          updatingClinicPatient: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.updateClinicPatientFailure(error);

        expect(initialStateForTest.updatingClinicPatient.inProgress).to.be.true;
        expect(initialStateForTest.updatingClinicPatient.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingClinicPatient.inProgress).to.be.false;
        expect(state.updatingClinicPatient.notification.type).to.equal('error');
        expect(state.updatingClinicPatient.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set updatingClinicPatient.completed to be true', () => {
        expect(initialState.updatingClinicPatient.completed).to.be.null;

        let successAction = actions.sync.updateClinicPatientSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingClinicPatient.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingClinicPatient.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          updatingClinicPatient: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.updateClinicPatientSuccess('clinicId','patientId',{id:'patientId', name:'newName'});

        expect(initialStateForTest.updatingClinicPatient.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingClinicPatient.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('sendClinicianInvite', () => {
    describe('request', () => {
      it('should set sendingClinicianInvite.completed to null', () => {
        expect(initialState.sendingClinicianInvite.completed).to.be.null;

        let requestAction = actions.sync.sendClinicianInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.sendingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.sendClinicianInviteSuccess('foo', 'bar');
        let successState = reducer(requestState, successAction);

        expect(successState.sendingClinicianInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.sendingClinicianInvite.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set sendingClinicianInvite.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.sendClinicianInviteRequest();

        expect(initialStateForTest.sendingClinicianInvite.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.sendingClinicianInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set sendingClinicianInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.sendingClinicianInvite.completed).to.be.null;

        let failureAction = actions.sync.sendClinicianInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.sendingClinicianInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set sendingClinicianInvite.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          sendingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.sendClinicianInviteFailure(error);

        expect(initialStateForTest.sendingClinicianInvite.inProgress).to.be.true;
        expect(initialStateForTest.sendingClinicianInvite.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.sendingClinicianInvite.inProgress).to.be.false;
        expect(state.sendingClinicianInvite.notification.type).to.equal('error');
        expect(state.sendingClinicianInvite.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set sendingClinicianInvite.completed to be true', () => {
        expect(initialState.sendingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.sendClinicianInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.sendingClinicianInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set sendingClinicianInvite.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          sendingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.sendClinicianInviteSuccess({id:'clinicianId'});

        expect(initialStateForTest.sendingClinicianInvite.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.sendingClinicianInvite.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('resendClinicianInvite', () => {
    describe('request', () => {
      it('should leave resendingClinicianInvite.completed unchanged', () => {
        expect(initialState.resendingClinicianInvite.completed).to.be.null;

        let requestAction = actions.sync.resendClinicianInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.resendingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.resendClinicianInviteSuccess('foo', 'bar');
        let successState = reducer(requestState, successAction);

        expect(successState.resendingClinicianInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.resendingClinicianInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set resendingClinicianInvite.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.resendClinicianInviteRequest();

        expect(initialStateForTest.resendingClinicianInvite.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.resendingClinicianInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set resendingClinicianInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.resendingClinicianInvite.completed).to.be.null;

        let failureAction = actions.sync.resendClinicianInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.resendingClinicianInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set resendingClinicianInvite.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          resendingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.resendClinicianInviteFailure(error);

        expect(initialStateForTest.resendingClinicianInvite.inProgress).to.be.true;
        expect(initialStateForTest.resendingClinicianInvite.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.resendingClinicianInvite.inProgress).to.be.false;
        expect(state.resendingClinicianInvite.notification.type).to.equal('error');
        expect(state.resendingClinicianInvite.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set resendingClinicianInvite.completed to be true', () => {
        expect(initialState.resendingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.resendClinicianInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.resendingClinicianInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set resendingClinicianInvite.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          resendingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.resendClinicianInviteSuccess({});

        expect(initialStateForTest.resendingClinicianInvite.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.resendingClinicianInvite.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('deleteClinicianInvite', () => {
    describe('request', () => {
      it('should set deletingClinicianInvite.completed to null', () => {
        expect(initialState.deletingClinicianInvite.completed).to.be.null;

        let requestAction = actions.sync.deleteClinicianInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.deletingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.deleteClinicianInviteSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.deletingClinicianInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.deletingClinicianInvite.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingClinicianInvite.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.deleteClinicianInviteRequest();

        expect(initialStateForTest.deletingClinicianInvite.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.deletingClinicianInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set deletingClinicianInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.deletingClinicianInvite.completed).to.be.null;

        let failureAction = actions.sync.deleteClinicianInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.deletingClinicianInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingClinicianInvite.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          deletingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.deleteClinicianInviteFailure(error);

        expect(initialStateForTest.deletingClinicianInvite.inProgress).to.be.true;
        expect(initialStateForTest.deletingClinicianInvite.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.deletingClinicianInvite.inProgress).to.be.false;
        expect(state.deletingClinicianInvite.notification.type).to.equal('error');
        expect(state.deletingClinicianInvite.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set deletingClinicianInvite.completed to be true', () => {
        expect(initialState.deletingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.deleteClinicianInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.deletingClinicianInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set deletingClinicianInvite.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          deletingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.deleteClinicianInviteSuccess({});

        expect(initialStateForTest.deletingClinicianInvite.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.deletingClinicianInvite.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchPatientInvites', () => {
    describe('request', () => {
      it('should leave fetchingPatientInvites.completed unchanged', () => {
        expect(initialState.fetchingPatientInvites.completed).to.be.null;

        let requestAction = actions.sync.fetchPatientInvitesRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingPatientInvites.completed).to.be.null;

        let successAction = actions.sync.fetchPatientInvitesSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingPatientInvites.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingPatientInvites.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientInvites.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.fetchPatientInvitesRequest();

        expect(initialStateForTest.fetchingPatientInvites.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingPatientInvites.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingPatientInvites.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingPatientInvites.completed).to.be.null;

        let failureAction = actions.sync.fetchPatientInvitesFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingPatientInvites.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientInvites.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingPatientInvites: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchPatientInvitesFailure(error);

        expect(initialStateForTest.fetchingPatientInvites.inProgress).to.be.true;
        expect(initialStateForTest.fetchingPatientInvites.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingPatientInvites.inProgress).to.be.false;
        expect(state.fetchingPatientInvites.notification.type).to.equal('error');
        expect(state.fetchingPatientInvites.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingPatientInvites.completed to be true', () => {
        expect(initialState.fetchingPatientInvites.completed).to.be.null;

        let successAction = actions.sync.fetchPatientInvitesSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingPatientInvites.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingPatientInvites.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingPatientInvites: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchPatientInvitesSuccess(['inviteId','inviteId2']);

        expect(initialStateForTest.fetchingPatientInvites.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingPatientInvites.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('acceptPatientInvitation', () => {
    describe('request', () => {
      it('should set acceptingPatientInvitation.completed to null', () => {
        expect(initialState.acceptingPatientInvitation.completed).to.be.null;

        let requestAction = actions.sync.acceptPatientInvitationRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.acceptingPatientInvitation.completed).to.be.null;

        let successAction = actions.sync.acceptPatientInvitationSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.acceptingPatientInvitation.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.acceptingPatientInvitation.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingPatientInvitation.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.acceptPatientInvitationRequest();

        expect(initialStateForTest.acceptingPatientInvitation.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.acceptingPatientInvitation.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set acceptingPatientInvitation.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.acceptingPatientInvitation.completed).to.be.null;

        let failureAction = actions.sync.acceptPatientInvitationFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.acceptingPatientInvitation.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingPatientInvitation.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          acceptingPatientInvitation: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.acceptPatientInvitationFailure(error);

        expect(initialStateForTest.acceptingPatientInvitation.inProgress).to.be.true;
        expect(initialStateForTest.acceptingPatientInvitation.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.acceptingPatientInvitation.inProgress).to.be.false;
        expect(state.acceptingPatientInvitation.notification.type).to.equal('error');
        expect(state.acceptingPatientInvitation.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set acceptingPatientInvitation.completed to be true', () => {
        expect(initialState.acceptingPatientInvitation.completed).to.be.null;

        let successAction = actions.sync.acceptPatientInvitationSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.acceptingPatientInvitation.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingPatientInvitation.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          acceptingPatientInvitation: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.acceptPatientInvitationSuccess({});

        expect(initialStateForTest.acceptingPatientInvitation.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.acceptingPatientInvitation.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('updatePatientPermissions', () => {
    describe('request', () => {
      it('should leave updatingPatientPermissions.completed unchanged', () => {
        expect(initialState.updatingPatientPermissions.completed).to.be.null;

        let requestAction = actions.sync.updatePatientPermissionsRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.updatingPatientPermissions.completed).to.be.null;

        let successAction = actions.sync.updatePatientPermissionsSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.updatingPatientPermissions.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.updatingPatientPermissions.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatientPermissions.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.updatePatientPermissionsRequest();

        expect(initialStateForTest.updatingPatientPermissions.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.updatingPatientPermissions.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set updatingPatientPermissions.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.updatingPatientPermissions.completed).to.be.null;

        let failureAction = actions.sync.updatePatientPermissionsFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.updatingPatientPermissions.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatientPermissions.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          updatingPatientPermissions: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.updatePatientPermissionsFailure(error);

        expect(initialStateForTest.updatingPatientPermissions.inProgress).to.be.true;
        expect(initialStateForTest.updatingPatientPermissions.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingPatientPermissions.inProgress).to.be.false;
        expect(state.updatingPatientPermissions.notification.type).to.equal('error');
        expect(state.updatingPatientPermissions.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set updatingPatientPermissions.completed to be true', () => {
        expect(initialState.updatingPatientPermissions.completed).to.be.null;

        let successAction = actions.sync.updatePatientPermissionsSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.updatingPatientPermissions.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set updatingPatientPermissions.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          updatingPatientPermissions: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.updatePatientPermissionsSuccess({view:{},upload:{}});

        expect(initialStateForTest.updatingPatientPermissions.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.updatingPatientPermissions.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchClinicsForPatient', () => {
    describe('request', () => {
      it('should leave fetchingClinicsForPatient.completed unchanged', () => {
        expect(initialState.fetchingClinicsForPatient.completed).to.be.null;

        let requestAction = actions.sync.fetchClinicsForPatientRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingClinicsForPatient.completed).to.be.null;

        let successAction = actions.sync.fetchClinicsForPatientSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingClinicsForPatient.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingClinicsForPatient.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicsForPatient.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.fetchClinicsForPatientRequest();

        expect(initialStateForTest.fetchingClinicsForPatient.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingClinicsForPatient.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingClinicsForPatient.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingClinicsForPatient.completed).to.be.null;

        let failureAction = actions.sync.fetchClinicsForPatientFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingClinicsForPatient.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicsForPatient.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinicsForPatient: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchClinicsForPatientFailure(error);

        expect(initialStateForTest.fetchingClinicsForPatient.inProgress).to.be.true;
        expect(initialStateForTest.fetchingClinicsForPatient.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinicsForPatient.inProgress).to.be.false;
        expect(state.fetchingClinicsForPatient.notification.type).to.equal('error');
        expect(state.fetchingClinicsForPatient.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingClinicsForPatient.completed to be true', () => {
        expect(initialState.fetchingClinicsForPatient.completed).to.be.null;

        let successAction = actions.sync.fetchClinicsForPatientSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingClinicsForPatient.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicsForPatient.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinicsForPatient: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchClinicsForPatientSuccess([{clinic:{id:'clinicId'}}]);

        expect(initialStateForTest.fetchingClinicsForPatient.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinicsForPatient.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('fetchClinicianInvites', () => {
    describe('request', () => {
      it('should leave fetchingClinicianInvites.completed unchanged', () => {
        expect(initialState.fetchingClinicianInvites.completed).to.be.null;

        let requestAction = actions.sync.fetchClinicianInvitesRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingClinicianInvites.completed).to.be.null;

        let successAction = actions.sync.fetchClinicianInvitesSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingClinicianInvites.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingClinicianInvites.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicianInvites.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.fetchClinicianInvitesRequest();

        expect(initialStateForTest.fetchingClinicianInvites.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingClinicianInvites.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingClinicianInvites.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingClinicianInvites.completed).to.be.null;

        let failureAction = actions.sync.fetchClinicianInvitesFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingClinicianInvites.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicianInvites.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinicianInvites: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.fetchClinicianInvitesFailure(error);

        expect(initialStateForTest.fetchingClinicianInvites.inProgress).to.be.true;
        expect(initialStateForTest.fetchingClinicianInvites.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinicianInvites.inProgress).to.be.false;
        expect(state.fetchingClinicianInvites.notification.type).to.equal('error');
        expect(state.fetchingClinicianInvites.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingClinicianInvites.completed to be true', () => {
        expect(initialState.fetchingClinicianInvites.completed).to.be.null;

        let successAction = actions.sync.fetchClinicianInvitesSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingClinicianInvites.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicianInvites.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinicianInvites: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.fetchClinicianInvitesSuccess(['inviteid','inviteid2']);

        expect(initialStateForTest.fetchingClinicianInvites.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinicianInvites.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('acceptClinicianInvite', () => {
    describe('request', () => {
      it('should set acceptingClinicianInvite.completed to null', () => {
        expect(initialState.acceptingClinicianInvite.completed).to.be.null;

        let requestAction = actions.sync.acceptClinicianInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.acceptingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.acceptClinicianInviteSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.acceptingClinicianInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.acceptingClinicianInvite.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingClinicianInvite.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.acceptClinicianInviteRequest();

        expect(initialStateForTest.acceptingClinicianInvite.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.acceptingClinicianInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set acceptingClinicianInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.acceptingClinicianInvite.completed).to.be.null;

        let failureAction = actions.sync.acceptClinicianInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.acceptingClinicianInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingClinicianInvite.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          acceptingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.acceptClinicianInviteFailure(error);

        expect(initialStateForTest.acceptingClinicianInvite.inProgress).to.be.true;
        expect(initialStateForTest.acceptingClinicianInvite.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.acceptingClinicianInvite.inProgress).to.be.false;
        expect(state.acceptingClinicianInvite.notification.type).to.equal('error');
        expect(state.acceptingClinicianInvite.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set acceptingClinicianInvite.completed to be true', () => {
        expect(initialState.acceptingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.acceptClinicianInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.acceptingClinicianInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set acceptingClinicianInvite.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          acceptingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.acceptClinicianInviteSuccess({});

        expect(initialStateForTest.acceptingClinicianInvite.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.acceptingClinicianInvite.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('dismissClinicianInvite', () => {
    describe('request', () => {
      it('should set dismissingClinicianInvite.completed to null', () => {
        expect(initialState.dismissingClinicianInvite.completed).to.be.null;

        let requestAction = actions.sync.dismissClinicianInviteRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.dismissingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.dismissClinicianInviteSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.dismissingClinicianInvite.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.dismissingClinicianInvite.completed).to.be.null;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set dismissingClinicianInvite.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.dismissClinicianInviteRequest();

        expect(initialStateForTest.dismissingClinicianInvite.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.dismissingClinicianInvite.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set dismissingClinicianInvite.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.dismissingClinicianInvite.completed).to.be.null;

        let failureAction = actions.sync.dismissClinicianInviteFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.dismissingClinicianInvite.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set dismissingClinicianInvite.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          dismissingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.dismissClinicianInviteFailure(error);

        expect(initialStateForTest.dismissingClinicianInvite.inProgress).to.be.true;
        expect(initialStateForTest.dismissingClinicianInvite.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.dismissingClinicianInvite.inProgress).to.be.false;
        expect(state.dismissingClinicianInvite.notification.type).to.equal('error');
        expect(state.dismissingClinicianInvite.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set dismissingClinicianInvite.completed to be true', () => {
        expect(initialState.dismissingClinicianInvite.completed).to.be.null;

        let successAction = actions.sync.dismissClinicianInviteSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.dismissingClinicianInvite.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set dismissingClinicianInvite.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          dismissingClinicianInvite: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.dismissClinicianInviteSuccess({});

        expect(initialStateForTest.dismissingClinicianInvite.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.dismissingClinicianInvite.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

  describe('getClinicsForClinician', () => {
    describe('request', () => {
      it('should leave fetchingClinicsForClinician.completed unchanged', () => {
        expect(initialState.fetchingClinicsForClinician.completed).to.be.null;

        let requestAction = actions.sync.getClinicsForClinicianRequest();
        let requestState = reducer(initialState, requestAction);

        expect(requestState.fetchingClinicsForClinician.completed).to.be.null;

        let successAction = actions.sync.getClinicsForClinicianSuccess('foo');
        let successState = reducer(requestState, successAction);

        expect(successState.fetchingClinicsForClinician.completed).to.be.true;

        let state = reducer(successState, requestAction);
        expect(state.fetchingClinicsForClinician.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicsForClinician.inProgress to be true', () => {
        let initialStateForTest = _.merge({}, initialState);
        let tracked = mutationTracker.trackObj(initialStateForTest);
        let action = actions.sync.getClinicsForClinicianRequest();

        expect(initialStateForTest.fetchingClinicsForClinician.inProgress).to.be.false;

        let state = reducer(initialStateForTest, action);
        expect(state.fetchingClinicsForClinician.inProgress).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('failure', () => {
      it('should set fetchingClinicsForClinician.completed to be false', () => {
        let error = new Error('Something bad happened :(');

        expect(initialState.fetchingClinicsForClinician.completed).to.be.null;

        let failureAction = actions.sync.getClinicsForClinicianFailure(error);
        let state = reducer(initialState, failureAction);

        expect(state.fetchingClinicsForClinician.completed).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicsForClinician.inProgress to be false and set error', () => {
        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinicsForClinician: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);
        let error = new Error('Something bad happened :(');
        let action = actions.sync.getClinicsForClinicianFailure(error);

        expect(initialStateForTest.fetchingClinicsForClinician.inProgress).to.be.true;
        expect(initialStateForTest.fetchingClinicsForClinician.notification).to.be.null;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinicsForClinician.inProgress).to.be.false;
        expect(state.fetchingClinicsForClinician.notification.type).to.equal('error');
        expect(state.fetchingClinicsForClinician.notification.message).to.equal(error.message);
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });

    describe('success', () => {
      it('should set fetchingClinicsForClinician.completed to be true', () => {
        expect(initialState.fetchingClinicsForClinician.completed).to.be.null;

        let successAction = actions.sync.getClinicsForClinicianSuccess('foo');
        let state = reducer(initialState, successAction);

        expect(state.fetchingClinicsForClinician.completed).to.be.true;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should set fetchingClinicsForClinician.inProgress to be false', () => {

        let initialStateForTest = _.merge({}, initialState, {
          fetchingClinicsForClinician: { inProgress: true, notification: null },
        });

        let tracked = mutationTracker.trackObj(initialStateForTest);

        let action = actions.sync.getClinicsForClinicianSuccess('strava', 'blah');

        expect(initialStateForTest.fetchingClinicsForClinician.inProgress).to.be.true;

        let state = reducer(initialStateForTest, action);

        expect(state.fetchingClinicsForClinician.inProgress).to.be.false;
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });
    });
  });

});
