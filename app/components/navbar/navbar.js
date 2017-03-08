
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
var IndexLink = require('react-router').IndexLink;
var Link = require('react-router').Link;

var _ = require('lodash');
var cx = require('classnames');

var personUtils = require('../../core/personutils');
var NavbarPatientCard = require('../../components/navbarpatientcard');

var logoSrc = require('./images/tidepool-logo-408x46.png');

var Navbar = React.createClass({
  propTypes: {
    currentPage: React.PropTypes.string,
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    getUploadUrl: React.PropTypes.func,
    onLogout: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      showDropdown: false
    };
  },

  render: function() {
    return (
      <div className="Navbar">
        {this.renderLogoSection()}
        {this.renderPatientSection()}
        {this.renderMenuSection()}
      </div>
    );
  },

  renderLogoSection: function() {
    return (
      <div className="Navbar-logoSection">
        {this.renderLogo()}
      </div>
    );
  },

  renderLogo: function() {
    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Navbar Logo');
    };

    return (
      <IndexLink
        to="/"
        className="Navbar-logo"
        onClick={handleClick}>
        <img src={logoSrc}/>
      </IndexLink>
    );
  },

  getPatientLink: function(patient) {
    if (!patient || !patient.userid) {
      return '';
    }

    return '/patients/' + patient.userid + '/data';
  },

  renderPatientSection: function() {
    var patient = this.props.patient;

    if (_.isEmpty(patient)) {
      return <div className="Navbar-patientSection"></div>;
    }

    patient.link = this.getPatientLink(patient);

    var displayName = this.getPatientDisplayName();
    var patientUrl = this.getPatientUrl();
    var uploadLink = this.renderUploadLink();
    var shareLink = this.renderShareLink();
    var self = this;

    return (
      <div className="Navbar-patientSection" ref="patient">
        <NavbarPatientCard
          href={patient.link}
          currentPage={this.props.currentPage}
          uploadUrl={this.props.getUploadUrl()}
          patient={patient}
          trackMetric={this.props.trackMetric} />
      </div>
    );
  },

  renderUploadLink: function() {
    var noLink = <div className="Navbar-uploadButton"></div>;

    if (!this.isSamePersonUserAndPatient()) {
      return noLink;
    }

    var uploadUrl = this.props.getUploadUrl();
    if (!uploadUrl) {
      return noLink;
    }

    var self = this;
    var handleClick = function(e) {
      if (e) {
        e.preventDefault();
      }
      window.open(uploadUrl, '_blank');
      self.props.trackMetric('Clicked Navbar Upload Data');
    };

    return (
      <a href="" onClick={handleClick} className="Navbar-button Navbar-button--patient Navbar-button--blue Navbar-uploadButton">
        <i className="Navbar-icon icon-upload-data"></i>
        <span className="Navbar-uploadLabel">Upload</span>
      </a>
    );
  },

  renderShareLink: function() {
    var noLink = <div className="Navbar-shareButton"></div>;
    var self = this;

    if (!this.isSamePersonUserAndPatient()) {
      return noLink;
    }

    var patientUrl = this.getPatientUrl();

    var handleClick = function() {
      self.props.trackMetric('Clicked Navbar Share');
    };

    return (
      <Link to={patientUrl} onClick={handleClick} className="Navbar-button Navbar-button--patient Navbar-button--blue Navbar-uploadButton">
        <i className="Navbar-icon icon-share-data"></i>
        <span className="Navbar-shareLabel">Share</span>
      </Link>
    );
  },

  toggleDropdown: function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.setState({showDropdown: !this.state.showDropdown});
  },

  stopPropagation: function(e) {
    e.stopPropagation();
  },

  hideDropdown: function()  {
    if (this.state.showDropdown) {
      this.setState({showDropdown: false});
    }
  },

  renderMenuSection: function() {
    var currentPage = (this.props.currentPage && this.props.currentPage[0] === '/') ? this.props.currentPage.slice(1) : this.props.currentPage;
    var user = this.props.user;

    if (_.isEmpty(user)) {
      return <div className="Navbar-menuSection"></div>;
    }

    var displayName = this.getUserDisplayName();
    var self = this;
    var handleClickUser = function() {
      self.props.trackMetric('Clicked Navbar Logged In User');
      self.setState({showDropdown: false});
    };

    var handleCareteam = function() {
      self.props.trackMetric('Clicked Navbar CareTeam');
    };
    var patientsClasses = cx({
      'Navbar-button': true,
      'Navbar-selected': currentPage && currentPage === 'patients'
    });

    var accountSettingsClasses = cx({
      'Navbar-button': true,
      'Navbar-dropdownIcon-show': currentPage && currentPage === 'profile',
    });

    var dropdownClasses = cx({
      'Navbar-menuDropdown': true,
      'Navbar-menuDropdown-hide': !self.state.showDropdown
    });

    var dropdownIconClasses = cx({
      'Navbar-dropdownIcon': true,
      'Navbar-dropdownIcon-show': self.state.showDropdown,
      'Navbar-dropdownIcon-current': currentPage && currentPage === 'profile'
    });

    var dropdownIconIClasses = cx({
      'Navbar-icon': true,
      'icon-account--down': !self.state.showDropdown,
      'icon-account--up': self.state.showDropdown
    });

    return (
      <ul className="Navbar-menuSection" ref="user">
        <li className="Navbar-menuItem">
          <Link to="/patients" title="Care Team" onClick={handleCareteam} className={patientsClasses} ref="careteam"><i className="Navbar-icon icon-careteam"></i></Link>
        </li>
        <li className={dropdownIconClasses}>
          <div onClick={this.toggleDropdown}>
            <i className='Navbar-icon Navbar-icon-profile icon-profile'></i>
            <div className="Navbar-logged">
              <span className="Navbar-loggedInAs">{'Logged in as '}</span>
              <span className="Navbar-userName" ref="userFullName" title={displayName}>{displayName}</span>
            </div>
            <i className='Navbar-icon Navbar-icon-down icon-arrow-down'></i>
            <div className='clear'></div>
          </div>
          <div onClick={this.stopPropagation} className={dropdownClasses}>
            <ul>
              <li>
                <Link to="/profile" title="Account" onClick={handleClickUser} className={accountSettingsClasses}>
                  <i className='Navbar-icon icon-settings'></i><span className="Navbar-menuText">Account Settings</span>
                </Link>
              </li>
              <li>
                <a href="" title="Logout" onClick={this.handleLogout} className="Navbar-button" ref="logout">
                  <i className='Navbar-icon icon-logout'></i><span className="Navbar-menuText">Logout</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
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
    return '/patients/' + patient.userid;
  },

  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.props.user, this.props.patient);
  },

  handleLogout: function(e) {
    this.setState({showDropdown: false});

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
