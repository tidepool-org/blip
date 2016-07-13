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
import config from '../../config';
import { validateForm } from '../../core/validation';

import utils from '../../core/utils';
import WaitList from '../../components/waitlist';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';

export let Signup = React.createClass({
  propTypes: {
    acknowledgeNotification: React.PropTypes.func.isRequired,
    api: React.PropTypes.object.isRequired,
    configuredInviteKey: React.PropTypes.string.isRequired,
    inviteEmail: React.PropTypes.string,
    inviteKey: React.PropTypes.string,
    notification: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    working: React.PropTypes.bool.isRequired
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

  isWaitListed: function() {

    var hasInviteKey = !_.isEmpty(this.props.inviteKey) || this.props.inviteKey === '';
    var hasInviteEmail = !_.isEmpty(this.props.inviteEmail);

    if (hasInviteKey && hasInviteEmail) {
      // don't show waitlist if invited user to create account and join careteam
      return false;
    }
    else if (hasInviteKey) {
      // do we have a valid waitlist key?
      if (_.isEmpty(this.props.configuredInviteKey) ||
        this.props.inviteKey === this.props.configuredInviteKey) {
        return false;
      }
      else {
        return true;
      }
    }
    return true;
  },

  componentWillMount: function() {
    this.setState({loading: false, showWaitList: this.isWaitListed() });
  },

  getInitialState: function() {
    var formValues = {};

    if (this.props.inviteEmail) {
      formValues.username = this.props.inviteEmail;
    }

    return {
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
    if (this.props.working) {
      submitButtonText = 'Signing up...';
    }

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.props.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification || this.props.notification}/>
    );

  },

  handleSubmit: function(formValues) {
    var self = this;

    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    formValues = _.clone(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);

    this.props.onSubmit(this.props.api, formValues);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.props.acknowledgeNotification('signingUp');
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  },

  validateFormValues: function(formValues) {
    var form = [
      { type: 'name', name: 'fullName', label: 'full name', value: formValues.fullName },
      { type: 'email', name: 'username', label: 'email address', value: formValues.username },
      { type: 'password', name: 'password', label: 'password', value: formValues.password },
      { type: 'confirmPassword', name: 'passwordConfirm', label: 'confirm password', value: formValues.passwordConfirm, prerequisites: { password: formValues.password }  }
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
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.signingUp.notification,
    working: state.blip.working.signingUp.inProgress,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.signup,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, {
    configuredInviteKey: config.INVITE_KEY,
    inviteKey: utils.getInviteKey(ownProps.location),
    inviteEmail: utils.getInviteEmail(ownProps.location),
    trackMetric: ownProps.routes[0].trackMetric,
    api: ownProps.routes[0].api,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Signup);