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
var config = window.config;

var LoginNav = require('../../components/loginnav');
var LoginLogo = require('../../components/loginlogo');
var SimpleForm = require('../../components/simpleform');

var Signup = React.createClass({
  propTypes: {
    onValidate: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func.isRequired
  },

  formInputs: [
    {name: 'firstName', label: 'First name'},
    {name: 'lastName', label: 'Last name'},
    {name: 'username', label: 'Email', type: 'email'},
    {name: 'password', label: 'Password', type: 'password'}
  ],

  getInitialState: function() {
    return {
      working: false,
      formValues: {},
      validationErrors: {},
      notification: null
    };
  },

  render: function() {
    var form = this.renderForm();

    /* jshint ignore:start */
    return (
      <div className="signup">
        <LoginNav
          page="signup"
          imagesEndpoint={config.IMAGES_ENDPOINT + '/loginnav'} />
        <LoginLogo imagesEndpoint={config.IMAGES_ENDPOINT + '/loginlogo'} />
        <div className="container-small-outer signup-form">
          <div className="container-small-inner signup-form-box">
            {form}
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderForm: function() {
    var submitButtonText = 'Create account';
    if (this.state.working) {
      submitButtonText = 'Creating account...';
    }

    /* jshint ignore:start */
    return (
      <SimpleForm
        inputs={this.formInputs}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.state.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification}/>
    );
    /* jshint ignore:end */
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

  submitFormValues: function(formValues) {
    var self = this;
    var submit = this.props.onSubmit;

    submit(formValues, function(err, result) {
      if (err) {
        var message = 'An error occured while signing up.';
        if (err.status === 400) {
          message = 'An account already exists for that email.';
        }

        self.setState({
          working: false,
          notification: {
            type: 'error',
            message: message
          }
        });
        return;
      }
      self.props.onSubmitSuccess(result);
    });
  }
});

module.exports = Signup;