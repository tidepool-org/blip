
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
import { translate } from 'react-i18next';

import * as actions from '../../redux/actions';

import { Link } from 'react-router';
import _ from 'lodash';

import utils from '../../core/utils';
import { validateForm } from '../../core/validation';

import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';

export let Login = translate()(React.createClass({
  propTypes: {
    acknowledgeNotification: React.PropTypes.func.isRequired,
    confirmSignup: React.PropTypes.func.isRequired,
    fetchers: React.PropTypes.array.isRequired,
    isInvite: React.PropTypes.bool.isRequired,
    notification: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    seedEmail: React.PropTypes.string,
    trackMetric: React.PropTypes.func.isRequired,
    working: React.PropTypes.bool.isRequired
  },

  formInputs: function() {
    const { t } = this.props;

    return [
      { name: 'username', placeholder: t('Email'), type: 'email', disabled: !!this.props.seedEmail },
      { name: 'password', placeholder: t('Password'), type: 'password' },
      { name: 'remember', label: t('Remember me'), type: 'checkbox' }
    ];
  },

  getInitialState: function() {
    var formValues = {};
    var email = this.props.seedEmail;

    if (email) {
      formValues.username = email;
    }

    return {
      formValues: formValues,
      validationErrors: {},
      notification: null
    };
  },

  render: function() {
    var form = this.renderForm();
    var inviteIntro = this.renderInviteIntroduction();

    return (
      <div className="login">
        <LoginNav
          page="login"
          hideLinks={Boolean(this.props.seedEmail)}
          trackMetric={this.props.trackMetric} />
        <LoginLogo />
        {inviteIntro}
        <div className="container-small-outer login-form">
          <div className="container-small-inner login-form-box">
            <div className="login-simpleform">{form}</div>
          </div>
        </div>
      </div>
    );
  },

  renderInviteIntroduction: function() {
    const { t } = this.props;
    if (!this.props.isInvite) {
      return null;
    }

    return (
      <div className='login-inviteIntro'>
        <p>{t('You\'ve been invited to Tidepool.')}</p><p>{t('Log in to view the invitation.')}</p>
      </div>
    );
  },

  renderForm: function() {
    const { t } = this.props;

    var submitButtonText = this.props.working ? t('Logging in...') : t('Login');
    var forgotPassword = this.renderForgotPassword();

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.props.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification || this.props.notification}>
        {<div className="login-forgotpassword">{forgotPassword}</div>}
      </SimpleForm>
    );
  },

  logPasswordReset : function() {
    this.props.trackMetric('Clicked Forgot Password');
  },

  renderForgotPassword: function() {
    const { t } = this.props;
    return <Link to="/request-password-reset">{t('Forgot your password?')}</Link>;
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

    const { user, options } = this.prepareFormValuesForSubmit(formValues);

    this.props.onSubmit(user, options);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.props.acknowledgeNotification('loggingIn');
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  },

  validateFormValues: function(formValues) {
    const { t } = this.props;
    var form = [
      { type: 'name', name: 'password', label: t('this field'), value: formValues.password },
      { type: 'email', name: 'username', label: t('this field'), value: formValues.username },
    ];

    var validationErrors = validateForm(form);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
        notification: {
          type: 'error',
          message: t('Some entries are invalid.')
        }
      });
    }

    return validationErrors;
  },

  prepareFormValuesForSubmit: function(formValues) {
    return {
      user: {
        username: formValues.username,
        password: formValues.password
      },
      options: {
        remember: formValues.remember
      }
    };
  },

  doFetching: function(nextProps) {
    if (!nextProps.fetchers) {
      return;
    }
    nextProps.fetchers.forEach(fetcher => {
      fetcher();
    });
  },

  /**
   * Before rendering for first time
   * begin fetching any required data
   */
  componentWillMount: function() {
    this.doFetching(this.props);
  }
}));

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let getFetchers = (dispatchProps, ownProps, other, api) => {
  if (other.signupKey) {
    return [
      dispatchProps.confirmSignup.bind(null, api, other.signupKey, other.signupEmail)
    ];
  }

  return [];
}

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.loggingIn.notification || state.blip.working.confirmingSignup.notification,
    working: state.blip.working.loggingIn.inProgress,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.login,
  acknowledgeNotification: actions.sync.acknowledgeNotification,
  confirmSignup: actions.async.confirmSignup
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  let seedEmail = utils.getInviteEmail(ownProps.location) || utils.getSignupEmail(ownProps.location);
  let signupKey = utils.getSignupKey(ownProps.location);
  let isInvite = !_.isEmpty(utils.getInviteEmail(ownProps.location));
  let api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, dispatchProps, {
    fetchers: getFetchers(dispatchProps, ownProps, { signupKey, signupEmail: seedEmail }, api),
    isInvite: isInvite,
    seedEmail: seedEmail,
    trackMetric: ownProps.routes[0].trackMetric,
    onSubmit: dispatchProps.onSubmit.bind(null, api)
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Login);
