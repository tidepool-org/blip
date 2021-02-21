import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.prod';
import { ToastProvider } from '../../providers/ToastProvider';

export default class Root extends Component {
  render() {
    const { store, routing } = this.props;
    return (
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
  }
};
