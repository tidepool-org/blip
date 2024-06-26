var React = require('react');

import PropTypes from 'prop-types';
import { keycloak } from '../../keycloak';

import { withTranslation } from 'react-i18next';
var Link = require('react-router-dom').Link;

let win = window;

var LoginNav = withTranslation()(class extends React.Component {
  static propTypes = {
    page: PropTypes.string,
    hideLinks: PropTypes.bool,
    trackMetric: PropTypes.func.isRequired,
    keycloakConfig: PropTypes.object,
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
    const {page, t, keycloakConfig} = this.props;
    var href = '/signup';
    var className = 'js-signup-link';
    var icon = 'icon-add';
    var text = t('Sign up');
    var handleClick = function (e) {
      self.props.trackMetric('Clicked Sign Up Link');
      if (keycloakConfig.initialized) {
        e.preventDefault();
        keycloak.register({
          redirectUri: win.location.origin
        });
      }
    };

    if (page === 'signup') {
      href = '/login';
      className = 'js-login-link';
      icon = 'icon-login';
      text = t('Log in');
      handleClick = function(e) {
        self.props.trackMetric('Clicked Log In Link');
        if(keycloakConfig.initialized) {
          e.preventDefault();
          keycloak.login({
            redirectUri: win.location.origin
          });
        }
      };
    }

    return (
      <Link to={href} className={className} onClick={handleClick}>
        <i className={icon}></i>
        {' ' + text}
      </Link>
    );
  };
});

module.exports = LoginNav;
