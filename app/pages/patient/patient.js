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

var user = require('../../core/user');

var Patient = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool
  },

  patientAttributes: [
    {name: 'firstName', label: 'First name'},
    {name: 'lastName', label: 'Last name'},
    {name: 'aboutMe', label: 'About me'},
    {name: 'birthday', label: 'Born'},
    {name: 'diagnosisYear', label: 'Diagnosed'}
  ],

  render: function() {
    var subnav = this.renderSubnav();
    var editLink = this.renderEditLink();
    var patient = this.renderPatient();

    /* jshint ignore:start */
    return (
      <div className="patient">
        {subnav}
        <div className="container-box-outer patient-content-outer">
          <div className="container-box-inner patient-content-inner">
            <div className="patient-content">
              {editLink}
              {patient}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderSubnav: function() {
    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-subnav-outer">
        <div className="container-box-inner patient-subnav-inner">
          <div className="grid patient-subnav">
            <div className="grid-item one-whole medium-one-third">
              <a href="#/">
                <i className="icon-back"></i>
                {' ' + 'Back'}
              </a>
            </div>
            <div className="grid-item one-whole medium-one-third">
              <div className="patient-subnav-title">Patient profile</div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderEditLink: function() {
    if (!this.isUserPatient()) {
      return null;
    }

    var editUrl = [
      '#/patients',
      this.props.patient.id,
      'edit'
    ].join('/');

    /* jshint ignore:start */
    return (
      <div className="patient-content-edit">
        <a href={editUrl}>
          <i className="icon-profile"></i>
          {' ' + 'Edit patient profile'}
        </a>
      </div>
    );
    /* jshint ignore:end */
  },

  isUserPatient: function() {
    return user.isUserPatient(this.props.user, this.props.patient);
  },

  renderPatient: function() {
    var patient = this.props.patient || {};
    var fetching = this.props.fetchingPatient;

    var attributes = _.map(this.patientAttributes, function(attribute) {
      attribute.value = patient[attribute.name];
      attribute.fetching = fetching;
      return attribute;
    });

    return this.renderPatientAttributes(attributes);
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
      className = className + ' patient-attribute-empty';
    }

    /* jshint ignore:start */
    return (
      <div key={attribute.name} className={className}>
        <div className="patient-attribute-value">{attribute.value}</div>
        <div className="patient-attribute-label">{attribute.label}</div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = Patient;