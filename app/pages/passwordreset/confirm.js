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

var config = require('../../config');

var utils = require('../../core/utils');
var LoginNav = require('../../components/loginnav');
var LoginLogo = require('../../components/loginlogo');
var SimpleForm = require('../../components/simpleform');

var ConfirmPasswordReset = React.createClass({
  propTypes: {
    resetKey: React.PropTypes.string.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },

  formInputs: function() {
    return [
      {name: 'email', label: 'Email', type: 'email'},
      {
        name: 'password',
        label: 'New password',
        type: 'password',
        placeholder: '******'
      },
      {
        name: 'passwordConfirm',
        label: 'Confirm new password',
        type: 'password',
        placeholder: '******'
      }
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
    if (this.state.success) {
      content = (
        <div className="PasswordReset-intro">
          <div className="PasswordReset-title">{'Success!'}</div>
          <div className="PasswordReset-instructions">
            <p>{'Your password was changed successfully. You can now log in with your new password.'}</p>
          </div>
          <div className="PasswordReset-button">
            <a className="btn btn-primary" href="#/login">Log in</a>
          </div>
        </div>
      );
    }
    else {
      content = (
        <div>
          <div className="PasswordReset-intro">
            <div className="PasswordReset-title">{'Change your password'}</div>
          </div>
          <div className="PasswordReset-form">{this.renderForm()}</div>
          <div className="PasswordReset-link">
            <a href="#/login">Cancel</a>
          </div>
        </div>
      );
    }

    return (
      <div className="PasswordReset">
        <LoginNav
          hideLinks={true}
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
    var submitButtonText = this.state.working ? 'Saving...' : 'Save';

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

    formValues = this.prepareFormValuesForSubmit(formValues);

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
    var SHORT_PASSWORD = 'Password must be at least ' + config.PASSWORD_MIN_LENGTH + ' characters long.';

    if (!formValues.email) {
      validationErrors.email = IS_REQUIRED;
    }

    if (formValues.email && !utils.validateEmail(formValues.email)) {
      validationErrors.email = INVALID_EMAIL;
    }

    if (!formValues.password) {
      validationErrors.password = IS_REQUIRED;
    }

    if (formValues.password && formValues.password.length < config.PASSWORD_MIN_LENGTH) {
      validationErrors.password = SHORT_PASSWORD;
    }

    if (formValues.password) {
      if (!formValues.passwordConfirm) {
        validationErrors.passwordConfirm = IS_REQUIRED;
      }
      else if (formValues.passwordConfirm !== formValues.password) {
        validationErrors.passwordConfirm = 'Passwords don\'t match.';
      }
    }

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        working: false,
        validationErrors: validationErrors
      });
    }

    return validationErrors;
  },

  prepareFormValuesForSubmit: function(formValues) {
    return {
      key: this.props.resetKey,
      email: formValues.email,
      password: formValues.password
    };
  },

  submitFormValues: function(formValues) {
    var self = this;
    var submit = this.props.onSubmit;

    submit(formValues, function(err) {
      if (err) {
        return self.setState({
          working: false,
          notification: {
            type: 'error',
            message: 'We couldn\'t change your password. You may have mistyped your email, or the reset link may have expired.'
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

module.exports = ConfirmPasswordReset;
