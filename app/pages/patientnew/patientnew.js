
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

import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import sundial from 'sundial';

import * as actions from '../../redux/actions';

import InputGroup from '../../components/inputgroup';
import DatePicker from '../../components/datepicker';
import personUtils from '../../core/personutils';

var MODEL_DATE_FORMAT = 'YYYY-MM-DD';

export let PatientNew = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    working: React.PropTypes.bool,
    notification: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },

  formInputs: [
    {
      name: 'isOtherPerson',
      type: 'radios',
      items: [
        {value: 'no', label: 'This is for me, I have type 1 diabetes'},
        {value: 'yes', label: 'This is for someone I care for who has type 1 diabetes'}
      ]
    },
    {
      name: 'fullName',
      placeholder: 'Full name'
    },
    {
      name: 'about',
      type: 'textarea',
      placeholder: 'Share a bit about yourself or this person.'
    },
    {
      name: 'birthday',
      label: 'Birthday',
      type: 'datepicker'
    },
    {
      name: 'diagnosisDate',
      label: 'Diagnosis date',
      type: 'datepicker'
    }
  ],

  getInitialState: function() {
    return {
      working: false,
      formValues: {
        isOtherPerson: false,
        fullName: this.getUserFullName()
      },
      validationErrors: {},
      notification: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      formValues: _.assign(this.state.formValues, {
        fullName: this.getUserFullName(nextProps)
      })
    });
  },

  getUserFullName: function(props) {
    props = props || this.props;
    return personUtils.fullName(props.user) || '';
  },

  render: function() {
    var subnav = this.renderSubnav();
    var form = this.renderForm();

    return (
      <div className="PatientNew">
        {subnav}
        <div className="container-box-outer PatientNew-contentOuter">
          <div className="container-box-inner PatientNew-contentInner">
            <div className="PatientNew-content">
              {form}
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderSubnav: function() {
    return (
      <div className="container-box-outer">
        <div className="container-box-inner PatientNew-subnavInner">
          <div className="grid PatientNew-subnav">
            <div className="grid-item one-whole">
              <div className="PatientNew-subnavTitle">
                {'Set up data storage'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderForm: function() {
    return (
        <form className="PatientNew-form">
          <div className="PatientNew-formInputs">
            {this.renderInputs()}
          </div>
          <div className="PatientNew-formActions">
            {this.renderButtons()}
            {this.renderNotification()}
          </div>
        </form>
    );
  },

  renderInputs: function() {
    return _.map(this.formInputs, this.renderInput);
  },

  renderInput: function(input) {
    var name = input.name;
    var value = this.state.formValues[name];

    if (name === 'isOtherPerson') {
      value = this.state.formValues.isOtherPerson ? 'yes' : 'no';
    }

    if (input.type === 'datepicker') {
      return this.renderDatePicker(input);
    }

    return (
      <div key={name} className={'PatientNew-inputGroup PatientNew-inputGroup--' + name}>
        <InputGroup
          name={name}
          label={input.label}
          value={value}
          items={input.items}
          error={this.state.validationErrors[name]}
          type={input.type}
          placeholder={input.placeholder}
          disabled={this.isFormDisabled() || input.disabled}
          onChange={this.handleInputChange}/>
      </div>
    );
  },

  renderDatePicker: function(input) {
    var name = input.name;
    var classes = 'PatientNew-datePicker PatientNew-inputGroup PatientNew-inputGroup--' + name;
    var error = this.state.validationErrors[name];
    var message;
    if (error) {
      classes = classes + ' PatientNew-datePicker--error';
      message = <div className="PatientNew-datePickerMessage">{error}</div>;
    }

    return (
      <div key={name} className={classes}>
        <div>
          <label className="PatientNew-datePickerLabel">{input.label}</label>
          <DatePicker
            name={name}
            value={this.state.formValues[name]}
            disabled={this.isFormDisabled() || input.disabled}
            onChange={this.handleInputChange} />
        </div>
        {message}
      </div>
    );
  },

  renderButtons: function() {
    return (
      <div>
        <Link to="/patients" className="btn btn-secondary PatientNew-cancel">Cancel</Link>
        <button
          className="btn btn-primary PatientNew-submit"
          onClick={this.handleSubmit}
          disabled={this.isFormDisabled()}>
          {this.getSubmitButtonText()}
        </button>
      </div>
    );
  },

  renderNotification: function() {
    var notification = this.props.notification;
    if (notification && notification.message) {
      var type = notification.type || 'alert';
      return (
        <div className={'PatientNew-notification PatientNew-notification--' + type}>
          {notification.message}
        </div>
      );
    }
    return null;
  },

  getSubmitButtonText: function() {
    if (this.props.working) {
      return 'Setting up...';
    }
    return 'Set up';
  },

  isFormDisabled: function() {
    return (this.props.fetchingUser && !this.props.user);
  },

  handleInputChange: function(attributes) {
    var key = attributes.name;
    var value = attributes.value;
    if (!key) {
      return;
    }

    var formValues = _.clone(this.state.formValues);
    if (key === 'isOtherPerson') {
      var isOtherPerson = (attributes.value === 'yes') ? true : false;
      var fullName = isOtherPerson ? '' : this.getUserFullName();
      formValues = _.assign(formValues, {
        isOtherPerson: isOtherPerson,
        fullName: fullName
      });
    }
    else {
      formValues[key] = value;
    }

    this.setState({formValues: formValues});
  },

  handleSubmit: function(e) {
    if (e) {
      e.preventDefault();
    }

    var formValues = this.state.formValues;

    this.resetFormStateBeforeSubmit(formValues);

    formValues = this.prepareFormValuesForValidation(formValues);

    var validationErrors = personUtils.validateFormValues(formValues, true, MODEL_DATE_FORMAT);
    if (!_.isEmpty(validationErrors)) {
      this.setState({
        working: false,
        validationErrors: validationErrors
      });
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);

    this.props.submit(formValues);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.setState({
      working: true,
      formValues: formValues,
      validationErrors: {}
    });
  },

  prepareFormValuesForValidation: function(formValues) {
    formValues = _.clone(formValues);
    var formBDay = formValues.birthday;
    var formDDay = formValues.diagnosisDate;

    if (this.isDateObjectComplete(formBDay)) {
      formValues.birthday = this.makeRawDateString(formBDay);
    }
    else {
      formValues.birthday = null;
    }

    if (this.isDateObjectComplete(formDDay)) {
      formValues.diagnosisDate = this.makeRawDateString(formDDay);
    }
    else {
      formValues.diagnosisDate = null;
    }

    if (!formValues.about) {
      formValues = _.omit(formValues, 'about');
    }

    return formValues;
  },

  // because JavaScript Date will coerce impossible dates into possible ones with
  // no opportunity for exposing the error to the user
  // i.e., mis-typing 02/31/2014 instead of 03/31/2014 will be saved as 03/03/2014!
  makeRawDateString: function(dateObj){

    var mm = ''+(parseInt(dateObj.month) + 1); //as a string, add 1 because 0-indexed
    mm = (mm.length === 1) ? '0'+ mm : mm;
    var dd = (dateObj.day.length === 1) ? '0'+dateObj.day : dateObj.day;

    return dateObj.year+'-'+mm+'-'+dd;
  },

  isDateObjectComplete: function(dateObj) {
    if (!dateObj) {
      return false;
    }
    return !(_.isEmpty(dateObj.year) && dateObj.year.length === 4 || _.isEmpty(dateObj.month) || _.isEmpty(dateObj.day));
  },

  prepareFormValuesForSubmit: function(formValues) {
    var profile = {};
    var patient = {
      birthday: formValues.birthday,
      diagnosisDate: formValues.diagnosisDate
    };

    if (formValues.about) {
      patient.about = formValues.about;
    }

    if (formValues.isOtherPerson) {
      profile.fullName = this.getUserFullName();
      patient.isOtherPerson = true;
      patient.fullName = formValues.fullName;
    }
    else {
      profile.fullName = formValues.fullName;
    }

    profile.patient = patient;

    return {
      profile: profile
    };
  }
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let mapStateToProps = state => ({
  user: state.loggedInUser,
  fetchingUser: state.working.fetchingUser,
  working: state.working.creatingPatient.inProgress,
  notification: state.working.creatingPatient.notification
});

let mapDispatchToProps = dispatch => bindActionCreators({
  createPatient: actions.async.createPatient
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return _.merge({}, ownProps, stateProps, dispatchProps, {
    uploadUrl: api.getUploadUrl(),
    onAcceptInvitation: dispatchProps.acceptInvitation.bind(null, api),
    onDismissInvitation: dispatchProps.dismissInvitation.bind(null, api),
    onRemoveMember: dispatchProps.removeMember.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PatientNew);
