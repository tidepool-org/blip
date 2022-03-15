import Keycloak from 'keycloak-js/dist/keycloak.js';
import config from './config';
import * as ActionTypes from './redux/constants/actionTypes';
import { sync, async } from './redux/actions';
import api from './core/api';

// eslint-disable-next-line new-cap
export const keycloak = Keycloak({
  url: config.KEYCLOAK_URL,
  realm: config.KEYCLOAK_REALM,
  clientId: config.KEYCLOAK_CLIENTID,
});

export const onKeycloakEvent = (store) => (event, error) => {
  switch (event) {
    case 'onReady':
      store.dispatch(sync.keycloakReady(event, error));
      break;
    case 'onInitError':
      store.dispatch(sync.keycloakInitError(event, error));
      break;
    case 'onAuthSuccess':
      store.dispatch(sync.keycloakAuthSuccess(event, error));
      api.user.saveSession(keycloak?.tokenParsed?.sub, keycloak?.token, {
        noRefresh: true,
      });
      store.dispatch(async.login(api));
      break;
    case 'onAuthError':
      store.dispatch(sync.keycloakAuthError(event, error));
      break;
    case 'onAuthRefreshSuccess':
      store.dispatch(sync.keycloakAuthRefreshSuccess(event, error));
      break;
    case 'onAuthRefreshError':
      store.dispatch(sync.keycloakAuthRefreshError(event, error));
      break;
    case 'onTokenExpired':
      store.dispatch(sync.keycloakTokenExpired(event, error));
      break;
    case 'onAuthLogout':
      store.dispatch(sync.keycloakAuthLogout(event, error));
      break;
    default:
      break;
  }
};

export const onKeycloakTokens = (store) => (tokens) => {
  if (tokens?.token) {
    store.dispatch(sync.keycloakTokensReceived(tokens));
    api.user.saveSession(keycloak?.tokenParsed?.sub, keycloak?.token, {
      noRefresh: true,
    });
  }
};

export const keycloakMiddleware = (api) => (storeAPI) => (next) => (action) => {
  switch (action.type) {
    case ActionTypes.LOGOUT_REQUEST:
      keycloak.logout();
      break;
    default:
      break;
  }
  return next(action);
};

export default {keycloak, onKeycloakEvent, onKeycloakTokens, keycloakMiddleware}
