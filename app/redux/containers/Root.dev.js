import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import Perf from 'react-addons-perf';
window.Perf = Perf;

export default class Root extends Component {
  render() {
    const { store, routing } = this.props;
    return (
      <Provider store={store}>
        <div>
          <Router history={browserHistory}>
            {routing}
          </Router>
        </div>
      </Provider>
    );
  }
};
