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

var SimpleForm = require('../../components/simpleform');
var InputGroup = require('../../components/inputgroup');
var personUtils = require('../../core/personutils');
var datetimeUtils = require('../../core/datetimeutils');

var MODEL_DATE_FORMAT = 'YYYY-MM-DD';
var DISPLAY_DATE_FORMAT = 'MM-DD-YYYY';

var PatientEdit = React.createClass({
  propTypes: {
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    isNewPatient: React.PropTypes.bool,
    onSubmit: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired
  },

  formInputs: [
    {
      name: 'fullName',
      label: 'New data storage for: *',
      placeholder: 'ex: Jessica Carter'
    },
    {
      name: 'birthday',
      label: 'Date of birth *',
      placeholder: DISPLAY_DATE_FORMAT
    },
    {
      name: 'diagnosisDate',
      label: 'Date of diagnosis *',
      placeholder: DISPLAY_DATE_FORMAT
    },
    {
      name: 'about',
      label: 'About',
      type: 'textarea',
      placeholder: 'Anything you would like to share?'
    }
  ],

  MESSAGE_TIMEOUT: 2000,
  IS_SAME_PERSON: 'This is for me, I have type 1 diabetes',
  IS_OTHER_PERSON: 'This is for someone I care for who has type 1 diabetes',

  getInitialState: function() {
    return {
      working: false,
      isOtherPerson: personUtils.patientIsOtherPerson(this.props.patient),
      formValues: this.formValuesFromPatient(this.props.patient),
      validationErrors: {},
      notification: null
    };
  },

  formValuesFromPatient: function(patient) {
    if (!patient) {
      return {};
    }

    var formValues = {};
    var patientInfo = personUtils.patientInfo(patient);

    if (patientInfo.isOtherPerson) {
      formValues.fullName = patientInfo.fullName;
    }

    if (patientInfo.birthday) {
      formValues.birthday = moment(patientInfo.birthday)
        .format(DISPLAY_DATE_FORMAT);
    }

    if (patientInfo.diagnosisDate) {
      formValues.diagnosisDate = moment(patientInfo.diagnosisDate)
        .format(DISPLAY_DATE_FORMAT);
    }

    if (patientInfo.about) {
      formValues.about = patientInfo.about;
    }

    return formValues;
  },

  componentWillReceiveProps: function(nextProps) {
    // Keep form values in sync with upstream changes
    this.setState({formValues: this.formValuesFromPatient(nextProps.patient)});
  },

  componentWillUnmount: function() {
    clearTimeout(this.messageTimeoutId);
  },

  render: function() {
    var subnav = this.renderSubnav();
    var options = this.renderOptions();
    var name = this.renderName();
    var form = this.renderForm();

    /* jshint ignore:start */
    return (
      <div className="patient-edit">
        {subnav}
        <div className="container-box-outer patient-edit-content-outer">
          <div className="container-box-inner patient-edit-content-inner">
            <div className="patient-edit-content">
              {options}
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
    var text = 'Back';
    var patient = this.props.patient;

    if (!this.props.isNewPatient && patient && patient.userid) {
      url = '#/patients/' + patient.userid;
    }

    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Back To Profile');
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

  getTitle: function() {
    if (this.props.isNewPatient) {
      return 'Setup data storage';
    }
    return 'Edit profile';
  },

  renderOptions: function() {
    var items = [
      {value: 'no', label: this.IS_SAME_PERSON},
      {value: 'yes', label: this.IS_OTHER_PERSON}
    ];
    var value = this.state.isOtherPerson ? 'yes' : 'no';
    var disabled = this.isResettingPatientData();

    /* jshint ignore:start */
    return (
      <InputGroup
        name="isOtherPerson"
        items={items}
        value={value}
        type={'radios'}
        disabled={disabled}
        onChange={this.handleOptionsChange}/>
    );
    /* jshint ignore:end */
  },

  renderName: function() {
    if (this.state.isOtherPerson) {
      return null;
    }

    var label = 'Data storage for:';
    if (this.props.isNewPatient) {
      label = 'New data storage for:';
    }

    /* jshint ignore:start */
    return (
      <div className="patient-edit-name">
        {label}
        <div className="patient-edit-name-value">
          {personUtils.fullName(this.props.patient)}
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderForm: function() {
    var formInputs = this.getFormInputs();
    var submitButtonText = this.getSubmitButtonText();
    var disabled = this.isResettingPatientData();

    /* jshint ignore:start */
    return (
      <SimpleForm
        inputs={formInputs}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.state.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification}
        disabled={disabled}
        ref="form"/>
    );
    /* jshint ignore:end */
  },

  getFormInputs: function() {
    var formInputs = this.formInputs;

    if (!this.state.isOtherPerson) {
      formInputs = _.filter(formInputs, function(input) {
        return (input.name !== 'fullName');
      });
    }

    return formInputs;
  },

  getSubmitButtonText: function() {
    var text = 'Save';
    if (this.props.isNewPatient) {
      text = 'Create data storage';
      if (this.state.working) {
        text = 'Creating data storage...';
      }
    }
    return text;
  },

  isResettingPatientData: function() {
    return (this.props.fetchingPatient && !this.props.patient);
  },

  handleOptionsChange: function(attributes) {
    var isOtherPerson = (attributes.value === 'yes') ? true : false;
    // Keep any progress filling out the form
    var formValues = this.refs.form.getFormValues();

    this.setState({
      isOtherPerson: isOtherPerson,
      formValues: _.assign({}, this.state.formValues, formValues),
      validationErrors: {}
    });
  },

  handleSubmit: function(formValues) {
    var self = this;

    this.resetFormStateBeforeSubmit(formValues);

    formValues = this.prepareFormValuesForValidation(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);

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

  prepareFormValuesForValidation: function(formValues) {
    formValues = _.clone(formValues);

    if (this.state.isOtherPerson) {
      formValues.isOtherPerson = true;
    }
    else {
      formValues = _.omit(formValues, 'fullName');
    }

    if (formValues.birthday) {
      formValues.birthday = moment(formValues.birthday, DISPLAY_DATE_FORMAT)
        .format(MODEL_DATE_FORMAT);
    }

    if (formValues.diagnosisDate) {
      formValues.diagnosisDate = moment(formValues.diagnosisDate, DISPLAY_DATE_FORMAT)
        .format(MODEL_DATE_FORMAT);
    }

    if (!formValues.about) {
      delete formValues.about;
    }

    return formValues;
  },

  validateFormValues: function(formValues) {
    var validationErrors = {};
    var IS_REQUIRED = 'This field is required.';
    var IS_NOT_VALID_DATE = 'Not a valid date.';

    if (formValues.isOtherPerson && !formValues.fullName) {
      validationErrors.fullName = IS_REQUIRED;
    }

    if (!formValues.birthday) {
      validationErrors.birthday = IS_REQUIRED;
    }
    else if (!datetimeUtils.isValidDate(formValues.birthday)) {
      validationErrors.birthday = IS_NOT_VALID_DATE;
    }

    if (!formValues.diagnosisDate) {
      validationErrors.diagnosisDate = IS_REQUIRED;
    }
    else if (!datetimeUtils.isValidDate(formValues.diagnosisDate)) {
      validationErrors.diagnosisDate = IS_NOT_VALID_DATE;
    }

    var maxLength = 256;
    if (formValues.about && formValues.about.length > maxLength) {
      validationErrors.about =
        'Please keep text under ' + maxLength + ' characters.';
    }

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

  prepareFormValuesForSubmit: function(formValues) {
    var profile = _.assign({}, this.props.patient.profile, {
      patient: formValues
    });

    var result = _.assign({}, this.props.patient, {
      profile: profile
    });

    return result;
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
            message: 'An error occured while creating your patient profile.'
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
