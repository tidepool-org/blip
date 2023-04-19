import Keycloak from 'keycloak-js/dist/keycloak.js';
import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useSelector, useStore } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import * as ActionTypes from './redux/constants/actionTypes';
import { sync, async } from './redux/actions';
import api from './core/api';

export let keycloak = null;

let _keycloakConfig = {};
let refreshTimeout = null;

export const setTokenRefresh = (keycloak) => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
  var expiresIn = (keycloak.tokenParsed['exp'] - new Date().getTime() / 1000 + keycloak.timeSkew) * 1000;
  refreshTimeout = setTimeout(() => { keycloak.updateToken(-1); }, expiresIn - 10000);
};

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
      let logoutUrl = keycloak.createLogoutUrl({
        redirectUri: window.location.origin
      });
      store.dispatch(sync.keycloakReady(event, error, logoutUrl));
      break;
    }
    case 'onInitError': {
      store.dispatch(sync.keycloakInitError(event, error));
      break;
    }
    case 'onAuthSuccess': {
      const isOauthRedirectRoute = /^(\/oauth\/|\/upload-redirect)/.test(window?.location?.pathname);
      // We don't trigger the login (and subsequent redirects) on the oauth redirect landing page
      if (!isOauthRedirectRoute) {
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
      }
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
      store.dispatch(async.loggedOut(api));
      break;
    }
    case 'onTokenExpired': {
      store.dispatch(sync.keycloakTokenExpired(event, error));
      break;
    }
    case 'onAuthLogout': {
      store.dispatch(sync.keycloakAuthLogout(event, error));
      store.dispatch(async.loggedOut(api));
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
    setTokenRefresh(keycloak);
  }
};

export const keycloakMiddleware = (api) => (storeAPI) => (next) => (action) => {
  switch (action.type) {
    case ActionTypes.FETCH_INFO_SUCCESS: {
      if (!isEqual(_keycloakConfig, action.payload?.info?.auth)) {
        updateKeycloakConfig(action.payload?.info?.auth, storeAPI);
      }
      break;
    }
    default:
      if (
        action?.error?.status === 401 ||
        action?.error?.originalError?.status === 401 ||
        action?.error?.status === 403 ||
        action?.error?.originalError?.status === 403
      ) {
        // on any action with a 401 or 403, we try to refresh to keycloak token to verify
        // if the user is still logged in
        keycloak.updateToken(-1);
      }
      break;
  }
  return next(action);
};

export const KeycloakWrapper = (props) => {
  const keycloakConfig = useSelector((state) => state.blip.keycloakConfig);
  const store = useStore();
  let Wrapper = React.Fragment;
  let wrapperProps = props;
  const isOauthRedirectRoute = /^(\/upload-redirect)/.test(window?.location?.pathname);
  if (keycloakConfig?.url && !isOauthRedirectRoute) {
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
