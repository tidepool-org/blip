
/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

var React = require('react');
var Link = require('react-router').Link;

var logoSrc = require('./images/tidepool-logo-370x40.png');

var LoginNav = React.createClass({
  propTypes: {
    page: React.PropTypes.string,
    hideLinks: React.PropTypes.bool,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    var logo = this.renderLogo();
    var link = this.renderLink();

    
    return (
      <div className="container-nav-outer login-nav">
        <div className="container-nav-inner nav-wrapper">
          <ul className="nav nav-left">
            <li>
              {logo}
            </li>
          </ul>
          <ul className="nav nav-right">
            <li>
              {link}
            </li>
          </ul>
        </div>
      </div>
    );
    
  },

  renderLogo: function() {
    
    return (
      <a
        href="http://tidepool.org/"
        target="_blank"
        className="login-nav-tidepool-logo" >
        <img src={logoSrc} alt="Tidepool"/>
      </a>
    );
    
  },

  renderLink: function() {
    if (this.props.hideLinks) {
      return null;
    }

    var self = this;
    var page = this.props.page;
    var href = '/signup';
    var className = 'js-signup-link';
    var icon = 'icon-add';
    var text = 'Sign up';
    var handleClick = function() {
      self.props.trackMetric('Clicked Sign Up Link');
    };

    if (page === 'signup') {
      href = '/login';
      className = 'js-login-link';
      icon = 'icon-login';
      text = 'Log in';
      handleClick = function() {
        self.props.trackMetric('Clicked Log In Link');
      };
    }

    return (
      
      <Link
        to={href}
        className={className}><i className={icon}></i>{' ' + text}</Link>
      
    );
  }
});

module.exports = LoginNav;
