import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot, setConfig } from 'react-hot-loader';
import { ThemeProvider } from 'styled-components';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { keycloak, onKeycloakEvent, onKeycloakTokens} from '../../keycloak';
import config from '../../config';

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.dev';
import { ToastProvider } from '../../providers/ToastProvider';

setConfig({ logLevel: 'warning' })

class Root extends Component {
  render() {
    const { store, routing } = this.props;
    let root = (
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

export default hot(module)(Root);
