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

var Navbar = React.createClass({
  propTypes: {
    version: React.PropTypes.string,
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    onLogout: React.PropTypes.func,
    imagesEndpoint: React.PropTypes.string
  },

  render: function() {
    window.navbar = this;
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
    var imageSource = this.props.imagesEndpoint + '/blip-logo.png';

    /* jshint ignore:start */
    return (
      <li>
        <a
          href="#/"
          className="navbar-logo">
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

    var fullName = this.getPatientFullName(patient);
    var patientUrl = '#/patients/' + patient.id;
    
    return (
      /* jshint ignore:start */
      <div className="navbar-patient js-navbar-patient" ref="patient">
        <a className="navbar-patient-name" href={patientUrl} title="Patient profile">
          {fullName}
        </a>
      </div>
      /* jshint ignore:end */
    );
  },

  renderUser: function() {
    var user = this.props.user;

    if (_.isEmpty(user)) {
      return null;
    }

    var fullName = this.getUserFullName(user);
    
    return (
      /* jshint ignore:start */
      <ul className="nav nav-right navbar-user js-navbar-user" ref="user">
        <li>
          <a href="#/profile" className="navbar-label-link js-navbar-profile-link" title="Account">
            <div className="navbar-label navbar-label-right">
              {'Logged in as '}
              <span className="navbar-user-name" ref="userFullName">{fullName}</span>
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

  getUserFullName: function(user) {
    return user.firstName + ' ' + user.lastName;
  },

  getPatientFullName: function(patient) {
    return patient.firstName + ' ' + patient.lastName;
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