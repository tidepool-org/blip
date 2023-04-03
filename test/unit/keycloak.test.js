/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */
/* global before */
/* global after */
/* global Promise */

import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ActionTypes from '../../app/redux/constants/actionTypes';

import {
  KeycloakWrapper,
  __RewireAPI__ as KeycloakRewireAPI,
  default as keycloak,
} from '../../app/keycloak';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

const {
  onKeycloakEvent,
  onKeycloakTokens,
  keycloakMiddleware,
} = keycloak;

const expect = chai.expect;

const apiMock = {
  user: {
    saveSession: sinon.stub(),
  },
};

const asyncMock = {
  login: sinon.stub().returns(sinon.stub().callsFake(0)),
  loggedOut: sinon.stub().returns(sinon.stub()),
};

const keycloakMock = {
  createLogoutUrl: sinon.stub().returns('keycloakLogoutUrl')
};

describe('keycloak', () => {
  const mockStore = configureStore([thunk]);

  before(() => {
    keycloak.__Rewire__('api', apiMock);
    keycloak.__Rewire__('async', asyncMock);
    keycloak.__Rewire__('keycloak', keycloakMock);
  });

  after(() => {
    keycloak.__ResetDependency__('api');
    keycloak.__ResetDependency__('async');
    keycloak.__ResetDependency__('keycloak');
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
            logoutUrl: 'keycloakLogoutUrl'
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
    const keycloakMock = {
      logout: sinon.stub(),
      updateToken: sinon.stub(),
    };
    const updateKeycloakConfigMock = sinon.stub();

    before(() => {
      keycloak.__Rewire__('keycloak', keycloakMock);
      keycloak.__Rewire__('updateKeycloakConfig', updateKeycloakConfigMock);
    });

    after(() => {
      keycloak.__ResetDependency__('keycloak');
      keycloak.__ResetDependency__('updateKeycloakConfig');
    });

    it('should update keycloak config if FETCH_INFO returns new config', () => {
      expect(updateKeycloakConfigMock.callCount).to.equal(0);
      keycloakMiddleware()()(sinon.stub())({
        type: ActionTypes.FETCH_INFO_SUCCESS,
        payload: {
          info: {
            auth: {
              url: 'newUrl',
            },
          },
        },
      });
      expect(updateKeycloakConfigMock.callCount).to.equal(1);
    });

    it('should not update keycloak config if FETCH_INFO returns already fetched config', () => {
      keycloak.__Rewire__('_keycloakConfig', { url: 'newUrl' });
      updateKeycloakConfigMock.resetHistory();
      expect(updateKeycloakConfigMock.callCount).to.equal(0);
      keycloakMiddleware()()(sinon.stub())({
        type: ActionTypes.FETCH_INFO_SUCCESS,
        payload: {
          info: {
            auth: {
              url: 'newUrl',
            },
          },
        },
      });
      expect(updateKeycloakConfigMock.callCount).to.equal(0);
      keycloak.__ResetDependency__('_keycloakConfig');
    });

    it('should call keycloak.updateToken() when action has 401 error', () => {
      const action401 = {
        type: 'SOME_ACTION',
        error: {
          status: 401,
          originalError:{
            status: 401,
          },
        },
      };

      expect(keycloakMock.updateToken.callCount).to.equal(0);
      keycloakMiddleware()()(sinon.stub())(action401);
      expect(keycloakMock.updateToken.callCount).to.equal(1);
      sinon.assert.calledWithExactly(keycloakMock.updateToken, -1);
      keycloakMock.updateToken.resetHistory();
    });

    it('should call keycloak.updateToken() when action has 403 error', () => {
      const action403 = {
        type: 'SOME_ACTION',
        error: {
          status: 403,
          originalError:{
            status: 403,
          },
        },
      };

      expect(keycloakMock.updateToken.callCount).to.equal(0);
      keycloakMiddleware()()(sinon.stub())(action403);
      expect(keycloakMock.updateToken.callCount).to.equal(1);
      sinon.assert.calledWithExactly(keycloakMock.updateToken, -1);
    });
  });

  describe('KeycloakWrapper', () => {
    const keycloakMock = {
      logout: sinon.stub(),
      init: sinon.stub().returns(new Promise(sinon.stub())),
    };

    before(() => {
      KeycloakRewireAPI.__Rewire__('keycloak', keycloakMock);
    });

    after(() => {
      KeycloakRewireAPI.__ResetDependency__('keycloak');
    });

    it('should not initialize keycloak without keycloak url configured', () => {
      expect(keycloakMock.init.callCount).to.equal(0);
      let wrapper = mount(
        <Provider store={configureStore([thunk])({ blip: {} })}>
          <KeycloakWrapper>
            <div>test child</div>
          </KeycloakWrapper>
        </Provider>
      );
      expect(keycloakMock.init.callCount).to.equal(0);
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
      expect(keycloakMock.init.callCount).to.equal(0);
      let wrapper = mount(
        <Provider store={store}>
          <KeycloakWrapper>
            <div>test child</div>
          </KeycloakWrapper>
        </Provider>
      );
      expect(keycloakMock.init.callCount).to.equal(1);
    });
  });
});
