/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global Promise */

import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import * as ActionTypes from '../../app/redux/constants/actionTypes';
import api from '../../app/core/api';
import {
  keycloak as keycloakClient,
  updateKeycloakConfig,
  KeycloakWrapper,
  onKeycloakEvent,
  onKeycloakTokens,
  keycloakMiddleware,
  generateSSOLinkUri,
} from '../../app/keycloak';

const mockKeycloakCtor = jest.fn();

jest.mock('keycloak-js/dist/keycloak.js', () => ({
  __esModule: true,
  default: function KeycloakMock(config) {
    return mockKeycloakCtor(config);
  },
}));

jest.mock('../../app/core/api', () => ({
  __esModule: true,
  default: {
    user: {
      saveSession: jest.fn(),
    },
  },
}));

jest.mock('../../app/redux/actions', () => ({
  __esModule: true,
  sync: {
    keycloakReady: (event, error, logoutUrl) => ({ type: 'KEYCLOAK_READY', payload: { event, error, logoutUrl } }),
    keycloakInitError: (event, error) => ({ type: 'KEYCLOAK_INIT_ERROR', error, payload: { event, error } }),
    keycloakAuthSuccess: (event, error) => ({ type: 'KEYCLOAK_AUTH_SUCCESS', payload: { event, error } }),
    keycloakAuthError: (event, error) => ({ type: 'KEYCLOAK_AUTH_ERROR', error, payload: { event, error } }),
    keycloakAuthRefreshSuccess: (event, error) => ({ type: 'KEYCLOAK_AUTH_REFRESH_SUCCESS', payload: { event, error } }),
    keycloakAuthRefreshError: (event, error) => ({ type: 'KEYCLOAK_AUTH_REFRESH_ERROR', error, payload: { event, error } }),
    keycloakTokenExpired: (event, error) => ({ type: 'KEYCLOAK_TOKEN_EXPIRED', payload: { event, error } }),
    keycloakAuthLogout: (event, error) => ({ type: 'KEYCLOAK_AUTH_LOGOUT', payload: { event, error } }),
    keycloakTokensReceived: (tokens) => ({ type: 'KEYCLOAK_TOKENS_RECEIVED', payload: { tokens } }),
  },
  async: {
    login: jest.fn(() => () => {}),
    loggedOut: jest.fn(() => () => {}),
  },
}));

const expect = chai.expect;

const mockStore = configureStore([thunk]);

const makeKeycloakInstance = (overrides = {}) => ({
  createLogoutUrl: sinon.stub().returns('keycloakLogoutUrl'),
  logout: sinon.stub(),
  init: sinon.stub().returns(new Promise(sinon.stub())),
  tokenParsed: {
    exp: 5000,
    sub: 'sub-id',
    // eslint-disable-next-line camelcase
    session_state: 'keycloakSessionState',
  },
  token: 'tokenValue',
  timeSkew: 2,
  updateToken: sinon.stub(),
  authServerUrl: 'http://keycloakauthserverurl',
  realm: 'keycloakRealm',
  clientId: 'keycloakClientId',
  ...overrides,
});

describe('keycloak', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKeycloakCtor.mockReset();
    const instance = makeKeycloakInstance();
    mockKeycloakCtor.mockImplementation(() => instance);
    updateKeycloakConfig({ url: `someUrl-${Date.now()}`, realm: 'realm' }, {});
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('onKeycloakEvent', () => {
    it('should dispatch keycloakReady for onReady', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);

      onEvent('onReady', null);

      expect(store.getActions()).to.eql([
        {
          type: 'KEYCLOAK_READY',
          payload: {
            event: 'onReady',
            error: null,
            logoutUrl: 'keycloakLogoutUrl',
          },
        },
      ]);
    });

    it('should dispatch keycloakInitError for onInitError', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);
      const err = new Error('keycloak init error');

      onEvent('onInitError', err);

      expect(store.getActions()).to.eql([
        {
          type: 'KEYCLOAK_INIT_ERROR',
          error: err,
          payload: {
            event: 'onInitError',
            error: err,
          },
        },
      ]);
    });

    it('should dispatch keycloakReady and not call saveSession for onReady', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);

      onEvent('onReady', null);

      expect(store.getActions()[0]).to.eql({
        type: 'KEYCLOAK_READY',
        payload: {
          event: 'onReady',
          error: null,
          logoutUrl: 'keycloakLogoutUrl',
        },
      });
      expect(api.user.saveSession.mock.calls.length).to.equal(0);
    });

    it('should dispatch keycloakAuthSuccess and call saveSession for onAuthSuccess', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);

      onEvent('onAuthSuccess', null);

      expect(store.getActions()[0]).to.eql({
        type: 'KEYCLOAK_AUTH_SUCCESS',
        payload: {
          event: 'onAuthSuccess',
          error: null,
        },
      });
      expect(api.user.saveSession.mock.calls.length).to.equal(1);
    });

    it('should dispatch keycloakAuthError for onAuthError', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);
      const err = new Error('keycloak auth error');

      onEvent('onAuthError', err);

      expect(store.getActions()).to.eql([
        {
          type: 'KEYCLOAK_AUTH_ERROR',
          error: err,
          payload: {
            event: 'onAuthError',
            error: err,
          },
        },
      ]);
    });

    it('should dispatch keycloakAuthRefreshSuccess for onAuthRefreshSuccess', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);

      onEvent('onAuthRefreshSuccess', null);

      expect(store.getActions()).to.eql([
        {
          type: 'KEYCLOAK_AUTH_REFRESH_SUCCESS',
          payload: {
            event: 'onAuthRefreshSuccess',
            error: null,
          },
        },
      ]);
    });

    it('should dispatch keycloakAuthRefreshError for onAuthRefreshError', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);
      const err = new Error('keycloak auth refresh error');

      onEvent('onAuthRefreshError', err);

      expect(store.getActions()[0]).to.eql({
        type: 'KEYCLOAK_AUTH_REFRESH_ERROR',
        error: err,
        payload: {
          event: 'onAuthRefreshError',
          error: err,
        },
      });
    });

    it('should dispatch keycloakTokenExpired for onTokenExpired', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);

      onEvent('onTokenExpired', null);

      expect(store.getActions()).to.eql([
        {
          type: 'KEYCLOAK_TOKEN_EXPIRED',
          payload: {
            event: 'onTokenExpired',
            error: null,
          },
        },
      ]);
    });

    it('should dispatch keycloakAuthLogout for onAuthLogout', () => {
      const store = mockStore();
      const onEvent = onKeycloakEvent(store);

      onEvent('onAuthLogout', null);

      expect(store.getActions()[0]).to.eql({
        type: 'KEYCLOAK_AUTH_LOGOUT',
        payload: {
          event: 'onAuthLogout',
          error: null,
        },
      });
    });
  });

  describe('onKeycloakTokens', () => {
    it('should dispatch keycloakTokensReceived, call saveSession, and set up refresh timeout', () => {
      const store = mockStore();
      const onTokens = onKeycloakTokens(store);
      const clock = sinon.useFakeTimers();

      onTokens({ token: 'tokenValue' });

      expect(store.getActions()).to.eql([
        {
          type: 'KEYCLOAK_TOKENS_RECEIVED',
          payload: {
            tokens: { token: 'tokenValue' },
          },
        },
      ]);
      expect(api.user.saveSession.mock.calls.length).to.equal(1);

      clock.next();
      expect(keycloakClient.updateToken.calledWithExactly(-1)).to.be.true;
      clock.restore();
    });
  });

  describe('keycloakMiddleware', () => {
    it('should update keycloak config if FETCH_INFO returns new config', () => {
      const callsBefore = mockKeycloakCtor.mock.calls.length;

      keycloakMiddleware()()(sinon.stub())({
        type: ActionTypes.FETCH_INFO_SUCCESS,
        payload: {
          info: {
            auth: {
              url: `newUrl-${Date.now()}`,
              realm: 'realm',
            },
          },
        },
      });

      expect(mockKeycloakCtor.mock.calls.length).to.equal(callsBefore + 1);
    });

    it('should not update keycloak config if FETCH_INFO returns already fetched config', () => {
      const config = { url: `sameUrl-${Date.now()}`, realm: 'realm' };
      updateKeycloakConfig(config, {});
      const callsBefore = mockKeycloakCtor.mock.calls.length;

      keycloakMiddleware()()(sinon.stub())({
        type: ActionTypes.FETCH_INFO_SUCCESS,
        payload: {
          info: {
            auth: config,
          },
        },
      });

      expect(mockKeycloakCtor.mock.calls.length).to.equal(callsBefore);
    });

    it('should call keycloak.updateToken() when action has 401 error', () => {
      const action401 = {
        type: 'SOME_ACTION',
        error: {
          status: 401,
          originalError: {
            status: 401,
          },
        },
      };

      keycloakMiddleware()()(sinon.stub())(action401);
      sinon.assert.calledWithExactly(keycloakClient.updateToken, -1);
    });

    it('should call keycloak.updateToken() when action has 403 error', () => {
      const action403 = {
        type: 'SOME_ACTION',
        error: {
          status: 403,
          originalError: {
            status: 403,
          },
        },
      };

      keycloakMiddleware()()(sinon.stub())(action403);
      sinon.assert.calledWithExactly(keycloakClient.updateToken, -1);
    });
  });

  describe('KeycloakWrapper', () => {
    it('should not initialize keycloak without keycloak url configured', () => {
      render(
        <Provider store={configureStore([thunk])({ blip: {} })}>
          <KeycloakWrapper>
            <div>test child</div>
          </KeycloakWrapper>
        </Provider>
      );

      expect(keycloakClient.init.callCount).to.equal(0);
    });

    it('should initialize the keycloak provider if a keycloak url is configured', () => {
      const store = configureStore([thunk])({
        blip: {
          keycloakConfig: {
            url: 'someUrl',
            realm: 'realm',
            clientId: 'client',
          },
        },
      });

      render(
        <Provider store={store}>
          <KeycloakWrapper>
            <div>test child</div>
          </KeycloakWrapper>
        </Provider>
      );

      expect(keycloakClient.init.callCount).to.equal(1);
    });
  });

  describe('generateSSOLinkUri', () => {
    it('should return a SSO Uri', () => {
      expect(
        generateSSOLinkUri('anIdp', 'aRedirectUri', 'providedNonce')
      ).to.equal(
        'http://keycloakauthserverurl/realms/keycloakRealm/broker/anIdp/link?nonce=providedNonce&hash=9poE5eoZoNI83tBnkjtE_v-LgE4nAa0jZTFjBaOvG8w&client_id=keycloakClientId&redirect_uri=aRedirectUri'
      );
    });
  });
});
