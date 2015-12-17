/* global chai */
/* global sinon */
/* global describe */
/* global it */

import reducer from '../../../../app/redux/reducers/index';

import actions from '../../../../app/redux/actions/index';

import initialState from '../../../../app/redux/reducers/initialState';


var expect = chai.expect;

describe('reducers', () => {
  describe('access', () => {
    describe('loginRequest', () => {
      it('should set working.loggingIn to true', () => {
        let action = actions.sync.loginRequest();
        expect(initialState.working.loggingIn).to.be.false;

        let state = reducer(initialState, action);
        expect(state.working.loggingIn).to.be.true;
      });
    });

    describe('loginFailure', () => {
      it('should set working.loggingIn to false', () => {
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

    describe('loginSuccess', () => {
      it('should set working.loggingIn to be false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.loginRequest();
        expect(initialState.working.loggingIn).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.loggingIn).to.be.true;

        let failureAction = actions.sync.loginSuccess(user);
        let state = reducer(intermediateState, failureAction);
        expect(state.working.loggingIn).to.be.false;
        expect(state.isLoggedIn).to.be.true;
        expect(state.user).to.equal(user);
      });
    });

    describe('logoutRequest', () => {
      it('should set working.loggingOut to true', () => {
        let action = actions.sync.logoutRequest();
        expect(initialState.working.loggingOut).to.be.false;

        let state = reducer(initialState, action);
        expect(state.working.loggingOut).to.be.true;
      });
    });

    describe('logoutFailure', () => {
      it('should set working.loggingOut to false', () => {
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

    describe('logoutSuccess', () => {
      it('should set working.loggingOut to be false and clear session state values', () => {
        let user = 'user';

        let requestAction = actions.sync.logoutRequest();
        expect(initialState.working.loggingOut).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.loggingOut).to.be.true;

        let failureAction = actions.sync.logoutSuccess(user);
        let state = reducer(intermediateState, failureAction);
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

  describe('signup', () => {
    describe('signupRequest', () => {
      it('should set working.signingUp to true', () => {
        let action = actions.sync.signupRequest();
        expect(initialState.working.signingUp).to.be.false;

        let state = reducer(initialState, action);
        expect(state.working.signingUp).to.be.true;
      });
    });

    describe('signupFailure', () => {
      it('should set working.signingUp to false', () => {
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

    describe('signupSuccess', () => {
      it('should set working.signingUp to false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.signupRequest();
        
        expect(initialState.working.signingUp).to.be.false;
        expect(initialState.working.loggingIn).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.signingUp).to.be.true;

        let failureAction = actions.sync.signupSuccess(user);
        let state = reducer(intermediateState, failureAction);

        expect(state.working.signingUp).to.be.false;
        expect(state.working.loggingIn).to.be.false;
        expect(state.isLoggedIn).to.be.true;
        expect(state.user).to.equal(user);
      });
    });

    describe('confirmSignupRequest', () => {
      it('should set working.confirmingSignup to true', () => {
        let action = actions.sync.confirmSignupRequest();
        expect(initialState.working.confirmingSignup).to.be.false;

        let state = reducer(initialState, action);
        expect(state.working.confirmingSignup).to.be.true;
      });
    });

    describe('confirmSignupFailure', () => {
      it('should set working.confirmingSignup to false', () => {
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

    describe('confirmSignupSuccess', () => {
      it('should set working.confirmingSignup to false and set user', () => {
        let user = 'user';

        let requestAction = actions.sync.confirmSignupRequest();
        
        expect(initialState.working.confirmingSignup).to.be.false;
        expect(initialState.working.loggingIn).to.be.false;

        let intermediateState = reducer(initialState, requestAction);
        expect(intermediateState.working.confirmingSignup).to.be.true;

        let failureAction = actions.sync.confirmSignupSuccess(user);
        let state = reducer(intermediateState, failureAction);

        expect(state.working.confirmingSignup).to.be.false;
        expect(state.working.loggingIn).to.be.false;
        expect(state.confirmedSignup).to.be.true;
      });
    });
  });
});
