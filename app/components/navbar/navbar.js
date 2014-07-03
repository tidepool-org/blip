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

var personUtils = require('../../core/personutils');

var Navbar = React.createClass({
  propTypes: {
    version: React.PropTypes.string,
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    getUploadUrl: React.PropTypes.func,
    onLogout: React.PropTypes.func,
    imagesEndpoint: React.PropTypes.string,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    var logo = this.renderLogo();
    var version = this.renderVersion();
    var patient = this.renderPatient();
    var user = this.renderUser();

    /* jshint ignore:start */
    return (
      <div className="container-nav-outer navbar">
        <div className="container-nav-inner nav-wrapper">
          <div className="grid">
            <div className="grid-item one-whole large-one-third">
              <ul className="nav nav-left">
                {logo}
                {version}
              </ul>
            </div>
            <div className="grid-item one-whole large-one-third">
              {patient}
            </div>
            <div className="grid-item one-whole large-one-third">
              {user}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderLogo: function() {
    var imageSource = this.props.imagesEndpoint + '/blip-logo-80x80.png';
    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Navbar Logo');
    };

    /* jshint ignore:start */
    return (
      <li>
        <a
          href="#/"
          className="navbar-logo"
          onClick={handleClick}>
          <img src={imageSource} alt="Blip" ref="logo" />
        </a>
      </li>
    );
    /* jshint ignore:end */
  },

  renderVersion: function() {
    var version = this.props.version;
    if (version) {
      version = 'v' + version;
      return (
        /* jshint ignore:start */
        <li className="navbar-version">
          <div className="nav-text" ref="version">{version}</div>
        </li>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  renderPatient: function() {
    var patient = this.props.patient;

    if (_.isEmpty(patient)) {
      return null;
    }

    var displayName = this.getPatientDisplayName();
    var patientUrl = this.getPatientUrl();
    var uploadLink = this.renderUploadLink();
    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Navbar View Profile');
    };

    return (
      /* jshint ignore:start */
      <div className="navbar-patient js-navbar-patient" ref="patient">
        <div className="navbar-patient-name">
          {displayName}
        </div>
        <div className="navbar-patient-links">
          <a href={patientUrl} onClick={handleClick}>
            <i className="icon-profile"></i>
            {'View profile'}
          </a>
          {uploadLink}
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  renderUploadLink: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    var uploadUrl = this.props.getUploadUrl();
    if (!uploadUrl) {
      return null;
    }

    var self = this;
    var handleClick = function(e) {
      if (e) {
        e.preventDefault();
      }
      window.open(uploadUrl, '_blank');
      self.props.trackMetric('Clicked Navbar Upload Data');
    };

    // Upload icon is a bit to the right, need an extra space in the text
    /* jshint ignore:start */
    return (
      <a href="" onClick={handleClick}>
        <i className="icon-upload"></i>
        {' ' + 'Upload data'}
      </a>
    );
    /* jshint ignore:end */
  },

  renderUser: function() {
    var user = this.props.user;

    if (_.isEmpty(user)) {
      return null;
    }

    var displayName = this.getUserDisplayName();
    var self = this;
    var handleClickUser = function() {
      self.props.trackMetric('Clicked Navbar Logged In User');
    };

    return (
      /* jshint ignore:start */
      <ul className="nav nav-right navbar-user js-navbar-user" ref="user">
        <li>
          <a
            href="#/profile"
            className="navbar-label-link js-navbar-profile-link"
            title="Account"
            onClick={handleClickUser}>
            <div className="navbar-label navbar-label-right">
              {'Logged in as '}
              <span className="navbar-user-name" ref="userFullName">{displayName}</span>
            </div>
            <div className="navbar-label-arrow-right"></div>
          </a>
        </li>
        <li>
          <a
            href=""
            className="navbar-user-icon"
            onClick={this.handleLogout}
            title="Logout" ref="logout"><i className="icon-logout"></i>
          </a>
        </li>
      </ul>
      /* jshint ignore:end */
    );
  },

  getUserDisplayName: function() {
    return personUtils.fullName(this.props.user);
  },

  getPatientDisplayName: function() {
    return personUtils.patientFullName(this.props.patient);
  },

  getPatientUrl: function() {
    var patient = this.props.patient;
    if (!patient) {
      return;
    }
    return '#/patients/' + patient.userid;
  },

  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.props.user, this.props.patient);
  },

  handleLogout: function(e) {
    if (e) {
      e.preventDefault();
    }

    var logout = this.props.onLogout;
    if (logout) {
      logout();
    }
  }
});

module.exports = Navbar;
