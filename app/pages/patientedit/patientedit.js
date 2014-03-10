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
var patient = require('../../core/patient');

var PatientEdit = React.createClass({
  propTypes: {
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    isNewPatient: React.PropTypes.bool,
    onValidate: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func
  },

  formInputs: [
    {name: 'birthday', label: 'Date of birth *', placeholder: 'YYYY-MM-DD'},
    {
      name: 'diagnosisDate',
      label: 'Date of diagnosis *',
      placeholder: 'YYYY-MM-DD'
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
      working: false,
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
    var backButton = this.renderBackButton();
    var title = this.getTitle();

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-edit-subnav-outer">
        <div className="container-box-inner patient-edit-subnav-inner">
          <div className="grid patient-edit-subnav">
            <div className="grid-item one-whole medium-one-third">
              {backButton}
            </div>
            <div className="grid-item one-whole medium-one-third">
              <div className="patient-edit-subnav-title">{title}</div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderBackButton: function() {
    var url = '#/';
    var text = 'Patient profile';
    var patient = this.props.patient;

    if (patient && patient.id) {
      url = '#/patients/' + patient.id;
    }

    /* jshint ignore:start */
    return (
      <a href={url}>
        <i className="icon-back"></i>
        {' ' + text}
      </a>
    );
    /* jshint ignore:end */
  },

  getTitle: function() {
    var title = ' patient profile';
    if (this.props.isNewPatient) {
      return 'Create ' + title;
    }
    return 'Edit ' + title;
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
    var submitButtonText = this.getSubmitButtonText();
    var disabled = this.isResettingPatientData();

    /* jshint ignore:start */
    return (
      <SimpleForm
        inputs={this.formInputs}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.state.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification}
        disabled={disabled}/>
    );
    /* jshint ignore:end */
  },

  getSubmitButtonText: function() {
    var text = 'Save';
    if (this.props.isNewPatient) {
      text = 'Create patient profile';
      if (this.state.working) {
        text = 'Creating patient profile...';
      }
    }
    return text;
  },

  isResettingPatientData: function() {
    return (this.props.fetchingPatient && !this.props.patient);
  },

  handleSubmit: function(formValues) {
    var self = this;

    this.resetFormStateBeforeSubmit(formValues);

    formValues = _.clone(formValues);
    formValues = this.formatUserInput(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    this.submitFormValues(formValues);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    var working = false;
    if (this.props.isNewPatient) {
      working = true;
    }

    this.setState({
      working: working,
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
    clearTimeout(this.messageTimeoutId);
  },

  validateFormValues: function(formValues) {
    var validationErrors = {};
    var validate = this.props.onValidate;

    validationErrors = validate(formValues);
    if (!_.isEmpty(validationErrors)) {
      this.setState({
        working: false,
        validationErrors: validationErrors,
        notification: {
          type: 'error',
          message:'Some entries are invalid.'
        }
      });
    }

    return validationErrors;
  },

  formatUserInput: function(formValues) {
    if (formValues.birthday) {
      formValues.birthday = patient.formatDate(formValues.birthday);
    }

    if (formValues.diagnosisDate) {
      formValues.diagnosisDate = patient.formatDate(formValues.diagnosisDate);
    }

    if (!formValues.aboutMe) {
      delete formValues.aboutMe;
    }

    return formValues;
  },

  submitFormValues: function(formValues) {
    if (this.props.isNewPatient) {
      return this.submitFormValuesForCreation(formValues);
    }
    return this.submitFormValuesForUpdate(formValues);
  },

  submitFormValuesForUpdate: function(formValues) {
    var self = this;
    var submit = this.props.onSubmit;

    // Save optimistically
    submit(formValues);
    this.setState({
      notification: {type: 'success', message: 'All changes saved.'}
    });

    this.messageTimeoutId = setTimeout(function() {
      self.setState({notification: null});
    }, this.MESSAGE_TIMEOUT);
  },

  submitFormValuesForCreation: function(formValues) {
    var self = this;
    var submit = this.props.onSubmit;
    var submitSuccess = this.props.onSubmitSuccess;

    submit(formValues, function(err, result) {
      if (err) {
        self.setState({
          working: false,
          notification: {
            type: 'error',
            message: err.message ||
              'An error occured while creating your patient profile.'
          }
        });
        return;
      }
      if (submitSuccess) {
        submitSuccess(result);
      }
    });
  }
});

module.exports = PatientEdit;