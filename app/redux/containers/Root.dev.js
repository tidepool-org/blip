import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeUIProvider } from 'theme-ui';
import { KeycloakWrapper } from '../../keycloak';

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.dev';
import { ToastProvider } from '../../providers/ToastProvider';

class Root extends Component {
  render() {
    const { store, routing } = this.props;
    return (
      <ThemeUIProvider theme={baseTheme}>
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
      </ThemeUIProvider>
    );
  }
};

export default Root;
