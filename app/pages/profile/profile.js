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
var personUtils = require('../../core/personutils');
var SimpleForm = require('../../components/simpleform');
var PeopleList = require('../../components/peoplelist');
var PersonCard = require('../../components/personcard');

var Profile = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },

  formInputs: [
    {name: 'fullName', label: 'Full name'},
    {name: 'username', label: 'Email', type: 'email'},
    {name: 'password', label: 'Password', type: 'password', placeholder: '******'},
    {name: 'passwordConfirm', label: 'Confirm password', type: 'password', placeholder: '******'}
  ],

  MESSAGE_TIMEOUT: 2000,

  getInitialState: function() {
    return {
      formValues: this.formValuesFromUser(this.props.user),
      validationErrors: {},
      notification: null
    };
  },

  formValuesFromUser: function(user) {
    if (!user) {
      return {};
    }

    return {
      fullName: user.profile && user.profile.fullName,
      username: user.username
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // Keep form values in sync with upstream changes
    this.setState({formValues: this.formValuesFromUser(nextProps.user)});
  },

  componentWillUnmount: function() {
    clearTimeout(this.messageTimeoutId);
  },

  render: function() {
    var form = this.renderForm();
    var self = this;
    var handleClickBack = function() {
      self.props.trackMetric('Clicked Back To Care Team List');
    };

    /* jshint ignore:start */
    return (
      <div className="profile">
        <div className="container-box-outer profile-subnav">
          <div className="container-box-inner profile-subnav-box">
            <div className="grid">
              <div className="grid-item one-whole medium-one-third">
                <a className="js-back" href="#/" onClick={handleClickBack}>
                  <i className="icon-back"></i>
                  {' ' + 'Back'}
                </a>
              </div>
              <div className="grid-item one-whole medium-one-third">
                <div className="profile-subnav-title">Account</div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-box-outer profile-content">
          <div className="container-box-inner profile-content-box">
            <div className="profile-form">{form}</div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderForm: function() {
    var disabled = this.isResettingUserData();

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

  renderCreateCareTeam: function() {
    /* jshint ignore:start */
    return (
      <div>
        <div className="profile-careteam-message">
          {'Creating a Care Team allows you to get data into Blip,'}
          {' for yourself or for someone you care for with type 1 diabetes.'}
        </div>
        <PersonCard
          href="#/patients/new">
          <i className="icon-add profile-careteam-icon-link"></i>
          {' ' + 'Create a Care Team'}
        </PersonCard>
      </div>
    );
    /* jshint ignore:end */
  },

  renderUserCareTeam: function() {
    var patient = _.cloneDeep(this.props.user);
    if (patient.userid) {
      patient.link = '#/patients/' + patient.userid + '/edit';
    }

    /* jshint ignore:start */
    return (
      <PeopleList
        people={[patient]}
        isPatientList={true}/>
    );
    /* jshint ignore:end */
  },

  isResettingUserData: function() {
    return (this.props.fetchingUser && !this.props.user);
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
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
    clearTimeout(this.messageTimeoutId);
  },

  prepareFormValuesForValidation: function(formValues) {
    formValues = _.clone(formValues);

    // If not changing password, omit password attributes
    if (!formValues.password && !formValues.passwordConfirm) {
      return _.omit(formValues, ['password', 'passwordConfirm']);
    }

    return formValues;
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

    if (formValues.password || formValues.passwordConfirm) {
      if (!formValues.password) {
        validationErrors.password = IS_REQUIRED;
      }
      else if (!formValues.passwordConfirm) {
        validationErrors.passwordConfirm = IS_REQUIRED;
      }
      else if (formValues.passwordConfirm !== formValues.password) {
        validationErrors.passwordConfirm = 'Passwords don\'t match.';
      }
    }

    if (formValues.password && formValues.password.length < config.PASSWORD_MIN_LENGTH) {
      validationErrors.password = SHORT_PASSWORD;
    }

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

  prepareFormValuesForSubmit: function(formValues) {
    var result = {
      username: formValues.username,
      emails: [formValues.username],
      profile: {
        fullName: formValues.fullName
      }
    };

    if (formValues.password) {
      result.password = formValues.password;
    }

    return result;
  },

  submitFormValues: function(formValues) {
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
  }
});

module.exports = Profile;
