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

import * as actions from '../../redux/actions';

import _ from 'lodash';
import config from '../../config';

import utils from '../../core/utils';
import WaitList from '../../components/waitlist';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';
import { validateForm } from '../../core/validation';

var MODEL_DATE_FORMAT = 'YYYY-MM-DD';

var formText = 'Welcome to Blip!';
var formText2 = 'Please confirm your birthday and create a password to see your data.';

export let VerificationWithPassword = React.createClass({
  propTypes: {
    acknowledgeNotification: React.PropTypes.func.isRequired,
    api: React.PropTypes.object.isRequired,
    notification: React.PropTypes.object,
    signupEmail: React.PropTypes.string.isRequired,
    signupKey: React.PropTypes.string.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    working: React.PropTypes.bool.isRequired
  },

  formInputs:  [
    { type: 'explanation', text: formText }, { type: 'explanation', text: formText2 },
    { name: 'birthday', label: 'What is your birthday?', type: 'datepicker' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '******' },
    { name: 'passwordConfirm', label: 'Confirm password', type: 'password', placeholder: '******' }
  ],

  componentWillMount: function() {
    this.setState({ loading: false });
  },

  getInitialState: function() {
    var formValues = {};

    return {
      loading: true,
      formValues: formValues,
      validationErrors: {},
      notification: null
    };
  },

  isFormDisabled: function() {
    return (this.props.fetchingUser && !this.props.user);
  },

  getSubmitButtonText: function() {
    if (this.props.working) {
      return 'Setting up...';
    }
    return 'Ready!';
  },

  render: function() {
    return (
      <div className="VerificationWithPassword">
        <LoginNav
          page="VerificationWithPassword"
          trackMetric={this.props.trackMetric} />
        <LoginLogo />
        <div className="container-small-outer VerificationWithPassword-form">
          <div className="container-small-inner VerificationWithPassword-form-box">
            <SimpleForm
              inputs={this.formInputs}
              formValues={this.state.formValues}
              validationErrors={this.state.validationErrors}
              submitButtonText={this.getSubmitButtonText()}
              submitDisabled={this.props.working}
              onSubmit={this.handleSubmit}
              notification={this.state.notification || this.props.notification} />
          </div>
        </div>
      </div>
    );
  },

  handleSubmit: function(formValues) {
    var self = this;

    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);

    if (!_.isEmpty(validationErrors)) {
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);
    this.props.onSubmit(this.props.api, this.props.signupKey, this.props.signupEmail, formValues.birthday, formValues.password);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  },

  validateFormValues: function(formValues) {
    var form = [
      { type: 'date', name: 'birthday', label: 'birthday', value: formValues.birthday },
      { type: 'password', name: 'password', label: 'password', value: formValues.password},
      { type: 'confirmPassword', name: 'passwordConfirm', label: 'confirm password', value: formValues.passwordConfirm, prerequisites: { password: formValues.password } }
    ];
    var validationErrors = validateForm(form);

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


  handleInputChange: function(attributes) {
    var key = attributes.name;
    var value = attributes.value;
    if (!key) {
      return;
    }

    var formValues = _.clone(this.state.formValues);
    formValues[key] = value;
    this.setState({formValues: formValues});
  },

  makeRawDateString: function(dateObj){

    var mm = ''+(parseInt(dateObj.month) + 1); //as a string, add 1 because 0-indexed
    mm = (mm.length === 1) ? '0'+ mm : mm;
    var dd = (dateObj.day.length === 1) ? '0'+dateObj.day : dateObj.day;

    return dateObj.year+'-'+mm+'-'+dd;
  },


  prepareFormValuesForSubmit: function(formValues) {
    return {
      birthday: this.makeRawDateString(formValues.birthday),
      password: formValues.password
    };
  },
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.verifyingCustodial.notification,
    working: state.blip.working.verifyingCustodial.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.verifyCustodial,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, {
    configuredInviteKey: config.INVITE_KEY,
    signupEmail: utils.getSignupEmail(ownProps.location),
    signupKey: utils.getSignupKey(ownProps.location),
    trackMetric: ownProps.routes[0].trackMetric,
    api: ownProps.routes[0].api,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(VerificationWithPassword);
