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
var sundial = require('sundial');

var personUtils = require('../../core/personutils');

//date masks we use
var FORM_DATE_FORMAT = 'MM/DD/YYYY';
var SERVER_DATE_FORMAT = 'YYYY-MM-DD';

var PatientInfo = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    onUpdatePatient: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      editing: false,
      validationErrors: {}
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
    var self = this;
    var handleClick = function(e) {
      e.preventDefault();
      self.toggleEdit();
    };
    var nameNode;
    var ageNode;
    var diagnosisNode;
    if (this.isSamePersonUserAndPatient()) {
      nameNode = (
        <a href="" onClick={handleClick} className="PatientInfo-block PatientInfo-block--withArrow">
          {this.getDisplayName(patient)}
        </a>
      );
      ageNode = (
        <a href="" onClick={handleClick} className="PatientInfo-block">
          {this.getAgeText(patient)}
        </a>
      );
      diagnosisNode = (
        <a href="" onClick={handleClick} className="PatientInfo-block">
          {this.getDiagnosisText(patient)}
        </a>
      );
    }
    else {
      nameNode = (
        <div className="PatientInfo-block PatientInfo-block--withArrow">
          {this.getDisplayName(patient)}
        </div>
      );
      ageNode = (
        <div className="PatientInfo-block">
          {this.getAgeText(patient)}
        </div>
      );
      diagnosisNode = (
        <div className="PatientInfo-block">
          {this.getDiagnosisText(patient)}
        </div>
      );
    }

    return (
      <div className="PatientInfo">
        <div className="PatientPage-sectionTitle">Profile</div>
        <div className="PatientInfo-controls">
          {this.renderEditLink()}
        </div>
        <div className="clear"></div>

        <div className="PatientInfo-content">
          <div className="PatientInfo-head">
            <div className="PatientInfo-picture"></div>
            <div className="PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                {nameNode}
              </div>
              <div className="PatientInfo-blockRow">
                {ageNode}
              </div>
              <div className="PatientInfo-blockRow">
                {diagnosisNode}
              </div>
            </div>
          </div>
          <div className="PatientInfo-bio">
            {this.getAboutText(patient)}
          </div>
        </div>
      </div>
    );
  },

  renderSkeleton: function() {
    return (
      <div className="PatientInfo">
        <div className="PatientPage-sectionTitle">Profile</div>
        <div className="PatientInfo-controls"></div>
        <div className="clear"></div>
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
      self.toggleEdit();
    };

    // Important to add a `key`, different from the "Cancel" button in edit mode
    // or else react will maintain the "focus" state when flipping back and forth
    return (
      <button key="edit" className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={handleClick}>Edit</button>
    );
  },

  toggleEdit: function() {
    this.setState({
      editing: !this.state.editing,
      validationErrors: {}
    });
  },

  renderEditing: function() {
    var patient = this.props.patient;
    var formValues = this.formValuesFromPatient(patient);

    var self = this;
    var handleCancel = function(e) {
      e.preventDefault();
      self.toggleEdit();
    };

    return (
      <div className="PatientInfo">
        <div className="PatientPage-sectionTitle">Profile</div>
        <div className="PatientInfo-controls">
          <button key="cancel" className="PatientInfo-button PatientInfo-button--secondary" type="button" disabled={this.state.working} onClick={handleCancel}>Cancel</button>
          {this.renderSubmit()}
        </div>
        <div className="clear"></div>
        <div className="PatientInfo-content">
          <div className="PatientInfo-head">
            <div className="PatientInfo-picture"></div>
            <div className="PatientInfo-blocks">
              {this.renderFullNameInput(formValues)}
              {this.renderBirthdayInput(formValues)}
              {this.renderDiagnosisDateInput(formValues)}
            </div>
          </div>
          {this.renderAboutInput(formValues)}
        </div>
      </div>
    );
  },

  renderFullNameInput: function(formValues) {
    
    var fullNameNode, errorElem, classes;
    var error = this.state.validationErrors.fullName;
    // Legacy: revisit when proper "child accounts" are implemented
    if (personUtils.patientIsOtherPerson(this.props.patient)) {
      classes = 'PatientInfo-input';
      if (error) {
        classes += ' PatientInfo-input-error';
        errorElem = <div className="PatientInfo-error-message">{error}</div>;
      }
      fullNameNode = (
        <div className={classes}>
          <input className="PatientInfo-input" id="fullName" ref="fullName" placeholder="Full name" defaultValue={formValues.fullName} />
          {errorElem}
        </div>
      );
    }
    else {
      formValues = _.omit(formValues, 'fullName');
      fullNameNode = (
        <div className="PatientInfo-block PatientInfo-block--withArrow">
          {this.getDisplayName(this.props.patient)}
          {' (edit in '}
          <a href="#/profile">account</a>
          {')'}
        </div>
      );
    }

    return (<div className="PatientInfo-blockRow">
      {fullNameNode}
    </div>);
  },

  renderBirthdayInput: function(formValues) {
    var classes = 'PatientInfo-input', errorElem;
    var error = this.state.validationErrors.birthday;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }
    return (<div className="PatientInfo-blockRow">
      <div className="">
        <label className="PatientInfo-label" htmlFor="birthday">Date of birth</label>
        <input className={classes} id="birthday" ref="birthday" placeholder={FORM_DATE_FORMAT} defaultValue={formValues.birthday} />
        {errorElem}
      </div>
    </div>);
  },

  renderDiagnosisDateInput: function(formValues) {
    var classes = 'PatientInfo-input', errorElem;
    var error = this.state.validationErrors.diagnosisDate;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }
    return (<div className="PatientInfo-blockRow">
      <div className="">
        <label className="PatientInfo-label" htmlFor="diagnosisDate">Date of diagnosis</label>
        <input className={classes} id="diagnosisDate" ref="diagnosisDate" placeholder={FORM_DATE_FORMAT} defaultValue={formValues.diagnosisDate} />
        {errorElem}
      </div>
    </div>);
  },

  renderAboutInput: function(formValues) {
    var classes = 'PatientInfo-input', errorElem;
    var error = this.state.validationErrors.about;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }
    return (<div className="PatientInfo-bio">
      <textarea className={classes} ref="about"
        placeholder="Anything you would like to share?"
        rows="3"
        defaultValue={formValues.about}>
      </textarea>
      {errorElem}
    </div>);
  },

  renderSubmit: function() {
    return (
      <button className="PatientInfo-button PatientInfo-button--primary"
        type="submit" onClick={this.handleSubmit}>
        {'Save changes'}
      </button>
    );
  },

  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.props.user, this.props.patient);
  },

  getDisplayName: function(patient) {
    return personUtils.patientFullName(patient);
  },

  getAgeText: function(patient, currentDate) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    var birthday = patientInfo.birthday;

    if (!birthday) {
      return;
    }
    
    var now = new Date();
    currentDate = currentDate || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var yrsAgo = sundial.dateDifference(currentDate, birthday, 'years');
    
    if (yrsAgo === 1) {
      return '1 year old';
    } else if (yrsAgo > 1) {
      return yrsAgo +' years old';
    } else if (yrsAgo === 0) {
      return 'Born this year';
    } else {
      return 'Birthdate not known';
    }

  },

  getDiagnosisText: function(patient, currentDate) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    var diagnosisDate = patientInfo.diagnosisDate;

    if (!diagnosisDate) {
      return;
    }

    
    var now = new Date();
    currentDate = currentDate || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var yrsAgo = sundial.dateDifference(currentDate, diagnosisDate, 'years');

    if (yrsAgo === 0) {
      return 'Diagnosed this year';
    } else if (yrsAgo === 1) {
      return 'Diagnosed 1 year ago';
    } else if (yrsAgo > 1) {
      return 'Diagnosed ' + yrsAgo + ' years ago';
    } else if (yrsAgo === 0) {
      return 'Diagnosed this year';
    } else {
      return 'Diagnosis date not known';
    }
  },

  getAboutText: function(patient) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    return patientInfo.about;
  },

  /**
   * Given a patient object, extract the values from it 
   * that needs to be displayed on the patientinfo form
   * 
   * @param  {Object} patient
   * @return {Object} 
   */
  formValuesFromPatient: function(patient) {
    if (!_.isPlainObject(patient) || _.isEmpty(patient)) {
      return {};
    }

    var formValues = {};
    var patientInfo = personUtils.patientInfo(patient);
    var name = personUtils.patientFullName(patient);

    if (name) {
      formValues.fullName = name;
    }

    if (patientInfo) {
      if (patientInfo.birthday) {
        formValues.birthday =  sundial.translateMask(patientInfo.birthday, SERVER_DATE_FORMAT, FORM_DATE_FORMAT);
      }

      if (patientInfo.diagnosisDate) {
        formValues.diagnosisDate = sundial.translateMask(patientInfo.diagnosisDate, SERVER_DATE_FORMAT, FORM_DATE_FORMAT);
      }

      if (patientInfo.about) {
        formValues.about = patientInfo.about;
      }
    }

    return formValues;
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var formValues = this.getFormValues();

    this.setState({validationErrors: {}});
   
    var isNameRequired = personUtils.patientIsOtherPerson(this.props.patient);
    var validationErrors = personUtils.validateFormValues(formValues, isNameRequired,  FORM_DATE_FORMAT);
    
    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors
      });
      return;
    }

    this.submitFormValues(formValues);
  },

  getFormValues: function() {
    var self = this;
    return _.reduce([
      'fullName',
      'birthday',
      'diagnosisDate',
      'about'
    ], function(acc, key, value) {
      if (self.refs[key]) {
        acc[key] = self.refs[key].getDOMNode().value;
      }
      return acc;
    }, {});
  },

  /**
   * Validate the form data
   *  - name has to be present (can only not be present if user is not patient)
   *  - date of birth needs to be a valid date, and not in the future
   *  - diagnosis date need to be a valid date, and not in the future, and not before date of birth
   *  
   * @param  {Object} formValues
   * @param  {Date|null} currentDate mainly for testing purposes
   * 
   * @return {String|undefined} returns a string if there is an error
   */
  validateFormValues: function(formValues, currentDateObj) {
    var validationErrors = {};

    // Legacy: revisit when proper "child accounts" are implemented
    if (personUtils.patientIsOtherPerson(this.props.patient) &&
        !formValues.fullName) {
      validationErrors.fullName = 'Full name is required';
    }

    var birthday = formValues.birthday;
    if (!(birthday && sundial.isValidDateForMask(birthday,FORM_DATE_FORMAT))) {
      validationErrors.birthday = 'Date of birth needs to be a valid date';
    }

    var diagnosisDate = formValues.diagnosisDate;
    if (!(diagnosisDate && sundial.isValidDateForMask(diagnosisDate,FORM_DATE_FORMAT))) {
      validationErrors.diagnosisDate = 'Diagnosis date needs to be a valid date';
    }

    var now = new Date();
    currentDateObj = currentDateObj || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var birthdayDateObj = sundial.parseFromFormat(birthday, FORM_DATE_FORMAT);
    var diagnosisDateObj = sundial.parseFromFormat(diagnosisDate, FORM_DATE_FORMAT);

    if (birthdayDateObj > currentDateObj) {
      validationErrors.birthday = 'Date of birth cannot be in the future!';
    }

    if (diagnosisDateObj > currentDateObj) {
      validationErrors.diagnosisDate = 'Diagnosis date cannot be in the future!';
    }

    if (birthdayDateObj > diagnosisDateObj) {
      validationErrors.diagnosisDate = 'Diagnosis cannot be before date of birth!';
    }

    var maxLength = 256;
    var about = formValues.about;
    if (about && about.length > maxLength) {
      validationErrors.about = 'Please keep "about" text under ' + maxLength + ' characters';
    }
  },

  submitFormValues: function(formValues) {
    formValues = this.prepareFormValuesForSubmit(formValues);
    var self = this;

    // Save optimistically
    this.props.onUpdatePatient(formValues);
    this.toggleEdit();
  },

  prepareFormValuesForSubmit: function(formValues) {
    // Legacy: revisit when proper "child accounts" are implemented
    if (personUtils.patientIsOtherPerson(this.props.patient)) {
      formValues.isOtherPerson = true;
    }

    if (formValues.birthday) {
      formValues.birthday =  sundial.translateMask(formValues.birthday, FORM_DATE_FORMAT, SERVER_DATE_FORMAT);
    }

    if (formValues.diagnosisDate) {
      formValues.diagnosisDate = sundial.translateMask(formValues.diagnosisDate, FORM_DATE_FORMAT, SERVER_DATE_FORMAT);
    }

    if (!formValues.about) {
      delete formValues.about;
    }

    var profile = _.assign({}, this.props.patient.profile, {
      patient: formValues
    });

    var result = _.assign({}, this.props.patient, {
      profile: profile
    });

    return result;
  }
});

module.exports = PatientInfo;
