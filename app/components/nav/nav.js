/** @jsx React.DOM */
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

var React = window.React;
var _ = window._;

var Nav = React.createClass({
  propTypes: {
    version: React.PropTypes.string,
    user: React.PropTypes.object,
    onLogout: React.PropTypes.func
  },

  render: function() {
    var version = this.renderVersion();
    var user = this.renderUser();

    return (
      /* jshint ignore:start */
      <div className="nav">
        <div className="nav-inner">
          <ul>
            <li><a href="#/">Blip</a></li>
            {version}
          </ul>
          {user}
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  renderVersion: function() {
    var version = this.props.version;
    if (version) {
      version = 'v' + version;
      return (
        /* jshint ignore:start */
        <li className="nav-version" ref="version">{version}</li>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  renderUser: function() {
    var user = this.props.user;
    if (!_.isEmpty(user)) {
      var fullName = this.getUserFullName(user);
      return (
        /* jshint ignore:start */
        <ul className="nav-right js-nav-user">
          <li>Logged in as <span>{fullName}</span></li>
          <li><a href="" onClick={this.handleLogout}>Logout</a></li>
        </ul>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  getUserFullName: function(user) {
    return user.firstName + ' ' + user.lastName;
  },

  handleLogout: function(e) {
    e.preventDefault();
    var logout = this.props.onLogout;
    if (logout) {
      logout();
    }
  }
});

module.exports = Nav;