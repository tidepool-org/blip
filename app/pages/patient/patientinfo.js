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

var React = require('react');
var _ = require('lodash');

var personUtils = require('../../core/personutils');
var datetimeUtils = require('../../core/datetimeutils');

var PatientInfo = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    if (this.props.fetchingPatient) {
      return this.renderSkeleton();
    }

    var patient = this.props.patient;

    return (
      <div className="PatientInfo">
        <div className="PatientInfo-content">
          <div className="PatientInfo-head">
            <div className="PatientInfo-picture"></div>
            <div className="PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--withArrow">
                  {this.getDisplayName(patient)}
                </div>
              </div>
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block">
                  {this.getAgeText(patient)}
                </div>
              </div>
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block">
                  {this.getDiagnosisText(patient)}
                </div>
              </div>
            </div>
          </div>
          <div className="PatientInfo-bio">
            {this.getAboutText(patient)}
          </div>
        </div>
        <div className="PatientInfo-controls">
          {this.renderEditLink()}
        </div>
      </div>
    );
  },

  renderSkeleton: function() {
    return (
      <div className="PatientInfo">
        <div className="PatientInfo-content">
          <div className="PatientInfo-head">
            <div className="PatientInfo-picture"></div>
            <div className="PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--withArrow PatientInfo-block--placeholder">&nbsp;</div>
              </div>
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--placeholder">&nbsp;</div>
              </div>
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--placeholder">&nbsp;</div>
              </div>
            </div>
          </div>
          <div className="PatientInfo-bio PatientInfo-bio--placeholder">&nbsp;</div>
        </div>
        <div className="PatientInfo-controls"></div>
      </div>
    );
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

    return (
      <a href={editUrl} className="PatientInfo-edit js-edit-patient" onClick={handleClick}>
        Edit
      </a>
    );
  },

  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.props.user, this.props.patient);
  },

  getDisplayName: function(patient) {
    return personUtils.patientFullName(patient);
  },

  getAgeText: function(patient) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    var birthday = patientInfo.birthday;

    if (!birthday) {
      return;
    }

    return datetimeUtils.yearsOldText(birthday);
  },

  getDiagnosisText: function(patient) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    var diagnosisDate = patientInfo.diagnosisDate;

    if (!diagnosisDate) {
      return;
    }

    return 'Diagnosed ' + datetimeUtils.yearsAgoText(diagnosisDate);
  },

  getAboutText: function(patient) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    return patientInfo.about;
  }
});

module.exports = PatientInfo;
