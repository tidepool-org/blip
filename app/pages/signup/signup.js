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
var WaitList = require('../../components/waitlist');
var LoginNav = require('../../components/loginnav');
var LoginLogo = require('../../components/loginlogo');
var SimpleForm = require('../../components/simpleform');

var Signup = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func.isRequired,
    checkInviteKey: React.PropTypes.func.isRequired,
    inviteKey: React.PropTypes.string,
    inviteEmail: React.PropTypes.string,
    trackMetric: React.PropTypes.func.isRequired
  },

  formInputs: function() {
    return [
      {name: 'fullName', label: 'Full name', placeholder: 'ex: Mary Smith'},
      {
        name: 'username',
        label: 'Email',
        type: 'email',
        placeholder: '',
        disabled: !!this.props.inviteEmail
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '******'
      },
      {
        name: 'passwordConfirm',
        label: 'Confirm password',
        type: 'password',
        placeholder: '******'
      }
    ];
  },

  componentWillMount: function() {
    var that = this;
    if ((this.props.inviteKey || this.props.inviteKey === '' ) && this.props.checkInviteKey) {
      this.props.checkInviteKey(this.props.inviteKey , function(valid) {
        that.setState({loading: false, showWaitList: !valid });
      });
    } else {
      that.setState({loading: false, showWaitList: true });
    }
  },

  getInitialState: function() {
    var formValues = {};

    if (this.props.inviteEmail) {
      formValues.username = this.props.inviteEmail;
    }

    return {
      working: false,
      loading: true,
      showWaitList: false,
      formValues: formValues,
      validationErrors: {},
      notification: null
    };
  },

  render: function() {
    var form = this.renderForm();
    var inviteIntro = this.renderInviteIntroduction();
    if (!this.state.loading) {
      if (this.state.showWaitList) {
        return (
          <div className="waitlist">
            <WaitList />
          </div>
        );
      } else {
        return (
          <div className="signup">
            <LoginNav
              page="signup"
              hideLinks={Boolean(this.props.inviteEmail)}
              trackMetric={this.props.trackMetric} />
            <LoginLogo />
            {inviteIntro}
            <div className="container-small-outer signup-form">
              <div className="container-small-inner signup-form-box">
                {form}
              </div>
            </div>
          </div>
        );
      }
    }
  },

  renderInviteIntroduction: function() {
    if (!this.props.inviteEmail) {
      return null;
    }

    return (
      <div className='signup-inviteIntro'>
        <p>{'You\'ve been invited to Blip.'}</p><p>{'Sign up to view the invitation.'}</p>
      </div>
    );
  },

  renderForm: function() {
    var submitButtonText = 'Sign up';
    if (this.state.working) {
      submitButtonText = 'Signing up...';
    }

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

    formValues = _.clone(formValues);

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

    if (!formValues.fullName) {
      validationErrors.fullName = IS_REQUIRED;
    }

    if (!formValues.username) {
      validationErrors.username = IS_REQUIRED;
    }

    if (formValues.username && !utils.validateEmail(formValues.username)) {
      validationErrors.username = INVALID_EMAIL;
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
    return {
      username: formValues.username,
      emails: [formValues.username],
      password: formValues.password,
      profile: {
        fullName: formValues.fullName
      }
    };
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
