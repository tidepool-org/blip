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

var Patients = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patients: React.PropTypes.array,
    fetchingPatients: React.PropTypes.bool
  },

  render: function() {
    var userPatient = this.renderUserPatient();
    var sharedPatients = this.renderSharedPatients();

    /* jshint ignore:start */
    return (
      <div className="patients">
        <div className="container-box-outer patients-box-outer">
          <div className="container-box-inner patients-box-inner">
            <div className="patients-content">
              <div className="patients-section js-patients-user">
                <div className="patients-section-title">YOUR CARE TEAM</div>
                {userPatient}
              </div>
              <div className="patients-section js-patients-shared">
                <div className="patients-section-title">CARE TEAMS YOU BELONG TO</div>
                {sharedPatients}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderUserPatient: function() {
    var patient = {};

    if (!this.props.fetchingUser) {
      patient = this.extractPatientDataFromUser(this.props.user);

      if (_.isEmpty(patient)) {
        /* jshint ignore:start */
        return (
          <div className="patients-empty-list">
            <a href="#">
              <i className="icon-add"></i>
              {' ' + 'Create your patient profile'}
            </a>
          </div>
        );
        /* jshint ignore:end */
      }
    }

    return this.renderPatientList([patient]);
  },

  extractPatientDataFromUser: function(user) {
    if (_.isEmpty(user) || !user.patient) {
      return {};
    }

    return {
      id: user.patient.id,
      firstName: user.firstName,
      lastName: user.lastName,
      // For now, just add a "fake" link to patient page
      link: '#'
    };
  },

  renderSharedPatients: function() {
    // Render a placeholder list while we wait for data
    var patients = [{}, {}];

    if (!this.props.fetchingPatients) {
      patients = this.props.patients;

      // For now, just add a "fake" links to patient pages
      patients = _.map(patients, function(patient) {
        patient.link = '#';
        return patient;
      });

      if (_.isEmpty(patients)) {
        /* jshint ignore:start */
        return (
          <div className="patients-empty-list patients-empty-list-message">
            When someone adds you to their care team, it will appear here.
          </div>
        );
        /* jshint ignore:end */
      }
    }

    return this.renderPatientList(patients);
  },

  renderPatientList: function(patients) {
    var patientNodes = _.map(patients, this.renderPatientListItem);

    /* jshint ignore:start */
    return (
      <ul className="patient-list list-group">
        {patientNodes}
      </ul>
    );
    /* jshint ignore:end */
  },

  renderPatientListItem: function(patient) {
    var patientListItemContent;
    var className = 'patient-list-item list-group-item js-patient';

    if (_.isEmpty(patient)) {
      className = className + ' patient-list-item-empty';
    }

    var fullName = this.getPatientFullName(patient);
    /* jshint ignore:start */
    patientListItemContent = (
      <div className="patient-list-item-name">{fullName}</div>
    );
    /* jshint ignore:end */

    if (patient.link) {
      /* jshint ignore:start */
      patientListItemContent = (
        <a
          className="patient-list-item-link list-group-item-link"
          href={patient.link}>{patientListItemContent}</a>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <li key={patient.id} className={className}>
        {patientListItemContent}
      </li>
    );
    /* jshint ignore:end */
  },

  getPatientFullName: function(patient) {
    if (_.isEmpty(patient)) {
      return '';
    }
    return patient.firstName + ' ' + patient.lastName;
  }
});

module.exports = Patients;