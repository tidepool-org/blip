import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot, setConfig } from 'react-hot-loader';
import { ThemeProvider } from 'styled-components';
import { KeycloakWrapper } from '../../keycloak';

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.dev';
import { ToastProvider } from '../../providers/ToastProvider';
import GoogleAnalyticsWrapper from '../../googleanalytics';

setConfig({ logLevel: 'warning' })

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
                  <GoogleAnalyticsWrapper>
                    {routing}
                  </GoogleAnalyticsWrapper>
                </ConnectedRouter>
              </div>
            </KeycloakWrapper>
          </Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  }
};

export default hot(module)(Root);
