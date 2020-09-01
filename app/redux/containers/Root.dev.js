import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot, setConfig } from 'react-hot-loader';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../../themes/baseTheme';
import { history } from '../store/configureStore.dev';

setConfig({ logLevel: 'warning' })

class Root extends Component {
  render() {
    const { store, routing } = this.props;
    return (
      <ThemeProvider theme={baseTheme}>
        <Provider store={store}>
          <div>
            <ConnectedRouter history={history}>
              {routing}
            </ConnectedRouter>
          </div>
        </Provider>
      </ThemeProvider>
    );
  }
};

export default hot(module)(Root);
