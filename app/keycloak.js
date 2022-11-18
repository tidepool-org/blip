import Keycloak from 'keycloak-js/dist/keycloak.js';
import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useSelector, useStore } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import * as ActionTypes from './redux/constants/actionTypes';
import { sync, async } from './redux/actions';
import api from './core/api';

// eslint-disable-next-line new-cap
export let keycloak = null;

let _keycloakConfig = {};

export const updateKeycloakConfig = (info, store) => {
  if (!(isEmpty(info) || isEqual(_keycloakConfig, info))) {
    // eslint-disable-next-line new-cap
    keycloak = new Keycloak({
      url: info.url,
      realm: info.realm,
      clientId: 'blip',
    });
    _keycloakConfig = info;
  }
};

export const onKeycloakEvent = (store) => (event, error) => {
  switch (event) {
    case 'onReady': {
      store.dispatch(sync.keycloakReady(event, error));
      break;
    }
    case 'onInitError': {
      store.dispatch(sync.keycloakInitError(event, error));
      break;
    }
    case 'onAuthSuccess': {
      store.dispatch(sync.keycloakAuthSuccess(event, error));
      api.user.saveSession(
        keycloak?.tokenParsed?.sub,
        keycloak?.token,
        {
          noRefresh: true,
        },
        () => {}
      );
      store.dispatch(async.login(api));
      break;
    }
    case 'onAuthError': {
      store.dispatch(sync.keycloakAuthError(event, error));
      break;
    }
    case 'onAuthRefreshSuccess': {
      store.dispatch(sync.keycloakAuthRefreshSuccess(event, error));
      break;
    }
    case 'onAuthRefreshError': {
      store.dispatch(sync.keycloakAuthRefreshError(event, error));
      break;
    }
    case 'onTokenExpired': {
      store.dispatch(sync.keycloakTokenExpired(event, error));
      break;
    }
    case 'onAuthLogout': {
      store.dispatch(sync.keycloakAuthLogout(event, error));
      break;
    }
    default:
      break;
  }
};

export const onKeycloakTokens = (store) => (tokens) => {
  if (tokens?.token) {
    store.dispatch(sync.keycloakTokensReceived(tokens));
    api.user.saveSession(
      keycloak?.tokenParsed?.sub,
      keycloak?.token,
      {
        noRefresh: true,
      },
      () => {}
    );
  }
};

export const keycloakMiddleware = (api) => (storeAPI) => (next) => (action) => {
  switch (action.type) {
    case ActionTypes.LOGOUT_REQUEST: {
      keycloak.logout();
      break;
    }
    case ActionTypes.FETCH_INFO_SUCCESS: {
      if (!isEqual(_keycloakConfig, action.payload?.info?.auth)) {
        updateKeycloakConfig(action.payload?.info?.auth, storeAPI);
      }
      break;
    }
    default:
      break;
  }
  return next(action);
};

export const KeycloakWrapper = (props) => {
  const keycloakConfig = useSelector((state) => state.blip.keycloakConfig);
  const store = useStore();
  let Wrapper = React.Fragment;
  let wrapperProps = props;
  if (keycloakConfig?.url) {
    Wrapper = ReactKeycloakProvider;
    wrapperProps = {
      ...wrapperProps,
      authClient: keycloak,
      onEvent: onKeycloakEvent(store),
      onTokens: onKeycloakTokens(store),
      initOptions: {
        //checkLoginIframe: false,
        onLoad: 'check-sso',
        enableLogging: true,
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      }
    };
  }
  return <Wrapper {...wrapperProps}>{props.children}</Wrapper>;
};

export default {
  keycloak,
  onKeycloakEvent,
  onKeycloakTokens,
  keycloakMiddleware,
};
