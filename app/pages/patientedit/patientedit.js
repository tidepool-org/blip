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

var SimpleForm = require('../../components/simpleform');

var PatientEdit = React.createClass({
  propTypes: {
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    onValidate: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  formInputs: [
    {name: 'birthday', label: 'Date of birth *', type: 'date'},
    {
      name: 'diagnosisYear',
      label: 'Year of diagnosis *',
      type: 'number',
      placeholder: 'YYYY'
    },
    {
      name: 'aboutMe',
      label: 'About me',
      type: 'textarea',
      placeholder: 'Anything you would like to share about yourself ' +
                   'in your profile?'
    }
  ],

  MESSAGE_TIMEOUT: 2000,

  getInitialState: function() {
    return {
      formValues: this.props.patient || {},
      validationErrors: {},
      notification: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // Keep form values in sync with upstream changes
    this.setState({formValues: nextProps.patient || {}});
  },

  render: function() {
    var subnav = this.renderSubnav();
    var name = this.renderName();
    var form = this.renderForm();

    /* jshint ignore:start */
    return (
      <div className="patient-edit">
        {subnav}
        <div className="container-box-outer patient-edit-content-outer">
          <div className="container-box-inner patient-edit-content-inner">
            <div className="patient-edit-content">
              {name}
              {form}
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderSubnav: function() {
    var backUrl = this.getBackUrl();

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-edit-subnav-outer">
        <div className="container-box-inner patient-edit-subnav-inner">
          <div className="grid patient-edit-subnav">
            <div className="grid-item one-whole medium-one-third">
              <a href={backUrl}>
                <i className="icon-back"></i>
                {' ' + 'Back'}
              </a>
            </div>
            <div className="grid-item one-whole medium-one-third">
              <div className="patient-edit-subnav-title">Edit patient profile</div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  getBackUrl: function() {
    var backUrl = '#/';
    var patient = this.props.patient;

    if (patient && patient.id) {
      backUrl = '#/patients/' + patient.id;
    }

    return backUrl;
  },

  renderName: function() {
    var className = 'patient-edit-name';
    var fullName = this.getPatientFullName(this.props.patient);

    if (!this.props.patient) {
      className = className + ' patient-edit-name-empty';
    }

    /* jshint ignore:start */
    return (
      <div className={className}>{fullName}</div>
    );
    /* jshint ignore:end */
  },

  getPatientFullName: function(patient) {
    if (_.isEmpty(patient)) {
      return '';
    }

    return patient.firstName + ' ' + patient.lastName;
  },

  renderForm: function() {
    var disabled = this.isResettingPatientData();

    /* jshint ignore:start */
    return (
      <SimpleForm
        inputs={this.formInputs}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText="Save"
        onSubmit={this.handleSubmit}
        notification={this.state.notification}
        disabled={disabled}/>
    );
    /* jshint ignore:end */
  },

  isResettingPatientData: function() {
    return (this.props.fetchingPatient && !this.props.patient);
  },

  handleSubmit: function(formValues) {
    var self = this;

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    this.submitFormValues(formValues);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
    clearTimeout(this.messageTimeoutId);
  },

  validateFormValues: function(formValues) {
    var validationErrors = {};
    var validate = this.props.onValidate;

    formValues = _.clone(formValues);

    validationErrors = validate(formValues);
    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
        notification: {
          type: 'error',
          message:'Some entries are invalid.'
        }
      });
    }

    return validationErrors;
  },

  submitFormValues: function(formValues) {
    var self = this;
    console.log('submit');
    var submit = this.props.onSubmit;

    // Save optimistically
    submit(formValues);
    this.setState({
      notification: {type: 'success', message: 'All changes saved.'}
    });

    this.messageTimeoutId = setTimeout(function() {
      self.setState({notification: null});
    }, this.MESSAGE_TIMEOUT);
  }
});

module.exports = PatientEdit;