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
var moment = window.moment;
var config = window.config;

var Person = require('../../core/person');
var Datetime = require('../../core/datetime');
var PeopleList = require('../../components/peoplelist');

var DATE_DISPLAY_FORMAT = 'MMM D, YYYY';

var Patient = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    trackMetric: React.PropTypes.func.isRequired
  },

  patientDisplayAttributes: [
    {
      name: 'fullName',
      label: 'Name',
      getValue: function(patient) {
        return this.getDisplayName(patient);
      }
    },
    {
      name: 'about',
      label: 'About',
      getValue: function(patient) {
        return this.getAboutText(patient);
      }
    },
    {
      name: 'age',
      label: 'Age',
      getValue: function(patient) {
        return this.getAgeText(patient);
      }
    },
    {
      name: 'diagnosis',
      label: 'Diagnosed',
      getValue: function(patient) {
        return this.getDiagnosisText(patient);
      }
    }
  ],

  render: function() {
    var subnav = this.renderSubnav();
    var editLink = this.renderEditLink();
    var patient = this.renderPatient();
    var team = this.renderTeam();

    /* jshint ignore:start */
    return (
      <div className="patient js-patient-page">
        {subnav}
        <div className="container-box-outer patient-content-outer">
          <div className="container-box-inner patient-content-inner">
            <div className="patient-content">
              {editLink}
              {patient}
              {team}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderSubnav: function() {
    var backButton = this.renderBackButton();

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-subnav-outer">
        <div className="container-box-inner patient-subnav-inner">
          <div className="grid patient-subnav">
            <div className="grid-item one-whole medium-one-third">
              {backButton}
            </div>
            <div className="grid-item one-whole medium-one-third">
              <div className="patient-subnav-title">Profile</div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderBackButton: function() {
    var url = '#/';
    var text = 'Data';
    var patient = this.props.patient;

    if (patient && patient.userid) {
      url = '#/patients/' + patient.userid + '/data';
    }

    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Back To Data');
    };

    /* jshint ignore:start */
    return (
      <a className="js-back" href={url} onClick={handleClick}>
        <i className="icon-back"></i>
        {' ' + text}
      </a>
    );
    /* jshint ignore:end */
  },

  renderEditLink: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    var editUrl = [
      '#/patients',
      this.props.patient.userid,
      'edit'
    ].join('/');

    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Edit Profile');
    };

    /* jshint ignore:start */
    return (
      <div className="patient-content-link">
        <a href={editUrl} className="js-edit-patient" onClick={handleClick}>
          <i className="icon-profile"></i>
          {' ' + 'Edit profile'}
        </a>
      </div>
    );
    /* jshint ignore:end */
  },

  isSamePersonUserAndPatient: function() {
    return Person.isSame(this.props.user, this.props.patient);
  },

  renderPatient: function() {
    var patient = this.props.patient || {};

    var attributes = this.prepareDisplayAttributes(patient);

    return this.renderPatientAttributes(attributes);
  },

  prepareDisplayAttributes: function(patient) {
    var self = this;
    var fetching = this.props.fetchingPatient;

    return _.map(this.patientDisplayAttributes, function(attribute) {
      attribute.value = attribute.getValue.call(self, patient);
      attribute.fetching = fetching;
      return attribute;
    });
  },

  renderPatientAttributes: function(attributes) {
    var attributeNodes = _.map(attributes, this.renderPatientAttribute);

    /* jshint ignore:start */
    return (
      <div className="patient-attributes">
        {attributeNodes}
      </div>
    );
    /* jshint ignore:end */
  },

  renderPatientAttribute: function(attribute) {
    if (!(attribute.value || attribute.fetching)) {
      return null;
    }

    var className = 'patient-attribute';
    if (attribute.fetching && !attribute.value) {
      className =
        className + ' patient-attribute-empty js-patient-attribute-empty';
    }

    /* jshint ignore:start */
    return (
      <div key={attribute.name} className={className}>
        <div
          className="patient-attribute-value"
          name={attribute.name}>{attribute.value}</div>
        <div className="patient-attribute-label">{attribute.label}</div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderTeam: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    var teamMembers = this.renderTeamMembers();

    /* jshint ignore:start */
    return (
      <div className="patient-team">
        <div className="patient-team-title">CARE TEAM MEMBERS</div>
        {teamMembers}
      </div>
    );
    /* jshint ignore:end */
  },

  renderTeamMembers: function() {
    var members = this.props.patient &&
                  this.props.patient.team;

    if (_.isEmpty(members)) {
      /* jshint ignore:start */
      return (
        <div className="patient-team-empty">
          People added to this care team will appear here.
        </div>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <PeopleList people={members} />
    );
    /* jshint ignore:end */
  },

  getDisplayName: function(patient) {
    return Person.patientFullName(patient);
  },

  getAboutText: function(patient) {
    var patientInfo = Person.patientInfo(patient) || {};
    return patientInfo.about;
  },

  getAgeText: function(patient) {
    var patientInfo = Person.patientInfo(patient) || {};
    var birthday = patientInfo.birthday;

    if (!birthday) {
      return;
    }

    var yearsOld = Datetime.yearsOldText(birthday);
    var birthdayDisplay = moment(birthday).format(DATE_DISPLAY_FORMAT);

    return [yearsOld, ' (', birthdayDisplay, ')'].join('');
  },

  getDiagnosisText: function(patient) {
    var patientInfo = Person.patientInfo(patient) || {};
    var diagnosisDate = patientInfo.diagnosisDate;

    if (!diagnosisDate) {
      return;
    }

    var yearsAgo = Datetime.yearsAgoText(diagnosisDate);
    var diagnosisDateDisplay =
      moment(diagnosisDate).format(DATE_DISPLAY_FORMAT);

    return [yearsAgo, ' (', diagnosisDateDisplay, ')'].join('');
  }
});

module.exports = Patient;
