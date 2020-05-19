import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../../themes/baseTheme';

export default class Root extends Component {
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
