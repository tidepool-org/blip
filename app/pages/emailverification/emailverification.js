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

var LoginNav = require('../../components/loginnav');
var LoginLogo = require('../../components/loginlogo');
var SimpleForm = require('../../components/simpleform');

var utils = require('../../core/utils');

var EmailVerification = React.createClass({
  propTypes: {
    sent: React.PropTypes.bool,
    onSubmitResend: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },
  formInputs: function() {
    return [
      {name: 'email', label: 'Email used to signup', type: 'email'}
    ];
  },
  getInitialState: function() {
    return {
      working: false,
      success: false,
      formValues: {},
      validationErrors: {},
      notification: null
    };
  },
  render: function() {
    var content;
    var loginPage;
    if (this.props.sent) {
      loginPage = 'login';
      content = (
        <div className="EmailVerification-intro">
          <div className="EmailVerification-title">{'Keeping your data private and secure is important to us!'}</div>
          <div className="EmailVerification-instructions">
            <p>{'We just sent you an email. To verify we have the right email address, please click the link in the email to activate your account.'}</p>
          </div>
        </div>
      );
    }
    else {
      loginPage = 'signup';
      content = (
        <div>
          <div className="EmailVerification-intro">
            <div className="EmailVerification-title">{'Hey, you\'re not verified yet.'}</div>
              <div className="EmailVerification-instructions">
                <p>{'Check your email and follow the link there. (We need to confirm that you are really you.)'}</p>
              </div>
          </div>
          <div className="EmailVerification-form">{this.renderForm()}</div>
        </div>
      );
    }

    return (
      <div className="EmailVerification">
        <LoginNav
          page={loginPage}
          hideLinks={false}
          trackMetric={this.props.trackMetric} />
        <LoginLogo />
        <div className="container-small-outer login-form">
          <div className="container-small-inner login-form-box">
            {content}
          </div>
        </div>
      </div>
    );
  },
  renderForm: function() {
    var submitButtonText = this.state.working ? 'Sending email...' : 'Resend';

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.state.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification}/>
    );
  },
  handleSubmit: function(formValues) {
    var self = this;

    if (this.state.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    this.submitFormValues(formValues);
  },
  resetFormStateBeforeSubmit: function(formValues) {
    this.setState({
      working: true,
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  },
  validateFormValues: function(formValues) {
    var validationErrors = {};
    var IS_REQUIRED = 'This field is required.';
    var INVALID_EMAIL = 'Invalid email address.';

    if (!formValues.email) {
      validationErrors.email = IS_REQUIRED;
    }

    if (formValues.email && !utils.validateEmail(formValues.email)) {
      validationErrors.email = INVALID_EMAIL;
    }

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        working: false,
        validationErrors: validationErrors
      });
    }

    return validationErrors;
  },
  submitFormValues: function(formValues) {
    var self = this;
    var submit = this.props.onSubmitResend;

    submit(formValues.email, function(err) {
      if (err) {
        return self.setState({
          working: false,
          notification: {
            type: 'error',
            message: 'An error occured while trying to resend your verification email.'
          }
        });
      }

      self.setState({
        working: false,
        success: true
      });
    });
  }
});

module.exports = EmailVerification;
