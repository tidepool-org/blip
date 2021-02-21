var React = require('react');

import PropTypes from 'prop-types';

import { translate } from 'react-i18next';
var Link = require('react-router-dom').Link;

var LoginNav = translate()(class extends React.Component {
  static propTypes = {
    page: PropTypes.string,
    hideLinks: PropTypes.bool,
    trackMetric: PropTypes.func.isRequired
  };

  render() {
    var link = this.renderLink();

    return (
      <div className="container-nav-outer login-nav">
        <div className="container-nav-inner nav-wrapper">
          <ul className="nav nav-right">
            <li>
              {link}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  renderLink = () => {
    if (this.props.hideLinks) {
      return null;
    }


    var self = this;
    const {page, t} = this.props;
    var href = '/signup';
    var className = 'js-signup-link';
    var icon = 'icon-add';
    var text = t('Sign up');
    var handleClick = function() {
      self.props.trackMetric('Clicked Sign Up Link');
    };

    if (page === 'signup') {
      href = '/login';
      className = 'js-login-link';
      icon = 'icon-login';
      text = t('Log in');
      handleClick = function() {
        self.props.trackMetric('Clicked Log In Link');
      };
    }

    return (
      <Link
        to={href}
        className={className}><i className={icon}></i>{' ' + text}</Link>
    );
  };
});

module.exports = LoginNav;
