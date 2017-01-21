import React, { Component } from 'react';
import Perf from 'react-addons-perf';
window.Perf = Perf;
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';

import DevTools from './DevTools';

/* global __DEV_TOOLS__ */

export default class Root extends Component {
  render() {
    const { store, routing } = this.props;
    if (!__DEV_TOOLS__) {
      return (
        <Provider store={store}>
          <Router history={browserHistory}>
            {routing}
          </Router>
        </Provider>
      );
    }
    return (
      <Provider store={store}>
        <div>
          <Router history={browserHistory}>
            {routing}
          </Router>
          <DevTools />
        </div>
      </Provider>
    );
  }
};