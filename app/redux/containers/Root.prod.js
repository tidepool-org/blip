import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.prod';
import { ToastProvider } from '../../providers/ToastProvider';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { keycloak, onKeycloakEvent, onKeycloakTokens } from '../../keycloak';
import config from '../../config';
export default class Root extends Component {
  render() {
    const { store, routing } = this.props;
    const root = (
      <ThemeProvider theme={baseTheme}>
        <ToastProvider>
          <Provider store={store}>
            <div>
              <ConnectedRouter history={history}>
                {routing}
              </ConnectedRouter>
            </div>
          </Provider>
        </ToastProvider>
      </ThemeProvider>
    );
    return config.KEYCLOAK_URL ? (
      <ReactKeycloakProvider
        authClient={keycloak}
        onEvent={onKeycloakEvent(store)}
        onTokens={onKeycloakTokens(store)}
      >
        [root]
      </ReactKeycloakProvider>
    ) : (
      [root]
    );
  }
};
