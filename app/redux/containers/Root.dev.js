import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeUIProvider } from 'theme-ui';
import { KeycloakWrapper } from '../../keycloak';
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.dev';
import { ToastProvider } from '../../providers/ToastProvider';
import { AppBannerProvider } from '../../providers/AppBanner/AppBannerProvider';

const myCache = createCache({
  key: 'tp-emotion-cache',
  compat: true,
})

myCache.compat = true;

class Root extends Component {
  render() {
    const { store, routing } = this.props;
    return (
      <CacheProvider value={myCache}>
        <ThemeUIProvider theme={baseTheme}>
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
        </ThemeUIProvider>
      </CacheProvider>
    );
  }
};

export default Root;
