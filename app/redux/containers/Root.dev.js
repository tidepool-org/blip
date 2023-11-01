import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from '@emotion/react';
import { KeycloakWrapper } from '../../keycloak';

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.dev';
import { ToastProvider } from '../../providers/ToastProvider';

class Root extends Component {
  render() {
    const { store, routing } = this.props;
    return (
      <ThemeProvider theme={baseTheme}>
        <ToastProvider>
          <Provider store={store}>
            <KeycloakWrapper>
              <div>
                <ConnectedRouter history={history}>
                  {routing}
                </ConnectedRouter>
              </div>
            </KeycloakWrapper>
          </Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  }
};

export default Root;
