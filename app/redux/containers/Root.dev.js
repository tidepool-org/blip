import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { hot, setConfig } from 'react-hot-loader';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../../themes/baseTheme';

setConfig({ logLevel: 'warning' })

class Root extends Component {
  render() {
    const { store, routing } = this.props;
    return (
      <ThemeProvider theme={baseTheme}>
        <Provider store={store}>
          <div>
            <Router history={browserHistory}>
              {routing}
            </Router>
          </div>
        </Provider>
      </ThemeProvider>
    );
  }
};

export default hot(module)(Root);
