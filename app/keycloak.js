import Keycloak from 'keycloak-js';
import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useSelector, useStore } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import cryptoJS from 'crypto-js';
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
  const expiresIn = (keycloak.tokenParsed.exp - new Date().getTime() / 1000 + keycloak.timeSkew) * 1000;
  refreshTimeout = setTimeout(() => { keycloak.updateToken(-1); }, expiresIn - 10000);
};

export const updateKeycloakConfig = (info, store) => {
  if (!(isEmpty(info) || isEqual(_keycloakConfig, info))) {
    const urlParams = new URLSearchParams(window.location.search);
    const iss = sessionStorage.getItem('smart_iss') || urlParams.get('iss');
    const launch = sessionStorage.getItem('smart_launch') || urlParams.get('launch');

    let clientConfig;

    if (iss && launch) {
      const keycloakUrl = new URL(info.url);

      clientConfig = {
        url: keycloakUrl.toString(),
        realm: info.realm,
        clientId: 'blip-smart-on-fhir',
        initOptions: {
          scope: 'openid',
        }
      };
    } else {
      clientConfig = {
        url: info.url,
        realm: info.realm,
        clientId: 'blip'
      };
    }

    // eslint-disable-next-line new-cap
    keycloak = new Keycloak(clientConfig);
    _keycloakConfig = info;
  }
};

export const onKeycloakEvent = (store) => (event, error) => {
  switch (event) {
    case 'onReady': {
      const logoutUrl = keycloak.createLogoutUrl({
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
      const isOauthRedirectRoute = /^\/oauth\//.test(window?.location?.pathname);
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
  const hasSmartOnFhirData = keycloak?.idTokenParsed?.['smart-on-fhir']?.patients;

  if (hasSmartOnFhirData) {
    store.dispatch(sync.smartOnFhirAuthSuccess(keycloak.idTokenParsed['smart-on-fhir']));
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
  const Wrapper = keycloakConfig?.url ? ReactKeycloakProvider : React.Fragment;
  const wrapperProps = keycloakConfig?.url ? {
    ...props,
    authClient: keycloak,
    onEvent: onKeycloakEvent(store),
    onTokens: onKeycloakTokens(store),
    initOptions: {
      //checkLoginIframe: false,
      onLoad: 'check-sso',
      enableLogging: true,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    }
  } : props;
  return <Wrapper {...wrapperProps}>{props.children}</Wrapper>;
};

/**
 * Generate a Keycloak SSO Link Uri
 *
 * @param {String} idp - required IDP
 * @param {String} redirectUri - post linking redirect
 * @param {String} [nonce] - optional nonce
 * @returns
 */
export function generateSSOLinkUri(idp, redirectUri, originalNonce) {
  const nonce = originalNonce ?? cryptoJS.enc.Base64url.stringify(
    // eslint-disable-next-line new-cap
    cryptoJS.SHA256(crypto.randomUUID())
  );

  const uri = new URL(`${keycloak.authServerUrl}/realms/${keycloak.realm}/broker/${idp}/link`);
  const input = nonce + keycloak.tokenParsed.session_state + keycloak.clientId + idp;
  // eslint-disable-next-line new-cap
  const check = cryptoJS.SHA256(cryptoJS.enc.Utf8.parse(input));
  const hash = cryptoJS.enc.Base64url.stringify(check);
  const params = new URLSearchParams({
    nonce,
    hash,
    // eslint-disable-next-line camelcase
    client_id: keycloak.clientId,
    // eslint-disable-next-line camelcase
    redirect_uri: redirectUri
  });

  uri.search = params.toString();

  return uri.toString();
}

export default {
  keycloak,
  onKeycloakEvent,
  onKeycloakTokens,
  keycloakMiddleware,
  generateSSOLinkUri,
};
