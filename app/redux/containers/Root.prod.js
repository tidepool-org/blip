import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import i18n from '../../core/language';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: i18n.language,
    };
    this.langChange = this.langChange.bind(this);
  }

  componentDidMount() {
    i18n.on('languageChanged', this.langChange);
  }

  componentWillUnmount() {
    i18n.off('languageChanged', this.langChange);
  }

  langChange(lng) {
    if (this.state.language !== lng) {
      this.setState({ language: lng });
    }
  }

  render() {
    const { store, routing } = this.props;
    return (
      <Provider store={store}>
        <Router history={browserHistory}>
          {routing}
        </Router>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  routing: PropTypes.object.isRequired,
};

export default Root;
