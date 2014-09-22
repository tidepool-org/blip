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
var moment = require('moment');

var personUtils = require('../../core/personutils');
var datetimeUtils = require('../../core/datetimeutils');

var SERVER_DATE_FORMAT = 'YYYY-MM-DD';
var FORM_DATE_FORMAT = 'MM/DD/YYYY';

var PatientInfo = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    trackMetric: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      editing: false,
      working: false
    };
  },

  render: function() {
    if (this.props.fetchingPatient) {
      return this.renderSkeleton();
    }

    if (this.state.editing) {
      return this.renderEditing();
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

    var self = this;
    var handleClick = function(e) {
      e.preventDefault();
      self.props.trackMetric('Clicked Edit Profile');
      self.setState({editing: true});
    };

    return (
      <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={handleClick}>Edit</button>
    );
  },

  renderEditing: function() {
    var formValues = this.formValuesFromPatient(this.props.patient);

    var self = this;
    var handleCancel = function(e) {
      e.preventDefault();
      self.setState({editing: false});
    };

    return (
      <div className="PatientInfo">
        <div className="PatientInfo-content">
          <div className="PatientInfo-head">
            <div className="PatientInfo-picture"></div>
            <div className="PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                <div className="">
                  <input className="PatientInfo-input" id="fullName" ref="fullName" placeholder="Full name" defaultValue={formValues.fullName} />
                </div>
              </div>
              <div className="PatientInfo-blockRow">
                <div className="">
                  <label className="PatientInfo-label" htmlFor="birthday">Date of birth</label>
                  <input className="PatientInfo-input" id="birthday" ref="birthday" placeholder={FORM_DATE_FORMAT} defaultValue={formValues.birthday} />
                </div>
              </div>
              <div className="PatientInfo-blockRow">
                <div className="">
                  <label className="PatientInfo-label" htmlFor="diagnosisDate">Date of diagnosis</label>
                  <input className="PatientInfo-input" id="diagnosisDate" ref="diagnosisDate" placeholder={FORM_DATE_FORMAT} defaultValue={formValues.diagnosisDate} />
                </div>
              </div>
            </div>
          </div>
          <div className="PatientInfo-bio">
            <textarea className="PatientInfo-input" ref="about"
              placeholder="Anything you would like to share?"
              rows="3"
              defaultValue={formValues.about}>
            </textarea>
          </div>
        </div>
        <div className="PatientInfo-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button" disabled={this.state.working} onClick={handleCancel}>Cancel</button>
          {this.renderSubmit()}
        </div>
      </div>
    );
  },

  renderSubmit: function() {
    var text = this.state.working ? 'Saving...' : 'Save changes';
    return <button className="PatientInfo-button PatientInfo-button--primary" type="submit" disabled={this.state.working} onClick={this.handleSubmit}>{text}</button>;
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
  },

  formValuesFromPatient: function(patient) {
    if (!patient) {
      return {};
    }

    var formValues = {};
    var patientInfo = personUtils.patientInfo(patient);

    formValues.fullName = personUtils.patientFullName(patient);

    if (patientInfo.birthday) {
      formValues.birthday = moment(patientInfo.birthday)
        .format(FORM_DATE_FORMAT);
    }

    if (patientInfo.diagnosisDate) {
      formValues.diagnosisDate = moment(patientInfo.diagnosisDate)
        .format(FORM_DATE_FORMAT);
    }

    if (patientInfo.about) {
      formValues.about = patientInfo.about;
    }

    return formValues;
  },

  handleSubmit: function(e) {
    e.preventDefault();
    console.log('TODO saving changes...');
    this.setState({working: true});
    var self = this;
    setTimeout(function() {
      self.setState({working: false});
    }, 2000);
  }
});

module.exports = PatientInfo;
