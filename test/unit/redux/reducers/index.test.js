/* global chai */
/* global sinon */
/* global describe */
/* global it */

import reducer from '../../../../app/redux/reducers/index';

import actions from '../../../../app/redux/actions/index';

import initialState from '../../../../app/redux/reducers/initialState';


var expect = chai.expect;

describe('reducers', () => {
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
      let state = reducer(initialState, failureAction);
      expect(state.working.loggingIn).to.be.false;
      expect(state.error).to.equal(error);
    });
  });

  describe('loginSuccess', () => {
    it('should set working.loggingIn to false and set user', () => {
      let user = 'user';

      let requestAction = actions.sync.loginRequest();
      expect(initialState.working.loggingIn).to.be.false;

      let intermediateState = reducer(initialState, requestAction);
      expect(intermediateState.working.loggingIn).to.be.true;

      let failureAction = actions.sync.loginSuccess(user);
      let state = reducer(initialState, failureAction);
      expect(state.working.loggingIn).to.be.false;
      expect(state.user).to.equal(user);
    });
  });
});
