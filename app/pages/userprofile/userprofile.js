
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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import _ from 'lodash';
import { validateForm } from '../../core/validation';

import config from '../../config';

import utils from '../../core/utils';
import personUtils from '../../core/personutils';
import SimpleForm from '../../components/simpleform';
import PeopleList from '../../components/peoplelist';

export var UserProfile = React.createClass({
  propTypes: {
    fetchingUser: React.PropTypes.bool.isRequired,
    history: React.PropTypes.object.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    user: React.PropTypes.object
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

  componentDidMount: function() {
    if (this.props.trackMetric) {
      this.props.trackMetric('Viewed Account Edit');
    }
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
    var handleClickBack = function(e) {
      e.preventDefault();
      self.props.trackMetric('Clicked Back in Account');
      self.props.history.goBack();
      return false;
    };

    
    return (
      <div className="profile">
        <div className="container-box-outer profile-subnav">
          <div className="container-box-inner profile-subnav-box">
            <div className="grid">
              <div className="grid-item one-whole medium-one-third">
                <a className="js-back" href="" onClick={handleClickBack}>
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
    
  },

  renderForm: function() {
    var disabled = this.isResettingUserData();

    
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
    
  },

  isResettingUserData: function() {
    return (this.props.fetchingUser && !this.props.user);
  },

  handleSubmit: function(formValues) {
    var self = this;

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
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
    clearTimeout(this.messageTimeoutId);
  },


  validateFormValues: function(formValues) {
    var form = [
      { type: 'name', name: 'fullName', label: 'full name', value: formValues.fullName },
      { type: 'email', name: 'username', label: 'email', value: formValues.username }
    ];

    if (formValues.password || formValues.passwordConfirm) {
      form = _.merge(form, [
        { type: 'password', name: 'password', label: 'password', value: formValues.password },
        { type: 'confirmPassword', name: 'passwordConfirm', label: 'confirm password', value: formValues.passwordConfirm, prerequisites: { password: formValues.password }  }
      ]);
    }


    var validationErrors = validateForm(form);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors
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


/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function mapStateToProps(state) {
  let user = null;
  let { allUsersMap, loggedInUserId } = state.blip;

  if (allUsersMap) {
    if (loggedInUserId) {
      user = allUsersMap[loggedInUserId];
    }
  }

  return {
    user: user,
    fetchingUser: state.blip.working.fetchingUser.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  updateUser: actions.async.updateUser
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, _.pick(ownProps, 'history'), stateProps, {
    onSubmit: dispatchProps.updateUser.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric
  });
};
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(UserProfile);
