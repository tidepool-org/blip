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

// Simple form with validation errors, submit button, and notification message
var PatientList = React.createClass({
  propTypes: {
    patients: React.PropTypes.array
  },

  render: function() {
    var patientNodes = _.map(this.props.patients, this.renderPatientListItem);

    /* jshint ignore:start */
    return (
      <ul className="patient-list list-group">
        {patientNodes}
      </ul>
    );
    /* jshint ignore:end */
  },

  renderPatientListItem: function(patient, index) {
    var patientListItemContent;
    var className = 'patient-list-item list-group-item js-patient';

    if (_.isEmpty(patient)) {
      className = className + ' patient-list-item-empty js-patient-empty';
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
      <li key={patient.id || index} className={className}>
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

module.exports = PatientList;