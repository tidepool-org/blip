import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { hot, setConfig } from 'react-hot-loader';
import Perf from 'react-addons-perf';
window.Perf = Perf;

setConfig({ logLevel: 'warning' })

class Root extends Component {
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

export default hot(module)(Root);
