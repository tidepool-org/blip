import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from '@emotion/react';

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.prod';
import { AppBannerProvider } from '../../providers/AppBanner/AppBannerProvider';
import { ToastProvider } from '../../providers/ToastProvider';
import { KeycloakWrapper } from '../../keycloak';

export default class Root extends Component {
  render() {
    const { store, routing } = this.props;
    return (
      <ThemeProvider theme={baseTheme}>
        <ToastProvider>
          <Provider store={store}>
            <KeycloakWrapper>
              <div>
                <ConnectedRouter history={history}>
                  <AppBannerProvider>
                    {routing}
                  </AppBannerProvider>
                </ConnectedRouter>
              </div>
            </KeycloakWrapper>
          </Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  }
};
