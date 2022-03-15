/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */
/* global before */
/* global after */

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ActionTypes from '../../app/redux/constants/actionTypes';

import keycloak from '../../app/keycloak';

const { onKeycloakEvent, onKeycloakTokens, keycloakMiddleware } = keycloak;

const expect = chai.expect;

const apiMock = {
  user: {
    saveSession: sinon.stub(),
  },
};

const asyncMock = {
  login: sinon.stub().returns(sinon.stub().callsFake(0)),
};

describe('keycloak', () => {
  const mockStore = configureStore([thunk]);

  before(() => {
    keycloak.__Rewire__('api', apiMock);
    keycloak.__Rewire__('async', asyncMock);
  });

  after(() => {
    keycloak.__ResetDependency__('api');
    keycloak.__ResetDependency__('async');
  });

  beforeEach(() => {
    apiMock.user.saveSession.resetHistory();
  });

  const store = mockStore();

  describe('onKeycloakEvent', () => {
    const onEvent = onKeycloakEvent(store);

    beforeEach(() => {
      store.clearActions();
    });

    it('should dispatch keycloakReady for onReady', () => {
      const expectedActions = [
        {
          type: 'KEYCLOAK_READY',
          payload: {
            event: 'onReady',
            error: null,
          },
        },
      ];
      onEvent('onReady', null);
      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should dispatch keycloakInitError for onInitError', () => {
      const err = new Error('keycloak init error');
      const expectedActions = [
        {
          type: 'KEYCLOAK_INIT_ERROR',
          error: err,
          payload: {
            event: 'onInitError',
            error: err,
          },
        },
      ];
      onEvent('onInitError', err);
      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should dispatch keycloakAuthSuccess and call saveSession for onReady', () => {
      const expectedActions = [
        {
          type: 'KEYCLOAK_AUTH_SUCCESS',
          payload: {
            event: 'onAuthSuccess',
            error: null,
          },
        },
      ];
      expect(apiMock.user.saveSession.callCount).to.equal(0);
      onEvent('onAuthSuccess', null);
      expect(store.getActions()).to.eql(expectedActions);
      expect(apiMock.user.saveSession.callCount).to.equal(1);
    });

    it('should dispatch keycloakAuthError for onAuthError', () => {
      const err = new Error('keycloak auth error');
      const expectedActions = [
        {
          type: 'KEYCLOAK_AUTH_ERROR',
          error: err,
          payload: {
            event: 'onAuthError',
            error: err,
          },
        },
      ];
      onEvent('onAuthError', err);
      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should dispatch keycloakAuthRefreshSuccess for onAuthRefreshSuccess', () => {
      const expectedActions = [
        {
          type: 'KEYCLOAK_AUTH_REFRESH_SUCCESS',
          payload: {
            event: 'onAuthRefreshSuccess',
            error: null,
          },
        },
      ];
      onEvent('onAuthRefreshSuccess', null);
      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should dispatch keycloakAuthRefreshError for onAuthRefreshError', () => {
      const err = new Error('keycloak auth refresh error');
      const expectedActions = [
        {
          type: 'KEYCLOAK_AUTH_REFRESH_ERROR',
          error: err,
          payload: {
            event: 'onAuthRefreshError',
            error: err,
          },
        },
      ];
      onEvent('onAuthRefreshError', err);
      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should dispatch keycloakTokenExpired for onTokenExpired', () => {
      const expectedActions = [
        {
          type: 'KEYCLOAK_TOKEN_EXPIRED',
          payload: {
            event: 'onTokenExpired',
            error: null,
          },
        },
      ];
      onEvent('onTokenExpired', null);
      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should dispatch keycloakAuthLogout for onAuthLogout', () => {
      const expectedActions = [
        {
          type: 'KEYCLOAK_AUTH_LOGOUT',
          payload: {
            event: 'onAuthLogout',
            error: null,
          },
        },
      ];
      onEvent('onAuthLogout', null);
      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  describe('onKeycloakTokens', () => {
    const onTokens = onKeycloakTokens(store);
    beforeEach(() => {
      store.clearActions();
    });
    it('should dispatch keycloakTokensReceived and call saveSession', () => {
      const tokens = { token: 'tokenValue' };
      const expectedActions = [
        {
          type: 'KEYCLOAK_TOKENS_RECEIVED',
          payload: {
            tokens,
          },
        },
      ];
      expect(apiMock.user.saveSession.callCount).to.equal(0);
      onTokens(tokens);
      expect(store.getActions()).to.eql(expectedActions);
      expect(apiMock.user.saveSession.callCount).to.equal(1);
    });
  });

  describe('keycloakMiddleware', () => {
    const keycloakMock = { logout: sinon.stub() };
    keycloak.__Rewire__('keycloak', keycloakMock);
    it('should call keycloak logout on LOGOUT_REQUEST', () => {
      expect(keycloakMock.logout.callCount).to.equal(0);
      keycloakMiddleware()()(sinon.stub())({
        type: ActionTypes.LOGOUT_REQUEST,
      });
      expect(keycloakMock.logout.callCount).to.equal(1);
    });
  });
});
